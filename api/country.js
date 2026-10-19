import {jsonFetch,send} from '../lib/sources.js';
export default async function handler(req,res){
 if(req.method!=='GET')return send(res,{error:'Method not allowed'},405);
 const code=String(req.query?.code||'').toUpperCase();
 if(!/^[A-Z]{2}$/.test(code))return send(res,{error:'Invalid ISO alpha-2 country code'},400);
 try{
  const d=await jsonFetch(`https://stat.ripe.net/data/country-resource-list/data.json?resource=${code}`,8000);
  if(d?.status!=='ok'||!d?.data)throw Error('Unexpected RIPEstat payload');
  const {resources,query_time}=d.data;
  return send(res,{available:true,code,asns:resources?.asn?.length??null,ipv4Ranges:resources?.['ipv4']?.length??null,ipv6Prefixes:resources?.['ipv6']?.length??null,queryTime:query_time||d.data?.time||null,source:'RIPEstat / RIR allocations',url:`https://stat.ripe.net/app/launchpad/S0.${code}`,disclaimer:'These are registry resources associated with a country, not a count of active routes or a connectivity health score.'});
 }catch(e){return send(res,{available:false,code,error:'RIPEstat data unavailable',asns:null,ipv4Ranges:null,ipv6Prefixes:null});}
}
