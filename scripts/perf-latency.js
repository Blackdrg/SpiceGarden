const BASE = 'http://localhost:3001';
const N = 200;
function now(){ return process.hrtime.bigint(); }
function ms(t){ return Number(t)/1e6; }
const samples = [];
(async () => {
  // warmup
  for (let i=0;i<5;i++) await fetch(BASE+'/health');
  for (let i=0;i<N;i++){
    const s=now();
    const r=await fetch(BASE+'/restaurants/search?q=a');
    await r.text();
    samples.push(ms(now()-s));
  }
  samples.sort((a,b)=>a-b);
  const pct=p=>samples[Math.floor(samples.length*p/100)];
  console.log('=== PERF: GET /restaurants/search?q=a (N='+N+') ===');
  console.log('min='+samples[0].toFixed(1)+'ms p50='+pct(50).toFixed(1)+'ms p95='+pct(95).toFixed(1)+'ms p99='+pct(99).toFixed(1)+'ms max='+samples[samples.length-1].toFixed(1)+'ms');
  console.log('avg='+(samples.reduce((a,b)=>a+b,0)/samples.length).toFixed(1)+'ms');
  // also /health
  const h=[];
  for(let i=0;i<100;i++){const s=now();const r=await fetch(BASE+'/health');await r.text();h.push(ms(now()-s));}
  h.sort((a,b)=>a-b);
  console.log('=== PERF: GET /health (N=100) ===');
  console.log('min='+h[0].toFixed(1)+' p50='+h[50].toFixed(1)+' p95='+h[95].toFixed(1)+' p99='+h[99].toFixed(1)+' max='+h[99].toFixed(1));
})().catch(e=>console.error(e.message));
