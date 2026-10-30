// ===== Turmwacht Duell – Bedienung, Menüs, Spielschleife =====
(()=>{
const Sim=DuellSim,CARDS=Sim.CARDS,B=TW_BESTIARY;
const $=id=>document.getElementById(id);
const el=(t,cls,html)=>{const e=document.createElement(t);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ---------- Speicher ----------
function loadDeck(){const d=LS.get('duell_deck',null);return(d&&!Sim.validateDeck(d)&&d.every(id=>B.playerSet.includes(id)&&cardOpen(id)))?d:B.defaultDeck.slice();}
// 0.7: neue Kreaturen werden durch Kampagnensiege freigeschaltet (Karte.unlock = Kapitel-Nr.)
function cardOpen(id){const u=CARDS[id].unlock;return !u||prog().won.includes(u);}
function ownSet(){return B.playerSet.filter(cardOpen);}
function scenOf(oppKey){return DUELL_SCEN.find(s=>s.opp===oppKey);}
function diffCls(tag){return tag==='schwer'?'hard':tag==='sehr schwer'?'hard2':tag==='Drache'?'dragon':'';}
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
 case 'shot':if(e.kind==='arrow'||e.kind==='tarrow'||e.kind==='thorn')SFX.shot('archer');else if(e.kind==='fireball')SFX.shot('mage');else if(e.kind==='zap')SFX.zap();else if(e.kind==='net')SFX.net();else if(e.kind==='flame')SFX.breath(false);else if(e.kind==='icebreath')SFX.breath(true);else SFX.shot('alch');break;
 // 0.7 neue Mechaniken
 case 'chain':SFX.zap();break;case 'roar':SFX.roar();break;case 'fear':SFX.screech();break;case 'burrow':case 'unburrow':SFX.burrow();break;
 case 'chant':SFX.chant();break;case 'roots':SFX.roots();break;case 'fireline':SFX.fireline();break;case 'burn':SFX.shot('mage');break;
 case 'hit':SFX.hit();break;case 'boom':SFX.boom();break;case 'splash':SFX.splash();break;
 case 'firerain':SFX.cast('fire');break;case 'fireboom':SFX.boom();break;case 'frost':SFX.cast('frost');break;
 case 'nova':SFX.hero('frost');break;case 'leap':SFX.hero('blade');break;case 'slam':SFX.slam();break;case 'cloud':SFX.hero('poison');break;
 case 'summon':SFX.bones();break;case 'bomb':SFX.bomb(e.big);break;case 'drop':SFX.drop();break;case 'throw':SFX.shot('catapult');break;case 'land':SFX.grunt();break;
 case 'death':if(e.cls==='unit'&&/skel|giant|lich/.test(e.card))SFX.bones();else if(e.big)SFX.death(false);break;
 case 'play':if(e.side===0&&/orcs|giant|ogre/.test(e.card))SFX.grunt();break;
 case 'start':SFX.horn();break;
 case 'mana':if(e.side===0)SFX.drop();break;}}catch(_){}}}
// Phasen-Klänge (0.3): alles über den Effekt-Schalter stummschaltbar; G.sndLog protokolliert gespielte Signale (für Tests)
G.sndLog=[];
function snd(name,arg){if(!SFX.on.sfx)return false;G.sndLog.push({n:name,t:G.S?+G.S.t.toFixed(2):0});if(G.sndLog.length>400)G.sndLog.shift();if(audioOn){try{SFX[name](arg);}catch(_){}}return true;}
G.snd=snd;
const PW={tick:null,keep:[false,false],endSnd:false};
function phaseReset(){PW.tick=null;PW.keep=[false,false];PW.endSnd=false;PW.wakeAt=0;$('cdown').className='';}
function phaseWatch(S,ev){let fell=false;
 for(const e of ev){
  if(e.k==='start')banner('Kampf!',1);
  else if(e.k==='double'){banner('Doppel-Mana!<small>Mana lädt doppelt so schnell · noch 1:00</small>',2);snd('warhorn');}
  else if(e.k==='sudden'){banner('Sudden Death!<small>Der nächste zerstörte Turm entscheidet · 1:00</small>',2.4);snd('suddenBell');}
  else if(e.k==='tower'){fell=true;banner(e.side===1?'Turm zerstört! 👑':'Dein Turm ist gefallen!',1.4);snd('towerFall');}
  else if(e.k==='end'){const w=e.winner;banner(w===0?'Sieg! 🏆':w<0?'Unentschieden':'Niederlage',1.6);PW.endSnd=true;snd(w===0?'fanfare':'darkHorn');$('cdown').className='';}}
 // Bergfried erwacht (getroffen oder Wachturm gefallen) – reine Anzeige
 for(const side of[0,1]){const k=Sim.tower(S,side,'keep');if(k&&k.active&&!PW.keep[side]){PW.keep[side]=true;if(!S.over&&k.hp>0){DR.onEvents([{k:'keepwake',x:k.x,y:k.y,side}],S);
   if(fell)PW.wakeAt=S.t+.9;else snd('keepWake');toast(side?'Gegnerischer Bergfried ist erwacht!':'Dein Bergfried ist erwacht!');}}}
 if(PW.wakeAt&&S.t>=PW.wakeAt){PW.wakeAt=0;if(!S.over)snd('keepWake');}// verzögert nach Turmsturz-Klang (Spielzeit, auch im Schnellvorlauf)
 // Letzte 10 Sekunden (regulär und im Sudden Death): Banner + Tick pro Sekunde + großer Countdown
 const rem=S.phase==='play'?S.matchT:S.phase==='sudden'?S.suddenT:null;
 if(rem!=null&&rem>0&&rem<=10+1e-9){const sec=Math.ceil(rem-1e-9),key=S.phase+':'+sec;
  if(PW.tick!==key){const first=!PW.tick||PW.tick.split(':')[0]!==S.phase;PW.tick=key;
   if(first)banner(S.phase==='sudden'?'Letzte 10 Sekunden<small>Sudden Death endet – dann zählen die Turm-Lebenspunkte</small>':'Letzte 10 Sekunden',1.4);
   snd('tick',sec<=3);const c=$('cdown');c.textContent=sec;c.className='';void c.offsetWidth;c.className='go'+(sec<=3?' hot':'');}}}
// ---------- Bildschirme ----------
const ov=$('ov');
function show(html,cls){ov.className='ov show '+(cls||'');ov.innerHTML=html;ov.scrollTop=0;}
function hide(){closeCard();ov.className='ov';ov.innerHTML='';}
function cardHTML(id,o){o=o||{};const C=CARDS[id];const t=C.type;
 return `<div class="cd t-${t}${o.cls?' '+o.cls:''}" data-id="${id}"${o.i!=null?` data-i="${o.i}"`:''}><img src="${DR.icon(C.art==='fire'?'firerain':C.art,64)}" alt=""><b class="cost">${C.cost}</b>${C.count>1?`<i class="cnt">×${C.count}</i>`:''}${t==='hero'?'<i class="hb">Held</i>':''}<span>${esc(C.name)}</span></div>`;}
function soundRow(){const tr=SFX.track;return `<div class="row snd"><span>Musik:</span><button class="sm${tr==='tavern'?' on':''}" data-trk="tavern">🍺 Taverne</button><button class="sm${tr==='calm'?' on':''}" data-trk="calm">🔥 Kaminfeuer</button></div>
 <div class="row snd"><button class="sm${SFX.on.music?' on':''}" data-tog="music">${SFX.on.music?'🎵 Musik an':'🔇 Musik aus'}</button><button class="sm${SFX.on.sfx?' on':''}" data-tog="sfx">${SFX.on.sfx?'🔊 Effekte an':'🔈 Effekte aus'}</button></div>`;}
function bindSound(root,re){root.querySelectorAll('[data-trk]').forEach(b=>b.onclick=()=>{audio();SFX.setTrack(b.dataset.trk);re();});
 root.querySelectorAll('[data-tog]').forEach(b=>b.onclick=()=>{audio();SFX.toggle(b.dataset.tog);hudBtns();re();});}
// ---------- 0.4: Menü, Deck-Editor, Detailkarte, Kampagne ----------
const VERSION='0.7',I=DUELL_INFO;
const artOf=id=>CARDS[id].art==='fire'?'firerain':CARDS[id].art;
const TICON={hero:'👑',unit:'⚔️',spell:'✨',bld:'🏰'};
function deckStrip(deck,o){o=o||{};return `<div class="dstrip${o.cls?' '+o.cls:''}">${deck.map(id=>`<button class="mi t-${CARDS[id].type}" data-card="${id}" aria-label="${esc(CARDS[id].name)}"><img src="${DR.icon(artOf(id),48)}" alt=""><b>${CARDS[id].cost}</b></button>`).join('')}</div>`;}
function bindCardTaps(root){root.querySelectorAll('[data-card]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();audio();openCard(b.dataset.card);}));}
// ----- Hauptmenü -----
function menu(){G.paused=true;$('app').classList.add('inmenu');closeCard();const P=prog(),d=G.deck,hero=d.find(id=>CARDS[id].type==='hero');
 show(`<div class="mm"><div class="crest"><img src="${DR.icon('keep0',120)}" alt=""><div><h1>Turmwacht<br><span>Duell</span></h1><p>Kartenduell am Schattenpass</p></div></div>
  <button class="deckbar" id="bDeckBar"><div class="dbh"><span>🃏 Dein Deck</span><span class="dbs">Ø <b>${I.fx(I.avg(d),1)}</b> Mana${hero?` · 👑 ${esc(CARDS[hero].name)}`:''}</span></div>
   <div class="dstrip">${d.map(id=>`<span class="mi t-${CARDS[id].type}" data-id="${id}"><img src="${DR.icon(artOf(id),48)}" alt=""><b>${CARDS[id].cost}</b></span>`).join('')}</div><small>Antippen zum Bearbeiten</small></button>
  <div class="tiles">
   <button class="tile camp" id="bCamp"><img src="${DR.icon('lichP',72)}" alt=""><b>Kampagne</b><small>${P.won.length}/${DUELL_SCEN.length} Szenarien geschafft</small><i class="pb"><i style="width:${P.won.length/DUELL_SCEN.length*100}%"></i></i></button>
   <button class="tile free" id="bFree"><img src="${DR.icon('chief',72)}" alt=""><b>Freier Kampf</b><small>Üben ohne Fortschritt</small></button>
   <button class="tile deck" id="bDeck"><img src="${DR.icon('blade',72)}" alt=""><b>Deck &amp; Sammlung</b><small>${ownSet().length}/${B.playerSet.length} Karten · Infos zu jeder Kreatur</small></button>
   <button class="tile set" id="bSet"><span class="gear">⚙️</span><b>Einstellungen</b><small>Musik &amp; Effekte</small></button></div>
  <p class="foot">Turmwacht Duell · Offline-Testversion ${VERSION} · Fortschritt wird im Browser gespeichert</p></div>`,'m');
 $('bCamp').onclick=()=>{audio();campaign();};$('bFree').onclick=()=>{audio();free();};$('bDeck').onclick=$('bDeckBar').onclick=()=>{audio();deckEditor(menu);};$('bSet').onclick=()=>{audio();settings(menu);};}
function settings(back){const re=()=>{show(`<div class="box scr"><div class="sh"><button class="bk" id="bBack" aria-label="Zurück">←</button><h2>Einstellungen</h2></div>
  <div class="parch"><h3>Klang</h3>${soundRow()}</div>
  <div class="parch"><h3>So spielst du</h3><p>Ziehe eine Karte aus deiner Hand auf deine Hälfte des Feldes – oder tippe sie an und dann aufs Feld. Ein grüner Geist zeigt einen gültigen Platz.</p><p>Zerstöre die gegnerischen Türme: jeder Turm bringt eine Krone, der Bergfried alle drei. Nach 2:00 Minuten (ab 1:00 mit doppeltem Mana) folgt bei Gleichstand der Sudden Death.</p><p>Kreaturen laufen zum nächsten Turm ihrer Seite, greifen aber jeden Gegner in Sichtweite an – auch auf der anderen Spur. Setzt du eine Gruppe (z. B. Fledermäuse, Orks) in die goldene Mitte, teilt sie sich auf beide Spuren auf. Neue Truppen erscheinen eine Sekunde lang als Geist (blauer Balken) – unverwundbar, aber noch untätig. Wer einmal kämpft, bleibt an seinem Ziel, bis es fällt.</p><p>Dein Held hat eine Fähigkeit: Sobald der Ring unten rechts voll ist, antippen.</p><p>Jeder Sieg in der Kampagne ab Kapitel 3 schaltet neue Kreaturen für deine Sammlung frei – Trolle, Baumriesen und sogar Drachen.</p></div>
  <p class="foot">Version ${VERSION}</p></div>`);bindSound(ov,re);$('bBack').onclick=back;};re();}
// ----- Kampagne -----
function scenCard(sc,P){const O=DUELL_OPP[sc.opp],u=unlocked(sc.id),w=P.won.includes(sc.id);const st=w?'won':u?'open':'locked';
 return `<div class="scen sc2 ${st}${u?'':' locked'}" data-s="${sc.id}" role="button" tabindex="0" ${u?'':'aria-disabled="true"'}>
  <div class="por"><img src="${DR.icon(O.portrait,96)}" alt=""><i class="diff ${diffCls(O.tag)}">${esc(O.tag)}</i></div>
  <div class="sci"><small>Kapitel ${sc.id}</small><b>${esc(sc.title)}</b><em>gegen ${esc(O.name)}, ${esc(O.title)}</em>
   ${u?'':`<p class="lk">🔒 Besiege zuerst „${esc(DUELL_SCEN.find(s=>s.id===sc.id-1).title)}“</p>`}</div>
  ${u?`<div class="sdk"><small>Gegnerdeck</small>${deckStrip(O.deck,{cls:'foe'})}</div>`:''}
  <i class="seal ${st}">${w?'✓<small>Geschafft</small>':u?'▶<small>Bereit</small>':'🔒<small>Gesperrt</small>'}</i></div>`;}
function campaign(){const P=prog();
 show(`<div class="box scr"><div class="sh"><button class="bk" id="bBack" aria-label="Zurück">←</button><div><h2>Kampagne</h2><p class="sub">Der Schattenpass ruft. Besiege die Anführer der Feinde.</p></div></div>
  <div class="cprog"><span>Fortschritt</span><i><i style="width:${P.won.length/DUELL_SCEN.length*100}%"></i></i><b>${P.won.length}/${DUELL_SCEN.length}</b></div>
  ${DUELL_SCEN.map(sc=>scenCard(sc,P)).join('')}<p class="hint2">Tipp: Tippe auf eine Karte im Gegnerdeck, um sie dir genauer anzusehen.</p></div>`);
 bindCardTaps(ov);
 ov.querySelectorAll('.scen').forEach(b=>b.onclick=()=>{const id=+b.dataset.s;if(!unlocked(id)){toast('Erst Szenario '+(id-1)+' gewinnen!');return;}audio();story(id);});
 $('bBack').onclick=menu;}
function story(id){const sc=DUELL_SCEN.find(s=>s.id===id),O=DUELL_OPP[sc.opp];
 show(`<div class="box scr"><div class="sh"><button class="bk" id="bBack" aria-label="Zurück">←</button><div><small class="kick">Kapitel ${sc.id}</small><h2>${esc(sc.title)}</h2></div></div>
  <div class="opp"><img src="${DR.icon(O.portrait,96)}" alt=""><div><b>${esc(O.name)}</b><em>${esc(O.title)} · ${O.tag}</em><span class="q">${esc(O.quote)}</span></div></div>
  <div class="parch">${sc.story.map(p=>`<p>${esc(p)}</p>`).join('')}</div><p class="rule">⚖️ ${esc(sc.rule)}</p><p class="tip">${esc(sc.tip)}</p>
  <h3>Gegnerisches Deck <small>(antippen für Details)</small></h3>${deckStrip(O.deck,{cls:'foe'})}
  <h3>Dein Deck <small>Ø ${I.fx(I.avg(G.deck),1)} Mana</small></h3>${deckStrip(G.deck)}
  <div class="row stick"><button id="bEd">🃏 Deck ändern</button><button class="go" id="bGo">⚔️ Kampf beginnen</button></div></div>`);
 bindCardTaps(ov);$('bBack').onclick=campaign;$('bEd').onclick=()=>deckEditor(()=>story(id));$('bGo').onclick=()=>{audio();start({mode:'camp',scen:id});};}
function free(){
 show(`<div class="box scr"><div class="sh"><button class="bk" id="bBack" aria-label="Zurück">←</button><div><h2>Freier Kampf</h2><p class="sub">Ein Übungskampf ohne Kampagnenfortschritt.</p></div></div>
  ${Object.entries(DUELL_OPP).map(([k,O])=>{const sc=scenOf(k),u=!sc||unlocked(sc.id);return `<div class="scen sc2 ${u?'open':'locked locked'}" data-o="${k}" role="button" tabindex="0"><div class="por"><img src="${DR.icon(O.portrait,96)}" alt=""><i class="diff ${diffCls(O.tag)}">${esc(O.tag)}</i></div>
   <div class="sci"><small>Gegner</small><b>${esc(O.name)}</b><em>${esc(O.title)}</em>${u?'':`<p class="lk">🔒 Wartet in der Kampagne (Kapitel ${sc.id})</p>`}</div>${u?`<div class="sdk"><small>Gegnerdeck</small>${deckStrip(O.deck,{cls:'foe'})}</div>`:''}<i class="seal ${u?'open':'locked'}">${u?'⚔<small>Kämpfen</small>':'🔒<small>Gesperrt</small>'}</i></div>`;}).join('')}
  <div class="row stick"><button id="bEd">🃏 Deck ändern</button></div></div>`);
 bindCardTaps(ov);
 ov.querySelectorAll('.scen').forEach(b=>b.onclick=()=>{const k=b.dataset.o,sc=scenOf(k);if(sc&&!unlocked(sc.id)){toast(DUELL_OPP[k].name+' wartet in der Kampagne (Kapitel '+sc.id+').');return;}audio();start({mode:'free',opp:k});});
 $('bBack').onclick=menu;$('bEd').onclick=()=>deckEditor(free);}
// ----- Detailkarte -----
const dc=el('div','dcwrap');dc.id='dcard';$('app').appendChild(dc);let dcAnim=0,dcOpen=null;
function closeCard(){if(!dcOpen)return;const f=dcOpen.onClose;dcOpen=null;dc.className='dcwrap';dc.innerHTML='';cancelAnimationFrame(dcAnim);if(f)f();}
G.closeCard=closeCard;
function bar(f){return f==null?'':`<i class="sb"><i style="width:${Math.max(4,Math.min(1,f)*100).toFixed(0)}%"></i></i>`;}
function openCard(id,o){o=o||{};const C=CARDS[id],R=I.rarity(id),S=I.stats(id),A=I.abilities(id);dcOpen={id,onClose:o.onClose};
 const acts=(o.actions||[]).map((a,i)=>`<button class="${a.cls||''}" data-act="${i}">${a.label}</button>`).join('');
 dc.innerHTML=`<div class="dc r-${R.k} t-${C.type}" role="dialog" aria-modal="true" aria-label="${esc(C.name)}"><button class="x" id="dcX" aria-label="Schließen">✕</button>
  <div class="dch"><b class="gem">${C.cost}</b><div><h2>${esc(C.name)}</h2><div class="tags"><i class="rar">${R.n}</i><i class="typ">${TICON[C.type]} ${I.TYPE[C.type]}</i>${C.air?'<i class="typ">🦇 Flieger</i>':''}${C.npc?'<i class="npc">Gegnerkarte</i>':''}</div></div></div>
  <div class="fig"><canvas id="dcCv"></canvas>${C.count>1?`<i class="cnt">×${C.count}</i>`:''}</div>
  <div class="dcb">${o.note?`<p class="note">${o.note}</p>`:''}
   <div class="stats">${S.map(r=>`<div class="st${r.f!=null?'':' nb'}"><span>${r.k}</span><b>${esc(r.v)}${r.sub?` <small>${esc(r.sub)}</small>`:''}</b>${bar(r.f)}</div>`).join('')}</div>
   <h3>Fähigkeiten</h3><ul class="ab">${A.map(a=>typeof a==='string'?`<li>${esc(a)}</li>`:`<li class="hab"><b>✦ ${esc(a.abil)}</b> – ${esc(a.t)} <small>(${esc(a.charge)})</small></li>`).join('')}</ul>
   <p class="desc">${esc(C.desc||'')}</p><p class="lore">„${esc(I.LORE[id]||'')}“</p></div>
  ${acts?`<div class="dca">${acts}</div>`:''}</div>`;
 dc.className='dcwrap show';
 dc.querySelector('.dc').addEventListener('click',ev=>ev.stopPropagation());
 $('dcX').onclick=closeCard;
 dc.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const a=o.actions[+b.dataset.act];const f=a.fn;dcOpen.onClose=null;closeCard();f();});
 figAnim(id);}
dc.addEventListener('click',ev=>{if(ev.target===dc)closeCard();});
window.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&dcOpen){ev.stopImmediatePropagation();closeCard();}},true);
G.openCard=openCard;
// Große Figur (Frontansicht, bestehende Vektor-Art) mit Idle-Animation
const figCache={};
function figSprite(art,H){const K=art+'@'+H;if(figCache[K])return figCache[K];const a=DART[art];const k=H/Math.max(a.h,a.w*.9),dp=Math.min(3,window.devicePixelRatio||1)*1;
 const W=Math.ceil(a.w*k+12),Hh=Math.ceil(a.h*k+12),c=document.createElement('canvas');c.width=W*dp;c.height=Hh*dp;const g=c.getContext('2d');
 const q0=document.createElement('canvas');q0.width=c.width;q0.height=c.height;const q=q0.getContext('2d');q.scale(dp,dp);q.translate(6+a.ax*k,6+a.ay*k);q.scale(k,k);try{a.fn(q);}catch(e){}
 for(let i=0;i<8;i++){const an=i*Math.PI/4;g.drawImage(q0,Math.cos(an)*2.4*dp,Math.sin(an)*2.4*dp);}
 g.globalCompositeOperation='source-in';g.fillStyle='rgba(14,8,3,.95)';g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='source-over';g.drawImage(q0,0,0);
 return figCache[K]={c,w:W,h:Hh,fx:6+a.ax*k,fy:6+a.ay*k};}
function figAnim(id){const cv2=$('dcCv');if(!cv2)return;const C=CARDS[id],art=artOf(id),a=DART[art],spell=C.type==='spell',bld=C.type==='bld',air=!!C.air,hero=C.type==='hero';
 const box=cv2.parentElement.getBoundingClientRect(),W=Math.max(160,Math.round(box.width)),H=Math.max(150,Math.round(box.height)),dp=Math.min(3,window.devicePixelRatio||1);
 cv2.width=W*dp;cv2.height=H*dp;cv2.style.width=W+'px';cv2.style.height=H+'px';const g=cv2.getContext('2d');
 const fh=spell?H*.62:H*(air?.62:bld?.74:.78),sp=figSprite(art,Math.round(fh));const col={hero:'255,216,96',spell:'190,140,255',bld:'220,210,190',unit:'255,190,110'}[C.type];
 const P=Array.from({length:14},(_,i)=>({x:Math.random(),y:Math.random(),s:.4+Math.random(),p:Math.random()*6}));
 let t0=performance.now();
 const fr=now=>{if(!dcOpen||dcOpen.id!==id||!cv2.isConnected)return;const t=(now-t0)/1000;g.setTransform(dp,0,0,dp,0,0);g.clearRect(0,0,W,H);
  const gx=W/2,gy=spell?H*.5:H*.9;
  // Lichtschein + Sockel
  const rg=g.createRadialGradient(gx,H*.55,4,gx,H*.55,H*.62);rg.addColorStop(0,`rgba(${col},.38)`);rg.addColorStop(1,`rgba(${col},0)`);g.fillStyle=rg;g.fillRect(0,0,W,H);
  if(!spell){g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(gx,gy,sp.w*.34*(air?.7+.08*Math.sin(t*1.6):1),7,0,0,7);g.fill();
   g.strokeStyle=`rgba(${col},.5)`;g.lineWidth=1.5;g.beginPath();g.ellipse(gx,gy,sp.w*.42,9,0,0,7);g.stroke();}
  // Funken
  for(const p of P){const yy=((p.y-t*.06*p.s)%1+1)%1,al=Math.sin(yy*Math.PI)*.8;g.fillStyle=`rgba(${col},${al})`;g.beginPath();g.arc(p.x*W,yy*H,1.1+p.s*1.2,0,7);g.fill();}
  // Idle: Atmen, leichtes Wiegen, alle ~3,5 s eine kurze Kampfgeste
  const ph=t%3.6,flo=ph<.5?Math.sin(ph/.5*Math.PI):0;
  let sx=1-.012*Math.sin(t*2.2),sy=1+.028*Math.sin(t*2.2),rot=.025*Math.sin(t*1.25)+(bld||spell?0:.12*flo),dy=0;
  if(air){dy=-8-6*Math.sin(t*1.7);rot=.05*Math.sin(t*1.1);}
  if(bld){sx=1;sy=1+.01*Math.sin(t*2);rot=0;}
  if(spell){rot=t*.5;const s=1+.06*Math.sin(t*3);sx=sy=s;}
  g.save();g.translate(gx,gy+dy);g.rotate(rot);g.scale(sx,sy);
  if(spell)g.drawImage(sp.c,-sp.w/2,-sp.h/2,sp.w,sp.h);else g.drawImage(sp.c,-sp.fx,-sp.fy,sp.w,sp.h);g.restore();
  if(hero&&flo>0){g.globalAlpha=flo*.5;g.strokeStyle='#ffe9a0';g.lineWidth=3;g.beginPath();g.arc(gx,gy-sp.h*.55,sp.h*.42+flo*10,0,7);g.stroke();g.globalAlpha=1;}
  dcAnim=requestAnimationFrame(fr);};
 dcAnim=requestAnimationFrame(fr);}
// ----- Deck-Editor -----
const VIEW=Object.assign({f:'all',s:'cost'},LS.get('duell_view',{}));
const isHero=id=>CARDS[id].type==='hero';
function deckEditor(back){let d=G.deck.slice(),swap=null,flash=null;
 const others=()=>d.filter(id=>!isHero(id)),heroOf=()=>d.find(isHero);
 const err=()=>{const h=d.filter(isHero).length;if(h===0)return 'Es fehlt ein Held: Tippe einen Helden 👑 an und wähle „Als Held einsetzen“.';if(h>1)return 'Nur ein Held pro Deck erlaubt.';
  if(d.length<8)return 'Noch '+(8-d.length)+(8-d.length===1?' Karte':' Karten')+' frei – ein Deck braucht genau 8 Karten.';return Sim.validateDeck(d);};
 function add(id){if(d.includes(id))return;if(isHero(id)){const h=heroOf();if(h){d[d.indexOf(h)]=id;toast(CARDS[id].name+' ersetzt '+CARDS[h].name+' als Held.');}else d.push(id);flash=id;render();return;}
  if(others().length>=7){toast('Die 7 Plätze für Einheiten, Zauber und Gebäude sind voll – wähle „Tauschen“ oder entferne erst eine Karte.');swap={from:'coll',id};render();return;}
  d.push(id);flash=id;render();}
 function remove(id){d.splice(d.indexOf(id),1);render();}
 function replace(oldId,newId){const i=d.indexOf(oldId);if(i<0||d.includes(newId))return;d[i]=newId;flash=newId;swap=null;toast(CARDS[newId].name+' ersetzt '+CARDS[oldId].name+'.');render();}
 function compatible(a,b){return isHero(a)===isHero(b);}
 function detail(id){const inD=d.includes(id),C=CARDS[id],acts=[];let note='';
  if(!cardOpen(id)){const sc=DUELL_SCEN.find(s=>s.id===C.unlock);openCard(id,{note:`🔒 Noch gesperrt – besiege Kapitel ${C.unlock}${sc?' „'+esc(sc.title)+'“':''}, um diese Karte freizuschalten.`});return;}
  if(inD){acts.push({label:'➖ Entfernen',cls:'rm',fn:()=>remove(id)});acts.push({label:'⇄ Tauschen',fn:()=>{swap={from:'deck',id};render();}});note='✓ Im Deck'+(isHero(id)?' – dein Held':'');}
  else if(isHero(id)){const h=heroOf();acts.push({label:h?'👑 Als Held einsetzen':'👑 Als Held einsetzen',cls:'go',fn:()=>add(id)});if(h)note='Ersetzt deinen Helden '+esc(CARDS[h].name)+' (nur 1 Held pro Deck).';}
  else{const full=others().length>=7;if(!full)acts.push({label:'➕ Ins Deck',cls:'go',fn:()=>add(id)});acts.push({label:'⇄ Tauschen',cls:full?'go':'',fn:()=>{swap={from:'coll',id};render();}});if(full)note='Deck ist voll – tausche eine Karte aus.';}
  openCard(id,{actions:acts,note});}
 const render=()=>{const e=err(),h=heroOf(),o=others(),avg=I.avg(d);
  const slot=(id,i,hs)=>{if(!id)return `<div class="cd empty${hs?' hslot':''}${swap&&swap.from==='coll'&&isHero(swap.id)===!!hs?' tgt':''}" data-slot="${hs?'h':'e'}" data-i="${i}">${hs?'<i class="crown">👑</i><span>Held wählen</span>':'<i class="plus">+</i><span>frei</span>'}</div>`;
   const tg=swap&&swap.from==='coll'&&compatible(swap.id,id),me=swap&&swap.from==='deck'&&swap.id===id;
   return cardHTML(id,{cls:'in'+(hs?' hslot':'')+(tg?' tgt':'')+(me?' me':'')+(flash===id?' pop':''),i}).replace('<div ','<div draggable="true" ');};
  const slots=[slot(h,0,true)].concat(Array.from({length:7},(_,k)=>slot(o[k],k+1,false))).join('');
  let list=B.playerSet.filter(id=>VIEW.f==='all'||CARDS[id].type===VIEW.f);const nOpen=ownSet().length;
  const TO={hero:0,unit:1,bld:2,spell:3};
  list.sort((a,b)=>(VIEW.s==='name'?CARDS[a].name.localeCompare(CARDS[b].name,'de'):VIEW.s==='type'?(TO[CARDS[a].type]-TO[CARDS[b].type])||CARDS[a].cost-CARDS[b].cost:VIEW.s==='cost-'?CARDS[b].cost-CARDS[a].cost||CARDS[a].name.localeCompare(CARDS[b].name,'de'):CARDS[a].cost-CARDS[b].cost||CARDS[a].name.localeCompare(CARDS[b].name,'de')));
  const cnt=t=>B.playerSet.filter(id=>t==='all'||CARDS[id].type===t).length;
  const coll=list.map(id=>{if(!cardOpen(id))return cardHTML(id,{cls:'lockd'}).replace('</div>',`<i class="lkb">🔒 Kapitel ${CARDS[id].unlock}</i></div>`);const inD=d.includes(id),tg=swap&&swap.from==='deck'&&!inD&&compatible(swap.id,id);return cardHTML(id,{cls:(inD?'used':'')+(tg?' tgt':'')+(swap&&!tg&&swap.from==='deck'?' dim':'')}).replace('<div ','<div draggable="true" ').replace('</div>',inD?'<i class="ind">Im Deck</i></div>':'</div>');}).join('');
  const hint=swap?(swap.from==='coll'?`⇄ Tippe den Platz, den <b>${esc(CARDS[swap.id].name)}</b> ersetzen soll${isHero(swap.id)?' (Held-Platz)':''}.`:`⇄ Wähle in der Sammlung die Karte, die <b>${esc(CARDS[swap.id].name)}</b> ersetzen soll.`):
   (e?esc(e):'✓ Deck bereit! Tippe eine Karte an, um sie dir anzusehen oder zu tauschen.');
  show(`<div class="box deck scr"><div class="sh"><button class="bk" id="bBack" aria-label="Zurück">←</button><h2>Deck &amp; Sammlung</h2></div>
   <div class="dstat"><span class="pill">🃏 <b>${d.length}/8</b></span><span class="pill">💧 Ø <b id="avgM">${I.fx(avg,1)}</b> Mana</span><span class="pill ${d.filter(isHero).length===1?'ok':'bad'}" id="heroRule">👑 Held ${d.filter(isHero).length===1?'✓':'fehlt'}</span></div>
   <div class="slots">${slots}</div>
   <p class="msg ${swap?'sw':e?'bad':'ok'}" id="deckMsg">${hint}${swap?' <button class="sm2" id="bSwX">Abbrechen</button>':''}</p>
   <div class="colh"><h3>Sammlung <small>${nOpen}/${B.playerSet.length} Karten</small></h3>
    <label class="sort">Sortieren <select id="dSort"><option value="cost">Kosten ↑</option><option value="cost-">Kosten ↓</option><option value="type">Typ</option><option value="name">Name</option></select></label></div>
   <div class="flt">${['all','hero','unit','spell','bld'].map(t=>`<button class="chipb${VIEW.f===t?' on':''}" data-f="${t}">${t==='all'?'Alle':TICON[t]+' '+(t==='hero'?'Helden':t==='unit'?'Einheiten':t==='spell'?'Zauber':'Gebäude')} <small>${cnt(t)}</small></button>`).join('')}</div>
   <div class="coll">${coll||'<p class="sub">Keine Karten.</p>'}</div>
   <div class="row stick"><button id="bStd">↺ Standarddeck</button><button class="go" id="bOk" ${e?'disabled':''}>✔ Fertig</button></div></div>`,'d');
  flash=null;$('dSort').value=VIEW.s;
  $('bBack').onclick=()=>{if(!err()&&d.join()!==G.deck.join()){G.deck=d.slice();saveDeck(G.deck);toast('Deck gespeichert.');}else if(err()&&d.join()!==G.deck.join())toast('Ungültiges Deck verworfen – dein altes Deck bleibt aktiv.');back();};
  if($('bSwX'))$('bSwX').onclick=()=>{swap=null;render();};
  ov.querySelectorAll('.flt [data-f]').forEach(b=>b.onclick=()=>{VIEW.f=b.dataset.f;LS.set('duell_view',VIEW);render();});
  $('dSort').onchange=()=>{VIEW.s=$('dSort').value;LS.set('duell_view',VIEW);render();};
  ov.querySelectorAll('.slots .cd').forEach(c=>c.onclick=()=>{audio();const id=c.dataset.id;
   if(swap&&swap.from==='coll'){const hs=c.classList.contains('hslot');if(isHero(swap.id)!==hs){toast(isHero(swap.id)?'Ein Held gehört auf den goldenen Held-Platz.':'Der goldene Platz ist nur für deinen Helden.');return;}
    if(id)replace(id,swap.id);else{const s=swap.id;swap=null;d.push(s);flash=s;render();}return;}
   if(swap&&swap.from==='deck'){if(id===swap.id){swap=null;render();return;}}
   if(!id){if(c.dataset.slot==='h'){VIEW.f='hero';swap=null;render();toast('Wähle einen Helden aus der Sammlung.');}else toast('Tippe eine Karte in der Sammlung an und wähle „Ins Deck“.');return;}
   detail(id);});
  ov.querySelectorAll('.coll .cd').forEach(c=>c.onclick=()=>{audio();const id=c.dataset.id;
   if(swap&&swap.from==='deck'){if(c.classList.contains('tgt')){replace(swap.id,id);return;}if(d.includes(id)){toast('Diese Karte ist schon im Deck.');return;}toast(isHero(swap.id)?'Ein Held kann nur gegen einen Helden getauscht werden.':'Helden kommen nur auf den Held-Platz.');return;}
   if(swap&&swap.from==='coll'&&swap.id!==id){swap=null;}
   detail(id);});
  // Drag & Drop (Maus am PC)
  ov.querySelectorAll('.cd.lockd').forEach(c=>c.removeAttribute('draggable'));
  ov.querySelectorAll('.cd[draggable]').forEach(c=>{c.addEventListener('dragstart',ev=>{ev.dataTransfer.setData('text/plain',JSON.stringify({id:c.dataset.id,inD:!!c.closest('.slots')}));ev.dataTransfer.effectAllowed='move';c.classList.add('drg');});
   c.addEventListener('dragend',()=>c.classList.remove('drg'));});
  const rd=ev=>{try{return JSON.parse(ev.dataTransfer.getData('text/plain'));}catch(_){return null;}};
  ov.querySelectorAll('.slots .cd').forEach(s=>{s.addEventListener('dragover',ev=>{ev.preventDefault();s.classList.add('ovr');});s.addEventListener('dragleave',()=>s.classList.remove('ovr'));
   s.addEventListener('drop',ev=>{ev.preventDefault();s.classList.remove('ovr');const D=rd(ev);if(!D||D.inD)return;const hs=s.classList.contains('hslot');
    if(isHero(D.id)!==hs){toast(isHero(D.id)?'Helden gehören auf den goldenen Held-Platz.':'Der goldene Platz ist nur für deinen Helden.');return;}
    if(d.includes(D.id))return;if(s.dataset.id)replace(s.dataset.id,D.id);else{d.push(D.id);flash=D.id;render();}});});
  const cz=ov.querySelector('.coll');cz.addEventListener('dragover',ev=>ev.preventDefault());cz.addEventListener('drop',ev=>{ev.preventDefault();const D=rd(ev);if(D&&D.inD&&d.includes(D.id))remove(D.id);});
  $('bStd').onclick=()=>{d=B.defaultDeck.slice();swap=null;render();toast('Standarddeck geladen.');};
  $('bOk').onclick=()=>{const e=Sim.validateDeck(d);if(e){toast(e);return;}G.deck=d.slice();saveDeck(G.deck);back();};};
 render();}
// ---------- Kampf ----------
function start(o){const seed=(Date.now()%1e9)|0||7;G.mode=o.mode;G.scen=o.scen||null;const oppKey=o.opp||DUELL_SCEN.find(s=>s.id===o.scen).opp,O=DUELL_OPP[oppKey];G.opp=oppKey;
 const err=Sim.validateDeck(G.deck);if(err){toast(err);deckEditor(menu);return;}
 G.S=Sim.create({seed:o.seed||seed,decks:[G.deck,O.deck],mods:[{},O.mods]});G.ai=DuellAI.create(O.ai,1,(o.seed||seed)*7+3);G.auto=o.auto?DuellAI.create('bot',0,(o.seed||seed)*3+1):(G.auto?DuellAI.create('bot',0,(o.seed||seed)*3+1):null);
 G.endShown=false;G.sel=null;G.aim=false;G.acc=0;DR.reset();phaseReset();hide();$('app').classList.remove('inmenu');
 $('oppName').textContent=O.name;$('oppImg').src=DR.icon(O.portrait,48);G.paused=false;G.last=performance.now();buildHand(true);banner('Bereit …',1.2);}
function step1(){const S=G.S;if(S.over)return;// nach Spielende keine alten Ereignisse erneut auswerten
 if(G.ai){const c=DuellAI.think(G.ai,S);if(c)Sim.issue(S,c);}if(G.auto){const c=DuellAI.think(G.auto,S);if(c)Sim.issue(S,c);}
 Sim.step(S);const ev=S.ev;if(ev.length){DR.onEvents(ev,S);sfxEvents(ev);}phaseWatch(S,ev);}
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
function phaseHud(S){const D=Sim.DOUBLE,M=Sim.MATCH;let lab,t,cls='',fill,mark=true;
 if(S.phase==='count'){lab='×2 Mana in';t=M-D;fill=0;}
 else if(S.phase==='play'&&!S.dbl){lab='×2 Mana in';t=S.matchT-D;fill=(M-S.matchT)/M;}
 else if(S.phase==='play'){lab='Spielende in';t=S.matchT;cls='dbl';fill=(M-S.matchT)/M;}
 else if(S.phase==='sudden'){lab='Sudden Death';t=S.suddenT;cls='sd';fill=S.suddenT/Sim.SUDDEN;mark=false;}
 else{lab='Ende';t=0;fill=1;cls=S.winner===0?'win':'';}
 const last=(S.phase==='play'||S.phase==='sudden')&&t<=10&&(S.phase==='sudden'||S.dbl);
 const tm=fmt(t);if($('timer').textContent!==tm)$('timer').textContent=tm;$('timer').className=cls+(last?' last':'');
 if($('plabel').textContent!==lab)$('plabel').textContent=lab;$('plabel').className=cls;
 $('pfill').style.width=(Math.max(0,Math.min(1,fill))*100).toFixed(1)+'%';$('pbar').className=cls;$('pmark').style.display=mark?'':'none';
 $('x2').style.display=(S.dbl||S.phase==='sudden')&&S.phase!=='over'?'':'none';
 $('tbox').dataset.phase=S.phase==='play'?(S.dbl?'double':'normal'):S.phase;}
function towerHud(S){const parts=[['tsE0','guard',0],['tsEk','keep',-1],['tsE1','guard',1]];
 for(const[id,sub,lane]of parts){const t=sub==='keep'?Sim.tower(S,1,'keep'):Sim.tower(S,1,'guard',lane),el=$(id);const hp=t&&t.hp>0?Math.ceil(t.hp):0,mx=t?t.maxhp:1;
  const txt=hp>0?String(hp):'✖';if(el.dataset.v!==txt){el.dataset.v=txt;el.querySelector('b').textContent=txt;}el.querySelector('i').style.width=(hp/mx*100).toFixed(1)+'%';
  el.classList.toggle('dead',hp<=0);el.classList.toggle('low',hp>0&&hp/mx<.33);if(sub==='keep')el.classList.toggle('sleep',!!(t&&hp>0&&!t.active));}
 const sc=S.p[0].crowns+' : '+S.p[1].crowns;if($('score').dataset.v!==sc){$('score').dataset.v=sc;$('scoreN').textContent=sc;}}
function hud(){const S=G.S,p=S.p[0];buildHand();
 phaseHud(S);towerHud(S);
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
   const nx=DUELL_SCEN.find(s=>s.id===sc.id+1);if(nx&&fresh)extra+=`<p class="unlock">🔓 Szenario ${nx.id} „${esc(nx.title)}“ freigeschaltet!</p>`;
   const nc=fresh?B.playerSet.filter(id=>CARDS[id].unlock===sc.id):[];if(nc.length)extra+=`<p class="unlock">🔓 Neue Karten für deine Sammlung:</p><div class="newc">${nc.map(id=>`<button class="mi t-${CARDS[id].type}" data-card="${id}" aria-label="${esc(CARDS[id].name)}"><img src="${DR.icon(artOf(id),48)}" alt=""><b>${CARDS[id].cost}</b><span>${esc(CARDS[id].name)}</span></button>`).join('')}</div>`;
   if(!nx&&fresh)extra+=`<p class="unlock">🏆 Du hast die Kampagne abgeschlossen!</p>`;}
  else extra=`<p class="story">${esc(sc.lose)}</p>`;}
 try{audio();if(!PW.endSnd){PW.endSnd=true;snd(win?'fanfare':'darkHorn');}}catch(_){}
 const nx=G.mode==='camp'&&win&&DUELL_SCEN.find(s=>s.id===G.scen+1);
 show(`<div class="box end ${win?'win':draw?'draw':'lose'}"><h1>${win?'Sieg!':draw?'Unentschieden':'Niederlage'}</h1>
  <div class="crowns"><div><small>Du</small>${[0,1,2].map(i=>`<i class="${i<S.p[0].crowns?'on b':''}">♛</i>`).join('')}</div><div><small>${esc(DUELL_OPP[G.opp].name)}</small>${[0,1,2].map(i=>`<i class="${i<S.p[1].crowns?'on r':''}">♛</i>`).join('')}</div></div>
  <p class="sub">${esc(S.reason||'')} · ${fmt(S.t-3)} gespielt · ${S.p[0].plays} Karten</p>${extra}
  <div class="col">${nx?`<button class="big go" id="bNext">▶ Weiter: ${esc(nx.title)}</button>`:''}<button class="big${nx?'':' go'}" id="bAgain">↻ Revanche</button><button class="big" id="bMenu">☰ Menü</button></div></div>`,'e');
 bindCardTaps(ov);if(nx)$('bNext').onclick=()=>story(nx.id);$('bAgain').onclick=()=>G.mode==='camp'?story(G.scen):start({mode:'free',opp:G.opp});$('bMenu').onclick=()=>{G.S=null;menu();};}
G.endScreen=endScreen;
$('bPause').onclick=()=>{audio();G.paused?resume():pause();};
$('bMus').onclick=()=>{audio();SFX.toggle('music');hudBtns();};$('bSfx').onclick=()=>{audio();SFX.toggle('sfx');hudBtns();};
// ---------- Start ----------
function fit(){DR.resize();}
window.addEventListener('resize',()=>{fit();});
// Canvas-Größe ändert sich auch ohne Fenster-Resize (Menü ↔ Spiel, Turm-Leiste) → neu einpassen, sonst wird das Bild gestaucht
if(window.ResizeObserver)new ResizeObserver(()=>fit()).observe($('cv'));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.S&&!G.paused&&!G.S.over)pause();});
measureArt();DR.init(cv);hudBtns();menu();requestAnimationFrame(t=>{G.last=t;loop(t);});
})();
