import test from 'node:test';
import assert from 'node:assert/strict';
import {LiteAvatarSource} from '../network/live-avatar/lite-session-adapter.mjs';

const approval={
 durationSeconds:45,scriptApproved:true,voiceApproved:true,costCeilingApproved:true,
 providerRightsApproved:true,customAvatarApproved:true,
 sessionIdempotencyKey:'a'.repeat(64),billingApprovalId:'client-bounded-approval-1',
 operatorId:'producer-on-duty'
};
function make(){
 const calls={token:0,started:0,stopped:0,attached:0,spoken:0};
 const tokenRequest=async()=>{calls.token++;return{sessionToken:'mock-test-session-token',sessionId:'mock-session-1'};};
 const sessionFactory=()=>({
   start:async()=>{calls.started++},
   stop:async()=>{calls.stopped++},
   attach:()=>{calls.attached++},
   repeatAudio:()=>{calls.spoken++;return 'simulated-event-id'}
 });
 return{calls,source:new LiteAvatarSource({role:'NORA',tokenRequest,sessionFactory})};
}
test('Never purchase or request a streaming avatar session without explicit paid approval',async()=>{
 const x=make();
 await assert.rejects(x.source.connect(approval),/blocked/);
 assert.equal(x.calls.token,0);assert.equal(x.calls.started,0);
});
test('Approved mock LITE session only; no per-viewer source or Full Mode',async()=>{
 const x=make();
 const c=await x.source.connect({...approval,explicitlyApprovedPaidSession:true});
 assert.equal(c.status,'CONNECTED');
 assert.equal(x.calls.token,1);assert.equal(x.calls.started,1);
 x.source.attach({});
 assert.equal(x.calls.attached,1);
 const b64=Buffer.from('a'.repeat(120)).toString('base64');
 assert.equal(x.source.speakPcm24k(b64,'approved-audio-sha').includes('simulated'),true);
 assert.equal(x.calls.spoken,1);
 await x.source.stop();assert.equal(x.calls.stopped,1);
 assert.equal(x.source.state,'DISCONNECTED');
});
test('A token/session failure has uncertain outcome and never auto-retries billable operations',async()=>{
 let calls=0;
 const s=new LiteAvatarSource({role:'MARCUS',
   tokenRequest:async()=>{calls++;throw Error('temporary provider timeout')},
   sessionFactory:()=>({})});
 await assert.rejects(s.connect({...approval,explicitlyApprovedPaidSession:true}),/uncertain/);
 assert.equal(s.state,'UNCERTAIN_OUTCOME');
 await assert.rejects(s.connect({...approval,explicitlyApprovedPaidSession:true}),/already started or uncertain/);
 assert.equal(calls,1);
});
test('Large proof and missing approval/session hash are rejected before token issuance',async()=>{
 const x=make();
 await assert.rejects(x.source.connect({...approval,durationSeconds:150,explicitlyApprovedPaidSession:true}),/blocked|Limited first demo/);
 await assert.rejects(x.source.connect({...approval,sessionIdempotencyKey:'bad',explicitlyApprovedPaidSession:true}),/blocked/);
 assert.equal(x.calls.token,0);
});
