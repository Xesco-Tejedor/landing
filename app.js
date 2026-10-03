document.querySelectorAll('.btn.ghost').forEach(function(b){b.addEventListener('click',function(){
  var open=b.getAttribute('aria-expanded')==='true';var card=b.closest('.service,.project');
  var detail=card.querySelector('.service-detail,.project-result');
  if(card.classList.contains('service')){document.querySelectorAll('.service').forEach(function(s){s.classList.remove('is-open');var bb=s.querySelector('.btn.ghost');bb.setAttribute('aria-expanded','false');bb.textContent=bb.dataset.labelClosed;s.querySelector('.service-detail').hidden=true;});}
  if(!open){b.setAttribute('aria-expanded','true');b.textContent=b.dataset.labelOpen;detail.hidden=false;if(card.classList.contains('service'))card.classList.add('is-open');}
  else{b.setAttribute('aria-expanded','false');b.textContent=b.dataset.labelClosed;detail.hidden=true;card.classList.remove('is-open');}
});});
document.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){
  document.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false');});
  c.classList.add('on');c.setAttribute('aria-pressed','true');var f=c.dataset.filter;
  document.querySelectorAll('.service').forEach(function(s){s.hidden=!(f==='Todos'||s.dataset.area===f);});
});});

(function(){
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
/* progress bar */
var bar=document.createElement('div');bar.className='progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
function prog(){var h=document.documentElement;var m=h.scrollHeight-h.clientHeight;bar.style.transform='scaleX('+(m>0?h.scrollTop/m:0)+')';}
addEventListener('scroll',prog,{passive:true});prog();
/* hero title word reveal */
var t=document.querySelector('.hero-title');
if(t&&!reduce){var words=t.textContent.trim().split(/\s+/);t.innerHTML=words.map(function(w,i){return '<span class="w" style="animation-delay:'+(0.15+i*0.09)+'s">'+w+'</span>'}).join(' ');}
/* terminal typewriter */
var tl=document.querySelector('.terminal-line');
if(tl){var cur=tl.querySelector('.cursor');var lines=['> conservar · conectar · crear','> preservar el software de 8 bits_','> metadatos que conectan colecciones_','> la memoria también necesita futuro_'];
 [].slice.call(tl.childNodes).forEach(function(n){if(n.nodeType===3)tl.removeChild(n);});var txt=document.createElement('span');tl.insertBefore(txt,cur);txt.textContent=lines[0].replace(/_$/,'');
 if(!reduce){var li=0,ci=lines[0].length,del=false,pause=0;
  setInterval(function(){
   if(pause>0){pause--;return;}
   var full=lines[li].replace(/_$/,'');
   if(!del){ci++;txt.textContent=full.slice(0,ci);if(ci>=full.length){pause=28;del=true;}}
   else{ci-=2;if(ci<=2){ci=2;del=false;li=(li+1)%lines.length;}txt.textContent=lines[li].replace(/_$/,'').slice(0,ci>2?ci:2);if(!del){ci=2;}}
  },55);}
}
/* hero spotlight + image tilt */
var hero=document.querySelector('.hero');var img=document.querySelector('.hero-art img');
if(hero&&!reduce){hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect();hero.style.setProperty('--mx',(e.clientX-r.left)+'px');hero.style.setProperty('--my',(e.clientY-r.top)+'px');
  if(img){var ir=img.getBoundingClientRect();var dx=(e.clientX-(ir.left+ir.width/2))/ir.width,dy=(e.clientY-(ir.top+ir.height/2))/ir.height;img.style.setProperty('--ry',(dx*8)+'deg');img.style.setProperty('--rx',(-dy*8)+'deg');}});
 hero.addEventListener('mouseleave',function(){if(img){img.style.setProperty('--ry','0deg');img.style.setProperty('--rx','0deg');}});
 var f=0;setInterval(function(){f+=0.05;if(img)img.style.setProperty('--fy',(Math.sin(f)*-6)+'px');},50);}
/* scroll reveal */
var els=[].slice.call(document.querySelectorAll('.group,.lead2,.choice,.service,.project,.facts div,.principle,.contact-links,.foot'));
els.forEach(function(el,i){el.classList.add('reveal');var sib=el.parentElement?[].indexOf.call(el.parentElement.children,el):0;el.style.setProperty('--d',((sib%4)*0.08)+'s');});
if('IntersectionObserver' in window&&!reduce){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -6% 0px'});els.forEach(function(el){io.observe(el)});}
else{els.forEach(function(el){el.classList.add('in')});}
/* nav active */
var links=[].slice.call(document.querySelectorAll('.portfolio-nav a'));
var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
function act(){var y=scrollY+120,cur=-1;secs.forEach(function(s,i){if(s&&s.offsetTop<=y)cur=i});links.forEach(function(a,i){a.classList.toggle('active',i===cur)});}
addEventListener('scroll',act,{passive:true});act();
/* service spotlight */
document.querySelectorAll('.service').forEach(function(s){s.addEventListener('mousemove',function(e){var r=s.getBoundingClientRect();s.style.setProperty('--sx',(e.clientX-r.left)+'px');s.style.setProperty('--sy',(e.clientY-r.top)+'px');});});
/* animated filter (override simple one) */
document.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){
 var f=c.dataset.filter,n=0;
 document.querySelectorAll('.service').forEach(function(s){var show=(f==='Todos'||s.dataset.area===f);
  if(show){var wasHidden=s.hidden;s.hidden=false;s.classList.remove('leaving');if(wasHidden){s.classList.remove('entering');void s.offsetWidth;s.style.setProperty('--d',(n*0.07)+'s');s.classList.add('entering');}n++;}
 });
});});
})();
