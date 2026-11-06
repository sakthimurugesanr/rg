/** R.G. Traders signed enquiry bridge. Deploy as an Apps Script web app, execute as owner. */
var HEADERS_=['Request ID','Reference','Received at (IST)','Name','Phone','Fabric category','Product','Colour','Quantity','Message','Page','Email status','Email attempts','Last email error','Notification to','Payload hash','Updated at (IST)'];
var LIMITS_={name:80,phone:20,category:40,product:160,colour:60,quantity:80,message:1500,sourcePath:200,company:100};
var CATEGORIES_={polyester:'Polyester Fabric',knitted:'Knitted Fabric',silk:'Silk Fabric',matty:'Matty Fabric','Help me choose':'Help me choose'};

function doGet(){return json_({ok:false,code:'METHOD',message:'POST requests only.'})}
function doPost(event){
 var lock=null;
 try{
  var raw=event&&event.postData&&event.postData.contents;
  if(typeof raw!=='string'||raw.length>16000)return json_({ok:false,code:'VALIDATION'});
  var envelope=JSON.parse(raw);var secret=PropertiesService.getScriptProperties().getProperty('ENQUIRY_SHARED_SECRET');
  if(!secret||secret.length<32||typeof envelope.payload!=='string'||envelope.payload.length>12000||!verify_(envelope.payload,envelope.signature,secret))return json_({ok:false,code:'UNAUTHORIZED'});
  var input=JSON.parse(envelope.payload);
  if(input.version!==1||typeof input.timestamp!=='number'||Math.abs(Date.now()-input.timestamp)>300000||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.requestId||'')||!/^[a-f0-9]{64}$/.test(input.clientHash||''))return json_({ok:false,code:'VALIDATION'});
  var cfg=input.config;var data=validate_(input.data);
  if(!data||!validConfig_(cfg))return json_({ok:false,code:'VALIDATION'});
  lock=LockService.getScriptLock();if(!lock.tryLock(5000))return json_({ok:false,code:'BUSY',retryAfter:10});
  var book=SpreadsheetApp.openById(cfg.sheetId);var sheet=book.getSheetByName(cfg.sheetName)||book.insertSheet(cfg.sheetName);ensureHeaders_(sheet);
  var hash=hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(data),Utilities.Charset.UTF_8));
  var existing=findRequest_(sheet,input.requestId);
  if(existing){var previous=sheet.getRange(existing,1,1,HEADERS_.length).getValues()[0];if(previous[15]!==hash)return json_({ok:false,code:'ID_CONFLICT'});return json_({ok:true,saved:true,reference:previous[1],notification:previous[11]==='Sent'?'sent':'pending'})}
  var rate=consumeRate_(input.clientHash,data.phone,cfg,secret);if(!rate.ok)return json_({ok:false,code:'RATE_LIMITED',retryAfter:rate.retryAfter});
  var reference='RG-'+Utilities.formatDate(new Date(),'Asia/Kolkata','yyyyMMdd')+'-'+input.requestId.replace(/-/g,'').slice(-8).toUpperCase();var time=timestamp_();
  var values=[input.requestId,reference,time,safeCell_(data.name),safeCell_(data.phone),safeCell_(CATEGORIES_[data.category]),safeCell_(data.product),safeCell_(data.colour),safeCell_(data.quantity),safeCell_(data.message),safeCell_(data.sourcePath),'Sending',1,'',cfg.ownerEmail,hash,time];
  var row=sheet.getLastRow()+1;sheet.getRange(row,1,1,HEADERS_.length).setNumberFormat('@').setValues([values]);SpreadsheetApp.flush();
  PropertiesService.getScriptProperties().setProperties({ACTIVE_SHEET_ID:cfg.sheetId,ACTIVE_SHEET_TAB:cfg.sheetName});
  lock.releaseLock();lock=null;
  var status=notify_(sheet,row,values,cfg.sheetId);
  return json_({ok:true,saved:true,reference:reference,notification:status==='Sent'?'sent':'pending'});
 }catch(error){return json_({ok:false,code:'SAVE_FAILED',message:'The enquiry could not be confirmed.'})}
 finally{if(lock)lock.releaseLock()}
}

function validConfig_(cfg){return cfg&&/^[A-Za-z0-9_-]{20,}$/.test(cfg.sheetId||'')&&/^[A-Za-z0-9 _-]{1,40}$/.test(cfg.sheetName||'')&&typeof cfg.ownerEmail==='string'&&cfg.ownerEmail.length<=254&&/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/.test(cfg.ownerEmail)&&Number.isInteger(cfg.clientLimit)&&cfg.clientLimit>=1&&cfg.clientLimit<=10&&Number.isInteger(cfg.windowSeconds)&&cfg.windowSeconds>=60&&cfg.windowSeconds<=3600&&Number.isInteger(cfg.dailyLimit)&&cfg.dailyLimit>=1&&cfg.dailyLimit<=500}
function validate_(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return null;var out={};
 for(var key in LIMITS_){var raw=input[key]===undefined?'':input[key];if(typeof raw!=='string'||raw.length>LIMITS_[key]||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(raw)||(key!=='message'&&/[\r\n]/.test(raw)))return null;out[key]=raw.trim()}
 var digits=(out.phone.match(/\d/g)||[]).length;
 if(out.name.length<2||!/^\+?[0-9 ()-]+$/.test(out.phone)||digits<7||digits>15||!Object.prototype.hasOwnProperty.call(CATEGORIES_,out.category)||out.company||!/^\/[a-zA-Z0-9/_.-]*$/.test(out.sourcePath||'/'))return null;out.sourcePath=out.sourcePath||'/';return out;
}
function verify_(payload,signature,secret){if(typeof signature!=='string'||!/^[a-f0-9]{64}$/.test(signature))return false;var expected=hex_(Utilities.computeHmacSha256Signature(payload,secret,Utilities.Charset.UTF_8));var diff=expected.length^signature.length;for(var i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^signature.charCodeAt(i);return diff===0}
function hex_(bytes){return bytes.map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2)}).join('')}
function safeCell_(value){var text=String(value||'');return /^[\s]*[=+@-]/.test(text)?"'"+text:text}
function html_(value){return String(value||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function display_(value){var text=String(value||'');return text[0]==="'"?text.slice(1):text}
function timestamp_(){return Utilities.formatDate(new Date(),'Asia/Kolkata',"yyyy-MM-dd'T'HH:mm:ssXXX")}
function json_(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)}
function ensureHeaders_(sheet){if(sheet.getLastRow()===0){sheet.getRange(1,1,1,HEADERS_.length).setValues([HEADERS_]).setBackground('#152033').setFontColor('#ffffff').setFontWeight('bold');sheet.setFrozenRows(1)}else{var found=sheet.getRange(1,1,1,HEADERS_.length).getValues()[0];if(found.join('|')!==HEADERS_.join('|'))throw Error('Sheet header mismatch')}}
function findRequest_(sheet,id){if(sheet.getLastRow()<2)return 0;var match=sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).findNext();return match?match.getRow():0}

// Script Properties plus ScriptLock provide authoritative, persistent limits across API instances.
function consumeRate_(clientHash,phone,cfg,secret){
 var props=PropertiesService.getScriptProperties();var now=Date.now();var all=props.getProperties();
 for(var key in all)if(key.indexOf('rate:')===0){try{if(JSON.parse(all[key]).expires<=now)props.deleteProperty(key)}catch(error){props.deleteProperty(key)}}
 var phoneHash=hex_(Utilities.computeHmacSha256Signature('phone:'+phone.replace(/\D/g,''),secret,Utilities.Charset.UTF_8));
 var day=Utilities.formatDate(new Date(),'Asia/Kolkata','yyyy-MM-dd');
 var rules=[{key:'rate:client:'+clientHash,limit:cfg.clientLimit,seconds:cfg.windowSeconds},{key:'rate:phone:'+phoneHash,limit:cfg.clientLimit,seconds:cfg.windowSeconds},{key:'rate:day:'+day,limit:cfg.dailyLimit,seconds:86400}];
 var states=[];for(var i=0;i<rules.length;i++){var rule=rules[i];var saved=props.getProperty(rule.key);var state=saved?JSON.parse(saved):null;if(!state||state.expires<=now)state={count:0,expires:now+rule.seconds*1000};if(state.count>=rule.limit)return {ok:false,retryAfter:Math.max(1,Math.ceil((state.expires-now)/1000))};states.push(state)}
 for(var j=0;j<rules.length;j++){states[j].count++;props.setProperty(rules[j].key,JSON.stringify(states[j]))}return {ok:true};
}

function mailContent_(row,sheetUrl){
 var fields=[['Reference',row[1]],['Received (IST)',row[2]],['Customer',display_(row[3])],['Phone',display_(row[4])],['Fabric category',display_(row[5])],['Product',display_(row[6])||'Please advise'],['Colour',display_(row[7])||'Please advise'],['Quantity',display_(row[8])||'Please advise'],['Requirement',display_(row[9])||'No additional message'],['Website page',display_(row[10])]];
 var lines=fields.map(function(pair){return pair[0]+': '+pair[1]});
 var rows=fields.map(function(pair){return '<tr><th align="left" valign="top" style="padding:12px 16px;border-bottom:1px solid #dce3ed;width:150px;color:#586579;font-weight:500">'+html_(pair[0])+'</th><td style="padding:12px 16px;border-bottom:1px solid #dce3ed;color:#152033;white-space:pre-wrap;word-break:break-word">'+html_(pair[1])+'</td></tr>'}).join('');
 return {subject:'New quotation request | '+row[1],body:'R.G. TRADERS\nNew fabric quotation request\n\n'+lines.join('\n')+'\n\nReview this enquiry and contact the customer to confirm price, stock and delivery terms.\nView the enquiry sheet: '+sheetUrl+'\n\nR.G. Traders | Tiruppur\n+91 98439 99828',htmlBody:'<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#152033"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="600" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #dce3ed;border-radius:12px;overflow:hidden"><tr><td style="background:#152033;color:#ffffff;padding:24px 28px;font-size:18px;font-weight:bold">R.G. TRADERS</td></tr><tr><td style="padding:28px"><h1 style="font-size:24px;line-height:1.3;margin:0 0 12px">New fabric quotation request</h1><p style="font-size:14px;color:#586579;line-height:1.6;margin:0 0 24px">A customer has submitted the following requirement through the website.</p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">'+rows+'</table><p style="font-size:14px;line-height:1.7;margin:24px 0">Please contact the customer to confirm availability, specifications, pricing and delivery terms.</p><a href="'+html_(sheetUrl)+'" style="display:inline-block;padding:13px 20px;background:#2458d3;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold">View enquiry sheet</a><p style="font-size:12px;color:#586579;line-height:1.7;margin:28px 0 0">R.G. Traders · Tiruppur<br>+91 98439 99828<br>This is a quotation request; no price or order has been confirmed.</p></td></tr></table></td></tr></table></body></html>'};
}
function notify_(sheet,rowIndex,row,sheetId){
 var status='Sent';var error='';try{if(MailApp.getRemainingDailyQuota()<1)throw Error('quota');var mail=mailContent_(row,'https://docs.google.com/spreadsheets/d/'+sheetId+'/edit#gid='+sheet.getSheetId());MailApp.sendEmail({to:row[14],name:'R.G. Traders Enquiries',subject:mail.subject,body:mail.body,htmlBody:mail.htmlBody})}catch(e){status=Number(row[12])>=5?'Failed':'Pending';error='Notification unavailable or mail quota exhausted.'}
 var lock=LockService.getScriptLock();if(lock.tryLock(5000)){try{sheet.getRange(rowIndex,12).setValue(status);sheet.getRange(rowIndex,14).setValue(error);sheet.getRange(rowIndex,17).setValue(timestamp_());SpreadsheetApp.flush()}finally{lock.releaseLock()}}return status;
}

// Run manually once to grant Sheets and Mail permissions; it does not send a message.
function authorizeServices(){SpreadsheetApp.getActiveSpreadsheet();MailApp.getRemainingDailyQuota()}
// Optional: run once after the first successful enquiry to install a retry trigger.
function installNotificationRetry(){if(!PropertiesService.getScriptProperties().getProperty('ACTIVE_SHEET_ID'))throw Error('Submit one enquiry first.');if(!ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()==='retryPendingNotifications'}))ScriptApp.newTrigger('retryPendingNotifications').timeBased().everyMinutes(10).create()}
function retryPendingNotifications(){
 var props=PropertiesService.getScriptProperties();var id=props.getProperty('ACTIVE_SHEET_ID');var tab=props.getProperty('ACTIVE_SHEET_TAB');if(!id||!tab)return;var sheet=SpreadsheetApp.openById(id).getSheetByName(tab);if(!sheet)return;
 var attempts=0;for(var i=2;i<=sheet.getLastRow()&&attempts<10&&MailApp.getRemainingDailyQuota()>0;i++){
  var lock=LockService.getScriptLock();if(!lock.tryLock(5000))return;var row;
  try{row=sheet.getRange(i,1,1,HEADERS_.length).getValues()[0];var stale=row[11]==='Sending'&&Date.now()-new Date(row[16]).getTime()>600000;if((row[11]!=='Pending'&&!stale)||Number(row[12])>=5){row=null}else{row[11]='Sending';row[12]=Number(row[12])+1;sheet.getRange(i,12,1,2).setValues([[row[11],row[12]]]);sheet.getRange(i,17).setValue(timestamp_());SpreadsheetApp.flush()}}finally{lock.releaseLock()}
  if(row){notify_(sheet,i,row,id);attempts++}
 }
}
