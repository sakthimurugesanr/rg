'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

// Never hide text while waiting for a font, observer or restored scroll position.
export default function Motion(){
 const pathname=usePathname();
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const counters=Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
  const elements=Array.from(document.querySelectorAll<HTMLElement>('main section:not(.hero), .product-card, .spec-card, .category-tile, .footer-wordmark'));
  const frames=new Map<HTMLElement,number>();let observer:IntersectionObserver|undefined;let countObserver:IntersectionObserver|undefined;
  function reset(){observer?.disconnect();countObserver?.disconnect();frames.forEach(cancelAnimationFrame);frames.clear();elements.forEach(el=>{el.classList.remove('enter-section','enter-card','enter-wordmark');el.style.removeProperty('--entry-delay')});counters.forEach(el=>{el.textContent=el.dataset.count||''})}
  function setup(){reset();if(media.matches)return;
   observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target as HTMLElement;el.classList.add(el.classList.contains('footer-wordmark')?'enter-wordmark':el.matches('.product-card,.spec-card,.category-tile')?'enter-card':'enter-section');observer?.unobserve(el)})},{threshold:.05});elements.forEach((el,i)=>{if(el.matches('.product-card,.spec-card,.category-tile'))el.style.setProperty('--entry-delay',`${i%4*60}ms`);observer?.observe(el)});
   countObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target as HTMLElement;countObserver?.unobserve(el);const target=Number(el.dataset.count);const start=performance.now();function tick(now:number){const progress=Math.min((now-start)/1000,1);el.textContent=String(Math.round(target*(1-(1-progress)**3)));if(progress<1)frames.set(el,requestAnimationFrame(tick));else frames.delete(el)}frames.set(el,requestAnimationFrame(tick))})},{threshold:.6});counters.forEach(el=>countObserver?.observe(el));
  }
  setup();media.addEventListener('change',setup);return()=>{reset();media.removeEventListener('change',setup)};
 },[pathname]);return null;
}
