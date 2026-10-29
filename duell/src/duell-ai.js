// ===== Turmwacht Duell – Computergegner =====
// Liest nur den Spielzustand und erzeugt Befehle wie ein Spieler (gleiche Regeln, gleiche Mana-Regeln).
const DuellAI=(()=>{
const Sim=(typeof DuellSim!=='undefined')?DuellSim:require('./duell-sim.js');
const{CARDS,FW,FH,MIDY,RY0,RY1,BRIDGES,d2,clamp}=Sim;
const PROFILES={
 grimm:{name:'Grimmzahn',react:1.6,think:.7,pushAt:9.5,smart:.3,jitter:45,spellMin:3,abil:.45,well:.15},
 morvath:{name:'Morvath',react:.6,think:.3,pushAt:8,smart:.85,jitter:12,spellMin:2,abil:1,well:.6},
 bot:{name:'Autopilot',react:.35,think:.25,pushAt:8,smart:.95,jitter:6,spellMin:2,abil:1,well:.5}};
function create(profile,side,seed){return{P:typeof profile==='string'?PROFILES[profile]:profile,side,seen:{},next:0,rs:(seed|0)||99,push:null};}
function R(ai){let a=ai.rs=(ai.rs+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
const isTank=id=>{const C=CARDS[id];return C.u&&(C.u.hp>=1000)&&C.u.range<40;};
const isSwarm=id=>{const C=CARDS[id];return C.type==='unit'&&(C.count||1)>=3;};
const isRanged=id=>{const C=CARDS[id];return C.u&&C.u.range>=60;};
const hitsAir=id=>{const C=CARDS[id];if(C.type==='spell')return true;const s=C.u||C.b;return s&&s.tg==='any'&&(s.dmg||0)>0;};
const splashy=id=>['firemage','alch','firerain','poisonhero'].includes(id);
function dps(e){const s=e.st;return s&&s.dmg?s.dmg/(s.hit||1):0;}
function think(ai,S){if(S.over||S.phase==='count')return null;if(S.tick<ai.next)return null;ai.next=S.tick+Math.max(1,Math.round(ai.P.think/Sim.TICK));
 const side=ai.side,me=S.p[side],P=ai.P,fwd=side===0?-1:1,my=y=>side===0?y>MIDY:y<MIDY;
 const bankY=side===0?RY1+14:RY0-14,backY=side===0?612:28,toMy=v=>side===0?v:FH-v;
 // --- Fähigkeit des Helden ---
 const h=Sim.byId(S,me.heroId);
 if(h&&me.heroCharge>=1&&!h.leap&&h.dep<=0&&R(ai)<P.abil){const c=abilTarget(S,ai,h);if(c)return c;}
 // --- Bedrohungen erkennen (mit Reaktionszeit) ---
 const thr=[];
 for(const e of S.ents){if(e.side===side||e.cls!=='unit'||e.hp<=0)continue;const depth=side===0?e.y-(MIDY-70):(MIDY+70)-e.y;if(depth<0)continue;
  if(ai.seen[e.id]==null)ai.seen[e.id]=S.tick;if((S.tick-ai.seen[e.id])*Sim.TICK<P.react)continue;thr.push(e);}
 const lanes=[0,1].map(l=>{const T=thr.filter(e=>(e.x<FW/2?0:1)===l);if(!T.length)return null;let hp=0,air=0,small=0,tank=null,lead=T[0],cx=0,cy=0,d=0;
  for(const e of T){hp+=e.hp;if(e.air)air+=e.hp;if(e.maxhp<300)small++;if(!tank||e.hp>tank.hp)tank=e;const dd=side===0?e.y:FH-e.y;if(dd>(side===0?lead.y:FH-lead.y))lead=e;cx+=e.x;cy+=e.y;d+=dps(e);}
  let def=0;for(const o of S.ents)if(o.side===side&&o.cls==='unit'&&o.hp>0&&d2(o.x,o.y,cx/T.length,cy/T.length)<140)def+=o.hp*.5+dps(o)*8;
  return{l,T,hp,air,small,tank,lead,cx:cx/T.length,cy:cy/T.length,dps:d,def,need:hp+d*6-def-(my(lead.y)?500:250)};}).filter(Boolean).sort((a,b)=>b.need-a.need);
 const hand=me.hand.map((id,i)=>({id,i,C:CARDS[id]})).filter(o=>o.C.cost<=me.mana+1e-9&&Sim.canPlay(S,side,o.i,FW/2,toMy(560))!=='Dein Held kämpft bereits');
 const tryPlay=(o,x,y)=>{x=clamp(x,12,FW-12);y=clamp(y,12,FH-12);for(let k=0;k<6;k++){if(!Sim.canPlay(S,side,o.i,x,y))return{a:'play',side,i:o.i,x,y};y-=fwd*14;if(!Sim.zoneOK(S,side,x,y)&&o.C.type!=='spell')y=clamp(side===0?Math.max(y,RY1+8):Math.min(y,RY0-8),12,FH-12);x+=(x<FW/2?8:-8);}return null;};
 const jit=()=>(R(ai)*2-1)*P.jitter;
 // --- Verteidigung ---
 const L=lanes[0];
 if(L&&L.need>0){
  // Zauber auf Gruppen
  for(const o of hand){if(o.C.type!=='spell')continue;const best=clusterAt(S,side,L.T,o.C.s.r);if(!best)continue;
   const val=o.id==='firerain'?best.val:(L.hp>1400&&my(L.lead.y)?best.val*.7:0);if(best.n>=P.spellMin&&val>=420+o.C.cost*40){const c=tryPlay(o,best.x,best.y);if(c)return c;}}
  let best=null,bs=-1e9;
  for(const o of hand){if(o.C.type==='spell')continue;let s=0;const C=o.C,u=C.u;
   if(L.air>L.hp*.6&&!hitsAir(o.id))continue;
   if(L.air>0&&hitsAir(o.id))s+=2+L.air/500;
   if(L.small>=3&&splashy(o.id))s+=3;
   if(L.small>=3&&isSwarm(o.id))s+=1;
   if(L.tank&&L.tank.maxhp>=1000){if(isSwarm(o.id)&&!o.C.air)s+=2.2;if(u&&dps({st:u})*(C.count||1)>110)s+=1.2;if(o.id==='ranger')s+=2;}
   if(isRanged(o.id))s+=.8;if(C.type==='hero')s+=1.2;if(o.id==='well'||o.id==='sling')s-=6;
   if(C.u&&C.u.tg==='bld')s-=4;
   s-=C.cost*.25;s+=(R(ai)*2-1)*(1-P.smart)*3;if(s>bs){bs=s;best=o;}}
  if(best&&bs>-2){const C=best.C;let x=L.lead.x+jit()*.6,y;
   if(C.type==='bld'){x=FW/2+(L.l?30:-30);y=toMy(430);}
   else if(my(L.lead.y)){y=L.lead.y-fwd*(isRanged(best.id)?85:35);}
   else y=bankY-fwd*(isRanged(best.id)?90:30);
   y+=jit()*.5;const c=tryPlay(best,x,y);if(c){if(!ai.push)ai.push={l:L.l,t:S.tick,counter:true};return c;}}
  if(L.need>800)return null;}
 // --- Angriff / Druck ---
 const myTanks=S.ents.filter(e=>e.side===side&&e.cls==='unit'&&e.hp>0&&isTank(e.card));
 if(ai.push&&S.tick-ai.push.t>Math.round(14/Sim.TICK))ai.push=null;
 if(ai.push){// Unterstützung hinter dem Tank
  const t=myTanks.find(e=>(e.x<FW/2?0:1)===ai.push.l)||myTanks[0];
  if(t&&(side===0?t.y<470:t.y>FH-470)){let best=null;for(const o of hand){if(o.C.type==='bld'||isTank(o.id))continue;if(o.C.type==='spell')continue;if(!best||(isRanged(o.id)&&!isRanged(best.id)))best=o;}
   if(best&&me.mana>=best.C.cost+(P.smart>.5?0:1)){const c=tryPlay(best,t.x+jit()*.4,t.y-fwd*45);if(c)return c;}}
  // Zauber auf Verteidiger am Turm
  for(const o of hand){if(o.C.type!=='spell'||o.id!=='firerain')continue;const foes=S.ents.filter(e=>e.side!==side&&e.cls==='unit'&&e.hp>0&&!my(e.y));const b=clusterAt(S,side,foes,o.C.s.r,true);if(b&&b.n>=P.spellMin&&b.val>=380){const c=tryPlay(o,b.x,b.y);if(c)return c;}}}
 // Zauber zum Turm-Abschluss
 for(const o of hand){if(o.id!=='firerain')continue;for(const e of S.ents)if(e.cls==='tower'&&e.side!==side&&e.hp>0&&e.hp<=o.C.s.dmg*o.C.s.tower*1.05&&(S.matchT<60||S.phase==='sudden'||e.hp<90)){const c=tryPlay(o,e.x,e.y);if(c)return c;}}
 const pushAt=(S.dbl||S.phase==='sudden')?Math.min(P.pushAt,7):P.pushAt;
 if(me.mana>=pushAt||me.mana>=9.7){
  // Brunnen bei Ruhe
  const well=hand.find(o=>o.id==='well');if(well&&!thr.length&&R(ai)<P.well&&!S.ents.some(e=>e.side===side&&e.card==='well')){const c=tryPlay(well,FW/2+(R(ai)<.5?-60:60),toMy(612));if(c)return c;}
  const lane=chooseLane(S,side,ai);const lx=BRIDGES[lane];
  const tank=hand.find(o=>isTank(o.id)&&!o.C.air)||hand.find(o=>o.id==='zepp');
  if(tank){ai.push={l:lane,t:S.tick};const c=tryPlay(tank,tank.C.type==='hero'?lx:(lx*.55+FW/2*.45),tank.C.type==='hero'?bankY-fwd*60:backY-fwd*10);if(c)return c;}
  const sl=hand.find(o=>o.id==='sling');if(sl&&R(ai)<.6){const c=tryPlay(sl,FW/2+(lane?40:-40),toMy(420));if(c)return c;}
  // sonst günstigste sinnvolle Einheit an die Brücke
  const opts=hand.filter(o=>o.C.type==='unit'||o.C.type==='hero').sort((a,b)=>a.C.cost-b.C.cost);
  const pick=opts.find(o=>isSwarm(o.id))||opts.find(o=>o.C.type==='hero')||opts[0];
  if(pick){ai.push={l:lane,t:S.tick};const c=tryPlay(pick,lx+jit()*.4,isRanged(pick.id)?bankY-fwd*70:bankY-fwd*10);if(c)return c;}
  if(me.mana>=9.9){const any=hand.find(o=>o.C.type!=='spell');if(any){const c=tryPlay(any,lx,toMy(600));if(c)return c;}}}
 return null;}
function chooseLane(S,side,ai){const g0=Sim.tower(S,1-side,'guard',0),g1=Sim.tower(S,1-side,'guard',1);
 const v=l=>{const g=l?g1:g0;let s=g&&g.hp>0?g.hp/g.maxhp:-.5;for(const e of S.ents)if(e.side!==side&&e.cls==='unit'&&(e.x<FW/2?0:1)===l)s+=e.hp/3000;return s;};
 if(ai.push&&ai.push.counter)return ai.push.l;
 const a=v(0),b=v(1);if(Math.abs(a-b)<.08)return R(ai)<.5?0:1;return a<b?0:1;}
function clusterAt(S,side,list,r,incTower){let best=null;for(const c of list){let n=0,val=0,sx=0,sy=0;for(const e of list){if(d2(e.x,e.y,c.x,c.y)<=r*.9){n++;val+=Math.min(e.hp,360);sx+=e.x;sy+=e.y;}}
  if(incTower)for(const e of S.ents)if(e.cls==='tower'&&e.side!==side&&e.hp>0&&d2(e.x,e.y,sx/n,sy/n)<=r)val+=120;
  if(!best||val>best.val)best={n,val,x:sx/n,y:sy/n};}return best;}
function abilTarget(S,ai,h){const A=CARDS[h.card].abil,side=ai.side;
 const foes=S.ents.filter(e=>e.side!==side&&e.cls==='unit'&&e.hp>0&&!e.thrown);
 if(A.key==='nova'){let n=0,hp=0;for(const e of foes)if(d2(e.x,e.y,h.x,h.y)<=A.r){n++;hp+=e.hp;}return(n>=2||hp>=900)?{a:'abil',side,x:h.x,y:h.y}:null;}
 const near=foes.filter(e=>d2(e.x,e.y,h.x,h.y)<=A.reach+20);
 if(A.key==='summon'){if(near.length||(side===0?h.y<MIDY+40:h.y>MIDY-40)){const t=near[0]||{x:h.x,y:h.y+(side===0?-60:60)};return{a:'abil',side,x:(t.x+h.x)/2,y:(t.y+h.y)/2};}return null;}
 const r=A.r||50,b=clusterAt(S,side,near,r);
 if(b&&(b.n>=2||b.val>=300))return{a:'abil',side,x:b.x,y:b.y};
 if(A.key==='leap'){const t=near.find(e=>e.card==='firemage'||CARDS[e.card].type==='hero'||e.card==='shaman');if(t)return{a:'abil',side,x:t.x,y:t.y};}
 return null;}
return{PROFILES,create,think};
})();
if(typeof module!=='undefined')module.exports=DuellAI;
