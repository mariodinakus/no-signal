import {SERVICES,jsonFetch,listData,normalizeAlert,send} from '../lib/sources.js';
export default async function handler(req,res){
 if(req.method!=='GET')return send(res,{error:'Method not allowed'},405);
 const hours=[24,72,168].includes(Number(req.query?.hours))?Number(req.query.hours):24;
 const until=Math.floor(Date.now()/1000),from=until-hours*3600;
 const queries=SERVICES.map(async service=>{
  try {
   const data=await jsonFetch(`https://${service.host}/api/v2/summary.json`);
   if(!data?.status?.indicator)throw Error('Missing status');
   const incidents=(Array.isArray(data.incidents)?data.incidents:[]).slice(0,12).map((p)=>({id:`${service.id}-${p.id}`,provider:service.name,title:String(p.name||'Incident'),status:String(p.status||'investigating'),impact:String(p.impact||'none'),time:p.created_at||null,updatedAt:p.updated_at||null,url:service.url,detail:String(p.incident_updates?.[0]?.body||'').slice(0,450)}));
   return {id:service.id,name:service.name,status:data.status.indicator,description:data.status.description,components:(data.components||[]).filter(c=>c.status!=='operational').slice(0,6).map(c=>({name:c.name,status:c.status})),incidents,url:service.url,available:true};
  }catch(e){return {id:service.id,name:service.name,status:'unknown',description:'Source unavailable',components:[],incidents:[],url:service.url,available:false};}
 });
 const ioda=(async()=>{
  try{
   const q=new URLSearchParams({from:String(from),until:String(until),entityType:'country',limit:'350'});
   const raw=await jsonFetch(`https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts?${q}`,8500);
   if(raw?.error)throw Error('IODA error');
   const list=listData(raw);if(!list)throw Error('Unrecognized alert response');
   const alerts=list.map(normalizeAlert).filter(Boolean).sort((a,b)=>b.time.localeCompare(a.time));
   return {available:true,alerts:alerts.slice(0,250),truncated:Boolean(raw?.pagination?.totalPages>1||list.length>=350),rawCount:list.length};
  }catch(e){return {available:false,alerts:[],truncated:false,rawCount:0,error:'IODA temporarily unavailable'};}
 })();
 const [services,iodaResult]=await Promise.all([Promise.all(queries),ioda]);
 return send(res,{generatedAt:new Date().toISOString(),windowHours:hours,services,ioda:iodaResult,limitations:['IODA alerts are detection signals, not verified causes or all outages.','Provider status pages are self-reported and cover only selected services.','Zero alerts never proves a country or provider is healthy.']});
}
