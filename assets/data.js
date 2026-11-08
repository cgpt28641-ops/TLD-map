// Dane o regionach Wielkiego Niedźwiedzia: pozycje na szkicu (jak mapa świata w grze), połączenia, ważne miejsca.
window.DN={1:'łatwy',2:'średni',3:'trudny'};
window.DC={1:'var(--easy)',2:'var(--mid)',3:'var(--hard)'};
window.TC={1:'#a9bd73',2:'#e0b25c',3:'#e07a62'};
window.R={
 ml:{n:'Jezioro Tajemnic',en:'Mystery Lake',lp:'up',d:1,x:614,y:318,t:'Śródlądowe jezioro i linia kolejowa, chatki i łowienie ryb. Najlepszy start – środek wyspy, tory jako punkt orientacyjny.',
   k:[['Camp Office','biuro obozu nad jeziorem'],['Trapper\'s Homestead','chata trapera, przejście do Milton'],['Carter Hydro Dam','tama, droga do Krętej Rzeki'],['Forestry Lookout','wieża obserwacyjna na wzgórzu'],['Lake Cabins','chatki nad jeziorem'],['Alan\'s Cave','jaskinia przy torach']]},
 ch:{n:'Przybrzeżna Autostrada',en:'Coastal Highway',d:2,x:882,y:491,t:'Zamarznięta zatoka i nadbrzeżna droga z osadą i obozem rybackim.',
   k:[['Quonset Garage','stacja benzynowa i warsztat'],['Coastal Townsite','osada przy drodze'],['Fishing Camp','obóz rybacki na lodzie'],['Jackrabbit Island','wyspa na zatoce'],['Cinder Hills Coal Mine','kopalnia – przejście do Wesołej Doliny']]},
 pv:{n:'Wesoła Dolina',en:'Pleasant Valley',lp:'r',d:3,x:880,y:286,t:'Otwarte pola i długie odsłonięte trasy – częste zamiecie. Trzymaj się dróg.',
   k:[['Pleasant Valley Farmstead','duża farma w centrum'],['Thomson\'s Crossing','kościół i domy przy moście'],['Rural Crossroads','skrzyżowanie z budynkami'],['Signal Hill','wzgórze z wieżą radiową'],['Skeeter\'s Ridge','grzbiet z chatkami']]},
 dp:{n:'Pustkowie',en:'Desolation Point',lp:'down',d:2,x:1130,y:550,t:'Zwarte wybrzeże ze starym statkiem wielorybniczym, przetwórnią i kuźnią.',
   k:[['The Riken','wrak statku wielorybniczego'],['Hibernia Processing','przetwórnia z kuźnią'],['Lonely Lighthouse','latarnia morska'],['Stone Church','kamienny kościół'],['Abandoned Mine No. 3','kopalnia – przejście na Przybrzeżną Autostradę']]},
 tw:{n:'Wilcza Góra',en:'Timberwolf Mountain',lp:'r',d:3,x:1017,y:150,t:'Wysoka góra z wejściem na szczyt, ostra pogoda i długie podejścia.',
   k:[['Mountaineer\'s Hut','chata alpinisty w połowie drogi'],['Summit','szczyt z rozbitym samolotem'],['Crystal Lake','chatki nad jeziorem'],['Deer Clearing','polana – droga do Kanionu Popielnego'],['Foreman\'s Clearcut','wycinka – jaskinia do Blackrock']]},
 fm:{n:'Opuszczone Torfowisko',en:'Forlorn Muskeg',d:3,x:464,y:417,t:'Rozległe bagno przecięte torami, cienki lód i mało schronień.',
   k:[['Old Spence Family Homestead','gospodarstwo Spence\'ów'],['Poacher\'s Camp','obóz kłusowników'],['Shortwave Tower','wieża krótkofalowa'],['Muskeg Overlook','punkt widokowy nad bagnem']]},
 br:{n:'Zniszczone Tory Kolejowe',en:'Broken Railroad',d:2,x:300,y:363,t:'Krótki region kolejowy z warsztatem kolejowym i domkiem myśliwskim. Brama do Far Territory.',
   k:[['Maintenance Yard','warsztat kolejowy z kuźnią'],['Hunting Lodge','domek myśliwski'],['Far Range Branch Line','koniec torów – droga do Przełęczy Przeładunkowej']]},
 mt:{n:'Milton',en:'Mountain Town',lp:'l',al:'Górskie Miasteczko Mountain',d:1,x:451,y:198,t:'Region Mountain Town z miasteczkiem Milton w górskiej kotlinie. Mało drapieżników, dużo jedzenia i schronień.',
   k:[['Milton (miasteczko)','domy, sklep, poczta i bank'],['Grey Mother\'s House','dom Szarej Matki'],['Orca Gas Station','stacja benzynowa'],['Paradise Meadows Farm','farma na obrzeżach'],['Spruce Falls','most – w pobliżu jaskinia do Doliny Spokojnej Rzeki']]},
 hr:{n:'Dolina Spokojnej Rzeki',en:'Hushed River Valley',d:3,x:460,y:60,t:'Odległa, wielopoziomowa dolina klifów, jaskiń i wodospadów. Prawie bez budynków – schronienia głównie w jaskiniach.',
   k:[['Wodospady','wielopoziomowe zamarznięte wodospady'],['Jaskinie','główne schronienia regionu']]},
 bi:{n:'Ponura Zatoka',en:'Bleak Inlet',d:3,x:672,y:502,t:'Przemysłowe wybrzeże z konserwownią, stromy teren i stada timberwolfów.',
   k:[['Cannery','konserwownia z warsztatem'],['Cannery Workers\' Area','domki pracowników konserwowni']]},
 ac:{n:'Kanion Popielny',en:'Ash Canyon',d:3,x:1069,y:60,t:'Głęboki kanion z płaskowyżami, mostami linowymi i niewieloma budynkami.',
   k:[['Miner\'s Folly','stara kopalnia z chatkami'],['Angler\'s Den','chata wędkarza'],['Echo Ravine','wąwóz – droga na Wilczą Górę']]},
 bk:{n:'Blackrock',en:'Blackrock',lp:'l',d:2,x:914,y:69,t:'Pagórkowaty region z więzieniem, częstymi zamieciami i timberwolfami.',
   k:[['Blackrock Penitentiary','więzienie'],['Blackrock (miasto)','zabudowania przy drodze'],['Keeper\'s Pass North','przejście do Wesołej Doliny']]},
 tp:{n:'Przełęcz Przeładunkowa',en:'Transfer Pass',lp:'up',d:2,x:170,y:290,dlc:1,t:'Spokojna stacja kolejowa – węzeł łączący dolną część wyspy z trzema regionami Far Territory.',
   k:[['Stacja kolejowa','depo – węzeł regionu'],['Zawalony tunel','obejście na drodze do Rozdartej Przełęczy']]},
 fa:{n:'Opuszczone Lotnisko',en:'Forsaken Airfield',lp:'up',d:3,x:80,y:120,dlc:1,t:'Szeroka dolina z porzuconym lotniskiem i częstą mgłą glimmer. Tu zaczyna się pierwsza Opowieść.',
   k:[['Control Tower','wieża kontrolna – start pierwszej Opowieści'],['Fallow Dugout','w pobliżu jaskinia do Strefy Skażenia i Rozdartej Przełęczy']]},
 zc:{n:'Strefa Skażenia',en:'Zone of Contamination',lp:'r',d:3,x:240,y:140,dlc:1,t:'Region kopalni odkrywkowej – strefy toksyczne i gazy kopalniane.',
   k:[['Immutable Hesitation','tory – droga do Przełęczy Przeładunkowej'],['Enduring Waterfall','w pobliżu wspólna jaskinia przejściowa']]},
 sp:{n:'Rozdarta Przełęcz',en:'Sundered Pass',d:3,x:100,y:520,dlc:1,t:'Zimna przełęcz górska – stromy teren, lawiny, timberwolfy i kuguar.',
   k:[['Stoki lawinowe','uważaj na lawiny'],['Droga za tunelem','wyjście do Przełęczy Przeładunkowej']]}
};
window.T={
 rav:{n:'Przełęcz',en:'The Ravine',x:704,y:403},
 wr:{n:'Kręta Rzeka',en:'Winding River',x:771,y:362},
 crh:{n:'Zniszczona Autostrada',en:'Crumbling Highway',up:1,x:944,y:579},
 kp:{n:'Przełęcz Strażnika',en:"Keeper's Pass",x:900,y:180},
 fr:{n:'Bocznica Dalekiego Pasma',en:'Far Range Branch Line',up:1,x:240,y:345},
 cave:{n:'Wspólna jaskinia',en:'transition cave',x:40,y:330}
};
window.E=[
 ['ml','fm','bezpośrednio, tunelem kolejowym'],
 ['ml','rav','przez Przełęcz'],['ch','rav','przez Przełęcz'],['bi','rav','przez Przełęcz'],
 ['ml','wr','przez tamę Carter Hydro'],['pv','wr','przez Krętą Rzekę'],
 ['ml','mt','jaskinią koło Trapper\'s Homestead'],
 ['ch','pv','przez kopalnię Cinder Hills'],
 ['ch','crh','przez Zniszczoną Autostradę'],['dp','crh','przez kopalnię nr 3'],
 ['pv','tw','wspinaczka po linie koło skrytki Preppera'],
 ['pv','kp','Keeper\'s Pass South'],['bk','kp','Keeper\'s Pass North'],
 ['tw','ac','Echo Ravine lub jaskinią na wschód od Deer Clearing'],
 ['tw','bk','jaskinią koło Foreman\'s Clearcut'],
 ['fm','br','bezpośrednio'],
 ['fm','mt','przez Marsh Ridge'],
 ['fm','bi','jaskinią przejściową'],
 ['mt','hr','jaskinią między Trailerem a Spruce Falls'],
 ['br','fr','torami do końca linii',1],['tp','fr','bocznicą kolejową',1],
 ['tp','fa','drogą górską',1],
 ['tp','zc','torami przy Immutable Hesitation',1],
 ['tp','sp','północną drogą za zawalonym tunelem',1],
 ['fa','cave','jaskinia na SE od Fallow Dugout',1],['zc','cave','jaskinia koło Enduring Waterfall',1],['sp','cave','wspólna jaskinia przejściowa',1]
];

window.RAIL=new Set(['ml|fm','fm|br','br|fr','tp|fr','ml|rav','ch|rav','tp|zc']);

// Klucze map szczegółowych w katalogu data/maps.json
window.MK={ml:'mystery-lake',ch:'coastal-highway',pv:'pleasant-valley',dp:'desolation-point',tw:'timberwolf-mountain',fm:'forlorn-muskeg',br:'broken-railroad',mt:'mountain-town',hr:'hushed-river-valley',bi:'bleak-inlet',ac:'ash-canyon',bk:'blackrock',tp:'transfer-pass',fa:'forsaken-airfield',zc:'zone-of-contamination',sp:'sundered-pass',
  rav:'ravine',wr:'winding-river-&-carter-hydro-dam',crh:'crumbling-highway',kp:'keepers-pass',fr:'far-range-branch-line',cave:'transition-cave',world:'game-world',conn:'connections-between-regions',lm:'langston-mine'};
window.X={sketch:{n:'Szkic połączeń',en:'Route sketch'},world:{n:'Cały świat',en:'Game world'},conn:{n:'Połączenia regionów',en:'Connections between regions'},lm:{n:'Kopalnia Langston',en:'Langston Mine',dlc:1}};
window.GROUPS=[
  ['Przegląd',['world','conn','sketch']],
  ['Wielki Niedźwiedź',['ml','mt','pv','ch','dp','fm','br','bi','hr','tw','ac','bk']],
  ['Far Territory',['tp','fa','zc','sp','lm']],
  ['Strefy przejściowe',['rav','wr','crh','kp','fr','cave']]
];
