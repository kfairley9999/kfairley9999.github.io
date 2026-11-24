(function(){
  var d=document, reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* reveal */
  var rv=d.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:.06});
    rv.forEach(function(el){io.observe(el)});
  } else rv.forEach(function(el){el.classList.add('in')});
  /* hero video: autoplay muted loop only when motion is OK and visible */
  var v=d.querySelector('video[data-auto]');
  if(v&&!reduce&&'IntersectionObserver' in window){
    v.muted=true;v.loop=true;
    var arm=function(){
      var vo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.12});
      vo.observe(v);
    };
    var later=function(){setTimeout(function(){(window.requestIdleCallback||function(f){f()})(arm)},1200)};
    if(d.readyState==='complete') later(); else window.addEventListener('load',later);
  }
  /* sticky mobile CTA: shown only after hero CTAs scroll away, hidden over the form */
  var m=d.querySelector('.mcta'), f=d.getElementById('pilot'), hc=d.querySelector('.hero .ctas');
  if(m&&'IntersectionObserver' in window){
    var st={hero:true,form:false}, upd=function(){m.classList.toggle('hide',st.hero||st.form)};
    m.classList.add('hide');
    if(hc) new IntersectionObserver(function(es){es.forEach(function(e){st.hero=e.isIntersecting||e.boundingClientRect.top>0;upd()})}).observe(hc);
    if(f) new IntersectionObserver(function(es){es.forEach(function(e){st.form=e.isIntersecting;upd()})},{threshold:.05}).observe(f);
  }
  d.querySelectorAll('.nav-menu a').forEach(function(a){a.addEventListener('click',function(){var det=a.closest('details');if(det) det.open=false})});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){d.querySelectorAll('.nav-menu[open]').forEach(function(el){el.open=false})}});
  var y=d.getElementById('year'); if(y) y.textContent=String(new Date().getFullYear());
})();
