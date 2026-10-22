const {core:components,desk,games}=window.buildData;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const brandMap={case:'corsair',cpu:'amd',gpu:'asus',motherboard:'asus',cooler:'thermalright',ram:'crucial',ssd:'samsung',psu:'msi',monitor:'msi',keyboard:'msi',mouse:'vxe',headset:'razer'};
const brandNames={corsair:'Corsair',amd:'AMD',asus:'ASUS',thermalright:'Thermalright',crucial:'Crucial',samsung:'Samsung',msi:'MSI',vxe:'VXE',razer:'Razer'};
function brandLogo(id){const b=brandMap[id];return `<img class="brand-logo brand-${b}" src="assets/brands/${b}.${b==='vxe'?'png':'svg'}?v=2" alt="${brandNames[b]}" width="84" height="26">`}
function productImage(id){return `assets/${id==='psu'?'psu-clean':id}.webp`}

const stage=$('.architecture'),images=$('.component-images'),rail=$('.chapter-rail');
let active=-1,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,current=0,target=0,lastY=-1,lastPaused=null,lastHeight=0;
const toggle=$('.motion-toggle');
function updateToggle(){document.documentElement.classList.toggle('motion-paused',paused);toggle.setAttribute('aria-pressed',String(paused));toggle.title=paused?'Activer les animations':'Mettre les animations en pause';$('.motion-icon').textContent=paused?'▷':'Ⅱ'}
toggle.addEventListener('click',()=>{paused=!paused;updateToggle()});updateToggle();
function jumpTo(index){const distance=stage.offsetHeight-innerHeight;scrollTo({top:stage.offsetTop+(index/(components.length-1))*distance,behavior:paused?'instant':'smooth'})}
components.forEach((c,i)=>{
 const im=document.createElement('img');im.src=productImage(c.id);im.alt=c.maker;im.dataset.id=c.id;im.decoding='async';images.append(im);
 const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0');b.title=c.maker;b.setAttribute('aria-label',`Voir ${c.label} : ${c.maker}`);b.addEventListener('click',()=>jumpTo(i));rail.append(b);
 const row=document.createElement('button');row.type='button';row.className='spec-row';row.setAttribute('aria-label',`Fiche technique : ${c.maker}`);row.innerHTML=`<span class="spec-number">${String(i+1).padStart(2,'0')}</span><span class="spec-label">${c.label.toUpperCase()}</span><span class="spec-value">${c.short}</span>`;row.addEventListener('click',()=>openDetail(c));$('.spec-table').append(row);
});
rail.addEventListener('keydown',e=>{if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();const delta=['ArrowDown','ArrowRight'].includes(e.key)?1:-1;const i=clamp(Math.round(target)+delta,0,7);jumpTo(i);rail.children[i].focus({preventScroll:true})}});
function setText(index){
 if(index===active)return;active=index;const c=components[index];
 $('.component-brand').innerHTML=brandLogo(c.id);$('.component-category').textContent=c.category;$('.component-copy h2').innerHTML=c.title;$('.component-description').textContent=c.description;
 $('.component-specs').innerHTML=c.specs.map(([v,l])=>`<div><strong>${v}</strong><span>${l}</span></div>`).join('');$('.component-maker').textContent=c.maker;
 $('.component-counter').innerHTML=`${String(index+1).padStart(2,'0')} <i>/ 08</i>`;
 [...rail.children].forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-current',i===index?'step':'false')});
 [...images.children].forEach((im,i)=>im.setAttribute('aria-hidden',i===index?'false':'true'));
}
function render(){
 const y=scrollY;
 if(y===lastY&&current===target&&lastPaused===paused&&lastHeight===innerHeight){requestAnimationFrame(render);return}
 lastPaused=paused;lastHeight=innerHeight;
 target=clamp((y-stage.offsetTop)/(stage.offsetHeight-innerHeight),0,1)*7;
 current=paused?target:current+(target-current)*.09;if(Math.abs(target-current)<.0005)current=target;
 setText(Math.round(current));
 [...images.children].forEach((im,i)=>{
  const d=i-current;im.style.opacity=paused?(i===Math.round(current)?1:0):Math.max(0,1-Math.abs(d)*1.5);
  im.style.transform=paused?'none':`translate3d(${Math.sin(d*1.3)*28}px,${-d*120}%,${-Math.abs(d)*80}px) rotate(${d*10}deg) scale(${1-Math.min(.14,Math.abs(d)*.07)})`;
  im.style.visibility=Math.abs(d)>1.2?'hidden':'visible';
 });
 $('.chapter-progress span').style.width=`${current/7*100}%`;
 if(y!==lastY){
  const p=y/(document.documentElement.scrollHeight-innerHeight)*100;
  $('.reading-progress').style.width=p+'%';$('.hud-percent').textContent=String(Math.round(p)).padStart(3,'0')+'%';lastY=y;
 }
 requestAnimationFrame(render);
}
render();

// Component dossiers — native dialog keeps focus and Escape behavior accessible.
const detailDialog=$('.component-dialog');
function openDetail(c){
 $('.dialog-visual img').src=productImage(c.id);$('.dialog-visual img').alt=c.maker;$('.dialog-label').textContent=c.label.toUpperCase();
 $('.dialog-brand').innerHTML=brandLogo(c.id);$('#detail-title').textContent=c.maker;$('.detail-role').textContent=c.role;
 $('.detail-specs').innerHTML=c.details.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
 $('.detail-note').textContent=c.note||'';$('.detail-note').hidden=!c.note;$('.detail-source').href=c.source;
 detailDialog.showModal();detailDialog.scrollTop=0;
}
$('.detail-trigger').addEventListener('click',()=>openDetail(components[active]));
desk.forEach(c=>{
 const card=$(`.${c.id}-card`);const badge=document.createElement('div');badge.className='setup-brand';badge.innerHTML=brandLogo(c.id);card.querySelector('.card-bottom').prepend(badge);const b=document.createElement('button');b.type='button';b.className='setup-detail';b.innerHTML='Explorer les caractéristiques <span>↗</span>';b.setAttribute('aria-label',`Fiche technique : ${c.maker}`);b.addEventListener('click',()=>openDetail(c));card.append(b);
});
$$('dialog').forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
});
const credits=$('.credits-list');
[...components,...desk].forEach(c=>{const a=document.createElement('a');a.href=c.source;a.target='_blank';a.rel='noopener noreferrer';a.innerHTML=`<span>${c.maker}</span><span>↗</span>`;credits.append(a)});
games.forEach(g=>{const a=document.createElement('a');a.href=g.source;a.target='_blank';a.rel='noopener noreferrer';a.innerHTML=`<span>${g.name} — ${g.credit}</span><span>↗</span>`;credits.append(a)});
$('.credits-trigger').addEventListener('click',()=>$('.credits-dialog').showModal());

// Gaming — automatic crossfade, with manual controls and motion preferences.
let gameIndex=-1;const tabs=$('.game-tabs');
games.forEach((g,i)=>{
 const b=document.createElement('button');b.type='button';b.role='tab';b.id=`game-tab-${i}`;b.setAttribute('aria-controls','game-panel');b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${g.name}`;b.addEventListener('click',()=>selectGame(i));tabs.append(b);
 const im=document.createElement('img');im.src=`assets/${g.id}-gameplay.webp`;im.alt=`${g.name} — capture de jeu publiée par l’éditeur`;im.loading='lazy';im.decoding='async';$('.game-pictures').append(im);
});
function selectGame(i){
 i=(i+games.length)%games.length;if(i===gameIndex)return;gameIndex=i;const g=games[i];
 [...tabs.children].forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1});
 $$('.game-pictures img').forEach((im,j)=>{im.classList.toggle('active',i===j);im.setAttribute('aria-hidden',i===j?'false':'true')});
 $('#game-panel').setAttribute('aria-labelledby',`game-tab-${i}`);
 $('.game-category').textContent=g.category;$('.game-content h3').textContent=g.name;$('.game-description').textContent=g.description;
 $('.game-profile-value').textContent=g.profile;$('.game-focus').textContent=g.focus;$('.game-tuning').textContent=g.tuning;
 $('.game-source').href=g.source;$('.game-counter').textContent=`${String(i+1).padStart(2,'0')} / 04`;
}
tabs.addEventListener('keydown',e=>{let n=gameIndex;if(e.key==='ArrowRight')n++;else if(e.key==='ArrowLeft')n--;else if(e.key==='Home')n=0;else if(e.key==='End')n=3;else return;e.preventDefault();selectGame(n);tabs.children[gameIndex].focus()});
$('.game-prev').addEventListener('click',()=>selectGame(gameIndex-1));$('.game-next').addEventListener('click',()=>selectGame(gameIndex+1));selectGame(0);

// HUD chapter tracking, inspired by the reference's instrument panel.
const chapters=[['vision','VISION'],['architecture','ARCHITECTURE'],['configuration','CONFIGURATION'],['gaming','GAMING'],['setup','SETUP'],['prix','PRIX'],['marques','MARQUES']];
const chapterObserver=new IntersectionObserver(entries=>{
 const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(!visible.length)return;
 const id=visible[0].target.id;$('.hud-chapter').textContent='UW / '+chapters.find(c=>c[0]===id)[1];
 $$('.header nav a').forEach(a=>a.classList.toggle('current',a.getAttribute('href')==='#'+id));
},{rootMargin:'-15% 0px -55% 0px',threshold:0});chapters.forEach(([id])=>chapterObserver.observe(document.getElementById(id)));

// Organic flow field, adapted from the supplied reference; runs only in view.
const canvas=$('.flow-field'),ctx=canvas.getContext('2d');let particles=[],width=0,height=0,flowVisible=true,flowTime=0,lastFrame=0;
const pointer={x:-9999,y:-9999};
function spawn(){return{x:Math.random()*width,y:Math.random()*height,life:60+Math.random()*240,speed:.45+Math.random()*.8}}
function sizeFlow(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(1.5,devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:Math.round(clamp(width*height/2700,130,550))},spawn)}
function drawFlow(){
 ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.045)';ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation='source-over';flowTime+=.002;
 ctx.beginPath();for(const p of particles){const angle=(Math.sin(p.x*.003+flowTime)+Math.cos(p.y*.002-flowTime*.6))*Math.PI;
  let vx=Math.cos(angle)*p.speed,vy=Math.sin(angle)*p.speed;const dx=p.x-pointer.x,dy=p.y-pointer.y,d2=dx*dx+dy*dy;
  if(d2<25000){const d=Math.sqrt(d2)+1,f=(1-d2/25000)*2;vx+=-dy/d*f;vy+=dx/d*f}
  ctx.moveTo(p.x,p.y);p.x+=vx;p.y+=vy;ctx.lineTo(p.x,p.y);
  if(--p.life<0||p.x<0||p.x>width||p.y<0||p.y>height)Object.assign(p,spawn());
 }ctx.lineWidth=.6;ctx.strokeStyle='rgba(225,225,225,.32)';ctx.stroke();
}
sizeFlow();for(let i=0;i<45;i++)drawFlow();
new IntersectionObserver(es=>{flowVisible=es[0].isIntersecting},{threshold:0}).observe(canvas);
$('.hero').addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top},{passive:true});$('.hero').addEventListener('pointerleave',()=>pointer.x=pointer.y=-9999);
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(sizeFlow,180)});
function flowFrame(now){if(!paused&&flowVisible&&!document.hidden&&now-lastFrame>30){drawFlow();lastFrame=now}requestAnimationFrame(flowFrame)}requestAnimationFrame(flowFrame);

// Purchase history and dated comparison prices (integer cents for totals).
const euro=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n);
let purchaseCents=0,referenceCents=0;
components.forEach((c,i)=>{const p=window.priceData[c.id],paid=Math.round(p.paid*100),ref=Math.round(p.reference*100),diff=ref-paid;purchaseCents+=paid;referenceCents+=ref;
 const row=document.createElement('article');row.className='price-row';row.innerHTML=`<span class="price-index">${String(i+1).padStart(2,'0')}</span><div class="price-product">${brandLogo(c.id)}<h3>${c.short}</h3><span>${c.label}</span></div><div class="price-reference">${diff>0?`<s>${euro(p.reference)}</s>`:`<span class="reference-current">${euro(p.reference)}</span>`}</div><div class="price-paid"><strong>${euro(p.paid)}</strong><small class="${diff>0?'price-saving':'price-neutral'}">${diff>0?`${euro(diff/100)} de moins · −${Math.round(diff/ref*100)} %`:`Prix relevé inférieur de ${euro(-diff/100)}`}</small></div>`;$('.price-list').append(row)});
$('.price-total-value').textContent=euro(purchaseCents/100);$('.price-reference-total').textContent=euro(referenceCents/100);$('.price-total-difference').textContent=euro((referenceCents-purchaseCents)/100);

// Advance only while the gallery is visible; interactions give the reader time.
let galleryVisible=false,galleryHover=false,galleryFocused=false,nextGameAt=performance.now()+4000;
const gallery=$('#gaming');
new IntersectionObserver(es=>{galleryVisible=es[0].isIntersecting;nextGameAt=performance.now()+4000},{threshold:.15}).observe($('.game-stage'));
gallery.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')galleryHover=true});gallery.addEventListener('pointerleave',()=>{galleryHover=false;nextGameAt=performance.now()+4000});
gallery.addEventListener('focusin',()=>galleryFocused=true);gallery.addEventListener('focusout',e=>{galleryFocused=gallery.contains(e.relatedTarget);nextGameAt=performance.now()+4000});
gallery.addEventListener('click',()=>nextGameAt=performance.now()+4000);
setInterval(()=>{const now=performance.now();if(paused||document.hidden||!galleryVisible||galleryHover||galleryFocused){nextGameAt=now+4000;return}if(now>=nextGameAt){selectGame(gameIndex+1);nextGameAt=now+4000}},250);


// Render the horizontal brand wheel only while visible and in motion.
const horizontalWheel=$('.brand-wheel'),orbitItems=$$('.brand-orbit-item');
let wheelPhase=.12,wheelLast=0,wheelVisible=false,wheelHover=false,wheelFrame=0;
function wakeWheel(){if(!wheelFrame&&wheelVisible&&!document.hidden){wheelLast=0;wheelFrame=requestAnimationFrame(renderHorizontalWheel)}}
new IntersectionObserver(es=>{wheelVisible=es[0].isIntersecting;if(wheelVisible)wakeWheel();else if(wheelFrame){cancelAnimationFrame(wheelFrame);wheelFrame=0}},{threshold:0}).observe(horizontalWheel);
horizontalWheel.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')wheelHover=true});
horizontalWheel.addEventListener('pointerleave',()=>{wheelHover=false;wakeWheel()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)wakeWheel()});
new MutationObserver(wakeWheel).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
addEventListener('resize',wakeWheel,{passive:true});
function renderHorizontalWheel(now){
 wheelFrame=0;if(!wheelVisible||document.hidden)return;
 const dt=wheelLast?Math.min((now-wheelLast)/1000,.05):0;wheelLast=now;
 if(!paused&&!wheelHover)wheelPhase+=dt*Math.PI*2/32;
 const mobile=innerWidth<=600,rx=horizontalWheel.clientWidth*.4,rz=mobile?65:155;
 orbitItems.forEach((item,i)=>{const angle=wheelPhase+i*Math.PI*2/orbitItems.length,depth=Math.cos(angle),x=Math.sin(angle)*rx,z=depth*rz;
  const cutoff=mobile?.6:.35,opacity=clamp((depth-cutoff)/.3,0,1);
  item.style.transform=`translate3d(${x}px,0,${z}px) rotateY(${Math.sin(angle)*30}deg) scale(${.6+.4*Math.max(0,depth)})`;
  item.style.opacity=opacity;item.style.visibility=depth>cutoff?'visible':'hidden';item.style.zIndex=Math.round((depth+1)*100);item.setAttribute('aria-hidden',depth>cutoff?'false':'true');
 });
 if(!paused&&!wheelHover)wheelFrame=requestAnimationFrame(renderHorizontalWheel);
}
