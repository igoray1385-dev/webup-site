const experience=document.querySelector('.experience');
const chapters=[...document.querySelectorAll('[data-chapter]')];
const labels=['ABERTURA','PERSPECTIVA','PRESENÇA','SERVIÇOS','POSSIBILIDADES','PROCESSO','SUA JOGADA'];
const anchors={inicio:0,estrategia:3,projetos:4,processo:5,contato:6};
const maxStep=chapters.length-1;
let current=-1,raf=0;
function renderJourney(){
 raf=0;
 const range=Math.max(1,experience.offsetHeight-innerHeight);
 const progress=Math.max(0,Math.min(1,-experience.getBoundingClientRect().top/range));
 const stage=progress*maxStep;
 const active=Math.round(stage);
 experience.style.setProperty('--journey-progress',progress);
 chapters.forEach((chapter,i)=>{
   const distance=Math.abs(stage-i);
   const opacity=Math.max(0,Math.min(1,(.79-distance)/.58));
   chapter.style.opacity=opacity.toFixed(3);
   chapter.style.visibility=opacity>.005?'visible':'hidden';
   chapter.style.transform=`translate3d(${(i-stage)*30}px,${(i-stage)*18}px,0) scale(${1-Math.min(distance,.8)*.035})`;
   const interactive=i===active;
   chapter.inert=!interactive;
   chapter.setAttribute('aria-hidden',String(!interactive));
   chapter.classList.toggle('is-active',interactive);
 });
 document.querySelector('.header').classList.toggle('is-scrolled',progress>.96);
 document.querySelector('#journey-count').textContent=String(active+1).padStart(2,'0')+' / 07';
 document.querySelector('#journey-current').textContent=labels[active];
 document.querySelector('#annotation-title').textContent=labels[active];
 document.querySelector('#annotation-coordinate').textContent='WEBUP · 0'+(active+1)+' / 07';
 experience.classList.toggle('show-board-control',active<=2);if(active!==current){current=active;window.dispatchEvent(new CustomEvent('webup:stage',{detail:{index:active,progress}}));}
}
function schedule(){if(!raf)raf=requestAnimationFrame(renderJourney);}
function jump(index,behavior){const top=experience.getBoundingClientRect().top+scrollY;const range=Math.max(1,experience.offsetHeight-innerHeight);scrollTo({top:top+range*index/maxStep,behavior});schedule();}
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{const id=link.getAttribute('href').slice(1);if(!(id in anchors))return;e.preventDefault();history.replaceState(null,'','#'+id);jump(anchors[id],window.webupMotion?'smooth':'instant');}));
addEventListener('load',()=>{const id=decodeURIComponent(location.hash.slice(1));if(id in anchors&&anchors[id]>0)jump(anchors[id],'instant');renderJourney();});
renderJourney();
