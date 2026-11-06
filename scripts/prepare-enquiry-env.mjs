import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const template=await readFile('.env.example','utf8');try{await writeFile('.env',template.replace('replace-with-at-least-32-random-characters',randomBytes(32).toString('base64url')),{flag:'wx'});console.log('Created ignored .env with empty integration URLs and a private shared secret.')}catch(e){if(e.code!=='EEXIST')throw e;console.log('Preserved the existing .env.')}
const pkg=JSON.parse(await readFile('package.json','utf8'));pkg.scripts['api:start']='node server/serve.mjs';pkg.scripts['test:enquiry']='node --test tests/enquiry*.test.mjs';await writeFile('package.json',JSON.stringify(pkg,null,2)+'\n');
