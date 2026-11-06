import type {MetadataRoute} from 'next';
import {categories,products} from '@/data/products';
import {siteUrl} from '@/data/business';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{return ['','/image-credits/',...categories.map(c=>`/categories/${c.slug}/`),...products.map(p=>`/products/${p.slug}/`)].map(path=>({url:`${siteUrl}${path||'/'}`}))}
