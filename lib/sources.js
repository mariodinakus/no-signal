/** Fetch only preapproved upstreams. Fail independently rather than fabricating health. */
const SERVICES = [
  {id:'cloudflare',name:'Cloudflare',host:'www.cloudflarestatus.com',url:'https://www.cloudflarestatus.com'},
  {id:'github',name:'GitHub',host:'www.githubstatus.com',url:'https://www.githubstatus.com'},
  {id:'vercel',name:'Vercel',host:'www.vercel-status.com',url:'https://www.vercel-status.com'},
  {id:'openai',name:'OpenAI',host:'status.openai.com',url:'https://status.openai.com'}
];
export {SERVICES};
export async function jsonFetch(url,ms=6500){
  const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'NoSignalObservatory/1.0 (+https://github.com)'},signal:AbortSignal.timeout(ms)});
  if(!response.ok)throw Error(`upstream HTTP ${response.status}`);
  return await response.json();
}
export function listData(x){
 if(Array.isArray(x))return x;
 if(Array.isArray(x?.data))return x.data;
 if(Array.isArray(x?.data?.results))return x.data.results;
 if(Array.isArray(x?.data?.alerts))return x.data.alerts;
 return null;
}
export function normalizeAlert(a,i){
 const ent=a?.entity||{};
 const explicitCode=a.entityCode||ent.code||a.countryCode||a?.attrs?.entityCode;
 const path=a.location||a.entity||a.entityId;
 const inferred=typeof path==='string'?path.match(/(?:country\/)([A-Z]{2})/i)?.[1]:null;
 const code=String(explicitCode||inferred||'').toUpperCase();
 if(!/^[A-Z]{2}$/.test(code))return null;
 const ts=Number(a.time??a.start??a.from??a.timestamp??a?.attrs?.time);
 const stamp=ts>1e12?ts:ts*1000;
 if(!Number.isFinite(stamp)||stamp<946684800000)return null;
 const rawLevel=a.level??a.severity??a?.attrs?.level??'reported';
 const level=String(rawLevel).toLowerCase();
 const datasource=String(a.datasource??a.dataSource??a?.attrs?.datasource??'IODA');
 return {id:`${code}-${Math.round(stamp)}-${i}`,code,time:new Date(stamp).toISOString(),level,datasource,name:String(a.location_name??a.entityName??a?.name??code),signal:Number.isFinite(Number(a.value))?Number(a.value):null,baseline:Number.isFinite(Number(a.baseline))?Number(a.baseline):null,source:'IODA',url:`https://ioda.inetintel.cc.gatech.edu/country/${code}`};
}
export function send(res,data,status=200){res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=300');return res.status(status).json(data);}
