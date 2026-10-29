// ===== Turmwacht Duell – deterministische Spiellogik =====
// Fester Tick (20/s), eigener Zufallsgenerator im Zustand, keine DOM-/Render-Abhängigkeit.
// Eingaben nur über Befehle {tick, side, a:'play'|'abil', i, card, x, y} -> für späteren Online-Lockstep geeignet.
const DuellSim=(()=>{
const B=(typeof TW_BESTIARY!=='undefined')?TW_BESTIARY:require('./shared/tw-bestiary.js');
const CARDS=B.cards,TICK=1/20,FW=360,FH=640,RY0=306,RY1=334,MIDY=320,BRIDGES=[70,290],BW=42;
const MATCH=180,DOUBLE=60,SUDDEN=60,COUNT=3,REGEN=2.8,MAXM=10;
const TPOS=[{sub:'guard',lane:0,x:70,y:508},{sub:'guard',lane:1,x:290,y:508},{sub:'keep',lane:-1,x:180,y:590}];
const FORM={1:[[0,0]],2:[[-11,0],[11,0]],3:[[0,-10],[-12,8],[12,8]],4:[[-11,-11],[11,-11],[-11,11],[11,11]],5:[[0,0],[-16,-9],[16,-9],[-16,10],[16,10]]};
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
function addEnt(S,o){const e=Object.assign({id:S.nid++,ox:o.x,oy:o.y,tgt:0,cd:0,frz:0,stun:0,slowT:0,slowF:0,dot:0,dotT:0,dep:0,face:o.side?1:-1,atk:0,atkT:-99,air:false,mass:1,retg:0,lock:false,born:S.tick},o);S.ents.push(e);return e;}
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
const laneOf=x=>x<FW/2?0:1,LANE_X=[[8,FW/2-7],[FW/2+7,FW-8]];
function laneClamp(x,l){return clamp(x,LANE_X[l][0],LANE_X[l][1]);}
function deploy(S,side,id,x,y){const C=CARDS[id];
 if(C.type==='spell'){castSpell(S,side,id,x,y);return;}
 if(C.type==='bld'){const b=C.b;addEnt(S,{side,cls:'bld',card:id,x,y,r:b.r,hp:b.hp,maxhp:b.hp,st:b,dep:1,life:b.life,tmr:b.spawn?b.spawn.every*.5:(b.mana?b.mana.every:0),mass:1e9});return;}
 const f=FORM[C.count||1]||FORM[1],ln=laneOf(x);
 for(const[dx,dy]of f){const e=spawnUnit(S,side,id,laneClamp(x+dx,ln),y+(side?-dy:dy),.9,ln);if(C.type==='hero'){S.p[side].heroId=e.id;S.p[side].heroCharge=.4;e.hero=true;}}}
function spawnUnit(S,side,id,x,y,dep,lane){const C=CARDS[id],u=C.u;if(!C.air&&inRiver(x,y))y=(side===0)?RY1+3:RY0-3;
 if(lane==null)lane=laneOf(x);x=laneClamp(x,lane);
 return addEnt(S,{side,cls:'unit',card:id,lane,x,y,r:u.r,hp:u.hp,maxhp:u.hp,st:u,air:!!C.air,mass:u.mass||1,dep:dep==null?.9:dep});}
// ---------- Zauber & Fähigkeiten ----------
function enemiesIn(S,side,x,y,r,o){o=o||{};const out=[];for(const e of S.ents){if(e.side===side||e.hp<=0||e.thrown||e.leap)continue;if(o.noAir&&e.air)continue;if(o.unitsOnly&&e.cls!=='unit')continue;if(d2(e.x,e.y,x,y)<=r+e.r*.5)out.push(e);}return out;}
function castSpell(S,side,id,x,y){const s=CARDS[id].s;
 if(id==='firerain'){S.zones.push({k:'firerain',side,x,y,r:s.r,t:s.delay,max:s.delay,dmg:s.dmg,tower:s.tower});ev(S,'firerain',{side,x,y,r:s.r});}
 else if(id==='frost'){for(const e of enemiesIn(S,side,x,y,s.r)){hurt(S,e,e.cls==='unit'?s.dmg:s.dmg*s.tower,side);e.frz=Math.max(e.frz,s.freeze);}ev(S,'frost',{side,x,y,r:s.r});}}
function ability(S,side,x,y){const p=S.p[side],h=byId(S,p.heroId);if(!h||p.heroCharge<1||h.leap||h.dep>0||h.frz>0||h.stun>0)return false;const A=CARDS[h.card].abil;
 let tx=x,ty=y;if(A.reach){const d=d2(h.x,h.y,x,y);if(d>A.reach){tx=h.x+(x-h.x)*A.reach/d;ty=h.y+(y-h.y)*A.reach/d;}}
 tx=clamp(tx,8,FW-8);ty=clamp(ty,8,FH-8);
 if(A.key==='leap'){if(inRiver(tx,ty)&&!onBridge(tx))ty=(ty>MIDY)?RY1+4:RY0-4;h.leap={t:0,max:.5,x0:h.x,y0:h.y,x1:tx,y1:ty};h.tgt=0;h.lock=false;ev(S,'leap',{side,x:tx,y:ty});}
 else if(A.key==='nova'){for(const e of enemiesIn(S,side,h.x,h.y,A.r)){hurt(S,e,e.cls==='unit'?A.dmg:A.dmg*.4,side);e.frz=Math.max(e.frz,e.cls==='tower'?A.freeze*.5:A.freeze);}ev(S,'nova',{side,x:h.x,y:h.y,r:A.r});}
 else if(A.key==='cloud'){S.zones.push({k:'cloud',side,x:tx,y:ty,r:A.r,t:A.t,max:A.t,dps:A.dps,slow:A.slow,air:true});ev(S,'cloud',{side,x:tx,y:ty,r:A.r});}
 else if(A.key==='summon'){if(inRiver(tx,ty))ty=(ty>MIDY)?RY1+4:RY0-4;const f=FORM[4];for(const[dx,dy]of f)spawnUnit(S,side,A.summon.card,tx+dx*1.3,ty+dy*1.3,.35,laneOf(tx));ev(S,'summon',{side,x:tx,y:ty});}
 p.heroCharge=0;ev(S,'abil',{side,key:A.key,hero:h.card});return true;}
// ---------- Schaden ----------
function hurt(S,e,amt,srcSide){if(!e||e.hp<=0||amt<=0)return;e.hp-=amt;e.hurtT=S.tick;
 if(e.cls==='tower'){S.stats[srcSide===0?0:1].dmgTower+=amt;if(e.sub==='keep')e.active=true;}
 if(e.hp<=0){e.hp=0;}}
function splashAt(S,side,x,y,r,dmg,o){o=o||{};let n=0;for(const e of S.ents){if(e.side===side||e.hp<=0||e.thrown||e.leap)continue;if(o.air===false&&e.air)continue;if(o.air===true&&!e.air)continue;
  if(d2(e.x,e.y,x,y)<=r+e.r*.6){hurt(S,e,e.cls==='unit'?dmg:dmg*(o.tower==null?1:o.tower),side);n++;
   if(o.knock&&e.cls==='unit'&&!e.air){const d=d2(e.x,e.y,x,y)||1;const k=o.knock*(1-Math.min(1,d/(r*1.2)))+o.knock*.4;e.x+=(e.x-x)/d*k;e.y+=(e.y-y)/d*k;e.stun=Math.max(e.stun,.5);fixPos(e,e.oy);}
   if(o.stun)e.stun=Math.max(e.stun,o.stun);}}return n;}
// ---------- Wegfindung ----------
function onBridge(x){for(const bx of BRIDGES)if(Math.abs(x-bx)<=BW/2)return bx;return null;}
function needCross(y1,y2){return(y1>MIDY)!==(y2>MIDY);}
function pickBridge(x1,x2){let best=BRIDGES[0],bd=1e9;for(const bx of BRIDGES){const d=Math.abs(x1-bx)+Math.abs(x2-bx);if(d<bd){bd=d;best=bx;}}return best;}
function laneBridge(e,x){return e.lane!=null?BRIDGES[e.lane]:pickBridge(e.x,x);}
function navDist(e,x,y){if(e.air||!needCross(e.y,y))return d2(e.x,e.y,x,y);const bx=laneBridge(e,x);return d2(e.x,e.y,bx,MIDY)+d2(bx,MIDY,x,y);}
function fixPos(e,prevY){e.x=e.lane!=null?laneClamp(e.x,e.lane):clamp(e.x,5,FW-5);e.y=clamp(e.y,5,FH-5);if(e.air)return;
 if(e.y>RY0&&e.y<RY1){const bx=onBridge(e.x);if(bx!=null)e.x=clamp(e.x,bx-BW/2+3,bx+BW/2-3);else e.y=(prevY>MIDY)?RY1:RY0;}}
function moveTo(e,tx,ty,spd){let gx=tx,gy=ty;
 if(!e.air&&needCross(e.y,ty)){const bx=laneBridge(e,tx);
  if(Math.abs(e.x-bx)>7&&!(e.y>RY0-1&&e.y<RY1+1)){gx=bx;gy=e.y>MIDY?RY1+6:RY0-6;}else{gx=bx;gy=e.y>MIDY?RY0-8:RY1+8;}}
 const dx=gx-e.x,dy=gy-e.y,d=Math.sqrt(dx*dx+dy*dy),s=spd*TICK;
 if(d<=s){e.x=gx;e.y=gy;}else{e.x+=dx/d*s;e.y+=dy/d*s;}if(Math.abs(dx)>.5)e.face=dx<0?-1:1;e.mv=true;}
// ---------- Zielwahl ----------
function canHit(st,o){if(o.thrown||o.leap||o.hp<=0)return false;if(st.tg==='bld'&&o.cls==='unit')return false;if(o.air&&st.tg!=='any')return false;return true;}
function edge(e,o){return d2(e.x,e.y,o.x,o.y)-e.r-o.r;}
const CLOSE=14;
function inLane(o,l){if(o.cls==='unit')return(o.lane!=null?o.lane:laneOf(o.x))===l;if(o.cls==='tower')return o.lane<0||o.lane===l;return laneOf(o.x)===l;}
function acquire(S,e){const st=e.st,sight=st.sight||st.range+60;let best=null,bd=1e9;
 for(const o of S.ents){if(o.side===e.side||!canHit(st,o))continue;
  const ed=edge(e,o);if(st.tg!=='bld'&&ed>sight)continue;
  if(e.lane!=null&&!inLane(o,e.lane)&&!(ed<=CLOSE&&st.tg!=='bld'))continue;// Spurtreue: fremde Spur nur im Nahkontakt
  let d=e.cls==='unit'?navDist(e,o.x,o.y):ed;if(o.cls==='unit')d-=8;if(d<bd){bd=d;best=o;}}
 if(!best&&e.cls==='unit'){// Lane-Ziel: Wachturm der eigenen Seite des Feldes, sonst Bergfried
  const lane=e.lane!=null?e.lane:laneOf(e.x);let g=tower(S,1-e.side,'guard',lane);if(!alive(g))g=tower(S,1-e.side,'keep');
  if(alive(g))best=g;}
 return best;}
function inRange(e,t){return edge(e,t)<=e.st.range+(t.cls!=='unit'?2:0);}
// ---------- Angriff ----------
function attack(S,e,t){const st=e.st;e.atk++;e.atkT=S.tick;if(t.x!==e.x)e.face=t.x<e.x?-1:1;
 if(st.bomb){S.bombs.push({side:e.side,x:t.cls==='unit'?t.x:e.x,y:t.cls==='unit'?t.y:e.y+(t.y>e.y?6:-6),t:.45,max:.45,dmg:st.dmg,r:st.splash,tower:1,small:true});ev(S,'drop',{x:e.x,y:e.y});return;}
 if(st.proj){const P=B.projectiles[st.proj];S.proj.push({id:S.nid++,side:e.side,kind:st.proj,x:e.x,y:e.y,z:e.air?34:(e.cls==='tower'?(e.sub==='keep'?70:58):(e.cls==='bld'?50:18)),ox:e.x,oy:e.y,tid:t.id,tx:t.x,ty:t.y,tz:t.air?30:12,spd:P.spd,arc:P.arc||0,dmg:st.dmg,splash:st.splash||0,src:e.card,st,
  d0:Math.max(1,d2(e.x,e.y,t.x,t.y)),air:t.air});ev(S,'shot',{kind:st.proj,x:e.x,y:e.y,side:e.side});return;}
 hurt(S,t,st.dmg,e.side);ev(S,'hit',{x:t.x,y:t.y,air:t.air,melee:1,card:e.card,tx:e.x,ty:e.y,id:t.id,dmg:st.dmg});}
function impact(S,p,t){const st=p.st;
 if(p.splash){splashAt(S,p.side,p.tx,p.ty,p.splash,p.dmg,{air:!!p.air});ev(S,'boom',{x:p.tx,y:p.ty,r:p.splash,kind:p.kind,air:p.air});}
 else if(t)hurt(S,t,p.dmg,p.side);
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
 if(e.dotT>0){e.dotT-=TICK;hurt(S,e,e.dot*TICK,e.dotSide);}
 if(e.slowT>0){e.slowT-=TICK;if(e.slowT<=0)e.slowF=0;}
 if(e.frz>0){e.frz-=TICK;return;}if(e.stun>0){e.stun-=TICK;return;}
 const sm=e.slowT>0?1-e.slowF:1;
 if(st.heal){e.healT=(e.healT||0)-TICK;if(e.healT<=0){e.healT=1;let n=0;for(const o of S.ents)if(o.side===e.side&&o.cls==='unit'&&o.hp>0&&o.hp<o.maxhp&&d2(o.x,o.y,e.x,e.y)<=st.heal.r){o.hp=Math.min(o.maxhp,o.hp+st.heal.hps);n++;}if(n)ev(S,'heal',{x:e.x,y:e.y,r:st.heal.r});}}
 let t=byId(S,e.tgt);if(t&&!canHit(st,t))t=null;
 e.retg-=TICK;
 if(!t||(!e.lock&&e.retg<=0)||(e.lock&&!inRange(e,t))){const n=acquire(S,e);if(n!==t){t=n;e.lock=false;}e.tgt=t?t.id:0;e.retg=.4;}
 if(!t)return;
 if(inRange(e,t)){e.lock=true;e.cd-=TICK*sm;if(e.cd<=0){attack(S,e,t);e.cd=st.hit;}}
 else{e.lock=false;e.cd=Math.max(e.cd-TICK,st.hit*.35);moveTo(e,t.x,t.y,st.spd*sm);fixPos(e,e.oy);}}
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
  if(z.k==='firerain'){if(z.t<=0){splashAt(S,z.side,z.x,z.y,z.r,z.dmg,{tower:z.tower});ev(S,'fireboom',{x:z.x,y:z.y,r:z.r});continue;}keep.push(z);continue;}
  for(const e of S.ents){if(e.side===z.side||e.cls!=='unit'||e.hp<=0||e.thrown||e.leap)continue;if(e.air&&!z.air)continue;if(d2(e.x,e.y,z.x,z.y)<=z.r+e.r*.5){hurt(S,e,z.dps*TICK,z.side);e.slowT=Math.max(e.slowT,.3);e.slowF=Math.max(e.slowF,z.slow);}}
  if(z.t>0)keep.push(z);}S.zones=keep;}
function updBombs(S){const keep=[];for(const b of S.bombs){b.t-=TICK;if(b.t<=0){splashAt(S,b.side,b.x,b.y,b.r,b.dmg,{air:false,tower:b.tower,knock:b.knock});ev(S,'bomb',{x:b.x,y:b.y,r:b.r,big:!!b.big});}else keep.push(b);}S.bombs=keep;}
function separate(S){const U=[];for(const e of S.ents)if(e.cls==='unit'&&e.hp>0&&!e.thrown&&!e.leap)U.push(e);
 for(let i=0;i<U.length;i++){const a=U[i];for(let j=i+1;j<U.length;j++){const b=U[j];if(a.air!==b.air)continue;let dx=b.x-a.x,dy=b.y-a.y;const m=a.r+b.r;if(dx>m||dx<-m||dy>m||dy<-m)continue;
   let d=Math.sqrt(dx*dx+dy*dy);if(d>=m)continue;if(d<1e-4){dx=((a.id+b.id)%2?1:-1)*.01;dy=.01;d=Math.sqrt(dx*dx+dy*dy);}
   const o=(m-d)*.5,wa=b.mass/(a.mass+b.mass),wb=1-wa;a.x-=dx/d*o*wa;a.y-=dy/d*o*wa;b.x+=dx/d*o*wb;b.y+=dy/d*o*wb;}}
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
 const list=S.ents.slice();
 for(const e of list){if(e.hp<=0)continue;if(e.cls==='unit')updUnit(S,e);else updStatic(S,e);}
 updProj(S);updZones(S);updBombs(S);separate(S);cleanup(S);
 S.tick++;S.t+=TICK;}
function hash(S){let h=2166136261;const mix=v=>{h^=(v|0);h=Math.imul(h,16777619);};mix(S.tick);for(const e of S.ents){mix(e.id);mix(Math.round(e.x*100));mix(Math.round(e.y*100));mix(Math.round(e.hp*10));}for(const p of S.p){mix(Math.round(p.mana*1000));mix(p.crowns);}return(h>>>0).toString(16);}
return{laneOf,LANE_X,TICK,FW,FH,RY0,RY1,MIDY,BRIDGES,BW,MATCH,DOUBLE,SUDDEN,CARDS,B,create,step,issue,canPlay,validateDeck,zoneOK,hash,byId,tower,inRiver,onBridge,d2,clamp,rnd};
})();
if(typeof module!=='undefined')module.exports=DuellSim;
