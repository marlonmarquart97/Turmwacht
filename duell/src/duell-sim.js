// ===== Turmwacht Duell – deterministische Spiellogik =====
// Fester Tick (20/s), eigener Zufallsgenerator im Zustand, keine DOM-/Render-Abhängigkeit.
// Eingaben nur über Befehle {tick, side, a:'play'|'abil', i, card, x, y} -> für späteren Online-Lockstep geeignet.
const DuellSim=(()=>{
const B=(typeof TW_BESTIARY!=='undefined')?TW_BESTIARY:require('./shared/tw-bestiary.js');
const CARDS=B.cards,TICK=1/20,FW=360,FH=640,RY0=306,RY1=334,MIDY=320,BRIDGES=[70,290],BW=42;
const DEP=1.0,CONTACT=3,MELEE=20,STEER=.28,SWING=2;// 0.6: Deploy-Zeit, Nahkampf-Kontakt, Lenkträgheit, Schlag-Frames
const MATCH=180,DOUBLE=60,SUDDEN=60,COUNT=3,REGEN=2.8,MAXM=10;
const TPOS=[{sub:'guard',lane:0,x:70,y:508},{sub:'guard',lane:1,x:290,y:508},{sub:'keep',lane:-1,x:180,y:590}];
const FORM={1:[[0,0]],2:[[-11,0],[11,0]],3:[[0,-10],[-12,8],[12,8]],4:[[-11,-11],[11,-11],[-11,11],[11,11]],5:[[0,-15],[14,-5],[9,12],[-9,12],[-14,-5]]};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const d2=(ax,ay,bx,by)=>{const dx=ax-bx,dy=ay-by;return Math.sqrt(dx*dx+dy*dy);};
function rnd(S){let a=S.rs=(S.rs+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
function validateDeck(deck){
 if(!Array.isArray(deck)||deck.length!==8)return 'Ein Deck braucht genau 8 Karten.';
 if(new Set(deck).size!==8)return 'Jede Karte darf nur einmal im Deck sein.';
 for(const id of deck)if(!CARDS[id])return 'Unbekannte Karte: '+id;
 const h=deck.filter(id=>CARDS[id].type==='hero').length;
 if(h===0)return 'Jedes Deck braucht genau einen Helden.';if(h>1)return 'Nur ein Held pro Deck erlaubt.';return null;}
function mkPlayer(S,side,deck){const d=deck.slice();for(let i=d.length-1;i>0;i--){const j=Math.floor(rnd(S)*(i+1));[d[i],d[j]]=[d[j],d[i]];}
 return{side,mana:5,regen:1,crowns:0,hand:d.slice(0,4),queue:d.slice(4),heroId:0,heroCharge:0,spent:0,plays:0,leak:0};}
function create(cfg){cfg=cfg||{};const decks=cfg.decks||[B.defaultDeck,B.defaultDeck];
 decks.forEach((d,i)=>{const e=validateDeck(d);if(e)throw new Error('Deck '+(i+1)+': '+e);});
 const S={v:1,tick:0,t:0,phase:'count',countT:COUNT,matchT:MATCH,suddenT:SUDDEN,dbl:false,over:false,winner:-1,reason:'',rs:(cfg.seed|0)||1,nid:1,
  ents:[],proj:[],zones:[],bombs:[],queue:[],ev:[],p:null,stats:[{dmgTower:0},{dmgTower:0}]};
 S.p=[mkPlayer(S,0,decks[0]),mkPlayer(S,1,decks[1])];
 const mods=cfg.mods||[];S.mods=[mods[0]||{},mods[1]||{}];
 S.p.forEach((p,i)=>{const m=S.mods[i];if(m.mana!=null)p.mana=m.mana;if(m.regen)p.regen=m.regen;});
 for(const side of[0,1])for(const T of TPOS){const st=B.towers[T.sub];addEnt(S,{side,cls:'tower',card:T.sub,sub:T.sub,lane:T.lane,x:T.x,y:side?FH-T.y:T.y,r:st.r,hp:st.hp,maxhp:st.hp,st,active:T.sub!=='keep',mass:1e9});}
 for(const e of S.ents)if(e.cls==='tower'){const k=S.mods[e.side].towerHp;if(k){e.hp=e.maxhp=Math.round(e.hp*k);}}
 return S;}
function addEnt(S,o){const e=Object.assign({id:S.nid++,ox:o.x,oy:o.y,tgt:0,cd:0,frz:0,stun:0,slowT:0,slowF:0,dot:0,dotT:0,dep:0,face:o.side?1:-1,atk:0,atkT:-99,air:false,mass:1,retg:0,lock:false,vx:0,vy:0,sw:0,swT:0,dep0:0,born:S.tick,rootT:0,gndT:0,fearT:0,bufT:0,bufF:0,hasteT:0,hasteF:0,auraT:0,auraF:0,thT:0,thF:0,bur:false,amb:false,burCd:0,fearCd:1},o);if(e.dep>0)e.dep0=e.dep;S.ents.push(e);return e;}
function ev(S,k,o){S.ev.push(Object.assign({k},o||{}));}
function byId(S,id){if(!id)return null;for(const e of S.ents)if(e.id===id)return e.hp>0?e:null;return null;}
function tower(S,side,sub,lane){return S.ents.find(e=>e.cls==='tower'&&e.side===side&&e.sub===sub&&(lane==null||e.lane===lane))||null;}
function alive(e){return e&&e.hp>0;}
// ---------- Platzierung ----------
function inRiver(x,y){return y>RY0-2&&y<RY1+2;}
function zoneOK(S,side,x,y){if(x<8||x>FW-8||y<10||y>FH-10)return false;if(inRiver(x,y))return false;
 if(side===0?y>=RY1+4:y<=RY0-4)return true;
 const lane=x<FW/2?0:1,g=tower(S,1-side,'guard',lane);if(alive(g))return false;
 return side===0?y>=160:y<=FH-160;}
function canPlay(S,side,i,x,y){if(S.over||S.phase==='count')return 'Noch nicht bereit';const p=S.p[side],id=p.hand[i],C=CARDS[id];if(!C)return 'Keine Karte';
 if(p.mana+1e-9<C.cost)return 'Nicht genug Mana';
 if(C.type==='hero'&&p.heroId&&byId(S,p.heroId))return 'Dein Held kämpft bereits';
 if(C.type==='spell')return(x>=0&&x<=FW&&y>=0&&y<=FH)?null:'Außerhalb des Feldes';
 if(!zoneOK(S,side,x,y))return 'Hier nicht erlaubt';
 if(C.type==='bld'){for(const o of S.ents)if((o.cls==='tower'||o.cls==='bld')&&d2(o.x,o.y,x,y)<o.r+C.b.r+2)return 'Zu nah an einem Gebäude';}
 return null;}
function issue(S,cmd,delay){cmd=Object.assign({},cmd);cmd.tick=S.tick+(delay==null?1:delay);if(cmd.a==='play')cmd.card=S.p[cmd.side].hand[cmd.i];S.queue.push(cmd);return cmd;}
function exec(S,c){const p=S.p[c.side];
 if(c.a==='play'){if(p.hand[c.i]!==c.card||canPlay(S,c.side,c.i,c.x,c.y))return;const C=CARDS[c.card];p.mana-=C.cost;p.spent+=C.cost;p.plays++;
  p.queue.push(c.card);p.hand[c.i]=p.queue.shift();deploy(S,c.side,c.card,c.x,c.y);ev(S,'play',{side:c.side,card:c.card,x:c.x,y:c.y});}
 else if(c.a==='abil')ability(S,c.side,c.x,c.y);}
// 0.5: freie Bewegung (Clash-Royale-Verhalten). e.lane = bevorzugte Spur/Brücke, wenn kein Gegner in Sicht.
const laneOf=x=>x<FW/2?0:1,LANE_X=[[8,FW-8],[8,FW-8]],MIDW=60;// Mittelzone ≈17 % der Feldbreite
const inMid=x=>Math.abs(x-FW/2)<=MIDW/2;
function laneClamp(x){return clamp(x,8,FW-8);}
// Spurwahl für Einzeleinheiten in der Mitte: schwächerer Turm, sonst nähere Seite
function laneScore(S,side,l){const g=tower(S,1-side,'guard',l),k=tower(S,1-side,'keep');const t=alive(g)?g:k;return t?t.hp/t.maxhp+(alive(g)?0:-.15):1;}
function midLane(S,side,x){const a=laneScore(S,side,0),b=laneScore(S,side,1);if(Math.abs(a-b)>.04)return a<b?0:1;return x<FW/2?0:x>FW/2?1:(side?1:0);}
// Aufteilung einer Gruppe: [Anzahl links, Anzahl rechts]
function splitCount(S,side,x,n){if(n<2||!inMid(x))return null;const h=Math.floor(n/2),near=x<FW/2?0:x>FW/2?1:midLane(S,side,x);return near===0?[n-h,h]:[h,n-h];}
function deploy(S,side,id,x,y){const C=CARDS[id];
 if(C.type==='spell'){castSpell(S,side,id,x,y);return;}
 if(C.type==='bld'){const b=C.b;addEnt(S,{side,cls:'bld',card:id,x,y,r:b.r,hp:b.hp,maxhp:b.hp,st:b,dep:1,life:b.life,tmr:b.spawn?b.spawn.every*.5:(b.mana?b.mana.every:0),mass:1e9});return;}
 const n=C.count||1,sp=splitCount(S,side,x,n);
 if(sp){// Mitte: Gruppe teilt sich auf beide Spuren auf
  for(let l=0;l<2;l++){const k=sp[l];if(!k)continue;const f=FORM[k]||FORM[1];for(const[dx,dy]of f)spawnUnit(S,side,id,x+(l?9:-9)+dx*.7,y+(side?-dy:dy),DEP,l);}
  ev(S,'split',{side,x,y,n:sp});return;}
 const f=FORM[n]||FORM[1],ln=inMid(x)?midLane(S,side,x):laneOf(x);
 for(const[dx,dy]of f){const e=spawnUnit(S,side,id,x+dx,y+(side?-dy:dy),DEP,ln);if(C.type==='hero'){S.p[side].heroId=e.id;S.p[side].heroCharge=.4;e.hero=true;}}}
function spawnUnit(S,side,id,x,y,dep,lane){const C=CARDS[id],u=C.u;if(!C.air&&inRiver(x,y))y=(side===0)?RY1+3:RY0-3;
 if(lane==null)lane=laneOf(x);x=laneClamp(x);
 // 0.6.1: jedes Gruppenmitglied bekommt ein eigenes (geseedetes) Tempo und eine eigene Spur-Neigung -> läuft für sich
 const sf=.93+.14*rnd(S),po=rnd(S)*2-1;
 return addEnt(S,{side,cls:'unit',card:id,lane,x,y,r:u.r,hp:u.hp,maxhp:u.hp,st:u,air:!!C.air,mass:u.mass||1,dep:dep==null?DEP:dep,sf,po,stk:0,unst:0,pt:0,px:x,py:y});}
// ---------- Zauber & Fähigkeiten ----------
const ghost=e=>e.cls==='unit'&&e.dep>0;
function enemiesIn(S,side,x,y,r,o){o=o||{};const out=[];for(const e of S.ents){if(e.side===side||e.hp<=0||e.thrown||e.leap||ghost(e))continue;if(o.noAir&&e.air)continue;if(o.unitsOnly&&e.cls!=='unit')continue;if(d2(e.x,e.y,x,y)<=r+e.r*.5)out.push(e);}return out;}
function castSpell(S,side,id,x,y){const s=CARDS[id].s;
 if(id==='firerain'){S.zones.push({k:'firerain',side,x,y,r:s.r,t:s.delay,max:s.delay,dmg:s.dmg,tower:s.tower});ev(S,'firerain',{side,x,y,r:s.r});}
 else if(id==='frost'){for(const e of enemiesIn(S,side,x,y,s.r)){hurt(S,e,e.cls==='unit'?s.dmg:s.dmg*s.tower,side);e.frz=Math.max(e.frz,s.freeze);}ev(S,'frost',{side,x,y,r:s.r});}
 else if(s.buff){S.zones.push({k:'chant',side,x,y,r:s.r,t:s.t,max:s.t,buff:s.buff,haste:s.haste});ev(S,'chant',{side,x,y,r:s.r});}}
// 0.7: Buffs (Kriegsgesang/Kriegsschrei/Banner) – Schadens- und Tempo-Multiplikator
function setBuf(S,o,f,t){const cur=o.bufT>S.tick?o.bufF:0;o.bufF=Math.max(cur,f);o.bufT=Math.max(o.bufT,S.tick+Math.round(t/TICK));}
function setHaste(S,o,f,t){const cur=o.hasteT>S.tick?o.hasteF:0;o.hasteF=Math.max(cur,f);o.hasteT=Math.max(o.hasteT,S.tick+Math.round(t/TICK));}
function dmul(S,e){let m=1;if(e.bufT>S.tick)m+=e.bufF;if(e.auraT>S.tick)m+=e.auraF;return m;}
function hmul(S,e){return e.hasteT>S.tick?1+e.hasteF:1;}
function scare(S,o,src,t){if(o.cls!=='unit'||o.air||o.bur||o.hp<=0)return;const ft=o.hero?t*.5:t;if(ft>o.fearT){o.fearT=ft;o.fearX=src.x;o.fearY=src.y;}}
function snare(S,o,t){if(o.cls!=='unit'||o.hp<=0)return;const d=o.hero?t*.5:t;o.rootT=Math.max(o.rootT,d);if(o.air)o.gndT=Math.max(o.gndT,d);}
function segD(px,py,x0,y0,x1,y1){const dx=x1-x0,dy=y1-y0,l=dx*dx+dy*dy||1;let k=((px-x0)*dx+(py-y0)*dy)/l;k=clamp(k,0,1);return d2(px,py,x0+dx*k,y0+dy*k);}
function ability(S,side,x,y){const p=S.p[side],h=byId(S,p.heroId);if(!h||p.heroCharge<1||h.leap||h.dep>0||h.frz>0||h.stun>0)return false;const A=CARDS[h.card].abil;
 let tx=x,ty=y;if(A.reach){const d=d2(h.x,h.y,x,y);if(d>A.reach){tx=h.x+(x-h.x)*A.reach/d;ty=h.y+(y-h.y)*A.reach/d;}}
 tx=clamp(tx,8,FW-8);ty=clamp(ty,8,FH-8);
 if(A.key==='leap'){if(inRiver(tx,ty)&&!onBridge(tx))ty=(ty>MIDY)?RY1+4:RY0-4;h.leap={t:0,max:.5,x0:h.x,y0:h.y,x1:tx,y1:ty};h.tgt=0;h.lock=false;ev(S,'leap',{side,x:tx,y:ty});}
 else if(A.key==='nova'){for(const e of enemiesIn(S,side,h.x,h.y,A.r)){hurt(S,e,e.cls==='unit'?A.dmg:A.dmg*.4,side);e.frz=Math.max(e.frz,e.cls==='tower'?A.freeze*.5:A.freeze);}ev(S,'nova',{side,x:h.x,y:h.y,r:A.r});}
 else if(A.key==='cloud'){S.zones.push({k:'cloud',side,x:tx,y:ty,r:A.r,t:A.t,max:A.t,dps:A.dps,slow:A.slow,air:true});ev(S,'cloud',{side,x:tx,y:ty,r:A.r});}
 else if(A.key==='summon'){if(inRiver(tx,ty))ty=(ty>MIDY)?RY1+4:RY0-4;const f=FORM[4];for(const[dx,dy]of f)spawnUnit(S,side,A.summon.card,tx+dx*1.3,ty+dy*1.3,.5,laneOf(tx));ev(S,'summon',{side,x:tx,y:ty});}
 else if(A.key==='roar'){for(const o of S.ents)if(o.side===side&&o.cls==='unit'&&o.hp>0&&!ghost(o)&&d2(o.x,o.y,h.x,h.y)<=A.r){setBuf(S,o,A.buff,A.t);setHaste(S,o,A.haste,A.t);}
  for(const e of enemiesIn(S,side,h.x,h.y,A.r*.8,{noAir:true,unitsOnly:true}))scare(S,e,h,A.fear);ev(S,'roar',{side,x:h.x,y:h.y,r:A.r});}
 else if(A.key==='roots'){for(const e of enemiesIn(S,side,tx,ty,A.r,{unitsOnly:true})){hurt(S,e,A.dmg,side);snare(S,e,A.t);}S.zones.push({k:'roots',side,x:tx,y:ty,r:A.r,t:A.t,max:A.t});ev(S,'roots',{side,x:tx,y:ty,r:A.r});}
 else if(A.key==='fireline'){const x0=h.x,y0=h.y;for(const e of S.ents){if(e.side===side||e.hp<=0||e.thrown||e.leap||ghost(e))continue;if(segD(e.x,e.y,x0,y0,tx,ty)<=A.w+e.r*.5)hurt(S,e,e.cls==='unit'?A.dmg:A.dmg*A.tower,side,true);}
  ev(S,'fireline',{side,x0,y0,x1:tx,y1:ty,w:A.w});}
 p.heroCharge=0;ev(S,'abil',{side,key:A.key,hero:h.card});return true;}
// ---------- Schaden ----------
function hurt(S,e,amt,srcSide,fire){if(!e||e.hp<=0||amt<=0||ghost(e))return;
 if(fire&&e.st&&e.st.firevul){const fv=e.st.firevul;amt*=fv.f;if(!e.burn)ev(S,'burn',{id:e.id,x:e.x,y:e.y});e.burn=1;e.dot=fv.dps;e.dotT=Math.max(e.dotT,fv.burn);e.dotSide=srcSide;}// 0.7 Ent-Schwäche: Feuer
 e.hp-=amt;e.hurtT=S.tick;
 if(e.cls==='tower'){S.stats[srcSide===0?0:1].dmgTower+=amt;if(e.sub==='keep')e.active=true;}
 if(e.hp<=0){e.hp=0;}}
function splashAt(S,side,x,y,r,dmg,o){o=o||{};let n=0;for(const e of S.ents){if(e.side===side||e.hp<=0||e.thrown||e.leap||ghost(e))continue;if(o.air===false&&e.air)continue;if(o.air===true&&!e.air)continue;
  if(d2(e.x,e.y,x,y)<=r+e.r*.6){hurt(S,e,e.cls==='unit'?dmg:dmg*(o.tower==null?1:o.tower),side,o.fire);n++;if(o.each)o.each(e);
   if(o.knock&&e.cls==='unit'&&!e.air){const d=d2(e.x,e.y,x,y)||1;const k=o.knock*(1-Math.min(1,d/(r*1.2)))+o.knock*.4;e.x+=(e.x-x)/d*k;e.y+=(e.y-y)/d*k;e.stun=Math.max(e.stun,.5);fixPos(e,e.oy);}
   if(o.stun)e.stun=Math.max(e.stun,o.stun);}}return n;}
// ---------- Wegfindung ----------
function onBridge(x){for(const bx of BRIDGES)if(Math.abs(x-bx)<=BW/2)return bx;return null;}
function needCross(y1,y2){return(y1>MIDY)!==(y2>MIDY);}
function pickBridge(x1,x2){let best=BRIDGES[0],bd=1e9;for(const bx of BRIDGES){const d=Math.abs(x1-bx)+Math.abs(x2-bx);if(d<bd){bd=d;best=bx;}}return best;}
function laneBridge(e,x,chase){return(!chase&&e.lane!=null)?BRIDGES[e.lane]:pickBridge(e.x,x);}
function navDist(e,x,y){if(e.air||!needCross(e.y,y))return d2(e.x,e.y,x,y);const bx=laneBridge(e,x,true);return d2(e.x,e.y,bx,MIDY)+d2(bx,MIDY,x,y);}
function fixPos(e,prevY){e.x=clamp(e.x,5,FW-5);e.y=clamp(e.y,5,FH-5);if(e.air)return;
 if(e.y>RY0&&e.y<RY1){const bx=onBridge(e.x);if(bx!=null)e.x=clamp(e.x,bx-BW/2+3,bx+BW/2-3);else e.y=(prevY>MIDY)?RY1:RY0;}}
// 0.6: Lenkverhalten statt eckiger Wegpunkte. Ziel-Punkt mit Vorausschau: vor der Brücke ein Punkt in der
// Brückenachse (Abstand wächst mit dem seitlichen Versatz -> weiche Kurve), auf der Brücke geradeaus zum anderen Ufer.
// Geschwindigkeit wird träge nachgeführt (STEER), Verbündete, die schon kämpfen, werden seitlich umlaufen (Halbkreis).
function steerGoal(e,tx,ty,chase){if(e.air)return[tx,ty];
 // 0.6.1: schon auf der Brücke (im Fluss-Band) und Ziel schräg daneben -> erst in Brückenrichtung vom Steg herunter,
 // statt seitlich gegen den Rand gedrückt zu werden (Ziel diesseits der Flussmitte, aber neben der Brücke)
 if(e.y>RY0-1&&e.y<RY1+1){const ob=onBridge(e.x);if(ob!=null&&Math.abs(tx-ob)>BW/2-e.r-2&&(ty<RY0-1||ty>RY1+1)){const w=BW/2-e.r-2;return[Math.max(ob-w,Math.min(ob+w,tx)),ty>e.y?RY1+14:RY0-14];}}
 if(!needCross(e.y,ty))return[tx,ty];const bx=laneBridge(e,tx,chase),up=e.y>MIDY,ox=Math.abs(e.x-bx),lx=bx+(e.po||0)*(BW/2-e.r-4);
 // 0.6.1-Fix: früher galt jede Einheit mit y am Ufer (±1 px) als 'auf der Brücke' – auch neben der Brücke. Die steuerte dann
 // senkrecht ins Wasser, fixPos setzte sie aufs Ufer zurück -> Dauerstau. Jetzt nur im echten Brückenstreifen.
 const by0=up?e.y-RY1:RY0-e.y;// Abstand zum Ufer (≤0 = schon im Fluss-Band)
 if(ox<BW/2-7||(by0<=0&&ox<=BW/2)){const ex=up?RY0-14:RY1+14;return[lx+(e.x-lx)*.4,ex];}
 // direkt am Ufer, aber neben dem Brückenstreifen: erst seitlich auf die Brücke einfädeln, nicht ins Wasser drücken
 if(by0<10&&ox<=BW/2+e.r+6)return[lx,e.y];
 const by=up?e.y-RY1:RY0-e.y,look=Math.max(6,Math.min(44,8+ox*.45,by));return[lx,up?RY1+look:RY0-look];}
function moveTo(S,e,tx,ty,spd,chase,tid){let[gx,gy]=steerGoal(e,tx,ty,chase);const y0=e.yT;
 // 0.6.1 Vorfahrt am Brückenkopf: wer schon auf der Brücke ist, darf zuerst herunter. Passt ein entgegenkommender Gegner
 // (nicht mein Ziel) nicht neben mich auf den Steg, trete ich seitlich an den Brückenkopf statt frontal zu schieben.
 if(!e.air&&(e.y<RY0-1||e.y>RY1+1)&&needCross(e.y,ty)){const bx=laneBridge(e,tx,chase),up=e.y>MIDY,bk=up?e.y-RY1:RY0-e.y;
  if(bk<40)for(const o of S.ents){if(o.side===e.side||o.cls!=='unit'||o.air||o.hp<=0||o.id===tid||o.lock||o.rootT>0||o.frz>0||o.stun>0)continue;if(Math.abs(o.x-bx)>BW/2||!(o.y>RY0-2&&o.y<RY1+2))continue;
   if(e.r+o.r<BW/2+2)continue;const cs=e.x>=o.x?1:-1;gx=bx+cs*(BW/2+e.r+3);gy=up?Math.max(e.y,RY1+e.r+4):Math.min(e.y,RY0-e.r-4);e.yld=o.id;e.yT=(e.yT||0)+1;break;}}
 if(e.yT===y0)e.yT=0;
 let dx=gx-e.x,dy=gy-e.y,d=Math.sqrt(dx*dx+dy*dy);if(d<1e-6)return;dx/=d;dy/=d;
 // seitliches Ausweichen um kämpfende Verbündete (fächert Gruppen am Ziel auf)
 let lx=0,ly=0;for(const o of S.ents){if(o===e||o.side!==e.side||o.cls!=='unit'||o.air!==e.air||o.hp<=0||!o.lock)continue;const ax=o.x-e.x,ay=o.y-e.y,m=e.r+o.r+8;if(ax>m||ax<-m||ay>m||ay<-m)continue;
  const ad=Math.sqrt(ax*ax+ay*ay);if(ad>=m||ad<1e-4)continue;const fw=(ax*dx+ay*dy)/ad;if(fw<=.2)continue;let cr=ax*dy-ay*dx;if(Math.abs(cr)<1e-3)cr=(e.id%2)?1:-1;const k=(1-ad/m)*fw*1.6,sg=cr>0?1:-1;lx+=-dy*sg*k;ly+=dx*sg*k;}
 // 0.6.1: entgegenkommende Gegner, die nicht mein Ziel sind (z. B. Gebäude-Jäger), seitlich passieren statt frontal zu schieben
 if(!e.air)for(const o of S.ents){if(o.side===e.side||o.cls!=='unit'||o.air||o.hp<=0||o.id===tid)continue;const ax=o.x-e.x,ay=o.y-e.y,m=e.r+o.r+10;if(ax>m||ax<-m||ay>m||ay<-m)continue;
  const ad=Math.sqrt(ax*ax+ay*ay);if(ad>=m||ad<1e-4)continue;const fw=(ax*dx+ay*dy)/ad;if(fw<=.3)continue;let cr=ax*dy-ay*dx;if(Math.abs(cr)<1e-3)cr=(e.side?1:-1);const k=(1-ad/m)*fw*1.3,sg=cr>0?1:-1;lx+=-dy*sg*k;ly+=dx*sg*k;}
 e.gdx=dx;e.gdy=dy;
 // Hindernisse (Türme/Gebäude) vorausschauend seitlich umlaufen statt hineinzulaufen
 if(!e.air)for(const o of S.ents){if((o.cls!=='tower'&&o.cls!=='bld')||o.hp<=0||o.id===tid)continue;const ax=o.x-e.x,ay=o.y-e.y,m=e.r+o.r*.85+3,along=ax*dx+ay*dy;
  if(along<=0||along>m+26)continue;const perp=ax*dy-ay*dx;if(Math.abs(perp)>=m)continue;if(e.avdId!==o.id){e.avdId=o.id;const wantX=Math.abs(gx-o.x)>4?gx:FW/2,cand=-dy;e.avdS=Math.abs(perp)>2?(perp>0?1:-1):((wantX-o.x)*cand>=0?1:-1);}const sg=e.avdS,k=(1-Math.abs(perp)/m)*2.2*(1-Math.max(0,along-m)/26);
  lx+=-dy*sg*k;ly+=dx*sg*k;}
 // Stau-Auflösung: kurz seitlich ausweichen (Richtung fest pro Versuch)
 if(e.unst>0){e.unst--;lx+=-dy*e.unsd*1.4;ly+=dx*e.unsd*1.4;}
 if(lx||ly){dx+=lx;dy+=ly;const n=Math.sqrt(dx*dx+dy*dy)||1;dx/=n;dy/=n;}
 const s=spd*TICK;e.vx+=(dx*s-e.vx)*STEER*2;e.vy+=(dy*s-e.vy)*STEER*2;const v=Math.sqrt(e.vx*e.vx+e.vy*e.vy);if(v>s){e.vx*=s/v;e.vy*=s/v;}
 if(d<=s&&!(lx||ly)){e.x=gx;e.y=gy;}else{e.x+=e.vx;e.y+=e.vy;}if(Math.abs(e.vx)>.08)e.face=e.vx<0?-1:1;e.mv=true;}
// ---------- Zielwahl ----------
function canHit(st,o){if(o.thrown||o.leap||o.hp<=0||ghost(o)||o.bur)return false;if(st.tg==='bld'&&o.cls==='unit')return false;if(o.air&&st.tg!=='any'&&!(o.gndT>0))return false;return true;}// 0.7: bur = eingegraben, gndT = per Netz zu Boden gezogen
function edge(e,o){return d2(e.x,e.y,o.x,o.y)-e.r-o.r;}
const CLOSE=14;
function inLane(o,l){if(o.cls==='unit')return(o.lane!=null?o.lane:laneOf(o.x))===l;if(o.cls==='tower')return o.lane<0||o.lane===l;return laneOf(o.x)===l;}
function acquire(S,e){const st=e.st,sight=st.sight||st.range+60;let best=null,bd=1e9;
 for(const o of S.ents){if(o.side===e.side||!canHit(st,o))continue;
  const ed=edge(e,o);if(st.tg!=='bld'&&ed>sight)continue;
  if(st.tg!=='bld'&&o.cls==='tower'&&ed>st.range+2)continue;// Türme nur als Lauf-Ziel (unten), nicht per Sicht über die Spur
  let d=e.cls==='unit'?navDist(e,o.x,o.y):ed;if(o.cls==='unit'){d-=8;if(e.cls==='unit'&&S.tc)d+=9*(S.tc[o.id]||0);}if(d<bd){bd=d;best=o;}}
 if(!best&&e.cls==='unit'){// Lauf-Ziel: Wachturm der Spur, sonst Bergfried. Wer (z.B. nach Abfangen) klar auf der anderen Seite steht, nimmt diese Spur.
  if(e.lane==null||Math.abs(e.x-FW/2)>MIDW/2+6)e.lane=laneOf(e.x);const lane=e.lane;let g=tower(S,1-e.side,'guard',lane);if(!alive(g))g=tower(S,1-e.side,'keep');
  if(alive(g))best=g;}
 return best;}
function inRange(e,t){return edge(e,t)<=e.st.range+(e.xr||0)+(t.cls!=='unit'?2:0);}// xr: 'über die Schulter' im Gedränge
function reach(e,t){if(e.lock||e.st.range>MELEE)return inRange(e,t);return edge(e,t)<=CONTACT+(t.cls!=='unit'?2:0);}
// ---------- Angriff ----------
function attack(S,e,t){const st=e.st;e.atk++;e.atkT=S.tick;if(t.x!==e.x)e.face=t.x<e.x?-1:1;const dm=dmul(S,e);
 if(st.bomb){S.bombs.push({side:e.side,x:t.cls==='unit'?t.x:e.x,y:t.cls==='unit'?t.y:e.y+(t.y>e.y?6:-6),t:.45,max:.45,dmg:st.dmg*dm,r:st.splash,tower:1,small:true});ev(S,'drop',{x:e.x,y:e.y});return;}
 if(st.proj){const P=B.projectiles[st.proj];S.proj.push({id:S.nid++,side:e.side,kind:st.proj,x:e.x,y:e.y,z:e.air?34:(e.cls==='tower'?(e.sub==='keep'?70:58):(e.cls==='bld'?50:18)),ox:e.x,oy:e.y,tid:t.id,tx:t.x,ty:t.y,tz:t.air?30:12,spd:P.spd,arc:P.arc||0,dmg:st.dmg*dm,splash:st.splash||0,src:e.card,st,fire:!!(st.fire||st.proj==='fireball'),net:!!(st.net&&(e.atk-1)%st.net.every===0),
  d0:Math.max(1,d2(e.x,e.y,t.x,t.y)),air:t.air});ev(S,'shot',{kind:st.proj,x:e.x,y:e.y,side:e.side});return;}
 e.sw=SWING;e.swT=t.id;}
function strike(S,e,t){const st=e.st;let dmg=st.dmg*dmul(S,e);
 if(e.amb){e.amb=false;dmg+=st.burrow.bonus;if(t.cls==='unit')t.stun=Math.max(t.stun,t.hero?st.burrow.stun*.5:st.burrow.stun);ev(S,'ambush',{x:t.x,y:t.y,side:e.side});}// 0.7 Überraschungsbiss
 hurt(S,t,dmg,e.side);ev(S,'hit',{x:t.x,y:t.y,air:t.air,melee:1,card:e.card,tx:e.x,ty:e.y,id:t.id,dmg});
 if(st.cleave){const C=st.cleave;let n=0;for(const o of S.ents){if(o===t||o.side===e.side||o.cls!=='unit'||o.air||o.hp<=0||o.thrown||o.leap||ghost(o))continue;if(d2(o.x,o.y,t.x,t.y)<=C.r+o.r*.5){hurt(S,o,dmg*C.f,e.side);n++;}}ev(S,'cleave',{x:t.x,y:t.y,r:C.r,n,face:e.face});}
 if(t.thT>S.tick&&t.thF&&e.cls==='unit'&&e.hp>0){hurt(S,e,dmg*t.thF,t.side);ev(S,'thorns',{x:e.x,y:e.y,id:e.id});}// 0.7 Dornenaura
 if(t.cls==='unit'&&!t.air&&t.hp>0&&e.mass>t.mass*1.5&&!ghost(t)){const d=d2(e.x,e.y,t.x,t.y)||1,k=Math.min(7,(1-t.mass/e.mass)*7);const py=t.y;t.x+=(t.x-e.x)/d*k;t.y+=(t.y-e.y)/d*k;fixPos(t,py);ev(S,'knock',{id:t.id,amt:k,x:t.x,y:t.y});}}
function impact(S,p,t){const st=p.st;
 if(p.splash){const sl=st.slow;splashAt(S,p.side,p.tx,p.ty,p.splash,p.dmg,{air:!!p.air,fire:p.fire,each:sl?(o=>{if(o.cls==='unit'&&o.hp>0&&o!==t){o.slowT=Math.max(o.slowT,sl.t);o.slowF=Math.max(o.slowF,sl.f);}}):null});ev(S,'boom',{x:p.tx,y:p.ty,r:p.splash,kind:p.kind,air:p.air});}
 else if(t)hurt(S,t,p.dmg,p.side,p.fire);
 if(st.chain&&t){const C=st.chain,seen=new Set([t.id]),pts=[[t.x,t.y,t.air?1:0]];let cur=t,dmg=p.dmg;// 0.7 Kettenblitz
  for(let i=0;i<C.n;i++){dmg*=C.f;let best=null,bd=1e9;for(const o of S.ents){if(o.side===p.side||o.cls!=='unit'||seen.has(o.id)||!canHit(st,o))continue;const d=d2(o.x,o.y,cur.x,cur.y);if(d<=C.r+o.r&&d<bd){bd=d;best=o;}}
   if(!best)break;seen.add(best.id);hurt(S,best,dmg,p.side);pts.push([best.x,best.y,best.air?1:0]);cur=best;}
  ev(S,'chain',{pts,side:p.side});}
 if(p.net&&t&&t.hp>0&&t.cls==='unit'){snare(S,t,st.net.t);ev(S,'net',{id:t.id,x:t.x,y:t.y,air:t.air});}
 if(t&&t.hp>0&&t.cls==='unit'){if(st.slow){t.slowT=Math.max(t.slowT,st.slow.t);t.slowF=Math.max(t.slowF,st.slow.f);}if(st.dot){t.dot=st.dot.dps;t.dotT=st.dot.t;t.dotSide=p.side;}}
 if(st.puddle){S.zones.push({k:'puddle',side:p.side,x:p.tx,y:p.ty,r:st.puddle.r,t:st.puddle.t,max:st.puddle.t,dps:st.puddle.dps,slow:st.puddle.slow});ev(S,'splash',{x:p.tx,y:p.ty});}
 ev(S,'impact',{x:p.tx,y:p.ty,kind:p.kind,air:p.air,id:t?t.id:0});}
// ---------- Update ----------
function updUnit(S,e){
 if(e.dep>0){e.dep-=TICK;return;}
 if(e.thrown){const T=e.thrown;T.t+=TICK;const k=Math.min(1,T.t/T.max);e.x=T.x0+(T.x1-T.x0)*k;e.y=T.y0+(T.y1-T.y0)*k;if(k>=1){e.thrown=null;ev(S,'land',{x:e.x,y:e.y});fixPos(e,e.y);}return;}
 if(e.leap){const L=e.leap;L.t+=TICK;const k=Math.min(1,L.t/L.max);e.x=L.x0+(L.x1-L.x0)*k;e.y=L.y0+(L.y1-L.y0)*k;
  if(k>=1){e.leap=null;e.lane=laneOf(e.x);const A=CARDS[e.card].abil;splashAt(S,e.side,e.x,e.y,A.r,A.dmg,{tower:.5,stun:A.stun});ev(S,'slam',{x:e.x,y:e.y,r:A.r,side:e.side});fixPos(e,e.y);}return;}
 const st=e.st;e.mv=false;
 if(e.dotT>0){e.dotT-=TICK;hurt(S,e,e.dot*TICK,e.dotSide);}else if(e.burn)e.burn=0;
 if(e.rootT>0)e.rootT-=TICK;if(e.gndT>0)e.gndT-=TICK;if(e.burCd>0)e.burCd-=TICK;
 if(e.slowT>0){e.slowT-=TICK;if(e.slowT<=0)e.slowF=0;}
 if(e.frz>0){e.frz-=TICK;return;}if(e.stun>0){e.stun-=TICK;return;}
 const sm=(e.slowT>0?1-e.slowF:1)*hmul(S,e);
 // 0.7 Auren (Banner: Schaden+Heilung, Dornen: Rückschaden) – alle 0,5 s aufgefrischt
 if((st.aura||st.thorns)&&(S.tick+e.id)%10===0){const A=st.aura,T=st.thorns,r=A?A.r:T.r;for(const o of S.ents){if(o.side!==e.side||o.cls!=='unit'||o.hp<=0||ghost(o)||d2(o.x,o.y,e.x,e.y)>r)continue;
   if(A){o.auraF=Math.max(o.auraT>S.tick?o.auraF:0,A.dmg);o.auraT=S.tick+12;if(o.hp<o.maxhp)o.hp=Math.min(o.maxhp,o.hp+A.hps*.5);}if(T){o.thF=T.f;o.thT=S.tick+12;}}}
 // 0.7 Schreckensschrei: Bodentruppen in der Nähe fliehen kurz
 if(st.fear){e.fearCd-=TICK;if(e.fearCd<=0){let n=0;for(const o of S.ents)if(o.side!==e.side&&o.cls==='unit'&&!o.air&&!o.bur&&o.hp>0&&!ghost(o)&&!o.thrown&&!o.leap&&d2(o.x,o.y,e.x,e.y)<=st.fear.r){scare(S,o,e,st.fear.t);n++;}
   if(n){e.fearCd=st.fear.every;ev(S,'fear',{x:e.x,y:e.y,r:st.fear.r,side:e.side});}else e.fearCd=.3;}}
 // 0.7 Furcht: weg von der Quelle laufen (nur diesseits des Flusses), nicht angreifen
 if(e.fearT>0){e.fearT-=TICK;e.lock=false;e.tgt=0;e.sw=0;if(e.rootT>0){e.vx*=.5;e.vy*=.5;return;}const fx=e.x-e.fearX,fy=e.y-e.fearY,fd=Math.sqrt(fx*fx+fy*fy)||1;let tx=e.x+fx/fd*30,ty=e.y+fy/fd*30;
  const up=e.y>MIDY;ty=up?Math.max(ty,RY1+6):Math.min(ty,RY0-6);tx=clamp(tx,10,FW-10);moveTo(S,e,tx,ty,st.spd*sm*1.1,false,0);fixPos(e,e.oy);return;}
 if(st.heal){e.healT=(e.healT||0)-TICK;if(e.healT<=0){e.healT=1;let n=0;for(const o of S.ents)if(o.side===e.side&&o.cls==='unit'&&o.hp>0&&o.hp<o.maxhp&&d2(o.x,o.y,e.x,e.y)<=st.heal.r){o.hp=Math.min(o.maxhp,o.hp+st.heal.hps);n++;}if(n)ev(S,'heal',{x:e.x,y:e.y,r:st.heal.r});}}
 // laufender Schlag: Treffer im Schlag-Frame
 if(e.sw>0){e.sw--;if(e.sw===0){const tt=byId(S,e.swT);if(tt&&canHit(st,tt)&&inRange(e,tt))strike(S,e,tt);}return;}
 // 0.6 Zielerfassung: ungebunden wird jeden Tick neu gewählt (sofortiges Abdrehen); nach Kontakt LOCKED bis Ziel tot ist
 let t=byId(S,e.tgt);if(t&&!canHit(st,t))t=null;
 // 0.7-Fix: wer > 1 s am Brückenkopf einem (z. B. eingefrorenen) Gegner auf der Brücke Vorfahrt lässt, greift ihn an, statt ewig zu warten
 if(!e.lock&&e.yT>20&&e.yld){const o=byId(S,e.yld);if(o&&canHit(st,o)){t=o;e.tgt=o.id;e.lock=true;}e.yT=0;}
 if(t&&e.lock&&t.cls==='unit'&&edge(e,t)>(st.sight||st.range+60)+20)t=null;
 if(!t)e.lock=false;
 if(!e.lock){e.xr=0;const n=acquire(S,e);t=n;e.tgt=t?t.id:0;}
 if(!t){e.vx*=.5;e.vy*=.5;return;}
 if(reach(e,t)){if(e.bur){e.bur=false;e.amb=true;e.burCd=st.burrow.cd;ev(S,'unburrow',{x:e.x,y:e.y,id:e.id});}e.lock=true;e.inr=S.tick;e.vx*=.3;e.vy*=.3;if(t.x!==e.x)e.face=t.x<e.x?-1:1;e.cd-=TICK*sm;if(e.cd<=0){attack(S,e,t);e.cd=st.hit;}}
 else{// Ausholzeit nur nach echtem Laufen – nicht, wenn das Ziel gerade knapp aus der Reichweite driftet (sonst nie ein Schuss)
  e.cd=S.tick-(e.inr??-99)<=10?e.cd-TICK:Math.max(e.cd-TICK,st.hit*.35);
  if(st.burrow&&!e.bur&&!(e.burCd>0)&&!e.lock){e.bur=true;e.amb=false;ev(S,'burrow',{x:e.x,y:e.y,id:e.id});}// 0.7 Eingraben beim Laufen
  if(e.rootT>0){e.vx=0;e.vy=0;e.pt=0;e.px=e.x;e.py=e.y;return;}// 0.7 Netz/Wurzeln: steht still
  moveTo(S,e,t.x,t.y,st.spd*sm*(e.sf||1),t.cls!=='tower',t.id);fixPos(e,e.oy);
  // 0.6.1 Stau-Erkennung: kaum Fortschritt über 0,75 s -> Nahkämpfer in Waffenreichweite schlagen zu, sonst Ausweichmanöver
  if(++e.pt>=15){const mv=d2(e.x,e.y,e.px,e.py);e.px=e.x;e.py=e.y;e.pt=0;
   if(mv<st.spd*sm*.75*.25){e.stk++;if(st.range<=MELEE&&edge(e,t)<=st.range+e.r+(t.cls!=='unit'?2:0)){e.lock=true;e.xr=e.r;e.stk=0;}
    else if(e.stk>=2){e.unst=18;e.stk=0;e.unsd=((e.id+(S.tick/15|0))%2)?1:-1;// Seite weg vom nächsten Blockierer, sonst abwechselnd
     let bd=1e9;for(const o of S.ents){if(o===e||o.cls!=='unit'||o.air!==e.air||o.hp<=0)continue;const ax=o.x-e.x,ay=o.y-e.y,dd=Math.sqrt(ax*ax+ay*ay);if(dd<e.r+o.r+4&&dd<bd&&(ax*(e.gdx||0)+ay*(e.gdy||0))>0){bd=dd;const cr=ax*(e.gdy||0)-ay*(e.gdx||0);if(Math.abs(cr)>.5)e.unsd=cr>0?1:-1;}}}}else e.stk=0;}}}
function updStatic(S,e){// Türme & Gebäude
 if(e.dep>0){e.dep-=TICK;return;}
 const fr=e.frz>0;if(fr)e.frz-=TICK;
 if(e.cls==='bld'){e.hp-=e.maxhp/e.life*TICK;if(e.hp<=0){e.hp=0;e.expired=true;return;}
  const b=e.st;if(b.spawn){e.tmr-=TICK;if(e.tmr<=0&&!fr){e.tmr=b.spawn.every;e.atkT=S.tick;e.atk++;const fwd=e.side===0?-1:1;
    let lx=e.x,ly=e.y+fwd*b.spawn.throw;ly=e.side===0?Math.min(ly,RY0-26):Math.max(ly,RY1+26);
    const u=spawnUnit(S,e.side,b.spawn.card,e.x,e.y-(e.side===0?6:-6),0,laneOf(e.x));u.thrown={t:0,max:1.1,x0:e.x,y0:e.y,x1:lx,y1:ly};ev(S,'throw',{x:e.x,y:e.y,side:e.side});}}
  if(b.mana){e.tmr-=TICK;if(e.tmr<=0){e.tmr=b.mana.every;const p=S.p[e.side];p.mana=Math.min(MAXM,p.mana+b.mana.amt);ev(S,'mana',{x:e.x,y:e.y,side:e.side});}}
  if(!b.dmg)return;}
 if(e.cls==='tower'&&!e.active)return;
 if(fr)return;
 const st=e.st;let t=byId(S,e.tgt);
 if(!t||!canHit(st,t)||edge(e,t)>st.range){t=null;let bd=1e9;for(const o of S.ents){if(o.side===e.side||o.cls!=='unit'||!canHit(st,o))continue;const d=edge(e,o);if(d<=st.range&&d<bd){bd=d;t=o;}}e.tgt=t?t.id:0;}
 e.cd-=TICK;if(t&&e.cd<=0){attack(S,e,t);e.cd=st.hit;}else if(!t)e.cd=Math.max(e.cd,0);}
function updProj(S){const keep=[];for(const p of S.proj){p.ox=p.x;p.oy=p.y;const t=byId(S,p.tid);if(t&&!t.thrown&&!t.leap){p.tx=t.x;p.ty=t.y;}
  const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.sqrt(dx*dx+dy*dy),s=p.spd*TICK;
  if(d<=s+2){p.x=p.tx;p.y=p.ty;impact(S,p,t&&!t.thrown&&!t.leap?t:null);}else{p.x+=dx/d*s;p.y+=dy/d*s;keep.push(p);}}S.proj=keep;}
function updZones(S){const keep=[];for(const z of S.zones){z.t-=TICK;
  if(z.k==='roots'){if(z.t>0)keep.push(z);continue;}
  if(z.k==='chant'){for(const e of S.ents){if(e.side!==z.side||e.cls!=='unit'||e.hp<=0||ghost(e))continue;if(d2(e.x,e.y,z.x,z.y)<=z.r+e.r*.5){setBuf(S,e,z.buff,.15);setHaste(S,e,z.haste,.15);}}if(z.t>0)keep.push(z);continue;}
  if(z.k==='firerain'){if(z.t<=0){splashAt(S,z.side,z.x,z.y,z.r,z.dmg,{tower:z.tower,fire:true});ev(S,'fireboom',{x:z.x,y:z.y,r:z.r});continue;}keep.push(z);continue;}
  for(const e of S.ents){if(e.side===z.side||e.cls!=='unit'||e.hp<=0||e.thrown||e.leap||ghost(e))continue;if(e.air&&!z.air)continue;if(d2(e.x,e.y,z.x,z.y)<=z.r+e.r*.5){hurt(S,e,z.dps*TICK,z.side);e.slowT=Math.max(e.slowT,.3);e.slowF=Math.max(e.slowF,z.slow);}}
  if(z.t>0)keep.push(z);}S.zones=keep;}
function updBombs(S){const keep=[];for(const b of S.bombs){b.t-=TICK;if(b.t<=0){splashAt(S,b.side,b.x,b.y,b.r,b.dmg,{air:false,tower:b.tower,knock:b.knock});ev(S,'bomb',{x:b.x,y:b.y,r:b.r,big:!!b.big});}else keep.push(b);}S.bombs=keep;}
function separate(S){for(let it=0;it<4;it++)separate1(S);}
function separate1(S){const U=[];for(const e of S.ents)if(e.cls==='unit'&&e.hp>0&&!e.thrown&&!e.leap)U.push(e);
 // Einheiten, die an einem Turm/Gebäude anliegen, gelten als 'eingeklemmt' (sehr schwer) -> Gedränge löst sich nach außen auf
 for(const e of U){e.wall=1;if(!e.air)for(const o of S.ents){if((o.cls!=='tower'&&o.cls!=='bld')||o.hp<=0)continue;if(d2(e.x,e.y,o.x,o.y)<e.r+o.r*.85+.6){e.wall=30;break;}}}
 for(let i=0;i<U.length;i++){const a=U[i];for(let j=i+1;j<U.length;j++){const b=U[j];if(a.air!==b.air||a.bur||b.bur)continue;let dx=b.x-a.x,dy=b.y-a.y;const m=a.r+b.r;if(dx>m||dx<-m||dy>m||dy<-m)continue;
   let d=Math.sqrt(dx*dx+dy*dy);if(d>=m)continue;if(d<1e-4){dx=((a.id+b.id)%2?1:-1)*.01;dy=.01;d=Math.sqrt(dx*dx+dy*dy);}
   if(a.side===b.side&&!a.air&&a.y>RY0-6&&a.y<RY1+6&&b.y>RY0-6&&b.y<RY1+6&&d>=m*.8)continue;const ma=a.mass*a.wall,mb=b.mass*b.wall,o=(m-d)*.5,wa=mb/(ma+mb),wb=1-wa;a.x-=dx/d*o*wa;a.y-=dy/d*o*wa;b.x+=dx/d*o*wb;b.y+=dy/d*o*wb;}}
 for(const e of U){if(!e.air)for(const o of S.ents){if((o.cls!=='tower'&&o.cls!=='bld')||o.hp<=0)continue;const dx=e.x-o.x,dy=e.y-o.y,m=e.r+o.r*.85,d=Math.sqrt(dx*dx+dy*dy);if(d<m&&d>1e-4){e.x=o.x+dx/d*m;e.y=o.y+dy/d*m;}}fixPos(e,e.oy);}}
function cleanup(S){const keep=[];for(const e of S.ents){if(e.hp>0){keep.push(e);continue;}onDeath(S,e);}S.ents=keep;}
function onDeath(S,e){const C=CARDS[e.card];
 if(e.cls==='tower'){const o=S.p[1-e.side];if(e.sub==='keep')o.crowns=3;else{o.crowns=Math.min(3,o.crowns+1);const k=tower(S,e.side,'keep');if(k)k.active=true;}ev(S,'tower',{side:e.side,sub:e.sub,x:e.x,y:e.y});
  if(e.sub==='keep')end(S,1-e.side,'Bergfried zerstört');else if(S.phase==='sudden')end(S,1-e.side,'Sudden Death');return;}
 ev(S,'death',{x:e.x,y:e.y,card:e.card,air:e.air,cls:e.cls,side:e.side,big:e.maxhp>=1000});
 if(e.hero){const p=S.p[e.side];if(p.heroId===e.id){p.heroId=0;p.heroCharge=0;}}
 const dd=C&&C.u&&C.u.death;if(dd&&!e.expired)S.bombs.push({side:e.side,x:e.x,y:e.y,t:dd.fuse,max:dd.fuse,dmg:dd.dmg,r:dd.r,knock:dd.knock||0,big:!!dd.big,tower:1});}
function end(S,w,why){if(S.over)return;S.over=true;S.phase='over';S.winner=w;S.reason=why;ev(S,'end',{winner:w,reason:why});}
function minTowerHp(S,side){let m=1e9;for(const e of S.ents)if(e.cls==='tower'&&e.side===side&&e.hp>0)m=Math.min(m,e.hp);return m===1e9?0:m;}
function step(S){if(S.over)return;S.ev.length=0;
 for(const e of S.ents){e.ox=e.x;e.oy=e.y;}
 if(S.queue.length){const due=[],rest=[];for(const c of S.queue)(c.tick<=S.tick?due:rest).push(c);S.queue=rest;for(const c of due)exec(S,c);}
 if(S.phase==='count'){S.countT-=TICK;if(S.countT<=1e-9){S.phase='play';ev(S,'start');}S.tick++;S.t+=TICK;return;}
 if(S.phase==='play'){S.matchT-=TICK;if(!S.dbl&&S.matchT<=DOUBLE+1e-9){S.dbl=true;ev(S,'double');}
  if(S.matchT<=1e-9){S.matchT=0;const a=S.p[0].crowns,b=S.p[1].crowns;if(a!==b)end(S,a>b?0:1,'Zeit abgelaufen');else{S.phase='sudden';ev(S,'sudden');}}}
 else if(S.phase==='sudden'){S.suddenT-=TICK;if(S.suddenT<=1e-9){S.suddenT=0;const a=minTowerHp(S,0),b=minTowerHp(S,1);end(S,a===b?-1:(a>b?0:1),'Turm-Lebenspunkte');}}
 if(S.over){S.tick++;return;}
 const rate=TICK/(S.dbl||S.phase==='sudden'?REGEN/2:REGEN);
 for(const p of S.p){const m=p.mana+rate*p.regen;if(m>MAXM)p.leak+=m-MAXM;p.mana=Math.min(MAXM,m);const h=p.heroId&&byId(S,p.heroId);if(h&&p.heroCharge<1)p.heroCharge=Math.min(1,p.heroCharge+TICK/CARDS[h.card].abil.charge);}
 const list=S.ents.slice();S.tc={};for(const e of list)if(e.cls==='unit'&&e.tgt&&e.hp>0)S.tc[e.tgt]=(S.tc[e.tgt]||0)+1;
 for(const e of list){if(e.hp<=0)continue;if(e.cls==='unit')updUnit(S,e);else updStatic(S,e);}
 updProj(S);updZones(S);updBombs(S);separate(S);cleanup(S);
 S.tick++;S.t+=TICK;}
function hash(S){let h=2166136261;const mix=v=>{h^=(v|0);h=Math.imul(h,16777619);};mix(S.tick);for(const e of S.ents){mix(e.id);mix(Math.round(e.x*100));mix(Math.round(e.y*100));mix(Math.round(e.hp*10));}for(const p of S.p){mix(Math.round(p.mana*1000));mix(p.crowns);}return(h>>>0).toString(16);}
return{DEP,CONTACT,MELEE,SWING,laneOf,LANE_X,MIDW,inMid,splitCount,midLane,TICK,FW,FH,RY0,RY1,MIDY,BRIDGES,BW,MATCH,DOUBLE,SUDDEN,CARDS,B,create,step,dmul,issue,canPlay,validateDeck,zoneOK,hash,byId,tower,inRiver,onBridge,d2,clamp,rnd};
})();
if(typeof module!=='undefined')module.exports=DuellSim;
