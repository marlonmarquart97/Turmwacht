// ===== Turmwacht Duell – Bedienung, Menüs, Spielschleife =====
(()=>{
const Sim=DuellSim,CARDS=Sim.CARDS,B=TW_BESTIARY;
const $=id=>document.getElementById(id);
const el=(t,cls,html)=>{const e=document.createElement(t);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ---------- Speicher ----------
function loadDeck(){const d=LS.get('duell_deck',null);return(d&&!Sim.validateDeck(d)&&d.every(id=>B.playerSet.includes(id)))?d:B.defaultDeck.slice();}
function saveDeck(d){LS.set('duell_deck',d);}
function prog(){const p=LS.get('duell_progress',null);return p&&Array.isArray(p.won)?p:{won:[]};}
function unlocked(id){return id===1||prog().won.includes(id-1);}
function markWon(id){const p=prog();const fresh=!p.won.includes(id);if(fresh)p.won.push(id);LS.set('duell_progress',p);return fresh;}
// ---------- Zustand ----------
const G={S:null,ai:null,auto:null,mode:null,scen:null,opp:null,paused:true,acc:0,last:0,sel:null,drag:null,aim:false,endShown:false,speed:1,deck:loadDeck(),toastT:0};
window.DUELL=G;
// ---------- Audio ----------
let audioOn=false;function audio(){if(!audioOn){audioOn=true;try{SFX.init();}catch(e){}}try{SFX.resume();}catch(e){}}
function sfxEvents(evs){if(!audioOn)return;for(const e of evs){try{switch(e.k){
 case 'shot':if(e.kind==='arrow'||e.kind==='tarrow')SFX.shot('archer');else if(e.kind==='fireball')SFX.shot('mage');else SFX.shot('alch');break;
 case 'hit':SFX.hit();break;case 'boom':SFX.boom();break;case 'splash':SFX.splash();break;
 case 'firerain':SFX.cast('fire');break;case 'fireboom':SFX.boom();break;case 'frost':SFX.cast('frost');break;
 case 'nova':SFX.hero('frost');break;case 'leap':SFX.hero('blade');break;case 'slam':SFX.slam();break;case 'cloud':SFX.hero('poison');break;
 case 'summon':SFX.bones();break;case 'bomb':SFX.bomb(e.big);break;case 'drop':SFX.drop();break;case 'throw':SFX.shot('catapult');break;case 'land':SFX.grunt();break;
 case 'death':if(e.cls==='unit'&&/skel|giant|lich/.test(e.card))SFX.bones();else if(e.big)SFX.death(false);break;
 case 'tower':SFX.bomb(true);setTimeout(()=>{try{SFX.horn();}catch(_){}},400);break;
 case 'play':if(e.side===0&&/orcs|giant|ogre/.test(e.card))SFX.grunt();break;
 case 'start':SFX.horn();break;case 'double':SFX.level();break;case 'sudden':SFX.boss();break;
 case 'mana':if(e.side===0)SFX.drop();break;}}catch(_){}}}
// ---------- Bildschirme ----------
const ov=$('ov');
function show(html,cls){ov.className='ov show '+(cls||'');ov.innerHTML=html;ov.scrollTop=0;}
function hide(){ov.className='ov';ov.innerHTML='';}
function cardHTML(id,o){o=o||{};const C=CARDS[id];const t=C.type;
 return `<div class="cd t-${t}${o.cls?' '+o.cls:''}" data-id="${id}"${o.i!=null?` data-i="${o.i}"`:''}><img src="${DR.icon(C.art==='fire'?'firerain':C.art,64)}" alt=""><b class="cost">${C.cost}</b>${C.count>1?`<i class="cnt">×${C.count}</i>`:''}${t==='hero'?'<i class="hb">Held</i>':''}<span>${esc(C.name)}</span></div>`;}
function soundRow(){const tr=SFX.track;return `<div class="row snd"><span>Musik:</span><button class="sm${tr==='tavern'?' on':''}" data-trk="tavern">🍺 Taverne</button><button class="sm${tr==='calm'?' on':''}" data-trk="calm">🔥 Kaminfeuer</button></div>
 <div class="row snd"><button class="sm${SFX.on.music?' on':''}" data-tog="music">${SFX.on.music?'🎵 Musik an':'🔇 Musik aus'}</button><button class="sm${SFX.on.sfx?' on':''}" data-tog="sfx">${SFX.on.sfx?'🔊 Effekte an':'🔈 Effekte aus'}</button></div>`;}
function bindSound(root,re){root.querySelectorAll('[data-trk]').forEach(b=>b.onclick=()=>{audio();SFX.setTrack(b.dataset.trk);re();});
 root.querySelectorAll('[data-tog]').forEach(b=>b.onclick=()=>{audio();SFX.toggle(b.dataset.tog);hudBtns();re();});}
function menu(){G.paused=true;$('app').classList.add('inmenu');
 show(`<div class="box menu"><div class="logo"><img src="${DR.icon('keep0',96)}" alt=""><div><h1>Turmwacht Duell</h1><p class="sub">Kartenduell am Schattenpass</p></div></div>
  <button class="big" id="bCamp">⚔️ Kampagne</button><button class="big" id="bFree">🎲 Freies Gefecht</button><button class="big" id="bDeck">🃏 Deck bearbeiten</button>
  ${soundRow()}<p class="foot">Offline-Testversion 0.2 · Fortschritt wird im Browser gespeichert</p></div>`,'m');
 $('bCamp').onclick=()=>{audio();campaign();};$('bFree').onclick=()=>{audio();free();};$('bDeck').onclick=()=>{audio();deckEditor(menu);};bindSound(ov,menu);}
function campaign(){const P=prog();
 show(`<div class="box"><h2>Kampagne</h2><p class="sub">Der Schattenpass ruft. Besiege die Anführer der Feinde.</p>
  ${DUELL_SCEN.map(sc=>{const O=DUELL_OPP[sc.opp],u=unlocked(sc.id),w=P.won.includes(sc.id);
   return `<button class="scen${u?'':' locked'}" data-s="${sc.id}" ${u?'':'aria-disabled="true"'}><img src="${DR.icon(O.portrait,72)}" alt=""><div><small>Szenario ${sc.id}</small><b>${esc(sc.title)}</b><em>gegen ${esc(O.name)}, ${esc(O.title)}</em></div><i class="st">${w?'✅ Gewonnen':u?'▶ Offen':'🔒 Gesperrt'}</i></button>`;}).join('')}
  <div class="row"><button id="bBack">← Zurück</button></div></div>`);
 ov.querySelectorAll('.scen').forEach(b=>b.onclick=()=>{const id=+b.dataset.s;if(!unlocked(id)){toast('Erst Szenario '+(id-1)+' gewinnen!');return;}story(id);});
 $('bBack').onclick=menu;}
function story(id){const sc=DUELL_SCEN.find(s=>s.id===id),O=DUELL_OPP[sc.opp];
 show(`<div class="box"><small class="kick">Szenario ${sc.id}</small><h2>${esc(sc.title)}</h2>
  <div class="opp"><img src="${DR.icon(O.portrait,96)}" alt=""><div><b>${esc(O.name)}</b><em>${esc(O.title)} · ${O.tag}</em><span class="q">${esc(O.quote)}</span></div></div>
  ${sc.story.map(p=>`<p>${esc(p)}</p>`).join('')}<p class="rule">⚖️ ${esc(sc.rule)}</p><p class="tip">${esc(sc.tip)}</p>
  <h3>Gegnerisches Deck</h3><div class="mini">${O.deck.map(c=>cardHTML(c,{cls:'xs'})).join('')}</div>
  <h3>Dein Deck</h3><div class="mini">${G.deck.map(c=>cardHTML(c,{cls:'xs'})).join('')}</div>
  <div class="row"><button id="bBack">← Zurück</button><button id="bEd">🃏 Deck ändern</button><button class="go" id="bGo">⚔️ Kampf beginnen</button></div></div>`);
 $('bBack').onclick=campaign;$('bEd').onclick=()=>deckEditor(()=>story(id));$('bGo').onclick=()=>{audio();start({mode:'camp',scen:id});};}
function free(){
 show(`<div class="box"><h2>Freies Gefecht</h2><p class="sub">Ein Übungskampf ohne Kampagnenfortschritt.</p>
  ${Object.entries(DUELL_OPP).map(([k,O])=>{const u=k==='grimm'||unlocked(2);return `<button class="scen${u?'':' locked'}" data-o="${k}"><img src="${DR.icon(O.portrait,72)}" alt=""><div><small>${O.tag}</small><b>${esc(O.name)}</b><em>${esc(O.title)}</em></div><i class="st">${u?'▶':'🔒 Kampagne'}</i></button>`;}).join('')}
  <div class="row"><button id="bBack">← Zurück</button><button id="bEd">🃏 Deck ändern</button></div></div>`);
 ov.querySelectorAll('.scen').forEach(b=>b.onclick=()=>{const k=b.dataset.o;if(k!=='grimm'&&!unlocked(2)){toast('Morvath wartet in der Kampagne (Szenario 2).');return;}audio();start({mode:'free',opp:k});});
 $('bBack').onclick=menu;$('bEd').onclick=()=>deckEditor(free);}
// ---------- Deck-Editor ----------
function deckEditor(back){let d=G.deck.slice(),info=null;
 const render=()=>{const err0=Sim.validateDeck(d),err=err0&&(d.length!==8&&!d.some(id=>CARDS[id].type==='hero')?err0+' Außerdem fehlt ein Held.':err0),heroes=d.filter(id=>CARDS[id].type==='hero').length,avg=d.length?(d.reduce((a,id)=>a+CARDS[id].cost,0)/d.length).toFixed(1):'–';
  const I=info&&CARDS[info];
  show(`<div class="box deck"><h2>Deck bearbeiten</h2>
   <div class="dstat"><span>Karten <b>${d.length}/8</b></span><span>Ø Mana <b>${avg}</b></span><span class="${heroes===1?'ok':'bad'}" id="heroRule">Held ${heroes===1?'✓':'✗'} <small>(genau 1)</small></span></div>
   <div class="slots">${Array.from({length:8},(_,i)=>d[i]?cardHTML(d[i],{cls:'in',i}):'<div class="cd empty">frei</div>').join('')}</div>
   <p class="msg ${err?'bad':'ok'}" id="deckMsg">${err?esc(err):'Deck bereit ✓'}</p>
   <div class="info">${I?`<b>${esc(I.name)}</b> · ${I.cost} Mana · ${({unit:'Einheit',hero:'Held',bld:'Gebäude',spell:'Zauber'})[I.type]}<br>${esc(I.desc||'')}${I.abil?`<br><i>Fähigkeit: ${esc(I.abil.name)}</i>`:''}`:'Tippe eine Karte in der Sammlung an, um sie hinzuzufügen – tippe im Deck, um sie zu entfernen.'}</div>
   <h3>Sammlung</h3><div class="coll">${B.playerSet.map(id=>cardHTML(id,{cls:d.includes(id)?'used':''})).join('')}</div>
   <div class="row stick"><button id="bStd">Standarddeck</button><button class="go" id="bOk" ${err?'disabled':''}>✔ Fertig</button></div></div>`,'d');
  ov.querySelectorAll('.slots .cd.in').forEach(c=>c.onclick=()=>{info=c.dataset.id;d.splice(+c.dataset.i,1);render();});
  ov.querySelectorAll('.coll .cd').forEach(c=>c.onclick=()=>{const id=c.dataset.id;info=id;
   if(d.includes(id)){d.splice(d.indexOf(id),1);render();return;}
   if(CARDS[id].type==='hero'){const h=d.findIndex(x=>CARDS[x].type==='hero');if(h>=0){const old=CARDS[d[h]].name;d[h]=id;toast('Nur ein Held pro Deck – '+old+' wurde ersetzt.');render();return;}}
   if(d.length>=8){toast('Deck ist voll – entferne erst eine Karte.');render();return;}
   d.push(id);render();});
  $('bStd').onclick=()=>{d=B.defaultDeck.slice();render();};
  $('bOk').onclick=()=>{const e=Sim.validateDeck(d);if(e){toast(e);return;}G.deck=d.slice();saveDeck(G.deck);back();};};
 render();}
// ---------- Kampf ----------
function start(o){const seed=(Date.now()%1e9)|0||7;G.mode=o.mode;G.scen=o.scen||null;const oppKey=o.opp||DUELL_SCEN.find(s=>s.id===o.scen).opp,O=DUELL_OPP[oppKey];G.opp=oppKey;
 const err=Sim.validateDeck(G.deck);if(err){toast(err);deckEditor(menu);return;}
 G.S=Sim.create({seed:o.seed||seed,decks:[G.deck,O.deck],mods:[{},O.mods]});G.ai=DuellAI.create(O.ai,1,(o.seed||seed)*7+3);G.auto=o.auto?DuellAI.create('bot',0,(o.seed||seed)*3+1):(G.auto?DuellAI.create('bot',0,(o.seed||seed)*3+1):null);
 G.endShown=false;G.sel=null;G.aim=false;G.acc=0;DR.reset();hide();$('app').classList.remove('inmenu');
 $('oppName').textContent=O.name;$('oppImg').src=DR.icon(O.portrait,48);G.paused=false;G.last=performance.now();buildHand(true);banner('Bereit …',1.2);}
function step1(){const S=G.S;if(G.ai){const c=DuellAI.think(G.ai,S);if(c)Sim.issue(S,c);}if(G.auto){const c=DuellAI.think(G.auto,S);if(c)Sim.issue(S,c);}
 Sim.step(S);const ev=S.ev;if(ev.length){DR.onEvents(ev,S);sfxEvents(ev);for(const e of ev){if(e.k==='start')banner('Kampf!',1);else if(e.k==='double')banner('Doppeltes Mana!',1.8);else if(e.k==='sudden')banner('Sudden Death!<small>Der nächste zerstörte Turm entscheidet</small>',2.4);else if(e.k==='tower')banner(e.side===1?'Turm zerstört! 👑':'Dein Turm ist gefallen!',1.4);}}}
G.fast=(sec)=>{const n=Math.round(sec/Sim.TICK);for(let i=0;i<n&&!G.S.over;i++)step1();return{t:G.S.t,over:G.S.over,winner:G.S.winner,crowns:[G.S.p[0].crowns,G.S.p[1].crowns]};};
G.autopilot=on=>{G.auto=on?DuellAI.create('bot',0,12345):null;return !!G.auto;};
G.start=start;G.menu=menu;G.campaign=campaign;G.story=story;G.deckEditor=()=>deckEditor(menu);G.free=free;G.prog=prog;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.1,(now-G.last)/1000||0);G.last=now;
 if(G.S&&!G.paused){G.acc+=dt*G.speed;let n=0;while(G.acc>=Sim.TICK&&n<20){step1();G.acc-=Sim.TICK;n++;}if(G.S.over&&!G.endShown){G.endShown=true;setTimeout(endScreen,1500);}}
 if(G.S&&G.drag&&G.drag.moved&&G.ptr&&!G.paused&&G.S.p[0].hand[G.drag.i]!=null)ghostAt(G.drag.i,G.ptr.cx,G.ptr.cy,G.ptr.touch);
 if(G.S){DR.draw(G.S,G.paused?1:Math.min(1,G.acc/Sim.TICK),G.paused?0:dt);hud();}
 else{if(!G.demo)G.demo=Sim.create({seed:1});DR.draw(G.demo,1,dt);}
 if(G.toastT>0){G.toastT-=dt;if(G.toastT<=0)$('toast').classList.remove('show');}
 if(bannerT>0){bannerT-=dt;if(bannerT<=0)$('banner').classList.remove('show');}}
let bannerT=0;function banner(h,t){const b=$('banner');b.innerHTML=h;b.classList.add('show');bannerT=t;}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');G.toastT=2.2;}
G.toast=toast;
// ---------- HUD ----------
let lastHand='';
function buildHand(force){const S=G.S,p=S.p[0],key=p.hand.join(',')+'|'+p.queue[0];if(!force&&key===lastHand)return;lastHand=key;
 $('hand').innerHTML=p.hand.map((id,i)=>cardHTML(id,{i,cls:'h'})).join('');$('nextImg').src=DR.icon(CARDS[p.queue[0]].art==='fire'?'firerain':CARDS[p.queue[0]].art,40);
 $('hand').querySelectorAll('.cd').forEach(c=>{c.addEventListener('pointerdown',ev=>cardDown(ev,+c.dataset.i));});G.sel=null;G.aim=false;DR.st.ghost=null;}
function fmt(t){t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}
function hud(){const S=G.S,p=S.p[0];buildHand();
 const tm=S.phase==='count'?fmt(Sim.MATCH):S.phase==='sudden'?fmt(S.suddenT):fmt(S.matchT);$('timer').textContent=tm;$('timer').className=S.phase==='sudden'?'sd':S.dbl?'dbl':'';
 $('x2').style.display=(S.dbl||S.phase==='sudden')?'':'none';
 $('crE').innerHTML=[0,1,2].map(i=>`<i class="${i<S.p[1].crowns?'on':''}">♛</i>`).join('');$('crP').innerHTML=[0,1,2].map(i=>`<i class="${i<p.crowns?'on':''}">♛</i>`).join('');
 const m=p.mana;$('manaFill').style.width=(m/10*100)+'%';$('manaNum').textContent=Math.floor(m+1e-9);
 $('hand').querySelectorAll('.cd').forEach(c=>{const i=+c.dataset.i,C=CARDS[p.hand[i]];const heroBusy=C.type==='hero'&&p.heroId&&Sim.byId(S,p.heroId);
  c.classList.toggle('poor',m+1e-9<C.cost);c.classList.toggle('busy',!!heroBusy);c.classList.toggle('sel',G.sel===i);c.style.setProperty('--pg',Math.min(1,m/C.cost));});
 const h=p.heroId&&Sim.byId(S,p.heroId),ab=$('abil');
 if(h&&S.phase!=='over'){const A=CARDS[h.card].abil;ab.style.display='';ab.style.setProperty('--ch',p.heroCharge);ab.classList.toggle('ready',p.heroCharge>=1&&h.dep<=0);ab.classList.toggle('aim',G.aim);
  if(ab.dataset.h!==h.card){ab.dataset.h=h.card;$('abilImg').src=DR.icon(CARDS[h.card].art,44);$('abilName').textContent=A.name;}}else{ab.style.display='none';G.aim=false;DR.st.aim=null;}}
function hudBtns(){$('bMus').textContent=SFX.on.music?'🎵':'🔇';$('bSfx').textContent=SFX.on.sfx?'🔊':'🔈';}
// ---------- Eingabe ----------
const stage=$('stage'),cv=$('cv');
function inStage(x,y){const r=cv.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
// Vorschau sitzt bei Touch deutlich über dem Finger, damit er sie nicht verdeckt
const TOUCH_OFF=48;
function worldAt(cx,cy,touch){const r=cv.getBoundingClientRect();return DR.toWorld(cx-r.left,cy-r.top-(touch?TOUCH_OFF:0));}
function overHand(cx,cy){const r=$('panel').getBoundingClientRect();return cy>=r.top&&cx>=r.left&&cx<=r.right;}
function ghostAt(i,cx,cy,touch){G.ptr={cx,cy,touch};const S=G.S,id=S.p[0].hand[i],C=CARDS[id];
 if(!inStage(cx,cy)||overHand(cx,cy)){DR.st.ghost={card:id,zone:C.type!=='spell',x:null,cancel:overHand(cx,cy)};return;}
 const[x,y]=worldAt(cx,cy,touch),[fx,fy]=worldAt(cx,cy,false);const err=Sim.canPlay(S,0,i,x,y);
 DR.st.ghost={card:id,x,y,fx:touch?fx:null,fy:touch?fy:null,ok:!err,zone:C.type!=='spell',err,lane:Sim.laneOf(x)};}
function cancelSel(){G.sel=null;DR.st.ghost=null;}
function tryPlay(i,cx,cy,touch){const S=G.S;const[x,y]=worldAt(cx,cy,touch);const err=Sim.canPlay(S,0,i,x,y);
 if(err){toast((err==='Hier nicht erlaubt'?'Hier nicht erlaubt – nur auf deiner Hälfte (rot = gesperrt)':err)+' · abgebrochen');cancelSel();return false;}
 Sim.issue(S,{side:0,a:'play',i,x:Math.round(x),y:Math.round(y)});cancelSel();return true;}
function cardDown(ev,i){ev.preventDefault();audio();if(!G.S||G.paused||G.S.over)return;G.aim=false;DR.st.aim=null;
 const wasSel=G.sel===i;G.sel=i;G.drag={i,sx:ev.clientX,sy:ev.clientY,moved:false,touch:ev.pointerType!=='mouse',wasSel};ghostAt(i,ev.clientX,ev.clientY,G.drag.touch);DR.st.ghost.x=null;}
window.addEventListener('pointermove',ev=>{if(!G.S||G.paused)return;const D=G.drag;
 if(D){if(Math.hypot(ev.clientX-D.sx,ev.clientY-D.sy)>10)D.moved=true;if(D.moved)ghostAt(D.i,ev.clientX,ev.clientY,D.touch);return;}
 if(G.sel!=null&&ev.pointerType==='mouse')ghostAt(G.sel,ev.clientX,ev.clientY,false);
 if(G.aim&&ev.pointerType==='mouse'&&inStage(ev.clientX,ev.clientY)){const[x,y]=worldAt(ev.clientX,ev.clientY,false);DR.st.aim={x,y};}},{passive:true});
function dragEnd(ev,cancel){const D=G.drag;if(!D)return;G.drag=null;if(!G.S||G.S.over){cancelSel();return;}
 if(cancel){cancelSel();return;}
 if(D.moved){// Loslassen: auf gültigem Feld setzen, sonst (ungültig / zurück auf die Hand) abbrechen
  if(inStage(ev.clientX,ev.clientY)&&!overHand(ev.clientX,ev.clientY))tryPlay(D.i,ev.clientX,ev.clientY,D.touch);else cancelSel();}
 else if(D.wasSel)cancelSel();
 else{const S=G.S,id=S.p[0].hand[D.i],C=CARDS[id];DR.st.ghost={card:id,zone:C.type!=='spell',x:null};}}
window.addEventListener('pointerup',ev=>dragEnd(ev,false));
window.addEventListener('pointercancel',ev=>dragEnd(ev,true));
cv.addEventListener('pointerdown',ev=>{if(!G.S||G.paused||G.S.over||G.drag)return;audio();
 if(G.aim){const[x,y]=worldAt(ev.clientX,ev.clientY,false);Sim.issue(G.S,{side:0,a:'abil',x:Math.round(x),y:Math.round(y)});G.aim=false;DR.st.aim=null;return;}
 // Karte gewählt: Finger/Maus auf dem Feld startet die Live-Vorschau, gesetzt wird beim Loslassen
 if(G.sel!=null){ev.preventDefault();const touch=ev.pointerType!=='mouse';G.drag={i:G.sel,sx:ev.clientX,sy:ev.clientY,moved:true,field:true,touch,wasSel:true};ghostAt(G.sel,ev.clientX,ev.clientY,touch);}});
$('abil').addEventListener('pointerdown',ev=>{ev.preventDefault();audio();const S=G.S;if(!S||G.paused)return;const p=S.p[0],h=Sim.byId(S,p.heroId);if(!h)return;
 if(p.heroCharge<1){toast('Fähigkeit lädt noch …');return;}const A=CARDS[h.card].abil;G.sel=null;DR.st.ghost=null;
 if(A.self){Sim.issue(S,{side:0,a:'abil',x:Math.round(h.x),y:Math.round(h.y)});return;}
 G.aim=!G.aim;DR.st.aim=G.aim?{x:null}:null;if(G.aim)toast(A.name+': Ziel auf dem Feld antippen');});
window.addEventListener('keydown',ev=>{if(!G.S||G.S.over)return;if(ev.key==='Escape'){if(G.sel!=null||G.aim){G.sel=null;G.aim=false;DR.st.ghost=null;DR.st.aim=null;}else if(!G.paused)pause();else resume();}
 else if(!G.paused&&/^[1-4]$/.test(ev.key)){G.sel=+ev.key-1;const id=G.S.p[0].hand[G.sel];DR.st.ghost={card:id,zone:CARDS[id].type!=='spell'};}
 else if(!G.paused&&(ev.key==='q'||ev.key==='Q'))$('abil').dispatchEvent(new PointerEvent('pointerdown'));});
// ---------- Pause / Ende ----------
function pause(){if(!G.S||G.S.over)return;G.paused=true;const re=()=>{show(`<div class="box"><h2>Pause</h2>${soundRow()}
  <div class="col"><button class="big go" id="bRes">▶ Weiter</button><button class="big" id="bGive">🏳️ Aufgeben</button></div></div>`);bindSound(ov,re);
  $('bRes').onclick=resume;$('bGive').onclick=()=>{G.S.over=true;G.S.phase='over';G.S.winner=1;G.S.reason='Aufgegeben';G.endShown=true;endScreen();};};re();}
function resume(){hide();G.paused=false;G.last=performance.now();}
G.pause=pause;G.resume=resume;
function endScreen(){const S=G.S,w=S.winner,win=w===0,draw=w<0;G.paused=true;let extra='';
 if(G.mode==='camp'){const sc=DUELL_SCEN.find(s=>s.id===G.scen);if(win){const fresh=markWon(sc.id);extra=`<p class="story">${esc(sc.win)}</p>`;
   const nx=DUELL_SCEN.find(s=>s.id===sc.id+1);if(nx&&fresh)extra+=`<p class="unlock">🔓 Szenario ${nx.id} „${esc(nx.title)}“ freigeschaltet!</p>`;}
  else extra=`<p class="story">${esc(sc.lose)}</p>`;}
 try{audio();win?SFX.level():SFX.over();}catch(_){}
 const nx=G.mode==='camp'&&win&&DUELL_SCEN.find(s=>s.id===G.scen+1);
 show(`<div class="box end ${win?'win':draw?'draw':'lose'}"><h1>${win?'Sieg!':draw?'Unentschieden':'Niederlage'}</h1>
  <div class="crowns"><div><small>Du</small>${[0,1,2].map(i=>`<i class="${i<S.p[0].crowns?'on b':''}">♛</i>`).join('')}</div><div><small>${esc(DUELL_OPP[G.opp].name)}</small>${[0,1,2].map(i=>`<i class="${i<S.p[1].crowns?'on r':''}">♛</i>`).join('')}</div></div>
  <p class="sub">${esc(S.reason||'')} · ${fmt(S.t-3)} gespielt · ${S.p[0].plays} Karten</p>${extra}
  <div class="col">${nx?`<button class="big go" id="bNext">▶ Weiter: ${esc(nx.title)}</button>`:''}<button class="big${nx?'':' go'}" id="bAgain">↻ Revanche</button><button class="big" id="bMenu">☰ Menü</button></div></div>`,'e');
 if(nx)$('bNext').onclick=()=>story(nx.id);$('bAgain').onclick=()=>G.mode==='camp'?story(G.scen):start({mode:'free',opp:G.opp});$('bMenu').onclick=()=>{G.S=null;menu();};}
G.endScreen=endScreen;
$('bPause').onclick=()=>{audio();G.paused?resume():pause();};
$('bMus').onclick=()=>{audio();SFX.toggle('music');hudBtns();};$('bSfx').onclick=()=>{audio();SFX.toggle('sfx');hudBtns();};
// ---------- Start ----------
function fit(){DR.resize();}
window.addEventListener('resize',()=>{fit();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.S&&!G.paused&&!G.S.over)pause();});
measureArt();DR.init(cv);hudBtns();menu();requestAnimationFrame(t=>{G.last=t;loop(t);});
})();
