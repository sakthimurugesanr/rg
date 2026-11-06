import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
await mkdir('public/assets/photos',{recursive:true});
await mkdir('licenses/images',{recursive:true});
const photos=[
 {key:'fabric-rolls',id:33425496,photographer:'Edgar Martínez',page:'https://www.pexels.com/photo/colorful-fabric-rolls-in-textured-arrangement-33425496/',alt:'Close-up of multicoloured fabric rolls arranged together'},
 {key:'fabric-selection',id:18359539,photographer:'Muhammed zeya',page:'https://www.pexels.com/photo/multi-colored-rolls-of-display-fabrics-18359539/',alt:'Rows of multicoloured fabric bolts in a textile shop'},
 {key:'blue-rolls',id:36299788,photographer:'Jonathan Borba',page:'https://www.pexels.com/photo/close-up-texture-of-blue-fabric-rolls-36299788/',alt:'Blue fabric rolls showing different woven textures'},
 {key:'blue-drape',id:7946565,photographer:'Hanna Pad',page:'https://www.pexels.com/photo/a-close-up-shot-of-a-blue-fabric-7946565/',alt:'Soft blue fabric with gentle folds'},
 {key:'white-drape',id:8465939,photographer:'Davis Vidal',page:'https://www.pexels.com/photo/folded-delicate-fabric-8465939/',alt:'White fabric draped in soft folds'},
 {key:'blue-weave',id:18372335,photographer:'Júlio Riccó',page:'https://www.pexels.com/photo/close-up-photo-of-a-blue-fabric-texture-18372335/',alt:'Close-up detail of a blue woven fabric'}
];
for(const p of photos){
 const url=`https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&cs=tinysrgb&w=1800`;
 const response=await fetch(url);if(!response.ok)throw Error(`${p.key}: ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());const meta=await sharp(bytes).metadata();
 if(!meta.width||!meta.height)throw Error('Invalid photograph');
 await sharp(bytes).rotate().resize({width:1600,withoutEnlargement:true}).jpeg({quality:84,mozjpeg:true}).toFile(`public/assets/photos/${p.key}.jpg`);
 for(const width of [480,800,1600])await sharp(bytes).rotate().resize({width,withoutEnlargement:true}).webp({quality:80}).toFile(`public/assets/photos/${p.key}-${width}.webp`);
 p.width=meta.width;p.height=meta.height;p.downloadUrl=url;p.license='Pexels License';p.licenseUrl='https://www.pexels.com/legal-pages/license/';p.checkedAt='2026-11-06';p.sha256=createHash('sha256').update(await readFile(`public/assets/photos/${p.key}.jpg`)).digest('hex');
 await writeFile(`licenses/images/${p.key}.json`,JSON.stringify(p,null,2));console.log(`Downloaded and optimised ${p.key}`);
}
await writeFile('data/photos.json',JSON.stringify(photos,null,2));
// A small contact sheet is for visual QA of downloaded assets only.
await sharp({create:{width:1200,height:600,channels:3,background:'#ffffff'}}).composite(await Promise.all(photos.map(async(p,i)=>({input:await sharp(`public/assets/photos/${p.key}.jpg`).resize(400,300,{fit:'cover'}).toBuffer(),left:i%3*400,top:Math.floor(i/3)*300})))).jpeg().toFile('licenses/images/contact-sheet.jpg');
