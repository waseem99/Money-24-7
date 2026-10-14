import {defineConfig} from 'vite';
import {resolve} from 'node:path';

// The Stocks avatar operator lab is intentionally omitted from public builds.
// Include it only in a private, access-controlled build with explicit opt-in.
const operatorLabEnabled=process.env.STOCKS_BUILD_OPERATOR_LAB==='true';
export default defineConfig({build:{rollupOptions:{input:{
  main:resolve('index.html'),
  pilot:resolve('pilot.html'),
  broadcast:resolve('broadcast-preview.html'),stocksOperator:resolve('stocks-operator.html'),
  ...(operatorLabEnabled?{stocksOperator:resolve('stocks-streaming-lab.html')}:{})
}}}});
