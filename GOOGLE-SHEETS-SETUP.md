# Google Sheets enquiries and owner email setup

The UI, server-side bridge and Google Apps Script are implemented. Fill the ignored `.env` file when ready. **No live Google Sheet or Gmail connection has been made yet.** Blank `NEXT_PUBLIC_ENQUIRY_API_URL` keeps the website in clearly labelled WhatsApp mode; it never claims a WhatsApp enquiry was saved to Sheets.

## How it works

Website form → your private-configured API bridge → signed Apps Script request → Google Sheet → owner notification email.

The existing Next.js website is a static export. A static host cannot keep secrets or execute a POST API, so run the included API on your chosen server. The browser calls the bridge URL, not Apps Script directly. No external API host has been selected or configured on your behalf, and no `.env` secrets have been uploaded.

## 1. Environment configuration

An ignored `.env` already exists with empty integration values and a generated private shared secret. `.env.example` is the shareable template. Do not commit or publish `.env`.

| Variable | Fill with | Visibility |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Final website origin, no trailing slash | Browser |
| `NEXT_PUBLIC_ENQUIRY_API_URL` | Your HTTPS API bridge URL ending `/api/enquiries`; leave blank until ready | Browser/build time |
| `GOOGLE_APPS_SCRIPT_URL` | Google web-app deployment URL ending `/exec` | Server only |
| `GOOGLE_SHEET_URL` | Full `https://docs.google.com/spreadsheets/d/…/edit` URL | Server only |
| `GOOGLE_SHEET_TAB` | A new/empty tab name; default `Enquiries` | Server only |
| `OWNER_NOTIFICATION_EMAIL` | One owner Gmail or Workspace email address | Server only |
| `ENQUIRY_SHARED_SECRET` | Generated in `.env`; copy the identical value into Apps Script Script Properties | Secret |
| `ALLOWED_ORIGINS` | Exact website origins, comma separated, no trailing slash | Server config |
| `ENQUIRY_CLIENT_LIMIT` | Accepted enquiries per client AND phone per window; default 3 | Server config |
| `ENQUIRY_WINDOW_SECONDS` | Window length; default 900 (15 minutes) | Server config |
| `ENQUIRY_DAILY_LIMIT` | Whole-script accepted enquiry cap per IST calendar day; default 60 | Server config |
| `ENQUIRY_API_HOST` / `ENQUIRY_API_PORT` | Local Node listener; default `127.0.0.1:8787` | Local config |

Only `NEXT_PUBLIC_*` variables belong in the browser. Never add that prefix to the Google URL, sheet URL, owner email or shared secret. Your API host must receive its server variables through its private environment configuration when you deploy it; local `.env` is not automatically transferred anywhere.

## 2. Spreadsheet and Apps Script

1. Create a private Google Sheet owned by the Google account that should run this integration. Do not publish the enquiry sheet.
2. Open **Extensions → Apps Script** and replace `Code.gs` with the complete code at the end of this Markdown file. The same code is saved at `integrations/google-apps-script/Code.gs`.
3. In **Project Settings → Script Properties**, add `ENQUIRY_SHARED_SECRET` with the exact value from `.env`. Apps Script cannot read the website's `.env`, so this secret must match on both sides. Destination URLs and owner email stay in `.env` and travel only inside the signed server request.
4. Enable **Show appsscript.json manifest file**, and use the included manifest shown below. It specifies IST and the required Sheets/Mail/optional trigger scopes.
5. Run `authorizeServices` manually as the owner and complete Google's permission flow. This function does not send an email or create an enquiry.
6. **Deploy → New deployment → Web app**. Execute as **Me**, access **Anyone**, then deploy. Writes still require a valid server HMAC signature. If your Workspace administrator disallows this mode, use an approved authenticated integration rather than bypassing the policy.
7. Put the deployed **`/exec`** URL in `GOOGLE_APPS_SCRIPT_URL`; do not use `/dev`. Fill the Sheet URL and owner notification email in `.env`.
8. When changing Apps Script code, use **Manage deployments → Edit → New version → Deploy**. Saving the editor does not update the web-app deployment.

The first valid submission creates the tab and styled, frozen header row. Use a new/empty tab: a different existing header layout is rejected to avoid overwriting unrelated data.

### Columns, in exact order

`Request ID | Reference | Received at (IST) | Name | Phone | Fabric category | Product | Colour | Quantity | Message | Page | Email status | Email attempts | Last email error | Notification to | Payload hash | Updated at (IST)`

## 3. Run the API on your chosen host

Use Node.js 22+ or 24+:

```sh
npm run api:start
```

The API reads `.env` and listens on the configured host/port. Locally, use `http://127.0.0.1:8787/api/enquiries` as the public form URL and include the local frontend origin in `ALLOWED_ORIGINS`. Rebuild/restart the frontend after changing its public URL.

For production, deploy `server/serve.mjs` and its imports to your chosen Node host, configure its private environment variables, expose `/api/enquiries` through HTTPS, and set `ENQUIRY_API_HOST=0.0.0.0` only if that host requires it. No hosting account, secret-upload helper or external API deployment has been created automatically. Do not put `.env` in `public/` or `out/`.

The Node edge limiter is bounded and process-local (10 attempts/minute). It uses the socket address rather than trusting caller-supplied forwarding headers. Behind a reverse proxy, callers can share that proxy budget; configure an appropriate trusted-IP gateway on your chosen host. Persistent Google-side limits remain authoritative across Node instances and restarts.

An optional unconfigured Cloudflare Worker adapter is supplied as `server/worker.mjs` with `server/wrangler.jsonc`. Use it only if you choose Cloudflare as the API host and configure private settings there yourself. Its required rate-limit binding is approximately 10 requests/minute per client key per Cloudflare location; it fails closed when the binding is absent. This edge limit is separate from the global Google-side limits. No private values are included in Wrangler configuration.

## 4. Enable the website form

After the real API is ready, fill `NEXT_PUBLIC_ENQUIRY_API_URL` with its HTTPS `/api/enquiries` URL and rebuild:

```sh
npm run typecheck
npm run test:enquiry
npm run build
node scripts/audit-production.mjs
npm run audit:enquiry
```

Deploy the new static `out/` frontend through the existing hosting workflow. Public values are compiled at build time; editing `.env` or adding runtime variables to a static Site without rebuilding does not change the browser's API URL. A frontend CI build needs only the two public variables; private Google configuration belongs on the API host.

Blank `NEXT_PUBLIC_ENQUIRY_API_URL` retains the current WhatsApp workflow and an informational toast. It is explicitly not a Google Sheets submission. In API mode, a success toast appears only when the server confirms `saved: true` and a valid reference.

## 5. Validation, limits and submission states

- Name: 2–80 characters. Phone: up to 20 characters and 7–15 digits. Category: fixed options, max 40. Product: 160. Colour: 60. Quantity: 80. Message: 1,500. Page path: 200. Only the message accepts newlines.
- Browser, API and Apps Script validate independently. The API rejects malformed types/control characters, unknown categories, non-JSON POSTs and bodies over 8 KiB. A hidden honeypot must remain empty.
- Exact allowed origins receive CORS headers. Origin checks are not authentication; signed server requests protect the Google write endpoint. Fast per-client limits protect the API; persistent client/phone/window/day counters under Google ScriptLock protect the sheet and email budget.
- The button displays a spinner and `Sending enquiry…`, disables duplicate clicks, and preserves inputs on failure. Rate-limited responses return 429 and `Retry-After`; the button shows a cooldown.
- Unchanged retries reuse a request ID. Google checks ID plus payload hash under ScriptLock before appending. This prevents duplicate rows and normal duplicate emails. Editing the failed enquiry creates a new ID.
- A single global success toast includes the reference after confirmed storage. The form clears only on success. The toast is outside the slide-out panel, so closing the panel does not hide the confirmation.
- The server signs timestamp, destination configuration, normalized data and a pseudonymous client hash. Google rejects invalid signatures and timestamps outside five minutes. Raw IP addresses are not stored in the sheet/email.
- Formula-looking spreadsheet values are escaped. HTML email fields are escaped, and notification recipients come only from signed server configuration.

## 6. Email template and retries

The email contains a reference, time in IST, customer name/phone, category, product, colour, quantity, requirement and source page, plus a private sheet link. Plain-text and table-based HTML versions are included in `mailContent_`. The message asks Ragul to confirm stock, specifications, price and delivery. It does not invent a quote amount or confirm an order.

Notifications go only to `OWNER_NOTIFICATION_EMAIL` and are sent by the Google account that authorized Apps Script. Google saves the row before sending mail. A mail failure leaves `Pending` status while the customer's enquiry still succeeds; the toast confirms storage, not email delivery.

After the first saved enquiry, optionally run `installNotificationRetry` once. It creates a ten-minute trigger, retrying up to ten queued emails per run and five attempts per enquiry. `retryPendingNotifications` can also be run manually. Review `Failed` rows manually. Google mail quotas apply and the script checks remaining quota before sending.

MailApp does not provide transactional/idempotent email delivery. If sending succeeds but recording `Sent` fails, a later retry can duplicate the email. Sheet rows are still deduplicated; exactly-once email delivery is not claimed.

## 7. Activation checklist and troubleshooting

Once you fill real values, submit one labelled test enquiry and verify the row, notification email, single toast and reset. Test an invalid phone, over-limit message, rapid attempts and cooldown. If a request times out, retry unchanged data so its ID stays the same. A live Google write/email has not been tested by this implementation session because you chose to fill configuration later.

- 503 / `NOT_CONFIGURED`: missing or invalid Google URL, Sheet URL, owner email or secret on the API host.
- `UNAUTHORIZED`: API `.env` secret and Apps Script Script Property differ, or the wrong script version is deployed.
- 403: exact frontend origin missing from `ALLOWED_ORIGINS`.
- Google login HTML / 502: `/dev` URL used, web app not accessible to the signed bridge, or deployment URL wrong.
- Saved row with `Pending`: mail permissions or quota issue. Check Apps Script Executions, authorization and retry status.
- Header mismatch: use a new empty tab or restore the exact header row.

## Official references

[Web apps](https://developers.google.com/apps-script/guides/web), [ContentService redirects](https://developers.google.com/apps-script/guides/content), [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app), [LockService](https://developers.google.com/apps-script/reference/lock/lock-service), [Script Properties](https://developers.google.com/apps-script/guides/properties), [Google quotas](https://developers.google.com/apps-script/guides/services/quotas), [optional Worker rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

## Complete Apps Script (`Code.gs`)

Copy the complete block below. It matches `integrations/google-apps-script/Code.gs`.

```javascript
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

```

## Apps Script manifest

```json
{
  "timeZone": "Asia/Kolkata",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": ["https://www.googleapis.com/auth/spreadsheets","https://www.googleapis.com/auth/script.send_mail","https://www.googleapis.com/auth/script.scriptapp"]
}

```

## Environment template

```dotenv
# Public website settings. Only NEXT_PUBLIC_* values are bundled into browser code.
NEXT_PUBLIC_SITE_URL=https://rg-traders-fabric-studio.springynarwhal1.chatgpt.site
# Leave blank to retain WhatsApp mode. Fill the deployed bridge URL, then rebuild.
# Example shape: https://YOUR-API-HOST/api/enquiries (never paste an Apps Script URL here).
NEXT_PUBLIC_ENQUIRY_API_URL=

# Server only: fill these after deploying Code.gs as a Google web app.
GOOGLE_APPS_SCRIPT_URL=
GOOGLE_SHEET_URL=
GOOGLE_SHEET_TAB=Enquiries
OWNER_NOTIFICATION_EMAIL=
# Keep the same secret in Apps Script > Project Settings > Script Properties.
ENQUIRY_SHARED_SECRET=replace-with-at-least-32-random-characters

# Exact website origins allowed to call the API; comma separated, no trailing slash.
ALLOWED_ORIGINS=https://rg-traders-fabric-studio.springynarwhal1.chatgpt.site,http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:3101
ENQUIRY_CLIENT_LIMIT=3
ENQUIRY_WINDOW_SECONDS=900
ENQUIRY_DAILY_LIMIT=60
ENQUIRY_API_HOST=127.0.0.1
ENQUIRY_API_PORT=8787

```
