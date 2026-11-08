/* Wielki Niedźwiedź – interaktywne mapy The Long Dark */
(()=>{
'use strict';
const {DN,DC,R,T,E,MK,X,GROUPS}=window;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- pamięć przeglądarki ---------- */
const store={
  get(k,d){try{const v=localStorage.getItem('tld-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('tld-'+k,JSON.stringify(v));return true}catch(e){toast('Brak miejsca w pamięci przeglądarki – usuń część mgły lub notatek');return false}},
  raw(k){try{return localStorage.getItem('tld-'+k)}catch(e){return null}},
  setRaw(k,v){try{if(v==null)localStorage.removeItem('tld-'+k);else localStorage.setItem('tld-'+k,v);return true}catch(e){toast('Brak miejsca w pamięci przeglądarki');return false}}
};
const S={
  visited:store.get('visited',{}),done:store.get('done',{}),
  pins:store.get('pins2',{}),routes:store.get('routes',{}),fogOn:store.get('fogOn',{}),
  variant:store.get('variant','pilgrim'),compare:false,cmpX:.5,
  tool:'pan',pinType:'shelter',brush:store.get('brush',90),
  cur:null,layerSel:'map',tab:'info',
  plan:store.get('plan',{from:'ml',to:'bk'}),path:null,draft:null
};

/* ---------- graf połączeń ---------- */
const P=k=>R[k]||T[k];
const Q=k=>R[k]||T[k]||X[k];
const adj={};E.forEach(([a,b,t,dl],i)=>{(adj[a]=adj[a]||[]).push({to:b,t,i});(adj[b]=adj[b]||[]).push({to:a,t,i})});
const RAILS=new Set(['ml|fm','fm|br','br|fr','tp|fr','ml|rav','ch|rav','tp|zc']);
const isRail=(a,b)=>RAILS.has(a+'|'+b)||RAILS.has(b+'|'+a);
function neighbours(k){const out=[];(adj[k]||[]).forEach(e=>{
  if(R[e.to])out.push({k:e.to,t:e.t,dlc:E[e.i][3]});
  else adj[e.to].forEach(f=>{if(f.to!==k&&R[f.to])out.push({k:f.to,t:e.t,via:e.to,dlc:E[e.i][3]})})});return out}
function bfs(a,b){const prev={[a]:null},q=[a];while(q.length){const c=q.shift();if(c===b)break;adj[c].forEach(e=>{if(!(e.to in prev)){prev[e.to]=c;q.push(e.to)}})}
  if(!(b in prev))return null;const out=[];for(let c=b;c!==null;c=prev[c])out.unshift(c);return out}

/* ---------- katalog obrazków map ---------- */
let MAPS=window.TLD_MAPS_FALLBACK||{};
fetch('data/maps.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Object.keys(j).length){const changed=S.cur&&MK[S.cur]&&JSON.stringify(j[MK[S.cur]])!==JSON.stringify(MAPS[MK[S.cur]]);MAPS=j;if(changed)loadMap()}}).catch(()=>{});
const mapKey=()=>{const b=MK[S.cur];return S.layerSel==='loc'&&MAPS[b+'-map-locations']?b+'-map-locations':b};
const isFT=k=>['tp','fa','zc','sp','lm'].includes(k);

/* ---------- drobne UI ---------- */
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2600)}
function modal(html){$('#mbody').innerHTML=html;$('#modal').hidden=false;$('#mclose').focus()}
$('#mclose').onclick=()=>{$('#modal').hidden=true};
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').hidden=true};

/* ---------- lista map ---------- */
function renderList(){
  $('#list').innerHTML=GROUPS.map(([g,ks])=>`<div class="grp">${g}</div>`+ks.map(k=>{const it=Q(k);
    const d=R[k]?`t${R[k].d}`:T[k]?'tz':'';
    return `<button class="it" data-k="${k}" aria-current="${k===S.cur}"><i class="d ${d}"></i><span class="nm">${esc(it.n)}<span class="en">${esc(it.en)}</span></span>${S.visited[k]?'<span class="ck" title="Odwiedzony">✓</span>':'<span></span>'}</button>`}).join('')).join('');
  $$('#list .it').forEach(b=>b.onclick=()=>{go(b.dataset.k);closeDrawers()});
  const n=Object.keys(R).filter(k=>S.visited[k]).length,all=Object.keys(R).length;
  $('#prog').innerHTML=`<span>Odwiedzone ${n}/${all}</span><span class="bar"><i style="width:${n/all*100}%"></i></span>`;
}

/* ---------- szkic (nawigator i widok „Szkic połączeń”) ---------- */
function drawSketch(svg,mini){
  const g=defs(svg,1180,640);
  if(!mini){
    mk(g,'path',{d:'M470 640 C500 600 540 612 560 590 C590 560 640 600 660 575 C690 545 740 590 790 572 C840 556 880 600 930 585 C980 570 1010 610 1060 596 C1100 585 1150 612 1180 600 L1180 640 Z',fill:'#0d0d0d',opacity:.9});
    const pts=Object.values(R).concat(Object.values(T));
    mountains(g,1180,640,pts.map(p=>({x:p.x,y:p.y,r:62})).concat([{x:1140,y:410,r:60},{x:900,y:610,r:90},{x:700,y:610,r:80}]),3,95);
    compass(g,1140,410);
  }else mk(g,'path',{d:'M470 640 C560 590 660 575 790 572 C930 585 1060 596 1180 600 L1180 640 Z',fill:'#0d0d0d',opacity:.9});
  const path=mini?null:S.path,sel=S.cur;
  const on=new Set(),near=new Set();
  if(path)for(let i=0;i<path.length-1;i++)adj[path[i]].forEach(e=>{if(e.to===path[i+1])on.add(e.i)});
  else if(sel&&adj[sel])adj[sel].forEach(e=>{near.add(e.i);if(T[e.to])adj[e.to].forEach(f=>{if(R[f.to])near.add(f.i)})});
  E.forEach(([a,b,t,dl],i)=>sketchLine(g,P(a),P(b),(dl&&!isRail(a,b)?'dlc ':'')+(on.has(i)?'on':near.has(i)?'near':''),!mini&&isRail(a,b)));
  for(const k in T){const t=T[k],tg=mk(svg,'g',{class:'tz'+(path&&path.includes(k)?' onpath':'')+(k===sel?' sel':''),role:'button','aria-label':t.n});
    mk(tg,'path',{d:`M${t.x} ${t.y-(mini?14:8)} L${t.x+(mini?14:8)} ${t.y} L${t.x} ${t.y+(mini?14:8)} L${t.x-(mini?14:8)} ${t.y} Z`});
    if(!mini)tag(tg,t.x<120?t.x-6:t.x,t.up?t.y-16:t.y+26,t.n,t.x<120?'start':'middle','s');
    const tt=mk(tg,'title',{});tt.textContent=t.n;
    tg.addEventListener('click',()=>go(k))}
  for(const k in R){const r=R[k];
    const ng=mk(svg,'g',{class:'node'+(k===sel?' sel':'')+(path&&path.includes(k)?' onpath':''),tabindex:mini?-1:0,role:'button','aria-label':r.n});
    mk(ng,'circle',{cx:r.x,cy:r.y,r:mini?40:24,class:'glow',filter:`url(#blur${svg.id})`});
    mk(ng,'circle',{cx:r.x,cy:r.y,r:mini?22:12,fill:'var(--tag)',stroke:'var(--char)','stroke-width':mini?5:2.6});
    mk(ng,'circle',{cx:r.x,cy:r.y,r:mini?13:6.5,fill:DC[r.d]});
    const tt=mk(ng,'title',{});tt.textContent=r.n;
    if(!mini){
      if(S.visited[k]){const c=mk(ng,'text',{x:r.x+13,y:r.y-12,class:'tick'});c.textContent='✓'}
      const lp=r.lp||(r.y<110?'up':'down');let an=r.x<120?'start':r.x>1000?'end':'middle',lx=r.x<120?r.x-14:r.x>1000?r.x+14:r.x,ly=lp==='up'?r.y-24:r.y+38;
      if(lp==='l'){an='end';lx=r.x-22;ly=r.y+6}if(lp==='r'){an='start';lx=r.x+22;ly=r.y+6}
      tag(ng,lx,ly,r.n,an);
      ng.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go(k)}});
    }
    ng.addEventListener('click',()=>go(k));
  }
}

/* ---------- przeglądarka mapy ---------- */
const viewer=$('#viewer'),layer=$('#layer'),imgA=$('#imgA'),imgB=$('#imgB'),fogC=$('#fog'),drawS=$('#draw'),pinsL=$('#pinsL'),statusEl=$('#status'),mini=$('#mini');
const V={s:1,x:0,y:0,fit:1,iw:0,ih:0};
let fogCtx=null,FOGK=4,fogDirty=false,miniBg=null;
function apply(){
  layer.style.transform=`translate(${V.x}px,${V.y}px) scale(${V.s})`;
  const inv=1/V.s;
  for(const p of pinsL.children)p.style.transform=`translate(${p.dataset.x*V.iw}px,${p.dataset.y*V.ih}px) scale(${inv})`;
  $('#zread').textContent=Math.round(V.s/V.fit*100)+'%';
  if(S.compare)applyCompare();
  drawMini();
}
function fit(){if(!V.iw)return;const W=viewer.clientWidth,H=viewer.clientHeight;V.fit=Math.min(W/V.iw,H/V.ih);V.s=V.fit;V.x=(W-V.iw*V.s)/2;V.y=(H-V.ih*V.s)/2;apply()}
function zoomAt(f,cx,cy){if(!V.iw)return;const ns=Math.max(V.fit*.5,Math.min(V.fit*16,V.s*f)),k=ns/V.s;V.x=cx-(cx-V.x)*k;V.y=cy-(cy-V.y)*k;V.s=ns;apply()}
function centerOn(fx,fy,s){const W=viewer.clientWidth,H=viewer.clientHeight;if(s)V.s=s;V.x=W/2-fx*V.iw*V.s;V.y=H/2-fy*V.ih*V.s;apply()}
function toImg(cx,cy){const r=viewer.getBoundingClientRect();return{x:((cx-r.left)-V.x)/V.s,y:((cy-r.top)-V.y)/V.s}}

function credit(){
  if(S.cur==='sketch')return'Szkic połączeń – układ jak mapa świata w grze.';
  if(['fa','zc','sp'].includes(S.cur)&&S.layerSel==='loc')return'Mapa lokacji: Krueger – „Tales from the Far Territory map locations” (Steam)';
  return'Mapa: HokuOwl – „Updated Region Maps [2024]” (Steam)';
}
function setStatus(html){statusEl.innerHTML=html;statusEl.hidden=!html}
function loadMap(){
  const sk=S.cur==='sketch';
  $('#sketchWrap').hidden=!sk;layer.style.visibility='hidden';
  $('.tools').hidden=sk;$('.zoom').hidden=sk;mini.hidden=sk;$('#cmp').hidden=sk||!S.compare;
  $('#credit').textContent=credit();
  if(sk){setStatus('');drawSketch($('#sketch'));$('#zread').textContent='';renderToolOpts();return}
  const e=MAPS[mapKey()];V.iw=0;
  if(!e){setStatus('Brak szczegółowej mapy dla tego miejsca');return}
  setStatus('<div><div class="spin"></div>Wczytywanie mapy…</div>');
  const want=S.compare?'pilgrim':S.variant,src=e[want]||e.pilgrim,token=Symbol();loadMap.token=token;
  imgA.onload=()=>{if(loadMap.token!==token)return;V.iw=imgA.naturalWidth;V.ih=imgA.naturalHeight;
    for(const el of [imgA,imgB]){el.style.width=V.iw+'px';el.style.height=V.ih+'px'}
    drawS.setAttribute('width',V.iw);drawS.setAttribute('height',V.ih);drawS.setAttribute('viewBox',`0 0 ${V.iw} ${V.ih}`);
    setStatus('');layer.style.visibility='visible';
    buildMini();initFog();renderPins();renderRoutes();fit();};
  imgA.onerror=()=>{if(loadMap.token!==token)return;setStatus('Nie udało się wczytać mapy.<br>Sprawdź połączenie z internetem i spróbuj ponownie.')};
  imgA.src=src;
  imgB.hidden=!S.compare;if(S.compare)imgB.src=e.interloper||e.pilgrim;
  renderToolOpts();
}

/* minimapa */
function buildMini(){const c=document.createElement('canvas'),w=200,h=140;c.width=w;c.height=h;const x=c.getContext('2d');
  const k=Math.min(w/V.iw,h/V.ih);try{x.drawImage(imgA,(w-V.iw*k)/2,(h-V.ih*k)/2,V.iw*k,V.ih*k)}catch(e){}miniBg={c,k,ox:(w-V.iw*k)/2,oy:(h-V.ih*k)/2}}
function drawMini(){if(!miniBg||mini.hidden)return;const x=mini.getContext('2d');x.clearRect(0,0,200,140);x.drawImage(miniBg.c,0,0);
  const W=viewer.clientWidth,H=viewer.clientHeight,k=miniBg.k;
  x.strokeStyle='#e89a45';x.lineWidth=2;x.strokeRect(miniBg.ox+(-V.x/V.s)*k,miniBg.oy+(-V.y/V.s)*k,W/V.s*k,H/V.s*k)}
function miniJump(ev){if(!miniBg)return;const r=mini.getBoundingClientRect(),mx=(ev.clientX-r.left)*(200/r.width),my=(ev.clientY-r.top)*(140/r.height);
  centerOn((mx-miniBg.ox)/miniBg.k/V.iw,(my-miniBg.oy)/miniBg.k/V.ih)}
mini.addEventListener('pointerdown',ev=>{ev.stopPropagation();mini.setPointerCapture(ev.pointerId);miniJump(ev);mini.onpointermove=e=>{if(e.buttons)miniJump(e)}});

/* porównanie */
function applyCompare(){const W=viewer.clientWidth,hx=S.cmpX*W;$('#cmpHandle').style.left=hx+'px';$('#cmpHandle').setAttribute('aria-valuenow',Math.round(S.cmpX*100));
  const cut=Math.max(0,(hx-V.x)/V.s);imgB.style.clipPath=`inset(0 0 0 ${cut}px)`}
const cmpH=$('#cmpHandle');
cmpH.addEventListener('pointerdown',ev=>{ev.stopPropagation();cmpH.setPointerCapture(ev.pointerId);
  cmpH.onpointermove=e=>{const r=viewer.getBoundingClientRect();S.cmpX=Math.min(.98,Math.max(.02,(e.clientX-r.left)/r.width));applyCompare()}});
cmpH.addEventListener('pointerup',()=>{cmpH.onpointermove=null});
cmpH.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();S.cmpX=Math.min(.98,Math.max(.02,S.cmpX+(e.key==='ArrowLeft'?-.03:.03)));applyCompare()}});

/* mgła wojny */
function fogKey(){return'fog:'+mapKey()+':'+(S.compare?'pilgrim':S.variant)}
function initFog(){
  const on=!!S.fogOn[mapKey()];fogC.hidden=!on;fogCtx=null;if(!on)return;
  FOGK=Math.max(2,Math.ceil(Math.max(V.iw,V.ih)/1600));
  fogC.width=Math.ceil(V.iw/FOGK);fogC.height=Math.ceil(V.ih/FOGK);fogC.style.width=V.iw+'px';fogC.style.height=V.ih+'px';
  fogCtx=fogC.getContext('2d');
  const saved=store.raw(fogKey());
  if(saved){const im=new Image();im.onload=()=>{fogCtx.globalCompositeOperation='copy';fogCtx.drawImage(im,0,0,fogC.width,fogC.height);fogCtx.globalCompositeOperation='source-over'};im.src=saved}
  else fillFog();
}
function fillFog(){if(!fogCtx)return;fogCtx.globalCompositeOperation='source-over';fogCtx.clearRect(0,0,fogC.width,fogC.height);
  fogCtx.fillStyle='rgba(16,16,16,.93)';fogCtx.fillRect(0,0,fogC.width,fogC.height);
  // faktura tuszu
  const r=rng(9);for(let i=0;i<fogC.width*fogC.height/900;i++){fogCtx.fillStyle=`rgba(${40+r()*30|0},${40+r()*30|0},${40+r()*30|0},.25)`;fogCtx.beginPath();fogCtx.arc(r()*fogC.width,r()*fogC.height,2+r()*14,0,7);fogCtx.fill()}
  saveFog()}
function revealAt(ix,iy){if(!fogCtx)return;const rr=S.brush/FOGK/V.s*1.0,x=ix/FOGK,y=iy/FOGK;
  const g=fogCtx.createRadialGradient(x,y,rr*.55,x,y,rr);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');
  fogCtx.globalCompositeOperation='destination-out';fogCtx.fillStyle=g;fogCtx.beginPath();fogCtx.arc(x,y,rr,0,7);fogCtx.fill();fogCtx.globalCompositeOperation='source-over';fogDirty=true}
let fogSaveT;function saveFog(){clearTimeout(fogSaveT);fogSaveT=setTimeout(()=>{if(fogCtx){store.setRaw(fogKey(),fogC.toDataURL('image/webp',.6));fogDirty=false}},400)}
function setFogOn(on){const k=mapKey();if(on)S.fogOn[k]=1;else delete S.fogOn[k];store.set('fogOn',S.fogOn);initFog()}
const brushEl=document.createElement('div');brushEl.className='brush';brushEl.hidden=true;viewer.appendChild(brushEl);

/* pinezki i trasy */
const SYM={shelter:'⌂',res:'○',danger:'✕',note:'•'};
const SYMN={shelter:'Schronienie',res:'Zasoby',danger:'Niebezpieczeństwo',note:'Notatka'};
const pinsOf=()=>S.pins[mapKey()]||[],routesOf=()=>S.routes[mapKey()]||[];
function renderPins(){pinsL.innerHTML=pinsOf().map((p,i)=>`<div class="mpin ${p.type}" data-i="${i}" data-x="${p.x}" data-y="${p.y}" title="${esc(p.note||SYMN[p.type])}"><span>${p.note?`<b>${esc(p.note)}</b>`:''}<i><em>${SYM[p.type]}</em></i></span></div>`).join('');
  for(const el of pinsL.children)el.addEventListener('pointerdown',ev=>{if(S.tool!=='erase')return;ev.stopPropagation();removePin(+el.dataset.i)});apply()}
function addPin(fx,fy){const note=($('#pinNote')||{}).value||'';const k=mapKey();(S.pins[k]=S.pins[k]||[]).push({x:+fx.toFixed(4),y:+fy.toFixed(4),type:S.pinType,note:note.trim().slice(0,40)});
  store.set('pins2',S.pins);if($('#pinNote'))$('#pinNote').value='';renderPins();if(S.tab==='notes')renderTab();toast('Dodano pinezkę')}
function removePin(i){const k=mapKey();S.pins[k].splice(i,1);store.set('pins2',S.pins);renderPins();if(S.tab==='notes')renderTab();toast('Usunięto pinezkę')}
const ptsD=pts=>pts.map((p,i)=>(i?'L':'M')+(p[0]*V.iw).toFixed(1)+' '+(p[1]*V.ih).toFixed(1)).join(' ');
function renderRoutes(){
  drawS.innerHTML=routesOf().map((r,i)=>`<path class="rt" data-i="${i}" d="${ptsD(r.pts)}"><title>${esc(r.name)}</title></path>`).join('')+
    (S.draft&&S.draft.length?`<path class="rt draft" d="${ptsD(S.draft)}"></path>`+S.draft.map(p=>`<circle class="rp" cx="${p[0]*V.iw}" cy="${p[1]*V.ih}" r="5"></circle>`).join(''):'');
  drawS.querySelectorAll('path.rt[data-i]').forEach(el=>el.addEventListener('pointerdown',ev=>{if(S.tool!=='erase')return;ev.stopPropagation();const k=mapKey();S.routes[k].splice(+el.dataset.i,1);store.set('routes',S.routes);renderRoutes();if(S.tab==='notes')renderTab();toast('Usunięto trasę')}));
}
function routeLen(pts){let l=0;for(let i=1;i<pts.length;i++)l+=Math.hypot((pts[i][0]-pts[i-1][0])*V.iw,(pts[i][1]-pts[i-1][1])*V.ih);return l}
function finishRoute(){if(!S.draft)return;const pts=S.draft.filter((p,i,a)=>!i||Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1])>.002);
  if(pts.length>1){const k=mapKey();(S.routes[k]=S.routes[k]||[]).push({name:'Trasa '+((S.routes[k]||[]).length+1),pts});store.set('routes',S.routes);toast('Zapisano trasę')}
  S.draft=null;renderRoutes();renderToolOpts();if(S.tab==='notes')renderTab()}

/* opcje narzędzia */
function renderToolOpts(){
  const o=$('#toolopts'),it=Q(S.cur)||{};
  const head=`<b>${esc(it.n||'')}</b>`;
  const hasLoc=MK[S.cur]&&MAPS[MK[S.cur]+'-map-locations'];
  const layerSw=hasLoc?`<span class="row" role="group" aria-label="Warstwa"><button class="chip" data-l="map" aria-pressed="${S.layerSel==='map'}">Mapa</button><button class="chip" data-l="loc" aria-pressed="${S.layerSel==='loc'}">Lokacje opowieści</button></span>`:'';
  let t='';
  if(S.cur==='sketch')t='Kliknij region lub strefę, aby otworzyć jej mapę szczegółową.';
  else if(S.tool==='pan')t='Przeciągnij, aby przesunąć · kółko lub szczypanie przybliża · dwuklik przybliża w punkcie';
  else if(S.tool==='pin')t=`${Object.keys(SYM).map(k=>`<button class="chip" data-pt="${k}" aria-pressed="${S.pinType===k}">${SYM[k]} ${SYMN[k]}</button>`).join('')}<input type="text" id="pinNote" placeholder="Podpis (opcjonalnie)" maxlength="40"><span>Kliknij na mapie</span>`;
  else if(S.tool==='route')t=S.draft?`<span>Punkty: ${S.draft.length} · długość ${Math.round(routeLen(S.draft))} px mapy</span><button class="chip" id="rUndo">Cofnij punkt</button><button class="chip" id="rDone" aria-pressed="true">Zakończ (Enter)</button><button class="chip" id="rCancel">Anuluj (Esc)</button>`:'Klikaj kolejne punkty trasy · Enter lub dwuklik kończy';
  else if(S.tool==='fog'){const on=!!S.fogOn[mapKey()];t=on?`<span>Maluj, aby odkryć teren</span><label>Pędzel <input type="range" id="brush" min="30" max="260" value="${S.brush}"></label><button class="chip" id="fogFill">Zakryj wszystko</button><button class="chip" id="fogOff">Wyłącz mgłę</button>`:`<span>Mgła wojny zakrywa mapę – odkrywasz ją pędzlem, jak w grze.</span><button class="chip" id="fogOnB" aria-pressed="true">Włącz mgłę na tej mapie</button>`}
  else if(S.tool==='erase')t='Kliknij pinezkę lub trasę, aby ją usunąć';
  o.innerHTML=head+layerSw+t;
  o.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{S.layerSel=b.dataset.l;loadMap();renderTab()});
  o.querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{S.pinType=b.dataset.pt;renderToolOpts()});
  const on=(id,f)=>{const el=o.querySelector('#'+id);if(el)el.onclick=f};
  on('rUndo',()=>{S.draft.pop();if(!S.draft.length)S.draft=null;renderRoutes();renderToolOpts()});
  on('rDone',finishRoute);on('rCancel',()=>{S.draft=null;renderRoutes();renderToolOpts()});
  on('fogOnB',()=>{setFogOn(true);renderToolOpts()});on('fogOff',()=>{setFogOn(false);renderToolOpts()});
  on('fogFill',()=>{fillFog();toast('Mapa zakryta')});
  const br=o.querySelector('#brush');if(br)br.oninput=()=>{S.brush=+br.value;store.set('brush',S.brush)};
}
function setTool(t){if(S.cur==='sketch')return;if(S.tool==='route'&&t!=='route')finishRoute();S.tool=t;
  $$('.tools [data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===t));
  viewer.className='viewer t-'+t;brushEl.hidden=true;renderToolOpts()}
$$('.tools [data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));

/* wskaźnik: przesuwanie, szczypanie, narzędzia */
const ptr=new Map();let moved=0,pinch=null,painting=false,lastTap={t:0,x:0,y:0};
viewer.addEventListener('pointerdown',ev=>{
  if(S.cur==='sketch'||!V.iw||ev.target.closest('.tools,.zoom,.mini,.cmp .h'))return;
  viewer.setPointerCapture(ev.pointerId);ptr.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});moved=0;
  if(ptr.size===2){painting=false;const[a,b]=[...ptr.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)};return}
  if(S.tool==='fog'&&fogCtx&&ev.button===0){painting=true;const p=toImg(ev.clientX,ev.clientY);revealAt(p.x,p.y)}
  else viewer.classList.add('dragging');
});
viewer.addEventListener('pointermove',ev=>{
  if(S.tool==='fog'&&fogCtx&&ev.pointerType!=='touch'){const r=viewer.getBoundingClientRect();brushEl.hidden=false;brushEl.style.left=(ev.clientX-r.left)+'px';brushEl.style.top=(ev.clientY-r.top)+'px';brushEl.style.width=brushEl.style.height=S.brush*2+'px'}
  if(!ptr.has(ev.pointerId))return;const p=ptr.get(ev.pointerId),dx=ev.clientX-p.x,dy=ev.clientY-p.y;ptr.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  if(ptr.size===2&&pinch){const[a,b]=[...ptr.values()],d=Math.hypot(a.x-b.x,a.y-b.y),r=viewer.getBoundingClientRect();
    V.x+=dx/2;V.y+=dy/2;zoomAt(d/pinch.d,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);pinch.d=d;moved+=20;return}
  if(painting){const q=toImg(ev.clientX,ev.clientY);revealAt(q.x,q.y);moved+=Math.abs(dx)+Math.abs(dy);return}
  V.x+=dx;V.y+=dy;moved+=Math.abs(dx)+Math.abs(dy);apply();
});
viewer.addEventListener('pointerleave',()=>{brushEl.hidden=true});
function pUp(ev){
  if(!ptr.has(ev.pointerId))return;ptr.delete(ev.pointerId);if(ptr.size<2)pinch=null;viewer.classList.remove('dragging');
  if(painting){painting=false;saveFog();return}
  if(ev.type!=='pointerup'||moved>6||ptr.size)return;
  const p=toImg(ev.clientX,ev.clientY),fx=p.x/V.iw,fy=p.y/V.ih;if(fx<0||fx>1||fy<0||fy>1)return;
  const now=Date.now(),dbl=now-lastTap.t<320&&Math.hypot(ev.clientX-lastTap.x,ev.clientY-lastTap.y)<12;lastTap={t:dbl?0:now,x:ev.clientX,y:ev.clientY};
  if(S.tool==='pin')addPin(fx,fy);
  else if(S.tool==='route'){if(dbl&&S.draft){finishRoute();return}(S.draft=S.draft||[]).push([+fx.toFixed(4),+fy.toFixed(4)]);renderRoutes();renderToolOpts()}
  else if(S.tool==='pan'&&dbl){const r=viewer.getBoundingClientRect();zoomAt(2,ev.clientX-r.left,ev.clientY-r.top)}
}
viewer.addEventListener('pointerup',pUp);viewer.addEventListener('pointercancel',pUp);
viewer.addEventListener('wheel',ev=>{if(!V.iw||S.cur==='sketch')return;ev.preventDefault();const r=viewer.getBoundingClientRect();
  const d=ev.deltaMode===1?ev.deltaY*33:ev.deltaY;zoomAt(Math.exp(-d*.0016),ev.clientX-r.left,ev.clientY-r.top)},{passive:false});
$('#zin').onclick=()=>zoomAt(1.5,viewer.clientWidth/2,viewer.clientHeight/2);
$('#zout').onclick=()=>zoomAt(1/1.5,viewer.clientWidth/2,viewer.clientHeight/2);
$('#zfit').onclick=fit;
$('#zfull').onclick=()=>{const el=$('#stage');try{document.fullscreenElement?document.exitFullscreen():el.requestFullscreen()}catch(e){toast('Pełny ekran niedostępny w tej przeglądarce')}};
new ResizeObserver(()=>{if(V.iw){const keep=V.s/V.fit;const W=viewer.clientWidth,H=viewer.clientHeight,nf=Math.min(W/V.iw,H/V.ih);if(Math.abs(keep-1)<.01)fit();else{V.fit=nf;apply()}}}).observe(viewer);

/* ---------- panel szczegółów ---------- */
function tagsHTML(r){return`<div class="tags"><span class="tg t${r.d}">${DN[r.d]}</span>${r.dlc?'<span class="tg dlc">Far Territory</span>':'<span class="tg base">gra podstawowa</span>'}</div>`}
function renderTab(){
  $$('.tabs [data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===S.tab));
  const b=$('#tabbody'),k=S.cur,it=Q(k);let h='';
  if(S.tab==='info'){
    const kind=R[k]?'Region':T[k]?'Strefa przejściowa':'Mapa';
    h=`<div><p class="eyebrow">${kind}</p><h2>${esc(it.n)}</h2><div class="sub">${esc(it.en)}</div></div>`;
    if(R[k]){const r=R[k],dn=S.done[k]||{},nb=neighbours(k);
      h+=tagsHTML(r)+`<p>${esc(r.t)}</p><label class="check"><input type="checkbox" id="vis" ${S.visited[k]?'checked':''}> Byłem tu</label>
      <div><p class="eyebrow">Ważne miejsca · ${Object.keys(dn).length}/${r.k.length}</p><ul class="places">${r.k.map((x,i)=>`<li><label><input type="checkbox" data-i="${i}" ${dn[i]?'checked':''}><span class="${dn[i]?'done':''}">${esc(x[0])}<small>${esc(x[1])}</small></span></label></li>`).join('')}</ul></div>
      <div><p class="eyebrow">Przejścia · ${nb.length}</p><ul class="conns">${nb.map(n=>`<li><button data-go="${n.k}">${esc(R[n.k].n)}</button><small>${n.via&&!n.t.includes(T[n.via].n)?esc(T[n.via].n)+' · ':''}${esc(n.t)}${n.dlc?' · DLC':''}</small></li>`).join('')}</ul></div>
      <div class="row"><button class="btn" data-pf="${k}">Trasa stąd</button><button class="btn" data-pt="${k}">Trasa tutaj</button></div>`}
    else if(T[k]){h+=`<p>Strefa przejściowa między regionami.</p><div><p class="eyebrow">Prowadzi do</p><ul class="conns">${adj[k].filter(e=>R[e.to]).map(e=>`<li><button data-go="${e.to}">${esc(R[e.to].n)}</button><small>${esc(e.t)}</small></li>`).join('')}</ul></div>`}
    else{const n=Object.keys(R).filter(x=>S.visited[x]).length,pl=Object.values(S.done).reduce((a,o)=>a+Object.keys(o).length,0),all=Object.values(R).reduce((a,r)=>a+r.k.length,0),np=Object.values(S.pins).reduce((a,l)=>a+l.length,0);
      h+=`<div class="stats"><div class="stat"><b>${n}/16</b><span>regiony</span></div><div class="stat"><b>${pl}/${all}</b><span>miejsca</span></div><div class="stat"><b>${np}</b><span>pinezki</span></div></div>
      <p>${k==='sketch'?'Szkic pokazuje, jak regiony łączą się ze sobą. Kliknij region, aby otworzyć jego mapę szczegółową.':k==='world'?'Mapa całej wyspy z regionami i przejściami. Wybierz region z listy, aby zobaczyć szczegóły.':k==='conn'?'Schemat wszystkich przejść między regionami.':'Kopalnia w Far Territory.'}</p>
      <div><p class="eyebrow">Jak korzystać</p><ul class="conns"><li><small>Lista po lewej lub Ctrl K – wybór mapy</small></li><li><small>Pasek u góry – wersja Pilgrim lub Interloper, albo porównanie suwakiem</small></li><li><small>Narzędzia po lewej stronie mapy – pinezki, trasy, mgła wojny, gumka</small></li><li><small>Twoje dane zapisują się w tej przeglądarce; eksport w menu ⋯</small></li></ul></div>`}
  }else if(S.tab==='notes'){
    if(k==='sketch'){h='<p class="empty">Notatki dodajesz na mapach szczegółowych.</p>'}
    else{const ps=pinsOf(),rs=routesOf();
      h=`<div><p class="eyebrow">Pinezki · ${ps.length}</p>${ps.length?`<ul class="notes">${ps.map((p,i)=>`<li><span class="ic ${p.type}">${SYM[p.type]}</span><span class="t" data-fp="${i}">${esc(p.note||SYMN[p.type])}</span><button class="x" data-dp="${i}">Usuń</button></li>`).join('')}</ul>`:'<p class="empty">Wybierz narzędzie Pinezka (P) i kliknij na mapie.</p>'}</div>
      <div><p class="eyebrow">Trasy · ${rs.length}</p>${rs.length?`<ul class="notes">${rs.map((r,i)=>`<li><span class="ic rt">↝</span><span class="t" data-fr="${i}">${esc(r.name)} · ${r.pts.length} pkt</span><button class="x" data-dr="${i}">Usuń</button></li>`).join('')}</ul>`:'<p class="empty">Wybierz narzędzie Trasa (R) i klikaj kolejne punkty.</p>'}</div>
      <div><p class="eyebrow">Mgła wojny</p><p>${S.fogOn[mapKey()]?'Włączona na tej mapie.':'Wyłączona na tej mapie.'}</p></div>`}
  }else{
    const opts=Object.keys(R).sort((a,b)=>R[a].n.localeCompare(R[b].n,'pl')).map(x=>`<option value="${x}">${esc(R[x].n)}</option>`).join('');
    const pth=S.path;
    h=`<div><p class="eyebrow">Planer trasy</p><h2>Między regionami</h2></div>
    <label class="field">Skąd<select id="pFrom">${opts}</select></label>
    <label class="field">Dokąd<select id="pTo">${opts}</select></label>
    <div class="row"><button class="btn" id="pSwap">⇄ Zamień</button><button class="btn pri" id="pShow">Pokaż na szkicu</button></div>`;
    if(pth){const ch=pth.filter(x=>R[x]).length-1,dlc=pth.some(x=>isFT(x))||pth.includes('fr');
      h+=`<p>${ch} ${ch===1?'zmiana regionu':ch<5?'zmiany regionu':'zmian regionu'}${dlc?' · wymaga DLC Far Territory':''}</p><div class="steps">${pth.map((x,i)=>{const e=i?adj[pth[i-1]].find(z=>z.to===x):null;return`<div class="step${T[x]?' t':''}"><i></i><div><button data-go="${x}">${esc(P(x).n)}</button>${e?`<small>${esc(e.t)}</small>`:'<small>start</small>'}</div></div>`}).join('')}</div>`}
  }
  b.innerHTML=h;
  b.querySelectorAll('[data-go]').forEach(x=>x.onclick=()=>{go(x.dataset.go);closeDrawers()});
  const vis=b.querySelector('#vis');if(vis)vis.onchange=()=>{vis.checked?S.visited[k]=1:delete S.visited[k];store.set('visited',S.visited);renderList();drawSketch($('#navmap'),true)};
  b.querySelectorAll('.places input').forEach(c=>c.onchange=()=>{S.done[k]=S.done[k]||{};c.checked?S.done[k][c.dataset.i]=1:delete S.done[k][c.dataset.i];store.set('done',S.done);renderTab()});
  b.querySelectorAll('[data-pf]').forEach(x=>x.onclick=()=>{S.plan.from=x.dataset.pf;store.set('plan',S.plan);S.tab='plan';calcPlan();renderTab()});
  b.querySelectorAll('[data-pt]').forEach(x=>x.onclick=()=>{S.plan.to=x.dataset.pt;store.set('plan',S.plan);S.tab='plan';calcPlan();renderTab()});
  b.querySelectorAll('[data-dp]').forEach(x=>x.onclick=()=>removePin(+x.dataset.dp));
  b.querySelectorAll('[data-dr]').forEach(x=>x.onclick=()=>{S.routes[mapKey()].splice(+x.dataset.dr,1);store.set('routes',S.routes);renderRoutes();renderTab()});
  b.querySelectorAll('[data-fp]').forEach(x=>x.onclick=()=>{const p=pinsOf()[+x.dataset.fp];centerOn(p.x,p.y,Math.max(V.s,V.fit*3))});
  b.querySelectorAll('[data-fr]').forEach(x=>x.onclick=()=>{const r=routesOf()[+x.dataset.fr],cx=r.pts.reduce((a,p)=>a+p[0],0)/r.pts.length,cy=r.pts.reduce((a,p)=>a+p[1],0)/r.pts.length;centerOn(cx,cy)});
  const pf=b.querySelector('#pFrom'),pt=b.querySelector('#pTo');
  if(pf){pf.value=S.plan.from;pt.value=S.plan.to;
    const upd=()=>{S.plan={from:pf.value,to:pt.value};store.set('plan',S.plan);calcPlan();renderTab()};
    pf.onchange=upd;pt.onchange=upd;
    b.querySelector('#pSwap').onclick=()=>{S.plan={from:S.plan.to,to:S.plan.from};store.set('plan',S.plan);calcPlan();renderTab()};
    b.querySelector('#pShow').onclick=()=>{go('sketch',true)};
    if(!S.path)calcPlan(),S.path&&renderTab();
  }
}
function calcPlan(){S.path=S.plan.from===S.plan.to?null:bfs(S.plan.from,S.plan.to);if(S.cur==='sketch')drawSketch($('#sketch'))}
$$('.tabs [data-tab]').forEach(b=>b.onclick=()=>{S.tab=b.dataset.tab;renderTab()});

/* ---------- nawigacja ---------- */
function go(k,keepPath){if(!Q(k))return;if(location.hash.slice(1)===k)show();else location.hash=k}
function show(){
  let k=location.hash.slice(1);if(!Q(k))k=store.get('last','world');if(!Q(k))k='world';
  if(S.draft)finishRoute();
  S.cur=k;S.layerSel='map';store.set('last',k);
  document.title=Q(k).n+' – Wielki Niedźwiedź';
  if(k!=='sketch'&&S.tab==='plan'&&!R[k])S.tab='info';
  renderList();drawSketch($('#navmap'),true);setTool(k==='sketch'?'pan':S.tool);loadMap();renderTab();
  const a=$(`#list .it[data-k="${k}"]`);if(a)a.scrollIntoView({block:'nearest'});
}
window.addEventListener('hashchange',show);

/* wersja mapy */
function renderVar(){$$('#varSeg [data-v]').forEach(b=>b.setAttribute('aria-pressed',S.compare?b.dataset.v==='compare':b.dataset.v===S.variant))}
$$('#varSeg [data-v]').forEach(b=>b.onclick=()=>{const v=b.dataset.v;if(v==='compare'){S.compare=!S.compare}else{S.compare=false;S.variant=v;store.set('variant',v)}renderVar();if(S.cur!=='sketch')loadMap()});

/* szuflady na telefonie */
function closeDrawers(){$('#app').classList.remove('side-open','insp-open');$('#scrim').hidden=true}
$('#openSide').onclick=()=>{$('#app').classList.toggle('side-open');$('#app').classList.remove('insp-open');$('#scrim').hidden=!$('#app').classList.contains('side-open')};
$('#openInsp').onclick=()=>{$('#app').classList.toggle('insp-open');$('#app').classList.remove('side-open');$('#scrim').hidden=!$('#app').classList.contains('insp-open')};
$('#scrim').onclick=closeDrawers;

/* ---------- wyszukiwarka (Ctrl K) ---------- */
const IDX=[];
for(const[g,ks]of GROUPS)for(const k of ks){const it=Q(k);IDX.push({k,n:it.n,ds:it.en+(it.al?' · '+it.al:''),kd:R[k]?DN[R[k].d]:T[k]?'strefa':'mapa'})}
for(const k in R)R[k].k.forEach(([n,d])=>IDX.push({k,n,ds:d+' · '+R[k].n,kd:'miejsce'}));
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l');
let pSel=0,pList=[];
function openPal(){$('#palette').hidden=false;$('#pq').value='';runPal();$('#pq').focus()}
function closePal(){$('#palette').hidden=true}
function runPal(){const q=norm($('#pq').value.trim());
  pList=(q?IDX.filter(x=>norm(x.n+' '+x.ds).includes(q)).sort((a,b)=>norm(a.n).indexOf(q)-norm(b.n).indexOf(q)):IDX.filter(x=>x.kd!=='miejsce')).slice(0,40);pSel=0;drawPal()}
function drawPal(){$('#pres').innerHTML=pList.length?pList.map((x,i)=>`<li role="option" data-i="${i}" aria-selected="${i===pSel}"><span class="kd">${x.kd}</span><span><span class="nm">${esc(x.n)}</span><br><span class="ds">${esc(x.ds)}</span></span><span class="kd">↵</span></li>`).join(''):'<li class="ds">Nic nie znaleziono</li>';
  $$('#pres li[data-i]').forEach(li=>{li.onclick=()=>{pSel=+li.dataset.i;pick()};li.onmousemove=()=>{if(pSel!==+li.dataset.i){pSel=+li.dataset.i;drawPal()}}});
  const s=$('#pres li[aria-selected="true"]');if(s)s.scrollIntoView({block:'nearest'})}
function pick(){const x=pList[pSel];if(!x)return;closePal();if(x.kd==='miejsce')S.tab='info';go(x.k)}
$('#openSearch').onclick=openPal;$('#pq').oninput=runPal;
$('#pq').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();pSel=Math.min(pList.length-1,pSel+1);drawPal()}else if(e.key==='ArrowUp'){e.preventDefault();pSel=Math.max(0,pSel-1);drawPal()}else if(e.key==='Enter'){e.preventDefault();pick()}else if(e.key==='Escape')closePal()};
$('#palette').onclick=e=>{if(e.target.id==='palette')closePal()};

/* ---------- skróty klawiszowe ---------- */
const KEYS=[['Ctrl K lub /','Szukaj mapy lub miejsca'],['V','Przesuwanie'],['P','Pinezka'],['R','Trasa'],['F','Mgła wojny'],['E','Gumka'],['+ / −','Przybliż / oddal'],['0','Dopasuj mapę do okna'],['Strzałki','Przesuń mapę'],['C','Porównanie Pilgrim / Interloper'],['[ / ]','Poprzednia / następna mapa'],['Enter / Esc','Zakończ / anuluj rysowanie trasy']];
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPal();return}
  if(!$('#palette').hidden||!$('#modal').hidden){if(e.key==='Escape'){closePal();$('#modal').hidden=true}return}
  if(e.target.closest('input,select,textarea'))return;
  const k=e.key,cx=viewer.clientWidth/2,cy=viewer.clientHeight/2;
  const tools={v:'pan',p:'pin',r:'route',f:'fog',e:'erase'};
  if(tools[k.toLowerCase()]&&!e.ctrlKey&&!e.metaKey&&!e.altKey){setTool(tools[k.toLowerCase()]);return}
  if(k==='/'){e.preventDefault();openPal()}
  else if(k==='+'||k==='=')zoomAt(1.4,cx,cy);else if(k==='-')zoomAt(1/1.4,cx,cy);else if(k==='0')fit();
  else if(k.startsWith('Arrow')&&V.iw&&S.cur!=='sketch'){e.preventDefault();const d=80;V.x+=k==='ArrowLeft'?d:k==='ArrowRight'?-d:0;V.y+=k==='ArrowUp'?d:k==='ArrowDown'?-d:0;apply()}
  else if(k==='Enter'&&S.draft)finishRoute();
  else if(k==='Escape'){if(S.draft){S.draft=null;renderRoutes();renderToolOpts()}closeDrawers();$('#menu').hidden=true}
  else if(k.toLowerCase()==='c'){S.compare=!S.compare;renderVar();if(S.cur!=='sketch')loadMap()}
  else if(k==='['||k===']'){const order=GROUPS.flatMap(g=>g[1]),i=order.indexOf(S.cur);go(order[(i+(k===']'?1:-1)+order.length)%order.length])}
});

/* ---------- menu: eksport, import, informacje ---------- */
$('#menuBtn').onclick=e=>{e.stopPropagation();const m=$('#menu');m.hidden=!m.hidden;$('#menuBtn').setAttribute('aria-expanded',!m.hidden)};
document.addEventListener('click',e=>{if(!e.target.closest('.menuwrap'))$('#menu').hidden=true});
function dump(){const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('tld-'))o[k]=localStorage.getItem(k)}}catch(e){}return o}
$$('#menu [data-act]').forEach(b=>b.onclick=()=>{$('#menu').hidden=true;const a=b.dataset.act;
  if(a==='export'){const blob=new Blob([JSON.stringify({app:'tld-map',v:1,date:new Date().toISOString(),data:dump()},null,1)],{type:'application/json'});
    const u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download='wielki-niedzwiedz-dane.json';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Pobrano plik z danymi')}
  else if(a==='keys')modal(`<h3>Skróty klawiszowe</h3><table>${KEYS.map(([k,d])=>`<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join('')}</table>`);
  else if(a==='about')modal(`<h3>O stronie</h3><p>Fanowska strona z mapami regionów gry The Long Dark (Hinterland Studio). Nazwy regionów jak w polskiej wersji gry.</p>
    <p style="margin-top:10px">Szczegółowe mapy są dziełem społeczności Steam i są wyświetlane bezpośrednio z ich poradników:</p>
    <ul><li>HokuOwl – <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3255435617" target="_blank" rel="noopener">Updated Region Maps [2024]</a></li><li>Krueger – <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=2899955301" target="_blank" rel="noopener">Tales from the Far Territory map locations</a></li></ul>
    <p>Pinezki, trasy, mgła i postępy zapisują się tylko w Twojej przeglądarce.</p>`);
  else if(a==='reset')modal(`<h3>Usunąć moje dane?</h3><p>Znikną pinezki, trasy, mgła wojny, odwiedzone regiony i odhaczone miejsca z tej przeglądarki. Tego nie da się cofnąć – najpierw możesz zrobić eksport.</p><div class="mact"><button class="btn" id="doReset" style="border-color:var(--e3);color:var(--e3)">Usuń wszystko</button></div>`),
    $('#doReset').onclick=()=>{Object.keys(dump()).forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});location.reload()};
});
$('#importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;$('#menu').hidden=true;
  try{const j=JSON.parse(await f.text());if(j.app!=='tld-map'||!j.data)throw 0;for(const[k,v]of Object.entries(j.data))if(k.startsWith('tld-'))localStorage.setItem(k,v);toast('Zaimportowano dane');setTimeout(()=>location.reload(),700)}
  catch(err){toast('To nie jest plik z danymi tej strony')}e.target.value=''};

/* ---------- start ---------- */
$('#navmap').addEventListener('dblclick',()=>go('sketch'));
renderVar();show();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{drawSketch($('#navmap'),true);if(S.cur==='sketch')drawSketch($('#sketch'))});
if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
