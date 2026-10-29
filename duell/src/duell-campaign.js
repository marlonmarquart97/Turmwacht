// ===== Turmwacht Duell – Kampagne & Gegner (Daten) =====
const DUELL_OPP={
 grimm:{name:'Grimmzahn',title:'Goblin-Häuptling',portrait:'chief',ai:'grimm',deck:['orcs','wolves','sling','alch','bats','ogre','firerain','blade'],mods:{regen:.9},
  tag:'leicht',quote:'„Hehehe! Meine Schleuder wirft heute Orks – und morgen dich!“'},
 morvath:{name:'Morvath',title:'Totenbeschwörer',portrait:'lichP',ai:'morvath',deck:['skels','skelarch','knight','giant','bats','frost','firerain','lich'],mods:{regen:1.07},
  tag:'schwer',quote:'„Jeder Gefallene dient mir. Auch du wirst es bald.“'}};
const DUELL_SCEN=[
 {id:1,title:'Der Grenzposten',opp:'grimm',
  story:['Am Nordende des Schattenpasses wacht ein kleiner Grenzposten über die zwei Brücken der Schattenschlucht.',
   'Seit Tagen trommeln die Goblins von Grimmzahn, dem selbsternannten Häuptling der Felsklippen, gegen die Palisaden. Heute will er den Posten mit Wolfsrudeln, Ork-Söldnern und seiner wackeligen Schleuder überrennen.',
   'Zeig ihm, dass die Turmwacht steht!'],
  rule:'Grimmzahns Bande ist schlecht organisiert: sein Mana fließt etwas langsamer.',
  tip:'Tipp: Zieh eine Karte auf deine Hälfte. Verteidige erst – mit den Überlebenden konterst du.',
  win:'Grimmzahn flieht heulend über die Klippen. In seinem Lager findet ihr eine Karte mit einem Totenkopf-Siegel – sie führt zur alten Gruft unter dem Pass …',
  lose:'Die Goblins jubeln auf den Palisaden. Sammle deine Truppen und versuch es noch einmal!'},
 {id:2,title:'Die Gruft von Morvath',opp:'morvath',
  story:['Unter dem Schattenpass ist Morvath erwacht, der Totenbeschwörer. Knochenrotten, Grabritter und ein gewaltiges Riesenskelett steigen aus der Gruft.',
   'Morvath schöpft Kraft aus den Gräbern – und jeder Krieger, der fällt, könnte morgen in seinem Heer marschieren.',
   'Brenne sein Heer nieder, bevor er den Pass in ewige Nacht taucht!'],
  rule:'Morvath zieht Kraft aus der Gruft: sein Mana fließt etwas schneller.',
  tip:'Tipp: Flächenschaden gegen Knochenrotten, Frost und Gruppen gegen das Riesenskelett. Spar Mana für einen Gegenangriff.',
  win:'Morvaths Laterne erlischt, die Gruft stürzt ein. Der Schattenpass ist frei – vorerst. Fortsetzung folgt …',
  lose:'Kaltes Lachen hallt aus der Gruft. Morvath ist stark – prüfe dein Deck und greife erneut an!'}];
if(typeof module!=='undefined')module.exports={DUELL_OPP,DUELL_SCEN};
