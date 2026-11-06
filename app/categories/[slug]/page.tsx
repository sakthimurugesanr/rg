import Breadcrumbs from '@/components/breadcrumbs';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {categories,products} from '@/data/products';
import {ProductCard} from '@/components/ui';
import {whatsapp} from '@/data/business';
export const dynamicParams=false;
export function generateStaticParams(){return categories.map(c=>({slug:c.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const c=categories.find(c=>c.slug===slug);return {title:`${c?.name||'Category'} | R.G. Traders`,description:c?.description,alternates:{canonical:`/categories/${slug}/`},openGraph:{title:`${c?.name} | R.G. Traders`,description:c?.description}}}
export default async function Category({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const c=categories.find(c=>c.slug===slug);if(!c)notFound();return <div className="container"><Breadcrumbs items={[{label:"Home",href:"/"},{label:"Products",href:"/#products"},{label:c.name}]}/><header className="category-intro"><span className="eyebrow">The fabric catalogue / {c.count} products</span><h1>{c.name}</h1><p>{c.description}</p></header><div className="product-grid">{products.filter(p=>p.category===slug).map(p=><ProductCard key={p.slug} product={p}/>)}</div>{(slug==='knitted'||slug==='polyester')&&<aside className="catalogue-note"><h2 style={{fontSize:'var(--step-2)'}}>Ask for more options.</h2><p>{slug==='knitted'?'Four of the five catalogue entries are named here. Enquire for the fifth fabric and further options.':'Looking for another polyester fabric? Share your requirement.'}</p><a className="text-link" href={whatsapp(`Please share more ${c.name.toLowerCase()} options.`)}>Request Quote</a></aside>}<div className="section"><a className="button outline" href="/#products">View all categories</a></div></div>}
