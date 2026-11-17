import {createHash} from 'node:crypto';
const startup="document.documentElement.classList.add('js');";
const hash=value=>`'sha256-${createHash('sha256').update(value).digest('base64')}'`;
export function securityHeaders({development=false}={}){
 const policy=["default-src 'self'","base-uri 'self'","object-src 'none'","frame-ancestors 'self'","form-action 'self'",`script-src 'self' ${hash(startup)} ${hash(startup+"document.documentElement.classList.add('has-entry');")} https://assets.calendly.com`,"style-src 'self' 'unsafe-inline' https://assets.calendly.com","img-src 'self' data: blob:","font-src 'self'","connect-src 'self'","frame-src https://calendly.com https://www.calendly.com","worker-src 'self' blob:","media-src 'self' blob:"];
 if(!development)policy.push('upgrade-insecure-requests');
 return {'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','X-Frame-Options':'SAMEORIGIN','Content-Security-Policy':policy.join('; '),...(!development?{'Strict-Transport-Security':'max-age=31536000'}:{})};
}
