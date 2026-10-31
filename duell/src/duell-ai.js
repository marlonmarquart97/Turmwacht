// ===== Turmwacht Duell – Computergegner =====
// Liest nur den Spielzustand und erzeugt Befehle wie ein Spieler (gleiche Regeln, gleiche Mana-Regeln).
const DuellAI=(()=>{
const Sim=(typeof DuellSim!=='undefined')?DuellSim:require('./duell-sim.js');
const{CARDS,FW,FH,MIDY,RY0,RY1,BRIDGES,d2,clamp}=Sim;
const PROFILES={
 grimm:{name:'Grimmzahn',react:1.6,think:.7,pushAt:9.5,smart:.3,jitter:45,spellMin:3,abil:.45,well:.15,split:.1,mid:.2},
 morvath:{name:'Morvath',react:.6,think:.3,pushAt:8,smart:.85,jitter:12,spellMin:2,abil:1,well:.6,split:.3,mid:.45},
 // 0.7: neue Bosse – eigene Taktik über zusätzliche Parameter (chant = Kriegsgesang beim Angriff, air = Flieger als Angriffsspitze, hold = Mana-Reserve für Konter)
 ugrak:{name:'Ugrak',react:.65,think:.35,pushAt:7.5,smart:.72,jitter:16,spellMin:2,abil:1,well:0,split:.4,mid:.55,chant:1},
 sylvara:{name:'Sylvara',react:.45,think:.3,pushAt:9.5,smart:.88,jitter:10,spellMin:2,abil:1,well:0,split:.2,mid:.3,hold:1},
 vyrthax:{name:'Vyrthax',react:.35,think:.25,pushAt:8,smart:.95,jitter:6,spellMin:2,abil:1,well:0,split:.3,mid:.4,air:1,chant:1},
 // 0.8: Kapitel 6–8 (rush = schnelle Reiter-Wellen, drill = Tunnelbohrer bevorzugt, graves = Friedhof beim Druck)
 kargash:{name:'Kargash',react:.32,think:.22,pushAt:7,smart:.93,jitter:7,spellMin:2,abil:1,well:0,split:.45,mid:.5,chant:1,rush:1},
 zarvok:{name:'Zarvok',react:.3,think:.2,pushAt:7.5,smart:.96,jitter:5,spellMin:2,abil:1,well:0,split:.35,mid:.4,drill:.8,chant:1},
 aldric:{name:'Aldric',react:.28,think:.2,pushAt:8,smart:.97,jitter:4,spellMin:2,abil:1,well:0,split:.3,mid:.4,graves:.7,chant:1},
 bot:{name:'Autopilot',react:.35,think:.25,pushAt:8,smart:.95,jitter:6,spellMin:2,abil:1,well:.5,split:.25,mid:.4}};
// Spurgrenzen für die KI-Platzierung (ohne Mittelzone, die ist fürs bewusste Aufteilen reserviert)
const HM=Sim.MIDW/2+3,LXA=[[12,FW/2-HM],[FW/2+HM,FW-12]];
function create(profile,side,seed){return{P:typeof profile==='string'?PROFILES[profile]:profile,side,seen:{},next:0,rs:(seed|0)||99,push:null};}
function R(ai){let a=ai.rs=(ai.rs+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
const isTank=id=>{const C=CARDS[id];return C.u&&(C.u.hp>=1000)&&C.u.range<40;};
const isSwarm=id=>{const C=CARDS[id];return C.type==='unit'&&(C.count||1)>=3;};
const isRanged=id=>{const C=CARDS[id];return C.u&&C.u.range>=60;};
const hitsAir=id=>{const C=CARDS[id];if(C.type==='spell')return true;const s=C.u||C.b;return s&&s.tg==='any'&&(s.dmg||0)>0;};
const splashy=id=>['firemage','alch','firerain','poisonhero','storm','troll','trollking','whelp','frostwyrm','dragonlord','warlockhero','plague','lightning'].includes(id);
const isBuff=id=>{const C=CARDS[id];return C.type==='spell'&&C.s&&(C.s.buff||C.s.ward||C.s.hps);};
const isTun=id=>{const C=CARDS[id];return !!(C.u&&C.u.tunnel);};
const OFFS=['quake','graves'];// 0.8: reine Angriffszauber
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
 const lanes=[0,1].map(l=>{const T=thr.filter(e=>Sim.laneOf(e.x)===l);if(!T.length)return null;let hp=0,air=0,small=0,tank=null,lead=T[0],cx=0,cy=0,d=0;
  for(const e of T){hp+=e.hp;if(e.air)air+=e.hp;if(e.maxhp<300)small++;if(!tank||e.hp>tank.hp)tank=e;const dd=side===0?e.y:FH-e.y;if(dd>(side===0?lead.y:FH-lead.y))lead=e;cx+=e.x;cy+=e.y;d+=dps(e);}
  let def=0;for(const o of S.ents)if(o.side===side&&o.cls==='unit'&&o.hp>0&&d2(o.x,o.y,cx/T.length,cy/T.length)<140)def+=o.hp*.5+dps(o)*8;
  return{l,T,hp,air,small,tank,lead,cx:cx/T.length,cy:cy/T.length,dps:d,def,need:hp+d*6-def-(my(lead.y)?500:250)};}).filter(Boolean).sort((a,b)=>b.need-a.need);
 const hand=me.hand.map((id,i)=>({id,i,C:CARDS[id]})).filter(o=>o.C.cost<=me.mana+1e-9&&Sim.canPlay(S,side,o.i,FW/2,toMy(560))!=='Dein Held kämpft bereits');
 const tryPlay=(o,x,y,ln,mid)=>{if(ln==null)ln=Sim.laneOf(x);const LX=mid||o.C.type==='spell'?[12,FW-12]:LXA[ln];if(mid)x=FW/2+(ln?4:-4);x=clamp(x,LX[0],LX[1]);y=clamp(y,12,FH-12);for(let k=0;k<6;k++){if(!Sim.canPlay(S,side,o.i,x,y))return{a:'play',side,i:o.i,x,y};y-=fwd*14;if(!Sim.zoneOK(S,side,x,y)&&o.C.type!=='spell')y=clamp(side===0?Math.max(y,RY1+8):Math.min(y,RY0-8),12,FH-12);if(!mid)x=clamp(x+(ln?-8:8),LX[0],LX[1]);}return null;};
 const canSplit=o=>(o.C.count||1)>1&&o.C.type!=='spell';
 const jit=()=>(R(ai)*2-1)*P.jitter;
 // --- Verteidigung ---
 const L=lanes[0];
 if(L&&L.need>0){
  // Zauber auf Gruppen
  for(const o of hand){if(o.C.type!=='spell'||isBuff(o.id)||OFFS.includes(o.id))continue;
   if(o.id==='lightning'){const b=strongAt(S,L.T,o.C.s.r,o.C.s.n,o.C.s.dmg);if(b&&b.val>=520){const c=tryPlay(o,b.x,b.y);if(c)return c;}continue;}
   const best=clusterAt(S,side,L.T,o.C.s.r);if(!best)continue;
   const val=(o.id==='firerain'||o.id==='plague')?best.val:(L.hp>1400&&my(L.lead.y)?best.val*.7:0);if(best.n>=P.spellMin&&val>=420+o.C.cost*40){const c=tryPlay(o,best.x,best.y);if(c)return c;}}
  let best=null,bs=-1e9;
  for(const o of hand){if(o.C.type==='spell')continue;let s=0;const C=o.C,u=C.u;
   if(L.air>L.hp*.6&&!hitsAir(o.id))continue;
   if(L.air>0&&hitsAir(o.id))s+=2+L.air/500;
   if(L.small>=3&&splashy(o.id))s+=3;
   if(L.small>=3&&isSwarm(o.id))s+=1;
   if(L.tank&&L.tank.maxhp>=1000){if(isSwarm(o.id)&&!o.C.air)s+=2.2;if(u&&dps({st:u})*(C.count||1)>110)s+=1.2;if(o.id==='ranger')s+=2;}
   if(isRanged(o.id))s+=.8;if(C.type==='hero')s+=1.2;if(o.id==='well'||o.id==='sling')s-=6;
   if(C.u&&C.u.tg==='bld')s-=4;if(isTun(o.id))s-=1.5;
   s-=C.cost*.25;s+=(R(ai)*2-1)*(1-P.smart)*3;if(s>bs){bs=s;best=o;}}
  if(best&&bs>-2){const C=best.C;// 0.6: Deploy-Zeit (1 s) einrechnen -> Abfangpunkt dort, wo der Gegner nach dem Materialisieren steht
   const lead={x:L.lead.x,y:L.lead.y-fwd*(L.lead.st.spd||20)*Sim.DEP*(1+.3*P.smart)};let x=lead.x+jit()*.6,y;
   if(C.type==='bld'){x=FW/2+(L.l?30:-30);y=toMy(430);}
   else if(my(lead.y)){y=lead.y-fwd*(isRanged(best.id)?85:35);}
   else y=bankY-fwd*(isRanged(best.id)?90:30);
   y+=jit()*.5;const both=lanes.length>1&&lanes[1].need>0,midT=Math.abs(L.lead.x-FW/2)<Sim.MIDW*.8;
   if(canSplit(best)&&(both||midT)&&R(ai)<P.smart+.1){const c=tryPlay(best,FW/2,y,L.l,true);if(c){if(!ai.push)ai.push={l:L.l,t:S.tick,counter:true};return c;}}
   const c=tryPlay(best,x,y,C.type==='bld'?null:L.l);if(c){if(!ai.push)ai.push={l:L.l,t:S.tick,counter:true};return c;}}
  if(L.need>800)return null;}
 // --- 0.7 Kriegsgesang auf eigene Gruppe im Kampf ---
 for(const ch of hand){if(!isBuff(ch.id)||!(P.chant||P.smart>.9))continue;const mine=S.ents.filter(e=>e.side===side&&e.cls==='unit'&&e.hp>0&&e.dep<=0&&!e.tun);
  const fight=b=>S.ents.some(e=>e.side!==side&&e.hp>0&&e.cls!=='bld'&&!e.bur&&!e.tun&&d2(e.x,e.y,b.x,b.y)<ch.C.s.r+70);
  if(ch.C.s.hps){const b=hurtAt(mine,ch.C.s.r);if(b&&b.val>=420&&fight(b)){const c=tryPlay(ch,b.x,b.y);if(c)return c;}continue;}
  const b=clusterAt(S,side,mine,ch.C.s.r);
  if(b&&b.n>=(ch.C.s.ward?2:3)&&b.val>=(ch.C.s.ward?600:700)&&fight(b)){const c=tryPlay(ch,b.x,b.y);if(c)return c;}}
 // --- Angriff / Druck ---
 const myTanks=S.ents.filter(e=>e.side===side&&e.cls==='unit'&&e.hp>0&&isTank(e.card));
 if(ai.push&&S.tick-ai.push.t>Math.round(14/Sim.TICK))ai.push=null;
 if(ai.push){// Unterstützung hinter dem Tank
  const t=myTanks.find(e=>e.lane===ai.push.l)||myTanks[0];
  if(t&&(side===0?t.y<470:t.y>FH-470)){let best=null;for(const o of hand){if(o.C.type==='bld'||isTank(o.id))continue;if(o.C.type==='spell')continue;if(!best||(isRanged(o.id)&&!isRanged(best.id))||(o.id==='banner'&&best.id!=='banner'))best=o;}
   if(best&&me.mana>=best.C.cost+(P.smart>.5?0:1)){const c=tryPlay(best,t.x+jit()*.4,t.y-fwd*45,t.lane);if(c)return c;}}
  // 0.8 Friedhof hinter den Tank an den Turm
  {const gv=hand.find(o=>o.id==='graves');if(gv&&t){const g=Sim.tower(S,1-side,'guard',t.lane),k=Sim.tower(S,1-side,'keep'),T=g&&g.hp>0?g:k;if(T&&d2(t.x,t.y,T.x,T.y)<130){const c=tryPlay(gv,T.x+(T.x<FW/2?16:-16),T.y-fwd*6);if(c)return c;}}}
  // Zauber auf Verteidiger am Turm
  for(const o of hand){if(o.C.type!=='spell'||!['firerain','plague','lightning'].includes(o.id))continue;const foes=S.ents.filter(e=>e.side!==side&&e.cls==='unit'&&e.hp>0&&!my(e.y));const b=clusterAt(S,side,foes,o.C.s.r,true);if(b&&b.n>=P.spellMin&&b.val>=(o.id==='firerain'?380:440)){const c=tryPlay(o,b.x,b.y);if(c)return c;}}}
 // 0.8 Erdbeben: auf Gebäude bzw. auf den Turm, an dem eigene Truppen kämpfen
 {const q=hand.find(o=>o.id==='quake');if(q){for(const e of S.ents){if(e.side===side||e.hp<=0||(e.cls!=='tower'&&e.cls!=='bld'))continue;if(e.cls==='tower'&&!e.active&&e.sub==='keep')continue;
   const own=S.ents.filter(o=>o.side===side&&o.cls==='unit'&&o.hp>0&&o.tgt===e.id&&d2(o.x,o.y,e.x,e.y)<e.r+40).length;
   if((e.cls==='bld'&&e.hp>=320)||(e.cls==='tower'&&own>=1&&e.hp>=200)||(e.cls==='tower'&&e.hp<=190)){const c=tryPlay(q,e.x,e.y);if(c)return c;}}}}
 // Zauber zum Turm-Abschluss
 for(const o of hand){if(o.id!=='firerain'&&o.id!=='lightning')continue;for(const e of S.ents)if(e.cls==='tower'&&e.side!==side&&e.hp>0&&e.hp<=o.C.s.dmg*o.C.s.tower*1.05&&(S.matchT<60||S.phase==='sudden'||e.hp<90)){const c=tryPlay(o,e.x,e.y);if(c)return c;}}
 const pushAt=(S.dbl||S.phase==='sudden')?Math.min(P.pushAt,7):P.pushAt;
 if(P.hold&&thr.length&&me.mana<9.7)return null;// Sylvara: spart bei Bedrohung Mana für den Konter
 if(me.mana>=pushAt||me.mana>=9.7){
  // Brunnen bei Ruhe
  const well=hand.find(o=>o.id==='well');if(well&&!thr.length&&R(ai)<P.well&&!S.ents.some(e=>e.side===side&&e.card==='well')){const c=tryPlay(well,FW/2+(R(ai)<.5?-60:60),toMy(612));if(c)return c;}
  const lane=chooseLane(S,side,ai);const lx=BRIDGES[lane];
  {const gv=hand.find(o=>o.id==='graves');if(gv&&(R(ai)<(P.graves||.45)||me.mana>=9.7)){const g=Sim.tower(S,1-side,'guard',lane),k=Sim.tower(S,1-side,'keep'),T=g&&g.hp>0?g:k;if(T){const c=tryPlay(gv,T.x+(T.x<FW/2?16:-16),T.y-fwd*6);if(c)return c;}}}
  const airT=hand.find(o=>o.C.air&&o.C.cost>=5);
  const tank=(P.air&&airT)||hand.find(o=>isTank(o.id)&&!o.C.air)||hand.find(o=>o.id==='zepp')||airT;
  if(tank){ai.push={l:lane,t:S.tick};const c=tryPlay(tank,tank.C.type==='hero'?lx:(lx*.55+FW/2*.45),tank.C.type==='hero'?bankY-fwd*60:backY-fwd*10);if(c)return c;}
  // 0.8 Tunnelbohrer hinter den Turm, Gräber öffnen auf den Turm
  const dr=hand.find(o=>isTun(o.id));if(dr&&R(ai)<(P.drill||.55)){const c=tunnelPlay(S,side,dr,lane,fwd);if(c)return c;}
  const sl=hand.find(o=>o.id==='sling');if(sl&&R(ai)<.6){const c=tryPlay(sl,FW/2+(lane?40:-40),toMy(420));if(c)return c;}
  // sonst günstigste sinnvolle Einheit an die Brücke
  const opts=hand.filter(o=>(o.C.type==='unit'||o.C.type==='hero')&&!isTun(o.id)).sort((a,b)=>a.C.cost-b.C.cost);
  if(P.rush){const rr=hand.find(o=>o.C.u&&o.C.u.charge&&o.C.type==='unit');if(rr&&R(ai)<.6){ai.push={l:lane,t:S.tick};const c=tryPlay(rr,lx+jit()*.4,bankY-fwd*40);if(c)return c;}}
  const pick=opts.find(o=>isSwarm(o.id))||opts.find(o=>o.C.type==='hero')||opts[0];
  if(pick&&canSplit(pick)&&!myTanks.length&&R(ai)<(P.mid||0)){const c=tryPlay(pick,FW/2,isRanged(pick.id)?bankY-fwd*70:bankY-fwd*24,lane,true);if(c)return c;}
  const split=myTanks.length&&R(ai)<(P.split||0),pl=split?1-lane:lane,plx=BRIDGES[pl];
  if(pick){if(!split)ai.push={l:lane,t:S.tick};const c=tryPlay(pick,plx+jit()*.4,isRanged(pick.id)?bankY-fwd*70:bankY-fwd*10);if(c)return c;}
  if(me.mana>=9.9){const dr2=hand.find(o=>isTun(o.id));if(dr2){const c=tunnelPlay(S,side,dr2,lane,fwd);if(c)return c;}const any=hand.find(o=>o.C.type!=='spell');if(any){const c=tryPlay(any,lx,toMy(600));if(c)return c;}}}
 return null;}
function chooseLane(S,side,ai){const g0=Sim.tower(S,1-side,'guard',0),g1=Sim.tower(S,1-side,'guard',1);
 const v=l=>{const g=l?g1:g0;let s=g&&g.hp>0?g.hp/g.maxhp:-.5;for(const e of S.ents)if(e.cls==='unit'&&e.lane===l)s+=(e.side!==side?1:-.6)*e.hp/3000;return s;};
 if(ai.push&&ai.push.counter)return ai.push.l;
 const a=v(0),b=v(1);if(Math.abs(a-b)<.08)return R(ai)<.5?0:1;return a<b?0:1;}
function clusterAt(S,side,list,r,incTower){let best=null;for(const c of list){let n=0,val=0,sx=0,sy=0;for(const e of list){if(d2(e.x,e.y,c.x,c.y)<=r*.9){n++;val+=Math.min(e.hp,360);sx+=e.x;sy+=e.y;}}
  if(incTower)for(const e of S.ents)if(e.cls==='tower'&&e.side!==side&&e.hp>0&&d2(e.x,e.y,sx/n,sy/n)<=r)val+=120;
  if(!best||val>best.val)best={n,val,x:sx/n,y:sy/n};}return best;}
function tunnelPlay(S,side,o,lane,fwd){const g=Sim.tower(S,1-side,'guard',lane),k=Sim.tower(S,1-side,'keep'),T=g&&g.hp>0?g:k;if(!T)return null;
 const sx=T.x<FW/2?1:-1,c=[[T.x,T.y+fwd*(T.r+40)],[T.x+sx*(T.r+40),T.y],[T.x,T.y-fwd*(T.r+40)]];
 for(const[x,y]of c){const X=clamp(x,14,FW-14),Y=clamp(y,26,FH-26);if(!Sim.canPlay(S,side,o.i,X,Y))return{a:'play',side,i:o.i,x:X,y:Y};}return null;}
function strongAt(S,list,r,n,dmg){let best=null;for(const c of list){const g=list.filter(e=>d2(e.x,e.y,c.x,c.y)<=r*.85).sort((a,b)=>b.hp-a.hp).slice(0,n);let val=0;for(const e of g)val+=Math.min(e.hp,dmg)+(e.maxhp>=1000?60:0);if(!best||val>best.val)best={val,x:c.x,y:c.y};}return best;}
function hurtAt(list,r){let best=null;for(const c of list){let n=0,val=0,sx=0,sy=0;for(const e of list)if(d2(e.x,e.y,c.x,c.y)<=r*.9){n++;val+=Math.min(330,e.maxhp-e.hp);sx+=e.x;sy+=e.y;}if(!best||val>best.val)best={n,val,x:sx/n,y:sy/n};}return best;}
function abilTarget(S,ai,h){const A=CARDS[h.card].abil,side=ai.side;
 const foes=S.ents.filter(e=>e.side!==side&&e.cls==='unit'&&e.hp>0&&!e.thrown);
 if(A.key==='roar'){let n=0,hp=0,own=0;for(const e of foes)if(d2(e.x,e.y,h.x,h.y)<=A.r){n++;hp+=e.hp;}for(const e of S.ents)if(e.side===side&&e.cls==='unit'&&e.hp>0&&d2(e.x,e.y,h.x,h.y)<=A.r)own++;return(n>=2&&own>=2)||hp>=1100||(n>=1&&own>=4)?{a:'abil',side,x:h.x,y:h.y}:null;}
 if(A.key==='nova'){let n=0,hp=0;for(const e of foes)if(d2(e.x,e.y,h.x,h.y)<=A.r){n++;hp+=e.hp;}return(n>=2||hp>=900)?{a:'abil',side,x:h.x,y:h.y}:null;}
 if(A.key==='howl'){let n=0;for(const e of foes)if(d2(e.x,e.y,h.x,h.y)<=A.r+30)n++;return(n>=1||(side===0?h.y<MIDY+20:h.y>MIDY-20))?{a:'abil',side,x:h.x,y:h.y}:null;}
 if(A.key==='drain'){let n=0,hp=0;for(const e of foes)if(d2(e.x,e.y,h.x,h.y)<=A.r){n++;hp+=Math.min(e.hp,A.dmg);}return(n>=2||hp>=300||(n>=1&&h.hp<h.maxhp*.5))?{a:'abil',side,x:h.x,y:h.y}:null;}
 const near=foes.filter(e=>d2(e.x,e.y,h.x,h.y)<=(A.reach||0)+20);
 if(A.key==='infernal'){const b=clusterAt(S,side,near,A.r);if(b&&(b.n>=2||b.val>=300))return{a:'abil',side,x:b.x,y:b.y};
  for(const e of S.ents)if(e.cls==='tower'&&e.side!==side&&e.hp>0&&d2(e.x,e.y,h.x,h.y)<=A.reach+10)return{a:'abil',side,x:e.x,y:e.y};return null;}
 if(A.key==='summon'){if(near.length||(side===0?h.y<MIDY+40:h.y>MIDY-40)){const t=near[0]||{x:h.x,y:h.y+(side===0?-60:60)};return{a:'abil',side,x:(t.x+h.x)/2,y:(t.y+h.y)/2};}return null;}
 const r=A.r||50,b=clusterAt(S,side,near,r);
 if(b&&(b.n>=2||b.val>=300))return{a:'abil',side,x:b.x,y:b.y};
 if(A.key==='leap'){const t=near.find(e=>e.card==='firemage'||CARDS[e.card].type==='hero'||e.card==='shaman');if(t)return{a:'abil',side,x:t.x,y:t.y};}
 return null;}
return{PROFILES,create,think};
})();
if(typeof module!=='undefined')module.exports=DuellAI;
