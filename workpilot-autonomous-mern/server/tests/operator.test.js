import {describe,it,expect} from 'vitest';
import {localDecision,decisionSchema} from '../src/operator/decision.js';
import {portal,resetPortal,injectTransientFailure,portalState} from '../src/operator/portal.js';
import express from 'express';import request from 'supertest';
const app=express();app.use('/sandbox',portal);
describe('policy-constrained autonomous decisions',()=>{
 it('reads policy before taking action',()=>expect(localDecision({completed:[],tickets:[]}).action).toBe('read_policy'));
 it('observes the board after policy',()=>expect(localDecision({completed:['read_policy'],tickets:[]}).action).toBe('inspect_board'));
 it('assigns high priority ticket before followup',()=>expect(localDecision({completed:['read_policy','inspect_board'],tickets:[{id:'INC-101',priority:'critical',status:'open'}]}).action).toBe('assign_ticket'));
 it('never treats a low priority ticket as required',()=>expect(localDecision({completed:['read_policy','inspect_board'],tickets:[{id:'INC-103',priority:'low',status:'open'}]}).action).toBe('finish'));
 it('rejects unregistered tools',()=>expect(decisionSchema.safeParse({reason:'bad',action:'shell_exec',args:{}}).success).toBe(false));
});
describe('real sandbox operations',()=>{
 it('persists assignment and followup with read-back',async()=>{resetPortal();expect((await request(app).post('/sandbox/tickets/INC-101/assign').type('form').send({assignee:'billing-lead'})).status).toBe(200);await request(app).post('/sandbox/tickets/INC-101/followup');expect(portalState().tickets.find(x=>x.id==='INC-101')).toMatchObject({assignee:'billing-lead',followup:true});});
 it('recovers after a one-shot transient error',async()=>{resetPortal();injectTransientFailure();expect((await request(app).post('/sandbox/tickets/INC-101/assign').type('form').send({assignee:'billing-lead'})).status).toBe(503);expect((await request(app).post('/sandbox/tickets/INC-101/assign').type('form').send({assignee:'billing-lead'})).status).toBe(200);});
});
