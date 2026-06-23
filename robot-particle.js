/* Persistent AI Robot Particle System – scroll-driven, fixed canvas */
(function(){
'use strict';
var N=7000,NR=5200;
// Section states per section: [assemblyRatio, worldOffsetX, worldOffsetY, scatterMode]
// Modes: 0=swirl, 1=stream-out, 2=orbit, 3=explode, 4=trail
var SS=[[.40,0,0,0],[.65,-1.4,.2,1],[.50,-1.8,0,2],[.22,0,0,3],[.60,1.6,0,4],[1.0,0,0,2]];
var SID=['hero','about','skills','projects','experience','contact'];
var pos,vel,col,sz,op,ph,rPts;
var geo,mat,pts,scene,cam,ren;
var curS=[.40,0,0,0],T=0,mx=0,my=0;
function R(){return Math.random();}
function RN(){return R()-.5;}
function sph(cx,cy,cz,r,n,a){for(var i=0;i<n;i++){var u=R(),th=6.2832*u,ph2=Math.acos(2*R()-1),rs=r*Math.cbrt(R());a.push(cx+rs*Math.sin(ph2)*Math.cos(th),cy+rs*Math.sin(ph2)*Math.sin(th),cz+rs*Math.cos(ph2));}}
function cyl(cx,cy,cz,r,h,n,a){for(var i=0;i<n;i++){var ag=R()*6.2832,rd=r*Math.sqrt(R());a.push(cx+rd*Math.cos(ag),cy+RN()*h,cz+rd*Math.sin(ag));}}
function bx(cx,cy,cz,sx,sy,sz2,n,a){for(var i=0;i<n;i++){a.push(cx+RN()*sx,cy+RN()*sy,cz+RN()*sz2);}}
function buildRobot(c){
  var a=[],p=function(r){return Math.max(1,Math.ceil(c*r));};
  sph(0,3,0,.5,p(.10),a);sph(-.17,3.14,.42,.07,p(.012),a);sph(.17,3.14,.42,.07,p(.012),a);
  cyl(0,2.62,0,.15,.28,p(.02),a);bx(0,1.75,0,1.1,1.1,.5,p(.18),a);sph(0,1.82,.26,.09,p(.012),a);
  sph(-.75,2.2,0,.2,p(.025),a);sph(.75,2.2,0,.2,p(.025),a);
  cyl(-.9,1.7,0,.14,.72,p(.04),a);cyl(.9,1.7,0,.14,.72,p(.04),a);
  sph(-.9,1.24,0,.16,p(.015),a);sph(.9,1.24,0,.16,p(.015),a);
  cyl(-.9,.68,0,.11,.7,p(.04),a);cyl(.9,.68,0,.11,.7,p(.04),a);
  bx(-.9,.22,0,.22,.28,.11,p(.025),a);bx(.9,.22,0,.22,.28,.11,p(.025),a);
  bx(0,1.15,0,.88,.32,.48,p(.05),a);
  cyl(-.3,.6,0,.2,.72,p(.05),a);cyl(.3,.6,0,.2,.72,p(.05),a);
  sph(-.3,.15,0,.17,p(.015),a);sph(.3,.15,0,.17,p(.015),a);
  cyl(-.3,-.5,0,.13,.78,p(.05),a);cyl(.3,-.5,0,.13,.78,p(.05),a);
  bx(-.3,-.98,.12,.28,.14,.44,p(.025),a);bx(.3,-.98,.12,.28,.14,.44,p(.025),a);
  return a;
}
function scatter(i,mode,ox,oy){
  var p=ph[i],ag,r;
  var m=Math.round(mode);
  if(m===0){ag=p+T*.4;r=2+Math.sin(p*3);return[ox+Math.cos(ag)*r,oy+1.5+Math.sin(ag*.7)*r*.4,Math.sin(ag)*r*.3];}
  if(m===1){return[ox+4+Math.sin(p*7)*2,oy+1.5+Math.sin(p*3)*3,RN()*1.5];}
  if(m===2){ag=p*6.2832+T*.35;r=1.8+(i%3)*.6;return[ox+Math.cos(ag)*r,oy+1.5+Math.sin(p*2)*1.5,Math.sin(ag)*r*.4];}
  if(m===3){r=3+Math.sin(p*5)*2;ag=p*12.566;return[ox+Math.cos(ag)*r*1.8,oy+1.5+Math.sin(ag)*r,Math.cos(p*4)*r*.5];}
  return[ox-2+Math.sin(p*4+T)*1.5,oy+.5+Math.sin(p*2+T)*2,RN()];
}
function readScroll(){
  var vH=window.innerHeight;
  for(var i=0;i<SID.length;i++){
    var el=document.getElementById(SID[i]);if(!el)continue;
    var rc=el.getBoundingClientRect();
    if(rc.top<=vH*.5&&rc.bottom>=vH*.5){
      var prog=Math.max(0,Math.min(1,(vH*.5-rc.top)/rc.height));
      var sA=SS[i],sB=SS[Math.min(i+1,SS.length-1)];
      return[sA[0]+(sB[0]-sA[0])*prog,sA[1]+(sB[1]-sA[1])*prog,sA[2]+(sB[2]-sA[2])*prog,sA[3]];
    }
  }
  return SS[0];
}
function init(){
  var canvas=document.getElementById('heroParticleCanvas');
  if(!canvas||typeof THREE==='undefined')return;
  var W=window.innerWidth,H=window.innerHeight;
  scene=new THREE.Scene();
  cam=new THREE.PerspectiveCamera(44,W/H,.1,100);
  cam.position.set(0,1.5,9);cam.lookAt(0,1.5,0);
  ren=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:false});
  ren.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  ren.setSize(W,H);ren.setClearColor(0,0);
  rPts=buildRobot(NR);
  pos=new Float32Array(N*3);vel=new Float32Array(N*3);
  col=new Float32Array(N*3);sz=new Float32Array(N);op=new Float32Array(N);ph=new Float32Array(N);
  var PAL=[[.776,.365,.118],[.878,.471,.243],[1,.608,.369],[.55,.26,.078]];
  for(var i=0;i<N;i++){
    var i3=i*3,c=PAL[i%4];
    pos[i3]=RN()*14;pos[i3+1]=RN()*10+1.5;pos[i3+2]=RN()*4;
    col[i3]=c[0];col[i3+1]=c[1];col[i3+2]=c[2];
    sz[i]=.5+R()*1.2;op[i]=.15+R()*.85;ph[i]=R()*6.2832;
  }
  geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('aColor',new THREE.BufferAttribute(col,3));
  geo.setAttribute('aSize',new THREE.BufferAttribute(sz,1));
  geo.setAttribute('aOp',new THREE.BufferAttribute(op,1));
  mat=new THREE.ShaderMaterial({
    uniforms:{uPR:{value:ren.getPixelRatio()}},
    vertexShader:'attribute vec3 aColor;attribute float aSize,aOp;uniform float uPR;varying vec3 vC;varying float vO;void main(){vC=aColor;vO=aOp;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*uPR*(72.0/-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying vec3 vC;varying float vO;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);if(d>.5)discard;float a=pow(1.-smoothstep(0.,.5,d),1.6);float k=1.-smoothstep(0.,.12,d);gl_FragColor=vec4(mix(vC,vec3(1.,.88,.72),k*.75),a*vO);}',
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
  });
  pts=new THREE.Points(geo,mat);pts.frustumCulled=false;scene.add(pts);
  window.addEventListener('resize',function(){var W=window.innerWidth,H=window.innerHeight;cam.aspect=W/H;cam.updateProjectionMatrix();ren.setSize(W,H);});
  document.addEventListener('mousemove',function(e){mx=(e.clientX/window.innerWidth-.5)*2;my=-(e.clientY/window.innerHeight-.5)*2;});
  animate();
}
function animate(){
  requestAnimationFrame(animate);T+=.016;
  var ts=readScroll();
  for(var k=0;k<4;k++)curS[k]+=(ts[k]-curS[k])*.04;
  var asmb=curS[0],ox=curS[1],oy=curS[2],mode=curS[3];
  var asmN=Math.floor(asmb*NR);
  var mxW=mx*5.5,myW=my*3.8;
  for(var i=0;i<N;i++){
    var i3=i*3,p=ph[i];
    var px=pos[i3],py=pos[i3+1],pz=pos[i3+2];
    var tx,ty,tz;
    if(i<asmN&&i3<rPts.length){
      tx=rPts[i3]+ox;ty=rPts[i3+1]+oy;tz=rPts[i3+2];
    } else if(i<NR){
      var st=scatter(i,mode,ox,oy);tx=st[0];ty=st[1];tz=st[2];
    } else {
      tx=ox+Math.cos(p*6.2832+T*.25)*(2.5+Math.sin(p*3));
      ty=oy+1.5+Math.sin(p*3.7+T*.18)*2.2;
      tz=Math.sin(p*2+T*.12)*.9;
    }
    vel[i3]+=(tx-px)*.06;vel[i3+1]+=(ty-py)*.06;vel[i3+2]+=(tz-pz)*.06;
    vel[i3]+=Math.sin(T+p)*.0012;vel[i3+1]+=Math.cos(T*.7+p)*.0012;
    var dxM=mxW-px,dyM=myW-py;
    if(dxM*dxM+dyM*dyM<4){vel[i3]+=dxM*.004;vel[i3+1]+=dyM*.004;}
    vel[i3]*=.88;vel[i3+1]*=.88;vel[i3+2]*=.88;
    pos[i3]=px+vel[i3];pos[i3+1]=py+vel[i3+1];pos[i3+2]=pz+vel[i3+2];
    sz[i]=(.5+R()*.5)*(.45+asmb*.8);
    op[i]=Math.min(1,Math.max(.07,.18+asmb*.82+Math.sin(T*1.5+p)*.07));
  }
  geo.attributes.position.needsUpdate=true;
  geo.attributes.aSize.needsUpdate=true;
  geo.attributes.aOp.needsUpdate=true;
  ren.render(scene,cam);
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
}());
