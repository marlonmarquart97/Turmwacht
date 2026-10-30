// ===== Turmwacht Duell 0.7 – neue Kreaturen (eigene Vektorgrafik) =====
// Alle Figuren schauen nach rechts (+x), Ursprung = Fußpunkt. Flieger: Ursprung = Schattenpunkt, Figur schwebt darüber.
// ---- Drachen-Grundform (parametrisiert): Glutwelpe, Frostwyrm, Vyrthax, Schattenschwinge ----
function drawWyrm(g,o){const s=o.s||1,fl=o.flap;g.save();g.scale(s,s);
 const wing=(near)=>{const up=!fl,sx=0,sy=-36;
  const T=up?[[-6,-86],[-26,-80],[-42,-62],[-46,-44]]:[[-4,-8],[-24,-12],[-40,-22],[-46,-32]];
  const back=[-16,-34];g.save();if(!near){g.translate(8,-3);g.scale(.86,.92);}
  g.beginPath();g.moveTo(sx,sy);g.lineTo(T[0][0],T[0][1]);
  for(let i=1;i<T.length;i++){const p=T[i-1],q=T[i],mx=(p[0]+q[0])/2+(up?4:2),my=(p[1]+q[1])/2+(up?6:-5);g.quadraticCurveTo(mx,my,q[0],q[1]);}
  g.quadraticCurveTo(-30,up?-38:-30,back[0],back[1]);g.closePath();
  const wc=o.wing;F(g,o.bone?'rgba(150,215,255,.38)':LG(g,0,up?-86:-8,0,-34,near?wc[0]:wc[2]||wc[1],wc[1]),1.5,o.bone?'#d8f0ff':OL);
  for(const t of T)L(g,sx,sy,t[0],t[1],o.bone?'#e8f4ff':o.arm||'#2a1408',o.bone?2.4:1.6);
  if(o.bone)for(const t of T){E(g,t[0],t[1],1.8);F(g,'#e8f4ff',.8);}
  g.restore();};
 wing(false);
 // Schwanz
 g.beginPath();g.moveTo(-10,-34);g.quadraticCurveTo(-34,-34,-48,-20);g.quadraticCurveTo(-56,-12,-64,-16);g.quadraticCurveTo(-54,-6,-44,-14);g.quadraticCurveTo(-30,-24,-8,-24);g.closePath();
 F(g,o.bone?'#d8dcd0':LG(g,0,-36,0,-14,o.body[0],o.body[1]),1.5);
 P(g,[[-64,-16],[-72,-22],[-68,-12]]);F(g,o.horn,1);
 if(o.bone)for(let i=0;i<5;i++){const x=-14-i*9,y=-29+i*2.4;L(g,x,y-3,x-2,y+3,'#7a8a96',1.2);}
 // Beine (angezogen)
 for(const x of[-8,10]){P(g,[[x-4,-26],[x+4,-26],[x+5,-14],[x+9,-11],[x+1,-11],[x-3,-17]]);F(g,o.bone?'#d8dcd0':o.body[1],1.4);
  for(let k=0;k<3;k++){P(g,[[x+2+k*2.5,-11],[x+3.5+k*2.5,-7.5],[x+4+k*2.5,-11]]);F(g,'#f0e8d8',.6);}}
 // Rumpf
 if(o.bone){E(g,0,-30,20,10);F(g,'rgba(120,190,240,.25)',1.2,'#a8d8ff');
  L(g,-18,-34,20,-36,'#e0e4d8',4);L(g,-18,-34,20,-36,'#8a96a0',1);
  for(let i=0;i<6;i++){const x=-12+i*5.6;g.beginPath();g.moveTo(x,-35);g.quadraticCurveTo(x+5,-26,x+1,-20);g.strokeStyle=OL;g.lineWidth=3.2;g.stroke();g.strokeStyle='#e4e6da';g.lineWidth=1.8;g.stroke();}
  g.save();g.shadowColor='#7fd8ff';g.shadowBlur=10;E(g,2,-29,4.5,4);F(g,'rgba(160,230,255,.9)',0);g.restore();}
 else{E(g,0,-30,22,11.5);F(g,LG(g,0,-42,0,-18,o.body[0],o.body[1]),1.8);
  g.save();E(g,0,-30,22,11.5);g.clip();E(g,3,-21,18,6);F(g,o.belly,0);for(let i=0;i<5;i++)L(g,-10+i*6,-25,-8+i*6,-16,'rgba(0,0,0,.28)',1);g.restore();
  for(let i=0;i<6;i++){const x=-16+i*6.4;P(g,[[x,-40.5],[x+2.6,-46.5],[x+5,-40.5]]);F(g,o.horn,1);}
  if(o.lava){g.save();g.shadowColor='#ff6a10';g.shadowBlur=6;for(const[a,b,c,d]of[[-12,-34,-4,-30],[-4,-30,2,-35],[6,-32,14,-28]])L(g,a,b,c,d,'#ffa030',1.4);g.restore();}}
 // Hals + Kopf
 g.beginPath();g.moveTo(12,-38);g.quadraticCurveTo(22,-50,30,-54);g.lineTo(36,-48);g.quadraticCurveTo(26,-42,20,-26);g.closePath();
 F(g,o.bone?'#d8dcd0':LG(g,12,-54,22,-26,o.body[0],o.body[1]),1.6);
 if(o.bone)for(let i=0;i<4;i++)L(g,16+i*4,-40-i*3.4,20+i*4,-37-i*3.4,'#7a8a96',1.2);
 const hc=o.bone?'#ecebe0':o.head||o.body[0];
 P(g,[[26,-56],[34,-60],[44,-57],[52,-52],[50,-48],[40,-47],[32,-44],[27,-48]]);F(g,LG(g,26,-60,26,-44,hc,o.bone?'#9aa4a8':o.body[1]),1.6);
 P(g,[[32,-46],[40,-47],[49,-46],[44,-41],[34,-41]]);F(g,o.bone?'#c8ccc0':o.body[1],1.3);// Unterkiefer
 for(let k=0;k<3;k++){P(g,[[38+k*4,-47],[39.5+k*4,-44.5],[41+k*4,-47]]);F(g,'#fff',.5);}
 P(g,[[28,-57],[16,-68],[22,-66],[31,-59]]);F(g,o.horn,1.1);P(g,[[33,-59],[26,-70],[31,-68],[36,-60]]);F(g,o.horn,1.1);
 g.save();g.shadowColor=o.eye;g.shadowBlur=6;E(g,38,-54,2.2,1.4);F(g,o.eye,0);g.restore();
 E(g,50.5,-51,1,.7);F(g,'#000',0);
 if(o.rider){// Reiter: Kapuzengestalt mit Klinge
  P(g,[[-4,-38],[-8,-52],[-4,-64],[2,-68],[7,-62],[8,-50],[6,-38]]);F(g,LG(g,-8,-68,8,-38,'#3a3a42','#141418'),1.5);
  P(g,[[-2,-62],[2,-68],[6,-62],[4,-57],[-1,-57]]);F(g,'#0a0a0c',1);
  g.save();g.shadowColor='#d0f0ff';g.shadowBlur=5;E(g,1,-61,.9);F(g,'#e8f8ff',0);E(g,4,-61,.9);F(g,'#e8f8ff',0);g.restore();
  L(g,6,-50,20,-66,OL,3.4);L(g,6,-50,20,-66,'#c8ccd4',1.8);L(g,4,-48,9,-52,'#6a4a2a',3);
  P(g,[[-8,-46],[-18,-40],[-14,-36],[-5,-40]]);F(g,'#24242a',1.2);}
 wing(true);
 g.restore();}
const WYRM={
 whelp:{s:.62,body:['#e0502a','#6a1408'],belly:'#f0b060',wing:['#c83a20','#4a0c06','#8a2010'],horn:'#f4e2b0',eye:'#ffe040',head:'#ea6a34'},
 frostwyrm:{s:1.08,bone:1,body:['#e8ecf0','#8a96a0'],belly:'#fff',wing:['#bfe8ff','#5a8ab0'],horn:'#e8f4ff',eye:'#9fe8ff'},
 dragonlord:{s:1.28,body:['#3a2a2a','#120808'],belly:'#5a3020',wing:['#4a2418','#140604','#2a100a'],horn:'#d8c49a',eye:'#ff8a10',head:'#4a3030',lava:1,arm:'#ff7a20'},
 shade:{s:.92,body:['#5a5658','#1e1c1e'],belly:'#6e6a66',wing:['#4a4446','#141214','#2a2628'],horn:'#9a9488',eye:'#e0ff80',head:'#5e5a58',rider:1}};
// Kronen-Detail für Vyrthax
function drawDragonlord(g,fl){drawWyrm(g,Object.assign({flap:fl},WYRM.dragonlord));g.save();g.scale(1.28,1.28);
 for(const[x,y,h]of[[30,-60,7],[35,-61,9],[40,-59,7]]){P(g,[[x-1.6,y],[x,y-h],[x+1.6,y]]);F(g,'#ffc040',.8);}g.restore();}
// ---- Baumtroll / Ugrak ----
function drawTroll(g,king){
 // Beine
 for(const s of[-1,1]){P(g,[[s*4,-24],[s*13,-24],[s*14,-4],[s*16,0],[s*3,0],[s*4,-6]]);F(g,LG(g,0,-24,0,0,'#6a8a6a','#3a5a40'),1.6);}
 P(g,[[-15,-26],[15,-26],[12,-16],[0,-13],[-12,-16]]);F(g,king?'#5a2a1a':'#5a4228',1.5);// Lendenschurz
 if(king){P(g,[[-22,-52],[-30,-30],[-24,-14],[-12,-22],[-10,-50]]);F(g,LG(g,-30,0,-10,0,'#6a4a2a','#3a2414'),1.5);for(let i=0;i<4;i++)L(g,-28+i*4,-30,-26+i*4,-18,'#2a180c',1);}
 // Rumpf, nach vorn gebeugt
 P(g,[[-18,-24],[-22,-46],[-12,-62],[10,-64],[22,-52],[20,-30],[12,-22]]);F(g,LG(g,-22,-60,20,-24,'#86a882','#4a6a50'),2);
 E(g,2,-36,11,9);F(g,'rgba(200,220,180,.35)',0);
 for(const[x,y]of[[-10,-50],[4,-56],[-4,-42]]){E(g,x,y,2.6,1.8);F(g,'rgba(40,70,40,.55)',0);}
 if(king){L(g,-14,-56,14,-30,'#c8c0a8',3);for(let i=0;i<4;i++){E(g,-10+i*7,-52+i*6.5,2.2,3);F(g,'#ece4cc',1);}// Knochenkette
  L(g,-8,-48,-2,-40,'#c03020',2);L(g,4,-50,10,-42,'#c03020',2);}
 // hinterer Arm
 P(g,[[-14,-58],[-24,-44],[-22,-30],[-16,-30],[-16,-44]]);F(g,'#5a7a5a',1.5);E(g,-19,-28,5);F(g,'#5a7a5a',1.4);
 // Kopf (tief sitzend, Hauer)
 P(g,[[6,-60],[10,-74],[20,-78],[30,-72],[32,-62],[26,-54],[12,-54]]);F(g,LG(g,6,-78,30,-54,'#9ab894','#5a7a5a'),1.7);
 L(g,14,-70,24,-69,OL,2.2);g.save();g.shadowColor='#ffc020';g.shadowBlur=4;E(g,22,-67,1.5,1.1);F(g,'#ffe060',0);g.restore();
 P(g,[[27,-68],[34,-66],[29,-63]]);F(g,'#7a9a74',1.1);// Nase
 for(const x of[20,26]){P(g,[[x,-58],[x+1,-65],[x+3,-58]]);F(g,'#f4ecd2',.8);}
 P(g,[[8,-72],[2,-80],[10,-77]]);F(g,'#5a7a5a',1);// Ohr
 if(king){P(g,[[9,-75],[11,-86],[15,-79],[19,-89],[22,-79],[27,-86],[28,-74]]);F(g,LG(g,0,-89,0,-74,'#f0e6c8','#a08a5a'),1.3);
  for(const[x,y]of[[13,-60],[17,-62]])L(g,x,y,x+3,y-6,'#c03020',1.6);}
 // Waffe: ausgerissener Baum (Troll) bzw. Stachelkeule (Ugrak)
 g.save();g.translate(22,-40);g.rotate(-.55);
 if(king){P(g,[[-3,8],[3,8],[6,-44],[-6,-44]]);F(g,LG(g,-6,0,6,0,'#4a2e16','#8a5a2a','#4a2e16'),1.6);
  E(g,0,-46,10,13);F(g,LG(g,-10,-58,10,-34,'#7a5a3a','#3a2414'),1.8);
  for(const[x,y]of[[-10,-46],[10,-46],[-6,-56],[6,-56],[0,-60],[-8,-38],[8,-38]]){const a=Math.atan2(y+46,x),X=Math.cos(a)*15,Y=-46+Math.sin(a)*15;P(g,[[x*.8-1.5,y],[X,Y],[x*.8+1.5,y]]);F(g,'#d8d0c0',.8);}}
 else{P(g,[[-3,8],[3,8],[5,-48],[-5,-48]]);F(g,LG(g,-5,0,5,0,'#3a2414','#7a5028','#3a2414'),1.6);
  for(const[a,b]of[[-4,10],[4,12],[0,13]])L(g,0,8,a,b+4,'#4a2e16',1.6);// Wurzeln unten
  L(g,0,-30,-10,-40,'#4a2e16',2.4);L(g,0,-40,9,-48,'#4a2e16',2);
  for(const[x,y,r]of[[0,-54,11],[-10,-46,8],[9,-50,8],[-4,-62,8],[6,-60,7]]){E(g,x,y,r);F(g,LG(g,0,y-r,0,y+r,'#5a9a3a','#244a18'),1.3);}}
 g.restore();
 // vorderer Arm hält die Waffe
 P(g,[[12,-58],[22,-50],[26,-40],[20,-36],[14,-46]]);F(g,LG(g,12,-58,26,-36,'#86a882','#4a6a50'),1.6);E(g,23,-38,5.5);F(g,'#7a9a74',1.5);}
// ---- Sturmrufer ----
function drawStorm(g){
 L(g,14,-2,18,-60,OL,4);L(g,14,-2,18,-60,'#6a4a2a',2.2);
 g.save();g.shadowColor='#8ac8ff';g.shadowBlur=10;P(g,[[18,-60],[14,-66],[18,-74],[22,-66]]);F(g,LG(g,0,-74,0,-60,'#e8f8ff','#4a9aff'),1.2);g.restore();
 L(g,18,-74,24,-80,'#cfe8ff',1);L(g,24,-80,21,-84,'#cfe8ff',1);L(g,14,-68,9,-74,'#cfe8ff',1);
 P(g,[[-11,0],[-13,-16],[-9,-34],[9,-34],[13,-16],[11,0]]);F(g,LG(g,-13,0,13,0,'#1a2a5a','#3a5aa8','#1a2a5a'),1.6);
 for(let i=0;i<3;i++)L(g,-9+i*2,-4-i*9,9-i*2,-4-i*9,'rgba(160,200,255,.45)',1.2);
 L(g,-9,-20,9,-20,'#c8a040',2.4);
 P(g,[[-12,-34],[-10,-44],[10,-44],[12,-34]]);F(g,'#7a6a5a',1.3);// Fellkragen
 for(let i=0;i<6;i++)L(g,-10+i*4,-34,-9+i*4,-38,'#4a3a2a',1);
 E(g,0,-48,6.5,7);F(g,LG(g,0,-55,0,-41,'#8ab07a','#5a7a4a'),1.4);
 P(g,[[-8,-46],[-7,-56],[0,-62],[7,-56],[8,-46],[4,-50],[-4,-50]]);F(g,LG(g,0,-62,0,-46,'#5a6a8a','#2a3a5a'),1.4);// Kapuze
 for(const s of[-1,1]){P(g,[[s*3,-43],[s*4,-39],[s*5,-43]]);F(g,'#f4ecd2',.6);}
 g.save();g.shadowColor='#9fe0ff';g.shadowBlur=4;E(g,-2.4,-48,1.1);F(g,'#d8f4ff',0);E(g,2.4,-48,1.1);F(g,'#d8f4ff',0);g.restore();
 P(g,[[8,-38],[16,-34],[17,-28],[12,-30]]);F(g,'#3a5aa8',1.2);E(g,16,-30,3);F(g,'#8ab07a',1.1);}
// ---- Netzwerfer ----
function drawNetter(g){
 for(const s of[-1,1]){P(g,[[s*2,-14],[s*7,-14],[s*7,-2],[s*9,0],[s*2,0]]);F(g,'#5a4a2a',1.3);}
 P(g,[[-9,-12],[-11,-26],[9,-26],[9,-12]]);F(g,LG(g,-11,0,9,0,'#4a5a2a','#7a8a3a'),1.5);
 L(g,-9,-16,9,-16,'#3a2414',2.4);
 // Netzbündel auf dem Rücken
 E(g,-10,-26,7,8);F(g,'#b8a878',1.3);g.save();E(g,-10,-26,7,8);g.clip();for(let i=-3;i<4;i++){L(g,-17+i*4,-34,-3+i*4,-18,'#6a5a3a',.8);L(g,-3+i*4,-34,-17+i*4,-18,'#6a5a3a',.8);}g.restore();
 E(g,0,-31,6,6);F(g,LG(g,0,-37,0,-25,'#9aa864','#5a6a3a'),1.4);
 for(const s of[-1,1]){P(g,[[s*5,-33],[s*12,-37],[s*6,-30]]);F(g,'#8a9a58',1);}// Ohren
 P(g,[[-6,-34],[0,-40],[6,-34],[4,-36],[-4,-36]]);F(g,'#4a3a2a',1.1);
 g.save();g.shadowColor='#ffd040';g.shadowBlur=3;E(g,-2,-31,1);F(g,'#ffe070',0);E(g,2.2,-31,1);F(g,'#ffe070',0);g.restore();
 // Wurfnetz in der Hand
 L(g,6,-24,14,-30,'#7a8a3a',3.4);
 g.save();g.translate(18,-34);E(g,0,0,7,6);F(g,'rgba(200,184,130,.35)',1,'#8a7a4a');for(let i=-2;i<=2;i++){L(g,i*3,-5.5,i*3,5.5,'#8a7a4a',.7);L(g,-6.5,i*2.6,6.5,i*2.6,'#8a7a4a',.7);}
 for(const a of[0,1.6,3.2,4.7]){E(g,Math.cos(a)*7,Math.sin(a)*6,1.4);F(g,'#5a5a62',.6);}g.restore();}
// ---- Kriegsgesang (Zauber-Icon): Kriegstrommel ----
function drawChant(g){g.save();g.translate(0,-10);
 for(let i=0;i<3;i++){g.beginPath();g.arc(0,-6,16+i*7,-2.6,-.54);g.strokeStyle=`rgba(255,${120+i*30},60,${.9-i*.25})`;g.lineWidth=2.4-i*.5;g.stroke();}
 P(g,[[-12,-8],[-10,10],[10,10],[12,-8]]);F(g,LG(g,-12,0,12,0,'#5a2e16','#a86a34','#5a2e16'),1.6);
 E(g,0,-8,12,4);F(g,LG(g,0,-12,0,-4,'#f0dcb0','#c8a878'),1.4);
 for(let i=0;i<4;i++)L(g,-11+i*7.3,-6,-8+i*7.3,9,'#e0c890',1);
 L(g,-14,-24,2,-10,OL,3.4);L(g,-14,-24,2,-10,'#c8a060',1.8);E(g,-14,-24,2.6);F(g,'#e8d8b0',1);
 L(g,14,-24,-2,-10,OL,3.4);L(g,14,-24,-2,-10,'#c8a060',1.8);E(g,14,-24,2.6);F(g,'#e8d8b0',1);g.restore();}
// ---- Bannerträger ----
function drawBanner(g){
 L(g,-6,4,-6,-84,OL,4);L(g,-6,4,-6,-84,'#7a5028',2.2);P(g,[[-8,-84],[-6,-90],[-4,-84]]);F(g,'#e0c060',1);
 g.beginPath();g.moveTo(-5,-82);g.lineTo(18,-80);g.quadraticCurveTo(14,-70,20,-60);g.lineTo(10,-56);g.lineTo(4,-62);g.lineTo(-5,-58);g.closePath();F(g,LG(g,-5,-82,20,-58,'#2a7a3a','#1a4a24'),1.4);
 g.save();g.translate(6,-70);for(let i=0;i<5;i++){const a=-1.57+i*1.257;P(g,[[0,0],[Math.cos(a)*5,Math.sin(a)*5],[Math.cos(a+.6)*2,Math.sin(a+.6)*2]]);F(g,'#e8c860',.6);}g.restore();
 L(g,-5,-82,18,-80,'#e8c860',1.4);
 for(const s of[-1,1]){P(g,[[s*2,-14],[s*7,-14],[s*7,-2],[s*9,0],[s*2,0]]);F(g,'#4a3a2a',1.3);}
 P(g,[[-10,-12],[-12,-34],[10,-34],[10,-12]]);F(g,LG(g,-12,0,10,0,'#6a6a72','#b0b0b8','#6a6a72'),1.6);
 P(g,[[-6,-32],[6,-32],[4,-14],[-4,-14]]);F(g,'#2a7a3a',1.1);L(g,0,-30,0,-16,'#e8c860',1.4);
 L(g,-10,-14,10,-14,'#4a2e16',2.6);
 E(g,0,-40,6,6.5);F(g,'#e3c29a',1.3);
 P(g,[[-7,-40],[-7,-46],[0,-51],[7,-46],[7,-40],[4,-43],[-4,-43]]);F(g,LG(g,0,-51,0,-40,'#c8c8d0','#6a6a72'),1.3);L(g,0,-51,0,-56,'#c83020',2);
 E(g,2,-39,.9);F(g,OL,0);E(g,-2,-39,.9);F(g,OL,0);
 E(g,-6,-28,3.4);F(g,'#e3c29a',1.1);
 P(g,[[8,-32],[14,-26],[11,-22],[6,-26]]);F(g,'#9a9aa2',1.1);L(g,12,-24,22,-34,OL,3);L(g,12,-24,22,-34,'#d8dce2',1.4);}
// ---- Grubenkriecher (Käfer) ----
function drawBeetle(g){
 for(let i=0;i<3;i++)for(const s of[-1,1]){const x=-10+i*9;L(g,x,-8,x+s*3+2,0,OL,3);L(g,x,-8,x+s*3+2,0,'#3a2a1a',1.6);}
 E(g,-2,-12,18,10);F(g,LG(g,0,-22,0,-2,'#6a5a8a','#241a34'),1.8);
 g.save();E(g,-2,-12,18,10);g.clip();L(g,-2,-22,-2,-2,'rgba(0,0,0,.5)',1.4);for(const x of[-12,-6,4,10])L(g,x,-21,x+1,-4,'rgba(255,255,255,.1)',2);g.restore();
 for(const[x,y]of[[-10,-16],[6,-16],[-4,-19],[12,-12]]){P(g,[[x-2,y],[x,y-5],[x+2,y]]);F(g,'#b8a8d8',.8);}
 E(g,17,-10,7,6);F(g,LG(g,0,-16,0,-4,'#5a4a7a','#1e1630'),1.5);
 g.beginPath();g.moveTo(22,-12);g.quadraticCurveTo(30,-16,32,-8);g.lineTo(28,-10);g.quadraticCurveTo(26,-12,22,-9);F(g,'#d8c8a0',1.1);
 g.beginPath();g.moveTo(22,-8);g.quadraticCurveTo(30,-4,31,-12);g.lineTo(27,-9);g.quadraticCurveTo(25,-6,22,-6);F(g,'#c8b890',1.1);
 g.save();g.shadowColor='#ff5030';g.shadowBlur=4;E(g,19,-13,1.3);F(g,'#ff8050',0);g.restore();
 L(g,20,-15,26,-24,'#3a2a4a',1);L(g,18,-15,20,-25,'#3a2a4a',1);}
function drawMound(g){E(g,0,-2,16,6);F(g,LG(g,0,-8,0,4,'#8a6a42','#4a3420'),1.4);for(const[x,y]of[[-8,-4],[3,-6],[9,-2],[-2,-1]]){E(g,x,y,2.4,1.4);F(g,'#6a4e30',.6);}}
// ---- Borkenhüter (Baumriese) ----
function drawTreant(g){
 for(const s of[-1,1]){P(g,[[s*3,-30],[s*14,-30],[s*16,-8],[s*22,0],[s*12,0],[s*8,-4],[s*4,0],[s*3,-12]]);F(g,LG(g,0,-30,0,0,'#6a4a2a','#3a2414'),1.6);}
 P(g,[[-16,-28],[-20,-62],[-12,-80],[12,-82],[20,-62],[16,-28]]);F(g,LG(g,-20,0,20,0,'#4a3018','#8a6034','#4a3018'),2);
 for(const x of[-10,-3,5,12]){g.beginPath();g.moveTo(x,-30);g.quadraticCurveTo(x+3,-55,x-1,-78);g.strokeStyle='rgba(30,18,6,.55)';g.lineWidth=1.3;g.stroke();}
 E(g,0,-66,10,5);F(g,'#2a1a0a',0);// Mund-Höhle
 L(g,-8,-75,-1,-72,OL,2.4);L(g,8,-75,1,-72,OL,2.4);
 g.save();g.shadowColor='#c0ff60';g.shadowBlur=7;E(g,-5,-71,2,1.4);F(g,'#d8ff80',0);E(g,5,-71,2,1.4);F(g,'#d8ff80',0);g.restore();
 // Krone
 for(const[x,y,r]of[[-14,-92,13],[12,-94,14],[0,-102,15],[-22,-80,9],[22,-80,9],[0,-88,11]]){E(g,x,y,r);F(g,LG(g,0,y-r,0,y+r,'#6aa83a','#2a5a1a'),1.4);}
 for(const[x,y]of[[-10,-98],[8,-100],[16,-88],[-18,-86]]){E(g,x,y,2.4);F(g,'#a8e070',0);}
 // Ast-Arme
 P(g,[[-16,-60],[-30,-44],[-34,-26],[-28,-24],[-24,-40],[-14,-50]]);F(g,'#5a3a1c',1.5);for(const[a,b]of[[-34,-26],[-30,-22],[-26,-24]])L(g,-30,-28,a-2,b+4,'#5a3a1c',2);
 P(g,[[16,-60],[30,-50],[38,-34],[32,-30],[26,-44],[14,-50]]);F(g,'#6a4422',1.5);for(const[a,b]of[[40,-30],[36,-26],[32,-27]])L(g,35,-32,a,b,'#6a4422',2.2);
 E(g,-26,-62,5,3.5);F(g,'#4a8a2a',1);E(g,28,-58,5,3.5);F(g,'#4a8a2a',1);}
// ---- Sylvara (Dornenmutter) ----
function drawThorn(g){
 // Dornenranken-Bogen
 g.beginPath();g.arc(8,-28,16,-1.3,1.3);g.strokeStyle=OL;g.lineWidth=3.6;g.stroke();g.strokeStyle='#4a6a24';g.lineWidth=2.2;g.stroke();
 for(let i=0;i<6;i++){const a=-1.2+i*.48,x=8+Math.cos(a)*16,y=-28+Math.sin(a)*16;P(g,[[x,y-1],[x+Math.cos(a)*4,y+Math.sin(a)*4],[x,y+1]]);F(g,'#c8d890',.5);}
 L(g,8+Math.cos(-1.3)*16,-28+Math.sin(-1.3)*16,8+Math.cos(1.3)*16,-28+Math.sin(1.3)*16,'#e0f0c0',.8);
 P(g,[[-12,0],[-14,-12],[-9,-30],[9,-30],[13,-12],[11,0]]);F(g,LG(g,-14,0,13,0,'#2a4a1a','#5a8a34','#2a4a1a'),1.6);
 for(let i=0;i<5;i++){const x=-10+i*5;P(g,[[x,0],[x+2.5,-7],[x+5,0]]);F(g,'#3a6a24',1);}
 P(g,[[-8,-30],[-9,-42],[9,-42],[8,-30]]);F(g,LG(g,0,-42,0,-30,'#8a6a42','#5a4024'),1.4);// Rinde
 L(g,-6,-40,-2,-32,'rgba(30,18,6,.5)',1);L(g,4,-41,6,-33,'rgba(30,18,6,.5)',1);
 E(g,0,-48,6,7);F(g,LG(g,0,-55,0,-41,'#b8a070','#7a6040'),1.4);
 // Blätter-/Geweihhaar
 for(const[x,y,a]of[[-8,-52,-.6],[-6,-57,-.3],[0,-58,0],[6,-57,.3],[8,-52,.6],[-9,-46,-.9]]){g.save();g.translate(x,y);g.rotate(a);E(g,0,-3,2.6,5);F(g,'#4a9a2a',1);g.restore();}
 for(const s of[-1,1]){L(g,s*4,-55,s*9,-66,'#6a4a2a',2);L(g,s*7,-62,s*12,-64,'#6a4a2a',1.6);}
 g.save();g.shadowColor='#c0ff60';g.shadowBlur=5;E(g,-2.3,-48,1.1,.9);F(g,'#e0ffa0',0);E(g,2.3,-48,1.1,.9);F(g,'#e0ffa0',0);g.restore();
 P(g,[[6,-38],[12,-32],[9,-28],[5,-33]]);F(g,'#8a6a42',1.1);}
// ---- Registrierung ----
Object.assign(DART,{
 storm:{fn:drawStorm,m:.86},netter:{fn:drawNetter,m:.92},troll:{fn:g=>drawTroll(g,0),m:.82},trollking:{fn:g=>drawTroll(g,1),m:.8},
 chant:{fn:drawChant,m:1,spell:1},banner:{fn:drawBanner,m:.78},beetle:{fn:drawBeetle,m:.95},mound:{fn:drawMound,m:1},
 treant:{fn:drawTreant,m:.78},thorn:{fn:drawThorn,m:.84},
 whelp:{fn:g=>drawWyrm(g,WYRM.whelp),m:.9,head:[50*.62,-50*.62]},whelp_f:{fn:g=>drawWyrm(g,Object.assign({flap:1},WYRM.whelp)),m:.9},
 frostwyrm:{fn:g=>drawWyrm(g,WYRM.frostwyrm),m:.72,head:[50*1.08,-50*1.08]},frostwyrm_f:{fn:g=>drawWyrm(g,Object.assign({flap:1},WYRM.frostwyrm)),m:.72},
 dragonlord:{fn:g=>drawDragonlord(g,0),m:.68,head:[50*1.28,-50*1.28]},dragonlord_f:{fn:g=>drawDragonlord(g,1),m:.68},
 shade:{fn:g=>drawWyrm(g,WYRM.shade),m:.74,head:[50*.92,-50*.92]},shade_f:{fn:g=>drawWyrm(g,Object.assign({flap:1},WYRM.shade)),m:.74},
 ugrakP:{fn:g=>drawTroll(g,1),m:1},sylvaraP:{fn:drawThorn,m:1},vyrthaxP:{fn:g=>drawDragonlord(g,0),m:1}});
