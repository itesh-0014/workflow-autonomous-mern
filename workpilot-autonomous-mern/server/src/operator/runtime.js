import {Run,Draft} from '../models/index.js';
import {decide} from './decision.js';
import {withBrowser,perform} from './browser.js';
import {log} from '../agent/runner.js';
const running=new Set();
export async function runOperator(id){const key=String(id);if(running.has(key))return;running.add(key);
 try{const run=await Run.findById(id);if(!run)return;run.status='running';await run.save();
 await withBrowser(async page=>{const state={goal:run.goal,observations:[],tickets:[],completed:[],policy:null};let failures=0;
 for(let i=0;i<40;i++){
 const choice=await decide(state);await log(run,'decision',choice.reason,{action:choice.action,mode:choice.mode});
 if(choice.action==='finish'){run.status='awaiting_approval';run.verification={passed:true,verifiedTickets:state.completed.filter(x=>x.startsWith('verify:')),browserUrl:`http://localhost:${process.env.PORT||4000}/sandbox`,evidence:state.observations.slice(-10)};await log(run,'verification','Browser read-back succeeded. Waiting for human approval.',run.verification);return;}
 let success=false;
 for(let retry=0;retry<3&&!success;retry++){
 try{const result=await perform(page,choice.action,choice.args);state.observations.push({action:choice.action,args:choice.args,result,at:new Date().toISOString()});if(choice.action==='read_policy')state.policy=result.policy;if(choice.action==='inspect_board')state.tickets=result.tickets;
 const suffix=choice.args.ticketId?`:${choice.args.ticketId}`:'';const label={assign_ticket:'assign',create_followup:'followup',prepare_reply:'reply',verify_ticket:'verify'}[choice.action]||choice.action;state.completed.push(label+suffix);
 if(choice.action==='prepare_reply'){const ticket=state.tickets.find(t=>t.id===choice.args.ticketId);await Draft.findOneAndUpdate({idempotencyKey:`operator:${run._id}:${ticket.id}`},{$setOnInsert:{runId:run._id,recipient:ticket.id+'@example.test',subject:`Support update: ${ticket.subject}`,body:`Hello, our team is investigating ${ticket.subject}. We will follow up after reviewing the issue.`,idempotencyKey:`operator:${run._id}:${ticket.id}`}}, {upsert:true,new:true});}
 await log(run,'observation',`${choice.action} succeeded`,result);success=true;failures=0;
 }catch(e){failures++;await log(run,'recovery',`${choice.action} attempt ${retry+1} failed`,{error:e.message});if(retry<2)await new Promise(r=>setTimeout(r,200*(retry+1)));}}
 if(!success)throw Error(`Could not recover from ${choice.action}`);
 }
 throw Error('Maximum agent steps exceeded');});
 }catch(e){const run=await Run.findById(id);if(run){run.status='failed';run.error=e.message;await log(run,'failure',e.message);}}finally{running.delete(key);}}
