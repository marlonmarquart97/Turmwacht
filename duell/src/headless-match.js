// Node-Simulation: KI gegen KI (für Tests/Balance)
const Sim=require('./duell-sim.js'),AI=require('./duell-ai.js');
function run(seed,deckA,profA,deckB,profB,mods){const S=Sim.create({seed,decks:[deckA,deckB],mods});const a=AI.create(profA,0,seed*3+1),b=AI.create(profB,1,seed*7+2);let n=0;
 while(!S.over&&n<20000){for(const ai of[a,b]){const c=ai&&AI.think(ai,S);if(c)Sim.issue(S,c);}Sim.step(S);n++;}
 return{w:S.winner,why:S.reason,t:+S.t.toFixed(1),cr:[S.p[0].crowns,S.p[1].crowns],plays:[S.p[0].plays,S.p[1].plays],leak:[S.p[0].leak|0,S.p[1].leak|0],hash:Sim.hash(S)};}
module.exports=run;
if(require.main===module){const B=Sim.B;const GR=['orcs','wolves','sling','alch','bats','ogre','firerain','blade'],MO=['skels','knight','giant','bats','wolves','frost','firerain','lich'];
 const N=+process.argv[2]||10,opp=process.argv[3]||'grimm',pa=process.argv[4]||'bot';const res=[];
 for(let s=1;s<=N;s++)res.push(run(s,B.defaultDeck,pa,opp==='grimm'?GR:MO,opp));
 console.log(res.map(r=>r.w+':'+r.cr.join('-')+'@'+r.t+'('+r.plays+';'+r.leak+')').join(' '));
 console.log('P0 wins',res.filter(r=>r.w===0).length,'/',N,'draws',res.filter(r=>r.w<0).length);
 const r1=run(3,B.defaultDeck,pa,GR,'grimm'),r2=run(3,B.defaultDeck,pa,GR,'grimm');console.log('deterministic',r1.hash===r2.hash,r1.hash);}
