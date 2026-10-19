// Node-only local preview server. No npm dependencies, no build step.
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import overview from './api/overview.js';import country from './api/country.js';
const root=path.dirname(fileURLToPath(import.meta.url));const port=Number(process.env.PORT||3000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://localhost');const pathName=decodeURIComponent(u.pathname);
  if(pathName==='/api/overview'||pathName==='/api/country'){
   const query=Object.fromEntries(u.searchParams.entries());
   res.status=(n)=>{res.statusCode=n;return res};res.json=(body)=>{res.end(JSON.stringify(body));return res};
   await (pathName==='/api/overview'?overview:country)({method:req.method,query},res);return;
  }
  const file=path.resolve(root,'.'+(pathName==='/'?'/index.html':pathName));
  if(!file.startsWith(root+path.sep))throw Error('Forbidden');
  const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);
 }catch(e){res.statusCode=404;res.end('Not found')}
});server.listen(port,()=>console.log(`NO SIGNAL preview: http://localhost:${port}`));
