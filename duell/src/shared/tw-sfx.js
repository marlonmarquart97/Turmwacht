// ===== Turmwacht – gemeinsame Klang-Engine (Web Audio, prozedural): Tavernen-Musik, Kaminfeuer-Musik, Effekte =====
// Benötigt ein globales LS-Objekt {get(k,d),set(k,v)}.
// ---------- Klang: prozedurale Web-Audio-Musik & Effekte ----------
const SFX=(()=>{let A=null,master,mus,fx,noiseBuf,on={music:LS.get('music',true),sfx:LS.get('sfx',true)},track=LS.get('track','tavern')==='calm'?'calm':'tavern',next=0,step=0,timer=null,last={};
 function init(){if(A)return A;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  try{A=new AC();}catch(e){A=null;return null;}
  const comp=A.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.connect(A.destination);
  master=A.createGain();master.gain.value=.9;master.connect(comp);mus=A.createGain();mus.gain.value=on.music?.25:0;mus.connect(master);fx=A.createGain();fx.gain.value=on.sfx?.5:0;fx.connect(master);
  noiseBuf=A.createBuffer(1,A.sampleRate*1.5,A.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  next=A.currentTime+.1;timer=setInterval(sched,90);return A;}
 function resume(){if(!A)init();if(A&&A.state==='suspended')A.resume().catch(()=>{});}
 const mtof=m=>440*Math.pow(2,(m-69)/12);
 function env(g,t,a,peak,dec,sus=0.0001){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(Math.max(sus,.0001),t+a+dec);}
 function osc(type,f,t,dur,peak,dest,a=.005,f2){const o=A.createOscillator(),g=A.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);env(g,t,a,peak,dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+a+dur+.05);return o;}
 function noise(t,dur,peak,dest,ftype='bandpass',f=1000,q=1,f2,a=.003){const n=A.createBufferSource(),bf=A.createBiquadFilter(),g=A.createGain();n.buffer=noiseBuf;bf.type=ftype;bf.frequency.setValueAtTime(f,t);if(f2)bf.frequency.exponentialRampToValueAtTime(f2,t+dur);bf.Q.value=q;env(g,t,a,peak,dur);n.connect(bf);bf.connect(g);g.connect(dest);n.start(t,Math.random()*.5);n.stop(t+a+dur+.05);}
 // Instrumente
 function pluck(m,t,v=.5,len=.55){const f=mtof(m),lp=A.createBiquadFilter(),g=A.createGain();lp.type='lowpass';lp.frequency.setValueAtTime(f*7,t);lp.frequency.exponentialRampToValueAtTime(f*1.6,t+.25);lp.Q.value=2;
  for(const[ty,dt,vv]of[['sawtooth',0,.6],['triangle',3,.8]]){const o=A.createOscillator();o.type=ty;o.frequency.value=f;o.detune.value=dt;const og=A.createGain();og.gain.value=vv;o.connect(og);og.connect(lp);o.start(t);o.stop(t+len+.1);}
  env(g,t,.003,v,len);lp.connect(g);g.connect(mus);}
 function flute(m,t,dur,v=.32){const f=mtof(m),o=A.createOscillator(),o2=A.createOscillator(),g=A.createGain(),lfo=A.createOscillator(),lg=A.createGain();o.type='sine';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f*2;
  lfo.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.012,t+Math.min(.35,dur*.6));lfo.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
  const g2=A.createGain();g2.gain.value=.12;o2.connect(g2);g2.connect(g);o.connect(g);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.05);g.gain.setValueAtTime(v*.85,t+Math.max(.06,dur-.08));g.gain.exponentialRampToValueAtTime(.0001,t+dur+.06);g.connect(mus);
  for(const x of[o,o2,lfo]){x.start(t);x.stop(t+dur+.1);}noise(t,.06,.05,mus,'bandpass',f*2,2);}
 function fdrum(t,v=.7){const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(48,t+.18);env(g,t,.002,v,.28);o.connect(g);g.connect(fx);o.start(t);o.stop(t+.35);noise(t,.04,v*.25,fx,'lowpass',900);}
 function drum(t,v=.7){const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(48,t+.18);env(g,t,.002,v,.28);o.connect(g);g.connect(mus);o.start(t);o.stop(t+.35);noise(t,.04,v*.25,mus,'lowpass',900);}
 function tamb(t,v=.12){noise(t,.07,v,mus,'highpass',7000,.7);noise(t+.012,.05,v*.6,mus,'bandpass',9500,6);}
 // Melodie: D-dorisch, 100 bpm, Achtel
 const _=null,PH={A:[7,_,10,9,7,_,5,3,5,_,7,5,3,2,0,_],B:[0,2,3,5,7,_,7,9,10,9,7,5,7,_,_,_],C:[12,_,10,9,7,_,9,10,12,_,14,12,10,9,7,_],D:[5,_,7,5,3,_,2,3,2,_,_,0,0,_,_,_],E:[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]};
 const CH={A:[[0,0],[-2,1]],B:[[0,0],[7,0]],C:[[3,1],[-2,1]],D:[[5,0],[0,0]],E:[[0,0],[-2,1]]};
 const FORM=['E','A','B','A','D','C','C','B','D','E','A','B','A','D'];const EI=60/100/2;
 // --- Zweite Melodie: „Kaminfeuer“ – G-Dur, 76 bpm, Harfe/Laute/Flöte, ruhig ---
 function harp(m,t,v=.22,len=1.6){const f=mtof(m),lp=A.createBiquadFilter(),g=A.createGain();lp.type='lowpass';lp.frequency.setValueAtTime(f*6,t);lp.frequency.exponentialRampToValueAtTime(f*2,t+.4);
  for(const[ty,mul,vv]of[['triangle',1,.8],['sine',2,.25],['sine',3,.08]]){const o=A.createOscillator();o.type=ty;o.frequency.value=f*mul;const og=A.createGain();og.gain.value=vv;o.connect(og);og.connect(lp);o.start(t);o.stop(t+len+.1);}
  env(g,t,.004,v,len);lp.connect(g);g.connect(mus);}
 function drone(m,t,dur,v=.12){const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();o.type='triangle';o.frequency.value=mtof(m);lp.type='lowpass';lp.frequency.value=400;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.5);g.gain.setValueAtTime(v,t+dur-.6);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(lp);lp.connect(g);g.connect(mus);o.start(t);o.stop(t+dur+.05);}
 function crackle(t){noise(t,.025,.05+Math.random()*.05,mus,'highpass',2500+Math.random()*3000,1);}
 const PH2={A:[4,_,_,2,0,_,2,4,7,_,_,_,4,_,_,_],B:[9,_,7,_,4,_,2,_,4,_,_,2,0,_,_,_],C:[12,_,_,11,9,_,7,_,9,_,7,4,7,_,_,_],D:[4,_,2,_,0,_,-1,_,0,_,_,_,_,_,_,_],E:[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]};
 const CH2={A:[[0,1],[-3,0]],B:[[5,1],[7,1]],C:[[5,1],[2,0]],D:[[7,1],[0,1]],E:[[0,1],[5,1]]};
 const FORM2=['E','A','B','A','D','C','B','C','D','E','A','D'];const EI2=60/76/2;
 function sched2(){while(next<A.currentTime+.3){const pi=Math.floor(step/16)%FORM2.length,k=FORM2[pi],i=step%16,t=next;
   const mel=PH2[k],nt=mel[i];if(nt!=null){let len=1;while(i+len<16&&mel[i+len]==null&&len<5)len++;flute(67+nt,t,len*EI2*.97,.2);}
   const[root,maj]=CH2[k][i>>3],b=43+root,third=maj?4:3,pat=[0,7,12,12+third,19,12+third,12,7];
   harp(b+12+pat[i%8],t,i%8===0?.2:.13,1.5);if(i%8===0)drone(b,t,EI2*8+.2,.1);if(i%8===4)pluck(b+12,t,.08,.6);
   if(Math.random()<.3)crackle(t+Math.random()*EI2);next+=EI2;step++;}}
 function sched(){if(!A||A.state!=='running')return;if(!on.music){next=A.currentTime+.05;return;}if(track==='calm'){sched2();return;}
  while(next<A.currentTime+.25){const pi=Math.floor(step/16)%FORM.length,k=FORM[pi],i=step%16,t=next;
   const mel=PH[k],nt=mel[i];if(nt!=null){let len=1;while(i+len<16&&mel[i+len]==null&&len<4)len++;flute(74+nt,t,len*EI*.95);}
   const[root,maj]=CH[k][i>>3],b=50+root,third=maj?4:3,pat=[0,7,12,12+third,12,7,12+7,7];
   pluck(b+pat[i%8],t,i%8===0?.34:.22,.5);if(i%8===0)pluck(b-12,t,.4,.9);if(i%8===4)pluck(b-12+7,t,.25,.6);
   if(i%4===0)drum(t,i%8===0?.7:.45);else if(i%8===7)drum(t,.3);if(i%2===1)tamb(t,i%4===3?.14:.08);
   next+=EI;step++;}}
 function ok(key,gap){if(!A||!on.sfx||A.state!=='running')return false;const n=A.currentTime;if(last[key]&&n-last[key]<gap)return false;last[key]=n;return true;}
 const T=()=>A.currentTime+.01;
 const api={init,resume,get ctx(){return A},get master(){return master},on,get track(){return track},get step(){return step},
  setTrack(k){k=k==='calm'?'calm':'tavern';if(k===track)return track;track=k;LS.set('track',k);step=0;if(A){next=A.currentTime+.12;mus.gain.cancelScheduledValues(A.currentTime);mus.gain.setValueAtTime(0,A.currentTime);mus.gain.setTargetAtTime(on.music?.25:0,A.currentTime+.1,.15);}return track;},
  toggle(k){on[k]=!on[k];LS.set(k,on[k]);if(A){(k==='music'?mus:fx).gain.setTargetAtTime(on[k]?(k==='music'?.25:.5):0,A.currentTime,.05);}return on[k];},
  shot(kind){if(kind==='archer'){if(!ok('arrow',.07))return;const t=T();osc('triangle',900,t,.06,.18,fx,.002,420);noise(t,.09,.16,fx,'bandpass',3000,1.5,900);}
   else if(kind==='mage'){if(!ok('fire',.12))return;const t=T();noise(t,.32,.28,fx,'bandpass',400,1.2,1800,.06);}
   else if(kind==='catapult'){if(!ok('cat',.2))return;const t=T();osc('sine',140,t,.18,.5,fx,.003,55);noise(t,.12,.2,fx,'lowpass',600);
    osc('sawtooth',170,t+.05,.28,.18,fx,.02,95);osc('square',85,t+.05,.25,.06,fx,.02,60);}
   else if(kind==='alch'){if(!ok('alch',.12))return;const t=T();osc('sine',1700,t,.12,.12,fx,.002,1500);osc('sine',2500,t+.03,.1,.08,fx);}},
  boom(){if(!ok('boom',.08))return;const t=T();noise(t,.45,.5,fx,'lowpass',1600,1,160);osc('sine',90,t,.35,.45,fx,.004,38);},
  grunt(){if(!ok('grunt',.25))return;const t=T(),f=110+Math.random()*40;const o=A.createOscillator(),bp=A.createBiquadFilter(),g=A.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f*1.3,t);o.frequency.exponentialRampToValueAtTime(f*.8,t+.25);
   bp.type='bandpass';bp.frequency.value=650;bp.Q.value=3;env(g,t,.02,.35,.25);o.connect(bp);bp.connect(g);g.connect(fx);o.start(t);o.stop(t+.35);noise(t,.15,.05,fx,'bandpass',500,2);},
  splash(){if(!ok('splash',.1))return;const t=T();noise(t,.22,.22,fx,'lowpass',1400,1,300);for(let i=0;i<3;i++)osc('sine',400+Math.random()*500,t+.04+i*.05,.05,.1,fx,.002,900+Math.random()*600);},
  cast(k){if(!ok('cast'+k,.2))return;const t=T();if(k==='fire'){noise(t,.9,.35,fx,'bandpass',200,1,2400,.15);osc('sawtooth',70,t,.8,.2,fx,.1,40);}
   else{for(const f of[1320,1760,2217,2640])osc('sine',f,t+Math.random()*.1,.9,.07,fx,.02);noise(t,.8,.15,fx,'highpass',5000,1,9000,.05);}},
  death(boss){if(!A||!on.sfx||A.state!=='running')return;if(boss){const t=T();noise(t,1.6,.6,fx,'lowpass',900,1,80);osc('sawtooth',90,t,1.4,.25,fx,.01,30);return;}if(!ok('death',.06))return;const t=T();osc('square',320+Math.random()*120,t,.12,.07,fx,.002,90);noise(t,.08,.12,fx,'lowpass',1200);},
  hornNotes(notes,v,dur){const t=T();notes.forEach(([m,dt,len],i)=>{for(const det of[-6,5]){const o=A.createOscillator(),lp=A.createBiquadFilter(),g=A.createGain();o.type='sawtooth';o.frequency.value=mtof(m);o.detune.value=det;lp.type='lowpass';lp.frequency.setValueAtTime(300,t+dt);lp.frequency.linearRampToValueAtTime(1300,t+dt+.25);lp.frequency.linearRampToValueAtTime(600,t+dt+len);
   g.gain.setValueAtTime(.0001,t+dt);g.gain.exponentialRampToValueAtTime(v,t+dt+.12);g.gain.setValueAtTime(v,t+dt+len-.15);g.gain.exponentialRampToValueAtTime(.0001,t+dt+len+.1);o.connect(lp);lp.connect(g);g.connect(fx);o.start(t+dt);o.stop(t+dt+len+.2);}});},
  horn(boss){if(!ok('horn',.5))return;api.hornNotes([[50,0,.35],[57,.38,.9]],.16);},
  boss(){if(!ok('bosshorn',1))return;api.hornNotes([[38,0,.6],[38,.65,.3],[45,1,1.5],[44,2.5,.4],[38,2.9,1.4]],.22);const t=T();drum(t,.9);drum(t+.65,.7);drum(t+1,.9);},
  hero(k){if(!A||!on.sfx||A.state!=='running')return;const t=T();if(k==='blade'){noise(t,.5,.3,fx,'bandpass',300,1,3000,.05);osc('sawtooth',150,t,.25,.12,fx,.02,300);}
   else if(k==='frost'){for(const f of[880,1175,1568,2093,2637])osc('triangle',f,t+Math.random()*.15,.7,.08,fx,.01);noise(t,.6,.25,fx,'highpass',4000,1,8000,.02);osc('sine',220,t,.5,.3,fx,.005,60);}
   else{for(let i=0;i<8;i++)osc('sine',200+Math.random()*400,t+i*.06,.08,.12,fx,.004,600+Math.random()*600);noise(t,.7,.2,fx,'lowpass',700,2,200,.05);}},
  prop(){if(!ok('prop',1.2))return;const t=T();const o=A.createOscillator(),g=A.createGain(),lfo=A.createOscillator(),lg=A.createGain();o.type='sawtooth';o.frequency.value=58;lfo.frequency.value=18;lg.gain.value=.05;lfo.connect(lg);lg.connect(g.gain);
   g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.07,t+.3);g.gain.exponentialRampToValueAtTime(.0001,t+1.3);const lp=A.createBiquadFilter();lp.type='lowpass';lp.frequency.value=500;o.connect(lp);lp.connect(g);g.connect(fx);o.start(t);lfo.start(t);o.stop(t+1.4);lfo.stop(t+1.4);},
  drop(){if(!ok('drop',.15))return;const t=T();osc('sine',1500,t,.5,.09,fx,.01,380);},
  fuse(tick){if(!ok(tick?'tick':'fuse',tick?.12:.3))return;const t=T();if(tick){osc('square',1250,t,.05,.05,fx,.002);}else{noise(t,.7,.16,fx,'highpass',4500,1,7000,.05);osc('square',900,t,.06,.06,fx,.002);}},
  bomb(big){if(!ok('bomb',.08))return;const t=T();noise(t,big?1:.5,big?.7:.45,fx,'lowpass',big?2400:1800,1,90);osc('sine',big?75:110,t,big?.8:.4,big?.7:.45,fx,.004,28);if(big)noise(t+.08,.6,.2,fx,'bandpass',600,1,150);},
  bones(){if(!ok('bones',.3))return;const t=T();for(let i=0;i<7;i++)osc('square',500+Math.random()*900,t+i*.045+Math.random()*.02,.04,.06,fx,.001,200);noise(t,.35,.15,fx,'bandpass',1800,3);},
  slam(){if(!A||!on.sfx||A.state!=='running')return;const t=T();osc('sine',120,t,.5,.7,fx,.003,35);noise(t,.5,.45,fx,'lowpass',1000,1,100);},
  hit(){if(!ok('hit',.1))return;const t=T();noise(t,.06,.15,fx,'bandpass',2500,4);osc('square',880+Math.random()*200,t,.05,.04,fx);},
  // --- Phasen-Klänge (Duell 0.3): keine Tempoänderung der Musik, nur eigene Signale ---
  warhorn(){if(!ok('warhorn',1.5))return;api.hornNotes([[45,0,.55],[45,.6,.25],[52,.9,1.5]],.26);const t=T();fdrum(t,.8);fdrum(t+.6,.6);fdrum(t+.9,.9);},
  suddenBell(){if(!ok('sbell',1.5))return;const t=T();
   for(let i=0;i<3;i++){const t0=t+i*.75,f=mtof(57-(i===2?5:0));for(const[m,v,d]of[[1,.22,2.2],[2.01,.12,1.6],[2.76,.09,1.2],[5.4,.05,.6]])osc('sine',f*m,t0,d,v,fx,.004);}
   for(let i=0;i<18;i++){const k=i/18,tt=t+2.2+i*(.075-.03*k);noise(tt,.06,.08+.25*k,fx,'bandpass',900,1.2);}fdrum(t+3.35,1);noise(t+3.35,.5,.3,fx,'lowpass',1400,1,200);},
  tick(final){if(!ok('tick10',.25))return;const t=T();osc('square',final?1650:1150,t,.05,final?.16:.11,fx,.002);noise(t,.03,.12,fx,'highpass',3000,1);osc('sine',final?820:560,t,.09,.12,fx,.002);},
  fanfare(){if(!ok('fanfare',2))return;api.hornNotes([[60,0,.16],[64,.18,.16],[67,.36,.16],[72,.56,.5],[67,1.1,.18],[72,1.3,1.3]],.17);const t=T();[72,76,79,84].forEach((m,i)=>osc('triangle',mtof(m),t+1.3+i*.06,.6,.07,fx,.01));fdrum(t,.6);fdrum(t+.56,.7);fdrum(t+1.3,.9);},
  darkHorn(){if(!ok('darkhorn',2))return;api.hornNotes([[41,0,1],[40,1.05,.6],[36,1.7,1.8]],.24);const t=T();fdrum(t,.9);fdrum(t+1.7,1);noise(t+1.7,1.4,.18,fx,'lowpass',500,1,90);},
  towerFall(){if(!ok('tfall',.6))return;const t=T();noise(t,1.1,.7,fx,'lowpass',2200,1,80);osc('sine',70,t,.9,.7,fx,.004,26);
   for(let i=0;i<14;i++)noise(t+.15+i*.07+Math.random()*.05,.08,.18*(1-i/16),fx,'bandpass',600+Math.random()*1400,3);noise(t+.3,1.6,.25,fx,'lowpass',380,1,60,.2);},
  keepWake(){if(!ok('kwake',1))return;api.hornNotes([[50,0,.3],[55,.32,.7]],.18);const t=T();fdrum(t,.7);fdrum(t+.32,.8);},
  level(){if(!ok('level',.3))return;const t=A.currentTime+.02;[62,66,69,74,78].forEach((m,i)=>osc('triangle',mtof(m),t+i*.08,.35,.18,fx,.005));},
  life(){if(!ok('life',.25))return;const t=T();osc('square',220,t,.18,.1,fx,.005,110);osc('sine',110,t+.1,.3,.25,fx,.005,70);},
  over(){if(!A)return;const t=A.currentTime+.05;if(on.music){mus.gain.setTargetAtTime(0,t,.15);mus.gain.setTargetAtTime(.25,t+6,.8);}if(!on.sfx)return;[[62,0],[60,.4],[58,.8],[57,1.2],[50,1.7]].forEach(([m,d])=>osc('triangle',mtof(m),t+d,d>1.5?1.6:.45,.2,fx,.02));}};
 // 0.7 (Duell): Klänge für neue Kreaturen – rein additiv, der Tower-Defense-Teil nutzt sie nicht
 Object.assign(api,{
  zap(){if(!ok('zap',.09))return;const t=T();noise(t,.12,.22,fx,'highpass',3200,1);for(let i=0;i<4;i++)osc('square',1800+Math.random()*1400,t+i*.022,.025,.05,fx,.001,600);osc('sawtooth',90,t,.14,.12,fx,.002,60);},
  net(){if(!ok('net',.12))return;const t=T();noise(t,.18,.14,fx,'bandpass',900,1.4,300);osc('triangle',320,t,.1,.06,fx,.004,180);},
  breath(ice){if(!ok(ice?'ice':'breath',.14))return;const t=T();noise(t,.42,.26,fx,ice?'highpass':'bandpass',ice?2200:520,1,ice?5200:1500,.04);if(!ice)osc('sawtooth',70,t,.3,.08,fx,.03,55);else osc('sine',1900,t,.3,.04,fx,.02,1200);},
  roar(){if(!ok('roar',.6))return;const t=T();for(const[f,d]of[[95,0],[120,6]]){const o=A.createOscillator(),bp=A.createBiquadFilter(),g=A.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f*1.4,t);o.frequency.exponentialRampToValueAtTime(f*.7,t+.8);o.detune.value=d;bp.type='bandpass';bp.frequency.value=520;bp.Q.value=1.6;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.32,t+.08);g.gain.exponentialRampToValueAtTime(.0001,t+.9);o.connect(bp);bp.connect(g);g.connect(fx);o.start(t);o.stop(t+1);}noise(t,.7,.14,fx,'lowpass',900,1,200);fdrum(t,.6);},
  screech(){if(!ok('screech',.8))return;const t=T();const o=A.createOscillator(),g=A.createGain(),bp=A.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(1300,t);o.frequency.exponentialRampToValueAtTime(2300,t+.25);o.frequency.exponentialRampToValueAtTime(900,t+.7);bp.type='bandpass';bp.frequency.value=1800;bp.Q.value=4;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.75);o.connect(bp);bp.connect(g);g.connect(fx);o.start(t);o.stop(t+.8);noise(t,.6,.08,fx,'highpass',3000,1);},
  burrow(){if(!ok('burrow',.2))return;const t=T();noise(t,.3,.2,fx,'lowpass',500,1,140);osc('sine',70,t,.2,.18,fx,.01,40);},
  chant(){if(!ok('chant',.8))return;const t=T();[0,.22,.44,.66].forEach((d,i)=>fdrum(t+d,i%2?.55:.8));api.hornNotes&&api.hornNotes([[48,0,.4],[52,.45,.6]],.12);},
  roots(){if(!ok('roots',.5))return;const t=T();noise(t,.5,.25,fx,'lowpass',700,1,120);for(let i=0;i<5;i++)osc('square',140+Math.random()*120,t+.05+i*.06,.05,.06,fx,.002,60);},
  fireline(){if(!ok('fline',.6))return;const t=T();noise(t,.9,.4,fx,'bandpass',300,.8,1600,.08);osc('sawtooth',60,t,.8,.14,fx,.05,40);},
  // 0.8
  bearRoar(){if(!ok('bear',.7))return;const t=T();for(const[f,d]of[[70,0],[88,9],[52,-7]]){const o=A.createOscillator(),bp=A.createBiquadFilter(),g=A.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f*1.6,t);o.frequency.exponentialRampToValueAtTime(f*.6,t+1.1);o.detune.value=d;bp.type='bandpass';bp.frequency.value=380;bp.Q.value=1.2;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.36,t+.1);g.gain.exponentialRampToValueAtTime(.0001,t+1.2);o.connect(bp);bp.connect(g);g.connect(fx);o.start(t);o.stop(t+1.3);}noise(t,1,.18,fx,'lowpass',700,1,150);fdrum(t,.9);fdrum(t+.25,.6);},
  howl(){if(!ok('howl',.9))return;const t=T();for(const[d,f]of[[0,420],[.18,520]]){const o=A.createOscillator(),g=A.createGain(),v=A.createOscillator(),vg=A.createGain();o.type='triangle';o.frequency.setValueAtTime(f*.7,t+d);o.frequency.exponentialRampToValueAtTime(f,t+d+.35);o.frequency.exponentialRampToValueAtTime(f*.6,t+d+1.2);v.frequency.value=6;vg.gain.value=10;v.connect(vg);vg.connect(o.frequency);g.gain.setValueAtTime(.0001,t+d);g.gain.exponentialRampToValueAtTime(.14,t+d+.2);g.gain.exponentialRampToValueAtTime(.0001,t+d+1.25);o.connect(g);g.connect(fx);o.start(t+d);v.start(t+d);o.stop(t+d+1.3);v.stop(t+d+1.3);}},
  drill(){if(!ok('drill',.4))return;const t=T();const o=A.createOscillator(),g=A.createGain();o.type='square';o.frequency.setValueAtTime(110,t);o.frequency.linearRampToValueAtTime(160,t+.5);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.06,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+.6);o.connect(g);g.connect(fx);o.start(t);o.stop(t+.65);noise(t,.6,.16,fx,'bandpass',900,2,400);},
  emerge(){if(!ok('emerge',.3))return;const t=T();noise(t,.5,.35,fx,'lowpass',600,1,120);osc('sine',60,t,.35,.3,fx,.005,30);fdrum(t,1);for(let i=0;i<6;i++)osc('square',200+Math.random()*200,t+.06+i*.05,.04,.05,fx,.002,80);},
  thunder(){if(!ok('thunder',.4))return;const t=T();noise(t,.12,.5,fx,'highpass',2000,1);noise(t+.05,1.3,.45,fx,'lowpass',400,1,60);osc('sine',45,t+.05,1,.25,fx,.01,30);},
  ward(){if(!ok('ward',.4))return;const t=T();[880,1320,1760].forEach((f,i)=>osc('sine',f,t+i*.06,.5,.07,fx,.01));},
  healsp(){if(!ok('heal',.5))return;const t=T();[523,659,784,1046].forEach((f,i)=>osc('triangle',f,t+i*.09,.45,.08,fx,.01));},
  quake(){if(!ok('quake',.5))return;const t=T();noise(t,1.4,.5,fx,'lowpass',260,1,60);osc('sine',38,t,1.3,.35,fx,.05,28);fdrum(t,1);fdrum(t+.4,.7);},
  fel(){if(!ok('fel',.12))return;const t=T();osc('sawtooth',300,t,.18,.06,fx,.005,900);osc('sine',600,t,.15,.05,fx,.005,1200);},
  drain(){if(!ok('drain',.6))return;const t=T();osc('sine',900,t,.9,.1,fx,.05,180);osc('triangle',450,t,.9,.08,fx,.05,120);noise(t,.8,.1,fx,'bandpass',1200,4,400);},
  charge(){if(!ok('charge',.3))return;const t=T();fdrum(t,.9);noise(t,.2,.25,fx,'lowpass',900,1,200);osc('square',160,t,.12,.08,fx,.003,70);},
  plague(){if(!ok('plague',.5))return;const t=T();noise(t,1,.18,fx,'bandpass',500,1.5,300,.1);osc('sine',90,t,.9,.1,fx,.1,70);},
  summon2(){if(!ok('summ2',.5))return;const t=T();osc('sawtooth',120,t,.6,.1,fx,.05,480);osc('sine',240,t+.1,.5,.08,fx,.05,960);noise(t,.5,.1,fx,'highpass',2500,1);}});
 return api;})();
window.SFX=SFX;
