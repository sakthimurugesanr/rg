import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
try{process.loadEnvFile('.env')}catch(e){if(e.code!=='ENOENT')throw e}
const url=process.env.NEXT_PUBLIC_ENQUIRY_API_URL||'';
if(url){const u=new URL(url,'http://localhost');if(!/^https?:$/.test(u.protocol)||u.hostname==='script.google.com'||u.hostname.endsWith('.googleusercontent.com'))throw Error('Public enquiry URL must point to your API bridge, not Apps Script.');if(!url.startsWith('/')&&u.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(u.hostname))throw Error('Use HTTPS for a public API.')}
async function walk(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())result.push(...await walk(f));else result.push(f)}return result}
const secrets=['ENQUIRY_SHARED_SECRET','GOOGLE_APPS_SCRIPT_URL','GOOGLE_SHEET_URL','OWNER_NOTIFICATION_EMAIL'].map(k=>process.env[k]).filter(v=>v&&v.length>=8);
for(const file of await walk('out')){if(!/\.(?:js|html|json|txt)$/.test(file))continue;const text=await readFile(file,'utf8');if(secrets.some(s=>text.includes(s)))throw Error('Private configuration found in public assets. Publication stopped.')}
console.log(`PASS: private configuration absent from public assets. Mode: ${url?'API bridge':'WhatsApp fallback; integration URL empty'}.`);
