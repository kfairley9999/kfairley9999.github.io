/* Provefirst lead form (shared by every landing page; product comes from data-product): validates, captures UTM/referrer, posts to the coi-leads Worker, mailto fallback on failure. YouTube facade. */
(function(){
  var d=document, w=window, ENDPOINT='https://coi-leads.kfairley9999.workers.dev/lead', TO='kfairley9999@gmail.com';
  var t0=Date.now(), KEYS=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  // Persist first-touch UTM + referrer for the session.
  var attr={};
  try{
    var q=new URLSearchParams(location.search), saved=JSON.parse(sessionStorage.getItem('coi_attr')||'null');
    if(saved) attr=saved;
    KEYS.forEach(function(k){var v=q.get(k);if(v) attr[k]=v.slice(0,120)});
    if(!attr.referrer&&d.referrer&&d.referrer.indexOf(location.host)<0) attr.referrer=d.referrer.slice(0,300);
    sessionStorage.setItem('coi_attr',JSON.stringify(attr));
  }catch(e){}
  var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function msgFor(el){
    var n=el.name,v=(el.value||'').trim();
    if(el.required&&!v) return el.tagName==='SELECT'?'Please choose one.':'Required.';
    if(n==='email'&&v&&!EMAIL.test(v)) return 'Please enter a valid work email.';
    if((n==='name'||n==='company')&&v.length<2) return 'Please enter at least 2 characters.';
    if(n==='phone'&&v&&!/^[0-9+().\-\s x]{7,40}$/i.test(v)) return 'Please check the phone number.';
    return '';
  }
  function setErr(el,m){
    var f=el.closest('.field'); if(!f) return;
    var e=f.querySelector('.ferr'); if(!e){e=d.createElement('span');e.className='ferr';e.id=el.id+'-err';f.appendChild(e)}
    e.textContent=m; el.setAttribute('aria-invalid',m?'true':'false'); if(m) el.setAttribute('aria-describedby',e.id); else el.removeAttribute('aria-describedby');
  }
  // Email copy to Kevin via FormSubmit (free). Sent from the browser because FormSubmit blocks Cloudflare's servers.
  function emailCopy(data,id){
    try{
      var test=/\bTEST\b/.test([data.name,data.company,data.message].join(' '));
      var p={_subject:(test?'TEST ':'')+'New '+data.product+' lead: '+data.name+' — '+data.company,_template:'table',_captcha:'false',_replyto:data.email,
        Product:data.product,Name:data.name,'Work email':data.email,Company:data.company,Phone:data.phone||'—',Message:data.message||'—',
        Source:[data.utm_source,data.utm_medium,data.utm_campaign].filter(Boolean).join(' / ')||'(direct)',Referrer:data.referrer||'—',Page:data.page,'Lead ID':id||'(not stored — Worker unreachable)'};
      if(data.role) p.Role=data.role; if(data.volume) p['Certificates per month']=data.volume;
      return fetch('https://formsubmit.co/ajax/'+TO,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(p),keepalive:true}).then(function(r){return r.ok},function(){return false});
    }catch(e){return Promise.resolve(false)}
  }
  function mailto(data){
    var body=['Product: '+data.product,'Name: '+data.name,'Work email: '+data.email,'Company: '+data.company].concat(data.role?['Role: '+data.role]:[],data.volume?['Certificates per month: '+data.volume]:[],['Phone: '+(data.phone||'—'),'','Message:',data.message||'—']).join('\n');
    return 'mailto:'+TO+'?subject='+encodeURIComponent(data.product+' inquiry — '+(data.company||data.name))+'&body='+encodeURIComponent(body);
  }
  d.querySelectorAll('form[data-lead]').forEach(function(form){
    var st=form.querySelector('[data-status]'), btn=form.querySelector('button[type=submit]'), fields=form.querySelectorAll('input:not([name=website]),select,textarea');
    fields.forEach(function(el){el.addEventListener('blur',function(){if(el.value) setErr(el,msgFor(el))});el.addEventListener('input',function(){if(el.getAttribute('aria-invalid')==='true') setErr(el,msgFor(el))})});
    form.addEventListener('submit',function(ev){
      ev.preventDefault();
      var first=null;
      fields.forEach(function(el){var m=msgFor(el);setErr(el,m);if(m&&!first) first=el});
      if(first){first.focus();st.className='fstatus err';st.textContent='Please fix the highlighted fields.';return}
      var data={}; new FormData(form).forEach(function(v,k){data[k]=String(v).trim()});
      for(var k in attr) data[k]=attr[k];
      data.page=location.href.slice(0,300); data.form=form.id||'lead'; data.product=form.getAttribute('data-product')||'COI Extract'; data._t=Date.now()-t0;
      var invalid=false; btn.disabled=true; var label=btn.innerHTML; btn.textContent='Sending…'; st.className='fstatus'; st.textContent='';
      fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),mode:'cors'})
        .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j}})})
        .then(function(res){
          if(res.ok&&res.j&&res.j.ok){
            if(res.j.id!=='ok') emailCopy(data,res.j.id);
            form.classList.add('sent');
            var okMsg=form.getAttribute('data-success')||'Kevin will email you within 1 business day.';
            form.innerHTML='<div class="fdone" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><h3>Thanks, '+(data.name.split(' ')[0].replace(/[<>&"]/g,''))+' — got it.</h3><p></p></div>';
            form.querySelector('.fdone p').innerHTML=okMsg.replace(/[<>]/g,'')+' Questions now? <a href="mailto:'+TO+'">'+TO+'</a>';
            var dn=form.querySelector('.fdone'); if(dn) dn.focus();
            try{w.dataLayer&&w.dataLayer.push({event:'generate_lead',form:data.form})}catch(e){}
            return;
          }
          if(res.j&&res.j.errors){invalid=true;Object.keys(res.j.errors).forEach(function(n){var el=form.querySelector('[name='+n+']');if(el) setErr(el,res.j.errors[n])})}
          throw new Error((res.j&&res.j.error)||'failed');
        })
        .catch(function(){
          if(!invalid) emailCopy(data,'');
          btn.disabled=false; btn.innerHTML=label; st.className='fstatus err';
          st.innerHTML='We couldn’t send that just now. <a href="'+mailto(data).replace(/"/g,'&quot;')+'">Email it to Kevin instead</a> — your details are filled in.';
        });
    });
  });
  // YouTube facade: no iframe or YouTube request until the visitor clicks play.
  d.querySelectorAll('[data-yt]').forEach(function(box){
    var b=box.querySelector('button'); if(!b) return;
    b.addEventListener('click',function(){
      var f=d.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+box.getAttribute('data-yt')+'?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      f.title=box.getAttribute('data-yt-title')||'Demo video'; f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen=true; f.width=960; f.height=540;
      box.innerHTML=''; box.appendChild(f); box.classList.add('on');
    },{once:true});
  });
})();
