// ===== Turmwacht Duell 0.7 – Rückenansichten der neuen Kreaturen (eigene Truppen laufen nach oben) =====
// Symmetrisch von hinten: kein Gesicht, Rücken/Umhang/Waffe sichtbar. Drachen: von hinten-oben, Flügel zu beiden Seiten.
function drawWyrmBack(g,o){const s=o.s||1,fl=o.flap;g.save();g.scale(s,s);
 const bc=o.bone?'#d8dcd0':null;
 // Schwanz zum Betrachter (nach unten), leicht geschwungen
 g.beginPath();g.moveTo(-6,-26);g.quadraticCurveTo(-10,-12,2,-6);g.quadraticCurveTo(14,-1,10,6);g.quadraticCurveTo(16,-2,8,-10);g.quadraticCurveTo(2,-16,6,-26);g.closePath();
 F(g,bc||LG(g,-8,0,8,0,o.body[1],o.body[0],o.body[1]),1.5);P(g,[[10,6],[16,10],[12,2]]);F(g,o.horn,1);
 if(o.bone)for(let i=0;i<4;i++)L(g,-3+i*2.5,-22+i*4,3+i*2.5,-22+i*4,'#7a8a96',1.1);
 // Flügel
 for(const sd of[-1,1]){g.save();g.scale(sd,1);
  const T=fl?[[20,-50],[40,-42],[54,-26],[56,-8]]:[[10,-70],[30,-74],[48,-62],[58,-46]];
  g.beginPath();g.moveTo(6,-40);g.lineTo(T[0][0],T[0][1]);for(let i=1;i<T.length;i++){const p=T[i-1],q=T[i];g.quadraticCurveTo((p[0]+q[0])/2+(fl?-2:3),(p[1]+q[1])/2+(fl?-5:5),q[0],q[1]);}
  g.quadraticCurveTo(fl?28:36,fl?-14:-40,8,-30);g.closePath();
  const wc=o.wing;F(g,o.bone?'rgba(150,215,255,.38)':LG(g,0,fl?-46:-74,0,fl?-6:-30,wc[0],wc[1]),1.5,o.bone?'#d8f0ff':OL);
  for(const t of T)L(g,6,-40,t[0],t[1],o.bone?'#e8f4ff':o.arm||'#2a1408',o.bone?2.2:1.5);
  if(o.bone)for(const t of T){E(g,t[0],t[1],1.7);F(g,'#e8f4ff',.8);}
  g.restore();}
 // Hinterbeine
 for(const sd of[-1,1]){P(g,[[sd*6,-26],[sd*13,-24],[sd*14,-14],[sd*11,-10],[sd*6,-16]]);F(g,bc||o.body[1],1.3);}
 // Rumpf von hinten
 if(o.bone){E(g,0,-34,10,14);F(g,'rgba(120,190,240,.25)',1.2,'#a8d8ff');L(g,0,-48,0,-22,'#e0e4d8',4);L(g,0,-48,0,-22,'#8a96a0',1);
  for(let i=0;i<5;i++){const y=-44+i*5;for(const sd of[-1,1]){g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(sd*10,y+1,sd*9,y+6);g.strokeStyle=OL;g.lineWidth=3;g.stroke();g.strokeStyle='#e4e6da';g.lineWidth=1.6;g.stroke();}}}
 else{E(g,0,-34,12,15);F(g,LG(g,-12,0,12,0,o.body[1],o.body[0],o.body[1]),1.8);
  for(let i=0;i<6;i++){const y=-46+i*4.6;P(g,[[-2.4,y],[0,y-5],[2.4,y]]);F(g,o.horn,.9);}
  if(o.lava){g.save();g.shadowColor='#ff6a10';g.shadowBlur=6;for(const[a,b,c,d]of[[-8,-38,-3,-30],[8,-40,3,-32],[-6,-26,5,-24]])L(g,a,b,c,d,'#ffa030',1.4);g.restore();}}
 // Hals + Hinterkopf (Hörner nach hinten, kein Gesicht)
 P(g,[[-5,-46],[-4,-56],[4,-56],[5,-46]]);F(g,bc||LG(g,-5,0,5,0,o.body[1],o.head||o.body[0],o.body[1]),1.4);
 E(g,0,-60,7,6);F(g,o.bone?'#ecebe0':LG(g,0,-66,0,-54,o.head||o.body[0],o.body[1]),1.5);
 for(const sd of[-1,1]){P(g,[[sd*4,-63],[sd*12,-72],[sd*9,-64],[sd*6,-58]]);F(g,o.horn,1.1);}
 if(o.crown)for(const x of[-4,0,4]){P(g,[[x-1.6,-64],[x,-64-(x?6:8)],[x+1.6,-64]]);F(g,'#ffc040',.8);}
 if(o.rider){P(g,[[-6,-36],[-8,-50],[-4,-60],[0,-63],[4,-60],[8,-50],[6,-36]]);F(g,LG(g,-8,0,8,0,'#141418','#3a3a42','#141418'),1.5);
  L(g,0,-61,0,-40,'rgba(0,0,0,.4)',1.1);L(g,5,-48,16,-70,OL,3.2);L(g,5,-48,16,-70,'#c8ccd4',1.6);}
 g.restore();}
const WYRMB={whelp:WYRM.whelp,frostwyrm:WYRM.frostwyrm,dragonlord:Object.assign({crown:1},WYRM.dragonlord),shade:WYRM.shade};
// ---- Troll / Ugrak von hinten ----
function drawTrollBack(g,king){
 for(const s of[-1,1]){P(g,[[s*4,-24],[s*13,-24],[s*14,-4],[s*16,0],[s*3,0],[s*4,-6]]);F(g,LG(g,0,-24,0,0,'#6a8a6a','#3a5a40'),1.6);}
 P(g,[[-15,-26],[15,-26],[12,-14],[0,-11],[-12,-14]]);F(g,king?'#5a2a1a':'#5a4228',1.5);
 // Waffe über der rechten Schulter (hinter dem Rücken)
 g.save();g.translate(14,-52);g.rotate(.5);
 if(king){P(g,[[-3,8],[3,8],[5,-34],[-5,-34]]);F(g,LG(g,-6,0,6,0,'#4a2e16','#8a5a2a','#4a2e16'),1.5);E(g,0,-38,9,11);F(g,LG(g,-9,-48,9,-28,'#7a5a3a','#3a2414'),1.7);
  for(const a of[0,1,2,3,4,5]){const an=a*1.05,X=Math.cos(an)*13,Y=-38+Math.sin(an)*13;P(g,[[Math.cos(an)*8-1.5,-38+Math.sin(an)*8],[X,Y],[Math.cos(an)*8+1.5,-38+Math.sin(an)*8]]);F(g,'#d8d0c0',.8);}}
 else{P(g,[[-3,8],[3,8],[5,-36],[-5,-36]]);F(g,LG(g,-5,0,5,0,'#3a2414','#7a5028','#3a2414'),1.5);
  for(const[x,y,r]of[[0,-42,10],[-9,-36,7],[8,-38,7],[-3,-50,7]]){E(g,x,y,r);F(g,LG(g,0,y-r,0,y+r,'#5a9a3a','#244a18'),1.3);}}
 g.restore();
 // breiter Rücken
 P(g,[[-18,-24],[-22,-48],[-12,-64],[12,-64],[22,-48],[18,-24],[0,-20]]);F(g,LG(g,-22,0,22,0,'#4a6a50','#86a882','#4a6a50'),2);
 L(g,0,-62,0,-26,'rgba(30,50,30,.45)',1.6);for(const s of[-1,1]){E(g,s*8,-50,5,7);F(g,'rgba(200,220,180,.18)',0);}
 for(const[x,y]of[[-12,-40],[10,-34],[6,-56]]){E(g,x,y,2.4,1.6);F(g,'rgba(40,70,40,.5)',0);}
 if(king){P(g,[[-16,-62],[16,-62],[20,-30],[10,-24],[0,-28],[-10,-24],[-20,-30]]);F(g,LG(g,0,-62,0,-24,'#6a4a2a','#3a2414'),1.5);for(let i=0;i<5;i++)L(g,-14+i*7,-56,-15+i*7.4,-30,'#2a180c',1);}
 // Arme
 for(const s of[-1,1]){P(g,[[s*14,-60],[s*25,-46],[s*24,-30],[s*18,-30],[s*16,-44]]);F(g,'#5a7a5a',1.5);E(g,s*21,-28,5);F(g,'#5a7a5a',1.4);}
 // Hinterkopf, tief zwischen den Schultern
 E(g,0,-66,10,8);F(g,LG(g,0,-74,0,-58,'#9ab894','#5a7a5a'),1.6);
 for(const s of[-1,1]){P(g,[[s*8,-68],[s*15,-74],[s*10,-64]]);F(g,'#5a7a5a',1);}
 if(king){P(g,[[-9,-70],[-8,-80],[-4,-74],[0,-83],[4,-74],[8,-80],[9,-70]]);F(g,LG(g,0,-83,0,-70,'#f0e6c8','#a08a5a'),1.3);}}
// ---- Sturmrufer von hinten ----
function drawStormBack(g){
 L(g,14,-2,16,-60,OL,4);L(g,14,-2,16,-60,'#6a4a2a',2.2);
 g.save();g.shadowColor='#8ac8ff';g.shadowBlur=10;P(g,[[16,-60],[12,-66],[16,-74],[20,-66]]);F(g,LG(g,0,-74,0,-60,'#e8f8ff','#4a9aff'),1.2);g.restore();
 P(g,[[-11,0],[-13,-16],[-9,-34],[9,-34],[13,-16],[11,0]]);F(g,LG(g,-13,0,13,0,'#1a2a5a','#3a5aa8','#1a2a5a'),1.6);
 P(g,[[-9,-34],[9,-34],[11,-6],[0,-2],[-11,-6]]);F(g,LG(g,0,-34,0,-2,'#2a3a6a','#141e44'),1.3);// Umhang
 bSeam(g,-3,-32,-5,-6);bSeam(g,3,-32,5,-6);
 for(let i=0;i<5;i++){const x=-8+i*4;P(g,[[x,-8],[x+2,-3],[x+4,-8]]);F(g,'rgba(160,200,255,.35)',0);}
 P(g,[[-12,-34],[-10,-44],[10,-44],[12,-34]]);F(g,'#7a6a5a',1.3);for(let i=0;i<6;i++)L(g,-10+i*4,-34,-9+i*4,-38,'#4a3a2a',1);
 P(g,[[-8,-44],[-7,-56],[0,-62],[7,-56],[8,-44]]);F(g,LG(g,-8,0,8,0,'#2a3a5a','#5a6a8a','#2a3a5a'),1.4);bSeam(g,0,-60,0,-45);
 for(const s of[-1,1]){E(g,s*13,-32,3.2);F(g,'#3a5aa8',1.1);}}
// ---- Netzwerfer von hinten ----
function drawNetterBack(g){
 for(const s of[-1,1]){P(g,[[s*2,-14],[s*7,-14],[s*7,-2],[s*9,0],[s*2,0]]);F(g,'#5a4a2a',1.3);}
 P(g,[[-9,-12],[-10,-26],[10,-26],[9,-12]]);F(g,LG(g,-10,0,10,0,'#4a5a2a','#7a8a3a','#4a5a2a'),1.5);L(g,-9,-15,9,-15,'#3a2414',2.4);
 E(g,0,-30,6,6);F(g,LG(g,0,-36,0,-24,'#9aa864','#5a6a3a'),1.4);for(const s of[-1,1]){P(g,[[s*5,-32],[s*12,-36],[s*6,-29]]);F(g,'#8a9a58',1);}
 P(g,[[-6,-33],[0,-38],[6,-33],[4,-30],[-4,-30]]);F(g,'#4a3a2a',1.1);
 // Netzbündel mittig auf dem Rücken
 E(g,0,-19,7.5,7);F(g,'#b8a878',1.3);g.save();E(g,0,-19,7.5,7);g.clip();for(let i=-3;i<4;i++){L(g,-7+i*4,-27,7+i*4,-11,'#6a5a3a',.8);L(g,7+i*4,-27,-7+i*4,-11,'#6a5a3a',.8);}g.restore();
 L(g,-8,-25,8,-13,'#4a2e16',1.6);
 L(g,8,-22,14,-28,'#7a8a3a',3.2);g.save();g.translate(17,-31);E(g,0,0,6,5);F(g,'rgba(200,184,130,.35)',1,'#8a7a4a');for(let i=-1;i<=1;i++){L(g,i*3,-4.5,i*3,4.5,'#8a7a4a',.7);L(g,-5.5,i*2.4,5.5,i*2.4,'#8a7a4a',.7);}g.restore();}
// ---- Bannerträger von hinten ----
function drawBannerBack(g){
 for(const s of[-1,1]){P(g,[[s*2,-14],[s*7,-14],[s*7,-2],[s*9,0],[s*2,0]]);F(g,'#4a3a2a',1.3);}
 P(g,[[-10,-12],[-11,-34],[11,-34],[10,-12]]);F(g,LG(g,-11,0,11,0,'#6a6a72','#b0b0b8','#6a6a72'),1.6);
 L(g,0,-33,0,-14,'rgba(0,0,0,.3)',1.2);L(g,-10,-14,10,-14,'#4a2e16',2.6);
 // Fahnenstange auf dem Rücken, Banner flattert darüber
 L(g,-4,-6,-4,-84,OL,4);L(g,-4,-6,-4,-84,'#7a5028',2.2);P(g,[[-6,-84],[-4,-90],[-2,-84]]);F(g,'#e0c060',1);
 g.beginPath();g.moveTo(-3,-82);g.lineTo(-24,-80);g.quadraticCurveTo(-20,-70,-26,-60);g.lineTo(-16,-56);g.lineTo(-10,-62);g.lineTo(-3,-58);g.closePath();F(g,LG(g,-26,-82,-3,-58,'#1a4a24','#2a7a3a'),1.4);
 L(g,-3,-82,-24,-80,'#e8c860',1.4);
 E(g,0,-40,6,6.5);F(g,LG(g,0,-47,0,-34,'#c8c8d0','#6a6a72'),1.3);P(g,[[-7,-40],[-6,-35],[6,-35],[7,-40]]);F(g,'#5a5a62',1);L(g,0,-47,0,-53,'#c83020',2.2);
 E(g,-12,-28,3.2);F(g,'#9a9aa2',1.1);E(g,12,-28,3.2);F(g,'#9a9aa2',1.1);L(g,13,-26,22,-36,OL,3);L(g,13,-26,22,-36,'#d8dce2',1.4);}
// ---- Grubenkriecher von hinten ----
function drawBeetleBack(g){
 for(let i=0;i<3;i++)for(const s of[-1,1]){const y=-6-i*6;L(g,s*8,y,s*16,y+5,OL,3);L(g,s*8,y,s*16,y+5,'#3a2a1a',1.6);}
 E(g,0,-26,7,5);F(g,LG(g,0,-31,0,-21,'#5a4a7a','#1e1630'),1.4);
 for(const s of[-1,1]){g.beginPath();g.moveTo(s*3,-29);g.quadraticCurveTo(s*8,-36,s*3,-38);F(g,'#d8c8a0',1);}
 E(g,0,-14,12,13);F(g,LG(g,-12,0,12,0,'#241a34','#6a5a8a','#241a34'),1.8);L(g,0,-27,0,-1,'rgba(0,0,0,.55)',1.4);
 for(const[x,y]of[[-6,-18],[6,-18],[-5,-8],[5,-8]]){P(g,[[x-2,y],[x,y-5],[x+2,y]]);F(g,'#b8a8d8',.8);}}
// ---- Borkenhüter von hinten ----
function drawTreantBack(g){
 for(const s of[-1,1]){P(g,[[s*3,-30],[s*14,-30],[s*16,-8],[s*22,0],[s*12,0],[s*8,-4],[s*4,0],[s*3,-12]]);F(g,LG(g,0,-30,0,0,'#6a4a2a','#3a2414'),1.6);}
 for(const s of[-1,1]){P(g,[[s*16,-60],[s*30,-46],[s*34,-28],[s*28,-26],[s*24,-42],[s*14,-50]]);F(g,'#5a3a1c',1.5);for(const d of[-3,0,3])L(g,s*31,-29,s*(32+d),-22,'#5a3a1c',2);}
 P(g,[[-16,-28],[-20,-62],[-12,-80],[12,-82],[20,-62],[16,-28]]);F(g,LG(g,-20,0,20,0,'#4a3018','#7a5430','#4a3018'),2);
 for(const x of[-12,-5,2,9,14]){g.beginPath();g.moveTo(x,-30);g.quadraticCurveTo(x-2,-55,x+1,-78);g.strokeStyle='rgba(30,18,6,.55)';g.lineWidth=1.3;g.stroke();}
 E(g,-4,-50,4,6);F(g,'#3a2410',1);E(g,-4,-50,2,3);F(g,'#2a1a0a',0);// Astloch
 for(const[x,y]of[[8,-40],[-10,-36]]){E(g,x,y,3.4,2);F(g,'#4a8a2a',.8);}// Moos
 for(const[x,y,r]of[[-14,-92,13],[12,-94,14],[0,-104,15],[-22,-80,9],[22,-80,9],[0,-86,13]]){E(g,x,y,r);F(g,LG(g,0,y-r,0,y+r,'#5a982e','#24501a'),1.4);}
 for(const[x,y]of[[-10,-98],[8,-100],[16,-88],[-18,-86]]){E(g,x,y,2.2);F(g,'#98d060',0);}}
// ---- Sylvara von hinten ----
function drawThornBack(g){
 g.save();g.translate(-8,-28);g.rotate(Math.PI);g.beginPath();g.arc(0,0,15,-1.3,1.3);g.strokeStyle=OL;g.lineWidth=3.4;g.stroke();g.strokeStyle='#4a6a24';g.lineWidth=2;g.stroke();g.restore();
 P(g,[[-12,0],[-14,-12],[-9,-30],[9,-30],[13,-12],[11,0]]);F(g,LG(g,-14,0,13,0,'#2a4a1a','#5a8a34','#2a4a1a'),1.6);
 for(let i=0;i<5;i++){const x=-10+i*5;P(g,[[x,0],[x+2.5,-7],[x+5,0]]);F(g,'#3a6a24',1);}
 P(g,[[-8,-30],[-9,-42],[9,-42],[8,-30]]);F(g,LG(g,0,-42,0,-30,'#8a6a42','#5a4024'),1.4);
 // Blätterhaar fällt über den Rücken
 P(g,[[-7,-50],[-9,-30],[0,-24],[9,-30],[7,-50]]);F(g,LG(g,0,-50,0,-24,'#3a7a22','#24501a'),1.2);
 E(g,0,-49,6.5,7);F(g,LG(g,0,-56,0,-42,'#4a9a2a','#2a6a1a'),1.4);
 for(const[x,y,a]of[[-6,-34,-.3],[0,-30,0],[6,-34,.3],[-4,-42,-.2],[4,-42,.2]]){g.save();g.translate(x,y);g.rotate(a);E(g,0,-2,2.2,4.2);F(g,'#5aaa34',.8);g.restore();}
 for(const s of[-1,1]){L(g,s*4,-55,s*9,-66,'#6a4a2a',2);L(g,s*7,-62,s*12,-64,'#6a4a2a',1.6);}}
Object.assign(DART,{
 storm_b:{fn:drawStormBack,m:.86},netter_b:{fn:drawNetterBack,m:.92},troll_b:{fn:g=>drawTrollBack(g,0),m:.82},trollking_b:{fn:g=>drawTrollBack(g,1),m:.8},
 banner_b:{fn:drawBannerBack,m:.78},beetle_b:{fn:drawBeetleBack,m:.95},treant_b:{fn:drawTreantBack,m:.78},thorn_b:{fn:drawThornBack,m:.84}});
for(const k of['whelp','frostwyrm','dragonlord','shade']){const o=WYRMB[k],m=DART[k].m,hd=[0,-64*o.s];
 DART[k+'_b']={fn:g=>drawWyrmBack(g,o),m,head:hd};DART[k+'_b_f']={fn:g=>drawWyrmBack(g,Object.assign({flap:1},o)),m};}
