import {handleEnquiry} from './enquiry-service.mjs';
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname!=='/api/enquiries')return new Response('Not found',{status:404});return handleEnquiry(request,env,{clientIp:request.headers.get('CF-Connecting-IP'),limiter:env.ENQUIRY_RATE_LIMITER})}};
