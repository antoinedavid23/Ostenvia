import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
const dir=fileURLToPath(new URL('../media-jobs/',import.meta.url));
const plan=JSON.parse(await fs.readFile(dir+'production-plan.json','utf8'));
for(const id of plan.ids){if(id==='invoices')continue;
 const file=dir+id+'-motion-request.json',job=JSON.parse(await fs.readFile(file,'utf8'));
 job.input.prompt+='\nIMPORTANT CONTINUITY: this is an already-loaded work-in-progress scene. Animate one selected work item only. Other stacks, shelves, props and architecture stay stationary. All motion has a plausible physical cause. Osties use small natural arm, eye, head and body actions, no robotic rocking. End with a clear calm completed state.';
 if(id==='deadlines')job.input.prompt+=' The indexing wheel rotates only one short segment and then stops. Never make a full revolution or return to intake.';
 if(id==='crm'||id==='social')job.input.prompt+=' Follow just one selected output branch; do not move all the cards at once.';
 if(id==='reviews')job.input.prompt+=' This is a follow-up invitation preparation, not a customer testimonial. An unlettered envelope is checked and dispatched once. No stars, ratings or spoken praise.';
 await fs.writeFile(file,JSON.stringify(job,null,2));
}
const portrait=JSON.parse(await fs.readFile(dir+'portrait-upload.json','utf8')).data.downloadUrl;
await fs.writeFile(dir+'portrait-motion-request.json',JSON.stringify({model:'veo-3-1',input:{model:'veo3_lite',image_urls:[portrait],generation_type:'FIRST_AND_LAST_FRAMES_2_VIDEO',aspect_ratio:'16:9',resolution:'1080p',duration:6,prompt:'Animate this fictional carpenter portrait as a quiet natural documentary shot. Preserve exactly this same man, face, age, skin pores and imperfections, clothes, hands, workshop and light. Locked camera, no cut. He glances down at the workbench, gently adjusts one small wooden piece with his rough hands, then returns a relaxed attentive glance. Subtle natural breathing and one blink. Very small genuine human movements, not a posing model or lip-sync. No speech, no quotes, no testimonial, no on-screen text, no new objects or people. Six seconds, realistic and understated. This is illustrative footage of a fictional person.'}},null,2));
