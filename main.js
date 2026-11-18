import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';
gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#ocean-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x061722, 0.018);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 160);
camera.position.set(0.4, 1.0, 12.5);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

scene.add(new THREE.HemisphereLight(0x9cecff, 0x06111b, 2.1));
const key = new THREE.DirectionalLight(0xc8f5ff, 3.2); key.position.set(-5, 8, 7); scene.add(key);
const rim = new THREE.DirectionalLight(0x168bff, 3.8); rim.position.set(5, 1, -6); scene.add(rim);
const fill = new THREE.PointLight(0x24c8ef, 90, 28); fill.position.set(2, 1, 5); scene.add(fill);

// Highly visible, custom-built 3D exploration craft (all geometry is real Three.js mesh geometry).
const craft = new THREE.Group(); scene.add(craft);
const titanium = new THREE.MeshStandardMaterial({ color: 0xb8cbd0, metalness: .88, roughness: .23 });
const darkTitanium = new THREE.MeshStandardMaterial({ color: 0x203b48, metalness: .82, roughness: .28 });
const glass = new THREE.MeshPhysicalMaterial({ color: 0x2ab9e8, metalness: .25, roughness: .06, transmission: .25, transparent: true, opacity: .88, clearcoat: 1, emissive: 0x063b58, emissiveIntensity: .65 });
const glowMat = new THREE.MeshBasicMaterial({ color: 0x8ceeff });
const orange = new THREE.MeshStandardMaterial({ color: 0xffb45e, metalness: .55, roughness: .32, emissive: 0x6a2600, emissiveIntensity: .35 });
function mesh(geo, mat, parent=craft, pos=[0,0,0], scale=[1,1,1], rot=[0,0,0]) { const m=new THREE.Mesh(geo,mat); m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rot); parent.add(m); return m; }
// Main pressure hull and tapered nose
mesh(new THREE.SphereGeometry(1,64,40), titanium, craft, [0,0,0], [2.65,.82,.9]);
mesh(new THREE.ConeGeometry(.78,1.45,48), titanium, craft, [2.78,0,0], [1,1,1], [0,0,-Math.PI/2]);
mesh(new THREE.SphereGeometry(.74,48,32), glass, craft, [2.2,.13,0], [.8,.72,.79]);
// Top command dome
mesh(new THREE.CylinderGeometry(.48,.58,.34,40), darkTitanium, craft, [-.45,.72,0]);
mesh(new THREE.SphereGeometry(.52,48,32), glass, craft, [-.45,1.02,0], [1,.66,.9]);
// Reinforcement bands around hull
for(let x=-1.85;x<=1.25;x+=.62){ const band=mesh(new THREE.TorusGeometry(.78,.045,12,64), darkTitanium, craft, [x,0,0]); band.rotation.y=Math.PI/2; band.scale.set(1,1,1.08); }
// Tail fins and stabilisers
mesh(new THREE.BoxGeometry(.95,.12,1.5), darkTitanium, craft, [-2.35,.72,0], [1,1,1], [0,0,-.22]);
mesh(new THREE.BoxGeometry(.85,.12,1.25), darkTitanium, craft, [-2.35,-.7,0], [1,1,1], [0,0,.22]);
mesh(new THREE.BoxGeometry(.95,1.25,.12), titanium, craft, [-2.35,0,0]);
// Side thruster pods
for(const side of [-1,1]){
  mesh(new THREE.CylinderGeometry(.28,.28,1.15,32), darkTitanium, craft, [-1.55,-.18,side*.92], [1,1,1], [Math.PI/2,0,0]);
  mesh(new THREE.TorusGeometry(.27,.055,12,40), orange, craft, [-1.55,-.18,side*1.5], [1,1,1], [Math.PI/2,0,0]);
  const lamp = new THREE.SpotLight(0x8ceeff, 75, 18, .38, .55, 1.4); lamp.position.set(2.5,-.22,side*.45); lamp.target.position.set(7,-1,side*1.3); craft.add(lamp,lamp.target);
}
// Visible circular portholes on both sides
for(const side of [-1,1]) for(let x=-1.15;x<=.85;x+=.67){
  const rimMesh=mesh(new THREE.TorusGeometry(.19,.055,12,36), titanium, craft, [x,.12,side*.86], [1,1,1], [Math.PI/2,0,0]);
  mesh(new THREE.CircleGeometry(.16,32), glowMat, craft, [x,.12,side*.91], [1,1,1], [Math.PI/2,0,0]);
}
// Rear propeller with blades
const propeller = new THREE.Group(); propeller.position.set(-3.15,0,0); craft.add(propeller);
mesh(new THREE.CylinderGeometry(.16,.16,.28,24), orange, propeller, [0,0,0], [1,1,1], [Math.PI/2,0,0]);
for(let i=0;i<5;i++){ const blade=mesh(new THREE.BoxGeometry(.13,1.05,.12), titanium, propeller, [0,0,0]); blade.rotation.z=i*Math.PI*2/5; }
// Branding-like electric blue light strips
for(const side of [-1,1]) mesh(new THREE.BoxGeometry(2.6,.035,.035), glowMat, craft, [0,-.53,side*.83]);
craft.position.set(1.15,-.28,-1.2);
craft.rotation.set(.04,-.18,-.035);
craft.scale.setScalar(1.12);

// Distant ocean floor and drifting particulate
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200,200), new THREE.MeshStandardMaterial({color:0x061b26, roughness:1, metalness:0}));
floor.rotation.x=-Math.PI/2; floor.position.set(0,-7,-35); scene.add(floor);
const count=2600, positions=new Float32Array(count*3);
for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*36;positions[i*3+1]=(Math.random()-.5)*20;positions[i*3+2]=(Math.random()-.5)*38-4;}
const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
const particles=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0x9cecff,size:.035,transparent:true,opacity:.8,sizeAttenuation:true}));scene.add(particles);
// Soft volumetric-style light rays
const rays=new THREE.Group();scene.add(rays);
for(let i=0;i<9;i++){const mat=new THREE.MeshBasicMaterial({color:0x63dfff,transparent:true,opacity:.045,side:THREE.DoubleSide,depthWrite:false});const ray=new THREE.Mesh(new THREE.PlaneGeometry(.65,19),mat);ray.position.set(-8+i*2,3,-10-i*.7);ray.rotation.z=-.13;rays.add(ray);}

let mx=0,my=0,progress=0;
addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;const el=document.querySelector('.cursor-glow');if(el){el.style.left=e.clientX+'px';el.style.top=e.clientY+'px';}});
const aim={x:.8,y:0,z:-1.2};
const journey=gsap.timeline({scrollTrigger:{trigger:'.hero',start:'top top',end:'+=220%',scrub:1,pin:true,anticipatePin:1,invalidateOnRefresh:true,onUpdate:s=>progress=s.progress}});
journey
 .to(camera.position,{x:-.2,y:.25,z:7.5,ease:'none'},0)
 .to(aim,{x:1.1,y:0,z:-1.2,ease:'none'},0)
 .to(craft.rotation,{y:-.58,z:.08,ease:'none'},.22)
 .to(camera.position,{x:3.2,y:.15,z:4.1,ease:'none'},.48)
 .to(aim,{x:1.0,y:0,z:-1.4,ease:'none'},.48)
 .to(craft.rotation,{y:.48,z:-.08,ease:'none'},.52)
 .to(camera.position,{x:-1.2,y:-.7,z:10.5,ease:'none'},.82)
 .to(aim,{x:0,y:0,z:-2,ease:'none'},.82)
 .to('.hero-copy',{y:-100,opacity:0,ease:'none'},.3)
 .to('.hero-topline,.hero-stats,.hero-side-note',{opacity:0,ease:'none'},.2);
gsap.to(propeller.rotation,{z:Math.PI*2,duration:2.2,repeat:-1,ease:'none'});
gsap.to(craft.position,{y:'+=.16',duration:3.4,yoyo:true,repeat:-1,ease:'sine.inOut'});
gsap.to(craft.rotation,{x:.09,duration:4,yoyo:true,repeat:-1,ease:'sine.inOut'});
gsap.to('.hero-title span',{y:0,opacity:1,duration:1.25,stagger:.16,ease:'power4.out',delay:.2});
gsap.from('.hero .eyebrow,.hero-bottom-copy',{y:22,opacity:0,duration:1,stagger:.2,ease:'power3.out',delay:.65});
gsap.utils.toArray('.reveal').forEach(el=>gsap.to(el,{y:0,opacity:1,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 82%'}}));
gsap.utils.toArray('.service-row').forEach((el,i)=>gsap.from(el,{x:-35,opacity:0,duration:.7,delay:i*.06,scrollTrigger:{trigger:el,start:'top 88%'}}));
gsap.to('.manifesto-content',{y:-90,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1}});
ScrollTrigger.create({trigger:document.body,start:0,end:'max',onUpdate:s=>{const bar=document.querySelector('.scroll-progress span');if(bar)bar.style.width=(s.progress*100)+'%';}});
function animate(t){requestAnimationFrame(animate);const time=t*.0002;particles.rotation.y=time*.055;particles.position.y=Math.sin(time)*.16;craft.rotation.z+=Math.sin(time*1.5)*.00003;camera.lookAt(aim.x+mx*.12*(1-progress),aim.y-my*.08*(1-progress),aim.z);renderer.render(scene,camera);} animate(0);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));ScrollTrigger.refresh();});
const menu=document.querySelector('.menu-toggle');if(menu)menu.addEventListener('click',()=>{let panel=document.querySelector('.mobile-panel');if(panel){panel.remove();return;}panel=document.createElement('div');panel.className='mobile-panel';panel.innerHTML='<a href="#about">ABOUT</a><a href="#services">CAPABILITIES</a><a href="#work">SELECTED WORK</a><a href="#contact">LET’S TALK ↗</a>';document.body.appendChild(panel);panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>panel.remove()));});
