// Rysowanie szkicu wyspy tuszem (styl mapy świata z gry)

const NS='http://www.w3.org/2000/svg';
const mk=(p,t,a)=>{const el=document.createElementNS(NS,t);for(const k in a)el.setAttribute(k,a[k]);p.appendChild(el);return el};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function defs(svg,w,h){
  const id=svg.id;
  svg.innerHTML=`<defs>
   <filter id="rough${id}"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.5"/></filter>
   <filter id="torn${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="11"/><feDisplacementMap in="SourceGraphic" scale="16"/></filter>
   <filter id="wash${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="4" seed="5" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 -1.6 0.95"/></filter>
   <filter id="grain${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.5 0"/></filter>
   <filter id="blur${id}"><feGaussianBlur stdDeviation="5"/></filter>
   <filter id="soft${id}"><feGaussianBlur stdDeviation="2.2"/></filter>
   <radialGradient id="vig${id}" cx="50%" cy="45%" r="72%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient>
   <clipPath id="clip${id}"><path id="sheetpath${id}" d="M14 18 L${w*.42} 10 L${w-16} 22 L${w-10} ${h*.55} L${w-22} ${h-14} L${w*.5} ${h-8} L12 ${h-18} L20 ${h*.45} Z"/></clipPath>
  </defs>`;
  mk(svg,'rect',{x:0,y:0,width:w,height:h,fill:'#0a0a0a'});
  const paper=mk(svg,'g',{filter:`url(#torn${id})`});
  const pg=mk(paper,'g',{'clip-path':`url(#clip${id})`});
  mk(pg,'rect',{x:0,y:0,width:w,height:h,fill:'var(--paper)'});
  mk(pg,'rect',{x:0,y:0,width:w,height:h,filter:`url(#wash${id})`,opacity:.55});
  mk(pg,'rect',{x:0,y:0,width:w,height:h,filter:`url(#grain${id})`,opacity:.5});
  mk(pg,'rect',{x:0,y:0,width:w,height:h,fill:`url(#vig${id})`});
  // fałdy papieru
  mk(pg,'path',{d:`M${w*.5} 0 L${w*.49} ${h}`,stroke:'#000','stroke-width':1.2,opacity:.12});
  mk(pg,'path',{d:`M0 ${h*.5} L${w} ${h*.52}`,stroke:'#000','stroke-width':1.2,opacity:.1});
  return mk(svg,'g',{filter:`url(#rough${id})`});
}
// góry malowane tuszem – ozdoba w tle, z dala od punktów
function mountains(g,w,h,avoid,seed,n){
  const r=rng(seed),mg=mk(g,'g',{opacity:.62});
  let placed=0,tries=0;
  while(placed<n&&tries<n*30){tries++;
    const x=30+r()*(w-60),y=40+r()*(h-90),s=9+r()*20;
    if(avoid.some(a=>Math.hypot(a.x-x,a.y-y)<(a.r||70)))continue;
    placed++;
    mk(mg,'path',{d:`M${x-s} ${y} L${x-s*.15} ${y-s*1.15} L${x+s*.9} ${y}`,fill:'none',stroke:'var(--char)','stroke-width':1.8,'stroke-linejoin':'round'});
    mk(mg,'path',{d:`M${x-s*.15} ${y-s*1.15} L${x+s*.9} ${y} L${x+s*.1} ${y} Z`,fill:'var(--char)',opacity:.75});
    for(let k=1;k<4;k++)mk(mg,'path',{d:`M${x-s*.15-k*s*.22} ${y-s*1.15+k*s*.3} l${s*.18} ${s*.12}`,stroke:'var(--char)','stroke-width':1.2,opacity:.7});
  }
}
// etykieta jak w grze: jasny prostokąt, wersaliki
function tag(parent,x,y,text,anchor,cls){
  const g=mk(parent,'g',{class:'lab'+(cls?' '+cls:'')});
  const rc=mk(g,'rect',{});
  const t=mk(g,'text',{x,y,'text-anchor':anchor||'middle'});t.textContent=text.toUpperCase();
  let b;try{b=t.getBBox()}catch(e){}
  if(!b||!b.width){const fs=cls==='s'?11.5:cls==='xl'?30:15,wd=text.length*fs*.62;b={x:anchor==='end'?x-wd:anchor==='start'?x:x-wd/2,y:y-fs*.8,width:wd,height:fs}}
  const px=cls==='xl'?14:7,py=cls==='xl'?6:3;
  rc.setAttribute('x',b.x-px);rc.setAttribute('y',b.y-py);rc.setAttribute('width',b.width+2*px);rc.setAttribute('height',b.height+2*py);
  return g;
}
function sketchLine(g,A,B,cls,rail){
  const mx=(A.x+B.x)/2,my=(A.y+B.y)/2,dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1;
  const o=Math.min(18,L*.06),cx=mx-dy/L*o,cy=my+dx/L*o;
  mk(g,'path',{d:`M${A.x} ${A.y} Q${cx} ${cy} ${B.x} ${B.y}`,class:'edge a '+cls});
  mk(g,'path',{d:`M${A.x+1.5} ${A.y-1} Q${cx+3} ${cy-2} ${B.x-1} ${B.y+1.5}`,class:'edge b '+cls});
  if(rail)mk(g,'path',{d:`M${A.x} ${A.y} Q${cx} ${cy} ${B.x} ${B.y}`,fill:'none',stroke:'var(--char)','stroke-width':10,'stroke-dasharray':'2 8',opacity:.75});
}
function compass(g,x,y){
  mk(g,'path',{d:`M${x} ${y-34} L${x+8} ${y} L${x} ${y+34} L${x-8} ${y} Z`,fill:'none',stroke:'var(--char)','stroke-width':1.6});
  mk(g,'path',{d:`M${x} ${y-34} L${x+8} ${y} L${x-8} ${y} Z`,fill:'var(--char)'});
  mk(g,'path',{d:`M${x-30} ${y} L${x+30} ${y}`,stroke:'var(--char)','stroke-width':1.2});
  const t=mk(g,'text',{x,y:y-42,'text-anchor':'middle','font-family':'Oswald, Arial Narrow, sans-serif','font-size':18,'font-weight':500,fill:'var(--char)'});t.textContent='N';
}

