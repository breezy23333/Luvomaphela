/* STAR RUNNER — a playable 3D space-survival demo based on the supplied game. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const $ = (id) => document.getElementById(id);
const ui = {
  canvas: $("game"), screen: $("screen"), title: $("overlayTitle"),
  description: $("overlayMessage"), start: $("startButton"), pause: $("pauseButton"),
  score: $("score"), best: $("best"), shields: $("shields"), speed: $("speed"),
  message: $("message")
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030914);
scene.fog = new THREE.FogExp2(0x030914, 0.007);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, .1, 650);
camera.position.set(0, 7.5, 21);
camera.lookAt(0, 0, -30);
const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: "high-performance"});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
ui.canvas.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x8da4ff, 1.55));
const sun = new THREE.DirectionalLight(0xc0eeff, 2.2);
sun.position.set(8, 18, 20);
scene.add(sun);
const sideLight = new THREE.PointLight(0x79f6f1, 115, 50);
sideLight.position.set(-12, 3, -5);
scene.add(sideLight);

// A procedural spacecraft: no downloads or textures required.
const ship = new THREE.Group();
const hull = new THREE.MeshStandardMaterial({color: 0x9aafcc, metalness: .88, roughness: .25});
const dark = new THREE.MeshStandardMaterial({color: 0x101e34, metalness: .6, roughness: .28});
const glow = new THREE.MeshStandardMaterial({color: 0x63fcda, emissive: 0x25dbbf, emissiveIntensity: 2.2, metalness: .4});
const cockpit = new THREE.MeshStandardMaterial({color: 0x0c3555, emissive: 0x0e7bd2, emissiveIntensity: .65, metalness: .65, roughness: .13});
const body = new THREE.Mesh(new THREE.CylinderGeometry(.15, .76, 4.1, 6), hull);
body.rotation.x = -Math.PI / 2;
ship.add(body);
const tip = new THREE.Mesh(new THREE.ConeGeometry(.39, 1.5, 6), hull);
tip.rotation.x = -Math.PI / 2;
tip.position.z = -2.55;
ship.add(tip);
const canopy = new THREE.Mesh(new THREE.SphereGeometry(.54, 14, 8), cockpit);
canopy.scale.set(.7, .4, 1.55);
canopy.position.set(0,.5,-.1);
ship.add(canopy);
for (const sign of [-1,1]) {
  const wing = new THREE.BufferGeometry();
  wing.setAttribute("position", new THREE.Float32BufferAttribute([
    sign * .45, 0, -1.15, sign * 3.8, 0, 1.55, sign * .55, 0, 1.8,
  ],3));
  wing.computeVertexNormals();
  const wingMesh = new THREE.Mesh(wing, new THREE.MeshStandardMaterial({color:0x9da6bf,metalness:.88,roughness:.26,side:THREE.DoubleSide}));
  ship.add(wingMesh);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(.23,.07,2.4), glow);
  stripe.position.set(sign*1.65,.1,.55);
  stripe.rotation.y = sign * .8;
  ship.add(stripe);
  const engine = new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.65,12),dark);
  engine.rotation.x = Math.PI / 2;
  engine.position.set(sign*.65, -.12, 1.7);
  ship.add(engine);
  const thruster = new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),glow);
  thruster.scale.z = 2;
  thruster.position.set(sign*.65,-.12,2.14);
  ship.add(thruster);
}
ship.position.set(0, 0, 3);
scene.add(ship);
const exhaustLight = new THREE.PointLight(0x5dffd9, 28, 13);
exhaustLight.position.set(0,0,5);
ship.add(exhaustLight);

// Starfield — actual points, unlike the flat dark planes in the original upload.
const STAR_COUNT = 1350;
const starPositions = new Float32Array(STAR_COUNT*3);
for (let i=0; i<STAR_COUNT; i++) {
  starPositions[i*3] = (Math.random()-.5)*190;
  starPositions[i*3+1] = (Math.random()-.5)*100;
  starPositions[i*3+2] = Math.random()*-340+30;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute("position",new THREE.BufferAttribute(starPositions,3));
const starMat = new THREE.PointsMaterial({color:0xa8dfff,size:.35,sizeAttenuation:true,transparent:true,opacity:.92});
const stars = new THREE.Points(starGeo,starMat);
scene.add(stars);
const rings=[];
for (let i=0;i<10;i++) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(19,.035,4,80),new THREE.MeshBasicMaterial({color:0x167a98,transparent:true,opacity:.23}));
  ring.position.z=-i*43-18;
  scene.add(ring);
  rings.push(ring);
}

const rockGeometry = new THREE.DodecahedronGeometry(1, 1);
const rockMaterial = new THREE.MeshStandardMaterial({color:0x707887,metalness:.25,roughness:.92,flatShading:true});
const rocks=[];
const bullets=[];
const bulletGeometry = new THREE.CapsuleGeometry(.12,1.35,4,8);
const bulletMaterial = new THREE.MeshBasicMaterial({color:0xbaff72});
const clock = new THREE.Clock();
const keys = new Set();
const touch = {left:false,right:false,fire:false};
let mode="intro", lives=3, score=0, best=0, distance=0, spawnTimer=0, shootTimer=0, invulnerability=0, time=0;
let flashTimer=null;
try {best=Number(localStorage.getItem("star-runner-best")||0)||0;} catch { /* Storage is optional. */ }

const formatScore = (n) => Math.floor(n).toString().padStart(5,"0");
function updateHUD(){
  ui.score.textContent=formatScore(score);
  ui.best.textContent=formatScore(Math.max(best,score));
  ui.shields.textContent="♥ ".repeat(lives).trim() || "—";
  ui.speed.textContent=(1+distance/4200).toFixed(1)+"×";
}
function banner(text){
  ui.message.textContent=text;
  ui.message.classList.add("show");
  clearTimeout(flashTimer);
  flashTimer=setTimeout(()=>ui.message.classList.remove("show"),550);
}
function showOverlay(title,description,buttonLabel){
  ui.title.textContent=title;
  ui.description.textContent=description;
  ui.start.innerHTML="";
  ui.start.append(document.createTextNode(buttonLabel+" "));
  const arrow=document.createElement("span");arrow.textContent="↗";ui.start.append(arrow);
  ui.screen.classList.remove("hidden");
}
function clearObjects(){
  for (const a of rocks) scene.remove(a.mesh);
  for (const b of bullets) scene.remove(b);
  rocks.length=0;bullets.length=0;
}
function reset(){
  clearObjects();
  lives=3;score=0;distance=0;spawnTimer=.9;shootTimer=0;invulnerability=0;time=0;
  ship.position.x=0;ship.visible=true;ship.rotation.set(0,0,0);
  rings.forEach((r,i)=>r.position.z=-i*43-18);
  updateHUD();
}
function play(){
  if (mode==="paused") {
    mode="running";
  } else {
    reset();
    mode="running";
  }
  keys.clear();touch.left=touch.right=touch.fire=false;
  ui.screen.classList.add("hidden");
  ui.pause.textContent="Pause P";
  clock.getDelta();
}
function pause(){
  if(mode!=="running")return;
  mode="paused";
  keys.clear();touch.left=touch.right=touch.fire=false;
  showOverlay("MISSION PAUSED","Take your time. Your ship will be waiting here.","RESUME MISSION");
  ui.pause.textContent="Resume P";
}
function gameOver(){
  mode="gameover";ship.visible=true;
  if(score>best){best=score;try{localStorage.setItem("star-runner-best",String(best));}catch{/* Optional */}}
  updateHUD();
  showOverlay("GAME OVER",`Final score: ${formatScore(score)} · Best: ${formatScore(best)}. Re-enter the asteroid field and beat your record.`,"TRY AGAIN");
  ui.pause.textContent="Pause P";
}
function spawnRock(){
  const scale=.9+Math.random()*1.65;
  const mesh=new THREE.Mesh(rockGeometry,rockMaterial);
  mesh.position.set((Math.random()-.5)*19,(Math.random()-.5)*2,-148);
  mesh.scale.setScalar(scale);
  mesh.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
  scene.add(mesh);
  rocks.push({mesh,scale,spin:.35+Math.random()*.95});
}
function shoot(){
  if(mode!=="running"||shootTimer>0)return;
  shootTimer=.18;
  for(const side of [-1,1]){
    const laser=new THREE.Mesh(bulletGeometry,bulletMaterial);
    laser.rotation.x=Math.PI/2;
    laser.position.set(ship.position.x+side*.55,.06,ship.position.z-2.7);
    scene.add(laser);bullets.push(laser);
  }
}
function removeRock(index){scene.remove(rocks[index].mesh);rocks.splice(index,1);}
function removeBullet(index){scene.remove(bullets[index]);bullets.splice(index,1);}
function hitShip(){
  if(invulnerability>0)return;
  lives-=1;invulnerability=1.8;banner(lives>0?"SHIELD HIT!":"HULL BREACH!");
  updateHUD();
  if(lives<=0)gameOver();
}
function update(delta){
  time+=delta;
  const worldSpeed=Math.min(34+distance*.013,92);
  distance+=worldSpeed*delta;
  spawnTimer-=delta;shootTimer=Math.max(0,shootTimer-delta);
  invulnerability=Math.max(0,invulnerability-delta);
  if(spawnTimer<=0){spawnRock();spawnTimer=Math.max(.43,1.04-distance/6500)*(.76+Math.random()*.57);}

  let axis=0;
  if(keys.has("KeyA")||keys.has("ArrowLeft")||touch.left)axis--;
  if(keys.has("KeyD")||keys.has("ArrowRight")||touch.right)axis++;
  ship.position.x=THREE.MathUtils.clamp(ship.position.x+axis*delta*14,-9.3,9.3);
  ship.rotation.z=THREE.MathUtils.lerp(ship.rotation.z,-axis*.3,Math.min(1,delta*7));
  ship.position.y=Math.sin(time*4)*.11;
  ship.visible=invulnerability===0||Math.sin(time*25)>-.05;
  if(keys.has("Space")||touch.fire)shoot();
  camera.position.x=THREE.MathUtils.lerp(camera.position.x,ship.position.x*.26,Math.min(1,delta*4));
  camera.lookAt(ship.position.x*.35,0,-33);

  const positions=starGeo.attributes.position;
  for(let i=0;i<STAR_COUNT;i++){
    let z=positions.getZ(i)+worldSpeed*.68*delta;
    if(z>40)z-=370;
    positions.setZ(i,z);
  }
  positions.needsUpdate=true;
  rings.forEach(r=>{r.position.z+=worldSpeed*delta*.85;if(r.position.z>24)r.position.z-=430;});

  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];b.position.z-=150*delta;
    if(b.position.z<-160)removeBullet(i);
  }
  for(let i=rocks.length-1;i>=0;i--){
    const rock=rocks[i],m=rock.mesh;
    m.position.z+=worldSpeed*delta;
    m.rotation.x+=delta*rock.spin;m.rotation.y+=delta*rock.spin*.8;
    let destroyed=false;
    for(let j=bullets.length-1;j>=0;j--){
      const bullet=bullets[j];
      const dx=m.position.x-bullet.position.x,dy=m.position.y-bullet.position.y,dz=m.position.z-bullet.position.z;
      if(dx*dx+dy*dy+dz*dz<(rock.scale+.4)**2){
        removeBullet(j);removeRock(i);score+=25;destroyed=true;banner("+25");break;
      }
    }
    if(destroyed)continue;
    const dx=m.position.x-ship.position.x,dy=m.position.y-ship.position.y,dz=m.position.z-ship.position.z;
    if(dx*dx+dy*dy+dz*dz<(rock.scale+1.0)**2){removeRock(i);hitShip();continue;}
    if(m.position.z>24){removeRock(i);score+=10;}
  }
  if(Math.floor(time*9)%2===0)exhaustLight.intensity=20;else exhaustLight.intensity=30;
  updateHUD();
}
function animate(){
  requestAnimationFrame(animate);
  const delta=Math.min(clock.getDelta(),.05);
  if(mode==="running")update(delta);
  else {ship.rotation.y=Math.sin(performance.now()*.00035)*.055;}
  renderer.render(scene,camera);
}
function togglePause(){if(mode==="running")pause();else if(mode==="paused")play();}
ui.start.addEventListener("click",play);
ui.pause.addEventListener("click",togglePause);
window.addEventListener("keydown",e=>{
  if(["Space","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();
  if(e.repeat&&e.code==="KeyP")return;
  if(e.code==="KeyP"||e.code==="Escape")togglePause();
  else if((e.code==="Enter")&&mode!=="running"&&document.activeElement!==ui.pause)play();
  keys.add(e.code);
});
window.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>{if(mode==="running")pause();});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&mode==="running")pause();});
for(const [id,key] of [["leftButton","left"],["rightButton","right"],["fireButton","fire"]]){
  const button=$(id);
  button.addEventListener("pointerdown",e=>{e.preventDefault();button.setPointerCapture(e.pointerId);touch[key]=true;});
  for(const name of ["pointerup","pointercancel","lostpointercapture"]){button.addEventListener(name,()=>touch[key]=false);}
}
window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
});
updateHUD();
animate();
