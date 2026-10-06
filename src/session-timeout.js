export async function withTimeout(promise, ms, message, onLateResolve = () => {}) {
  let expired = false;
  let timer;
  const observed = Promise.resolve(promise).then(value => {
    if (expired) Promise.resolve().then(() => onLateResolve(value)).catch(() => {});
    return value;
  });
  try {
    return await Promise.race([observed, new Promise((_, reject) => {
      timer = setTimeout(() => { expired = true; reject(new Error(message)); }, ms);
    })]);
  } finally { clearTimeout(timer); }
}
