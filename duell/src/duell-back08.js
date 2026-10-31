// ===== Turmwacht Duell 0.8 – Rückansichten der neuen Kreaturen (eigene Truppen laufen vom Spieler weg) =====
function drawWargBack(g,c){
 for(const s of[-1,1]){L(g,s*7,-12,s*8,0,OL,5.4);L(g,s*7,-12,s*8,0,c[1],3.8);E(g,s*8,0,3,1.4);F(g,c[2],.8);}
 E(g,0,-26,10,8);F(g,LG(g,0,-34,0,-18,c[0],c[1]),1.4);// Nacken/Kopf vorn (verdeckt)
 for(const s of[-1,1]){P(g,[[s*4,-31],[s*8,-39],[s*9,-29]]);F(g,c[1],1.1);}
 E(g,0,-16,12,10);F(g,LG(g,0,-26,0,-6,c[0],c[1]),1.6);
 for(let i=0;i<5;i++){const x=-6+i*3;P(g,[[x-1.5,-24],[x,-29-(i%2)*2],[x+1.5,-24]]);F(g,c[2],.7);}
 g.beginPath();g.moveTo(-2,-10);g.quadraticCurveTo(-8,-2,0,4);g.quadraticCurveTo(5,-2,2,-10);g.closePath();F(g,LG(g,0,-10,0,4,c[0],c[2]),1.2);}
function drawWolfriderBack(g,hero){const s=hero?1.12:1;g.save();g.scale(s,s);
 drawWargBack(g,hero?['#e8eef4','#9aa8b8','#5a6676']:['#7a7068','#4a4038','#2a221c']);
 for(const k of[-1,1]){L(g,k*6,-24,k*10,-14,OL,4.4);L(g,k*6,-24,k*10,-14,'#4a7a32',3);}// Beine seitlich
 if(hero){P(g,[[-9,-44],[9,-44],[12,-20],[-12,-20]]);F(g,LG(g,0,-44,0,-20,'#c84a2a','#6a1a10'),1.4);for(const x of[-6,0,6])L(g,x,-40,x*1.3,-22,'rgba(40,10,5,.45)',1);}
 else{P(g,[[-8,-44],[8,-44],[9,-24],[-9,-24]]);F(g,LG(g,0,-44,0,-24,'#7a5a36','#4a3018'),1.5);L(g,-8,-34,8,-34,'#3a2414',1.6);}
 for(const k of[-1,1]){E(g,k*8,-43,4.4,3.2);F(g,hero?'#e8e0d0':'#5a5a62',1.1);}
 E(g,0,-50,6.4,6);F(g,LG(g,0,-56,0,-44,'#6a9a3a','#3a6a22'),1.5);
 if(hero){P(g,[[-7,-52],[-5,-61],[5,-61],[7,-52]]);F(g,LG(g,0,-61,0,-52,'#f4f0e4','#b8b0a0'),1.3);for(const k of[-1,1]){P(g,[[k*3,-60],[k*5,-67],[k*6,-59]]);F(g,'#e8e0d0',1);}}
 else{P(g,[[-6,-52],[-4,-58],[4,-58],[6,-52]]);F(g,'#5a5a62',1.2);}
 // Axt über der Schulter
 L(g,6,-40,14,-62,'#4a2e16',2.6);P(g,[[12,-62],[20,-66],[22,-58],[15,-55]]);F(g,LG(g,12,-66,22,-55,'#e0e4ea','#7a828c'),1.3);
 if(hero){L(g,-6,-40,-14,-62,'#4a2e16',2.6);P(g,[[-12,-62],[-20,-66],[-22,-58],[-15,-55]]);F(g,LG(g,-22,-66,-12,-55,'#e0e4ea','#7a828c'),1.3);}
 g.restore();}
function drawBearBack(g){
 for(const s of[-1,1]){P(g,[[s*5,-16],[s*17,-16],[s*17,0],[s*4,0]]);F(g,LG(g,0,-16,0,0,'#6a4224','#3a2414'),1.5);for(let i=0;i<3;i++){P(g,[[s*(7+i*3),0],[s*(8+i*3),3],[s*(9+i*3),0]]);F(g,'#e8e0d0',.5);}}
 E(g,0,-30,19,15);F(g,LG(g,0,-46,0,-14,'#8a5a32','#4a2c14'),1.8);// Hinterteil/Rücken
 for(const s of[-1,1]){E(g,s*12,-48,5,5);F(g,'#5a3418',1.3);E(g,s*12,-48,2.6);F(g,'#2a1408',0);}// Ohren
 E(g,0,-42,14,9);F(g,LG(g,0,-52,0,-34,'#9a6a3a','#5a3418'),1.6);// Nacken-Buckel
 P(g,[[-13,-40],[13,-40],[15,-26],[-15,-26]]);F(g,LG(g,0,-40,0,-26,'#8a2a1a','#5a1a10'),1.3);for(const x of[-8,0,8])L(g,x,-38,x,-28,'#d8b060',1.2);
 L(g,-17,-24,17,-24,'#3a2414',2.4);E(g,0,-14,4,3);F(g,'#5a3418',1);
 for(const[a,b]of[[-6,-46],[0,-47],[6,-46]])L(g,a,b,a,b+4,'#3a7ad0',1.6);}
function drawDrillBack(g){
 for(const s of[-1,1]){P(g,[[s*8,-4],[s*18,-4],[s*18,-14],[s*8,-14]]);F(g,'#2a2a2e',1.4);for(let i=0;i<3;i++)L(g,s*9,-6-i*3.4,s*17,-6-i*3.4,'#6a6a72',1);}
 P(g,[[-14,-8],[-13,-24],[13,-24],[14,-8]]);F(g,LG(g,0,-24,0,-8,'#9a6a3a','#5a3418'),1.6);for(const x of[-7,0,7])L(g,x,-23,x,-9,'rgba(40,20,5,.5)',1);
 E(g,0,-26,9,3);F(g,'#7a828c',1.2);P(g,[[-3,-28],[0,-36],[3,-28]]);F(g,'#c8ccd0',1);// Bohrspitze ragt vorn hervor
 for(const s of[-1,1]){L(g,s*10,-22,s*12,-36,'#3a3a40',3.2);E(g,s*12,-38,2.6,1.8);F(g,'#5a5a5a',1);E(g,s*13,-43,2.6);F(g,'rgba(120,110,100,.5)',0);}
 for(const[x,y,sc]of[[-5,-30,.85],[5,-33,.95]]){g.save();g.translate(x,y);g.scale(sc,sc);for(const k of[-1,1]){P(g,[[k*6,-1],[k*15,-6],[k*7,3]]);F(g,'#6aa83a',1.1);}E(g,0,0,7,6.2);F(g,LG(g,0,-6,0,6,'#7ab83a','#4a8a22'),1.3);L(g,-7,-2,7,-2,'#3a2414',1.8);P(g,[[-6,-4],[-4,-8],[5,-8],[7,-4]]);F(g,'#7a4a22',1);g.restore();}}
function drawWarlockBack(g,hero){const s=hero?1.16:1,fel='#7aff50';g.save();g.scale(s,s);
 P(g,[[-11,0],[-9,-44],[9,-44],[11,0]]);F(g,LG(g,-11,0,11,0,hero?'#2a1236':'#1e2a12',hero?'#4a2a5a':'#3a4a22',hero?'#2a1236':'#1e2a12'),1.6);
 L(g,-10,-3,10,-3,hero?fel:'#a8c860',1.8);L(g,0,-40,0,-4,'rgba(0,0,0,.3)',1.2);
 if(hero){g.save();g.shadowColor=fel;g.shadowBlur=6;P(g,[[-4,-30],[0,-36],[4,-30],[0,-24]]);F(g,fel,.6);g.restore();for(const k of[-1,1]){P(g,[[k*7,-44],[k*14,-46],[k*11,-40]]);F(g,'#5a5a62',1.2);}}
 P(g,[[-8,-43],[-8,-56],[0,-61],[8,-56],[8,-43]]);F(g,LG(g,0,-61,0,-43,hero?'#4a2a5a':'#3a4a22','#140a1a'),1.5);
 for(const k of[-1,1]){g.beginPath();g.moveTo(k*3,-58);g.quadraticCurveTo(k*10,-66,k*(hero?11:7),-72);g.quadraticCurveTo(k*7,-63,k*5,-56);g.closePath();F(g,'#d8ccb0',1);}
 L(g,12,-60,11,0,'#3a2414',2.6);E(g,12,-62,4,3.6);F(g,'#ece4cc',1.1);g.save();g.shadowColor=fel;g.shadowBlur=10;P(g,[[9,-64],[12,-76],[15,-64]]);F(g,'rgba(140,255,90,.85)',0);g.restore();
 L(g,7,-40,12,-38,OL,4);L(g,7,-40,12,-38,hero?'#4a2a5a':'#3a4a22',2.6);
 g.restore();}
function drawImpBack(g){
 for(const s of[-1,1])L(g,s*3,-8,s*4,0,'#6a1a10',2.6);
 g.beginPath();g.moveTo(0,-8);g.quadraticCurveTo(-6,0,-3,6);g.strokeStyle='#8a2a18';g.lineWidth=1.8;g.stroke();
 for(const s of[-1,1]){P(g,[[s*2,-16],[s*12,-25],[s*8,-14]]);F(g,'#c84a2a',1);}
 E(g,0,-12,6,6);F(g,LG(g,0,-18,0,-6,'#c84a2a','#7a2010'),1.3);E(g,0,-21,5.2,4.8);F(g,LG(g,0,-26,0,-16,'#e05a30','#8a2a18'),1.3);
 for(const k of[-1,1]){P(g,[[k*2.5,-24],[k*5,-30],[k*4.5,-22]]);F(g,'#2a1a10',.8);}
 g.save();g.shadowColor='#ffa020';g.shadowBlur=8;E(g,8,-15,2.4,2.8);F(g,'#ffc040',0);g.restore();}
function drawInfernalBack(g){const fel='#7aff50';
 for(const s of[-1,1]){P(g,[[s*3,-22],[s*14,-22],[s*15,0],[s*3,0]]);F(g,LG(g,0,-22,0,0,'#4a4a44','#2a2a26'),1.6);}
 P(g,[[-22,-24],[-24,-52],[-12,-64],[12,-64],[24,-52],[22,-24]]);F(g,LG(g,0,-64,0,-24,'#5a5a52','#2a2a24'),2);
 g.save();g.shadowColor=fel;g.shadowBlur=8;for(const[a,b,c,d]of[[-12,-56,0,-44],[0,-44,12,-54],[0,-44,-2,-30],[-2,-30,10,-26]])L(g,a,b,c,d,'#a8ff70',2);g.restore();
 for(const s of[-1,1]){P(g,[[s*20,-58],[s*32,-46],[s*30,-22],[s*22,-26],[s*22,-42]]);F(g,'#4a4a44',1.5);E(g,s*29,-20,6,5);F(g,'#3a3a34',1.5);}
 E(g,0,-68,10,8);F(g,LG(g,0,-76,0,-60,'#5a5a52','#2a2a24'),1.6);
 g.save();g.shadowColor=fel;g.shadowBlur=8;for(const[x,h]of[[-8,15],[-2,22],[4,20],[9,14]]){P(g,[[x-4,-72],[x,-72-h],[x+4,-72]]);F(g,'rgba(120,255,80,.75)',0);}g.restore();}
function drawNecroBack(g){const c='#c080ff';
 P(g,[[-11,0],[-9,-44],[9,-44],[11,0]]);F(g,LG(g,-11,0,11,0,'#14141e','#3a3a4a','#14141e'),1.6);
 for(let i=0;i<5;i++)P(g,[[-10+i*4.2,0],[-8+i*4.2,4],[-6+i*4.2,0]]),F(g,'#0e0e16',.6);
 L(g,-8,-42,8,-30,'#d8d0c0',1.4);
 P(g,[[-8,-43],[-7,-58],[0,-61],[7,-58],[8,-43]]);F(g,LG(g,0,-61,0,-43,'#3a3a4a','#0e0e16'),1.5);
 L(g,12,-62,11,0,'#d8d0c0',2.4);E(g,12,-64,3.6,3.2);F(g,'#ece4cc',1);g.save();g.shadowColor=c;g.shadowBlur=10;E(g,12,-70,3,3);F(g,'rgba(200,140,255,.85)',0);g.restore();
 L(g,7,-40,12,-38,OL,4);L(g,7,-40,12,-38,'#3a3a4a',2.6);}
function drawAldricBack(g){const ice='#9fe8ff';
 for(const s of[-1,1]){P(g,[[s*3,-24],[s*11,-24],[s*12,0],[s*2,0]]);F(g,LG(g,0,-24,0,0,'#8a96a4','#3a4450'),1.5);}
 P(g,[[-15,-52],[15,-52],[19,-4],[0,0],[-19,-4]]);F(g,LG(g,0,-52,0,0,'#3a5a7a','#1a2a3a'),1.6);for(const x of[-9,0,9])L(g,x,-48,x*1.4,-6,'rgba(0,0,0,.3)',1.2);
 g.save();g.shadowColor=ice;g.shadowBlur=6;L(g,-6,-34,6,-34,'#7ac8f0',1.4);L(g,0,-40,0,-28,'#7ac8f0',1.4);g.restore();
 for(const s of[-1,1]){E(g,s*13,-50,6,4.4);F(g,LG(g,0,-55,0,-46,'#c8d0d8','#5a6470'),1.4);P(g,[[s*11,-53],[s*17,-60],[s*16,-51]]);F(g,'#d8e0e8',.9);}
 P(g,[[-8,-52],[-8,-64],[0,-69],[8,-64],[8,-52]]);F(g,LG(g,0,-69,0,-52,'#b8c4d0','#4a5462'),1.6);
 P(g,[[-7,-66],[-6,-74],[-3,-68],[0,-77],[3,-68],[6,-74],[7,-66]]);F(g,LG(g,0,-77,0,-66,'#e8f4ff','#7aa8c8'),1.2);
 g.save();g.translate(13,-44);g.rotate(.35);P(g,[[-2,0],[2,0],[2.6,-30],[0,-36],[-2.6,-30]]);F(g,LG(g,-3,0,3,0,'#9fc8e8','#e8f8ff','#7aa8c8'),1.3);P(g,[[-6,0],[6,0],[5,2.4],[-5,2.4]]);F(g,'#4a5462',1);g.restore();}
Object.assign(DART,{
 wolfrider_b:{fn:g=>drawWolfriderBack(g,0),m:.9},wolfking_b:{fn:g=>drawWolfriderBack(g,1),m:.88},bear_b:{fn:drawBearBack,m:1},
 drill_b:{fn:drawDrillBack,m:1},warlock_b:{fn:g=>drawWarlockBack(g,0),m:.9},zarvok_b:{fn:g=>drawWarlockBack(g,1),m:.88},
 imp_b:{fn:drawImpBack,m:.85},infernal_b:{fn:drawInfernalBack,m:.8},necro_b:{fn:drawNecroBack,m:.9},aldric_b:{fn:drawAldricBack,m:.86}});
