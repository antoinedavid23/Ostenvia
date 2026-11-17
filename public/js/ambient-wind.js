const TAU=Math.PI*2;
const seed=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const wrap=(x,min,max)=>((x-min)%(max-min)+(max-min))%(max-min)+min;

function leafSprite(tint,soft=false){
 const tile=document.createElement('canvas');tile.width=tile.height=80;const c=tile.getContext('2d');
 const palette=[['#619064','#b7cc8b','#2f604b'],['#b6c99c','#dbe5c3','#779975'],['#789f80','#c0d3a1','#446e59']][tint];
 c.translate(7,8);const g=c.createLinearGradient(10,48,58,12);g.addColorStop(0,palette[0]);g.addColorStop(.5,palette[1]);g.addColorStop(1,palette[2]);
 c.beginPath();c.moveTo(7,50);c.bezierCurveTo(5,23,29,4,63,7);c.bezierCurveTo(60,36,43,57,7,50);c.fillStyle=g;c.fill();
 c.beginPath();c.moveTo(7,50);c.quadraticCurveTo(29,29,63,7);c.strokeStyle='rgba(247,248,230,.52)';c.lineWidth=1;c.stroke();
 c.beginPath();c.moveTo(22,38);c.quadraticCurveTo(18,30,21,21);c.moveTo(34,27);c.quadraticCurveTo(45,29,52,24);c.strokeStyle='rgba(246,249,227,.18)';c.lineWidth=.7;c.stroke();
 if(!soft)return tile;
 const blurred=document.createElement('canvas');blurred.width=blurred.height=80;const b=blurred.getContext('2d');b.filter='blur(1.8px)';b.drawImage(tile,0,0);return blurred;
}

function particleSprite(tint){
 const tile=document.createElement('canvas');tile.width=tile.height=32;const c=tile.getContext('2d');
 const rgb=[[93,124,87],[148,170,117],[182,190,148]][tint],g=c.createRadialGradient(16,16,0,16,16,15);
 g.addColorStop(0,`rgba(${rgb},1)`);g.addColorStop(.25,`rgba(${rgb},1)`);g.addColorStop(.6,`rgba(${rgb},.24)`);g.addColorStop(1,`rgba(${rgb},0)`);
 c.fillStyle=g;c.fillRect(0,0,32,32);return tile;
}

export function createAtmosphere(hero,panel){
 const background=document.createElement('div');background.className='wind-background';background.setAttribute('aria-hidden','true');
 const canvas=document.createElement('canvas'),curtain=document.createElement('canvas');background.append(canvas);document.body.append(background);curtain.className='entry-curtain';curtain.setAttribute('aria-hidden','true');panel.prepend(curtain);
 const ctx=canvas.getContext('2d',{alpha:true}),mask=curtain.getContext('2d',{alpha:true});
 if(!ctx||!mask){background.remove();curtain.remove();return null;}
 const sprites=[0,1,2].map(i=>[leafSprite(i),leafSprite(i,true)]),particleSprites=[0,1,2].map(particleSprite);
 let width=1,height=1,portalWidth=1,portalHeight=1,dpr=1,leaves=[],motes=[],disposed=false,lastPortal='',last={time:0,opacity:0,scroll:0};
 const wind={x:0,y:0,fromX:0,fromY:0,vx:0,vy:0,power:0,radius:180,lastMove:0,hits:0,peakHits:0};
 function moving(p,layer){
  p.px=p.x*(width+56)-28;p.py=p.y*(height+56)-28;p.homeX=p.px;p.homeY=p.py;p.layer=layer;
  const currents=[[31,-13],[-23,18],[17,25]][layer];p.flowX=currents[0];p.flowY=currents[1];p.vx=p.flowX;p.vy=p.flowY;
  p.angle=p.phase;p.spin=0;p.drawX=p.px;p.drawY=p.py;return p;
 }
 function spread(count,salt,create){
  // Jittered cells keep coverage even without drawing a visible regular grid.
  const rows=Math.max(1,Math.round(Math.sqrt(count*(height+56)/(width+56)))),points=[];let index=0;
  for(let row=0;row<rows;row++){
   const columns=Math.floor((row+1)*count/rows)-Math.floor(row*count/rows);
   for(let column=0;column<columns;column++,index++)points.push(create(index,(column+.2+seed(index+salt)*.6)/columns,(row+.2+seed(index+salt+187)*.6)/rows));
  }
  return points;
 }
 function resize(){
  dpr=Math.min(devicePixelRatio||1,1.5);width=document.documentElement.clientWidth;height=innerHeight;
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  portalWidth=panel.clientWidth;portalHeight=panel.clientHeight;curtain.width=Math.round(portalWidth*dpr);curtain.height=Math.round(portalHeight*dpr);mask.setTransform(dpr,0,0,dpr,0,0);lastPortal='';
  const count=Math.max(64,Math.min(260,Math.round(width*height/3200)));
  leaves=spread(count,8,(i,x,y)=>{const depth=.15+seed(i+2)*.85;return moving({x,y,depth,size:7+depth*depth*14,phase:seed(i+13)*TAU,tint:i%3,alpha:.1+depth*.22},0);});
  const particleCount=Math.max(260,Math.min(1150,Math.round(width*height/750)));
  motes=spread(particleCount,91,(i,x,y)=>{const depth=seed(i+107),near=i%7===0;return moving({foliage:i%8!==0,x,y,phase:seed(i+19)*TAU,depth,size:near?12+depth*6:5+depth*5,alpha:near?.25:.3+depth*.2,tint:i%3},1);});
  const detailCount=Math.max(120,Math.min(380,Math.round(width/2.5)));
  motes.push(...spread(detailCount,251,(i,x,y)=>{const depth=seed(i+207);return moving({foliage:i%8!==0,x,y,phase:seed(i+219)*TAU,depth,size:i%6===0?12+depth*5:5.5+depth*5,alpha:i%6===0?.33:.5+depth*.22,tint:i%3},2);}));
  wind.power=0;wind.lastMove=0;
  background.dataset.particles=String(motes.length);background.dataset.distribution='uniform';background.dataset.leaves=String(count+motes.filter(p=>p.foliage).length);
  draw(last);onResize?.();
 }
 function blow(x,y,vx,vy){
  const now=performance.now(),continuous=now-wind.lastMove<120;
  wind.fromX=continuous?wind.x:x;wind.fromY=continuous?wind.y:y;wind.x=x;wind.y=y;
  const speed=Math.hypot(vx,vy),limit=speed>1800?1800/speed:1;
  wind.vx=vx*limit;wind.vy=vy*limit;wind.power=Math.min(1,.12+speed/650);wind.radius=Math.min(245,170+speed*.045);wind.lastMove=now;
 }
 function advance(p,dt,t,scroll,settle,spinDamping){
  const flowX=p.flowX+Math.sin(t*.31+p.layer*2.1)*11,flowY=p.flowY+Math.cos(t*.26+p.layer*1.7)*9;
  p.homeX=wrap(p.homeX+flowX*dt,-28,width+28);p.homeY=wrap(p.homeY+flowY*dt,-28,height+28);
  // Moving anchors preserve coverage; displaced leaves settle back gradually after a gust.
  const dx=wrap(p.homeX-p.px,-(width+56)/2,(width+56)/2),dy=wrap(p.homeY-p.py,-(height+56)/2,(height+56)/2);
  const targetX=flowX+dx*.7+Math.sin(t*.6+p.phase)*7;
  const targetY=flowY+dy*.7+Math.cos(t*.51+p.phase)*7;
  p.vx+=(targetX-p.vx)*settle;p.vy+=(targetY-p.vy)*settle;
  const visibleY=wrap(p.py-scroll*(.004+p.depth*.012),-28,height+28);
  if(wind.power>.003){
   // A short swept segment keeps fast cursor gestures from skipping leaves.
   const sx=wind.x-wind.fromX,sy=wind.y-wind.fromY,length=sx*sx+sy*sy;
   const along=length?Math.max(0,Math.min(1,((p.px-wind.fromX)*sx+(visibleY-wind.fromY)*sy)/length)):0;
   const dx=p.px-(wind.fromX+sx*along),dy=visibleY-(wind.fromY+sy*along),distance=Math.hypot(dx,dy),radius=wind.radius*(.8+p.depth*.25);
   if(distance<radius){
    const falloff=(1-distance/radius)**2,force=falloff*wind.power*(.6+p.depth*.7),inv=1/Math.max(16,distance);
    if(force>.01)wind.hits++;
    p.vx+=(wind.vx*3.8+dx*inv*510-dy*inv*150)*force*dt;
    p.vy+=(wind.vy*3.8+dy*inv*510+dx*inv*150)*force*dt;
    p.spin+=(wind.vx*dy-wind.vy*dx)*inv*.009*force*dt;
   }
  }
  const speed=Math.hypot(p.vx,p.vy),maxSpeed=420+p.depth*160;if(speed>maxSpeed){p.vx*=maxSpeed/speed;p.vy*=maxSpeed/speed;}
  p.px=wrap(p.px+p.vx*dt,-28,width+28);p.py=wrap(p.py+p.vy*dt,-28,height+28);
  p.angle+=(.16*Math.sin(t*.7+p.phase)+p.spin)*dt;p.spin*=spinDamping;
  p.drawX=p.px;p.drawY=wrap(p.py-scroll*(.004+p.depth*.012),-28,height+28);
 }
 function draw(state){
  if(disposed)return false;last=state;ctx.clearRect(0,0,width,height);const{time=0,opacity=0,scroll=0,reduced=false,dt=0}=state;
  if(opacity<.001)return false;const t=reduced?0:time,step=reduced?0:Math.min(dt,1/30);
  wind.power*=Math.exp(-step*6);wind.hits=0;const settle=1-Math.exp(-step*.95),spinDamping=Math.exp(-step*2.2);
  for(const leaf of leaves){
   if(step)advance(leaf,step,t,scroll,settle,spinDamping);const px=leaf.drawX,py=leaf.drawY;
   const angle=leaf.angle,roll=Math.cos(t*.65+leaf.phase);
   ctx.save();ctx.globalAlpha=opacity*leaf.alpha;ctx.translate(px,py);ctx.rotate(angle);ctx.scale((Math.abs(roll)<.2?.2*Math.sign(roll||1):roll)*leaf.size/80,leaf.size/80);
   ctx.drawImage(sprites[leaf.tint][leaf.depth<.38?1:0],-40,-40);ctx.restore();
  }
  for(const p of motes){
   if(step)advance(p,step,t,scroll,settle,spinDamping);const px=p.drawX,py=p.drawY;
   ctx.globalAlpha=opacity*p.alpha;
   if(p.foliage){
    const angle=p.angle,roll=Math.cos(t*.55+p.phase),tilt=(Math.abs(roll)<.25?.25*Math.sign(roll||1):roll);
    ctx.save();ctx.translate(px,py);ctx.rotate(angle);ctx.scale(tilt,1);ctx.drawImage(sprites[p.tint][p.depth<.23?1:0],-p.size/2,-p.size/2,p.size,p.size);ctx.restore();
   }else ctx.drawImage(particleSprites[p.tint],px-p.size/2,py-p.size/2,p.size,p.size);
  }
  ctx.globalAlpha=1;wind.peakHits=Math.max(wind.peakHits,wind.hits);return true;
 }
 const ring=new Path2D('M0 -52C-30 -52 -50 -31 -50 0S-30 52 0 52 50 31 50 0 30 -52 0 -52ZM0 -32C-17 -32 -29 -19 -29 0S-17 32 0 32 29 19 29 0 17 -32 0 -32Z');
 const fold=new Path2D('M-56 50C-54 12 -21 -1 6 -20S32 -47 31 -57L61 53Z');
 function drawPortal({x,y,rx,ry,visible,ringScale=1,ringOpacity=0}){
  if(disposed)return;curtain.hidden=!visible;if(!visible)return;
  const key=[x,y,rx,ry,ringScale,ringOpacity,portalWidth,portalHeight].map(n=>Number(n).toFixed(3)).join('|');if(key===lastPortal)return;lastPortal=key;
  mask.clearRect(0,0,portalWidth,portalHeight);mask.fillStyle='#f7f7f2';mask.beginPath();mask.rect(0,0,portalWidth,portalHeight);
  if(rx>.05&&ry>.05){mask.moveTo(x+rx,y);mask.ellipse(x,y,rx,ry,0,0,TAU,true);}mask.fill('evenodd');
  if(ringOpacity>.001){
   mask.save();mask.globalAlpha=ringOpacity;mask.translate(x,y);mask.scale(ringScale,ringScale);mask.clip(ring,'evenodd');
   const green=mask.createLinearGradient(-50,-52,50,52);green.addColorStop(0,'#247158');green.addColorStop(.6,'#0f533f');green.addColorStop(1,'#003a2e');mask.fillStyle=green;mask.fillRect(-51,-53,102,106);mask.fillStyle='rgba(0,59,45,.45)';mask.fill(fold);mask.restore();
  }
 }
 let onResize=null;const observer=new ResizeObserver(resize);observer.observe(panel);resize();
 return{ready:Promise.resolve(),draw,drawPortal,blow,diagnostics(){return{stirred:wind.peakHits};},onResize(callback){onResize=callback;},dispose(){disposed=true;observer.disconnect();background.remove();curtain.remove();}};
}
