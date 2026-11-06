import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {handleEnquiry,createMemoryLimiter} from './enquiry-service.mjs';
try{process.loadEnvFile('.env')}catch(error){if(error.code!=='ENOENT')throw error}
const limiter=createMemoryLimiter();
const server=createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://localhost');if(url.pathname!=='/api/enquiries'){res.writeHead(404);res.end();return}
  const request=new Request(url,{method:req.method,headers:req.headers,...(req.method!=='GET'&&req.method!=='HEAD'?{body:Readable.toWeb(req),duplex:'half'}:{})});
  // Direct Node deployment: do not trust user-supplied forwarding headers for identity.
  const result=await handleEnquiry(request,process.env,{clientIp:req.socket.remoteAddress,limiter});res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));
 }catch{res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:false,message:'Online enquiries are temporarily unavailable.'}))}
});
server.listen(Number(process.env.ENQUIRY_API_PORT||8787),process.env.ENQUIRY_API_HOST||'127.0.0.1',()=>console.log('Enquiry API listening. URLs and secrets are read from .env.'));
