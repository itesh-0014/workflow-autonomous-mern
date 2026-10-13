import {Run,Draft} from '../models/index.js';
import {createPlan} from './planner.js';
import {tools} from '../tools/index.js';
const locks=new Set();
export async function log(run,type,message,data={}){run.events.push({type,message,data,at:new Date()});await run.save();globalThis.io?.to(String(run._id)).emit('run:update',{runId:String(run._id),type,message,data});}
export async function processRun(id){const key=String(id);if(locks.has(key))return;locks.add(key);
 try{let run=await Run.findById(id);if(!run||!['queued','running'].includes(run.status))return;
 run.status='running';await run.save();
 if(!run.plan.length){const result=await createPlan(run.goal);run.plan=result.steps;await log(run,'plan',`Plan generated (${result.source})`,{steps:run.plan});}
 while(run.cursor<run.plan.length){const step=run.plan[run.cursor];try{await log(run,'action',`Executing ${step.tool}`);const output=await tools[step.tool]({run,context:run.context});run.context={...run.context,[step.tool]:output};if(step.tool==='verify_outcome'&&!output.passed)throw Error('Outcome verification failed');step.status='completed';run.cursor++;run.attempts=0;await log(run,'observation',`${step.tool} completed`,output);
 if(step.tool==='prepare_drafts'&&output.drafts.some(x=>x.status==='pending')){run.status='awaiting_approval';await log(run,'approval','Human approval required for customer drafts');return;}
 if(step.tool==='verify_outcome'){run.verification=output;}
 }catch(err){run.attempts++;await log(run,'error',`Step ${step.tool} failed: ${err.message}`,{attempt:run.attempts});if(run.attempts>=3){run.status='failed';run.error=err.message;await run.save();return;}await new Promise(resolve=>setTimeout(resolve,200*run.attempts));}}
 run.status='completed';await log(run,'complete','Verified workflow completed',run.verification);
 }finally{locks.delete(key);}}
export async function resumeApproved(runId){const run=await Run.findById(runId);if(!run||run.status!=='awaiting_approval')throw Error('Run is not waiting for approval');const pending=await Draft.countDocuments({runId,status:'pending'});if(pending)throw Error('All drafts must be reviewed first');run.status='queued';await log(run,'resume','All drafts reviewed; resuming');setImmediate(()=>processRun(runId));return run;}
export function startWorker(){setInterval(async()=>{try{const runs=await Run.find({status:{$in:['queued','running']}}).limit(10).select('_id');for(const r of runs)processRun(r._id).catch(console.error);}catch(e){console.error('Worker polling error:',e.message);}},2000).unref();}
