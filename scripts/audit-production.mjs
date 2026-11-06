import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve('out');
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(async e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat()}
const all=await files(root);const html=all.filter(f=>f.endsWith('.html'));
const problems=[];let references=0;
for(const file of html){const text=await readFile(file,'utf8');for(const match of text.matchAll(/(?:src|href)="(\/[^"<>]+)"/g)){const url=match[1].split(/[?#]/)[0];if(!/\.(?:jpg|jpeg|png|webp|svg|css|js|woff2)$/.test(url))continue;references++;if(!await stat(path.join(root,decodeURIComponent(url))).catch(()=>null))problems.push(`${path.relative(root,file)}: missing ${url}`);if(url.startsWith('/images/')||url.startsWith('/assets/img/'))problems.push(`Unverified/placeholder photo in export: ${url}`)}}
const manifest=JSON.parse(await readFile('data/photos.json','utf8'));
for(const p of manifest){const bytes=await readFile(path.join(root,'assets/photos',`${p.key}.jpg`));if(createHash('sha256').update(bytes).digest('hex')!==p.sha256)problems.push(`Hash mismatch for ${p.key}`);if(!p.page.startsWith('https://www.pexels.com/photo/')||!p.licenseUrl||!p.checkedAt)problems.push(`Missing licence metadata: ${p.key}`)}
if(all.some(f=>f.includes(`${path.sep}images${path.sep}`)||f.includes(`${path.sep}assets${path.sep}img${path.sep}`)))problems.push('Legacy photos or placeholders remain in export');
const fontManifest=JSON.parse(await readFile('data/font-manifest.json','utf8'));
for(const f of fontManifest){const bytes=await readFile(path.join(root,'fonts/current',f.file));if(bytes.subarray(0,4).toString()!=='wOF2')problems.push(`Invalid font: ${f.file}`)}
const fontCss=await readFile('app/fonts.css','utf8');if(fontCss.includes('fonts.googleapis.com')||!fontCss.includes('font-display:swap'))problems.push('Fonts must be local with immediate fallback');
if(problems.length){console.error(problems.join('\n'));process.exit(1)}
console.log(`PASS: ${html.length} HTML pages, ${references} local asset references, ${manifest.length} photograph hashes/licence records. No legacy photos or placeholders in production export.`);
