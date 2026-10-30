// ===== Turmwacht Duell – Darstellung (liest nur den Sim-Zustand) =====
const DR=(()=>{
const Sim=DuellSim,CARDS=Sim.CARDS,FW=Sim.FW,FH=Sim.FH;
const VY0=-34,VY1=664,VH=VY1-VY0,TEAM=['#3a8cff','#ff4a3a'],TEAMD=['#0e2a66','#6a120c'];
let cv,W=1,H=1,s=1,ox=0,oy=0,bg=null,lastS=null;
const st={fx:[],decals:[],ruins:[],shake:0,flashSling:{},seen:new Set(),ghost:null,aim:null,hiSide:0,time:0,an:new Map(),corpses:[],simRef:null,frame:0,dmgNums:true};
function init(canvas){cv=canvas;ctx=cv.getContext('2d');resize();}
function resize(){const r=cv.getBoundingClientRect();dpr=Math.min(2.5,window.devicePixelRatio||1);W=Math.max(1,r.width);H=Math.max(1,r.height);
 cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);s=Math.min(W/FW,H/VH);ox=(W-FW*s)/2;oy=(H-VH*s)/2-VY0*s;scale=s;for(const k in emo)delete emo[k];bg=null;}
function toWorld(px,py){return[(px-ox)/s,(py-oy)/s];}
function toScreen(x,y){return[ox+x*s,oy+y*s];}
function WT(){ctx.setTransform(dpr*s,0,0,dpr*s,dpr*(ox+shx),dpr*(oy+shy));}
let shx=0,shy=0;
// ---------- Hintergrund ----------
function seedR(n){let a=n;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296;};}
function buildBg(){bg=document.createElement('canvas');bg.width=cv.width;bg.height=cv.height;const g=bg.getContext('2d');const rr=seedR(7);
 g.fillStyle='#1d2e14';g.fillRect(0,0,bg.width,bg.height);
 g.setTransform(dpr*s,0,0,dpr*s,dpr*ox,dpr*oy);
 const X0=-ox/s-10,X1=(W-ox)/s+10,Y0=-oy/s-10,Y1=(H-oy)/s+10;
 // Wald außerhalb
 let gr=g.createLinearGradient(0,Y0,0,Y1);gr.addColorStop(0,'#16240f');gr.addColorStop(.5,'#22361a');gr.addColorStop(1,'#1a2c12');g.fillStyle=gr;g.fillRect(X0,Y0,X1-X0,Y1-Y0);
 // Spielfeld-Rasen
 gr=g.createLinearGradient(0,0,0,FH);gr.addColorStop(0,'#4a6a2a');gr.addColorStop(.47,'#56782e');gr.addColorStop(.53,'#5a7c30');gr.addColorStop(1,'#4e702c');
 g.fillStyle=gr;g.beginPath();g.roundRect?g.roundRect(0,0,FW,FH,14):g.rect(0,0,FW,FH);g.fill();
 g.save();g.clip();
 for(let i=0;i<520;i++){const x=rr()*FW,y=rr()*FH,r=4+rr()*16;g.fillStyle=rr()<.5?'rgba(90,130,50,.18)':'rgba(30,50,15,.16)';g.beginPath();g.ellipse(x,y,r,r*.6,0,0,7);g.fill();}
 g.strokeStyle='rgba(140,180,80,.35)';g.lineWidth=.8;for(let i=0;i<900;i++){const x=rr()*FW,y=rr()*FH;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rr()-.5)*2,y-2-rr()*3);g.stroke();}
 // Halbfeld-Tönung
 g.fillStyle='rgba(120,20,10,.07)';g.fillRect(0,0,FW,Sim.MIDY);g.fillStyle='rgba(20,60,140,.06)';g.fillRect(0,Sim.MIDY,FW,FH-Sim.MIDY);
 // Wege
 const path=(pts,w,c)=>{g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();};
 for(const bx of Sim.BRIDGES){const P1=[[bx,60],[bx,FH-60]];path(P1,34,'rgba(40,26,10,.45)');path(P1,30,'#8a6a3e');path(P1,20,'#9a7a48');}
 for(const sd of[0,1]){const y=sd?50:590,yg=sd?132:508;path([[70,yg],[180,y],[290,yg]],22,'rgba(40,26,10,.4)');path([[70,yg],[180,y],[290,yg]],18,'#8a6a3e');path([[70,yg],[180,y],[290,yg]],10,'#9a7a48');}
 for(let i=0;i<260;i++){const bx=Sim.BRIDGES[i%2],x=bx+(rr()-.5)*24,y=60+rr()*(FH-120);g.fillStyle='rgba(60,40,20,.35)';g.beginPath();g.arc(x,y,.8+rr()*1.4,0,7);g.fill();}
 // Blumen/Steinchen
 for(let i=0;i<70;i++){const x=rr()*FW,y=rr()*FH;if(Math.abs(x-70)<26||Math.abs(x-290)<26||Math.abs(y-Sim.MIDY)<30)continue;g.fillStyle=['#e8e070','#f0f0f0','#d070c0','#9ab0c8'][i%4];g.beginPath();g.arc(x,y,1.3,0,7);g.fill();}
 g.restore();
 // Rand
 g.strokeStyle='rgba(10,14,6,.75)';g.lineWidth=3;g.beginPath();g.roundRect?g.roundRect(0,0,FW,FH,14):g.rect(0,0,FW,FH);g.stroke();
 // Schlucht
 const y0=Sim.RY0,y1=Sim.RY1;g.save();g.beginPath();g.moveTo(X0,y0);for(let x=X0;x<=X1;x+=8)g.lineTo(x,y0+(rr()-.3)*3);for(let x=X1;x>=X0;x-=8)g.lineTo(x,y1-(rr()-.3)*3);g.closePath();
 gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'#2a1a10');gr.addColorStop(.25,'#120814');gr.addColorStop(.5,'#3a1660');gr.addColorStop(.75,'#120814');gr.addColorStop(1,'#2a1a10');g.fillStyle=gr;g.fill();
 g.clip();g.shadowColor='#b060ff';g.shadowBlur=10;for(let i=0;i<60;i++){g.fillStyle=`rgba(${190+rr()*60|0},${120+rr()*60|0},255,${.3+rr()*.5})`;g.beginPath();g.arc(X0+rr()*(X1-X0),Sim.MIDY+(rr()-.5)*14,.6+rr()*1.4,0,7);g.fill();}g.restore();
 for(const yy of[y0,y1]){g.strokeStyle='#5a4a38';g.lineWidth=3;g.beginPath();for(let x=X0;x<=X1;x+=10){const v=yy+(yy===y0?-1:1)*(1+rr()*2);x===X0?g.moveTo(x,v):g.lineTo(x,v);}g.stroke();
  g.strokeStyle='rgba(10,6,4,.8)';g.lineWidth=1.2;g.stroke();}
 // Brücken
 for(const bx of Sim.BRIDGES){const hw=Sim.BW/2;g.fillStyle='rgba(0,0,0,.45)';g.fillRect(bx-hw+2,y0-6,hw*2,y1-y0+16);
  for(let y=y0-8;y<y1+8;y+=5){g.fillStyle=((y/5)|0)%2?'#8a5a2a':'#7a4c22';g.fillRect(bx-hw,y,hw*2,4.4);g.strokeStyle='#2a1808';g.lineWidth=.8;g.strokeRect(bx-hw,y,hw*2,4.4);}
  for(const sx of[-1,1]){g.strokeStyle='#120b05';g.lineWidth=3.2;g.beginPath();g.moveTo(bx+sx*hw,y0-10);g.lineTo(bx+sx*hw,y1+10);g.stroke();g.strokeStyle='#c8a868';g.lineWidth=1.6;g.stroke();
   for(const yy of[y0-10,y1+10]){g.fillStyle='#5a3a1a';g.strokeStyle='#120b05';g.lineWidth=1.2;g.beginPath();g.arc(bx+sx*hw,yy,3.4,0,7);g.fill();g.stroke();}}}
 // Bäume & Felsen außerhalb (und Ecken)
 const deco=[];for(let i=0;i<90;i++){const x=X0+rr()*(X1-X0),y=Y0+rr()*(Y1-Y0);if(x>-14&&x<FW+14&&y>-14&&y<FH+14)continue;deco.push([x,y,rr()]);}
 for(const[x,y]of[[10,20],[350,24],[12,622],[348,618],[8,300],[352,342]])deco.push([x,y,.3]);
 deco.sort((a,b)=>a[1]-b[1]);for(const[x,y,v]of deco){g.save();g.translate(x,y);const k=.7+v*.5;g.scale(k,k);if(v<.55)drawPine(g,1);else if(v<.85)drawOak(g,1);else drawRock(g,1);g.restore();}
}
// ---------- Sprites ----------
function spr(key,team){const a=DART[key];if(!a)return null;return sprite(key,a.w,a.h,a.ax,a.ay,a.fn,a.m,true);}
function artKey(e){if(e.cls==='tower')return e.sub+e.side+(e.sub==='keep'&&!e.active?'s':'');const k=CARDS[e.card].art==='fire'?'firerain':CARDS[e.card].art;return typeof viewKey==='function'?viewKey(k,e.side):k;}
function vk(k,side){return typeof viewKey==='function'?viewKey(k,side):k;}
const lerp=(a,b,k)=>a+(b-a)*k;
// ---------- Effekte ----------
function fx(o){o.t=0;st.fx.push(o);return o;}
function parts(x,y,n,c,sp,life,up){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(.3+Math.random())*sp;fx({k:'p',x,y,z:up||0,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,vz:(up?20:0)+Math.random()*sp*.6,c,max:life*(.6+Math.random()*.6),r:1.2+Math.random()*1.8});}}
function text(x,y,txt,c,max){fx({k:'txt',x,y,txt,c,max:max||1.1});}
function onEvents(evs,S){for(const e of evs){switch(e.k){
 case 'impact':{const a=st.an.get(e.id);if(a){a.ky=(a.side===0?1:-1)*1.6;a.kx=0;a.kt=.12;}}fx({k:'spark',x:e.x,y:e.y-(e.air?28:8),c:e.kind==='frostbolt'||e.kind==='icebreath'?'#bfe8ff':e.kind==='flame'?'#ffb040':e.kind==='thorn'?'#a8ff70':e.kind==='poison'?'#9aff60':e.kind==='shadow'?'#c080ff':e.kind==='bolt'?'#ffe860':'#fff0c0',max:.25});break;
 case 'hit':{const W=WSTYLE[e.card]||'sword';fx({k:'spark',x:e.x,y:e.y-(e.air?28:10),c:W==='club'?'#ffe0a0':W==='bite'||W==='claw'?'#ffd0c0':'#fff4d0',max:.22,big:W==='club'?1.6:1});
  const a=st.an.get(e.id);if(a){let dx=e.x-e.tx,dy=e.y-e.ty;const d=Math.hypot(dx,dy)||1;const f=W==='club'?5:3;a.kx=dx/d*f;a.ky=dy/d*f*.6;a.kt=.16;}
  if(W==='club'){parts(e.x,e.y,5,'#a08a60',30,.35);st.shake=Math.max(st.shake,1.5);}break;}
 case 'boom':{const ice=e.kind==='icebreath';fx({k:'ring',x:e.x,y:e.y,r:e.r||24,c:ice?'#bfefff':'#ff9a30',max:.4});parts(e.x,e.y-6,10,ice?'#e8f8ff':'#ffb040',40,.5);if(e.kind==='flame'||ice)fx({k:ice?'ring':'fire',x:e.x,y:e.y,r:(e.r||24)*.8,c:'rgba(200,240,255,.7)',max:.45,w:6});}break;
 case 'splash':parts(e.x,e.y,10,'#8aff40',36,.5);break;
 case 'fireboom':fx({k:'fire',x:e.x,y:e.y,r:e.r,max:.6});st.decals.push({x:e.x,y:e.y,r:e.r*.8,t:0,max:6});parts(e.x,e.y,22,'#ff8a20',70,.8,1);st.shake=Math.max(st.shake,5);break;
 case 'frost':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'#bfefff',max:.5,w:4});parts(e.x,e.y,24,'#e8f8ff',60,.9,1);break;
 case 'nova':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'#9ae0ff',max:.55,w:6});parts(e.x,e.y,26,'#e8f8ff',80,.9,1);break;
 case 'slam':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'#e8d8b0',max:.45,w:5});parts(e.x,e.y,16,'#a08a60',60,.6);st.shake=Math.max(st.shake,4);break;
 case 'summon':fx({k:'ring',x:e.x,y:e.y,r:36,c:'#c080ff',max:.6,w:4});parts(e.x,e.y,18,'#e0d8c0',40,.7,1);break;
 case 'heal':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'rgba(120,255,140,.7)',max:.5,w:2});for(let i=0;i<3;i++)fx({k:'plus',x:e.x+(Math.random()-.5)*e.r,y:e.y-10-Math.random()*10,max:.8});break;
 case 'mana':text(e.x,e.y-56,'+1','#e0a0ff',1.3);break;
 case 'bomb':fx({k:'boomb',x:e.x,y:e.y,r:e.r,max:e.big?.7:.45});parts(e.x,e.y,e.big?30:12,'#ffb040',e.big?90:50,.7,1);if(e.big){st.shake=Math.max(st.shake,7);st.decals.push({x:e.x,y:e.y,r:e.r*.7,t:0,max:6});}break;
 case 'death':parts(e.x,e.y-(e.air?28:10),e.big?16:5,/skel|lich|giant/.test(e.card||'')?'#e8e0c8':'#8a8478',e.big?60:34,.6);fx({k:'puff',x:e.x,y:e.y-(e.air?28:6),r:e.big?26:12,max:.5});break;
 case 'tower':fx({k:'boomb',x:e.x,y:e.y-20,r:60,max:.9});parts(e.x,e.y-20,40,'#c8b898',100,1.1,1);parts(e.x,e.y-30,20,'#ff9a30',80,.8,1);st.shake=10;st.ruins.push({x:e.x,y:e.y,side:e.side,sub:e.sub});break;
 case 'keepwake':fx({k:'ring',x:e.x,y:e.y-20,r:58,c:e.side?'rgba(255,120,90,.95)':'rgba(120,180,255,.95)',max:.8,w:5});parts(e.x,e.y-40,24,'#ffd860',70,.9,1);text(e.x,e.y+(e.side?40:-100),'Bergfried erwacht!','#ffe28a',1.8);break;
 case 'throw':st.flashSling[Math.round(e.x)+'|'+Math.round(e.y)]=.35;break;
 case 'land':parts(e.x,e.y,6,'#a08a60',30,.4);break;
 // 0.7 neue Mechaniken
 case 'chain':fx({k:'bolt',pts:e.pts.map(p=>[p[0],p[1]-(p[2]?28:10)]),max:.28});for(const p of e.pts)fx({k:'spark',x:p[0],y:p[1]-(p[2]?28:10),c:'#cfe8ff',max:.25});break;
 case 'net':fx({k:'ring',x:e.x,y:e.y-(e.air?28:0),r:16,c:'rgba(225,205,150,.95)',max:.35,w:2});if(e.air)text(e.x,e.y-46,'Zu Boden!','#f0e0b0',.9);break;
 case 'cleave':fx({k:'ring',x:e.x,y:e.y,r:e.r*1.3,c:'rgba(255,225,170,.9)',max:.3,w:3});if(e.n)parts(e.x,e.y,4+e.n*2,'#a08a60',36,.4);break;
 case 'chant':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'rgba(255,140,60,.95)',max:.6,w:5});parts(e.x,e.y,16,'#ffb060',50,.7,1);text(e.x,e.y-20,'Kriegsgesang!','#ffc080',1.2);break;
 case 'roar':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'rgba(255,90,60,.95)',max:.55,w:6});fx({k:'ring',x:e.x,y:e.y,r:e.r*.6,c:'rgba(255,200,120,.8)',max:.4,w:3});st.shake=Math.max(st.shake,5);text(e.x,e.y-60,'Kriegsschrei!','#ffb0a0',1.3);break;
 case 'roots':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'rgba(130,200,60,.95)',max:.5,w:4});parts(e.x,e.y,20,'#6a4a24',50,.6);st.shake=Math.max(st.shake,2.5);break;
 case 'fireline':fx({k:'fline',x0:e.x0,y0:e.y0,x1:e.x1,y1:e.y1,w:e.w,max:.9});{const n=10;for(let i=0;i<=n;i++){const x=lerp(e.x0,e.x1,i/n),y=lerp(e.y0,e.y1,i/n);parts(x,y,3,'#ff8a20',40,.6,1);if(i%3===0)st.decals.push({x,y,r:e.w*.8,t:0,max:5});}}st.shake=Math.max(st.shake,6);break;
 case 'burn':text(e.x,e.y-50,'brennt!','#ffa050',1);parts(e.x,e.y-20,10,'#ff8a20',40,.5,1);break;
 case 'fear':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'rgba(190,120,255,.9)',max:.55,w:3});fx({k:'ring',x:e.x,y:e.y,r:e.r*.7,c:'rgba(220,180,255,.6)',max:.45,w:2});break;
 case 'burrow':parts(e.x,e.y,10,'#7a5a36',36,.5);fx({k:'puff',x:e.x,y:e.y,r:10,c:'#8a6a42',max:.4});break;
 case 'unburrow':parts(e.x,e.y,14,'#7a5a36',50,.55,1);fx({k:'puff',x:e.x,y:e.y,r:14,c:'#8a6a42',max:.5});break;
 case 'ambush':fx({k:'spark',x:e.x,y:e.y-10,c:'#ffe0a0',max:.3,big:2});text(e.x,e.y-36,'Überraschung!','#ffe0a0',1);break;
 case 'thorns':fx({k:'spark',x:e.x,y:e.y-10,c:'#a8ff70',max:.22});break;
 case 'play':fx({k:'ring',x:e.x,y:e.y,r:22,c:e.side?'rgba(255,110,90,.8)':'rgba(110,170,255,.8)',max:.45,w:2});
  {const C=CARDS[e.card];text(e.x,e.y-(C.type==='spell'?0:40),C.name,e.side?'#ffb0a0':'#b8d8ff',1.2);}break;
 }}}
// ---------- Zeichnen ----------
function hpBar(x,y,w,h,f,side,big,tr){ctx.fillStyle='rgba(10,6,2,.85)';ctx.fillRect(x-w/2-1,y-1,w+2,h+2);ctx.fillStyle=TEAMD[side];ctx.fillRect(x-w/2,y,w,h);
 if(tr>f){ctx.fillStyle='rgba(255,236,200,.85)';ctx.fillRect(x-w/2,y,w*Math.min(1,tr),h);}
 ctx.fillStyle=TEAM[side];ctx.fillRect(x-w/2,y,w*Math.max(0,f),h);if(big){ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(x-w/2,y,w*Math.max(0,f),h*.4);}}
function draw(S,alpha,dt){lastS=S;st.time+=dt;if(!bg)buildBg();
 ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(bg,0,0);
 st.shake=Math.max(0,st.shake-dt*22);shx=(Math.random()-.5)*st.shake;shy=(Math.random()-.5)*st.shake;WT();
 if(shx||shy){ctx.setTransform(1,0,0,1,dpr*shx,dpr*shy);ctx.drawImage(bg,0,0);WT();}
 const T=st.time;
 // Brandflecken
 st.decals=st.decals.filter(d=>(d.t+=dt)<d.max);for(const d of st.decals){ctx.fillStyle=`rgba(25,14,6,${.45*(1-d.t/d.max)})`;ctx.beginPath();ctx.ellipse(d.x,d.y,d.r,d.r*.6,0,0,7);ctx.fill();}
 // Ruinen
 for(const r of st.ruins){const c=spr('ruin');blit(c,r.x,r.y+4);}
 // Zonen (unter Einheiten)
 for(const z of S.zones){if(z.k==='puddle'){const k=Math.min(1,z.t/z.max*3);ctx.fillStyle=`rgba(90,200,40,${.35*k})`;ctx.beginPath();ctx.ellipse(z.x,z.y,z.r,z.r*.6,0,0,7);ctx.fill();
   ctx.strokeStyle=`rgba(180,255,90,${.5*k})`;ctx.lineWidth=1.2;ctx.stroke();for(let i=0;i<5;i++){const a=T*1.3+i*1.26;ctx.fillStyle=`rgba(200,255,120,${.6*k})`;ctx.beginPath();ctx.arc(z.x+Math.cos(a)*z.r*.5,z.y+Math.sin(a*1.3)*z.r*.3,1.6+(i%2),0,7);ctx.fill();}}
  else if(z.k==='firerain'){const k=1-z.t/z.max;ctx.strokeStyle=z.side?'rgba(255,80,60,.9)':'rgba(255,200,80,.9)';ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(z.x,z.y,z.r,z.r*.6,0,0,7);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle=`rgba(255,120,30,${.12+.2*k})`;ctx.fill();}
  else if(z.k==='chant'){const k=Math.min(1,z.t/z.max*4),pl=.5+.5*Math.sin(T*8);ctx.fillStyle=`rgba(255,110,40,${(.08+.06*pl)*k})`;ctx.beginPath();ctx.ellipse(z.x,z.y,z.r,z.r*.6,0,0,7);ctx.fill();
   ctx.strokeStyle=`rgba(255,150,60,${(.5+.3*pl)*k})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(z.x,z.y,z.r,z.r*.6,0,0,7);ctx.stroke();
   const rr=z.r*((T*.8)%1);ctx.strokeStyle=`rgba(255,200,120,${.5*(1-rr/z.r)*k})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(z.x,z.y,rr,rr*.6,0,0,7);ctx.stroke();
   ctx.font='bold 10px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle=`rgba(255,220,150,${.8*k})`;for(let i=0;i<3;i++){const a=T*1.2+i*2.09;ctx.fillText('♪',z.x+Math.cos(a)*z.r*.6,z.y+Math.sin(a)*z.r*.35-((T*14+i*9)%18));}}
  else if(z.k==='roots'){const k=Math.min(1,z.t/z.max*3);ctx.fillStyle=`rgba(60,40,20,${.3*k})`;ctx.beginPath();ctx.ellipse(z.x,z.y,z.r,z.r*.6,0,0,7);ctx.fill();
   ctx.lineCap='round';for(let i=0;i<9;i++){const a=i*.698+z.x*.01,r0=z.r*(.25+.6*((i*37)%7)/7),x=z.x+Math.cos(a)*r0,y=z.y+Math.sin(a)*r0*.6,h=(8+(i%3)*4)*k;
    ctx.strokeStyle=OL;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+4,y-h*.6,x-2,y-h);ctx.stroke();ctx.strokeStyle=i%2?'#6a8a2a':'#6a4a24';ctx.lineWidth=2;ctx.stroke();}}}
 // Platzierungsbereich
 if(st.ghost&&st.ghost.zone){ctx.fillStyle='rgba(220,40,30,.22)';ctx.fillRect(0,0,FW,Sim.RY1+4);
  for(const lane of[0,1]){const g=Sim.tower(S,1,'guard',lane);if(!g||g.hp<=0){ctx.clearRect(0,0,0,0);ctx.fillStyle='rgba(80,180,255,.18)';ctx.fillRect(lane?FW/2:0,160,FW/2,Sim.RY0-4-160);}}
  ctx.save();ctx.beginPath();ctx.rect(0,0,FW,Sim.RY1+4);ctx.clip();ctx.strokeStyle='rgba(255,70,50,.16)';ctx.lineWidth=5;ctx.beginPath();for(let k=-Sim.RY1;k<FW;k+=22){ctx.moveTo(k,Sim.RY1+4);ctx.lineTo(k+Sim.RY1+4,0);}ctx.stroke();ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,Sim.RY1+4);ctx.lineTo(FW,Sim.RY1+4);ctx.stroke();
  // 0.5: Mittelzone – Gruppen teilen sich hier auf beide Spuren auf
  ctx.setLineDash([]);const C0=CARDS[st.ghost.card],grp=(C0.count||1)>1&&C0.type!=='bld',mw=Sim.MIDW,hot=st.ghost.x!=null&&Sim.inMid(st.ghost.x)&&grp;
  ctx.fillStyle=hot?'rgba(255,215,90,.2)':'rgba(255,215,90,.08)';ctx.fillRect(FW/2-mw/2,Sim.RY1+4,mw,FH-Sim.RY1-4);
  ctx.strokeStyle=hot?'rgba(255,220,110,.75)':'rgba(255,220,110,.3)';ctx.lineWidth=1.2;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(FW/2-mw/2,Sim.RY1+4);ctx.lineTo(FW/2-mw/2,FH);ctx.moveTo(FW/2+mw/2,Sim.RY1+4);ctx.lineTo(FW/2+mw/2,FH);ctx.stroke();ctx.setLineDash([]);
  if(grp){ctx.font='bold 8px system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.75)';ctx.fillStyle=hot?'#ffe9a0':'rgba(255,233,160,.7)';ctx.strokeText('⇆ teilt sich',FW/2,Sim.RY1+16);ctx.fillText('⇆ teilt sich',FW/2,Sim.RY1+16);}}
 // Einheiten sammeln
 const list=[];for(const e of S.ents){if(e.hp<=0)continue;let x=lerp(e.ox,e.x,alpha),y=lerp(e.oy,e.y,alpha),z=e.air?24+Math.sin(T*3+e.id)*2.5:0;
  if(e.thrown){const k=Math.min(1,e.thrown.t/e.thrown.max);z=Math.sin(Math.PI*k)*70;}
  if(e.leap){const k=Math.min(1,e.leap.t/e.leap.max);z=Math.sin(Math.PI*k)*48;}
  list.push({e,x,y,z});}
 track(S,list,dt);
 // Schatten + Teamringe
 for(const o of list){const e=o.e;if(e.cls==='tower')continue;const r=e.r;ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(o.x,o.y,r*1.05,r*.5,0,0,7);ctx.fill();
  if(e.cls==='unit'){ctx.strokeStyle=TEAM[e.side];ctx.globalAlpha=.85;ctx.lineWidth=e.hero?2.4:1.6;ctx.beginPath();ctx.ellipse(o.x,o.y,r*1.05,r*.5,0,0,7);ctx.stroke();ctx.globalAlpha=1;}}
 // Gefallene (Sterbe-Animation, nur Darstellung)
 drawCorpses(dt);
 // Bomben am Boden
 for(const b of S.bombs){const k=1-b.t/b.max;if(b.small){const z=34*(1-k);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(b.x,b.y,4,2,0,0,7);ctx.fill();ctx.fillStyle='#2a2a30';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.x,b.y-z-3,3.4,0,7);ctx.fill();ctx.stroke();}
  else{ctx.strokeStyle=`rgba(255,60,30,${.4+.4*Math.sin(T*16)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(b.x,b.y,b.r,b.r*.6,0,0,7);ctx.stroke();
   ctx.fillStyle='#1e1e24';ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,b.y-8,b.big?10:6,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#ffd040';ctx.beginPath();ctx.arc(b.x+(b.big?6:4),b.y-(b.big?18:13),2+Math.random()*1.5,0,7);ctx.fill();}}
 // Bodeneinheiten & Gebäude nach y, Flieger danach
 list.sort((a,b)=>(a.e.air-b.e.air)||(a.y-b.y));
 for(const o of list){drawEnt(S,o);if(o.e.cls==='tower')towerDamage(o,o.e,T,dt);}
 // Projektile
 for(const p of S.proj)drawProj(p,alpha);
 // Giftwolken über allem Boden
 for(const z of S.zones)if(z.k==='cloud'){const k=Math.min(1,z.t/z.max*4,1);for(let i=0;i<7;i++){const a=i*0.9+T*.4,rr=z.r*(.35+.25*((i*37)%5)/5);ctx.fillStyle=`rgba(120,220,60,${.16*k})`;ctx.beginPath();ctx.arc(z.x+Math.cos(a)*rr,z.y-6+Math.sin(a)*rr*.6,z.r*.45,0,7);ctx.fill();}}
 else if(z.k==='firerain'){const k=1-z.t/z.max;for(let i=0;i<5;i++){const a=i*1.257,rr=z.r*.5*((i%3)/2),hh=(1-k)*140+((i*23)%30);const x=z.x+Math.cos(a)*rr+hh*.25,y=z.y+Math.sin(a)*rr*.6-hh;
   ctx.save();ctx.shadowColor='#ff7020';ctx.shadowBlur=10;ctx.fillStyle='#ffb040';ctx.beginPath();ctx.arc(x,y,4.5,0,7);ctx.fill();ctx.restore();ctx.strokeStyle='rgba(255,140,40,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12,y-30);ctx.stroke();}}
 // Effekte
 drawFx(dt);
 // Lebensbalken
 for(const o of list){const e=o.e;if(e.cls==='tower'){towerPlate(o,e,T);continue;}
  {const w=e.hero?30:e.cls==='bld'?30:Math.max(14,e.r*2.2),a=DART[artKey(e)],hh=a?Math.min(a.h*a.m,70):30,an=st.an.get(e.id),Y=o.y-o.z-hh-4;
   if(e.dep>0&&e.dep0>0){// Deploy: blauer Füllbalken über dem Kopf
    const k=Math.max(0,Math.min(1,1-e.dep/e.dep0));ctx.fillStyle='rgba(10,6,2,.8)';ctx.fillRect(o.x-w/2-1,Y-1,w+2,5);ctx.fillStyle='#1c3a70';ctx.fillRect(o.x-w/2,Y,w,3);ctx.fillStyle='#6ab8ff';ctx.fillRect(o.x-w/2,Y,w*k,3);continue;}
   hpBar(o.x,Y,w,e.hero?4:3,(an?an.hpd:e.hp)/e.maxhp,e.side,e.hero,an?an.hpt/e.maxhp:0);if(e.hero){ctx.fillStyle='#ffd860';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(o.x-w/2-6,o.y-o.z-hh-6);ctx.lineTo(o.x-w/2-2,o.y-o.z-hh-2);ctx.lineTo(o.x-w/2-6,o.y-o.z-hh+2);ctx.lineTo(o.x-w/2-10,o.y-o.z-hh-2);ctx.closePath();ctx.fill();ctx.stroke();}}}
 // Fähigkeits-Ziel
 if(st.aim){const h=Sim.byId(S,S.p[0].heroId);if(h){const A=CARDS[h.card].abil;ctx.strokeStyle='rgba(255,220,100,.6)';ctx.setLineDash([4,4]);ctx.lineWidth=1.5;if(A.reach){ctx.beginPath();ctx.ellipse(h.x,h.y,A.reach,A.reach*.75,0,0,7);ctx.stroke();}ctx.setLineDash([]);
  if(st.aim.x!=null){let tx=st.aim.x,ty=st.aim.y;if(A.reach){const d=Math.hypot(tx-h.x,ty-h.y);if(d>A.reach){tx=h.x+(tx-h.x)*A.reach/d;ty=h.y+(ty-h.y)*A.reach/d;}}const r=A.r||44;ctx.fillStyle='rgba(255,220,100,.22)';ctx.strokeStyle='#ffd860';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(tx,ty,r,r*.6,0,0,7);ctx.fill();ctx.stroke();}}}
 // Platzierungs-Geist: Live-Vorschau beim Ziehen (grün = gültig, rot = ungültig)
 if(st.ghost&&st.ghost.x!=null){const g=st.ghost,C=CARDS[g.card],ok=g.ok,pul=.5+.5*Math.sin(T*8);
  const colS=ok?'#5dffb0':'#ff4a3a',colF=ok?'rgba(70,230,170,.3)':'rgba(255,50,40,.3)';
  if(g.fx!=null){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(g.fx,g.fy);ctx.lineTo(g.x,g.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(g.fx,g.fy,2.6,0,7);ctx.fill();}
  if(C.type==='spell'){const r=C.s.r;ctx.fillStyle=colF;ctx.strokeStyle=colS;ctx.lineWidth=2+pul;ctx.beginPath();ctx.ellipse(g.x,g.y,r,r*.6,0,0,7);ctx.fill();ctx.stroke();
   ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(g.x-6,g.y);ctx.lineTo(g.x+6,g.y);ctx.moveTo(g.x,g.y-4);ctx.lineTo(g.x,g.y+4);ctx.stroke();}
  else{const FORM={1:[[0,0]],2:[[-11,0],[11,0]],3:[[0,-10],[-12,8],[12,8]],4:[[-11,-11],[11,-11],[-11,11],[11,11]],5:[[0,0],[-16,-9],[16,-9],[-16,10],[16,10]]};
   const n=C.count||1,sp=C.type==='bld'?null:Sim.splitCount(S,0,g.x,n),l1=Sim.inMid(g.x)?Sim.midLane(S,0,g.x):Sim.laneOf(g.x);
   // Positionen wie in der Logik (Aufteilung: links/rechts versetzt)
   let f=[];if(sp){for(let l=0;l<2;l++)if(sp[l])for(const[dx,dy]of FORM[sp[l]])f.push([(l?9:-9)+dx*.7,dy,l]);}else f=(FORM[n]||FORM[1]).map(([dx,dy])=>[dx,dy,l1]);
   const labs=[];
   if(ok&&C.type!=='bld'){// Weg-Vorschau: Pfadlinie je Spur (bei Aufteilung zwei Pfeile)
    const lanes=sp?[0,1].filter(l=>sp[l]):[l1];
    for(const l of lanes){const bx=Sim.BRIDGES[l],gt=Sim.tower(S,1,'guard',l),tg=gt&&gt.hp>0?gt:Sim.tower(S,1,'keep');const sx=g.x+(sp?(l?9:-9):0);
     const pts=[[sx,g.y]];if(!C.air&&g.y>Sim.RY0){pts.push([bx,Sim.RY1+6],[bx,Sim.RY0-8]);}if(tg)pts.push([tg.x,tg.y+14]);
     const col=sp?(l?'rgba(255,200,90,.85)':'rgba(130,215,255,.85)'):'rgba(130,205,255,.6)';
     ctx.strokeStyle=col;ctx.lineWidth=sp?2.6:2;ctx.setLineDash([6,5]);ctx.lineDashOffset=-T*24;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))ctx.lineTo(p[0],p[1]);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0;
     // Pfeilspitze auf dem ersten Abschnitt
     const [ax,ay]=pts[0],[bx2,by2]=pts[1]||pts[0],dd=Math.hypot(bx2-ax,by2-ay)||1,ux=(bx2-ax)/dd,uy=(by2-ay)/dd,m=Math.min(30,dd*.6),hx=ax+ux*m,hy=ay+uy*m;
     ctx.fillStyle=col;ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(hx+ux*8,hy+uy*8);ctx.lineTo(hx-uy*5.5,hy+ux*5.5);ctx.lineTo(hx+uy*5.5,hy-ux*5.5);ctx.closePath();ctx.fill();ctx.stroke();
     if(sp)labs.push(['×'+sp[l]+(l?' →':''),(l?'← ':'')&&0,hx+ux*14+(l?16:-16),hy+uy*14,l]);}}
   const b0=C.u||C.b,R0=b0.r*1.4+(n>1?12:0);
   ctx.fillStyle=colF;ctx.strokeStyle=OL;ctx.lineWidth=4.5+pul;ctx.beginPath();ctx.ellipse(g.x,g.y,R0,R0*.6,0,0,7);ctx.stroke();ctx.strokeStyle=colS;ctx.lineWidth=2.2+pul;ctx.beginPath();ctx.ellipse(g.x,g.y,R0,R0*.6,0,0,7);ctx.fill();ctx.stroke();
   if(C.type==='bld'&&b0.range){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.ellipse(g.x,g.y,b0.range,b0.range*.75,0,0,7);ctx.stroke();ctx.setLineDash([]);}
   const c=spr(vk(C.art==='fire'?'firerain':C.art,0));
   if(c)for(const[dx,dy]of f){const x=C.type==='bld'?g.x:Math.max(8,Math.min(FW-8,g.x+dx)),y=g.y+dy-(C.air?24:0);
    ctx.globalAlpha=ok?.85:.55;blit(c,x,y,false);ctx.globalAlpha=ok?.16+.14*pul:.5;blit(tint(c,ok?'#b0ffe8':'#ff2a18'),x,y,false);}
   ctx.globalAlpha=1;
   for(const[t,,lx,ly,l]of labs){const tx=(l?'':'← ')+t.replace(' →','')+(l?' →':'');ctx.font='bold 11px system-ui,sans-serif';ctx.textAlign='center';const w=ctx.measureText(tx).width+8;ctx.fillStyle='rgba(20,12,4,.8)';ctx.strokeStyle=l?'rgba(255,200,90,.9)':'rgba(130,215,255,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect?ctx.roundRect(lx-w/2,ly-8,w,15,5):ctx.rect(lx-w/2,ly-8,w,15);ctx.fill();ctx.stroke();ctx.fillStyle='#fff3c0';ctx.fillText(tx,lx,ly+3.5);}}
  if(!ok){const yy=g.y-(C.type==='spell'?0:14);ctx.strokeStyle=OL;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(g.x-6,yy-6);ctx.lineTo(g.x+6,yy+6);ctx.moveTo(g.x+6,yy-6);ctx.lineTo(g.x-6,yy+6);ctx.stroke();ctx.strokeStyle='#ff4a3a';ctx.lineWidth=2.6;ctx.stroke();
   const msg=g.err==='Hier nicht erlaubt'?'Gesperrt':g.err||'';if(msg){ctx.font='bold 9px system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.9)';const ty=g.y-(C.type==='spell'?C.s.r*.6+6:46);ctx.strokeText(msg,g.x,ty);ctx.fillStyle='#ffb0a0';ctx.fillText(msg,g.x,ty);}}}
}

// ---------- Türme 0.3: Lebensanzeige (immer sichtbar, unter dem Sockel), Schadenszustände, Ruhe-Anzeige ----------
const TPLATE={keep:{w:64,dy:13},guard:{w:50,dy:11}};
function towerPlate(o,e,T){const P_=TPLATE[e.sub]||TPLATE.guard,w=P_.w,h=10,x=o.x;let y=o.y+P_.dy;y=Math.max(Sim.FH*0+(-30),Math.min(VY1-h-4,y));
 const f=Math.max(0,e.hp/e.maxhp),low=f<.33,col=e.side?(low?'#ff7a3a':'#e8402c'):(low?'#ffb03a':'#3a8cff');
 ctx.save();ctx.fillStyle='rgba(12,8,4,.88)';ctx.strokeStyle=e.side?'#ff8a70':'#8ac0ff';ctx.lineWidth=1.2;rrect(x-w/2-2,y-2,w+4,h+4,4);ctx.fill();ctx.stroke();
 ctx.fillStyle=e.side?'#4a1410':'#13284a';ctx.fillRect(x-w/2,y,w,h);
 ctx.fillStyle=col;if(low)ctx.globalAlpha=.75+.25*Math.sin(T*10);ctx.fillRect(x-w/2,y,w*f,h);ctx.globalAlpha=1;
 ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(x-w/2,y,w*f,h*.4);
 ctx.font='bold 9px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=2.6;ctx.strokeStyle='#000';const t=String(Math.ceil(e.hp));ctx.strokeText(t,x,y+h/2+.5);ctx.fillStyle='#fff';ctx.fillText(t,x,y+h/2+.5);
 if(e.sub==='keep'){// Krone links an der Plakette
  const cx=x-w/2-7,cy=y+h/2;ctx.fillStyle=e.side?'#ff9a80':'#ffd860';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-5,cy+3);ctx.lineTo(cx-5,cy-3);ctx.lineTo(cx-2.5,cy);ctx.lineTo(cx,cy-4);ctx.lineTo(cx+2.5,cy);ctx.lineTo(cx+5,cy-3);ctx.lineTo(cx+5,cy+3);ctx.closePath();ctx.fill();ctx.stroke();
  if(!e.active){// ruht: Schloss-Symbol + Zzz
   const zx=x+w/2+8,zy=y+h/2;ctx.fillStyle='#2a2a34';ctx.strokeStyle='#c8c8d8';ctx.lineWidth=1.2;rrect(zx-4,zy-1,8,6,1.5);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(zx,zy-1,2.6,Math.PI,0);ctx.stroke();
   ctx.font='bold 8px system-ui,sans-serif';const zz=(T*.8)%1;ctx.globalAlpha=1-zz;ctx.fillStyle='#d8e4ff';ctx.strokeStyle='#000';ctx.lineWidth=2;const zt='z',yy=o.y-(e.side?40:62)-zz*10;ctx.strokeText('Zz',o.x+20+zz*4,yy);ctx.fillText('Zz',o.x+20+zz*4,yy);ctx.globalAlpha=1;}}
 ctx.restore();}
function rrect(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);}
const CRACKS={},SMK={};
function crackSet(e){const K=e.id;if(CRACKS[K])return CRACKS[K];let sd=(e.id*9301+49297)%233280;const r=()=>(sd=(sd*9301+49297)%233280)/233280;
 const box=e.sub==='keep'?[-26,26,-42,-4]:[-15,15,-30,2],set=[];
 for(let i=0;i<7;i++){let x=box[0]+r()*(box[1]-box[0]),y=box[2]+r()*(box[3]-box[2]);const pts=[[x,y]];let a=Math.PI/2+(r()-.5)*1.6;for(let k=0;k<4;k++){x+=Math.cos(a)*(3+r()*4);y+=Math.sin(a)*(3+r()*4);a+=(r()-.5)*1.4;pts.push([x,y]);}set.push(pts);}
 return CRACKS[K]=set;}
function towerDamage(o,e,T,dt){const f=e.hp/e.maxhp;if(f>=.66)return;const set=crackSet(e),n=f<.33?7:3;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 for(let i=0;i<n;i++){const pts=set[i];ctx.beginPath();pts.forEach((p,j)=>j?ctx.lineTo(o.x+p[0],o.y+p[1]):ctx.moveTo(o.x+p[0],o.y+p[1]));ctx.strokeStyle='rgba(10,6,2,.85)';ctx.lineWidth=1.8;ctx.stroke();
  ctx.beginPath();pts.forEach((p,j)=>j?ctx.lineTo(o.x+p[0]+.8,o.y+p[1]+.6):ctx.moveTo(o.x+p[0]+.8,o.y+p[1]+.6));ctx.strokeStyle='rgba(220,210,190,.35)';ctx.lineWidth=.7;ctx.stroke();}
 if(f<.33){// Feuer + Rauch
  const top=e.sub==='keep'?-58:-40;for(const[dx,dy]of[[-12,top+18],[10,top+8]]){const fl=.7+.3*Math.sin(T*18+dx);ctx.shadowColor='#ff6a10';ctx.shadowBlur=8;ctx.fillStyle='#ff8a20';ctx.beginPath();ctx.moveTo(o.x+dx-3.4,o.y+dy);ctx.quadraticCurveTo(o.x+dx,o.y+dy-12*fl,o.x+dx+3.4,o.y+dy);ctx.fill();ctx.fillStyle='#ffe070';ctx.beginPath();ctx.moveTo(o.x+dx-1.6,o.y+dy);ctx.quadraticCurveTo(o.x+dx,o.y+dy-6*fl,o.x+dx+1.6,o.y+dy);ctx.fill();ctx.shadowBlur=0;}
  const sm=(SMK[e.id]||0)+dt;SMK[e.id]=sm;if(sm>.22){SMK[e.id]=0;st.fx.push({k:'puff',x:o.x+(Math.random()-.5)*20,y:o.y+top+6,r:7+Math.random()*6,max:1.4,t:0,c:'#4a443e',rise:26});}}
 ctx.restore();}
// ---------- Kampf-Animationen (reine Darstellung, beeinflusst die Simulation nicht) ----------
const WSTYLE={orcs:'axe',blade:'sword',giant:'club',bats:'claw',skels:'sword',knight:'sword',wolves:'bite',ogre:'club',zepp:'none',archers:'bow',skelarch:'bow',firemage:'cast',frosthero:'cast',poisonhero:'cast',shaman:'cast',lich:'cast',alch:'throw'};
const CASTC={firemage:'#ff9a30',frosthero:'#a0e8ff',poisonhero:'#9aff60',shaman:'#ffe860',lich:'#c080ff'};
const NOLEGS={zepp:1,bats:1};
// 0.7 neue Kreaturen
Object.assign(WSTYLE,{storm:'cast',netter:'throw',troll:'club',trollking:'club',banner:'sword',burrow:'bite',treant:'club',thorn:'cast',shade:'claw',whelp:'breath',frostwyrm:'breath',dragonlord:'breath'});
Object.assign(CASTC,{storm:'#9ad0ff',thorn:'#a8ff70',whelp:'#ff9a30',frostwyrm:'#a0e8ff',dragonlord:'#ff7a20'});
Object.assign(NOLEGS,{shade:1,whelp:1,frostwyrm:1,dragonlord:1,burrow:1});
function hOf(e){const a=DART[artKey(e)]||{h:40,m:1};return Math.min(a.h*a.m,70);}
function tint(c,col){const K='_t'+col;if(c[K])return c[K];const t=document.createElement('canvas');t.width=c.width;t.height=c.height;const g=t.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,t.width,t.height);t._ax=c._ax;t._ay=c._ay;t._w=c._w;t._h=c._h;return c[K]=t;}
function track(S,list,dt){if(st.simRef!==S){st.simRef=S;st.an=new Map();st.corpses=[];}
 const fr=++st.frame;
 for(const o of list){const e=o.e;let a=st.an.get(e.id);
  if(!a){a={hpd:e.hp,hpt:e.hp,hp:e.hp,fl:0,kx:0,ky:0,kt:0,dn:0,dnT:0,side:e.side,wp:(e.id*1.7)%6.28};st.an.set(e.id,a);}
  if(e.hp<a.hp-.5){const d=a.hp-e.hp;if(d>=10)a.fl=.14;a.dn+=d;}
  if(dt>0){a.hpd+=(e.hp-a.hpd)*Math.min(1,dt*9);a.hpt+=(e.hp-a.hpt)*Math.min(1,dt*2.2);if(a.hpt<a.hpd)a.hpt=a.hpd;}else if(e.hp>a.hpd){a.hpd=a.hpt=e.hp;}
  a.hp=e.hp;a.fr=fr;a.o=o;a.fl=Math.max(0,a.fl-dt);a.kt=Math.max(0,a.kt-dt);a.dnT-=dt;
  if(st.dmgNums&&dt>0&&a.dn>=25&&a.dnT<=0){fx({k:'dmg',x:o.x+((e.id*7)%9-4),y:o.y-o.z-(e.cls==='tower'?96:hOf(e)+8),txt:String(Math.round(a.dn)),c:e.side?'#ffe9a0':'#ffb4a8',max:.8});a.dn=0;a.dnT=.35;}
  if(dt>0&&e.mv&&!e.frz&&!e.stun)a.wp+=dt*(e.st&&e.st.spd?e.st.spd*.36:9);}
 for(const[id,a]of st.an){if(a.fr===fr)continue;st.an.delete(id);const o=a.o,e=o.e;if(e.cls==='tower'||e.hp>0)continue;
  const c=e.cls==='bld'&&e.card==='sling'?spr(vk('sling',e.side)):spr(artKey(e));if(!c)continue;
  const style=e.cls==='bld'?'bld':e.air?'air':/skel|lich|giant/.test(e.card)?'crumble':'fall';
  st.corpses.push({c,x:o.x,y:o.y,z:o.z,flip:e.cls==='unit'&&e.face<0,face:e.face||1,style,t:0,max:style==='bld'?.8:style==='crumble'?.9:1.1,hh:hOf(e)});
  if(style==='crumble')parts(o.x,o.y-hOf(e)*.5,8,'#e8e0c8',30,.7,1);if(style==='bld')parts(o.x,o.y-6,12,'#a89878',40,.6,1);}
 if(st.corpses.length>40)st.corpses.splice(0,st.corpses.length-40);}
function drawCorpses(dt){st.corpses=st.corpses.filter(q=>(q.t+=dt)<q.max);
 for(const q of st.corpses){const t=q.t,c=q.c,f0=q.max*.55,fade=t<f0?1:1-(t-f0)/(q.max-f0);
  ctx.save();ctx.globalAlpha=Math.max(0,fade);
  if(q.style==='fall'){const k=Math.min(1,t/.32),b=k<1?k*k:1+Math.sin(Math.min(1,(t-.32)/.15)*Math.PI)*-.08;
   ctx.translate(q.x,q.y+2*k);ctx.rotate(-q.face*b*1.42);ctx.scale(q.flip?-1:1,1);ctx.drawImage(c,-c._ax,-c._ay,c._w,c._h);
   if(t>.3){ctx.globalAlpha=Math.max(0,fade)*Math.min(.45,(t-.3)*1.2);ctx.drawImage(tint(c,'#1a1008'),-c._ax,-c._ay,c._w,c._h);}}
  else if(q.style==='crumble'){const k=Math.min(1,t/.75);ctx.beginPath();ctx.rect(q.x-80,q.y-160,160,163);ctx.clip();ctx.translate(q.x+Math.sin(t*60)*(1-k)*1.2,q.y+k*q.hh*1.05);ctx.scale((q.flip?-1:1)*(1+k*.25),1-k*.15);ctx.drawImage(c,-c._ax,-c._ay,c._w,c._h);}
  else if(q.style==='air'){const k=Math.min(1,t/.4),z=q.z*(1-k*k);ctx.translate(q.x,q.y-z);ctx.rotate(q.face*k*2.4);ctx.scale(q.flip?-1:1,1-(k>=1?.3:0));ctx.drawImage(c,-c._ax,-c._ay,c._w,c._h);}
  else{const k=Math.min(1,t/.55);ctx.translate(q.x,q.y);ctx.scale(1+k*.12,1-k*.7);ctx.drawImage(c,-c._ax,-c._ay,c._w,c._h);}
  ctx.restore();}
 ctx.globalAlpha=1;}
function drawSpr(c,x,y,flip,rot,sx,sy,legK){if(!rot&&sx===1&&sy===1&&!legK){blit(c,x,y,flip);return;}
 ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.scale(flip?-sx:sx,sy);
 if(!legK){ctx.drawImage(c,-c._ax,-c._ay,c._w,c._h);ctx.restore();return;}
 const pr=c.width/c._w,legH=Math.min(9,c._ay*.3),hipPx=Math.max(1,Math.round((c._ay-legH)*pr)),axPx=Math.max(1,Math.min(c.width-1,Math.round(c._ax*pr))),hip=hipPx/pr,ax=axPx/pr,lh=c.height-hipPx;
 // Oberkörper
 ctx.drawImage(c,0,0,c.width,Math.min(c.height,hipPx+1),-c._ax,-c._ay,c._w,Math.min(c.height,hipPx+1)/pr);
 // Beine: linke und rechte Hälfte gegenläufig geschert = Schrittbewegung
 if(lh>0)for(const sd of[-1,1]){ctx.save();ctx.translate(0,hip-c._ay);ctx.transform(1,0,legK*sd,1,0,0);
  if(sd<0)ctx.drawImage(c,0,hipPx,axPx,lh,-c._ax,0,ax,lh/pr);else ctx.drawImage(c,axPx,hipPx,c.width-axPx,lh,ax-c._ax,0,c._w-ax,lh/pr);ctx.restore();}
 ctx.restore();}
function swoosh(x,y,face,k,hh,W){const R=Math.min(30,Math.max(11,hh*.62))*(W==='club'?1.15:1),px=x+face*2,py=y-hh*.5;
 if(W==='bite'||W==='claw'){if(k>.7)return;const a=1-k/.7,L=4+k*9;ctx.save();ctx.translate(px+face*R*.75,py+(W==='claw'?8:6));ctx.strokeStyle=`rgba(255,236,225,${a})`;ctx.lineWidth=1.5;ctx.beginPath();
  for(let i=-1;i<=1;i++){ctx.moveTo(i*4-L*.4*face,-L*.6);ctx.lineTo(i*4+L*.4*face,L*.6);}ctx.stroke();ctx.restore();return;}
 const a0=-2.15,a1=.75,e1=1-Math.pow(1-Math.min(1,k*1.3),3),head=a0+(a1-a0)*e1,tail=Math.max(a0,head-1.6),fade=k<.55?1:Math.max(0,1-(k-.55)/.45);
 ctx.save();ctx.translate(px,py);ctx.scale(face,.82);
 const col=W==='axe'?'255,214,150':W==='club'?'235,205,160':'230,242,255',w0=W==='club'?3:2,w1=W==='club'?7.5:5.5;
 ctx.strokeStyle=`rgba(${col},${fade*.22})`;ctx.lineWidth=w1+4;ctx.beginPath();ctx.arc(0,0,R,tail+(head-tail)*.35,head);ctx.stroke();
 for(let i=0;i<6;i++){const t0=tail+(head-tail)*i/6,t1=tail+(head-tail)*(i+1)/6;ctx.strokeStyle=`rgba(${col},${fade*(i+1)/6*.85})`;ctx.lineWidth=w0+(i/6)*(w1-w0);ctx.beginPath();ctx.arc(0,0,R,t0,t1);ctx.stroke();}
 ctx.strokeStyle=`rgba(255,255,255,${fade})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(Math.cos(head)*R*.45,Math.sin(head)*R*.45);ctx.lineTo(Math.cos(head)*R*1.1,Math.sin(head)*R*1.1);ctx.stroke();
 ctx.restore();}
function bowDraw(x,y,face,kw,hh,t){const hx=x+face*5,hy=y-hh*.52;let dx=t.x-x,dy=(t.y-(t.air?28:12))-hy;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
 const pull=1+5*kw,nx=-dy,ny=dx,bx=hx+dx*4,by=hy+dy*4,ex=hx-dx*pull,ey=hy-dy*pull;
 ctx.strokeStyle='rgba(250,240,210,.95)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(bx+nx*6.5,by+ny*6.5);ctx.lineTo(ex,ey);ctx.lineTo(bx-nx*6.5,by-ny*6.5);ctx.stroke();
 ctx.strokeStyle=OL;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+dx*12,ey+dy*12);ctx.stroke();ctx.strokeStyle='#efe2c4';ctx.lineWidth=1.1;ctx.stroke();
 ctx.fillStyle='#d8dce2';ctx.beginPath();ctx.moveTo(ex+dx*14,ey+dy*14);ctx.lineTo(ex+dx*11+nx*2,ey+dy*11+ny*2);ctx.lineTo(ex+dx*11-nx*2,ey+dy*11-ny*2);ctx.fill();}
function castOrb(x,y,face,kw,ks,hh,col){const px=x+face*8,py=y-hh*.92,rel=ks>=0&&ks<.35,r=rel?(1-ks/.35)*6:1.2+4.2*kw;if(r<=.2)return;
 const g=ctx.createRadialGradient(px,py,0,px,py,r*2.4);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.35,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r*2.4,0,7);ctx.fill();
 if(kw>0){ctx.strokeStyle=col;ctx.globalAlpha=.8*kw;ctx.lineWidth=1.1;ctx.beginPath();for(let i=0;i<4;i++){const an=st.time*7+i*1.571,rr=(1-kw)*14+5;ctx.moveTo(px+Math.cos(an)*rr,py+Math.sin(an)*rr);ctx.lineTo(px+Math.cos(an)*(rr-3.5),py+Math.sin(an)*(rr-3.5));}ctx.stroke();ctx.globalAlpha=1;}}
function drawEnt(S,o){const e=o.e,key=artKey(e);let c;
 if(e.cls==='bld'&&e.card==='sling'){const fk=Math.round(e.x)+'|'+Math.round(e.y);c=spr(vk(st.flashSling[fk]>0?'sling2':'sling',e.side));}
 else if(e.bur)c=spr('mound');// 0.7 eingegraben: nur ein Erdhügel ist zu sehen
 else if(e.air&&DART[key+'_f']&&Math.sin(st.time*9+e.id*1.3)>.15)c=spr(key+'_f');// 0.7 Flügelschlag
 else c=spr(key);
 if(!c)return;const dep=e.dep>0;
 if(dep){const k=e.dep0?1-e.dep/e.dep0:1;ctx.fillStyle=e.side?'rgba(255,90,70,.28)':'rgba(90,160,255,.28)';ctx.beginPath();ctx.ellipse(o.x,o.y,e.r+3,(e.r+3)*.55,0,0,7);ctx.fill();ctx.globalAlpha=.32+.28*k;}
 const a=st.an.get(e.id)||{fl:0,kt:0,kx:0,ky:0,wp:0},hh=hOf(e),face=e.face||1,flip=e.cls==='unit'&&face<0;
 let dx=0,dy=0,rot=0,sx=1,sy=1,legK=0,W=null,ks=-1,kw=0,tgt=null;
 if(e.cls==='unit'){W=WSTYLE[e.card]||'sword';const at=(S.tick-e.atkT)*Sim.TICK,hit=e.st.hit||1,busy=!e.frz&&!e.stun&&!dep&&!e.thrown&&!e.leap;
  tgt=e.tgt?Sim.byId(S,e.tgt):null;const Wd=Math.min(.34,hit*.45);
  if(e.bur)W='none';
  kw=busy&&tgt&&e.lock&&e.cd>0&&e.cd<Wd?1-e.cd/Wd:0;ks=at>=0&&at<.24?at/.24:-1;const pk=W!=='bow'&&W!=='cast'&&W!=='throw'&&W!=='breath'?(Sim.SWING||2)*Sim.TICK/.24:.3;
  if(W==='sword'||W==='axe'||W==='club'||W==='claw'||W==='bite'){const big=W==='club'?1.4:1;
   if(kw>0){rot-=face*.17*big*kw*kw;dx-=face*1.6*kw;if(W==='club')sy=1+.04*kw;}
   if(ks>=0){const p=Math.sin(Math.PI*Math.min(1,ks*.5/pk));rot+=face*.24*big*p;dx+=face*(W==='axe'?7:W==='bite'?6:4)*Math.sin(Math.PI*ks);if(W==='axe'||W==='bite')dy-=(W==='axe'?6:4)*Math.sin(Math.PI*ks);}}
  else if(W==='bow'){if(kw>0){rot-=face*.07*kw;sx=1-.03*kw;}if(ks>=0&&ks<.4)dx-=face*1.6*Math.sin(Math.PI*ks/.4);}
  else if(W==='cast'){if(kw>0){dy-=2.2*kw;sy=1+.05*kw;sx=1-.02*kw;}if(ks>=0&&ks<.5)rot+=face*.1*Math.sin(Math.PI*ks/.5);}
  else if(W==='breath'){if(kw>0){rot-=face*.1*kw;dx-=face*2*kw;dy-=2*kw;}if(ks>=0&&ks<.5){rot+=face*.14*Math.sin(Math.PI*ks/.5);dx+=face*4*Math.sin(Math.PI*ks/.5);}}
  else if(W==='throw'){if(kw>0)rot-=face*.2*kw;if(ks>=0)rot+=face*.22*Math.sin(Math.PI*Math.min(1,ks*1.5));}
  if(e.bur&&e.mv&&Math.random()<.12)parts(o.x,o.y,1,'#7a5a36',14,.4);
  if(e.mv&&busy&&ks<0&&kw===0){const ph=a.wp;if(e.air)dy-=Math.sin(ph*1.6)*1.2;else{dy-=Math.abs(Math.sin(ph))*1.8;rot+=Math.sin(ph)*.05;if(!NOLEGS[e.card])legK=Math.sin(ph)*.42;}}
  if(a.kt>0){const k=a.kt/.16;dx+=a.kx*k;dy+=a.ky*k;rot+=face*.05*Math.sin(k*9)*k;}}
 const X=o.x+dx,Y=o.y-o.z+dy;
 drawSpr(c,X,Y,flip,rot,sx,sy,legK);
 if(a.fl>0){const al=ctx.globalAlpha;ctx.globalAlpha=Math.min(1,a.fl/.14)*(e.cls==='tower'?.3:.7)*al;drawSpr(tint(c,'#ffffff'),X,Y,flip,rot,sx,sy,0);ctx.globalAlpha=al;}
 if(dep)ctx.globalAlpha=1;
 // 0.7 Status: Netz/Wurzeln, Furcht, Stärkung, Auren
 if(e.cls==='unit'&&!dep){const y0=o.y-o.z;
  if(e.rootT>0){ctx.save();ctx.strokeStyle='rgba(215,195,140,.95)';ctx.lineWidth=1.1;const w=e.r*1.25,hN=Math.min(hh*.7,30);ctx.beginPath();for(let i=-2;i<=2;i++){ctx.moveTo(o.x+i*w*.4,y0+2);ctx.lineTo(o.x+i*w*.25,y0-hN);}for(let j=0;j<4;j++){const yy=y0-j*hN/3.2;ctx.moveTo(o.x-w*(1-j*.12),yy);ctx.lineTo(o.x+w*(1-j*.12),yy);}ctx.stroke();
   if(!e.air){ctx.strokeStyle='rgba(90,140,40,.95)';ctx.lineWidth=2;for(const s0 of[-1,1]){ctx.beginPath();ctx.moveTo(o.x+s0*w,y0+3);ctx.quadraticCurveTo(o.x+s0*w*1.2,y0-hN*.6,o.x+s0*w*.2,y0-hN*.5);ctx.stroke();}}ctx.restore();}
  if(e.fearT>0){ctx.font='bold 11px system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';const yy=y0-hh-6+Math.sin(st.time*14)*1.5;ctx.strokeText('!',o.x,yy);ctx.fillStyle='#d8a0ff';ctx.fillText('!',o.x,yy);}
  if(e.bufT>S.tick||e.auraT>S.tick){const ch=e.bufT>S.tick;ctx.strokeStyle=ch?`rgba(255,120,50,${.55+.3*Math.sin(st.time*10)})`:'rgba(255,220,100,.6)';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(o.x,o.y,e.r*1.45,e.r*.7,0,0,7);ctx.stroke();
   if(ch&&Math.random()<.08)fx({k:'p',x:o.x+(Math.random()-.5)*e.r*2,y:o.y,z:hh*.3,vx:0,vy:0,vz:30,c:'#ff9a40',max:.5,r:1.4});}
  if(e.st&&(e.st.aura||e.st.thorns)){const r=(e.st.aura||e.st.thorns).r;ctx.strokeStyle=e.st.aura?'rgba(255,220,110,.28)':'rgba(150,230,90,.3)';ctx.setLineDash([4,5]);ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(o.x,o.y,r,r*.6,0,0,7);ctx.stroke();ctx.setLineDash([]);}}
 if(W&&!dep){if(ks>=0&&W!=='bow'&&W!=='cast'&&W!=='throw'&&W!=='none'&&W!=='breath')swoosh(X,Y,face,ks,hh,W);
  if(W==='breath'&&(kw>0||(ks>=0&&ks<.4))){const A=DART[key]||{},hd=A.head||[20,-30],m=A.m||1,px=X+face*hd[0]*m,py=Y+hd[1]*m,col=CASTC[e.card]||'#ff9a30',r=ks>=0?6*(1-ks/.4)+2:1.5+4*kw;
   const gr=ctx.createRadialGradient(px,py,0,px,py,r*2.2);gr.addColorStop(0,'rgba(255,255,230,.95)');gr.addColorStop(.4,col);gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(px,py,r*2.2,0,7);ctx.fill();
   if(ks>=0&&Math.random()<.7)fx({k:'p',x:px,y:py,z:0,vx:face*(40+Math.random()*40),vy:(Math.random()-.5)*20,vz:0,c:col,max:.3,r:2+Math.random()*2});}
  if(W==='bow'&&kw>0&&tgt)bowDraw(X,Y,face,kw,hh,tgt);
  if(W==='cast'&&(kw>0||(ks>=0&&ks<.35)))castOrb(X,Y,face,kw,ks,hh,CASTC[e.card]||'#fff');}
 if(e.frz>0){ctx.fillStyle='rgba(160,225,255,.45)';ctx.strokeStyle='rgba(230,250,255,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(o.x,o.y-o.z-hh*.45,e.r*1.3,hh*.55,0,0,7);ctx.fill();ctx.stroke();}
 else if(e.stun>0){for(let i=0;i<3;i++){const ang=st.time*6+i*2.09;ctx.fillStyle='#ffe860';ctx.beginPath();ctx.arc(o.x+Math.cos(ang)*8,o.y-o.z-hh-2+Math.sin(ang)*2.5,1.8,0,7);ctx.fill();}}
 if(e.slowT>0&&!e.frz){ctx.fillStyle='rgba(120,200,255,.8)';for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(o.x+Math.sin(st.time*4+i*3)*e.r,o.y-o.z-hh*.3-((st.time*12+i*6)%12),1.2,0,7);ctx.fill();}}
 if(e.burn&&e.dotT>0){for(let i=0;i<3;i++){const fx0=o.x+(i-1)*e.r*.55,fy=o.y-o.z-hh*(.25+.22*((i*7)%3)),fl=.6+.4*Math.sin(st.time*20+i*2);ctx.save();ctx.shadowColor='#ff6a10';ctx.shadowBlur=8;ctx.fillStyle='#ff8a20';ctx.beginPath();ctx.moveTo(fx0-3.5,fy);ctx.quadraticCurveTo(fx0,fy-13*fl,fx0+3.5,fy);ctx.fill();ctx.fillStyle='#ffe070';ctx.beginPath();ctx.moveTo(fx0-1.6,fy);ctx.quadraticCurveTo(fx0,fy-6*fl,fx0+1.6,fy);ctx.fill();ctx.restore();}}
 else if(e.dot>0){ctx.fillStyle='rgba(140,255,80,.85)';for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(o.x+Math.cos(st.time*3+i*3)*e.r*.8,o.y-o.z-hh*.5-((st.time*10+i*7)%14),1.4,0,7);ctx.fill();}}}
const PCOL={zap:'#bfe0ff',net:'#e0d0a0',flame:'#ff8a20',icebreath:'#a8e8ff',thorn:'#a8ff70',arrow:'#e8dcc0',tarrow:'#f0e4c8',fireball:'#ff9a30',flask:'#8aff40',frostbolt:'#a0e8ff',poison:'#9aff60',bolt:'#ffe860',shadow:'#b060ff'};
function drawProj(p,alpha){const x=lerp(p.ox,p.x,alpha),y=lerp(p.oy,p.y,alpha);if(p._d0==null)p._d0=Math.max(1,Math.hypot(p.tx-p.x,p.ty-p.y));
 const d=Math.hypot(p.tx-x,p.ty-y),k=Math.max(0,Math.min(1,1-d/p._d0));const z=lerp(p.z,p.tz,k)+Math.sin(Math.PI*k)*(p.arc?p._d0*.35:p._d0*.08);const sy=y-z;
 const c=PCOL[p.kind]||'#fff';
 if(p.kind==='arrow'||p.kind==='tarrow'){const a=Math.atan2((p.ty-p.tz)-sy,p.tx-x);ctx.save();ctx.translate(x,sy);ctx.rotate(a);ctx.strokeStyle=OL;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(4,0);ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=1.3;ctx.stroke();
  ctx.fillStyle='#d8dce2';ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(2,-2.2);ctx.lineTo(2,2.2);ctx.fill();ctx.fillStyle=p.side?'#ff6a50':'#6aa8ff';ctx.fillRect(-10,-1.8,3,3.6);ctx.restore();return;}
 if(p.kind==='thorn'){const a=Math.atan2((p.ty-p.tz)-sy,p.tx-x);ctx.save();ctx.translate(x,sy);ctx.rotate(a);ctx.strokeStyle=OL;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(4,0);ctx.stroke();ctx.strokeStyle='#5a8a2a';ctx.lineWidth=1.4;ctx.stroke();
  ctx.fillStyle='#c8ff90';ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(2,-2.4);ctx.lineTo(2,2.4);ctx.fill();ctx.fillStyle='#4a9a2a';ctx.beginPath();ctx.ellipse(-8,0,3,1.6,0,0,7);ctx.fill();ctx.restore();return;}
 if(p.kind==='net'){ctx.save();ctx.translate(x,sy);ctx.rotate(st.time*9);ctx.strokeStyle='rgba(225,205,150,.95)';ctx.lineWidth=.9;ctx.beginPath();ctx.arc(0,0,6,0,7);for(let i=-1;i<=1;i++){ctx.moveTo(i*3.5,-5);ctx.lineTo(i*3.5,5);ctx.moveTo(-5,i*3.5);ctx.lineTo(5,i*3.5);}ctx.stroke();
  ctx.fillStyle='#5a5a62';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(Math.cos(i*1.57)*6,Math.sin(i*1.57)*6,1.3,0,7);ctx.fill();}ctx.restore();return;}
 if(p.kind==='zap'){const a=Math.atan2((p.ty-p.tz)-sy,p.tx-x);ctx.save();ctx.translate(x,sy);ctx.rotate(a);ctx.shadowColor='#8ac8ff';ctx.shadowBlur=8;ctx.strokeStyle='#eaf6ff';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-22,0);for(let i=1;i<=5;i++)ctx.lineTo(-22+i*5,(i%2?-1:1)*(1.5+Math.random()*2.5));ctx.stroke();ctx.restore();return;}
 if(p.kind==='flame'||p.kind==='icebreath'){const ice=p.kind==='icebreath',r=ice?6:5,g2=ctx.createRadialGradient(x,sy,0,x,sy,r*2);g2.addColorStop(0,'rgba(255,255,240,.95)');g2.addColorStop(.45,ice?'rgba(140,220,255,.9)':'rgba(255,140,30,.9)');g2.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g2;ctx.beginPath();ctx.arc(x,sy,r*2,0,7);ctx.fill();for(let i=0;i<2;i++)st.fx.push({k:'p',x:x+(Math.random()-.5)*4,y:sy+(Math.random()-.5)*4,z:0,vx:(Math.random()-.5)*14,vy:(Math.random()-.5)*14,vz:0,c:ice?(Math.random()<.5?'#e8f8ff':'#8ad0ff'):(Math.random()<.5?'#ffd060':'#ff6a10'),max:.3,r:1.6+Math.random()*1.6,t:0});return;}
 if(p.kind==='flask'){ctx.save();ctx.translate(x,sy);ctx.rotate(st.time*10);drawFlask(ctx,0,0,.5,'#8aff40');ctx.restore();return;}
 ctx.save();ctx.shadowColor=c;ctx.shadowBlur=10;ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,sy,p.kind==='fireball'?5:3.6,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,sy,1.6,0,7);ctx.fill();ctx.restore();
 if(Math.random()<.5)st.fx.push({k:'p',x,y,z,vx:0,vy:0,vz:0,c,max:.25,r:1.6,t:0});}
function drawFx(dt){st.fx=st.fx.filter(f=>(f.t+=dt)<f.max);for(const k in st.flashSling)st.flashSling[k]-=dt;
 for(const f of st.fx){const k=f.t/f.max;
  if(f.k==='p'){f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.vz){f.z+=f.vz*dt;f.vz-=60*dt;if(f.z<0)f.z=0;}ctx.globalAlpha=Math.max(0,1-k);ctx.fillStyle=f.c;ctx.beginPath();ctx.arc(f.x,f.y-f.z,f.r*(1-k*.5),0,7);ctx.fill();}
  else if(f.k==='spark'){ctx.globalAlpha=1-k;ctx.strokeStyle=f.c;ctx.lineWidth=1.5;ctx.beginPath();const B=f.big||1;for(let i=0;i<6;i++){const a=i*1.047+f.x,r1=(2+k*4)*B,r2=(5+k*9)*B;ctx.moveTo(f.x+Math.cos(a)*r1,f.y+Math.sin(a)*r1);ctx.lineTo(f.x+Math.cos(a)*r2,f.y+Math.sin(a)*r2);}ctx.stroke();}
  else if(f.k==='ring'){ctx.globalAlpha=1-k;ctx.strokeStyle=f.c;ctx.lineWidth=f.w||3;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r*(.3+.7*k),f.r*(.3+.7*k)*.6,0,0,7);ctx.stroke();}
  else if(f.k==='fire'||f.k==='boomb'){ctx.globalAlpha=Math.max(0,1-k*k);const r=f.r*(.5+.6*k);const g=ctx.createRadialGradient(f.x,f.y-r*.3,0,f.x,f.y-r*.3,r);g.addColorStop(0,'rgba(255,250,200,.95)');g.addColorStop(.4,'rgba(255,160,40,.85)');g.addColorStop(1,'rgba(160,30,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(f.x,f.y-r*.3,r,r*.8,0,0,7);ctx.fill();}
  else if(f.k==='bolt'){ctx.globalAlpha=Math.max(0,1-k);ctx.lineJoin='round';for(const[w,c]of[[4,'rgba(120,170,255,.5)'],[1.6,'#f4faff']]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();
    for(let i=0;i<f.pts.length;i++){const p=f.pts[i];if(!i){ctx.moveTo(p[0],p[1]);continue;}const q=f.pts[i-1];for(let j=1;j<=4;j++){const t=j/4,jx=j<4?(Math.sin(i*7+j*3+f.t*60)*5):0,jy=j<4?(Math.cos(i*5+j*7+f.t*50)*5):0;ctx.lineTo(q[0]+(p[0]-q[0])*t+jx,q[1]+(p[1]-q[1])*t+jy);}}ctx.stroke();}}
  else if(f.k==='fline'){ctx.globalAlpha=Math.max(0,1-k*k);const g2=ctx.createLinearGradient(f.x0,f.y0,f.x1,f.y1);g2.addColorStop(0,'rgba(255,120,20,.2)');g2.addColorStop(Math.min(1,k*3),'rgba(255,200,80,.85)');g2.addColorStop(1,'rgba(255,90,10,.5)');
   ctx.strokeStyle=g2;ctx.lineCap='round';ctx.lineWidth=f.w*2*(1-k*.4);ctx.beginPath();ctx.moveTo(f.x0,f.y0);ctx.lineTo(f.x1,f.y1);ctx.stroke();ctx.strokeStyle='rgba(255,250,200,.7)';ctx.lineWidth=f.w*.5;ctx.stroke();}
  else if(f.k==='puff'){ctx.globalAlpha=(1-k)*.6;ctx.fillStyle=f.c||'#d8d0c0';ctx.beginPath();ctx.arc(f.x,f.y-k*(f.rise||10),f.r*(.5+.6*k),0,7);ctx.fill();}
  else if(f.k==='plus'){ctx.globalAlpha=1-k;ctx.fillStyle='#7aff8a';ctx.fillRect(f.x-1,f.y-k*14-4,2,8);ctx.fillRect(f.x-4,f.y-k*14-1,8,2);}
  else if(f.k==='dmg'){ctx.globalAlpha=Math.min(1,(1-k)*2.2)*.9;ctx.font='bold 8px system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=2.2;ctx.strokeStyle='rgba(0,0,0,.8)';const y=f.y-k*14;ctx.strokeText(f.txt,f.x,y);ctx.fillStyle=f.c;ctx.fillText(f.txt,f.x,y);}
  else if(f.k==='txt'){ctx.globalAlpha=Math.min(1,(1-k)*2);ctx.font='bold 10px system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.85)';const y=f.y-k*16;ctx.strokeText(f.txt,f.x,y);ctx.fillStyle=f.c;ctx.fillText(f.txt,f.x,y);}}
 ctx.globalAlpha=1;}
// Icon für Karten (DOM), gecacht als DataURL
const icons={};
function icon(key,size){const K=key+'@'+size;if(icons[K])return icons[K];const a=DART[key];const c=document.createElement('canvas'),dp=2;c.width=c.height=size*dp;const g=c.getContext('2d');
 const k=Math.min((size-6)/a.w,(size-6)/a.h);g.scale(dp,dp);g.translate(size/2-(a.w/2-a.ax)*k,size/2+(a.ay-a.h/2)*k);g.scale(k,k);
 // dunkler Umriss
 const c2=document.createElement('canvas');c2.width=c2.height=size*dp;const q=c2.getContext('2d');q.setTransform(g.getTransform());a.fn(q);
 for(let i=0;i<8;i++){const an=i*Math.PI/4;g.save();g.setTransform(1,0,0,1,Math.cos(an)*2.2,Math.sin(an)*2.2);g.drawImage(c2,0,0);g.restore();}
 g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgba(12,7,2,.95)';g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='source-over';g.drawImage(c2,0,0);g.restore();
 return icons[K]=c.toDataURL();}
return{init,resize,draw,onEvents,toWorld,toScreen,icon,st,spr,TEAM,reset(){st.corpses=[];st.an=new Map();st.simRef=null;st.fx=[];st.decals=[];st.ruins=[];st.shake=0;st.ghost=null;st.aim=null;st.flashSling={};},get scale(){return s;}};
})();
