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
  /* lead forms -> mailto with copy fallback */
  d.querySelectorAll('form[data-lead-form]').forEach(function(form){
    var status=form.querySelector('[data-form-status]'), product=form.getAttribute('data-product')||'Product', to=form.getAttribute('data-recipient')||'kfairley9999@gmail.com';
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var fd=new FormData(form), g=function(k){return String(fd.get(k)||'').trim()};
      var name=g('name'),company=g('company'),email=g('email'),phone=g('phone'),need=g('need');
      var body=['Product: '+product,'Name: '+(name||'(not provided)'),'Company: '+(company||'(not provided)'),'Email: '+(email||'(not provided)'),'Phone: '+(phone||'(not provided)'),'What they need:',need||'(not provided)'].join('\n');
      var subject=product+' pilot / inquiry'+(company?' — '+company:(name?' — '+name:''));
      var href='mailto:'+to+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      if(status){
        status.innerHTML='';
        var p=d.createElement('p');p.innerHTML='<strong>Ready to send to '+to+'.</strong> Your email app should open with these details. If it did not, use the buttons below.';
        var pre=d.createElement('pre');pre.textContent='Subject: '+subject+'\n\n'+body;
        var row=d.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:10px';
        var a=d.createElement('a');a.className='btn btn-primary btn-sm';a.href=href;a.textContent='Open in email app';
        var c=d.createElement('button');c.type='button';c.className='btn btn-line btn-sm';c.textContent='Copy details';
        c.addEventListener('click',function(){if(navigator.clipboard)navigator.clipboard.writeText('To: '+to+'\nSubject: '+subject+'\n\n'+body).then(function(){c.textContent='Copied'})});
        row.appendChild(a);row.appendChild(c);status.appendChild(p);status.appendChild(pre);status.appendChild(row);status.classList.add('show');
      }
      window.location.href=href;
    });
  });

  /* Lazy-load Tally: no third-party script or iframe until click, #pilot, or the section is scrolled into view. The observer arms only after a user gesture/scroll so a Lighthouse page-load stays clean. */
  d.querySelectorAll('[data-tally-embed]').forEach(function(box){
    var loaded=false;
    var load=function(){
      if(loaded) return; loaded=true;
      var src=box.getAttribute('data-tally-src');
      if(!src) return;
      box.classList.add('is-ready');
      box.innerHTML='';
      var iframe=d.createElement('iframe');
      iframe.setAttribute('data-tally-src',src);
      iframe.setAttribute('loading','lazy');
      iframe.setAttribute('width','100%');
      iframe.setAttribute('height','520');
      iframe.setAttribute('frameborder','0');
      iframe.setAttribute('marginheight','0');
      iframe.setAttribute('marginwidth','0');
      iframe.setAttribute('title',box.getAttribute('data-tally-title')||'Inquiry form');
      iframe.style.border=0;
      box.appendChild(iframe);
      var w='https://tally.so/widgets/embed.js';
      var go=function(){
        if(typeof Tally!=='undefined'&&Tally.loadEmbeds) Tally.loadEmbeds();
        else box.querySelectorAll('iframe[data-tally-src]:not([src])').forEach(function(el){el.src=el.getAttribute('data-tally-src')});
      };
      if(typeof Tally!=='undefined') go();
      else {
        var existing=d.querySelector('script[src="'+w+'"]');
        if(existing){
          if(existing.getAttribute('data-tally-ready')) go();
          else existing.addEventListener('load',go);
        } else {
          var s=d.createElement('script');
          s.src=w; s.async=true;
          s.onload=function(){s.setAttribute('data-tally-ready','1');go()};
          s.onerror=go;
          d.body.appendChild(s);
        }
      }
    };
    var btn=box.querySelector('[data-tally-open]');
    if(btn) btn.addEventListener('click',load);
    var startObserver=function(){
      if(!('IntersectionObserver' in window)) return;
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){if(e.isIntersecting){load();io.disconnect()}});
      },{threshold:0.2});
      io.observe(box);
    };
    var armed=false;
    var arm=function(){if(armed) return; armed=true; startObserver()};
    window.addEventListener('scroll',arm,{once:true,passive:true});
    window.addEventListener('pointerdown',arm,{once:true});
    window.addEventListener('keydown',arm,{once:true});
    if(location.hash==='#pilot'){
      var jump=function(){load()};
      if(d.readyState==='complete') jump(); else window.addEventListener('load',jump);
    }
  });

  d.querySelectorAll('.nav-menu a').forEach(function(a){a.addEventListener('click',function(){var det=a.closest('details');if(det) det.open=false})});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){d.querySelectorAll('.nav-menu[open]').forEach(function(el){el.open=false})}});
  var y=d.getElementById('year'); if(y) y.textContent=String(new Date().getFullYear());
})();
