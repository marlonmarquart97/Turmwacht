// ===== Turmwacht Duell – Darstellung (liest nur den Sim-Zustand) =====
const DR=(()=>{
const Sim=DuellSim,CARDS=Sim.CARDS,FW=Sim.FW,FH=Sim.FH;
const VY0=-34,VY1=664,VH=VY1-VY0,TEAM=['#3a8cff','#ff4a3a'],TEAMD=['#0e2a66','#6a120c'];
let cv,W=1,H=1,s=1,ox=0,oy=0,bg=null,lastS=null;
const st={fx:[],decals:[],ruins:[],shake:0,flashSling:{},seen:new Set(),ghost:null,aim:null,hiSide:0,time:0};
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
function artKey(e){if(e.cls==='tower')return e.sub+e.side;return CARDS[e.card].art==='fire'?'firerain':CARDS[e.card].art;}
const lerp=(a,b,k)=>a+(b-a)*k;
// ---------- Effekte ----------
function fx(o){o.t=0;st.fx.push(o);return o;}
function parts(x,y,n,c,sp,life,up){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(.3+Math.random())*sp;fx({k:'p',x,y,z:up||0,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,vz:(up?20:0)+Math.random()*sp*.6,c,max:life*(.6+Math.random()*.6),r:1.2+Math.random()*1.8});}}
function text(x,y,txt,c,max){fx({k:'txt',x,y,txt,c,max:max||1.1});}
function onEvents(evs,S){for(const e of evs){switch(e.k){
 case 'impact':fx({k:'spark',x:e.x,y:e.y-(e.air?28:8),c:e.kind==='frostbolt'?'#bfe8ff':e.kind==='poison'?'#9aff60':e.kind==='shadow'?'#c080ff':e.kind==='bolt'?'#ffe860':'#fff0c0',max:.25});break;
 case 'hit':fx({k:'spark',x:e.x,y:e.y-(e.air?28:10),c:'#fff4d0',max:.2});break;
 case 'boom':fx({k:'ring',x:e.x,y:e.y,r:e.r||24,c:'#ff9a30',max:.4});parts(e.x,e.y-6,10,'#ffb040',40,.5);break;
 case 'splash':parts(e.x,e.y,10,'#8aff40',36,.5);break;
 case 'fireboom':fx({k:'fire',x:e.x,y:e.y,r:e.r,max:.6});st.decals.push({x:e.x,y:e.y,r:e.r*.8,t:0,max:6});parts(e.x,e.y,22,'#ff8a20',70,.8,1);st.shake=Math.max(st.shake,5);break;
 case 'frost':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'#bfefff',max:.5,w:4});parts(e.x,e.y,24,'#e8f8ff',60,.9,1);break;
 case 'nova':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'#9ae0ff',max:.55,w:6});parts(e.x,e.y,26,'#e8f8ff',80,.9,1);break;
 case 'slam':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'#e8d8b0',max:.45,w:5});parts(e.x,e.y,16,'#a08a60',60,.6);st.shake=Math.max(st.shake,4);break;
 case 'summon':fx({k:'ring',x:e.x,y:e.y,r:36,c:'#c080ff',max:.6,w:4});parts(e.x,e.y,18,'#e0d8c0',40,.7,1);break;
 case 'heal':fx({k:'ring',x:e.x,y:e.y,r:e.r,c:'rgba(120,255,140,.7)',max:.5,w:2});for(let i=0;i<3;i++)fx({k:'plus',x:e.x+(Math.random()-.5)*e.r,y:e.y-10-Math.random()*10,max:.8});break;
 case 'mana':text(e.x,e.y-56,'+1','#e0a0ff',1.3);break;
 case 'bomb':fx({k:'boomb',x:e.x,y:e.y,r:e.r,max:e.big?.7:.45});parts(e.x,e.y,e.big?30:12,'#ffb040',e.big?90:50,.7,1);if(e.big){st.shake=Math.max(st.shake,7);st.decals.push({x:e.x,y:e.y,r:e.r*.7,t:0,max:6});}break;
 case 'death':parts(e.x,e.y-(e.air?28:10),e.big?22:8,/skel|lich|giant/.test(e.card||'')?'#e8e0c8':'#8a8478',e.big?60:34,.6);fx({k:'puff',x:e.x,y:e.y-(e.air?28:6),r:e.big?26:12,max:.5});break;
 case 'tower':fx({k:'boomb',x:e.x,y:e.y-20,r:60,max:.9});parts(e.x,e.y-20,40,'#c8b898',100,1.1,1);parts(e.x,e.y-30,20,'#ff9a30',80,.8,1);st.shake=10;st.ruins.push({x:e.x,y:e.y,side:e.side,sub:e.sub});break;
 case 'throw':st.flashSling[Math.round(e.x)+'|'+Math.round(e.y)]=.35;break;
 case 'land':parts(e.x,e.y,6,'#a08a60',30,.4);break;
 case 'play':fx({k:'ring',x:e.x,y:e.y,r:22,c:e.side?'rgba(255,110,90,.8)':'rgba(110,170,255,.8)',max:.45,w:2});
  if(e.side===1){const C=CARDS[e.card];text(e.x,e.y-(C.type==='spell'?0:40),C.name,'#ffb0a0',1.2);}break;
 }}}
// ---------- Zeichnen ----------
function hpBar(x,y,w,h,f,side,big){ctx.fillStyle='rgba(10,6,2,.85)';ctx.fillRect(x-w/2-1,y-1,w+2,h+2);ctx.fillStyle=TEAMD[side];ctx.fillRect(x-w/2,y,w,h);
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
   ctx.fillStyle=`rgba(255,120,30,${.12+.2*k})`;ctx.fill();}}
 // Platzierungsbereich
 if(st.ghost&&st.ghost.zone){ctx.fillStyle='rgba(220,40,30,.22)';ctx.fillRect(0,0,FW,Sim.RY1+4);
  for(const lane of[0,1]){const g=Sim.tower(S,1,'guard',lane);if(!g||g.hp<=0){ctx.clearRect(0,0,0,0);ctx.fillStyle='rgba(80,180,255,.18)';ctx.fillRect(lane?FW/2:0,160,FW/2,Sim.RY0-4-160);}}
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,Sim.RY1+4);ctx.lineTo(FW,Sim.RY1+4);ctx.stroke();ctx.setLineDash([]);}
 // Einheiten sammeln
 const list=[];for(const e of S.ents){if(e.hp<=0)continue;let x=lerp(e.ox,e.x,alpha),y=lerp(e.oy,e.y,alpha),z=e.air?24+Math.sin(T*3+e.id)*2.5:0;
  if(e.thrown){const k=Math.min(1,e.thrown.t/e.thrown.max);z=Math.sin(Math.PI*k)*70;}
  if(e.leap){const k=Math.min(1,e.leap.t/e.leap.max);z=Math.sin(Math.PI*k)*48;}
  list.push({e,x,y,z});}
 // Schatten + Teamringe
 for(const o of list){const e=o.e;if(e.cls==='tower')continue;const r=e.r;ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(o.x,o.y,r*1.05,r*.5,0,0,7);ctx.fill();
  if(e.cls==='unit'){ctx.strokeStyle=TEAM[e.side];ctx.globalAlpha=.85;ctx.lineWidth=e.hero?2.4:1.6;ctx.beginPath();ctx.ellipse(o.x,o.y,r*1.05,r*.5,0,0,7);ctx.stroke();ctx.globalAlpha=1;}}
 // Bomben am Boden
 for(const b of S.bombs){const k=1-b.t/b.max;if(b.small){const z=34*(1-k);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(b.x,b.y,4,2,0,0,7);ctx.fill();ctx.fillStyle='#2a2a30';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.x,b.y-z-3,3.4,0,7);ctx.fill();ctx.stroke();}
  else{ctx.strokeStyle=`rgba(255,60,30,${.4+.4*Math.sin(T*16)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(b.x,b.y,b.r,b.r*.6,0,0,7);ctx.stroke();
   ctx.fillStyle='#1e1e24';ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,b.y-8,b.big?10:6,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#ffd040';ctx.beginPath();ctx.arc(b.x+(b.big?6:4),b.y-(b.big?18:13),2+Math.random()*1.5,0,7);ctx.fill();}}
 // Bodeneinheiten & Gebäude nach y, Flieger danach
 list.sort((a,b)=>(a.e.air-b.e.air)||(a.y-b.y));
 for(const o of list)drawEnt(S,o);
 // Projektile
 for(const p of S.proj)drawProj(p,alpha);
 // Giftwolken über allem Boden
 for(const z of S.zones)if(z.k==='cloud'){const k=Math.min(1,z.t/z.max*4,1);for(let i=0;i<7;i++){const a=i*0.9+T*.4,rr=z.r*(.35+.25*((i*37)%5)/5);ctx.fillStyle=`rgba(120,220,60,${.16*k})`;ctx.beginPath();ctx.arc(z.x+Math.cos(a)*rr,z.y-6+Math.sin(a)*rr*.6,z.r*.45,0,7);ctx.fill();}}
 else if(z.k==='firerain'){const k=1-z.t/z.max;for(let i=0;i<5;i++){const a=i*1.257,rr=z.r*.5*((i%3)/2),hh=(1-k)*140+((i*23)%30);const x=z.x+Math.cos(a)*rr+hh*.25,y=z.y+Math.sin(a)*rr*.6-hh;
   ctx.save();ctx.shadowColor='#ff7020';ctx.shadowBlur=10;ctx.fillStyle='#ffb040';ctx.beginPath();ctx.arc(x,y,4.5,0,7);ctx.fill();ctx.restore();ctx.strokeStyle='rgba(255,140,40,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12,y-30);ctx.stroke();}}
 // Effekte
 drawFx(dt);
 // Lebensbalken
 for(const o of list){const e=o.e;if(e.cls==='tower'){const big=e.sub==='keep',w=big?54:44,y=o.y-(big?92:84);hpBar(o.x,y,w,6,e.hp/e.maxhp,e.side,1);
   ctx.font='bold 8px system-ui,sans-serif';ctx.textAlign='center';ctx.lineWidth=2.4;ctx.strokeStyle='#000';ctx.strokeText(Math.ceil(e.hp),o.x,y-2.5);ctx.fillStyle='#fff';ctx.fillText(Math.ceil(e.hp),o.x,y-2.5);
   if(big&&!e.active){ctx.font='9px system-ui';ctx.fillText('💤',o.x+w/2+6,y+6);}continue;}
  if(e.hero||e.hp<e.maxhp||e.cls==='bld'){const w=e.hero?30:e.cls==='bld'?30:Math.max(14,e.r*2.2),a=DART[artKey(e)],hh=a?Math.min(a.h*a.m,70):30;
   hpBar(o.x,o.y-o.z-hh-4,w,e.hero?4:3,e.hp/e.maxhp,e.side,e.hero);if(e.hero){ctx.fillStyle='#ffd860';ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(o.x-w/2-6,o.y-o.z-hh-6);ctx.lineTo(o.x-w/2-2,o.y-o.z-hh-2);ctx.lineTo(o.x-w/2-6,o.y-o.z-hh+2);ctx.lineTo(o.x-w/2-10,o.y-o.z-hh-2);ctx.closePath();ctx.fill();ctx.stroke();}}}
 // Fähigkeits-Ziel
 if(st.aim){const h=Sim.byId(S,S.p[0].heroId);if(h){const A=CARDS[h.card].abil;ctx.strokeStyle='rgba(255,220,100,.6)';ctx.setLineDash([4,4]);ctx.lineWidth=1.5;if(A.reach){ctx.beginPath();ctx.ellipse(h.x,h.y,A.reach,A.reach*.75,0,0,7);ctx.stroke();}ctx.setLineDash([]);
  if(st.aim.x!=null){let tx=st.aim.x,ty=st.aim.y;if(A.reach){const d=Math.hypot(tx-h.x,ty-h.y);if(d>A.reach){tx=h.x+(tx-h.x)*A.reach/d;ty=h.y+(ty-h.y)*A.reach/d;}}const r=A.r||44;ctx.fillStyle='rgba(255,220,100,.22)';ctx.strokeStyle='#ffd860';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(tx,ty,r,r*.6,0,0,7);ctx.fill();ctx.stroke();}}}
 // Platzierungs-Geist
 if(st.ghost&&st.ghost.x!=null){const g=st.ghost,C=CARDS[g.card];ctx.globalAlpha=g.ok?.75:.4;
  if(C.type==='spell'){const r=C.s.r;ctx.fillStyle=g.ok?'rgba(255,255,255,.2)':'rgba(255,60,40,.25)';ctx.strokeStyle=g.ok?'#fff':'#ff5040';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(g.x,g.y,r,r*.6,0,0,7);ctx.fill();ctx.stroke();}
  else{const n=C.count||1,f={1:[[0,0]],2:[[-11,0],[11,0]],3:[[0,-10],[-12,8],[12,8]],4:[[-11,-11],[11,-11],[-11,11],[11,11]],5:[[0,0],[-16,-9],[16,-9],[-16,10],[16,10]]}[n]||[[0,0]];
   const c=spr(C.art);ctx.strokeStyle=g.ok?'#fff':'#ff5040';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(g.x,g.y,(C.u||C.b).r*1.4+(n>1?12:0),((C.u||C.b).r*1.4+(n>1?12:0))*.6,0,0,7);ctx.stroke();
   for(const[dx,dy]of f)if(c)blit(c,g.x+dx,g.y+dy-(C.air?24:0));}
  ctx.globalAlpha=1;}
}
function drawEnt(S,o){const e=o.e,key=artKey(e);let c;
 if(e.cls==='bld'&&e.card==='sling'){const fk=Math.round(e.x)+'|'+Math.round(e.y);c=spr(st.flashSling[fk]>0?'sling2':'sling');}
 else c=spr(key);
 if(!c)return;const dep=e.dep>0;
 if(dep){ctx.globalAlpha=.55;ctx.strokeStyle=TEAM[e.side];ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y-4,e.r+4,-Math.PI/2,-Math.PI/2+6.283*(1-e.dep/(e.cls==='bld'?1:.9)));ctx.stroke();}
 let bx=0,by=0,sc=1;const at=(S.tick-e.atkT)*Sim.TICK;if(e.cls==='unit'&&at>=0&&at<.18){const k=Math.sin(at/.18*Math.PI);bx=(e.face||1)*k*3;sc=1+k*.06;}
 if(e.cls==='unit'&&e.mv&&!e.air&&!e.frz&&!e.stun)by=-Math.abs(Math.sin(st.time*9+e.id))*1.6;
 const flip=e.cls==='unit'&&e.face<0;
 if(sc!==1){ctx.save();ctx.translate(o.x+bx,o.y-o.z+by);ctx.scale(sc,sc);blit(c,0,0,flip);ctx.restore();}else blit(c,o.x+bx,o.y-o.z+by,flip);
 if(dep)ctx.globalAlpha=1;
 const a=DART[key]||{h:40,m:1},hh=Math.min(a.h*a.m,70);
 if(e.frz>0){ctx.fillStyle='rgba(160,225,255,.45)';ctx.strokeStyle='rgba(230,250,255,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(o.x,o.y-o.z-hh*.45,e.r*1.3,hh*.55,0,0,7);ctx.fill();ctx.stroke();}
 else if(e.stun>0){for(let i=0;i<3;i++){const ang=st.time*6+i*2.09;ctx.fillStyle='#ffe860';ctx.beginPath();ctx.arc(o.x+Math.cos(ang)*8,o.y-o.z-hh-2+Math.sin(ang)*2.5,1.8,0,7);ctx.fill();}}
 if(e.slowT>0&&!e.frz){ctx.fillStyle='rgba(120,200,255,.8)';for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(o.x+Math.sin(st.time*4+i*3)*e.r,o.y-o.z-hh*.3-((st.time*12+i*6)%12),1.2,0,7);ctx.fill();}}
 if(e.dot>0){ctx.fillStyle='rgba(140,255,80,.85)';for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(o.x+Math.cos(st.time*3+i*3)*e.r*.8,o.y-o.z-hh*.5-((st.time*10+i*7)%14),1.4,0,7);ctx.fill();}}}
const PCOL={arrow:'#e8dcc0',tarrow:'#f0e4c8',fireball:'#ff9a30',flask:'#8aff40',frostbolt:'#a0e8ff',poison:'#9aff60',bolt:'#ffe860',shadow:'#b060ff'};
function drawProj(p,alpha){const x=lerp(p.ox,p.x,alpha),y=lerp(p.oy,p.y,alpha);if(p._d0==null)p._d0=Math.max(1,Math.hypot(p.tx-p.x,p.ty-p.y));
 const d=Math.hypot(p.tx-x,p.ty-y),k=Math.max(0,Math.min(1,1-d/p._d0));const z=lerp(p.z,p.tz,k)+Math.sin(Math.PI*k)*(p.arc?p._d0*.35:p._d0*.08);const sy=y-z;
 const c=PCOL[p.kind]||'#fff';
 if(p.kind==='arrow'||p.kind==='tarrow'){const a=Math.atan2((p.ty-p.tz)-sy,p.tx-x);ctx.save();ctx.translate(x,sy);ctx.rotate(a);ctx.strokeStyle=OL;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(4,0);ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=1.3;ctx.stroke();
  ctx.fillStyle='#d8dce2';ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(2,-2.2);ctx.lineTo(2,2.2);ctx.fill();ctx.fillStyle=p.side?'#ff6a50':'#6aa8ff';ctx.fillRect(-10,-1.8,3,3.6);ctx.restore();return;}
 if(p.kind==='flask'){ctx.save();ctx.translate(x,sy);ctx.rotate(st.time*10);drawFlask(ctx,0,0,.5,'#8aff40');ctx.restore();return;}
 ctx.save();ctx.shadowColor=c;ctx.shadowBlur=10;ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,sy,p.kind==='fireball'?5:3.6,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,sy,1.6,0,7);ctx.fill();ctx.restore();
 if(Math.random()<.5)st.fx.push({k:'p',x,y,z,vx:0,vy:0,vz:0,c,max:.25,r:1.6,t:0});}
function drawFx(dt){st.fx=st.fx.filter(f=>(f.t+=dt)<f.max);for(const k in st.flashSling)st.flashSling[k]-=dt;
 for(const f of st.fx){const k=f.t/f.max;
  if(f.k==='p'){f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.vz){f.z+=f.vz*dt;f.vz-=60*dt;if(f.z<0)f.z=0;}ctx.globalAlpha=Math.max(0,1-k);ctx.fillStyle=f.c;ctx.beginPath();ctx.arc(f.x,f.y-f.z,f.r*(1-k*.5),0,7);ctx.fill();}
  else if(f.k==='spark'){ctx.globalAlpha=1-k;ctx.strokeStyle=f.c;ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<5;i++){const a=i*1.257,r1=2+k*4,r2=4+k*8;ctx.moveTo(f.x+Math.cos(a)*r1,f.y+Math.sin(a)*r1);ctx.lineTo(f.x+Math.cos(a)*r2,f.y+Math.sin(a)*r2);}ctx.stroke();}
  else if(f.k==='ring'){ctx.globalAlpha=1-k;ctx.strokeStyle=f.c;ctx.lineWidth=f.w||3;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r*(.3+.7*k),f.r*(.3+.7*k)*.6,0,0,7);ctx.stroke();}
  else if(f.k==='fire'||f.k==='boomb'){ctx.globalAlpha=Math.max(0,1-k*k);const r=f.r*(.5+.6*k);const g=ctx.createRadialGradient(f.x,f.y-r*.3,0,f.x,f.y-r*.3,r);g.addColorStop(0,'rgba(255,250,200,.95)');g.addColorStop(.4,'rgba(255,160,40,.85)');g.addColorStop(1,'rgba(160,30,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(f.x,f.y-r*.3,r,r*.8,0,0,7);ctx.fill();}
  else if(f.k==='puff'){ctx.globalAlpha=(1-k)*.6;ctx.fillStyle='#d8d0c0';ctx.beginPath();ctx.arc(f.x,f.y-k*10,f.r*(.5+.6*k),0,7);ctx.fill();}
  else if(f.k==='plus'){ctx.globalAlpha=1-k;ctx.fillStyle='#7aff8a';ctx.fillRect(f.x-1,f.y-k*14-4,2,8);ctx.fillRect(f.x-4,f.y-k*14-1,8,2);}
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
return{init,resize,draw,onEvents,toWorld,toScreen,icon,st,spr,TEAM,reset(){st.fx=[];st.decals=[];st.ruins=[];st.shake=0;st.ghost=null;st.aim=null;st.flashSling={};},get scale(){return s;}};
})();
