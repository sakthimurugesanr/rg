'use client';
import {useId,useRef,useState} from 'react';
import {ChevronDown} from 'lucide-react';
type Item={label:string;href?:string};
export default function Breadcrumbs({items}:{items:Item[]}){
 const [open,setOpen]=useState(false);const id=useId();const toggle=useRef<HTMLButtonElement>(null);
 return <nav className={`breadcrumbs collapsible-breadcrumbs ${open?'is-open':''}`} aria-label="Breadcrumb" onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus()}}}>
  <button type="button" ref={toggle} className="breadcrumb-toggle" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}><span>Browse path</span><span className="breadcrumb-current">{items.at(-1)?.label}</span><ChevronDown size={17} aria-hidden="true"/></button>
  <div id={id} className="breadcrumb-panel" aria-hidden={!open} inert={!open}><div><ol>{items.map((item,i)=><li key={item.label}>{i>0&&<span className="breadcrumb-separator" aria-hidden="true">/</span>}{item.href?<a href={item.href}>{item.label}</a>:<span aria-current="page">{item.label}</span>}</li>)}</ol></div></div>
 </nav>;
}
