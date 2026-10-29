// ===== Turmwacht Duell 0.3 – Rückenansichten (eigene Truppen) & echte Frontansichten =====
// Eigene Einheiten (Seite 0, laufen nach oben) werden von hinten gezeigt: Helm/Hinterkopf, Umhang, Rücken, Waffe von hinten – kein Gesicht.
// Gegnerische Einheiten (Seite 1, laufen nach unten) behalten die Frontansicht. Ursprung = Fußpunkt, y negativ = oben.
const BK={};
// Hilfen
function bHood(g,pts,c1,c2,c3){P(g,pts);F(g,LG(g,-10,0,10,0,c1,c2,c3||c1),1.4);}
function bSeam(g,x0,y0,x1,y1){L(g,x0,y0,x1,y1,'rgba(0,0,0,.35)',1.1);}
// ---------- Elf (Bogenschütze) ----------
function drawElfBack(g){
 // Bogen vor dem Körper -> zuerst zeichnen, nur Enden sichtbar
 g.save();g.translate(9,0);drawElfBow(g);g.restore();
 P(g,[[-12,0],[-14,-12],[-10,-24],[10,-24],[14,-12],[12,0]]);F(g,LG(g,-14,0,14,0,'#12300f','#2a5a22','#12300f'));
 P(g,[[-6,0],[-6,-8],[6,-8],[6,0]]);F(g,'#3a2410',1.3);
 // Umhang über dem Rücken
 P(g,[[-9,-22],[9,-22],[12,-3],[6,-5],[0,-2],[-6,-5],[-12,-3]]);F(g,LG(g,0,-22,0,-2,'#2e6a24','#143410'),1.4);
 bSeam(g,-4,-20,-6,-5);bSeam(g,4,-20,6,-5);
 // Köcher quer über den Rücken
 g.save();g.translate(-2,-15);g.rotate(-.42);P(g,[[-3,-10],[3,-10],[3,9],[-3,9]]);F(g,LG(g,-3,0,3,0,'#3a2010','#7a4a22','#3a2010'),1.3);
  L(g,-3,-4,3,-4,'#d4a94a',1);for(const[x,c]of[[-1.6,'#cfc8b0'],[0.4,'#b8302a'],[2,'#cfc8b0']]){L(g,x,-10,x+.4,-17,c,1.6);}g.restore();
 for(const s of[-1,1]){E(g,s*10,-20,6.8,5.2);F(g,LG(g,0,-25,0,-15,'#a8743e','#5a3418'));L(g,s*5,-18.5,s*15,-18.5,'#d4a94a',1.2);}
 // Kapuze von hinten (geschlossen, kein Gesicht)
 P(g,[[-8,-21],[-10,-30],[-4,-38],[1,-43],[5,-38],[10,-30],[8,-21]]);F(g,LG(g,-10,-30,10,-30,'#12340f','#2e6a24','#12340f'));
 bSeam(g,0.5,-41,0,-23);P(g,[[-5,-22],[0,-19],[5,-22],[0,-24]]);F(g,'#1a4414',1);
 P(g,[[7.5,-28],[17,-34],[8.5,-24.5]]);F(g,'#e8c9a0',1.1);P(g,[[-7.5,-28],[-13,-31],[-8.5,-25]]);F(g,'#d8b890',1);}
BK.elf=g=>drawElfBack(g);
// ---------- Ork (Rücken) ----------
function drawOrcBack(g,helm){
 for(const s of[-1,1]){P(g,[[s*9,0],[s*8,-9],[s*1.5,-9],[s*2,0]]);F(g,'#4a3020',1.3);E(g,s*5.5,0,5,2.4);F(g,'#24160a',1.2);}
 for(const s of[-1,1]){E(g,s*15.5,-13,5.2,8.5);F(g,'#527e24');P(g,[[s*11,-10],[s*20,-10],[s*19.5,-5],[s*11.5,-5]]);F(g,'#5a3a1e',1.2);E(g,s*15.5,-3,4.2,3.6);F(g,'#527e24');}
 P(g,[[-9,-8],[-14,-20],[-7,-26],[7,-26],[14,-20],[9,-8]]);F(g,LG(g,-14,-24,12,-8,'#76a83a','#3a6418'));
 // Wirbelsäule & Schulterblätter
 L(g,0,-25,0,-10,'rgba(0,0,0,.4)',1.4);for(const s of[-1,1]){g.beginPath();g.arc(s*5,-19,4,s>0?Math.PI*.6:Math.PI*.4,s>0?Math.PI*1.4:Math.PI*.4+Math.PI*.8,s<0);g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=1;g.stroke();}
 // Ledergurte über Kreuz
 L(g,-11,-22,9,-10,'#4a2a12',2.6);L(g,11,-22,-9,-10,'#4a2a12',2.6);E(g,0,-16,2.2);F(g,'#b8bec6',1);
 P(g,[[-10,-10],[10,-10],[9.5,-6.5],[-9.5,-6.5]]);F(g,'#5a3418',1.2);
 for(const s of[-1,1]){P(g,[[s*9,-27],[s*12,-36],[s*15,-27]]);F(g,'#d8d2c4',1.1);P(g,[[s*16,-25],[s*23,-31],[s*20,-22]]);F(g,'#d8d2c4',1.1);
  E(g,s*13,-23,8.8,6.2);F(g,LG(g,0,-29,0,-17,'#9aa0a8','#3a3e46'));E(g,s*13,-23,1.4);F(g,'#d4a94a',.6);}
 // Hinterkopf
 E(g,0,-27,6.6,6);F(g,LG(g,0,-33,0,-21,'#5e8f2a','#3e6a1a'));
 for(const s of[-1,1]){P(g,[[s*6,-28],[s*10,-31],[s*6.4,-25]]);F(g,'#5e8f2a',1);}
 if(!helm){E(g,0,-33.5,2.6);F(g,'#140c04',1);P(g,[[-1.4,-32],[1.4,-32],[1,-22],[-1,-22]]);F(g,'#140c04',1);} }
function drawGruntBack(g,w){g.save();g.scale(w?1:.8,w?1:.8);
 // Äxte vor dem Körper: zuerst, die Klingen ragen seitlich heraus
 L(g,16,-6,24,-34,OL,4.5);L(g,16,-6,24,-34,'#6a4420',2.6);P(g,[[21,-38],[33,-40],[31,-27],[23,-30]]);F(g,LG(g,21,-40,33,-27,'#a8acb4','#4a4e58'),1.4);
 if(w){L(g,-16,-6,-24,-34,OL,4.5);L(g,-16,-6,-24,-34,'#6a4420',2.6);P(g,[[-21,-38],[-33,-40],[-31,-27],[-23,-30]]);F(g,LG(g,-21,-40,-33,-27,'#a8acb4','#4a4e58'),1.4);}
 drawOrcBack(g,w);
 if(w){P(g,[[-7.5,-23],[-8,-30],[-7.5,-36],[0,-39],[7.5,-36],[8,-30],[7.5,-23],[0,-21.5]]);F(g,LG(g,0,-39,0,-22,'#b8bec6','#4a4e56'),1.3);
  L(g,0,-38.5,0,-22.5,'#d8dce2',1.4);for(const y of[-33,-27])for(const s of[-1,1]){E(g,s*4.5,y,.9);F(g,'#e8e0c0',.5);}
  for(const sx of[-1,1]){P(g,[[sx*7,-34],[sx*14,-43],[sx*9,-31]]);F(g,'#e8dfc4',1.1);}
  P(g,[[-9,-10],[9,-10],[8,-19],[-8,-19]]);F(g,'rgba(120,126,136,.85)',1.2);L(g,-7,-14.5,7,-14.5,'#2a2e36',1);}
 else{P(g,[[-7,-31],[0,-36],[7,-31]]);F(g,'#7a1a10',1.1);}
 g.restore();}
BK.grunt=g=>drawGruntBack(g,1);
// ---------- Feuermagier ----------
function drawMageBack(g){
 L(g,12,2,14,-42,OL,3.8);L(g,12,2,14,-42,'#7a5028',2.2);P(g,[[11,-41],[14,-48],[17,-41],[14,-38]]);F(g,'#d4a94a',1.1);
 P(g,[[-13,0],[-9,-22],[9,-22],[13,0]]);F(g,LG(g,-13,0,13,0,'#16104a','#3a2c94','#16104a'));
 L(g,-12.6,-1.2,12.6,-1.2,'#d4a94a',2);bSeam(g,0,-21,0,-2);
 E(g,-11,-12,4.6,6.2);F(g,'#2a2078');E(g,11,-12,4.6,6.2);F(g,'#2a2078');
 // Umhang/Mantel
 P(g,[[-10,-24],[10,-24],[12,-3],[0,-1],[-12,-3]]);F(g,LG(g,0,-24,0,-2,'#7a30a0','#3a1458'),1.4);
 for(const x of[-5,5])bSeam(g,x,-22,x*1.3,-4);
 for(const s of[-1,1]){E(g,s*10,-22,5.2,3.6);F(g,LG(g,0,-25,0,-19,'#f0cc5a','#9a7418'),1.2);}
 // weiße Haare unter dem Hut
 P(g,[[-6,-27],[6,-27],[5,-19],[0,-17],[-5,-19]]);F(g,LG(g,0,-27,0,-17,'#f4f4f8','#b8bcc8'),1);for(const x of[-3,0,3])L(g,x,-26,x,-19,'rgba(120,120,140,.5)',.8);
 // Spitzhut von hinten
 P(g,[[-7.5,-25],[-8.5,-31],[-3,-40],[4,-48],[3,-38],[8.5,-31],[7.5,-25]]);F(g,LG(g,-8,-30,8,-30,'#1c165c','#4a3cb4','#1c165c'));
 bSeam(g,1.5,-44,0,-26);}
BK.mage=drawMageBack;
// ---------- Alchemist (Goblin) ----------
function drawGoblinBack(g){
 for(const s of[-1,1]){P(g,[[s*6,0],[s*5.5,-7],[s*1.5,-7],[s*1.5,0]]);F(g,'#4a3020',1.2);}
 P(g,[[-9,-6],[-10,-20],[10,-20],[9,-6]]);F(g,LG(g,-10,-20,10,-6,'#6a4a2c','#3a2412'),1.4);
 // Rucksack mit Flaschen
 drawFlask(g,-4,-17,.42,'#8aff40');drawFlask(g,3.5,-18,.42,'#e03a8a');
 P(g,[[-7,-19],[7,-19],[6.5,-7],[-6.5,-7]]);F(g,LG(g,-7,0,7,0,'#5a3418','#8a5a2a','#5a3418'),1.3);
 L(g,-7,-14,7,-14,'#3a2010',1.2);E(g,0,-11,1.5);F(g,'#d4a94a',.6);for(const s of[-1,1])L(g,s*6,-19,s*8,-21,'#3a2010',1.6);
 for(const s of[-1,1]){P(g,[[s*8,-22],[s*22,-30],[s*10,-17]]);F(g,'#5e9a32',1.3);P(g,[[s*10,-21],[s*18,-27],[s*11,-19]]);F(g,'#4a7a28',0);}
 E(g,0,-24,8.5,7.5);F(g,LG(g,-8,-30,8,-18,'#7ab83e','#3e7a1c'),1.5);
 L(g,-8.2,-26.5,8.2,-26.5,'#4a3018',2);P(g,[[-1.6,-28],[1.6,-28],[1.6,-25],[-1.6,-25]]);F(g,'#b8a060',.8);
 P(g,[[-8,-30],[-5,-34],[5,-34],[8,-30]]);F(g,'#5a3418',1.2);}
BK.goblin=drawGoblinBack;
// ---------- Klingenmeister ----------
function drawBladeBack(g){
 g.save();g.shadowColor='#9ad8ff';g.shadowBlur=8;P(g,[[16,-23],[34,-58],[37,-56],[20,-20]]);F(g,LG(g,16,-20,36,-58,'#ffffff','#b8d8f0','#7aa8d0'),1.4);g.restore();
 for(const sx of[-1,1]){P(g,[[sx*2,-15],[sx*9,-15],[sx*9,0],[sx*1,0]]);F(g,'#3e2818',1.3);P(g,[[sx*1,-3],[sx*10,-3],[sx*11,1],[sx*1,1]]);F(g,'#2a1a10',1.2);}
 P(g,[[-11,-35],[11,-35],[9,-13],[-9,-13]]);F(g,LG(g,-11,-35,11,-13,'#c8ccd2','#6a7078','#33373e'),1.6);
 L(g,-12,-28,-16,-18,OL,5);L(g,-12,-28,-16,-18,'#e8b48a',3.2);L(g,12,-28,17,-21,OL,5);L(g,12,-28,17,-21,'#e8b48a',3.2);
 // roter Umhang über dem Rücken
 P(g,[[-11,-36],[11,-36],[15,-8],[8,-11],[2,-7],[-5,-11],[-14,-7]]);F(g,LG(g,0,-36,0,-7,'#c43020','#6a1008'),1.5);
 for(const x of[-6,0,6])bSeam(g,x*.6,-33,x,-10);
 for(const sx of[-1,1]){E(g,sx*12,-33,6.5,5);F(g,LG(g,0,-38,0,-28,'#ffe070','#a06a10'),1.4);}
 E(g,0,-42,7,7.5);F(g,LG(g,0,-49,0,-35,'#7a4a24','#4a2810'),1.4);for(const x of[-4,0,4])L(g,x,-44,x*1.1,-36,'rgba(30,15,5,.5)',1);
 P(g,[[-8,-43],[-7,-50],[0,-54],[7,-50],[8,-43],[4,-41],[-4,-41]]);F(g,LG(g,0,-54,0,-41,'#d8dce2','#5a5e66'),1.4);
 L(g,0,-54,0,-42,'#ffd040',1.6);P(g,[[0,-54],[-4,-60],[-3,-49],[0,-46]]);F(g,'#d03020',1.2);P(g,[[0,-50],[-2,-36],[2,-36]]);F(g,'#b02418',1);
 L(g,12,-19,22,-25,OL,4);L(g,12,-19,22,-25,'#ffd040',2.4);}
BK.blade=drawBladeBack;
// ---------- Frostmagierin ----------
function drawFrostBack(g){
 L(g,-15,2,-15,-56,OL,4.5);L(g,-15,2,-15,-56,'#8a6030',2.8);
 P(g,[[-13,0],[13,0],[7,-36],[-7,-36]]);F(g,LG(g,-13,0,13,-36,'#4a8ad8','#16327a'),1.6);P(g,[[-13,0],[13,0],[12,-4],[-12,-4]]);F(g,'#e8f4ff',1.1);
 bSeam(g,0,-35,0,-4);for(const s of[-1,1])bSeam(g,s*4,-32,s*8,-5);
 for(const sx of[-1,1]){E(g,sx*8,-32,5,4.5);F(g,'#24509e',1.3);}
 // langes weißes Haar
 P(g,[[-6,-41],[6,-41],[7,-30],[3,-24],[0,-26],[-3,-24],[-7,-30]]);F(g,LG(g,0,-41,0,-24,'#ffffff','#c8d8ec'),1.1);for(const x of[-3,0,3])L(g,x,-40,x*1.3,-27,'rgba(110,140,180,.55)',.8);
 P(g,[[-11,-44],[11,-44],[4,-56],[9,-70],[-3,-58]]);F(g,LG(g,0,-70,0,-44,'#6aa8f0','#16327a'),1.5);P(g,[[-12,-46],[12,-46],[11,-43],[-11,-43]]);F(g,'#e8f4ff',1.1);
 L(g,-8,-30,-14,-22,OL,4.5);L(g,-8,-30,-14,-22,'#24509e',3);
 g.save();g.shadowColor='#9ad8ff';g.shadowBlur=10;P(g,[[-15,-70],[-10,-60],[-15,-52],[-20,-60]]);F(g,LG(g,-20,-70,-10,-52,'#ffffff','#7ad0ff','#2a8ad0'),1.3);g.restore();}
BK.frosthero=drawFrostBack;
// ---------- Giftmischerin ----------
function drawPoisonBack(g){
 P(g,[[-13,0],[13,0],[9,-30],[-9,-30]]);F(g,LG(g,-13,0,13,-30,'#33602a','#12240c'),1.6);
 P(g,[[-13,0],[13,0],[12,-4],[-12,-4]]);F(g,'#6a4a20',1);bSeam(g,0,-29,0,-4);
 // Kräutertasche am Rücken
 P(g,[[-6,-26],[6,-26],[5,-14],[-5,-14]]);F(g,LG(g,-6,0,6,0,'#4a2a12','#7a4a22','#4a2a12'),1.2);L(g,-6,-22,6,-22,'#2a1808',1);
 for(const[x,c]of[[-3,'#8aff40'],[2.5,'#e03a8a']]){L(g,x,-26,x,-30,'#cfe6e0',1.4);}
 L(g,9,-27,16,-34,OL,4.5);L(g,9,-27,16,-34,'#3a6a2a',3);drawFlask(g,18,-40,.6,'#8aff40');
 L(g,-9,-27,-13,-17,OL,4.5);L(g,-9,-27,-13,-17,'#3a6a2a',3);
 P(g,[[-10,-30],[-11,-44],[-4,-54],[4,-54],[11,-44],[10,-30],[0,-27]]);F(g,LG(g,-10,0,10,0,'#1e4416','#4a8a3a','#1e4416'),1.6);
 bSeam(g,0,-53,0,-29);P(g,[[-4,-54],[4,-54],[0,-62]]);F(g,'#2a5a1a',1.3);}
BK.poisonhero=drawPoisonBack;
// ---------- Kobold-Zeppelin (Heckansicht) ----------
function drawZeppBack(g){
 for(const x of[-11,-4,4,11])L(g,x,-30,x*.85,-16,'#2a1a08',1.6);
 P(g,[[-15,-17],[15,-17],[11,-6],[-11,-6]]);F(g,LG(g,0,-17,0,-6,'#7a4a22','#3a2008'),1.6);L(g,-13,-12,13,-12,'#3a2010',1);
 // Pilot von hinten
 E(g,0,-21,5,4.6);F(g,'#6aa83a',1.3);for(const s of[-1,1]){P(g,[[s*4,-22],[s*10,-25],[s*5,-19]]);F(g,'#6aa83a',1);}
 g.beginPath();g.arc(0,-22.5,5.2,Math.PI,0);g.closePath();F(g,'#5a3a1a',1);L(g,-5,-21.5,5,-21.5,'#3a2410',1.4);
 // Ballon von hinten (rund) mit Heckkreuz
 E(g,0,-46,20,15);F(g,LG(g,0,-61,0,-31,'#d0a470','#6a3e1a'),1.8);
 for(const r of[14,7]){E(g,0,-46,r,r*.75);g.strokeStyle='rgba(60,30,10,.5)';g.lineWidth=1.1;g.stroke();}
 P(g,[[-2,-62],[2,-62],[2,-30],[-2,-30]]);F(g,LG(g,0,-62,0,-30,'#a8341e','#5a140a'),1.2);
 P(g,[[-27,-48],[27,-48],[27,-44],[-27,-44]]);F(g,LG(g,-27,0,27,0,'#5a140a','#a8341e','#5a140a'),1.2);
 // Heckpropeller
 E(g,0,-46,3);F(g,'#888',1.1);for(const a of[.4,2.5,4.6]){P(g,[[0,-46],[Math.cos(a)*11,-46+Math.sin(a)*8],[Math.cos(a+.45)*10,-46+Math.sin(a+.45)*7.5]]);F(g,'rgba(200,200,210,.75)',1);}
 L(g,0,-6,0,-3,'#3a2a14',1);E(g,0,-1,4.2);F(g,LG(g,0,-5,0,3,'#5a5a64','#141418'),1.2);}
BK.zepp=drawZeppBack;
// ---------- Skelett (Rücken) ----------
function skelBackBody(g,cloth){
 P(g,[[-7,-26],[7,-26],[9,-6],[5,-8],[3,-4],[0,-7],[-3,-4],[-6,-8],[-9,-6]]);F(g,cloth,1.3);
 L(g,-3,0,-3,-10,OL,3.5);L(g,-3,0,-3,-10,'#d8cfb0',2);L(g,3,0,3,-10,OL,3.5);L(g,3,0,3,-10,'#d8cfb0',2);
 E(g,0,-11,4.5,2.2);F(g,'#d8cfb0',1.2);
 // Rücken: Schulterblätter, Wirbelsäule, Rippen von hinten
 E(g,0,-18,6.2,6);F(g,'#d8cfb0',1.4);for(const s of[-1,1]){E(g,s*3.4,-21,2.6,2.2);F(g,'#ece2c6',1);}
 L(g,0,-11,0,-25,OL,3);L(g,0,-11,0,-25,'#f0e6ca',1.6);for(let y=-23;y<-11;y+=2.4)L(g,-1.6,y,1.6,y,'#3a3020',.8);}
function skullBack(g,cap1,cap2){
 E(g,0,-29,6.2,6);F(g,'#e4dabe',1.4);L(g,-2,-26,1,-31,'rgba(60,50,30,.6)',.8);
 g.beginPath();g.arc(0,-30,6.8,Math.PI,0);g.closePath();F(g,LG(g,0,-37,0,-30,cap1,cap2),1.3);}
function drawSkelBack(g){
 L(g,10,-12,17,-33,OL,4.2);L(g,10,-12,17,-33,'#8f857a',2.4);
 skelBackBody(g,'#24182c');
 L(g,6,-22,10,-14,'#d8cfb0',2.2);L(g,7.5,-13.5,12.5,-10.5,'#5a3a20',2.6);
 // Schild von innen (Holz + Riemen)
 E(g,-10,-15,6.4,7.8);F(g,LG(g,-16,-15,-4,-15,'#5a3416','#2a160a'),1.4);for(const x of[-13,-10,-7])L(g,x,-22,x,-8,'rgba(20,10,0,.5)',.8);
 L(g,-14,-17,-6,-13,'#7a5a3a',2);E(g,-10,-15,6.4,7.8);g.strokeStyle='#7a7a80';g.lineWidth=1.3;g.stroke();
 skullBack(g,'#7a7a84','#3a3a42');}
BK.skel=drawSkelBack;
function drawSkelArchBack(g){
 g.save();g.translate(14,-4);drawElfBow(g);g.restore();
 skelBackBody(g,'#2c2018');L(g,5,-21,12,-16,'#d8cfb0',2.2);
 g.save();g.translate(0,-17);g.rotate(.4);P(g,[[-2.6,-10],[2.6,-10],[2.6,8],[-2.6,8]]);F(g,'#5a3a1c',1.2);for(const x of[-1.2,1.2])L(g,x,-10,x,-15,'#e8e0c8',1.2);g.restore();
 skullBack(g,'#5a2a3a','#2a1018');}
BK.skelarch=drawSkelArchBack;
// ---------- Riesenskelett mit Bombe ----------
function drawGiantBack(g){
 g.save();g.scale(1.55,1.55);
 L(g,10,-12,17,-33,OL,4.2);L(g,10,-12,17,-33,'#8f857a',2.4);
 skelBackBody(g,'#24182c');L(g,6,-22,10,-14,'#d8cfb0',2.2);L(g,-6,-22,-10,-14,'#d8cfb0',2.2);
 skullBack(g,'#7a7a84','#3a3a42');g.restore();
 for(const s of[-1,1]){P(g,[[s*6,-55],[s*15,-64],[s*13,-56],[s*9,-51]]);F(g,LG(g,0,-64,0,-51,'#f0e6c8','#8a7a5a'),1.3);}
 // Bombe auf dem Rücken (gespiegelt zur Frontansicht), Gurt über die Schulter
 E(g,-13,-58,11);F(g,LG(g,-20,-70,-6,-46,'#5a5a66','#141418'),1.8);g.fillStyle='#8a1a10';g.fillRect(-24,-60,22,4);g.strokeStyle=OL;g.lineWidth=1;g.strokeRect(-24,-60,22,4);
 E(g,-17,-62,3,2);F(g,'rgba(255,255,255,.2)',0);
 L(g,6,-60,-20,-40,OL,4.2);L(g,6,-60,-20,-40,'#5a3a1a',2.6);
 L(g,-16,-69,-20,-76,'#c8a060',1.6);g.save();g.shadowColor='#ffb020';g.shadowBlur=8;E(g,-20,-77,2.4);F(g,'#ffd060',0);g.restore();}
BK.giant=drawGiantBack;
// ---------- Schamane ----------
function drawShamanBack(g){
 L(g,12,0,14,-40,OL,4);L(g,12,0,14,-40,'#6a4a2a',2.2);for(const a of[0,2.1,4.2]){L(g,14,-40,14+Math.cos(a)*5,-40+Math.sin(a)*5-3,'#d8cfb0',1.6);}
 g.save();g.shadowColor='#5aff7a';g.shadowBlur=10;E(g,14,-43,3.6);F(g,'#9aff9a',1);g.restore();
 for(const s of[-1,1]){P(g,[[s*6,0],[s*5,-6],[s*1.5,-6],[s*1.5,0]]);F(g,'#2a1a10',1.2);}
 P(g,[[-12,-1],[-8,-26],[8,-26],[12,-1]]);F(g,LG(g,-12,-26,12,0,'#33503a','#12241a'),1.5);
 // Fellumhang
 P(g,[[-9,-26],[9,-26],[10,-8],[6,-10],[3,-6],[0,-9],[-3,-6],[-6,-10],[-10,-8]]);F(g,LG(g,0,-26,0,-6,'#8a6a44','#4a3420'),1.3);
 for(const x of[-6,-2,2,6])L(g,x,-22,x*1.1,-11,'rgba(40,25,10,.45)',.9);
 E(g,9,-18,3.4);F(g,'#33503a',1.2);E(g,-9,-18,3.4);F(g,'#33503a',1.2);
 P(g,[[-9,-24],[-7,-38],[0,-42],[7,-38],[9,-24],[0,-22]]);F(g,LG(g,-9,0,9,0,'#1a2a14','#4a6a3a','#1a2a14'),1.4);bSeam(g,0,-41,0,-23);
 for(const s of[-1,1]){P(g,[[s*7,-37],[s*13,-46],[s*9,-34]]);F(g,'#e8e0c8',1);}
 for(let i=0;i<3;i++){E(g,-3+i*3,-24.5,1.2,1.5);F(g,'#e8e0c8',.6);}}
BK.shaman=drawShamanBack;
// ---------- Fledermäuse ----------
function drawBatBack(g){
 for(const s of[-1,1]){g.beginPath();g.moveTo(s*4,-14);g.quadraticCurveTo(s*14,-26,s*24,-22);g.lineTo(s*21,-16);g.quadraticCurveTo(s*18,-18,s*16,-13);g.quadraticCurveTo(s*12,-15,s*9,-10);g.closePath();F(g,LG(g,0,-26,0,-10,'#4a2a4a','#1a0e1e'),1.4);
  L(g,s*4,-14,s*24,-22,'rgba(0,0,0,.5)',1.2);L(g,s*12,-19,s*16,-13,'rgba(0,0,0,.4)',.9);L(g,s*18,-21,s*21,-16,'rgba(0,0,0,.4)',.9);}
 E(g,0,-14,5.5,7);F(g,LG(g,0,-21,0,-7,'#4a3442','#1e121e'),1.4);L(g,0,-19,0,-9,'rgba(0,0,0,.35)',1);
 for(const s of[-1,1]){P(g,[[s*1.5,-19],[s*4.5,-25],[s*4.5,-18]]);F(g,'#3a2030',1);}}
BK.bat=drawBatBack;
// ---------- Schattenritter ----------
function drawKnightBack(g){
 g.save();g.shadowColor='#a060ff';g.shadowBlur=4;L(g,10,-6,19,-40,OL,5);L(g,10,-6,19,-40,'#33303e',3);g.restore();
 for(const s of[-1,1]){P(g,[[s*7.5,0],[s*7,-10],[s*1.5,-10],[s*2,0]]);F(g,LG(g,0,-10,0,0,'#4e545e','#1e2128'),1.3);}
 P(g,[[-9,-8],[-12.5,-25],[12.5,-25],[9,-8]]);F(g,LG(g,-12,-20,12,-12,'#5e6472','#1e2128'),1.6);
 L(g,6.5,-10,14,-7,'#6a5a7a',3);
 // Umhang
 P(g,[[-9,-27],[9,-27],[12,-3],[6,-6],[0,-2],[-6,-6],[-12,-3]]);F(g,LG(g,0,-27,0,-2,'#5a1a70','#24082e'),1.4);
 for(const x of[-5,0,5])bSeam(g,x*.7,-25,x*1.2,-5);
 for(const s of[-1,1]){P(g,[[s*9,-28],[s*12,-38],[s*15,-28]]);F(g,'#9a9eaa',1.1);E(g,s*12.5,-24.5,8.4,6.2);F(g,LG(g,0,-31,0,-18,'#70768a','#20242c'),1.5);}
 P(g,[[-6,-25],[-7,-34],[-3,-39.5],[3,-39.5],[7,-34],[6,-25]]);F(g,LG(g,-7,0,7,0,'#22262e','#6a7080','#22262e'),1.5);
 L(g,0,-39,0,-26,'#9a9eaa',1.6);for(const s of[-1,1]){P(g,[[s*6,-34],[s*13,-42],[s*11,-45],[s*7,-37]]);F(g,'#d8ceb0',1.1);}}
BK.knight=drawKnightBack;
// ---------- Wolf: echte Front- und Rückansicht ----------
function drawWolfFront(g){
 for(const s of[-1,1]){L(g,s*7,-9,s*8,0,'#15161f',3.4);L(g,s*3,-8,s*3.4,0,'#15161f',3);}
 E(g,0,-11,9.5,7);F(g,LG(g,0,-18,0,-4,'#55597a','#1e2032'),1.5);
 P(g,[[-6,-12],[-3,-6],[0,-9],[3,-6],[6,-12]]);F(g,'#8a8ea8',1);
 E(g,0,-19,7.5,6.5);F(g,LG(g,0,-26,0,-13,'#5a5e80','#2a2c42'),1.4);
 for(const s of[-1,1]){P(g,[[s*3,-24],[s*7,-31],[s*7.5,-21]]);F(g,'#2a2c40',1.2);P(g,[[s*4.2,-24],[s*6.6,-28.5],[s*6.8,-23]]);F(g,'#6a4a5a',0);}
 E(g,0,-15,4,3.4);F(g,'#3a3c54',1.2);E(g,0,-16.8,1.6,1.1);F(g,'#0a0a10',0);
 g.shadowColor='#ff2a10';g.shadowBlur=4;for(const s of[-1,1]){E(g,s*3.2,-20.5,1.5,1);F(g,'#ff5030',0);}g.shadowBlur=0;
 for(const s of[-1,1]){P(g,[[s*2.2,-13],[s*1.6,-10.6],[s*1,-13]]);F(g,'#f0e8d0',.6);}}
function drawWolfBack(g){
 for(const s of[-1,1]){L(g,s*6,-8,s*7,0,'#15161f',3.6);}
 E(g,0,-19,7,5.5);F(g,LG(g,0,-25,0,-14,'#4a4e6a','#23253a'),1.4);
 for(const s of[-1,1]){P(g,[[s*3,-22],[s*7,-29],[s*7.5,-19]]);F(g,'#2a2c40',1.2);}
 E(g,0,-12,9,7.5);F(g,LG(g,0,-19,0,-4,'#55597a','#1e2032'),1.5);
 P(g,[[-5,-17],[-3,-21],[-1,-17],[1,-21],[3,-17],[5,-20],[6,-15],[-6,-15]]);F(g,'#14151f',1);
 for(const s of[-1,1]){E(g,s*5,-7,4,4.5);F(g,'#3a3c56',1.2);}
 g.beginPath();g.moveTo(-1.5,-9);g.quadraticCurveTo(-6,-2,2,2);g.quadraticCurveTo(4,-3,1.5,-9);g.closePath();F(g,LG(g,0,-9,0,2,'#4a4e6a','#14151f'),1.2);}
BK.wolf=drawWolfBack;
// ---------- Oger ----------
function drawOgreBack(g){
 P(g,[[14,-12],[21,-44],[29,-42],[19,-10]]);F(g,LG(g,14,0,29,0,'#3a2410','#7a5028'),1.5);
 for(const[x,y]of[[21,-36],[26,-34],[23,-27]]){P(g,[[x-1.5,y],[x,y-3.5],[x+1.5,y]]);F(g,'#bab4a6',.6);}
 for(const s of[-1,1]){E(g,s*7.5,-6,5.5,7.5);F(g,'#7a5e3a');E(g,s*8.5,0,6.5,3);F(g,'#3a2414',1.3);}
 P(g,[[-12,-10],[12,-10],[10,-1],[0,-3],[-10,-1]]);F(g,'#5a3418',1.4);
 E(g,0,-21,15.5,13.5);F(g,LG(g,-15,-30,10,-10,'#b08c5a','#6a4a2a'),1.8);
 L(g,0,-32,0,-11,'rgba(40,20,5,.45)',1.6);for(const s of[-1,1]){g.beginPath();g.arc(s*6,-24,6,0,7);g.strokeStyle='rgba(40,20,5,.2)';g.lineWidth=1.2;g.stroke();}
 L(g,-12,-30,12,-12,'#4a2a12',3);E(g,7,-15,1.6);F(g,'#ccc',.6);
 for(const s of[-1,1]){E(g,s*16.5,-21,5.8,10.5);F(g,LG(g,0,-30,0,-10,'#b08c5a','#6a4a2a'),1.6);E(g,s*17,-11,4.6);F(g,'#98764a',1.4);}
 P(g,[[-13,-30],[-8,-36],[8,-36],[13,-30],[0,-28]]);F(g,'#4a3a2a',1.3);
 E(g,0,-38,7.8,6.6);F(g,LG(g,0,-45,0,-32,'#b8945e','#7a5a32'),1.6);
 for(const s of[-1,1]){P(g,[[s*7,-39],[s*11,-41],[s*7.4,-36]]);F(g,'#b8945e',1);}
 for(const x of[-3,0,3])L(g,x,-44,x*.8,-41,'#3a2414',1.2);P(g,[[-4,-43],[-2,-51],[1,-43.5]]);F(g,'#e8dcc0',1);}
BK.ogre=drawOgreBack;
// ---------- Lich ----------
function drawLichBack(g){
 L(g,-24,4,-26,-66,OL,4.5);L(g,-24,4,-26,-66,'#4a3a2a',2.6);
 g.save();g.shadowColor='#b060ff';g.shadowBlur=14;
 P(g,[[-20,0],[-15,-4],[-10,1],[-5,-3],[0,2],[5,-3],[10,1],[15,-4],[20,0],[14,-44],[-14,-44]]);F(g,LG(g,-20,-44,20,0,'#3e2258','#10081a'),1.8);g.restore();
 for(const x of[-8,0,8])bSeam(g,x*.6,-42,x,-3);
 for(const s of[-1,1]){P(g,[[s*11,-44],[s*24,-36],[s*19,-28],[s*12,-34]]);F(g,'#321c48',1.4);E(g,s*22,-29,3.6);F(g,'#e6dcc0',1.1);}
 for(const s of[-1,1]){P(g,[[s*10,-46],[s*22,-50],[s*16,-40]]);F(g,LG(g,0,-50,0,-40,'#8a7a9a','#3a2a4a'),1.3);}
 P(g,[[-10,-46],[-9,-62],[0,-68],[9,-62],[10,-46],[0,-43]]);F(g,LG(g,-10,0,10,0,'#1e1030','#4e3070','#1e1030'),1.5);bSeam(g,0,-66,0,-45);
 P(g,[[-7,-61],[-8,-70],[-4,-66],[0,-73],[4,-66],[8,-70],[7,-61]]);F(g,LG(g,0,-73,0,-61,'#e8c860','#8a6010'),1.2);
 g.save();g.shadowColor='#7aff9a';g.shadowBlur=12;E(g,-26,-70,5.4);F(g,'#5aff8a',1.3);E(g,-27.5,-71.5,2);F(g,'#e8fff0',0);g.restore();
 for(const a of[-.6,.6])L(g,-26,-66,-26+Math.sin(a)*8,-72-Math.cos(a)*4,'#d8cfb0',1.8);}
BK.lich=drawLichBack;
// ---------- Gebäude-Figuren: Rückansicht durch Tausch der Figur ----------
function withBackFigures(fn){const e=drawElf,b=drawElfBow,o=drawOrc;drawElf=g=>drawElfBack(g);drawElfBow=()=>{};drawOrc=g=>drawOrcBack(g,0);try{fn();}finally{drawElf=e;drawElfBow=b;drawOrc=o;}}
// Registrierung: "<key>_b" = Rückansicht; wolf bekommt zusätzlich die echte Frontansicht
Object.assign(DART,{
 grunt_b:{fn:BK.grunt,m:.7},elf_b:{fn:BK.elf,m:.92},mage_b:{fn:BK.mage,m:.86},goblin_b:{fn:BK.goblin,m:.92},
 blade_b:{fn:BK.blade,m:.82},frosthero_b:{fn:BK.frosthero,m:.8},poisonhero_b:{fn:BK.poisonhero,m:.82},
 zepp_b:{fn:BK.zepp,m:.72},giant_b:{fn:BK.giant,m:.92},shaman_b:{fn:BK.shaman,m:.8},bat_b:{fn:BK.bat,m:.78},
 skel_b:{fn:BK.skel,m:.88},skelarch_b:{fn:BK.skelarch,m:.88},knight_b:{fn:BK.knight,m:.86},wolf_b:{fn:BK.wolf,m:.82},ogre_b:{fn:BK.ogre,m:.82},lich_b:{fn:BK.lich,m:.62},
 sling_b:{fn:g=>withBackFigures(()=>drawSling(g)),m:.95,bld:1},sling2_b:{fn:g=>withBackFigures(()=>drawSling(g,.12)),m:.95,bld:1},
 ranger_b:{fn:g=>withBackFigures(()=>drawGuardTower(g)),m:.6,bld:1}});
DART.wolf.fn=drawWolfFront;
// Figuren-Sicht wählen: eigene Seite (0) = Rücken
function viewKey(key,side){return side===0&&DART[key+'_b']?key+'_b':key;}
