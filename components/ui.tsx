
import { categories, type Product } from '@/data/products';
import { photoForSlot } from '@/data/photography';
export function Photo({slot,label,ratio='',priority=false}:{slot:string;label:string;ratio?:string;priority?:boolean}){
 const photo=photoForSlot(slot);
 return <figure className={`photo ${ratio}`}><picture><source type="image/webp" srcSet={[480,800,1600].map(w=>`/assets/photos/${photo.key}-${w}.webp ${w}w`).join(', ')} sizes="(max-width:640px) 90vw, (max-width:1100px) 45vw, 600px"/><img src={`/assets/photos/${photo.key}.jpg`} alt={`${photo.alt}. Illustrative stock photograph; request an actual product swatch.`} width={photo.width} height={photo.height} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined}/></picture><figcaption>{label} · Illustrative photo</figcaption></figure>
}
export function SectionTitle({eyebrow,title,text}:{eyebrow:string;title:string;text?:string}){return <div className="section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{text&&<p className="muted">{text}</p>}</div>}
export function ProductCard({product:p}:{product:Product}){return <article className="product-card"><a href={`/products/${p.slug}/`}><Photo slot={p.image} label={p.name}/><div className="product-meta"><span className="chip" style={{background:p.chip}} aria-hidden="true"/>{categories.find(c=>c.slug===p.category)?.name}</div><h3>{p.name}</h3><span className="product-action">View fabric details</span></a></article>}
