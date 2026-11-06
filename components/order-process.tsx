'use client';
import {useEffect,useRef,useState} from 'react';
const steps=[['Enquire','Call or send us a WhatsApp enquiry.'],['Share requirement','Include fabric, colour, quantity, GSM and width if known.'],['Quote and sample','Confirm price, sample availability and payment terms.'],['Dispatch','Agree delivery arrangements before placing your order.']];
export default function OrderProcess(){
 const root=useRef<HTMLElement>(null);const [active,setActive]=useState(0);
 useEffect(()=>{
  const el=root.current;if(!el)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0;let visible=false;
  const update=()=>{frame=0;const nodes=Array.from(el.querySelectorAll<HTMLElement>('.order-node'));const positions=nodes.map(n=>{const r=n.getBoundingClientRect();return r.top+r.height/2});const marker=innerHeight*.65;const first=positions[0],last=positions.at(-1)!;const rail=el.querySelector('.order-timeline')!.getBoundingClientRect();el.style.setProperty('--order-rail-top',`${first-rail.top}px`);el.style.setProperty('--order-rail-bottom',`${rail.bottom-last}px`);const progress=Math.max(0,Math.min(1,(marker-first)/(last-first||1)));el.style.setProperty('--order-progress',String(reduced.matches?1:progress));let next=0;positions.forEach((p,i)=>{if(p<=marker)next=i});setActive(next)};
  const schedule=()=>{if(visible&&!frame)frame=requestAnimationFrame(update)};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)update()});observer.observe(el);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',update);update();
  return()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',update)};
 },[]);
 return <section ref={root} className="section order-section" id="process"><div className="container order-layout"><div className="order-heading"><span className="eyebrow">How to order</span><h2>From enquiry<br/>to dispatch.</h2><p>Four steps. One direct conversation.</p><span className="order-status" aria-live="polite">Step {active+1} of 4 · {steps[active][0]}</span></div><ol className="order-timeline">{steps.map(([title,text],i)=><li key={title} className={`order-step ${i<=active?'is-reached':''} ${i===active?'is-active':''}`} aria-current={i===active?'step':undefined}><span className="order-node">0{i+1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>;
}
