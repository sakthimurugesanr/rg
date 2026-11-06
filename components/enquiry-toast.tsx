'use client';
import {createContext,useCallback,useContext,useState} from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
type Toast={message:string;severity:'success'|'info';key:number};
const ToastContext=createContext<(message:string,severity?:'success'|'info')=>void>(()=>{});
export function useEnquiryToast(){return useContext(ToastContext)}
export default function EnquiryToastProvider({children}:{children:React.ReactNode}){
 const [toast,setToast]=useState<Toast|null>(null);
 const show=useCallback((message:string,severity:'success'|'info'='success')=>setToast({message,severity,key:Date.now()}),[]);
 return <ToastContext.Provider value={show}>{children}<Snackbar className="global-enquiry-toast" key={toast?.key} open={!!toast} autoHideDuration={8000} anchorOrigin={{vertical:'bottom',horizontal:'center'}} onClose={(_,reason)=>{if(reason!=='clickaway')setToast(null)}}><Alert severity={toast?.severity||'success'} variant="filled" role="status" onClose={()=>setToast(null)}>{toast?.message}</Alert></Snackbar></ToastContext.Provider>;
}
