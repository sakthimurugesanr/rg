'use client';
import {useEffect,useId,useRef,useState,type FormEvent} from 'react';
import {usePathname} from 'next/navigation';
import {ShieldCheck} from 'lucide-react';
import {ThemeProvider,createTheme} from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import {categories} from '@/data/products';
import {whatsapp} from '@/data/business';
import {FIELD_LIMITS,validateEnquiry} from '@/lib/enquiry-contract.mjs';
import {useEnquiryToast} from '@/components/enquiry-toast';
const endpoint=(process.env.NEXT_PUBLIC_ENQUIRY_API_URL||'').trim();
const theme=createTheme({typography:{fontFamily:'"Encode Sans Semi Expanded", Arial, sans-serif',fontSize:14,fontWeightRegular:500,button:{textTransform:'none',fontWeight:700}},palette:{primary:{main:'#2458d3'},text:{primary:'#152033',secondary:'#586579'}},shape:{borderRadius:10},components:{MuiTextField:{defaultProps:{fullWidth:true,variant:'outlined'}},MuiOutlinedInput:{styleOverrides:{root:{backgroundColor:'#fff','& fieldset':{borderColor:'#dce3ed'},'&:hover fieldset':{borderColor:'#8191ab'}},input:{padding:'16px 14px'}}},MuiButton:{defaultProps:{disableElevation:true},styleOverrides:{root:{minHeight:54,borderRadius:10}}}}});

export default function EnquiryForm({product='',category=''}:{product?:string;category?:string}){
 const id=useId();const pathname=usePathname();const notify=useEnquiryToast();
 const [errors,setErrors]=useState<Record<string,string>>({});const [selected,setSelected]=useState(category);const [submitting,setSubmitting]=useState(false);const [problem,setProblem]=useState('');const [fallback,setFallback]=useState('');const [cooldown,setCooldown]=useState(0);
 const pending=useRef(false);const retry=useRef<{fingerprint:string;requestId:string}|null>(null);const cooling=cooldown>0;
 useEffect(()=>{if(!cooling)return;const timer=setInterval(()=>setCooldown(n=>Math.max(0,n-1)),1000);return()=>clearInterval(timer)},[cooling]);
 function clearError(field:string){setErrors(previous=>{if(!previous[field])return previous;const copy={...previous};delete copy[field];return copy})}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(pending.current||cooling)return;const form=e.currentTarget;
  const raw={...Object.fromEntries(new FormData(form).entries()),product,category:selected,sourcePath:pathname};const checked=validateEnquiry(raw);setErrors(checked.errors);setProblem('');setFallback('');
  if(!checked.valid){const first=Object.keys(checked.errors)[0];(form.querySelector(`[name="${first}"]`) as HTMLElement|null)?.focus();return;}
  pending.current=true;setSubmitting(true);
  try{
   if(!endpoint){const message=`Hello R.G. Traders, please share a quote.\n${['name','phone','category','product','colour','quantity','message'].map(key=>`${key[0].toUpperCase()+key.slice(1)}: ${checked.data[key]||'Please advise'}`).join('\n')}`;const url=whatsapp(message);setFallback(url);window.open(url,'_blank','noopener,noreferrer');notify('WhatsApp enquiry prepared. Press Send in WhatsApp to contact us.','info');return;}
   const target=new URL(endpoint,window.location.origin);if(!['https:','http:'].includes(target.protocol)||(!endpoint.startsWith('/')&&target.protocol!=='https:'&&target.hostname!=='127.0.0.1'&&target.hostname!=='localhost')||target.hostname==='script.google.com'||target.hostname.endsWith('.googleusercontent.com'))throw Error('The online form is being configured. Please use WhatsApp or call us.');
   const fingerprint=JSON.stringify(checked.data);if(retry.current?.fingerprint!==fingerprint)retry.current={fingerprint,requestId:crypto.randomUUID()};
   const response=await fetch(target.toString(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...checked.data,requestId:retry.current!.requestId}),signal:AbortSignal.timeout(30000)});
   let result;try{result=await response.json()}catch{throw Error('Online enquiries are unavailable. Please use WhatsApp or call us.')}
   if(!response.ok||result?.ok!==true||result?.saved!==true||!/^RG-\d{8}-[A-F0-9]{8}$/.test(result.reference||'')){
    if(response.status===429){const seconds=Number(response.headers.get('Retry-After')||60);setCooldown(Number.isFinite(seconds)?Math.min(3600,Math.max(1,seconds)):60)}
    if(result?.errors&&typeof result.errors==='object')setErrors(result.errors);
    throw Error(typeof result?.message==='string'?result.message:'Your enquiry was not confirmed. Please retry or call us.');
   }
   notify(`Enquiry saved successfully. Reference: ${result.reference}`);form.reset();setSelected(category);setErrors({});retry.current=null;
  }catch(error){setProblem(error instanceof Error&&error.name!=='TimeoutError'&&error.name!=='AbortError'&&error.name!=='TypeError'?error.message:'We could not confirm delivery. Please retry without changing the form, or contact us by phone.');}
  finally{pending.current=false;setSubmitting(false)}
 }
 return <ThemeProvider theme={theme}><form className="enquiry-form modern-form" onSubmit={submit} noValidate aria-labelledby={`${id}-title`} aria-busy={submitting}>
  <div className="form-intro"><span className="form-kicker">Fabric enquiry</span><span className="form-channel">{endpoint?'Request a quote':'Via WhatsApp'}</span></div>
  <h3 id={`${id}-title`}>{product?'Request your fabric quote':'Tell us what you need.'}</h3><p className="form-description">{product||'Share a few details. Discuss your quote directly with Ragul.'}</p>
  <label className="form-honeypot" aria-hidden="true">Company website<input name="company" type="text" tabIndex={-1} autoComplete="off" maxLength={FIELD_LIMITS.company}/></label>
  <div className="mui-form-grid">
   <TextField id={`${id}-name`} name="name" label="Your name" required autoComplete="name" disabled={submitting} error={!!errors.name} helperText={errors.name} onChange={()=>clearError('name')} slotProps={{htmlInput:{maxLength:FIELD_LIMITS.name}}}/>
   <TextField id={`${id}-phone`} name="phone" label="Phone number" type="tel" required autoComplete="tel" disabled={submitting} error={!!errors.phone} helperText={errors.phone} onChange={()=>clearError('phone')} slotProps={{htmlInput:{maxLength:FIELD_LIMITS.phone}}}/>
   <TextField id={`${id}-category`} name="category" label="Fabric category" select required value={selected} disabled={submitting} onChange={e=>{setSelected(e.target.value);clearError('category')}} error={!!errors.category} helperText={errors.category}>{categories.map(c=><MenuItem value={c.slug} key={c.slug}>{c.name}</MenuItem>)}<MenuItem value="Help me choose">Help me choose</MenuItem></TextField>
   <TextField id={`${id}-colour`} name="colour" label="Colour" disabled={submitting} error={!!errors.colour} helperText={errors.colour} onChange={()=>clearError('colour')} slotProps={{htmlInput:{maxLength:FIELD_LIMITS.colour}}}/>
   <TextField id={`${id}-quantity`} name="quantity" label="Approximate quantity" placeholder="e.g. 50 kg or 100 metres" disabled={submitting} className="form-full" error={!!errors.quantity} helperText={errors.quantity} onChange={()=>clearError('quantity')} slotProps={{htmlInput:{maxLength:FIELD_LIMITS.quantity}}}/>
   <TextField id={`${id}-message`} name="message" label="Anything else?" multiline minRows={3} disabled={submitting} className="form-full" placeholder="GSM, width, intended use or a fabric reference" error={!!errors.message} helperText={errors.message||`Up to ${FIELD_LIMITS.message} characters.`} onChange={()=>clearError('message')} slotProps={{htmlInput:{maxLength:FIELD_LIMITS.message}}}/>
  </div>
  <Button type="submit" variant="contained" fullWidth disabled={submitting||cooling} startIcon={submitting?<CircularProgress size={18} color="inherit"/>:undefined}>{submitting?'Sending enquiry…':cooling?`Please wait (${cooldown}s)`:endpoint?'Send enquiry':'Get Best Price on WhatsApp'}</Button>
  <p className="form-privacy"><ShieldCheck size={16}/>{endpoint?'Your details are shared only for this quotation enquiry.':'Your details stay in your WhatsApp conversation.'}</p>
  <p className="note">{endpoint?'Submitting saves your requirement to our enquiry sheet and requests an owner email notification.':'Opens a prepared WhatsApp message. Press Send there to submit. Online sheet submission is not enabled yet.'}</p>
  {(problem||errors.form)&&<Alert severity="error" className="form-alert">{problem||errors.form} <a href={whatsapp('Hello R.G. Traders, I have a fabric enquiry.')} target="_blank" rel="noreferrer">Enquire on WhatsApp</a></Alert>}
  {fallback&&<Alert severity="info" className="form-alert"><a href={fallback} target="_blank" rel="noreferrer">Continue in WhatsApp</a> and press Send. This enquiry has not been saved to Google Sheets.</Alert>}
 </form></ThemeProvider>;
}
