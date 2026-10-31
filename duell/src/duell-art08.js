// ===== Turmwacht Duell 0.8 – neue Kreaturen & Zauber (eigene Vektorgrafik) =====
// Alle Figuren schauen nach rechts (+x), Ursprung = Fußpunkt.
// ---- Warg (Reittier) ----
function drawWarg(g,o){const c=o.c;
 for(const[x,d]of[[-13,1],[11,1]]){L(g,x+2,-16,x+4,0,c[2],4.2);}// hintere Beine (dunkler)
 g.beginPath();g.moveTo(-17,-22);g.quadraticCurveTo(-30,-30,-34,-22);g.quadraticCurveTo(-28,-24,-18,-16);g.closePath();F(g,c[1],1.3);// Schweif
 E(g,-1,-20,19,9.5);F(g,LG(g,0,-30,0,-10,c[0],c[1]),1.6);
 E(g,-2,-15,13,4);F(g,'rgba(255,255,255,.12)',0);
 for(const[x]of[[-15],[9]]){L(g,x,-16,x-1,0,OL,5);L(g,x,-16,x-1,0,c[1],3.4);E(g,x-.5,0,3,1.4);F(g,c[2],.8);}
 P(g,[[10,-25],[18,-34],[27,-35],[36,-29],[37,-24],[29,-21],[18,-15]]);F(g,LG(g,10,-35,36,-18,c[0],c[1]),1.5);// Kopf
 P(g,[[18,-33],[20,-41],[24,-34]]);F(g,c[1],1.2);P(g,[[19.5,-34],[20.6,-38.5],[22.6,-34.5]]);F(g,'#6a4a4a',0);
 P(g,[[29,-22],[37,-24],[36,-21],[30,-19]]);F(g,'#2a1a1a',1);for(const x of[31,33.5])P(g,[[x,-22],[x+.8,-19.6],[x+1.6,-22]]),F(g,'#f4ecd2',.5);
 E(g,36.5,-27.5,1.3,1);F(g,'#0a0a0a',0);
 g.save();g.shadowColor='#ff4020';g.shadowBlur=4;E(g,27,-30,1.6,1.1);F(g,o.eye||'#ffb030',0);g.restore();
 for(let i=0;i<6;i++){const x=-14+i*5;P(g,[[x,-28],[x+2,-33-(i%2)*2],[x+4,-28]]);F(g,c[2],.8);}}// Mähne
// ---- Wolfsreiter (Ork auf Warg) / Kargash (Held auf Schneewarg) ----
function drawWolfrider(g,hero){const s=hero?1.12:1;g.save();g.scale(s,s);
 drawWarg(g,hero?{c:['#e8eef4','#9aa8b8','#5a6676'],eye:'#7ae0ff'}:{c:['#7a7068','#4a4038','#2a221c']});
 if(hero){P(g,[[-14,-30],[-24,-24],[-20,-14],[-6,-20]]);F(g,LG(g,-24,0,-6,0,'#8a2a1a','#c84a2a'),1.3);}// Umhang
 P(g,[[-6,-27],[6,-27],[8,-21],[-4,-19]]);F(g,hero?'#6a2a1a':'#5a3a22',1.2);// Sattel
 L(g,0,-26,6,-16,OL,4.4);L(g,0,-26,6,-16,'#4a7a32',3);E(g,6,-15,2.4,1.6);F(g,'#3a2414',1);// Bein
 P(g,[[-6,-27],[-7,-44],[6,-46],[8,-28]]);F(g,LG(g,-7,-46,8,-27,hero?'#8a8a96':'#7a5a36',hero?'#4a4a56':'#4a3018'),1.5);// Rumpf
 L(g,-6,-36,7,-38,hero?'#c8a040':'#3a2414',1.6);
 if(hero){for(const x of[-6,6]){E(g,x,-45,5,3.2);F(g,'#e8e0d0',1.1);}}
 E(g,1,-52,6.5,6);F(g,LG(g,-5,-58,7,-46,'#7aac4a','#3a6a22'),1.5);// Kopf
 P(g,[[5,-49],[6,-45],[7.5,-49]]);F(g,'#f4ecd2',.6);E(g,4,-54,1.3,1);F(g,'#ffd030',0);
 if(hero){// Wolfsschädel-Helm
  P(g,[[-7,-55],[-4,-62],[6,-63],[13,-58],[10,-55]]);F(g,LG(g,0,-63,0,-55,'#f4f0e4','#b8b0a0'),1.3);
  P(g,[[-2,-61],[-1,-67],[2,-61]]);F(g,'#e8e0d0',1);P(g,[[3,-62],[5,-67],[6,-62]]);F(g,'#e8e0d0',1);E(g,9,-58,1.2);F(g,'#7ae0ff',0);}
 else{P(g,[[-6,-55],[-3,-60],[5,-60],[8,-55]]);F(g,'#5a5a62',1.2);L(g,-4,-58,6,-58,'#8a8a92',1);}
 // Arm + Axt
 L(g,3,-41,12,-36,OL,4.4);L(g,3,-41,12,-36,'#5a8a3a',3);
 L(g,12,-52,13,-22,'#4a2e16',2.6);
 P(g,[[13,-51],[22,-56],[24,-47],[21,-42],[13,-44]]);F(g,LG(g,13,-56,24,-42,'#e0e4ea','#7a828c'),1.3);
 if(hero){P(g,[[12,-50],[5,-54],[7,-46],[12,-45]]);F(g,LG(g,5,-54,12,-45,'#e0e4ea','#7a828c'),1.2);E(g,-6,-40,3.2,2.2);F(g,'#c8a040',1);}// Doppelaxt + Horn
 g.restore();}
// ---- Kriegsbär ----
function drawBear(g){
 for(const x of[-15,14]){P(g,[[x-5,-18],[x+5,-18],[x+5,-2],[x-6,-2]]);F(g,'#3a2414',1.4);}// hintere Beine
 E(g,-2,-25,25,15);F(g,LG(g,0,-40,0,-10,'#8a5a32','#4a2c14'),1.8);// Rumpf
 E(g,6,-34,14,8);F(g,'rgba(160,110,60,.45)',0);// Buckel-Licht
 P(g,[[-14,-34],[-4,-40],[10,-40],[16,-30],[2,-26],[-12,-28]]);F(g,LG(g,-14,-40,16,-26,'#8a2a1a','#5a1a10'),1.3);// Satteldecke
 for(const x of[-8,0,8])L(g,x,-38,x+2,-28,'#d8b060',1.2);
 L(g,-20,-28,20,-18,'#3a2414',2.4);// Gurt
 for(const x of[-19,12]){P(g,[[x-6,-20],[x+6,-20],[x+7,0],[x-7,0]]);F(g,LG(g,x-6,0,x+6,0,'#6a4224','#4a2c14'),1.5);for(let i=0;i<3;i++){P(g,[[x+2+i*2,0],[x+4+i*2,3],[x+4+i*2,-1]]);F(g,'#e8e0d0',.5);}}
 // Kopf
 E(g,24,-30,11,10);F(g,LG(g,14,-40,34,-20,'#9a6a3a','#5a3418'),1.6);
 E(g,33,-26,7,5.5);F(g,'#c8a070',1.3);E(g,38,-28,2.4,2);F(g,'#1a1010',0);
 P(g,[[30,-22],[38,-23],[36,-19],[31,-19]]);F(g,'#2a1010',.9);for(const x of[32,35])P(g,[[x,-22.5],[x+.8,-20],[x+1.6,-22.5]]),F(g,'#f4ecd2',.5);
 for(const[x,y]of[[18,-39],[26,-41]]){E(g,x,y,3.6);F(g,'#5a3418',1.2);E(g,x,y,1.8);F(g,'#2a1408',0);}
 E(g,28,-33,1.6,1.2);F(g,'#ffb030',0);
 for(const[a,b]of[[20,-36],[23,-34],[26,-35]])L(g,a,b,a+2,b+5,'#3a7ad0',1.6);// Kriegsbemalung
 // Stachel-Halsband
 g.beginPath();g.arc(17,-28,8,-1.2,1.6);g.strokeStyle='#4a4a52';g.lineWidth=3;g.stroke();for(const a of[-.9,-.1,.7,1.4]){const x=17+Math.cos(a)*8,y=-28+Math.sin(a)*8;P(g,[[x-1.4,y],[x+Math.cos(a)*4,y+Math.sin(a)*4],[x+1.4,y]]);F(g,'#c8c8d0',.5);}}
// ---- Goblin-Tunnelbohrer (Bohrmaschine mit zwei Goblins) ----
function drawGobHead(g,x,y,s,gog){g.save();g.translate(x,y);g.scale(s,s);
 for(const k of[-1,1]){P(g,[[k*6,-1],[k*16,-6],[k*7,3]]);F(g,'#6aa83a',1.1);}
 E(g,0,0,7,6.2);F(g,LG(g,-7,-6,7,6,'#8ac84a','#4a8a22'),1.3);P(g,[[3,0],[9,2],[3,3]]);F(g,'#5a9a2a',.9);
 if(gog){L(g,-7,-2,7,-2,'#3a2414',1.8);for(const k of[-2.8,2.8]){E(g,k,-2,2.6);F(g,'#c8a040',1);E(g,k,-2,1.6);F(g,'#9fe8ff',0);}}
 P(g,[[-6,-4],[-4,-8],[5,-8],[7,-4]]);F(g,'#7a4a22',1);g.restore();}
function drawDrill(g,o){o=o||{};
 // Kette/Raupen
 E(g,-2,-5,17,5.5);F(g,'#2a2a2e',1.4);for(let i=0;i<5;i++){E(g,-14+i*6,-5,2.4);F(g,'#6a6a72',.8);}
 // Wanne
 P(g,[[-17,-9],[-15,-22],[9,-22],[13,-9]]);F(g,LG(g,0,-22,0,-9,'#9a6a3a','#5a3418'),1.6);
 for(const x of[-11,-3,5])L(g,x,-21,x,-10,'rgba(40,20,5,.5)',1);E(g,-13,-12,1.2);F(g,'#d8b060',0);E(g,9,-12,1.2);F(g,'#d8b060',0);
 // Bohrer
 const sp=o.spin||0;P(g,[[11,-22],[34,-15],[11,-8]]);F(g,LG(g,11,-22,11,-8,'#e8ecf0','#6a727c'),1.5);
 for(let i=0;i<4;i++){const x=13+i*5+(sp%1)*5;if(x>31)continue;const h=7*(1-(x-11)/23);L(g,x,-15-h,x+3,-15+h,'#4a525c',1.2);}
 P(g,[[9,-24],[13,-24],[13,-6],[9,-6]]);F(g,'#5a5a62',1.2);
 // Auspuff
 L(g,-14,-22,-16,-34,'#3a3a40',3.4);E(g,-16,-36,3,2);F(g,'#5a5a5a',1);
 for(const[x,y,r]of[[-18,-41,3.4],[-21,-46,2.6]]){E(g,x,y,r);F(g,'rgba(120,110,100,.55)',0);}
 // Goblins
 drawGobHead(g,-7,-28,.85,true);L(g,-3,-25,6,-22,'#4a8a22',2.4);
 drawGobHead(g,3,-31,.95,true);L(g,7,-27,12,-22,'#4a8a22',2.4);
 P(g,[[-1,-41],[2,-48],[5,-41]]);F(g,'#c84a2a',.8);}// Wimpel
// ---- Hexenmeister (Einheit) / Zarvok (Held) ----
function drawWarlock(g,hero){const s=hero?1.16:1,fel='#7aff50';g.save();g.scale(s,s);
 P(g,[[-10,0],[-8,-26],[8,-26],[11,0]]);F(g,LG(g,-10,-26,11,0,hero?'#3a1a4a':'#2a3a1a','#140a1a'),1.6);// Robe
 L(g,-9,-3,10,-3,hero?'#7aff50':'#a8c860',1.8);for(const x of[-5,1,6])L(g,x,-24,x+1,-4,'rgba(0,0,0,.35)',1);
 P(g,[[-9,-26],[-11,-42],[9,-44],[10,-26]]);F(g,LG(g,-11,-44,10,-26,hero?'#4a2a5a':'#3a4a22','#1a0e22'),1.5);
 if(hero){for(const k of[-1,1]){P(g,[[k*7,-44],[k*14,-46],[k*11,-40]]);F(g,'#5a5a62',1.2);P(g,[[k*12,-46],[k*16,-52],[k*13,-44]]);F(g,'#c8c8d0',.8);}}// Schulterdornen
 P(g,[[-2,-30],[2,-30],[1,-24],[-1,-24]]);F(g,fel,.6);
 // Kapuze mit Hörnern
 P(g,[[-8,-43],[-7,-56],[2,-61],[9,-54],[9,-43]]);F(g,LG(g,-8,-61,9,-43,hero?'#4a2a5a':'#3a4a22','#140a1a'),1.5);
 E(g,4,-50,4.4,4.6);F(g,'#0a0610',0);g.save();g.shadowColor=fel;g.shadowBlur=6;for(const x of[3,6])E(g,x,-51,1.2,.9),F(g,fel,0);g.restore();
 for(const k of[-1,1]){g.beginPath();g.moveTo(k*3-1,-58);g.quadraticCurveTo(k*9-2,-68,k*3+(hero?-8:-4),-72);g.quadraticCurveTo(k*6,-64,k*3+2,-57);g.closePath();F(g,'#d8ccb0',1);}
 // Stab mit Totenkopf und Teufelsfeuer
 L(g,13,-60,11,0,'#3a2414',2.6);E(g,13,-62,4,3.6);F(g,'#ece4cc',1.1);E(g,12,-62.5,1,1);F(g,'#1a1a1a',0);E(g,14.4,-62.5,1,1);F(g,'#1a1a1a',0);
 g.save();g.shadowColor=fel;g.shadowBlur=10;P(g,[[10,-64],[13,-76],[16,-64]]);F(g,'rgba(140,255,90,.85)',0);E(g,13,-66,2.4,3);F(g,'#e8ffd0',0);g.restore();
 L(g,5,-38,12,-40,OL,4);L(g,5,-38,12,-40,hero?'#4a2a5a':'#3a4a22',2.6);
 if(hero){g.save();g.translate(-14,-40);g.rotate(-.2);P(g,[[-6,-5],[6,-5],[6,5],[-6,5]]);F(g,'#5a1a1a',1.2);L(g,0,-5,0,5,'#c8a040',1);g.shadowColor=fel;g.shadowBlur=6;E(g,0,0,2);F(g,fel,0);g.restore();}// schwebendes Grimoire
 g.restore();}
// ---- Imp ----
function drawImp(g){
 for(const s of[-1,1])L(g,s*3,-8,s*4,0,'#6a1a10',2.6);
 g.beginPath();g.moveTo(-5,-9);g.quadraticCurveTo(-14,-8,-15,-16);g.strokeStyle='#8a2a18';g.lineWidth=1.8;g.stroke();P(g,[[-15,-16],[-17,-19],[-13,-18]]);F(g,'#8a2a18',.6);
 for(const k of[0,1]){P(g,[[-3,-16],[-12+k*2,-26],[-9+k*3,-17]]);F(g,k?'#c84a2a':'#8a2a18',1);}// Flügelchen
 E(g,0,-12,6,6);F(g,LG(g,0,-18,0,-6,'#e85a30','#8a2a18'),1.3);
 E(g,2,-21,5.6,5);F(g,LG(g,0,-26,0,-16,'#f06a3a','#9a3018'),1.3);
 for(const k of[-1,1]){P(g,[[k*2.5,-25],[k*5+1,-31],[k*4+2,-24]]);F(g,'#2a1a10',.8);}
 g.save();g.shadowColor='#ffe040';g.shadowBlur=4;E(g,4.6,-22,1.2,.9);F(g,'#fff080',0);g.restore();
 P(g,[[4,-18],[8,-19],[5,-17]]);F(g,'#f4ecd2',.5);
 L(g,3,-13,9,-15,'#c84a2a',2.2);g.save();g.shadowColor='#ffa020';g.shadowBlur=8;E(g,10,-16,2.6,3);F(g,'#ffc040',0);g.restore();}
// ---- Höllenwächter (brennender Steinkoloss) ----
function drawInfernal(g){const fel='#7aff50';
 for(const s of[-1,1]){P(g,[[s*4,-22],[s*14,-22],[s*15,0],[s*3,0]]);F(g,LG(g,0,-22,0,0,'#4a4a44','#2a2a26'),1.6);}
 P(g,[[-20,-24],[-24,-48],[-12,-62],[12,-64],[24,-50],[20,-24]]);F(g,LG(g,-24,-64,24,-24,'#5a5a52','#2a2a24'),2);
 g.save();g.shadowColor=fel;g.shadowBlur=8;for(const[a,b,c,d]of[[-14,-50,-4,-38],[-4,-38,6,-46],[6,-46,14,-32],[-10,-30,2,-28]])L(g,a,b,c,d,'#a8ff70',2);g.restore();
 for(const s of[-1,1]){P(g,[[s*18,-56],[s*30,-46],[s*28,-22],[s*20,-26],[s*20,-42]]);F(g,'#4a4a44',1.5);E(g,s*27,-20,6,5);F(g,'#3a3a34',1.5);}
 E(g,6,-70,10,9);F(g,LG(g,0,-79,0,-61,'#5a5a52','#2a2a24'),1.6);
 g.save();g.shadowColor=fel;g.shadowBlur=8;E(g,9,-71,2,1.4);F(g,'#d8ffb0',0);E(g,3,-71,2,1.4);F(g,'#d8ffb0',0);
 for(const[x,h]of[[-6,16],[0,22],[6,18],[12,13]]){P(g,[[x-4,-74],[x,-74-h],[x+4,-74]]);F(g,'rgba(120,255,80,.75)',0);}g.restore();}
// ---- Nekromant / Aldric ----
function drawNecro(g){const c='#c080ff';
 P(g,[[-10,0],[-8,-28],[8,-28],[11,0]]);F(g,LG(g,-10,-28,11,0,'#2a2a3a','#0e0e16'),1.6);
 for(let i=0;i<5;i++)P(g,[[-10+i*4.2,0],[-8+i*4.2,4],[-6+i*4.2,0]]),F(g,'#0e0e16',.6);
 P(g,[[-9,-28],[-10,-44],[9,-45],[9,-28]]);F(g,LG(g,-10,-45,9,-28,'#3a3a4a','#14141e'),1.5);
 L(g,-6,-40,6,-32,'#d8d0c0',1.6);for(let i=0;i<3;i++){E(g,-4+i*4,-38+i*2.6,1.4);F(g,'#ece4cc',.6);}
 P(g,[[-8,-44],[-6,-58],[4,-60],[9,-50],[8,-44]]);F(g,LG(g,-8,-60,9,-44,'#3a3a4a','#0e0e16'),1.5);
 E(g,4,-50,4,4.4);F(g,'#e8e0d0',1);E(g,5.2,-51,1.1,1.3);F(g,'#1a1028',0);g.save();g.shadowColor=c;g.shadowBlur=5;E(g,5.2,-51,.6);F(g,c,0);g.restore();L(g,3,-46.5,7,-46.5,OL,.8);
 // Knochenstab
 L(g,13,-62,11,0,'#d8d0c0',2.4);for(const y of[-30,-44])L(g,10,y,15,y,'#d8d0c0',1.4);
 E(g,13,-64,3.6,3.2);F(g,'#ece4cc',1);g.save();g.shadowColor=c;g.shadowBlur=10;E(g,13,-70,3,3);F(g,'rgba(200,140,255,.85)',0);g.restore();
 L(g,5,-38,12,-40,OL,4);L(g,5,-38,12,-40,'#3a3a4a',2.6);}
function drawAldric(g){const ice='#9fe8ff';
 P(g,[[-15,-50],[-24,-6],[-6,-2],[0,-48]]);F(g,LG(g,-24,0,0,0,'#1a2a3a','#3a5a7a'),1.5);// Umhang
 for(const s of[-1,1]){P(g,[[s*3,-26],[s*11,-26],[s*12,0],[s*2,0]]);F(g,LG(g,0,-26,0,0,'#8a96a4','#3a4450'),1.5);}
 P(g,[[-13,-26],[-12,-50],[12,-52],[13,-26]]);F(g,LG(g,-13,-52,13,-26,'#a8b4c0','#4a5462'),1.8);
 L(g,-12,-38,12,-40,'#2a3442',2);E(g,0,-44,4,3);F(g,'#5a7a9a',1);g.save();g.shadowColor=ice;g.shadowBlur=6;E(g,0,-44,1.6);F(g,ice,0);g.restore();
 for(const s of[-1,1]){E(g,s*12,-50,6,4.4);F(g,LG(g,0,-55,0,-46,'#c8d0d8','#5a6470'),1.4);P(g,[[s*10,-53],[s*16,-60],[s*15,-51]]);F(g,'#d8e0e8',.9);}
 // Helm mit Krone
 P(g,[[-7,-52],[-8,-64],[0,-69],[9,-64],[9,-52]]);F(g,LG(g,-8,-69,9,-52,'#b8c4d0','#4a5462'),1.6);
 L(g,1,-61,9,-60,'#0a1018',2.4);g.save();g.shadowColor=ice;g.shadowBlur=6;E(g,6,-60.5,1.4,.8);F(g,ice,0);g.restore();
 P(g,[[-7,-66],[-6,-74],[-3,-68],[0,-77],[3,-68],[6,-74],[8,-66]]);F(g,LG(g,0,-77,0,-66,'#e8f4ff','#7aa8c8'),1.2);
 // Runenklinge
 g.save();g.translate(14,-38);g.rotate(-.45);P(g,[[-2,0],[2,0],[2.6,-34],[0,-40],[-2.6,-34]]);F(g,LG(g,-3,0,3,0,'#9fc8e8','#e8f8ff','#7aa8c8'),1.3);
 g.shadowColor=ice;g.shadowBlur=8;for(const y of[-10,-18,-26])L(g,-1,y,1,y-3,ice,1.2);g.shadowBlur=0;
 P(g,[[-6,0],[6,0],[5,2.4],[-5,2.4]]);F(g,'#4a5462',1);L(g,0,2,0,8,'#3a2414',2.4);g.restore();
 L(g,6,-46,14,-40,OL,4.4);L(g,6,-46,14,-40,'#8a96a4',3);}
// ---- Zauber-Symbole ----
function drawShieldIcon(g){g.save();g.translate(0,-12);g.save();g.shadowColor='#7ad8ff';g.shadowBlur=8;
 P(g,[[-13,-14],[13,-14],[12,2],[0,14],[-12,2]]);F(g,LG(g,0,-14,0,14,'#5a8ac8','#1a3a6a'),1.8);g.restore();
 P(g,[[-9,-10],[9,-10],[8,1],[0,9],[-8,1]]);F(g,LG(g,0,-10,0,9,'#8ab8e8','#3a6aa8'),1.1,'#c8e8ff');
 L(g,0,-7,0,5,'#e8f8ff',2);L(g,-4,-3,4,-3,'#e8f8ff',2);L(g,-3,2,3,-1,'#e8f8ff',1.4);g.restore();}
function drawQuakeIcon(g){g.save();g.translate(0,-6);E(g,0,2,16,6);F(g,LG(g,0,-4,0,8,'#8a6a42','#4a3420'),1.5);
 L(g,-12,1,-4,3,'#1a0e06',1.8);L(g,-4,3,1,-1,'#1a0e06',1.8);L(g,1,-1,7,4,'#1a0e06',1.8);L(g,7,4,13,1,'#1a0e06',1.6);
 for(const[x,y,r]of[[-9,-9,3.4],[4,-14,4],[11,-7,2.6],[-2,-20,2.2]]){P(g,[[x-r,y],[x-r*.3,y-r],[x+r,y-r*.4],[x+r*.6,y+r*.8],[x-r*.6,y+r*.7]]);F(g,'#7a5a36',1);}
 for(const s of[-1,1])L(g,s*18,-2,s*22,-8,'#d8c8a0',1.4);g.restore();}
function drawLightningIcon(g){g.save();g.translate(0,-14);
 for(const[x,y,r]of[[-8,-12,7],[2,-15,8],[10,-11,6],[0,-8,9]]){E(g,x,y,r,r*.75);F(g,'#4a5068',1.2);}E(g,0,-10,13,5);F(g,'#5a6078',0);
 g.save();g.shadowColor='#bfe8ff';g.shadowBlur=8;P(g,[[0,-6],[-5,6],[0,6],[-4,18],[7,2],[2,2],[6,-6]]);F(g,'#f8fcff',1,'#7ac8ff');g.restore();g.restore();}
function drawGravesIcon(g){g.save();g.translate(0,-4);E(g,0,0,16,5);F(g,'#3a2a1a',1.2);
 P(g,[[-9,0],[-9,-18],[-6,-22],[2,-22],[5,-18],[5,0]]);F(g,LG(g,-9,-22,5,0,'#9a9aa4','#4a4a54'),1.5);L(g,-2,-18,-2,-8,'#3a3a44',1.6);L(g,-5,-14,1,-14,'#3a3a44',1.6);
 for(const[x,y,a]of[[10,-6,-.3],[13,-8,.2],[15,-5,.5]]){g.save();g.translate(x,y);g.rotate(a);L(g,0,4,0,-4,'#ece4cc',1.6);g.restore();}
 E(g,12,-1,4,2);F(g,'#5a4028',.8);g.save();g.shadowColor='#c080ff';g.shadowBlur=8;E(g,-2,-25,2);F(g,'#d8b0ff',0);g.restore();g.restore();}
function drawPlagueIcon(g){g.save();g.translate(0,-12);g.save();g.shadowColor='#8aff4a';g.shadowBlur=8;
 for(const[x,y,r]of[[-9,2,7],[8,3,7],[0,-4,9],[-4,8,6],[6,9,6]]){E(g,x,y,r);F(g,'rgba(110,200,60,.8)',0);}g.restore();
 E(g,0,-2,6.4,6);F(g,'#e8e4d4',1.2);E(g,-2.4,-3,1.6,1.8);F(g,'#2a4a1a',0);E(g,2.4,-3,1.6,1.8);F(g,'#2a4a1a',0);P(g,[[-3,3],[3,3],[2,6],[-2,6]]);F(g,'#e8e4d4',1);
 for(const x of[-1.2,1.2])L(g,x,3.2,x,5.6,'#2a4a1a',.7);g.restore();}
function drawHealIcon(g){g.save();g.translate(0,-12);g.save();g.shadowColor='#ffe890';g.shadowBlur=10;
 P(g,[[-4,-13],[4,-13],[4,-4],[13,-4],[13,4],[4,4],[4,13],[-4,13],[-4,4],[-13,4],[-13,-4],[-4,-4]]);F(g,LG(g,0,-13,0,13,'#c8ff9a','#3aa84a'),1.5);g.restore();
 for(const[x,y]of[[-12,-12],[12,-10],[11,12]]){P(g,[[x,y-3],[x+.8,y-.8],[x+3,y],[x+.8,y+.8],[x,y+3],[x-.8,y+.8],[x-3,y],[x-.8,y-.8]]);F(g,'#fff8c0',0);}g.restore();}
// ---- Tunnel-Erdhügel (in Bewegung) ----
function drawTunnel(g){E(g,0,-3,15,6.5);F(g,LG(g,0,-10,0,4,'#9a7a4a','#5a3e22'),1.4);
 for(const[x,y,r]of[[-9,-5,2.6],[2,-8,3],[9,-4,2.2],[-3,-2,2]]){E(g,x,y,r,r*.7);F(g,'#7a5a34',.7);}
 P(g,[[8,-7],[17,-5],[8,-3]]);F(g,'#c8ccd0',1);}
Object.assign(DART,{
 wolfrider:{fn:g=>drawWolfrider(g,0),m:.9},wolfking:{fn:g=>drawWolfrider(g,1),m:.88},bear:{fn:drawBear,m:1},
 drill:{fn:g=>drawDrill(g),m:1},drill_1:{fn:g=>drawDrill(g,{spin:.5}),m:1},tunnel:{fn:drawTunnel,m:1},
 warlock:{fn:g=>drawWarlock(g,0),m:.9},zarvok:{fn:g=>drawWarlock(g,1),m:.88},imp:{fn:drawImp,m:.85},infernal:{fn:drawInfernal,m:.8},
 necro:{fn:drawNecro,m:.9},aldric:{fn:drawAldric,m:.86},
 shieldsp:{fn:drawShieldIcon,m:1,spell:1},quake:{fn:drawQuakeIcon,m:1,spell:1},lightning:{fn:drawLightningIcon,m:1,spell:1},
 graves:{fn:drawGravesIcon,m:1,spell:1},plague:{fn:drawPlagueIcon,m:1,spell:1},healsp:{fn:drawHealIcon,m:1,spell:1},
 kargashP:{fn:g=>drawWolfrider(g,1),m:1},zarvokP:{fn:g=>drawWarlock(g,1),m:1},aldricP:{fn:drawAldric,m:1}});
