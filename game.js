import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x87bde8);
scene.fog=new THREE.FogExp2(0x87bde8,.0025);

const camera=new THREE.PerspectiveCamera(63,innerWidth/innerHeight,.1,800);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
document.body.appendChild(renderer.domElement);

const hemi=new THREE.HemisphereLight(0xbfe8ff,0x38552d,2.0);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1c7,3.0);
sun.position.set(-80,100,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
scene.add(sun);

const ground=new THREE.Mesh(new THREE.PlaneGeometry(700,900,50,50),
 new THREE.MeshStandardMaterial({color:0x4f7d3e,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

const road=new THREE.Mesh(new THREE.PlaneGeometry(12,850),
 new THREE.MeshStandardMaterial({color:0x2c3034,roughness:.96}));
road.rotation.x=-Math.PI/2;road.position.y=.025;road.receiveShadow=true;scene.add(road);

for(const x of [-5.25,5.25]){
 const e=new THREE.Mesh(new THREE.BoxGeometry(.14,.035,850),
 new THREE.MeshStandardMaterial({color:0xf2e7b0}));
 e.position.set(x,.06,0);scene.add(e);
}
for(let z=-420;z<430;z+=11){
 const m=new THREE.Mesh(new THREE.BoxGeometry(.16,.025,5.5),
 new THREE.MeshStandardMaterial({color:0xf0df8b}));
 m.position.set(0,.065,z);scene.add(m);
}

// Mountain range
for(let i=0;i<24;i++){
 const h=12+Math.random()*35,w=18+Math.random()*32;
 const m=new THREE.Mesh(new THREE.ConeGeometry(w,h,7),
 new THREE.MeshStandardMaterial({color:0x52685b,roughness:1}));
 m.position.set((Math.random()<.5?-1:1)*(38+Math.random()*90),h/2-1,-350+Math.random()*700);
 scene.add(m);
}

// Trees
function tree(x,z,s){
 const g=new THREE.Group();
 const t=new THREE.Mesh(new THREE.CylinderGeometry(.15*s,.26*s,1.8*s,8),
 new THREE.MeshStandardMaterial({color:0x5b3c25,roughness:1}));
 t.position.y=.9*s;g.add(t);
 for(let i=0;i<3;i++){
  const c=new THREE.Mesh(new THREE.ConeGeometry((1.15-i*.18)*s,1.65*s,9),
   new THREE.MeshStandardMaterial({color:i===0?0x1f592d:0x286b35,roughness:1}));
  c.position.y=(1.65+i*.62)*s;g.add(c);
 }
 g.position.set(x,0,z);g.castShadow=true;scene.add(g);
}
for(let z=-410;z<420;z+=10){
 tree(-8-Math.random()*13,z+Math.random()*6,.65+Math.random()*.8);
 tree(8+Math.random()*13,z+Math.random()*6,.65+Math.random()*.8);
}

// Houses and warehouses
function building(x,z,warehouse=false){
 const h=warehouse?4:2.8,w=warehouse?8:4.5,d=warehouse?7:4.5;
 const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),
  new THREE.MeshStandardMaterial({color:warehouse?0x72777a:0xb6a58f,roughness:.85}));
 b.position.set(x,h/2,z);b.castShadow=true;scene.add(b);
 if(!warehouse){
  const roof=new THREE.Mesh(new THREE.ConeGeometry(3.6,1.9,4),
   new THREE.MeshStandardMaterial({color:0x713c31,roughness:.8}));
  roof.rotation.y=Math.PI/4;roof.position.set(x,4.1,z);scene.add(roof);
 }
}
for(let z=-360;z<370;z+=55){building(-22-Math.random()*8,z);building(22+Math.random()*8,z+20)}
for(let z=-300;z<300;z+=100){building(-34,z,true);building(34,z+35,true)}

// Truck
const truck=new THREE.Group();
const red=new THREE.MeshStandardMaterial({color:0xb82025,metalness:.35,roughness:.3});
const dark=new THREE.MeshStandardMaterial({color:0x111519,metalness:.3,roughness:.6});
const glass=new THREE.MeshStandardMaterial({color:0x14394a,metalness:.35,roughness:.12});
const cab=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.82,2.25),red);
cab.position.set(0,1.55,.8);cab.castShadow=true;truck.add(cab);
const roof=new THREE.Mesh(new THREE.BoxGeometry(2.58,.25,2.3),dark);roof.position.set(0,2.48,.8);truck.add(roof);
const windshield=new THREE.Mesh(new THREE.BoxGeometry(1.9,.68,.04),glass);windshield.position.set(0,1.9,1.94);truck.add(windshield);
const trailer=new THREE.Mesh(new THREE.BoxGeometry(2.58,2.4,5.2),
 new THREE.MeshStandardMaterial({color:0xd7dadd,metalness:.2,roughness:.38}));
trailer.position.set(0,1.55,-2.45);trailer.castShadow=true;truck.add(trailer);
for(const x of [-1.1,1.1])for(const z of [1.35,-1.7,-3.35]){
 const w=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.34,24),dark);
 w.rotation.z=Math.PI/2;w.position.set(x,.55,z);w.castShadow=true;truck.add(w);
}
truck.position.set(0,0,45);scene.add(truck);

// AI traffic
const traffic=[];
function car(color,x,z,dir){
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.BoxGeometry(1.55,.7,3.2),
  new THREE.MeshStandardMaterial({color,metalness:.15,roughness:.5}));
 body.position.y=.55;g.add(body);
 const top=new THREE.Mesh(new THREE.BoxGeometry(1.25,.55,1.6),
  new THREE.MeshStandardMaterial({color:0x293b46,metalness:.2,roughness:.2}));
 top.position.set(0,1.05,-.1);g.add(top);
 g.position.set(x,0,z);g.userData.dir=dir;g.userData.speed=25+Math.random()*25;scene.add(g);traffic.push(g);
}
for(let i=0;i<9;i++){
 car([0x2e6bb3,0xd7a52c,0xeeeeee,0x4c8b55,0x8c3030][i%5],
    i%2?2.5:-2.5,-320+i*70,i%2?-1:1);
}

// Destination + fuel station
const destination=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,.08,32),
 new THREE.MeshStandardMaterial({color:0xffcf21,emissive:0x4b3100}));
destination.position.set(0,.08,-300);scene.add(destination);
const station=new THREE.Mesh(new THREE.BoxGeometry(8,3,6),
 new THREE.MeshStandardMaterial({color:0xe1e1e1,roughness:.7}));
station.position.set(20,1.5,-150);scene.add(station);
const sign=new THREE.Mesh(new THREE.BoxGeometry(5,2,.15),
 new THREE.MeshStandardMaterial({color:0xffe000,emissive:0x443300}));
sign.position.set(20,4,-150);scene.add(sign);

let speed=0,fuel=100,money=500,steer=0,gas=false,brake=false,done=false;
let night=0, cameraMode=0, last=performance.now();

const $=id=>document.getElementById(id);
function bind(id,on,off){
 const e=$(id);e.addEventListener("pointerdown",ev=>{ev.preventDefault();on()});
 ["pointerup","pointercancel","pointerleave"].forEach(t=>e.addEventListener(t,ev=>{ev.preventDefault();off()}));
}
bind("gas",()=>gas=true,()=>gas=false);bind("brake",()=>brake=true,()=>brake=false);
bind("left",()=>steer=-1,()=>{if(steer===-1)steer=0});
bind("right",()=>steer=1,()=>{if(steer===1)steer=0});
$("camera").addEventListener("click",()=>cameraMode=(cameraMode+1)%2);
addEventListener("keydown",e=>{
 if(e.key==="ArrowUp")gas=true;if(e.key==="ArrowDown")brake=true;
 if(e.key==="ArrowLeft")steer=-1;if(e.key==="ArrowRight")steer=1;
 if(e.key.toLowerCase()==="c")cameraMode=(cameraMode+1)%2;
});
addEventListener("keyup",e=>{
 if(e.key==="ArrowUp")gas=false;if(e.key==="ArrowDown")brake=false;
 if(e.key==="ArrowLeft"&&steer<0)steer=0;if(e.key==="ArrowRight"&&steer>0)steer=0;
});

function updateWeather(dt){
 night+=dt/180; if(night>1)night-=1;
 const a=night*Math.PI*2;
 const daylight=Math.max(.08,Math.sin(a)+.15);
 sun.intensity=.45+2.7*daylight;
 hemi.intensity=.35+1.7*daylight;
 scene.background.lerp(new THREE.Color(daylight<.3?0x17243a:0x87bde8),.012);
 scene.fog.color.copy(scene.background);
 $("clock").textContent=String(Math.floor((6+night*24)%24)).padStart(2,"0")+":00";
}

function update(dt){
 if(gas&&fuel>0)speed+=21*dt;else speed-=6*dt;
 if(brake)speed-=34*dt;
 speed=THREE.MathUtils.clamp(speed,0,105);
 if(speed>1){
  truck.rotation.y+=steer*.7*dt*(speed/60);
  const dir=new THREE.Vector3(0,0,-1).applyQuaternion(truck.quaternion);
  truck.position.addScaledVector(dir,speed*dt*.23);
  truck.position.x=THREE.MathUtils.clamp(truck.position.x,-4,4);
  fuel=Math.max(0,fuel-speed*dt*.0028);
 }
 for(const c of traffic){
  c.position.z += c.userData.dir*c.userData.speed*dt;
  if(c.position.z>truck.position.z+60)c.position.z-=650;
  if(c.position.z<truck.position.z-350)c.position.z+=650;
 }
 if(!done&&truck.position.distanceTo(destination.position)<5){
  done=true;money+=750;$("mission").textContent="✅ تم تسليم الشحنة! +$750";
 }
 if(truck.position.distanceTo(station.position)<9&&fuel<100&&brake){
  fuel=Math.min(100,fuel+18*dt);
  $("mission").textContent="⛽ جاري تعبئة الوقود...";
 }
 $("speed").textContent=Math.round(speed);$("fuel").textContent=Math.round(fuel);$("money").textContent=money;
 updateWeather(dt);
 const offset=cameraMode===0?new THREE.Vector3(0,4.2,9):new THREE.Vector3(0,2.5,2.2);
 const target=offset.applyQuaternion(truck.quaternion).add(truck.position);
 camera.position.lerp(target,1-Math.pow(.0007,dt));
 const look=cameraMode===0?new THREE.Vector3(truck.position.x,1.1,truck.position.z-4):new THREE.Vector3(truck.position.x,1.6,truck.position.z-8);
 camera.lookAt(look);
}

function animate(now){
 requestAnimationFrame(animate);const dt=Math.min(.05,(now-last)/1000);last=now;
 update(dt);renderer.render(scene,camera);
}
requestAnimationFrame(animate);
setTimeout(()=>{$("loading").style.display="none"},1300);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
