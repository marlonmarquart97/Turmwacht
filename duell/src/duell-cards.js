// ===== Turmwacht Duell – Karten-Infos für Menü & Detailkarte (0.4) =====
// Nur Anzeige: Seltenheit, Lore und aufbereitete Werte. Alle Zahlen werden live aus TW_BESTIARY gelesen – keine eigenen Spielwerte.
const DUELL_INFO=(()=>{const B=TW_BESTIARY,C=B.cards;
 const TYPE={hero:'Held',unit:'Einheit',spell:'Zauber',bld:'Gebäude'};
 const LORE={
  orcs:'Söldner aus den Felsklippen. Für einen Krug Met und eine gute Prügelei stellen sie sich vor jede Brücke.',
  archers:'Die Elfen der Grenzwälder treffen eine Fledermaus im Mondlicht – und verfehlen selten zweimal.',
  firemage:'Ein Gelehrter der Flammenakademie. Er redet wenig, aber seine Feuerbälle sprechen für sich.',
  alch:'Halb Gelehrter, halb Goblin. Was in seinen Flaschen brodelt, weiß nicht einmal er genau.',
  sling:'Ein knarrendes Holzgestell, zwei kichernde Bediener und viele fliegende Orks. Die Orks fragen nicht, wohin.',
  ranger:'Ein Wachturm der Waldläufer, in einer Nacht errichtet. Von oben sieht man jeden Feind kommen.',
  well:'Eine uralte Quelle voller Magie. Wer sie hütet, dem geht das Mana nicht so schnell aus.',
  blade:'Der Klingenmeister hat den Schattenpass hundertmal verteidigt. Sein Sprung lässt Schildwälle zerbrechen.',
  frosthero:'Er kam aus den Eisgipfeln, um den Pass zu bewachen. Wo er geht, gefriert der Atem der Feinde.',
  poisonhero:'Sie mischt Tränke für Heiler – und Gifte für alle anderen. Ihre grünen Wolken fürchtet jedes Heer.',
  zepp:'Kobold-Ingenieure halten es für sicher. Die Bomben sind es eher nicht.',
  giant:'Aus den Knochen eines Riesen zusammengefügt. Selbst sein Tod ist eine Waffe.',
  shaman:'Er singt die alten Lieder der Steppe. Wunden schließen sich, und manchmal fährt ein Blitz aus den Wolken.',
  bats:'Ein kreischender Schwarm aus den Höhlen unter dem Pass. Einzeln harmlos, zusammen eine Plage.',
  firerain:'Ein uralter Kriegszauber. Der Himmel glüht kurz auf – dann regnet es Feuer.',
  frost:'Eisige Winde aus dem Norden. Für drei Herzschläge steht die Zeit still.',
  skels:'Morvaths Fußvolk. Sie klappern, sie zerfallen – und sie stehen immer wieder auf.',
  skelarch:'Selbst im Tod spannen sie noch ihre Bögen. Ihre Pfeile sind kalt wie ein Grab.',
  knight:'Einst ein stolzer Ritter der Turmwacht, heute Morvaths Wächter in rostiger Rüstung.',
  wolves:'Grimmzahns Lieblinge. Sie jagen im Rudel und riechen Angst über die ganze Schlucht.',
  ogre:'Ein Oger mit einem einzigen Ziel: Mauern einreißen. Alles andere übersieht er.',
  lich:'Morvath selbst, Herr der Gruft. Jeder Gefallene hört seinen Ruf.'};
 const fx=(n,d)=>{d=d==null?1:d;return(+n).toFixed(d).replace(/\.0+$/,'').replace('.',',');};
 const pct=f=>Math.round(f*100)+' %';
 function rarity(id){const c=C[id];if(c.type==='hero')return{k:'leg',n:'Legendär'};if(c.cost>=6)return{k:'epic',n:'Episch'};if(c.cost>=4)return{k:'rare',n:'Selten'};return{k:'com',n:'Gewöhnlich'};}
 function target(tg,air){return(tg==='bld'?'Nur Gebäude & Türme':tg==='any'?'Boden, Luft & Gebäude':'Boden & Gebäude');}
 function speedName(s){return s<20?'langsam':s<28?'mittel':s<40?'schnell':'sehr schnell';}
 // Vergleichsgrößen über alle Einheiten-/Heldenkarten (für Balken)
 const U=Object.values(C).filter(c=>c.u).map(c=>c.u);
 const MAX={hp:Math.max(...U.map(u=>u.hp)),dmg:Math.max(...U.map(u=>u.dmg)),dps:Math.max(...U.map(u=>u.dmg/u.hit)),range:Math.max(...U.map(u=>u.range)),spd:Math.max(...U.map(u=>u.spd)),hit:Math.min(...U.map(u=>u.hit)),
  bhp:Math.max(...Object.values(C).filter(c=>c.b).map(c=>c.b.hp)),sdmg:Math.max(...Object.values(C).filter(c=>c.s).map(c=>c.s.dmg)),sr:Math.max(...Object.values(C).filter(c=>c.s).map(c=>c.s.r))};
 // Werte-Zeilen: {k:Label, v:Text, f:Balken 0..1 (optional), sub:Zusatz}
 function stats(id){const c=C[id],R=[];
  if(c.u){const u=c.u,n=c.count||1,dps=u.dmg/u.hit;
   R.push({k:'Leben',v:fx(u.hp,0),f:u.hp/MAX.hp,sub:n>1?'×'+n+' = '+fx(u.hp*n,0):''});
   R.push({k:'Schaden',v:fx(u.dmg,0),f:u.dmg/MAX.dmg,sub:u.splash?'Fläche':''});
   R.push({k:'DPS',v:fx(dps,0),f:dps/MAX.dps,sub:n>1?'×'+n+' = '+fx(dps*n,0):''});
   R.push({k:'Angriffstempo',v:fx(u.hit,1)+' s',f:MAX.hit/u.hit,sub:u.hit<=1?'schnell':u.hit>=1.5?'langsam':'mittel'});
   R.push({k:'Reichweite',v:u.range<=14?'Nahkampf':fx(u.range/B.tile,1)+' Felder',f:u.range/MAX.range});
   R.push({k:'Tempo',v:speedName(u.spd),f:u.spd/MAX.spd,sub:fx(u.spd,0)});
   R.push({k:'Ziel',v:target(u.tg)});R.push({k:'Anzahl',v:String(n)});
   if(c.air)R.push({k:'Bewegung',v:'Fliegt'});}
  else if(c.b){const b=c.b;R.push({k:'Leben',v:fx(b.hp,0),f:b.hp/MAX.bhp});R.push({k:'Lebensdauer',v:fx(b.life,0)+' s'});
   if(b.dmg){R.push({k:'Schaden',v:fx(b.dmg,0),f:b.dmg/MAX.dmg});R.push({k:'DPS',v:fx(b.dmg/b.hit,0),f:b.dmg/b.hit/MAX.dps});R.push({k:'Angriffstempo',v:fx(b.hit,1)+' s',f:MAX.hit/b.hit});R.push({k:'Reichweite',v:fx(b.range/B.tile,1)+' Felder',f:Math.min(1,b.range/MAX.range)});R.push({k:'Ziel',v:target(b.tg)});}
   if(b.spawn){const s=C[b.spawn.card];R.push({k:'Erzeugt',v:'1 '+s.name.replace(/-Krieger$/,'')+' / '+fx(b.spawn.every,0)+' s'});}
   if(b.mana)R.push({k:'Mana',v:'+'+b.mana.amt+' alle '+fx(b.mana.every,0)+' s'});
   R.push({k:'Anzahl',v:'1 Gebäude'});}
  else if(c.s){const s=c.s;R.push({k:'Schaden',v:fx(s.dmg,0),f:s.dmg/MAX.sdmg,sub:'Türme '+pct(s.tower)});R.push({k:'Radius',v:fx(s.r/B.tile,1)+' Felder',f:s.r/MAX.sr});
   if(s.delay)R.push({k:'Verzögerung',v:fx(s.delay,1)+' s'});if(s.freeze)R.push({k:'Einfrieren',v:fx(s.freeze,1)+' s'});R.push({k:'Ziel',v:'Boden & Luft, beliebiger Ort'});}
  return R;}
 // Fähigkeiten-Text automatisch aus den Daten
 function abilities(id){const c=C[id],L=[];const u=c.u,b=c.b,s=c.s;
  if(u){if(u.proj&&u.range>14&&!u.bomb)L.push('Fernkampf'+(u.tg==='any'?' – trifft auch Flieger.':'.'));
   if(u.range<=14&&!u.bomb)L.push('Nahkampf'+(u.tg==='ground'?' – kann keine Flieger angreifen.':'.'));
   if(u.splash)L.push('Flächenschaden im Radius '+fx(u.splash/B.tile,1)+' Felder.');
   if(u.bomb)L.push('Wirft Bomben auf Gebäude und Türme.');
   if(u.tg==='bld'&&!u.bomb)L.push('Ignoriert Truppen und marschiert direkt auf Gebäude und Türme.');
   if(c.air)L.push('Fliegt – nur Fernkämpfer, Türme und Zauber erreichen ihn.');
   if(u.puddle){const p=u.puddle;L.push('Giftpfütze: '+fx(p.dps,0)+' Schaden/s für '+fx(p.t,1)+' s, verlangsamt um '+pct(p.slow)+'.');}
   if(u.slow)L.push('Verlangsamt Getroffene um '+pct(u.slow.f)+' für '+fx(u.slow.t,1)+' s.');
   if(u.dot)L.push('Gift: '+fx(u.dot.dps,0)+' Schaden/s für '+fx(u.dot.t,0)+' s.');
   if(u.heal)L.push('Heilt Verbündete im Umkreis von '+fx(u.heal.r/B.tile,1)+' Feldern um '+fx(u.heal.hps,0)+' Leben/s.');
   if(u.death){const d=u.death;L.push('Beim Tod: Explosion nach '+fx(d.fuse,1)+' s, '+fx(d.dmg,0)+' Schaden'+(d.knock?', schleudert Truppen weg':'')+'.');}}
  if(c.abil){const A=c.abil,first=fx(A.charge*.6,0);let t='';
   if(A.key==='leap')t='springt bis '+fx(A.reach/B.tile,1)+' Felder weit auf ein Ziel: '+fx(A.dmg,0)+' Flächenschaden, betäubt '+fx(A.stun,1)+' s.';
   else if(A.key==='nova')t='friert alles um den Helden '+fx(A.freeze,1)+' s ein und verursacht '+fx(A.dmg,0)+' Schaden.';
   else if(A.key==='cloud')t='Giftwolke für '+fx(A.t,0)+' s: '+fx(A.dps,0)+' Schaden/s, verlangsamt um '+pct(A.slow)+', trifft auch Flieger.';
   else if(A.key==='summon')t='erweckt '+A.summon.n+' Skelette (wie „'+C[A.summon.card].name+'“) an einem Zielort.';
   L.push({abil:A.name,t,charge:'lädt '+fx(A.charge,0)+' s (erstmals nach ~'+first+' s)'});}
  if(b){if(b.spawn)L.push('Schleudert alle '+fx(b.spawn.every,0)+' s einen '+C[b.spawn.card].name.replace(/-Krieger$/,'-Krieger')+' über die Schlucht.');
   if(b.mana)L.push('Erzeugt '+fx(b.life,0)+' s lang alle '+fx(b.mana.every,0)+' s '+b.mana.amt+' Mana (insgesamt +'+Math.floor(b.life/b.mana.every)*b.mana.amt+').');
   if(b.dmg)L.push('Schießt Pfeile auf Boden und Luft und lockt Bodentruppen an.');
   L.push('Zerfällt nach '+fx(b.life,0)+' s. Nur auf deiner Hälfte baubar.');}
  if(s){L.push('Wirkt an jeder Stelle des Feldes'+(s.delay?' nach '+fx(s.delay,1)+' s':'')+'.');if(s.freeze)L.push('Friert Einheiten und Türme '+fx(s.freeze,0)+' s ein.');L.push('Türme erleiden nur '+pct(s.tower)+' des Schadens.');}
  return L;}
 function avg(deck){return deck.length?deck.reduce((a,id)=>a+C[id].cost,0)/deck.length:0;}
 return{TYPE,LORE,rarity,stats,abilities,avg,fx,MAX};})();
if(typeof module!=='undefined')module.exports=DUELL_INFO;
