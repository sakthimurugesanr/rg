'use client';

import {useId,useState} from 'react';
import {usePathname} from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {MessageSquareText,Phone,X} from 'lucide-react';
import EnquiryForm from '@/components/enquiry-form';
import {business,whatsapp} from '@/data/business';
import {products} from '@/data/products';

function WhatsAppIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.04 2a9.87 9.87 0 0 0-8.5 14.9L2 22l5.24-1.37A9.95 9.95 0 1 0 12.04 2Zm0 18.14a8.1 8.1 0 0 1-4.12-1.13l-.3-.18-3.1.81.83-3.02-.2-.31A8.14 8.14 0 1 1 12.04 20.14Z"/><path fill="currentColor" d="M16.5 14.1c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.57.13-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.25-.75-.66-1.25-1.48-1.4-1.73-.14-.25-.01-.39.11-.51.11-.11.25-.29.38-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.03 2.6.12.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z"/></svg>}

export default function ContactTools(){
 const [open,setOpen]=useState(false);const id=useId();const pathname=usePathname();
 const product=pathname.startsWith('/products/')?products.find(p=>p.slug===pathname.split('/')[2]):undefined;
 return <>
  <button type="button" className="enquiry-tab" aria-label="Open enquiry form" title="Enquire about fabrics" aria-haspopup="dialog" aria-expanded={open} aria-controls={`${id}-panel`} onClick={()=>setOpen(true)}><MessageSquareText size={22} aria-hidden="true"/><span className="enquiry-tab-label">Enquiry</span></button>
  <div className="floating-contact" aria-label="Quick contact">
   <a className="contact-circle contact-circle-call" href={business.tel} aria-label="Call R.G. Traders" title="Call R.G. Traders"><Phone size={23} aria-hidden="true"/><span className="contact-tooltip" aria-hidden="true">Call</span></a>
   <a className="contact-circle contact-circle-whatsapp" href={whatsapp(product?`Hello R.G. Traders, please share a quote for ${product.name}.`:'Hello R.G. Traders, please help me with a fabric requirement.')} aria-label="WhatsApp R.G. Traders" title="WhatsApp R.G. Traders" target="_blank" rel="noopener noreferrer"><WhatsAppIcon/><span className="contact-tooltip" aria-hidden="true">WhatsApp</span></a>
  </div>
  <Drawer anchor="right" open={open} onClose={()=>setOpen(false)} className="enquiry-drawer" ModalProps={{keepMounted:true}} slotProps={{paper:{id:`${id}-panel`,role:'dialog','aria-modal':true,'aria-labelledby':`${id}-title`}}}>
   <div className="enquiry-drawer-head"><h2 id={`${id}-title`}>Enquire with R.G. Traders</h2><IconButton aria-label="Close enquiry form" onClick={()=>setOpen(false)}><X size={22}/></IconButton></div>
   <div className="enquiry-drawer-body"><EnquiryForm key={product?.slug||'general'} product={product?.name} category={product?.category}/></div>
  </Drawer>
 </>;
}
