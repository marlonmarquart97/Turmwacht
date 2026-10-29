// ===== Turmwacht Duell – zusätzliche Grafik (nutzt tw-art.js) =====
// Sprite-Cache mit dunklem Umriss (aus Turmwacht übernommen; braucht globale scale, dpr, emo, ctx)
function sprite(key,w,h,ax,ay,fn,m,ol){m=m||1;const K=key+(m!==1?'@'+m.toFixed(2):'')+(ol?'~':'');let c=emo[K];
 if(!c){const res=scale*dpr*m,pad=ol?2.5:0,W2=Math.ceil((w+pad*2)*res),H2=Math.ceil((h+pad*2)*res);const c0=document.createElement('canvas');c0.width=W2;c0.height=H2;const g=c0.getContext('2d');g.scale(res,res);g.translate(ax+pad,ay+pad);fn(g);
  if(ol){c=document.createElement('canvas');c.width=W2;c.height=H2;const q=c.getContext('2d'),o=Math.max(1.5,1.4*dpr);
   for(let i2=0;i2<8;i2++){const a=i2*Math.PI/4;q.drawImage(c0,Math.cos(a)*o,Math.sin(a)*o);}q.globalCompositeOperation='source-in';q.fillStyle='rgba(12,7,2,.95)';q.fillRect(0,0,W2,H2);q.globalCompositeOperation='source-over';
   try{q.filter='saturate(1.18) contrast(1.08)';}catch(e){}q.drawImage(c0,0,0);q.filter='none';
   // leichter Glanz oben links (Licht von links oben)
   q.globalCompositeOperation='source-atop';const lg=q.createLinearGradient(0,0,W2*.8,H2);lg.addColorStop(0,'rgba(255,240,200,.16)');lg.addColorStop(.5,'rgba(255,240,200,0)');lg.addColorStop(1,'rgba(0,0,20,.14)');q.fillStyle=lg;q.fillRect(0,0,W2,H2);q.globalCompositeOperation='source-over';}
  else c=c0;c._w=(w+pad*2)*m;c._h=(h+pad*2)*m;c._ax=(ax+pad)*m;c._ay=(ay+pad)*m;emo[K]=c;}return c;}
function blit(c,x,y,flip){if(flip){ctx.save();ctx.translate(x,y);ctx.scale(-1,1);ctx.drawImage(c,-c._ax,-c._ay,c._w,c._h);ctx.restore();}else ctx.drawImage(c,x-c._ax,y-c._ay,c._w,c._h);}

function drawWell(g){base(g,17,11,'stone');E(g,0,-11,12,5);F(g,LG(g,0,-16,0,-6,'#7ad0ff','#1a4aa8'),1.2);
 g.save();g.shadowColor='#6ab8ff';g.shadowBlur=8;E(g,0,-12,6,2.4);F(g,'rgba(210,245,255,.85)',0);g.restore();
 for(const s of[-1,1]){L(g,s*14,-8,s*14,-40,OL,4.4);L(g,s*14,-8,s*14,-40,'#7a5028',2.6);}
 L(g,-14,-34,14,-34,OL,3);L(g,-14,-34,14,-34,'#8a5a2a',1.6);
 P(g,[[-21,-35],[0,-53],[21,-35],[16,-33],[0,-46],[-16,-33]]);F(g,LG(g,0,-53,0,-33,'#5a78d0','#1a2a68'),1.6);
 L(g,0,-34,0,-23,'#c8b080',1.1);P(g,[[-3.5,-23],[3.5,-23],[2.8,-17],[-2.8,-17]]);F(g,'#6a4a22',1.1);
 g.save();g.shadowColor='#9ad8ff';g.shadowBlur=7;P(g,[[0,-63],[4.5,-57],[0,-51],[-4.5,-57]]);F(g,'#bfe8ff',1.1);g.restore();}
function drawSkelArch(g){
 // Skelett mit Bogen statt Schwert
 P(g,[[-7,-26],[7,-26],[9,-6],[5,-8],[3,-4],[0,-7],[-3,-4],[-6,-8],[-9,-6]]);F(g,'#2c2018',1.3);
 L(g,-3,0,-3,-10,OL,3.5);L(g,-3,0,-3,-10,'#d8cfb0',2);L(g,3,0,3,-10,OL,3.5);L(g,3,0,3,-10,'#d8cfb0',2);
 E(g,0,-11,4.5,2.2);F(g,'#d8cfb0',1.2);L(g,0,-11,0,-24,'#d8cfb0',2.2);
 E(g,0,-18,6.2,6);F(g,'#e6dcc0',1.4);for(const y of[-21,-18,-15])L(g,-5,y,5,y,'#3a3020',1);
 P(g,[[-9,-26],[-5,-27],[-8,-8],[-12,-9]]);F(g,'#5a3a1c',1.2);for(const x of[-9,-7])L(g,x,-27,x-1,-32,'#e8e0c8',1.2);
 L(g,5,-21,12,-16,'#d8cfb0',2.2);
 g.save();g.translate(14,-4);drawElfBow(g);g.restore();
 E(g,0,-29,6.2,6);F(g,'#ece2c6',1.4);P(g,[[-3.6,-25],[3.6,-25],[3,-21.6],[-3,-21.6]]);F(g,'#e0d6b8',1.1);
 g.beginPath();g.arc(0,-30,6.8,Math.PI,0);g.closePath();F(g,LG(g,0,-37,0,-30,'#5a2a3a','#2a1018'),1.3);
 E(g,-2.4,-28.6,1.8,2);F(g,'#0a0608',0);E(g,2.4,-28.6,1.8,2);F(g,'#0a0608',0);
 g.shadowColor='#a040ff';g.shadowBlur=3;E(g,-2.4,-28.6,.8);F(g,'#c080ff',0);E(g,2.4,-28.6,.8);F(g,'#c080ff',0);g.shadowBlur=0;}
function drawSling(g,swing){ // Ork-Schleuder: Holzrahmen von schräg oben + Ork-Bediener
 g.save();g.scale(1,.62);drawCatFrame(g,-Math.PI/2,swing==null?.9:swing,1);g.restore();
 g.save();g.translate(-17,6);g.scale(.62,.62);drawOrc(g);g.restore();}
function drawChief(g){drawGoblin(g);
 P(g,[[-7,-29],[-8,-37],[-4,-33],[0,-39],[4,-33],[8,-37],[7,-29]]);F(g,LG(g,0,-39,0,-29,'#ffe070','#c08a20'),1.2);
 E(g,0,-31.5,1.4);F(g,'#e02020',.6);
 L(g,-9,-30,-15,-44,OL,2.4);L(g,-9,-30,-15,-44,'#e04020',1.2);}
function drawKeepTeam(g,team){
 // Bergfried: Burg aus Turmwacht, Dächer/Fahnen in Teamfarbe
 const C=team?['#6a1410','#d0402c','#b02a1a']:['#1a3270','#3a68c8','#2a58c0'];
 const sv=g.createLinearGradient;g.createLinearGradient=function(...a){const gr=sv.apply(this,a),ad=gr.addColorStop.bind(gr);
  gr.addColorStop=(o,c)=>ad(o,c==='#1a3270'?C[0]:c==='#3a68c8'?C[1]:c);return gr;};
 const fs=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'fillStyle');
 Object.defineProperty(g,'fillStyle',{configurable:true,get(){return fs.get.call(this);},set(v){fs.set.call(this,v==='#2a58c0'?C[2]:v);}});
 try{drawCastle(g);}finally{delete g.fillStyle;g.createLinearGradient=sv;}}
function drawCrownTower(g,team){
 const h=22;L(g,17,-h+3,17,-h-48,OL,3.4);L(g,17,-h+3,17,-h-48,'#7a5028',2);
 P(g,[[16,-h-46],[2,-h-42],[6,-h-35],[2,-h-28],[16,-h-30]]);F(g,LG(g,16,0,2,0,team?'#7a1410':'#1a3a80',team?'#e04a30':'#3a7ae0'),1.3);
 P(g,[[10,-h-42],[13,-h-38],[10,-h-33],[7,-h-38]]);F(g,'#ffd860',.8);
 base(g,25,h,'stone');
 for(const s of[-1,1]){P(g,[[s*15,-h-4],[s*15,-h-10],[s*21,-h-9],[s*21,-h-2]]);F(g,'#c8ccd6',1.2);}
 g.save();g.translate(0,-h+2);drawElf(g);g.restore();}
function drawRuin(g){base(g,22,6,'stone');
 for(const[x,y,s]of[[-10,-6,.55],[9,-4,.5],[0,-9,.45]]){g.save();g.translate(x,y);drawRock(g,s);g.restore();}
 L(g,-4,-8,-10,-22,OL,3.4);L(g,-4,-8,-10,-22,'#5a3a1c',2);}
function drawManaIcon(g){g.save();g.shadowColor='#c070ff';g.shadowBlur=6;
 g.beginPath();g.moveTo(0,-14);g.bezierCurveTo(8,-4,9,2,0,7);g.bezierCurveTo(-9,2,-8,-4,0,-14);g.closePath();F(g,LG(g,0,-14,0,7,'#f0c8ff','#9a40e0','#4a1080'),1.4);g.restore();
 E(g,-2.5,-2,1.6,2.6);F(g,'rgba(255,255,255,.7)',0);}

// Karten-/Einheiten-Grafik: key -> Zeichenfunktion und Größenfaktor (Spielfeld)
const DART={
 grunt:{fn:g=>drawGrunt(g,1),m:.7},elf:{fn:g=>{drawElf(g);drawElfBow(g);},m:.92},mage:{fn:drawMage,m:.86},goblin:{fn:drawGoblin,m:.92},
 sling:{fn:g=>drawSling(g),m:.95,bld:1},sling2:{fn:g=>drawSling(g,.12),m:.95,bld:1},ranger:{fn:drawGuardTower,m:.6,bld:1},well:{fn:drawWell,m:.92,bld:1},
 blade:{fn:drawBlade,m:.82},frosthero:{fn:drawFrostMage,m:.8},poisonhero:{fn:drawPoisoner,m:.82},
 zepp:{fn:drawZepp,m:.72},giant:{fn:drawGiant,m:.92},shaman:{fn:drawShaman,m:.8},bat:{fn:drawBat,m:.78},
 skel:{fn:drawSkel,m:.88},skelarch:{fn:drawSkelArch,m:.88},knight:{fn:drawKnight,m:.86},wolf:{fn:drawWolf,m:.82},ogre:{fn:drawOgre,m:.82},lich:{fn:drawLich,m:.62},
 firerain:{fn:drawFireIcon,m:1,spell:1},fire:{fn:drawFireIcon,m:1,spell:1},lichP:{fn:drawLich,m:1},frost:{fn:drawFrostIcon,m:1,spell:1},
 keep0:{fn:g=>drawKeepTeam(g,0),m:.78},keep1:{fn:g=>drawKeepTeam(g,1),m:.78},guard0:{fn:g=>drawCrownTower(g,0),m:.92},guard1:{fn:g=>drawCrownTower(g,1),m:.92},
 ruin:{fn:drawRuin,m:1},chief:{fn:drawChief,m:1},mana:{fn:drawManaIcon,m:1},
 pine:{fn:g=>drawPine(g,1),m:1},oak:{fn:g=>drawOak(g,1),m:1},rock:{fn:g=>drawRock(g,1),m:1}};
// Begrenzungsrahmen automatisch messen (einmalig, Ursprung = Fußpunkt)
function measureArt(){const N=260,OX=130,OY=190,c=document.createElement('canvas');c.width=N;c.height=N;const g=c.getContext('2d',{willReadFrequently:true});
 for(const k in DART){const a=DART[k];g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,N,N);g.translate(OX,OY);try{a.fn(g);}catch(e){console.error('art',k,e);}
  const d=g.getImageData(0,0,N,N).data;let x0=N,y0=N,x1=0,y1=0;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(d[(y*N+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<x0){x0=OX-20;x1=OX+20;y0=OY-40;y1=OY;}
  a.w=x1-x0+5;a.h=y1-y0+5;a.ax=OX-x0+2;a.ay=OY-y0+2;}}
