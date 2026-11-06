/** Shared browser/API validation. Google repeats these checks at the storage boundary. */
export const FIELD_LIMITS=Object.freeze({name:80,phone:20,category:40,product:160,colour:60,quantity:80,message:1500,sourcePath:200,company:100});
export const CATEGORY_VALUES=Object.freeze(['polyester','knitted','silk','matty','Help me choose']);
export const REQUEST_ID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
/** @param {Record<string, unknown>} input */
export function validateEnquiry(input){
 /** @type {Record<string,string>} */const errors={};
 /** @type {Record<string,string>} */const data={};
 for(const [key,max] of Object.entries(FIELD_LIMITS)){
  const raw=input[key]??'';
  if(typeof raw!=='string'){errors[key]='Enter text only.';continue;}
  if(raw.length>max){errors[key]=`Use ${max} characters or fewer.`;continue;}
  if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(raw)||(key!=='message'&&/[\r\n]/.test(raw))){errors[key]='Remove invalid characters.';continue;}
  data[key]=raw.trim();
 }
 if(!errors.name&&(data.name||'').length<2)errors.name='Please enter your name (at least 2 characters).';
 const phone=data.phone||'';const digits=(phone.match(/\d/g)||[]).length;
 if(!errors.phone&&(!/^\+?[0-9 ()-]+$/.test(phone)||digits<7||digits>15))errors.phone='Enter a valid phone number (7–15 digits).';
 if(!errors.category&&!CATEGORY_VALUES.includes(data.category))errors.category='Choose a fabric category.';
 if(!errors.sourcePath&&!/^\/[a-zA-Z0-9/_.-]*$/.test(data.sourcePath||'/'))errors.sourcePath='Invalid page reference.';
 if(data.company)errors.form='This enquiry could not be processed.';
 data.sourcePath=data.sourcePath||'/';
 return {data,errors,valid:Object.keys(errors).length===0};
}
