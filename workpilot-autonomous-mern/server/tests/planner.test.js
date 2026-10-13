import {describe,it,expect} from 'vitest';
import {fallbackPlan} from '../src/agent/planner.js';
describe('bounded planner',()=>{it('includes all five workflow stages',()=>{expect(fallbackPlan().map(x=>x.tool)).toEqual(['read_policies','list_tickets','create_work_items','prepare_drafts','verify_outcome']);});it('marks steps pending',()=>expect(fallbackPlan().every(s=>s.status==='pending')).toBe(true));});
