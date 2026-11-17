import test from 'node:test';
import assert from 'node:assert/strict';
import {transferPose,FACTORY_DURATION,factoryCycle} from '../src/factory-transfer.mjs';
test('the folder is picked up before travelling and released only at the archive',()=>{
 assert.equal(transferPose(10.8).grip,0);
 for(let t=12.4;t<=15.4;t+=.1){const p=transferPose(t);assert.equal(p.grip,1);assert.equal(p.deposit,0);assert.equal(p.z,2.83);}
 const end=transferPose(18.2);assert.equal(end.x,-3.2);assert.equal(end.deposit,1);assert.equal(end.reach,0);assert.equal(end.complete,true);
});
test('the carrier stays in the front aisle and never crosses the conveyor',()=>{
 for(let t=8.1;t<=FACTORY_DURATION;t+=.025){const p=transferPose(t);assert.ok(p.x>=-3.2&&p.x<=0);assert.ok(p.z>=2.7&&p.z<=2.91);assert.ok(Number.isFinite(p.rotation));}
});
test('replay returns the carrier and the same folder to their initial state',()=>{
 const initial=transferPose(0);transferPose(FACTORY_DURATION);assert.deepEqual(transferPose(0),initial);assert.equal(initial.grip,0);assert.equal(initial.deposit,0);assert.equal(transferPose(100).deposit,1);
 const end=transferPose(FACTORY_DURATION);assert.ok(Math.abs(end.x-initial.x)<1e-12);assert.equal(end.z,initial.z);assert.equal(end.rotation,initial.rotation);assert.equal(end.walking,0);
});

test('the loop advances through approval and begins the next dossier without a held state',()=>{
 assert.equal(factoryCycle(7.5).stage,3);assert.equal(factoryCycle(9).stage,4);
 assert.equal(factoryCycle(18.5).status,'archived');assert.equal(factoryCycle(22).status,'returning');
 assert.deepEqual(factoryCycle(FACTORY_DURATION),{time:0,cycle:1,stage:0,status:'processing'});
 assert.equal(factoryCycle(FACTORY_DURATION*2+.5).cycle,2);
 for(let t=0;t<FACTORY_DURATION*3;t+=.017){const s=factoryCycle(t);assert.ok(s.stage>=0&&s.stage<=4);assert.ok(s.time>=0&&s.time<FACTORY_DURATION);}
});

test('the return joins the next cycle without a position or rotation jump',()=>{
 const end=transferPose(FACTORY_DURATION-.001),start=transferPose(.001);
 for(const key of ['x','z','rotation','walking','reach','place'])assert.ok(Math.abs(end[key]-start[key])<.001,key);
 for(let t=18.2;t<FACTORY_DURATION;t+=.01){const a=transferPose(t),b=transferPose(t+.01);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<.02);assert.ok(Math.abs(a.rotation-b.rotation)<.04);}
});
