import assert from 'node:assert/strict';
import overview from '../api/overview.js';
import country from '../api/country.js';
import {normalizeAlert,listData} from '../lib/sources.js';

const ts=Math.floor(Date.now()/1000);
assert.equal(normalizeAlert({entityCode:'GR',time:ts,datasource:'bgp',level:'warning'},0).code,'GR');
assert.equal(normalizeAlert({location:'country/US',start:ts,datasource:'ping-slash24'},1).code,'US');
assert.equal(normalizeAlert({entityCode:'INVALID',time:ts},0),null);
assert.deepEqual(listData({data:[{id:1}]}),[{id:1}]);

const originalFetch=globalThis.fetch;
function makeRes(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.statusCode=n;return this},json(d){this.body=d;return this}}}
try{
 globalThis.fetch=async url=>{
  const u=String(url);
  if(u.includes('outages/alerts'))return {ok:true,json:async()=>({error:null,data:[{entityCode:'GR',time:ts,datasource:'bgp',level:'warning'},{entityCode:'IT',time:ts-3600,datasource:'ping-slash24',level:'critical'}]})};
  if(u.includes('country-resource-list'))return {ok:true,json:async()=>({status:'ok',data:{query_time:'2026-10-19',resources:{asn:['AS1','AS2'],ipv4:['a'],ipv6:['a','b','c']}}})};
  if(u.includes('githubstatus'))throw Error('unavailable provider');
  return {ok:true,json:async()=>({status:{indicator:'none',description:'All Systems Operational'},components:[],incidents:[]})};
 };
 const res=makeRes();await overview({method:'GET',query:{hours:'24'}},res);
 assert.equal(res.statusCode,200);assert.equal(res.body.services.length,4);assert.equal(res.body.services.find(s=>s.id==='github').available,false);assert.equal(res.body.ioda.alerts.length,2);assert.equal(res.body.ioda.alerts[0].code,'GR');
 const res2=makeRes();await country({method:'GET',query:{code:'GR'}},res2);
 assert.equal(res2.body.asns,2);assert.equal(res2.body.ipv6Prefixes,3);
 const res3=makeRes();await country({method:'GET',query:{code:'__proto__'}},res3);assert.equal(res3.statusCode,400);
 globalThis.fetch=async url=>({ok:false,status:503});
 const res4=makeRes();await overview({method:'GET',query:{}},res4);
 assert.equal(res4.body.ioda.available,false);assert.equal(res4.body.services.filter(s=>s.available).length,0);
 console.log('PASS: normalization, partial source failure, country metrics, input validation, full source failure');
}finally{globalThis.fetch=originalFetch}
