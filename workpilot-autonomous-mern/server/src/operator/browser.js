import {chromium} from 'playwright';
const base=()=>`http://127.0.0.1:${process.env.PORT||4000}/sandbox`;
export async function withBrowser(fn){const browser=await chromium.launch({headless:true});try{const page=await browser.newPage({acceptDownloads:false});return await fn(page);}finally{await browser.close();}}
export async function observe(page){await page.goto(base(),{waitUntil:'domcontentloaded'});return await page.locator('#tickets tbody tr').evaluateAll(rows=>rows.map(r=>({id:r.dataset.ticket,subject:r.cells[1].textContent,priority:r.cells[2].textContent,status:r.cells[3].textContent,assignee:r.cells[4].textContent,followup:r.cells[5].textContent,draft:r.cells[6].textContent})));}
export async function perform(page,action,args){if(action==='read_policy'){await page.goto(base()+'/policy');return {policy:await page.locator('body').innerText()};}
 if(action==='inspect_board')return {tickets:await observe(page)};
 const id=args.ticketId;if(!/^INC-\d+$/.test(id||''))throw Error('Invalid ticket identifier');
 if(action==='verify_ticket'){const rows=await observe(page);const ticket=rows.find(t=>t.id===id);if(!ticket||!ticket.assignee||ticket.followup!=='created'||ticket.draft!=='prepared')throw Error(`Verification failed for ${id}`);return {ticket,verified:true,url:base()};}
 const paths={assign_ticket:'assign',create_followup:'followup',prepare_reply:'draft'};
 if(!paths[action])throw Error('Tool not allowed');
 await page.goto(base(),{waitUntil:'domcontentloaded'});
 const forms={assign_ticket:['#ticket-id','#assign-form'],create_followup:['#followup-ticket','#followup-form'],prepare_reply:['#draft-ticket','#draft-form']};
 const [input,form]=forms[action];await page.locator(input).fill(id);
 if(action==='assign_ticket')await page.locator('#assignee').fill(args.assignee);
 await page.locator(form+' button').click();
 await page.waitForLoadState('domcontentloaded');
 const error=await page.locator('#result').textContent().catch(()=>'');
 if(error?.startsWith('HTTP '))throw Error(`Portal returned ${error} for ${action}`);
 const rows=await observe(page);const ticket=rows.find(t=>t.id===id);
 const expected={assign_ticket:ticket?.assignee===args.assignee,create_followup:ticket?.followup==='created',prepare_reply:ticket?.draft==='prepared'};
 if(!expected[action])throw Error(`Browser did not observe ${action} result for ${id}`);
 return {status:200,ticketId:id,action,observed:ticket};
}
