import { isIP } from 'node:net';
import { createMemoryLimiter, handleEnquiry } from '../server/enquiry-service.mjs';

const limiter = createMemoryLimiter();

// Vercel overwrites x-real-ip at its edge. Do not trust x-forwarded-for.
// Apps Script also enforces persistent phone/IP/daily limits across instances.
export default {
  fetch(request) {
    const ip = request.headers.get('x-real-ip') || '';
    return handleEnquiry(request, process.env, {
      clientIp: process.env.VERCEL === '1' && isIP(ip) ? ip : undefined,
      limiter,
    });
  },
};
