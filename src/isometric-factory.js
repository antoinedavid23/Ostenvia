import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {transferPose,FACTORY_DURATION} from './factory-transfer.mjs';

export function createFactory(host,{language='fr',onStage=()=>{},onComplete=()=>{},opaque=false,variant='quote',external=false,stationNames=null,showLabels=true,showPlinth=true}={}){
 if(!host)return null;
 const DURATION=FACTORY_DURATION,TAU=Math.PI*2,clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);},mix=THREE.MathUtils.lerp;
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{return null;}
 renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio||1,1.5),2));renderer.setClearColor(0xF7F7F2,opaque?1:0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label',language==='fr'?'Atelier Ostenvia : réception, analyse, préparation, validation humaine et envoi':'Atelier Ostenvia: ricezione, analisi, preparazione, approvazione e invio');host.append(renderer.domElement);host.classList.add('stage-3d');
 const scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);let angle=.78,zoom=1;
 const camera=new THREE.OrthographicCamera(-6,6,4,-4,.1,70),aim=new THREE.Vector3(.45,.45,.2);
 function cameraPose(){camera.position.set(12*Math.sin(angle),12.2,12*Math.cos(angle));camera.lookAt(aim);camera.zoom=zoom;camera.updateProjectionMatrix();}
 cameraPose();
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.035).texture;scene.environmentIntensity=.42;room.dispose();pmrem.dispose();scene.add(new THREE.HemisphereLight(0xFFFFFF,0x98AB91,1.55));
 const key=new THREE.DirectionalLight(0xFFFDF4,2.65);key.position.set(-4,9,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:25});key.shadow.bias=-.00025;key.shadow.normalBias=.025;key.shadow.radius=3;scene.add(key);const fill=new THREE.DirectionalLight(0xDAE6DE,1.25);fill.position.set(6,4,-6);scene.add(fill);
 const material=(color,roughness=.4,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const pine=material('#123B32',.64,.03),dark=material('#183C31',.66,.02),sage=material('#AFC78F',.72),cream=material('#F7F7F2',.72),white=material('#FFFFFF',.7),steel=material('#BBCBBC',.61,.12),wood=material('#B6CA9D',.75),ink=material('#17382F',.7),leaf=material('#709C43',.5);
 const lime=new THREE.MeshStandardMaterial({color:'#B9D580',emissive:'#94BA56',emissiveIntensity:.25,roughness:.3});const glass=new THREE.MeshPhysicalMaterial({color:'#C3DCC9',roughness:.12,metalness:.05,transparent:true,opacity:.32,depthWrite:false,clearcoat:1});
 const geometries=new Map(),textures=new Set(),labelDraws=[],lights=[],people=[],details={};
 function box(w,h,d,m,x=0,y=0,z=0,parent=root,r=.055){const k=[w,h,d,r].join(',');if(!geometries.has(k))geometries.set(k,new RoundedBoxGeometry(w,h,d,4,Math.min(r,w/3,h/3,d/3)));const o=new THREE.Mesh(geometries.get(k),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function sphere(r,m,x,y,z,parent=root){const o=new THREE.Mesh(new THREE.SphereGeometry(r,40,28),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
 function cylinder(r,h,m,x,y,z,parent=root){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function rod(a,b,r,m,parent=root){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,av.distanceTo(bv),12),m);o.position.copy(av.clone().add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());o.castShadow=true;parent.add(o);return o;}
 function group(x,y,z){const g=new THREE.Group();g.position.set(x,y,z);root.add(g);return g;}
 function led(x,y,z,parent,width=.25){const m=lime.clone();lights.push(m);return box(width,.035,.035,m,x,y,z,parent,.014);}
 function label(number,title,parent,x,y,z,width=1.45){if(!showLabels)return null;const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=220;const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.add(texture);
  const draw=()=>{ctx.clearRect(0,0,1024,220);ctx.fillStyle='#567847';ctx.font='600 103px Manrope,Arial';ctx.fillStyle='#123B32';let size=96;ctx.font='600 '+size+'px Manrope,Arial';while(ctx.measureText(title).width>925&&size>42){size-=2;ctx.font='600 '+size+'px Manrope,Arial';}ctx.fillText(title,45,145);texture.needsUpdate=true;};draw();labelDraws.push(draw);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,toneMapped:false}));sprite.position.set(x,y,z);sprite.scale.set(width,width*220/1024,1);parent.add(sprite);return sprite;
 }
 function sheet(m=white,parent=root,x=0,y=0,z=0,approved=false){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);box(.56,.035,.4,m,0,0,0,g,.016);box(.34,.007,.035,pine,-.04,.023,-.1,g,.004);for(let i=0;i<3;i++)box(.26-i*.035,.006,.012,sage,-.07,.024,-.02+i*.05,g,.002);if(approved){rod([.08,.033,.065],[.13,.033,.12],.014,leaf,g);rod([.13,.033,.12],[.235,.033,-.01],.014,leaf,g);}return g;}
 // A floating plinth and an open, continuous line between five different jobs.
 if(showPlinth){box(11.8,.22,7.6,dark,.5,-.065,.25,root,.14);box(11.85,.13,7.65,material('#E2E9D9',.67),.5,.075,.25,root,.12);box(11.6,.014,7.4,material('#ECF0E5',.72),.5,.147,.25,root,.1);}
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({color:0x2A4436,opacity:.12}));ground.rotation.x=-Math.PI/2;ground.position.y=showPlinth?-.185:.14;ground.receiveShadow=true;scene.add(ground);
 // Every station uses the same orthogonal grid. The only curved part is a
 // dedicated return connector, outside the machines; no diagonal crossings.
 const R=1.5,turnX=4.15,runLength=turnX+3.2,turnLength=Math.PI*R,totalLength=runLength+turnLength+turnX;
 const stationU=[0,3.2/totalLength,6.4/totalLength,(runLength+turnLength+turnX-3.2)/totalLength,1];
 const stops=[[-3.2,.94,-1.5],[0,.94,-1.5],[3.2,.94,-1.5],[3.2,.94,1.5],[0,.94,1.5]].map(p=>new THREE.Vector3(...p));
 const path={getPoint(u){const d=clamp(u)*totalLength;if(d<=runLength)return new THREE.Vector3(-3.2+d,.94,-R);if(d<=runLength+turnLength){const a=-Math.PI/2+(d-runLength)/R;return new THREE.Vector3(turnX+R*Math.cos(a),.94,R*Math.sin(a));}return new THREE.Vector3(turnX-(d-runLength-turnLength),.94,R);},getPointAt(u){return this.getPoint(u);},getTangent(u){const d=clamp(u)*totalLength;if(d<=runLength)return new THREE.Vector3(1,0,0);if(d<=runLength+turnLength){const a=-Math.PI/2+(d-runLength)/R;return new THREE.Vector3(-Math.sin(a),0,Math.cos(a));}return new THREE.Vector3(-1,0,0);},getTangentAt(u){return this.getTangent(u);}},N=180;
 function strip(width,y,m,depth=.08){const pos=[],indices=[];for(let i=0;i<=N;i++){const p=path.getPointAt(i/N),t=path.getTangentAt(i/N),nx=t.z,nz=-t.x;for(const [side,dy]of[[-1,0],[1,0],[-1,-depth],[1,-depth]])pos.push(p.x+nx*width/2*side,y+dy,p.z+nz*width/2*side);if(i<N){const a=i*4,b=a+4;indices.push(a,a+1,b,a+1,b+1,b,a+2,b+2,a+3,a+3,b+2,b+3,a,b,a+2,a+2,b,b+2,a+1,a+3,b+1,a+3,b+3,b+1);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);}
 strip(.75,.82,steel,.12);strip(.57,.92,dark,.075);
 const treadCount=100,treads=new THREE.InstancedMesh(new RoundedBoxGeometry(.51,.023,.13,2,.008),material('#668579',.38,.3),treadCount),dummy=new THREE.Object3D();treads.castShadow=true;treads.receiveShadow=true;root.add(treads);
 function rail(offset,y,m,r){const points=[];for(let i=0;i<=N;i++){const p=path.getPointAt(i/N),t=path.getTangentAt(i/N);points.push(new THREE.Vector3(p.x+t.z*offset,y,p.z-t.x*offset));}const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),N,r,8,false),m);mesh.castShadow=true;root.add(mesh);}
 rail(-.34,1.04,steel,.018);rail(.34,1.04,steel,.018);rail(.385,.81,lime,.012);for(let i=0;i<13;i++){const p=path.getPointAt((i+.2)/13);box(.09,.62,.09,pine,p.x,.47,p.z);box(.3,.045,.27,steel,p.x,.17,p.z,root,.018);}
 const names=stationNames|| (variant==='planning'?(language==='fr'?['Interventions','Contraintes','Créneaux','Votre accord','Agendas']:['Interventi','Vincoli','Orari','Il vostro sì','Agende']):(language==='fr'?['Demande','Références','Pré-devis','Votre accord','Document']:['Richiesta','Riferimenti','Preventivo','Il vostro sì','Documento']));const anchors=stops.map(p=>new THREE.Vector3(p.x,1.6,p.z));
 // Five separate plinths. Equal spacing and common deck heights make the
 // bridges read as connections between modules, rather than a belt laid over props.
 function cell(x,z){const g=group(x,.15,z);box(2.05,.12,1.85,steel,0,.06,0,g,.07);box(1.95,.12,1.75,cream,0,.17,0,g,.065);box(1.76,.39,1.52,pine,0,.405,0,g,.075);box(1.88,.08,1.62,cream,0,.64,0,g,.035);for(const sx of[-.67,.67])box(.16,.06,.17,dark,sx,-.003,.57,g,.02);led(.52,.43,.775,g,.22);return g;}
 const receive=cell(-3.2,-1.5);box(.88,.035,.66,sage,0,.69,0,receive,.02);box(.035,.14,.64,steel,-.44,.77,0,receive,.01);label('01',names[0],root,-3.2,.36,-.33,1.85);
 const terminal=group(-3.75,.15,-.91);box(.1,.7,.1,steel,0,.35,0,terminal,.02);box(.42,.34,.07,pine,0,.85,0,terminal,.035);box(.34,.25,.012,sage,0,.85,.044,terminal,.014);for(let i=0;i<3;i++)box(.23,.014,.012,cream,0,.92-i*.06,.055,terminal,.004);
 // The scanner opens along X, exactly aligned with the upper straight conveyor.
 const analysis=cell(0,-1.5);[-.59,.59].forEach(z=>box(.23,.85,.12,pine,0,1.1,z,analysis,.035));box(.48,.14,1.4,pine,0,1.56,0,analysis,.05);box(.5,.05,1.42,sage,0,1.66,0,analysis,.024);
 const scanHead=new THREE.Group();scanHead.position.set(0,1.19,0);analysis.add(scanHead);rod([0,.3,0],[0,.12,0],.035,steel,scanHead);box(.4,.29,.3,pine,0,0,0,scanHead,.075);box(.32,.18,.018,dark,0,.01,.157,scanHead,.05);[-.075,.075].forEach(x=>sphere(.03,lime,x,.025,.173,scanHead));box(.08,.01,.018,cream,0,-.05,.174,scanHead,.004);const antenna=sphere(.085,leaf,.04,.24,0,scanHead);antenna.scale.set(.4,1,.16);antenna.rotation.z=-.7;
 const scanBeam=box(.018,.012,.55,new THREE.MeshBasicMaterial({color:'#B9D580',transparent:true,opacity:.36,depthWrite:false}),0,.82,0,analysis,.001);led(0,1.57,.72,analysis,.3);label('02',names[1],root,0,.36,-.33,1.7);details.scanHead=scanHead;details.scanBeam=scanBeam;
 // Separate preparation module: open on the two X faces, glazed front and back.
 const printer=cell(3.2,-1.5);for(const x of[-.62,.62])for(const z of[-.61,.61])box(.08,.8,.08,pine,x,1.09,z,printer,.02);box(1.42,.12,1.38,pine,0,1.52,0,printer,.05);box(1.29,.045,1.25,white,0,1.605,0,printer,.024);for(const z of[-.61,.61])box(1.18,.58,.018,glass,0,1.15,z,printer,.006);details.printBar=box(.13,.07,1.05,steel,0,1.15,0,printer,.02);box(.68,.12,.035,dark,0,1.52,.707,printer,.017);led(0,1.52,.731,printer,.28);label('03',names[2],root,3.2,.36,-.33,2.02);
 // Validation runs straight across its own base. A desk sits alongside the
 // belt, with a real gap; the reviewer works from the front aisle.
 const validation=cell(3.2,1.5);label('04',names[3],root,3.2,.36,3.12,1.95);
 const desk=group(3.2,0,2.49);for(const x of[-.6,.6])for(const z of[-.26,.26])box(.065,.76,.065,pine,x,.52,z,desk,.016);box(1.58,.085,.82,wood,0,.94,0,desk,.05);box(1.5,.025,.74,material('#CEB490',.58),0,.995,0,desk,.027);box(.44,.025,.3,steel,-.34,1.02,-.05,desk,.012);const monitor=box(.46,.31,.03,pine,-.34,1.19,-.2,desk,.022);monitor.rotation.x=-.1;box(.39,.24,.012,sage,-.34,1.19,-.176,desk,.01);for(let i=0;i<3;i++)box(.25,.012,.008,cream,-.34,1.26-i*.055,-.168,desk,.002);cylinder(.055,.11,cream,.59,1.075,-.17,desk);cylinder(.04,.005,material('#705B44',.7),.59,1.132,-.17,desk);details.approval=led(.6,1.025,.24,desk,.14);
 // Output is visibly an endpoint, with a closed end stop and a confirmation.
 const output=cell(0,1.5);box(.92,.035,.69,sage,0,.69,0,output,.024);box(.035,.15,.69,steel,-.48,.78,0,output,.01);const check=new THREE.Group();output.add(check);check.position.set(-.3,1.03,-.49);const disk=cylinder(.23,.055,cream,0,0,0,check);disk.rotation.x=Math.PI/2;rod([-.11,-.01,.04],[-.025,-.095,.04],.026,leaf,check);rod([-.025,-.095,.04],[.14,.105,.04],.026,leaf,check);details.check=check;label('05',names[4],root,0,.36,3.35,1.6);
 // The planning workflow gains real additional stations: calendar/skills
 // inputs and an arbitration bay. Floor conduits remain orthogonal.
 const arbitration=[];let archiveBay=null;
 if(variant==='planning'){
  const dataStation=cell(-3.2,1.5);archiveBay=dataStation;for(const x of[-.4,.4]){box(.55,.43,.045,pine,x,1.05,0,dataStation,.03);box(.46,.34,.014,sage,x,1.05,.031,dataStation,.012);for(let i=0;i<3;i++)box(.32,.016,.008,cream,x,1.15-i*.08,.041,dataStation,.003);box(.04,.3,.04,steel,x,.75,0,dataStation,.01);}label('',language==='fr'?'Agendas et équipe':'Agende e team',root,-3.2,.36,2.67,2.04);
  for(const [a,b]of[[[-3.2,.18,1.5],[-1.65,.18,1.5]],[[-1.65,.18,1.5],[-1.65,.18,-1.5]],[[-1.65,.18,-1.5],[0,.18,-1.5]]])rod(a,b,.018,leaf);
  const pending=group(.3,.15,3.25);box(1.15,.34,.7,cream,0,.17,0,pending,.06);box(1.18,.05,.73,sage,0,.37,0,pending,.025);for(let i=0;i<2;i++)arbitration.push(sheet(cream,pending,-.22+i*.42,.43,.03));label('',language==='fr'?'À arbitrer':'Da esaminare',root,1.65,.36,3.25,1.7);
  for(const [a,b]of[[[3.2,.18,-1.5],[1.9,.18,-1.5]],[[1.9,.18,-1.5],[1.9,.18,3.25]],[[1.9,.18,3.25],[.3,.18,3.25]]])rod(a,b,.014,wood);
  printer.children.filter(o=>o.position.y>.72).forEach(o=>o.visible=false);box(1.34,.76,.04,glass,0,1.16,-.61,printer,.02);for(let row=0;row<3;row++)for(let col=0;col<4;col++)box(.22,.12,.025,(row+col)%3?lime:cream,-.45+col*.3,.94+row*.2,-.575,printer,.014);
 }
 // Additional input bays change with the selected workflow, within the same atelier.
 if(['records','inventory','control','quote'].includes(variant)){
  const bay=cell(-3.2,1.5);archiveBay=bay;
  if(variant==='records'||variant==='quote'){
   for(const x of[-.57,.57])box(.07,1.05,.58,pine,x,1.2,0,bay,.02);
   for(const y of[.76,1.18,1.65])box(1.25,.055,.64,cream,0,y,0,bay,.02);
   for(let row=1;row<2;row++)for(let i=0;i<5;i++){const file=box(.16,.29,.4,i%2?sage:cream,-.43+i*.21,.94+row*.43,0,bay,.012);file.rotation.z=(i-2)*.025;}
  }else if(variant==='inventory'){
   for(const x of[-.65,.65])box(.07,1.2,.65,steel,x,1.27,0,bay,.02);
   for(const y of[.76,1.25,1.82])box(1.4,.055,.72,cream,0,y,0,bay,.02);
   for(let row=0;row<2;row++)for(let i=0;i<3;i++)box(.32,.3,.44,i===1?sage:pine,-.45+i*.45,.94+row*.51,0,bay,.035);
  }else{
   for(const x of[-.43,.43]){box(.06,.4,.06,steel,x,.92,0,bay,.015);box(.68,.49,.06,pine,x,1.36,0,bay,.035);box(.57,.37,.015,sage,x,1.36,.04,bay,.018);for(let n=0;n<3;n++)box(.34,.014,.008,cream,x,1.45-n*.08,.051,bay,.002);}
  }
  const captions=language==='fr'?{records:'Dossiers',quote:'Dossiers',inventory:'Stock',control:'Vos outils'}:{records:'Fascicoli',quote:'Fascicoli',inventory:'Scorte',control:'I vostri strumenti'};
  label('',captions[variant],root,-3.2,1.95,1.5,1.95);
  rod([-3.2,.18,1.5],[-1.65,.18,1.5],.018,leaf);rod([-1.65,.18,1.5],[-1.65,.18,-1.5],.018,leaf);rod([-1.65,.18,-1.5],[0,.18,-1.5],.018,leaf);
 }
 // A front pickup shelf keeps the dossier within reach of the operator.
 box(.9,.055,.82,cream,0,.93,2.02,root,.025);
 for(const x of[-.44,.44])box(.035,.105,.82,pine,x,.99,2.02,root,.012);
 if(archiveBay){
  if(variant==='records'||variant==='quote'){
   for(const child of archiveBay.children)if(child.position.y>.7)child.position.z+=.55;
  }else{
   box(.92,.055,.5,cream,0,.79,.73,archiveBay,.02);
   for(const x of[-.45,.45])box(.035,.34,.5,pine,x,.97,.73,archiveBay,.012);
  }
  output.remove(check);archiveBay.add(check);check.position.set(.72,1.58,.65);
 }
 const archiveTarget=new THREE.Vector3(-3.2,1.105,2.24);
 anchors[4].set(-3.2,1.55,2.05);
 const workItem=new THREE.Group();root.add(workItem);const forms=[];
 const pdf=new THREE.Group();workItem.add(pdf);
 box(.62,.028,.8,pine,0,0,0,pdf,.012);
 box(.6,.012,.78,white,0,.02,0,pdf,.008);
 const pdfCanvas=document.createElement('canvas');pdfCanvas.width=512;pdfCanvas.height=640;
 const pdfContext=pdfCanvas.getContext('2d');pdfContext.fillStyle='#FFFFFF';pdfContext.fillRect(0,0,512,640);
 pdfContext.fillStyle='#123B32';pdfContext.fillRect(34,35,210,115);pdfContext.fillStyle='#F7F7F2';pdfContext.font='600 82px Manrope,Arial';pdfContext.fillText('PDF',58,122);
 pdfContext.fillStyle='#AFC78F';for(let i=0;i<6;i++)pdfContext.fillRect(40,210+i*52,390-i%3*38,13);
 const pdfTexture=new THREE.CanvasTexture(pdfCanvas);pdfTexture.colorSpace=THREE.SRGBColorSpace;textures.add(pdfTexture);
 const pdfFace=new THREE.Mesh(new THREE.PlaneGeometry(.6,.78),new THREE.MeshBasicMaterial({map:pdfTexture,toneMapped:false}));pdfFace.rotation.x=-Math.PI/2;pdfFace.position.y=.028;pdf.add(pdfFace);forms.push(pdf);
 const extracted=sheet(white,workItem);extracted.scale.set(1.1,1,1.65);forms.push(extracted);
 function dossier(approved){
  const g=new THREE.Group();workItem.add(g);
  box(.65,.055,.32,pine,0,0,0,g,.018);box(.62,.016,.30,sage,0,.035,0,g,.012);
  box(.17,.025,.05,sage,-.16,.03,.16,g,.01);box(.54,.009,.25,white,.015,.05,-.008,g,.005);
  for(let i=0;i<3;i++)box(.3-i*.04,.004,.012,sage,-.06,.057,-.08+i*.045,g,.002);
  if(approved){rod([.13,.064,.03],[.18,.064,.08],.012,leaf,g);rod([.18,.064,.08],[.27,.064,-.04],.012,leaf,g);}
  return g;
 }
 forms.push(dossier(false),dossier(true));
 const previousDossier=forms[3].clone(true);root.add(previousDossier);previousDossier.position.copy(archiveTarget);previousDossier.rotation.set(-Math.PI/2,-Math.PI,0,'YXZ');previousDossier.visible=false;
 const handA=new THREE.Vector3(),handB=new THREE.Vector3(),carryPosition=new THREE.Vector3();
 function animateTransfer(t,idle){
  const phase=t<3.1?'pdf':t<4.7?'extracted':t<10.6?'folder':null;
  if(phase&&host.dataset.parcelPhase!==phase)host.dataset.parcelPhase=phase;
  if(t<8.1)return;
  const pose=transferPose(t),carrier=people[4],gait=Math.sin(t*14)*pose.walking;
  carrier.g.position.set(pose.x,.15+Math.abs(gait)*.012+Math.sin(idle*1.8+4)*.006,pose.z);
  carrier.g.rotation.y=pose.rotation;
  carrier.legs[0].rotation.x=gait*.4;carrier.legs[1].rotation.x=-gait*.4;
  for(const {shoulder,elbow}of carrier.arms){
   shoulder.position.y=.7+.04*pose.place;shoulder.position.z=.10*pose.reach+.02*pose.place;
   shoulder.rotation.x=(-1.05*pose.reach-.3*pose.place);
   elbow.rotation.x=-.8*pose.reach-.5*pose.place;
  }
  if(t<10.6)return;
  workItem.position.set(0,.995,mix(1.5,2.15,ease((t-10.6)/.55)));
  workItem.rotation.set(0,mix(-Math.PI/2,-Math.PI,ease((t-10.6)/.55)),0,'YXZ');
  if(t>=11.45){
   root.updateMatrixWorld(true);
   carrier.arms[0].hand.getWorldPosition(handA);carrier.arms[1].hand.getWorldPosition(handB);
   carryPosition.copy(handA).add(handB).multiplyScalar(.5);root.worldToLocal(carryPosition);
   carryPosition.x+=Math.sin(pose.rotation)*.12;carryPosition.z+=Math.cos(pose.rotation)*.12;carryPosition.y+=.14;
   workItem.position.lerp(carryPosition,pose.grip).lerp(archiveTarget,pose.deposit);
   workItem.rotation.set(-Math.PI/2*pose.grip,mix(mix(-Math.PI,pose.rotation-TAU,pose.grip),-Math.PI,pose.deposit),0,'YXZ');
  }
  const parcelPhase=pose.complete?'archived':pose.deposit>0?'placing':pose.grip===1?'carrying':pose.grip>0?'pickup':'arriving';if(host.dataset.parcelPhase!==parcelPhase)host.dataset.parcelPhase=parcelPhase;
 }

 // Articulated, individual people rather than static figurines.
 function person(x,z,color,skin,female=false){
  const g=group(x,.15,z),suit=material('#9BB96F',.48),moss=material('#557C47',.5),belly=material('#E1DCB1',.64),face=material('#173D2D',.25),blush=material('#DDB49B',.6),legs=[],arms=[];
  [-.1,.1].forEach(side=>{const leg=new THREE.Group();leg.position.set(side,.27,0);g.add(leg);sphere(.082,moss,0,-.12,.025,leg).scale.set(.8,1.2,1.15);legs.push(leg);});
  const profile=new THREE.SplineCurve([[0,.27],[.2,.28],[.3,.4],[.325,.56],[.3,.72],[.255,.93],[.18,1.06],[.06,1.1],[0,1.1]].map(([r,y])=>new THREE.Vector2(r,y))).getPoints(36);for(const p of profile)p.x=Math.max(0,p.x);const body=new THREE.Mesh(new THREE.LatheGeometry(profile,64),suit);body.castShadow=true;body.receiveShadow=true;g.add(body);sphere(.235,belly,0,.53,.235,g).scale.set(1,1.08,.24);
  [-.105,.105].forEach(side=>{sphere(.092,white,side,.94,.23,g).scale.set(.9,1.12,.56);sphere(.049,face,side+.009,.938,.279,g).scale.set(.82,1.03,.4);sphere(.016,white,side-.006,.964,.3,g);sphere(.007,white,side+.026,.926,.3,g);sphere(.041,blush,side*1.95,.83,.205,g).scale.set(1,.5,.24);});
  const smile=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.06,.825,.276),new THREE.Vector3(0,.77,.295),new THREE.Vector3(.06,.825,.276));g.add(new THREE.Mesh(new THREE.TubeGeometry(smile,12,.009,6,false),face));
  rod([0,1.06,0],[.035,1.28,0],.019,moss,g);const sprout=sphere(.19,leaf,-.08,1.31,.01,g);sprout.scale.set(1.45,.45,.13);sprout.rotation.z=.48;rod([.025,1.27,.035],[-.26,1.24,.035],.008,sage,g);
  [-1,1].forEach(side=>{const shoulder=new THREE.Group();shoulder.position.set(side*.26,.7,0);g.add(shoulder);rod([0,0,0],[side*.02,-.13,0],.065,moss,shoulder);const elbow=new THREE.Group();elbow.position.set(side*.02,-.13,0);shoulder.add(elbow);rod([0,0,0],[0,-.12,.015],.047,moss,elbow);const hand=sphere(.056,moss,0,-.135,.02,elbow);arms.push({shoulder,elbow,hand});});g.scale.setScalar(1.14);people.push({g,legs,arms});
 }

 person(-4.3,-1.05,'#315F48','#D6A383');person(-.55,-2.75,'#93AD7A','#B57B58',true);person(2.8,-2.75,'#D8D5BF','#9B6949');person(3.25,3.25,'#BFA88A','#E0B292',true);person(-.8,2.9,'#668B65','#8B5E40');
 const tracks=[[[0,-4.3,-1.05,1.57],[.8,-4.3,-1.05,1.57],[2.2,-4.3,-.35,1.57],[4,-4.3,-.35,1.57],[5.2,-4.3,-1.05,1.57],[12,-4.3,-1.05,1.57]],[[0,-.55,-2.75,0],[1.6,-.55,-2.75,0],[2.4,-.2,-2.75,0],[4,-.2,-2.75,0],[5,-.55,-2.75,0],[12,-.55,-2.75,0]],[[0,2.8,-2.75,0],[3,2.8,-2.75,0],[4.3,3.15,-2.75,0],[5.8,3.15,-2.75,0],[7,2.8,-2.75,0],[12,2.8,-2.75,0]],[[0,3.25,3.25,3.14],[5.4,3.25,3.25,3.14],[6.7,3.17,3.22,3.14],[9.1,3.17,3.22,3.14],[10.4,3.25,3.25,3.14],[12,3.25,3.25,3.14]],[[0,-.8,2.9,0],[8.1,-.8,2.9,0],[9.7,-.65,2.6,3.14],[11.2,-.65,2.6,3.14],[12,-.8,2.9,3.14]]];
 function actors(t,idle=0){people.forEach(({g,legs,arms},i)=>{const keys=tracks[i];let a=keys[0],b=keys[1];for(let j=1;j<keys.length;j++)if(t<=keys[j][0]){a=keys[j-1];b=keys[j];break;}const u=clamp((t-a[0])/(b[0]-a[0])),v=ease(u),walking=Math.min(1,Math.hypot(b[1]-a[1],b[2]-a[2])*2)*Math.sin(Math.PI*u),gait=Math.sin(t*12+i)*walking;g.position.set(mix(a[1],b[1],v),.15+Math.abs(gait)*.012+Math.sin(idle*1.8+i)*.006,mix(a[2],b[2],v));g.rotation.y=a[3]+Math.atan2(Math.sin(b[3]-a[3]),Math.cos(b[3]-a[3]))*v;legs[0].rotation.x=gait*.35;legs[1].rotation.x=-gait*.35;const working=(i===3?t>6.8&&t<9.2:i===2?t>4&&t<6:i===1?t>2&&t<4:i===4?t>9.5&&t<11.4:false);arms.forEach(({shoulder,elbow},j)=>{shoulder.position.y=.7;shoulder.position.z=0;shoulder.rotation.x=working?-.65-.07*Math.sin(idle*5+j):gait*(j?.35:-.35);elbow.rotation.x=working?-.8:0;});});}
 function plant(x,z,s=1){cylinder(.18*s,.28*s,material('#C6BAA1',.7),x,.3,z);cylinder(.145*s,.01,material('#625B43',.9),x,.445,z);for(let i=0;i<5;i++){const a=i*2.4,px=x+Math.sin(a)*.15*s,pz=z+Math.cos(a)*.15*s;rod([x,.45,z],[px,.78+i*.035,pz],.009,leaf);const l=sphere(.085,i%2?sage:leaf,px,.8+i*.035,pz);l.scale.set(.6,1.9,.21);l.rotation.z=Math.sin(a)*.55;}}
 plant(-4.5,2.8,1.05);plant(4.6,3.1,.8);
 const sign=group(-2.65,.15,-3.05);[-1.08,1.08].forEach(x=>box(.055,1.05,.055,steel,x,.53,0,sign,.012));box(2.65,.66,.09,pine,0,1.12,0,sign,.055);const brandCanvas=document.createElement('canvas');brandCanvas.width=1536;brandCanvas.height=340;const brandCtx=brandCanvas.getContext('2d'),brandTexture=new THREE.CanvasTexture(brandCanvas);brandTexture.colorSpace=THREE.SRGBColorSpace;brandTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.add(brandTexture);brandCtx.fillStyle='#F7F7F2';brandCtx.fillRect(0,0,1536,340);const brandPlane=new THREE.Mesh(new THREE.PlaneGeometry(2.53,.55),new THREE.MeshStandardMaterial({map:brandTexture,roughness:.45}));brandPlane.position.set(0,1.12,.052);sign.add(brandPlane);
 const thresholds=[0,2.3,4.7,7.3,10.6,18.2],phaseAt=t=>{let phase=0;for(let i=1;i<thresholds.length;i++)if(t>=thresholds[i])phase=i;return phase;};const travel=[[0,0],[.8,0],[2.3,stationU[1]],[3.1,stationU[1]],[4.7,stationU[2]],[5.5,stationU[2]],[7.3,stationU[3]],[8.8,stationU[3]],[10.6,1],[12,1]];
 let current=0,playing=false,completed=false,frame=0,clock=0,lastPhase=-1,disposed=false,ambientClock=0,currentCycle=0;
 const brandImage=new Image();brandImage.onload=()=>{brandCtx.drawImage(brandImage,24,8,1488,324);brandTexture.needsUpdate=true;draw(current);};brandImage.src='/assets/logos/ostenvia-principal.svg';
 function draw(t,idle=ambientClock){if(disposed)return;ambientClock=idle;t=clamp(t,0,DURATION);const phase=phaseAt(t);previousDossier.visible=currentCycle>0&&t<17.4;workItem.scale.setScalar(t<.6?ease(t/.6):1);let a=travel[0],b=travel[1];for(let i=1;i<travel.length;i++)if(t<=travel[i][0]){a=travel[i-1];b=travel[i];break;}const u=mix(a[1],b[1],ease((t-a[0])/(b[0]-a[0]))),p=path.getPoint(u),tangent=path.getTangent(u);workItem.position.copy(p);workItem.position.y=.995;workItem.rotation.set(0,Math.atan2(tangent.x,tangent.z),0,'YXZ');const held=ease((t-7.3)/.24)*(1-ease((t-8.6)/.2));workItem.position.lerp(new THREE.Vector3(3.35,1.04,2.52),held);workItem.rotation.y=mix(workItem.rotation.y,-.1,held);if(t>=10.6){workItem.position.set(0,.995,1.5);workItem.rotation.y=0;}forms.forEach((o,i)=>o.visible=i===(t<3.1?0:t<4.7?1:t<8.8?2:3));
  const run=idle*.11;for(let i=0;i<treadCount;i++){const at=(i/treadCount+run)%1,q=path.getPointAt(at),v=path.getTangentAt(at);dummy.position.set(q.x,.939,q.z);dummy.rotation.set(0,Math.atan2(v.x,v.z),0);dummy.updateMatrix();treads.setMatrixAt(i,dummy.matrix);}treads.instanceMatrix.needsUpdate=true;const scanning=t>2.3&&t<3.1;details.scanHead.position.y=1.19-(scanning?.16*Math.sin((t-2.3)/.8*Math.PI):0);details.scanBeam.visible=scanning;details.scanBeam.position.x=scanning?-.25+.5*(t-2.3)/.8:0;details.printBar.position.x=t>4.7&&t<5.5?.25*Math.sin((t-4.7)/.8*Math.PI*2):0;details.check.scale.setScalar(ease((t-18.2)/.4)*(1-ease((t-20.5)/.5)));lights.forEach((m,i)=>m.emissiveIntensity=i<=phase?.3:.025);details.approval.material.emissiveIntensity=.06+.44*ease((t-8.6)/.2)*(1-ease((t-21)/.5));actors(Math.min(t,12),idle);arbitration.forEach((o,i)=>{o.visible=t>=5.2;o.position.y=.43+Math.sin(idle*2+i)*.012;});animateTransfer(t,idle);root.updateMatrixWorld(true);if(!external)renderer.render(scene,camera);if(phase!==lastPhase){lastPhase=phase;onStage(phase);}if(t>=DURATION&&!completed){completed=true;onComplete();}
 }
 function resize(){
  const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight),aspect=w/h;
  renderer.setSize(w,h,false);cameraPose();camera.updateMatrixWorld();root.updateMatrixWorld(true);
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  const point=new THREE.Vector3(),scale=new THREE.Vector3();
  function include(v){minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}
  root.traverseVisible(object=>{
   if(object.isSprite){
    object.getWorldPosition(point).applyMatrix4(camera.matrixWorldInverse);object.getWorldScale(scale);
    include(new THREE.Vector3(point.x-scale.x/2,point.y-scale.y/2,0));include(new THREE.Vector3(point.x+scale.x/2,point.y+scale.y/2,0));
   }else if(object.isMesh){
    if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();const b=object.geometry.boundingBox;
    for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z])include(point.set(x,y,z).applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse));
   }
  });
  const extent=Math.max((maxY-minY)/2,(maxX-minX)/2/aspect)*1.025,cx=(minX+maxX)/2,cy=(minY+maxY)/2;
  camera.left=cx-extent*aspect;camera.right=cx+extent*aspect;camera.top=cy+extent;camera.bottom=cy-extent;
  cameraPose();draw(current);
 }

 function tick(now){if(!playing||disposed)return;current=Math.min(DURATION,(now-clock)/1000);draw(current);if(current<DURATION)frame=requestAnimationFrame(tick);else playing=false;}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();window.document.fonts?.ready.then(()=>{if(!disposed){labelDraws.forEach(fn=>fn());draw(current);}});
 return {root,duration:DURATION,renderAt(seconds,{zoom:z=1,angleOffset=0,ambientTime=ambientClock,cycle=0}={}){currentCycle=cycle;playing=false;cancelAnimationFrame(frame);current=clamp(seconds,0,DURATION);angle=.78+angleOffset;zoom=z;cameraPose();draw(current,ambientTime);},play(){if(current>=DURATION)return;playing=true;clock=performance.now()-current*1000;cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);},pause(){playing=false;cancelAnimationFrame(frame);},restart(){current=0;completed=false;lastPhase=-1;draw(0);this.play();},get time(){return current;},get stage(){return phaseAt(current);},get paused(){return !playing;},get finished(){return current>=DURATION;},project(index){const v=anchors[Math.min(index,4)].clone();v.y+=.45;v.project(camera);return{x:(v.x+1)/2,y:(1-v.y)/2};},dispose(){disposed=true;playing=false;cancelAnimationFrame(frame);observer.disconnect();brandImage.onload=null;const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>ms.add(m));});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());scene.environment?.dispose();renderer.dispose();renderer.domElement.remove();}};
}
