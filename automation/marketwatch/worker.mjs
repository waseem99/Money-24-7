// Handlers must be explicitly supplied by a trusted integration. No paid or
// email handler is wired in this phase; unsupported jobs stay visible in status.
export async function runTick(queue,handlers,{enabled=false}={}) {
  if(!enabled) return {mode:'INSPECT_ONLY',jobs:await queue.status()};
  const kinds=Object.keys(handlers);
  if(!kinds.length || kinds.some(k=>typeof handlers[k]!=='function')) throw new Error('No qualified handlers configured');
  await queue.recover();
  const job=await queue.claim(kinds);
  if(!job) return {mode:'WORKER',processed:0};
  let outcome;
  try {
    const result=await handlers[job.kind](job,{idempotencyKey:job.key});
    outcome={ok:true,result:result??{}};
  } catch {
    // Unknown exceptions are ambiguous for external operations. Never infer
    // that a send/submission did not happen merely because its call threw.
    outcome={ok:false,retryable:job.retry_safe,uncertain:!job.retry_safe,result:{code:'HANDLER_FAILED'}};
  }
  const state=await queue.finish(job,outcome);
  return {mode:'WORKER',processed:1,key:job.key,state};
}
