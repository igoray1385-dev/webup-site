import * as THREE from './vendor/three.module.js';
const container=document.querySelector('#scene');
const experience=document.querySelector('.experience');
const moveButton=document.querySelector('#move-button');
const isConstrainedDevice=matchMedia('(max-width: 760px)').matches||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||(navigator.deviceMemory&&navigator.deviceMemory<=4);
const quality=isConstrainedDevice?'lite':'full';
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{experience.classList.add('is-fallback');moveButton.hidden=true;}
if(renderer){
renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='lite'?1:1.25));renderer.shadowMap.enabled=quality==='full';renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
container.replaceChildren(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#8a9aaa');scene.fog=new THREE.FogExp2('#8a9aaa',.016);
const camera=new THREE.PerspectiveCamera(40,1,.1,220);
scene.add(new THREE.HemisphereLight(0xe4efff,0x47556a,1.25));
function light(color,intensity,x,y,z){const l=new THREE.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);return l;}
const sun=light(0xfff2de,3.1,-12,22,7);sun.castShadow=quality==='full';sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:70});sun.shadow.bias=-.0002;sun.shadow.normalBias=.04;
light(0xbcdfff,2.2,8,9,-10);
const envScene=new THREE.Scene();envScene.background=new THREE.Color('#99aabb');const envGeo=new THREE.BoxGeometry(1,1,1);
for(const [x,y,z,sx,sy,sz,power] of [[-6,7,0,3,12,9,4],[5,7,1,3,9,7,2],[0,12,-5,10,1,6,3]]){const m=new THREE.Mesh(envGeo,new THREE.MeshBasicMaterial({color:new THREE.Color(power,power,power)}));m.position.set(x,y,z);m.scale.set(sx,sy,sz);envScene.add(m);}
const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(envScene,.02);scene.environment=environment.texture;pmrem.dispose();envGeo.dispose();envScene.children.forEach(c=>c.material.dispose());
const mat=(color,metalness=.15,roughness=.45)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const ivory=mat('#dce5ec',.35,.22),blue=mat('#233747',.65,.26),gold=mat('#c9ae7d',.72,.2),dark=mat('#2d404e',.55,.33),tileLight=mat('#aab7c4',.28,.32),tileDark=mat('#526575',.35,.32),trim=mat('#bfccd3',.7,.21);
function mesh(geometry,material,parent,x=0,y=0,z=0){const obj=new THREE.Mesh(geometry,material);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
// Deterministic fractal height field: a real 3D landscape, not a background image.
function hash(x,z){const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);}
function noise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz;const u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iz),hash(ix+1,iz),u),THREE.MathUtils.lerp(hash(ix,iz+1),hash(ix+1,iz+1),u),v);}
function fbm(x,z){let a=.5,n=0;for(let i=0;i<5;i++){n+=noise(x,z)*a;x=x*2.03+8.7;z=z*2.03+2.3;a*=.5;}return n;}

// Layered local stone texture: broad strata plus fine grain, shared by landscape and island.
const textureSize=quality==='lite'?256:384;const rockCanvas=document.createElement('canvas');rockCanvas.width=textureSize;rockCanvas.height=textureSize;const rockContext=rockCanvas.getContext('2d');const pixels=rockContext.createImageData(textureSize,textureSize);
for(let y=0;y<textureSize;y++)for(let x=0;x<textureSize;x++){const i=(y*textureSize+x)*4;const n=fbm(x*.045,y*.045);const grain=hash(x,y);const value=Math.max(0,Math.min(255,65+n*150+(grain-.5)*42));pixels.data[i]=value;pixels.data[i+1]=value;pixels.data[i+2]=value;pixels.data[i+3]=255;}
rockContext.putImageData(pixels,0,0);const rockTexture=new THREE.CanvasTexture(rockCanvas);rockTexture.wrapS=rockTexture.wrapT=THREE.RepeatWrapping;rockTexture.repeat.set(5,3);
const rockMaterial=new THREE.MeshStandardMaterial({color:'#6c7e8d',roughness:1,metalness:0,map:rockTexture,bumpMap:rockTexture,bumpScale:.38});

const terrainSegments=quality==='lite'?100:150;const terrainGeo=new THREE.PlaneGeometry(180,180,terrainSegments,terrainSegments);terrainGeo.rotateX(-Math.PI/2);const tp=terrainGeo.attributes.position;const colors=[];
for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i),distance=Math.hypot(x,z);const ridge=Math.max(0,Math.min(1,(distance-12)/30));const h=-5.7+fbm(x*.065,z*.065)*4+ridge*(fbm(x*.035+12,z*.035)*34-5);tp.setY(i,h);const c=new THREE.Color().setRGB(.15+h*.007,.19+h*.007,.23+h*.007);colors.push(c.r,c.g,c.b);}
terrainGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));terrainGeo.computeVertexNormals();
const terrain=mesh(terrainGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0,bumpMap:rockTexture,bumpScale:.8}),scene);terrain.castShadow=false;
const world=new THREE.Group();world.position.x=2.2;scene.add(world);world.rotation.y=-.22;
// Irregular stone below the board, with crystalline edges and a clean top.
const stoneGeo=new THREE.CylinderGeometry(5.7,3.8,2.8,64,10);const sp=stoneGeo.attributes.position;
for(let i=0;i<sp.count;i++){const x=sp.getX(i),y=sp.getY(i),z=sp.getZ(i);const variation=(fbm(x*1.3+y,z*1.3)-.45)*2.8;sp.setXYZ(i,x*(1+variation*.16),y+(y<1.3?variation*.18:.02),z*(1+variation*.16));}stoneGeo.computeVertexNormals();mesh(stoneGeo,rockMaterial,world,0,-1.8,0);
const pebbleGeo=new THREE.IcosahedronGeometry(1,1);const stoneMat=rockMaterial;
for(let i=0;i<32;i++){const a=i*2.39996;const radius=6.2+hash(i,3)*5;const rock=mesh(pebbleGeo,stoneMat,scene,2.2+Math.cos(a)*radius,-4.1,Math.sin(a)*radius);rock.scale.set(.4+hash(i,1)*1.3,.35+hash(i,2)*1.5,.4+hash(i,5));rock.rotation.set(i*.5,i*.9,i*.7);}
const size=1.04,half=3.5*size,board=new THREE.Group();world.add(board);
mesh(new THREE.BoxGeometry(8.8,.3,8.8),dark,board,0,-.26,0);mesh(new THREE.BoxGeometry(8.88,.035,8.88),trim,board,0,-.09,0);mesh(new THREE.BoxGeometry(8.56,.12,8.56),dark,board,0,-.015,0);
const tiles=[];for(let x=0;x<8;x++)for(let z=0;z<8;z++){const tile=mesh(new THREE.BoxGeometry(size-.009,.07,size-.009),(x+z)%2?tileDark:tileLight,board,x*size-half,.06,z*size-half);tiles.push({tile,x,z});}
function lathe(profile,material,parent){return mesh(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),48),material,parent);}
function ball(radius,material,parent,x,y,z){return mesh(new THREE.SphereGeometry(radius,28,20),material,parent,x,y,z);}
function piece(type,material,x,z,scale=1){const group=new THREE.Group();group.position.set(x*size-half,.1,z*size-half);group.scale.setScalar(scale);world.add(group);lathe([[0,0],[.34,0],[.39,.06],[.4,.12],[.37,.2],[.31,.23],[.32,.29],[.29,.34],[.23,.38],[.18,.5],[.15,.7],[.14,.91],[.2,1],[.27,1.05],[.27,1.11],[.21,1.17]],material,group);
if(type==='pawn'){ball(.225,material,group,0,1.34,0);}else if(type==='rook'){lathe([[.2,1.13],[.29,1.2],[.3,1.47],[.19,1.48],[.18,1.24]],material,group);for(let i=0;i<6;i++){const a=i*Math.PI/3;const b=mesh(new THREE.BoxGeometry(.16,.19,.13),material,group,Math.sin(a)*.245,1.5,Math.cos(a)*.245);b.rotation.y=a;}}else if(type==='bishop'){lathe([[.14,1.15],[.22,1.23],[.25,1.36],[.21,1.51],[.1,1.7],[0,1.78]],material,group);ball(.055,material,group,0,1.79,0);}else if(type==='king'){lathe([[.17,1.15],[.21,1.27],[.22,1.48],[.3,1.54],[.29,1.62],[.16,1.66],[.12,1.78]],material,group);mesh(new THREE.BoxGeometry(.1,.43,.1),material,group,0,1.96,0);mesh(new THREE.BoxGeometry(.34,.1,.1),material,group,0,2.02,0);}else if(type==='queen'){lathe([[.18,1.14],[.14,1.32],[.2,1.53],[.34,1.77],[.35,1.84],[.23,1.86],[.2,1.6]],material,group);for(let i=0;i<8;i++){const a=i*Math.PI/4;ball(.055,material,group,Math.sin(a)*.32,1.87,Math.cos(a)*.32);}ball(.11,material,group,0,1.82,0);ball(.07,material,group,0,1.99,0);}return group;}
const pieces=[piece('king',blue,5,0,1.5),piece('rook',blue,0,0,1.3),piece('bishop',blue,2,1,1.2),piece('pawn',blue,6,2,.95),piece('pawn',blue,1,2,.95),piece('rook',ivory,7,6,1.2),piece('bishop',ivory,1,5,1.1),piece('pawn',ivory,2,6,.9),piece('pawn',ivory,5,5,.9),piece('king',ivory,4,7,1.3)];
const queen=piece('queen',gold,3,4,1.85);pieces.push(queen);
// Four monumental pieces turn the board into a place: they frame the camera path instead of reading as a flat backdrop.
const sentinels=[
  piece('rook',dark,-3,8,2.7),
  piece('bishop',ivory,10,7,2.35),
  piece('king',blue,9,-3,2.1),
  piece('queen',gold,-2,-3,2.05)
];
sentinels.forEach((sentinel,index)=>{sentinel.userData.baseY=.1;sentinel.userData.phase=index*Math.PI*.5;sentinel.rotation.y=index*.7;});
const halo=mesh(new THREE.RingGeometry(.69,.71,64),new THREE.MeshBasicMaterial({color:'#e7d2ae',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}),world,queen.position.x,.102,queen.position.z);halo.rotation.x=-Math.PI/2;halo.castShadow=false;
const dustCanvas=document.createElement('canvas');dustCanvas.width=dustCanvas.height=64;const dc=dustCanvas.getContext('2d'),glow=dc.createRadialGradient(32,32,0,32,32,32);glow.addColorStop(0,'#fff');glow.addColorStop(.22,'#dcebf4');glow.addColorStop(1,'#dcebf400');dc.fillStyle=glow;dc.fillRect(0,0,64,64);
const dustGeo=new THREE.BufferGeometry(),dust=[],dustColors=[];
const dustCount=quality==='lite'?420:760;for(let i=0;i<dustCount;i++){dust.push((hash(i,7)-.5)*65,hash(i,11)*23-2,(hash(i,17)-.5)*55);const c=new THREE.Color(i%7===0?'#e6cb9b':'#dbeaf3');dustColors.push(c.r,c.g,c.b);}
const dustBase=Float32Array.from(dust);dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));dustGeo.setAttribute('color',new THREE.Float32BufferAttribute(dustColors,3));
const dustPoints=new THREE.Points(dustGeo,new THREE.PointsMaterial({map:new THREE.CanvasTexture(dustCanvas),vertexColors:true,size:.18,transparent:true,opacity:.62,alphaTest:.02,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(dustPoints);
const portal=new THREE.Mesh(new THREE.TorusGeometry(6,.035,8,96),new THREE.MeshBasicMaterial({color:'#e3f4fd',transparent:true,opacity:0,depthWrite:false}));portal.position.set(2.2,2.5,-6);portal.rotation.x=.25;scene.add(portal);
const positions=[[3,4],[3,3],[5,3],[5,1],[3,3]];let move=0,busy=false,visible=true,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,pointerX=0,pointerY=0;
moveButton.disabled=false;moveButton.addEventListener('click',()=>{if(busy)return;move=(move+1)%positions.length;const [x,z]=positions[move],tx=x*size-half,tz=z*size-half;document.querySelector('#move-label').textContent='SUA MARCA / UM MOVIMENTO À FRENTE';if(window.gsap&&!paused){busy=true;moveButton.disabled=true;gsap.timeline({onComplete:()=>{busy=false;moveButton.disabled=false;render();}}).to(queen.position,{y:1.1,duration:.4,ease:'power2.out'}).to(queen.position,{x:tx,z:tz,duration:.85,ease:'power2.inOut'},.2).to(queen.position,{y:.1,duration:.5,ease:'power2.inOut'},.9);gsap.to(halo.position,{x:tx,z:tz,duration:1.2});}else{queen.position.set(tx,.1,tz);halo.position.set(tx,.102,tz);render();}});
const state={progress:0};let targetProgress=0,mobile=false;
const cameraPoints=[[13,6.5,19,-2,1,0],[9,5,11,-2.8,1.1,-.3],[-3,13,14,-2.8,.3,0],[-7,9,17,1.5,.2,0],[2,10,16,-.5,1,0],[11,6,14,-2,1,0],[4,5,10,-1,1,0]];
const mobilePoints=[[12,12,23,2.2,-3.2,0],[9,7,17,2.2,-2,0],[-1,17,20,2.2,-3,0],[7,14,25,2.2,-2,0],[6,12,22,2.2,-2,0],[11,9,22,2.2,-2,0],[4,7,17,2.2,-2,0]];
function updateCamera(){const p=THREE.MathUtils.clamp(state.progress,0,1)*6;const index=Math.min(5,Math.floor(p)),t=p-index;const nodes=mobile?mobilePoints:cameraPoints;const a=nodes[index],b=nodes[index+1];const vals=a.map((v,i)=>THREE.MathUtils.lerp(v,b[i],t));camera.position.set(vals[0]+(paused?0:pointerX),vals[1]+(paused?0:pointerY),vals[2]);camera.lookAt(vals[3],vals[4],vals[5]);scene.fog.density=.014+.018*Math.pow(Math.sin(Math.PI*p),6);world.rotation.y=-.22+state.progress*.44;portal.material.opacity=paused?0:Math.max(0,1-Math.abs(p-4)*.65)*.36;portal.rotation.z=state.progress*.9;}
function progress(){const r=experience.getBoundingClientRect();targetProgress=THREE.MathUtils.clamp(-r.top/Math.max(1,experience.offsetHeight-innerHeight),0,1);if(paused){state.progress=targetProgress;updateCamera();render();}}
if(window.gsap&&window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);gsap.to(state,{progress:1,ease:'none',scrollTrigger:{trigger:experience,start:'top top',end:'bottom bottom',scrub:.35,onUpdate:()=>{if(paused){updateCamera();render();}}}});}else{window.addEventListener('scroll',progress,{passive:true});}
window.addEventListener('pointermove',e=>{pointerX=(e.clientX/innerWidth-.5)*.65;pointerY=-(e.clientY/innerHeight-.5)*.3;},{passive:true});
window.addEventListener('webup:motion',e=>{paused=!e.detail;updateCamera();render();});
function render(){renderer.render(scene,camera);}
function resize(){const w=container.clientWidth,h=container.clientHeight;mobile=w<=760;camera.aspect=w/h;renderer.setSize(w,h);camera.updateProjectionMatrix();updateCamera();render();}
new ResizeObserver(resize).observe(container);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(container);
let last=0;const frameInterval=quality==='lite'?50:33;function animate(t){if(!visible||t-last<frameInterval||document.hidden)return;last=t;if(paused)return;if(!window.ScrollTrigger)state.progress+=(targetProgress-state.progress)*.06;updateCamera();const shatter=Math.pow(Math.sin(Math.PI*state.progress*6),10);for(const {tile,x,z} of tiles){tile.position.y=.06+(paused?0:shatter*(.3+hash(x,z)*2.1));tile.position.x=(x-3.5)*size+(paused?0:shatter*(x-3.5)*.12);}for(const sentinel of sentinels){const wave=Math.sin(t*.00042+sentinel.userData.phase+state.progress*7);sentinel.position.y=sentinel.userData.baseY+wave*.17;sentinel.rotation.y+=.0009;sentinel.rotation.z=Math.sin(t*.00025+sentinel.userData.phase)*.018;}const a=dustGeo.attributes.position;for(let i=0;i<a.count;i++){const j=i*3;a.array[j]=dustBase[j]+Math.sin(t*.00035+i*.57+state.progress*14)*.35;a.array[j+1]=dustBase[j+1]+Math.cos(t*.00022+i*.31)*.24;a.array[j+2]=dustBase[j+2]+Math.sin(t*.00026+i*.21)*.28;}a.needsUpdate=true;dustPoints.material.opacity=.38+.24*Math.pow(Math.sin(state.progress*6*Math.PI),2);render();}
resize();renderer.setAnimationLoop(animate);
container.addEventListener('webglcontextlost',e=>{e.preventDefault();experience.classList.add('is-fallback');moveButton.disabled=true;},false);
renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
}
