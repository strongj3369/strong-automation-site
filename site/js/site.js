(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Celestial Destiny birth card (products page): solar value = 55 - (2 x month + day) */
  if(document.getElementById('bcForm'))(function(){
  var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var dim=[31,29,31,30,31,30,31,31,30,31,30,31];
  var ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  var rankNames=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Jack','Queen','King'];
  /* River=Hearts, Feather=Clubs, Sky=Diamonds, Mountain=Spades */
  var suits=[['river','Rivers','The Suit of Emotion, Connection & Relationship'],['feather','Feathers','The Suit of Knowledge, News & Communication'],['sky','Sky','The Suit of Value, Worth & Resources'],['mountain','Mountains','The Suit of Labor, Effort & Responsibility']];
  var mSel=document.getElementById('bcMonth'),dSel=document.getElementById('bcDay');
  months.forEach(function(m,i){mSel.add(new Option(m,i+1));});
  function fillDays(){var keep=+dSel.value||1;dSel.innerHTML='';for(var d=1;d<=dim[mSel.value-1];d++)dSel.add(new Option(d,d));dSel.value=Math.min(keep,dim[mSel.value-1]);}
  mSel.addEventListener('change',function(){fillDays();reveal(true);});
  dSel.addEventListener('change',function(){reveal(true);});
  function reveal(anim){
    var m=+mSel.value,d=+dSel.value,v=55-(2*m+d),c=document.getElementById('bigcard'),rk=document.getElementById('cRank');
    c.className='bigcard';c.querySelectorAll('.jt').forEach(function(x){x.remove();});
    if(v===0){
      document.getElementById('bcName').textContent='The Jester';
      document.getElementById('bcSuit').textContent='The card outside the suits';
      c.classList.add('jester');rk.hidden=true;
      var jt=document.createElement('span');jt.className='jt';jt.innerHTML='<small>THE</small>JESTER';c.appendChild(jt);
    }else{
      var s=suits[Math.floor((v-1)/13)],r=(v-1)%13;
      document.getElementById('bcName').textContent=rankNames[r]+' of '+s[1];
      document.getElementById('bcSuit').textContent=s[2];
      c.classList.add('s-'+s[0]);rk.hidden=false;rk.textContent=ranks[r];
    }
    document.getElementById('bcNote').textContent='Birthday: '+months[m-1]+' '+d;
    if(anim&&!reduce){void c.offsetWidth;c.classList.add('flip');}
  }
  mSel.value=3;fillDays();dSel.value=20;reveal(false);
  document.getElementById('bcForm').addEventListener('submit',function(e){e.preventDefault();reveal(true);});
  })();

  /* product slideshows: auto-advance every 5s while on screen; pause on hover or focus;
     any tab pick, swipe, click or tap inside a slide stops auto-play for good, so the
     Celestial Destiny form can never be pulled away mid-use; no auto-play for reduced motion */
  [].forEach.call(document.querySelectorAll('[data-slides]'),function(root){
    var slides=[].slice.call(root.querySelectorAll('.slide')),tabs=[].slice.call(root.querySelectorAll('.tabs [role=tab]'));
    var cur=0,timer=0,hover=false,focus=false,visible=false,stopped=reduce;
    function show(n,moveFocus){
      n=(n+slides.length)%slides.length;
      slides.forEach(function(s,j){var on=j===n;s.classList.toggle('on',on);s.inert=!on;s.setAttribute('aria-hidden',!on);});
      tabs.forEach(function(t,j){var on=j===n;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;});
      cur=n;if(moveFocus)tabs[n].focus();ink();
      /* keep the selected tab visible when the tab row scrolls sideways (no vertical page scroll) */
      var t=tabs[n],rail=t.parentNode;
      if(t.offsetLeft<rail.scrollLeft||t.offsetLeft+t.offsetWidth>rail.scrollLeft+rail.clientWidth)rail.scrollTo({left:t.offsetLeft-8,behavior:reduce?'auto':'smooth'});
    }
    function schedule(){
      clearTimeout(timer);
      if(!stopped&&!hover&&!focus&&visible&&!document.hidden)timer=setTimeout(function(){show(cur+1);schedule();},5000);
    }
    function stop(){stopped=true;clearTimeout(timer);sync();}
    function pick(n,moveFocus){stop();show(n,moveFocus);}
    /* pause/play button beside the tabs; an explicit Play overrides the hover pause until the pointer leaves */
    var tabsEl=root.querySelector('.tabs'),bar=document.createElement('div'),btn=document.createElement('button');
    bar.className='tabbar';btn.type='button';btn.className='sp-toggle';
    btn.innerHTML='<svg class="i-pause" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z"/></svg><svg class="i-play" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.3l7.5 4.7L3 10.7z"/></svg>';
    tabsEl.parentNode.insertBefore(bar,tabsEl);bar.appendChild(tabsEl);bar.appendChild(btn);
    /* sliding underline under the selected tab: placed instantly first, animated from then on */
    var bar2=document.createElement('span');bar2.className='ink';bar2.setAttribute('aria-hidden','true');tabsEl.appendChild(bar2);
    function ink(){var t=tabs[cur];bar2.style.transform='translateX('+t.offsetLeft+'px) scaleX('+(t.offsetWidth/100)+')';}
    function sync(){btn.classList.toggle('paused',stopped);btn.setAttribute('aria-label',(stopped?'Play':'Pause')+' slideshow');}
    btn.addEventListener('click',function(){
      if(stopped){stopped=false;hover=false;focus=false;show(cur+1);sync();schedule();}else stop();
    });
    tabs.forEach(function(t,j){
      t.addEventListener('click',function(){pick(j);});
      t.addEventListener('keydown',function(e){
        var n={ArrowRight:j+1,ArrowLeft:j-1,Home:0,End:tabs.length-1}[e.key];
        if(n===undefined)return;
        e.preventDefault();pick(n,true);
      });
    });
    root.addEventListener('mouseenter',function(){hover=true;schedule();});
    root.addEventListener('mouseleave',function(){hover=false;schedule();});
    root.addEventListener('focusin',function(e){focus=e.target!==btn;schedule();});
    root.addEventListener('focusout',function(e){if(!root.contains(e.relatedTarget)){focus=false;schedule();}});
    document.addEventListener('visibilitychange',schedule);
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){visible=es[0].isIntersecting;schedule();},{threshold:.4}).observe(root);
    }else{visible=true;}
    var track=root.querySelector('.track'),x0=null,y0=0;
    ['pointerdown','keydown','change'].forEach(function(ev){track.addEventListener(ev,stop);});
    track.addEventListener('touchstart',function(e){
      if(e.touches.length>1||e.target.closest('select,input,button,a')){x0=null;return;}
      x0=e.touches[0].clientX;y0=e.touches[0].clientY;
    },{passive:true});
    track.addEventListener('touchend',function(e){
      if(x0===null)return;
      var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5)pick(cur+(dx<0?1:-1));
    },{passive:true});
    /* fade whichever edge of the tab row hides more tabs */
    function edges(){var m=tabsEl.scrollWidth-tabsEl.clientWidth;tabsEl.classList.toggle('fade-l',tabsEl.scrollLeft>2);tabsEl.classList.toggle('fade-r',tabsEl.scrollLeft<m-2);}
    tabsEl.addEventListener('scroll',edges,{passive:true});addEventListener('resize',function(){edges();ink();});
    if(document.fonts)document.fonts.ready.then(function(){ink();edges();});
    show(0);sync();edges();schedule();
    requestAnimationFrame(function(){requestAnimationFrame(function(){bar2.classList.add('go');});});
  });

  /* signature moment: reveal each product frame once when a fifth of it is on screen */
  if(document.documentElement.classList.contains('rise')){
    var riser=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('risen');riser.unobserve(e.target);}});},{threshold:.2,rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.prod .slides').forEach(function(el){riser.observe(el);});
  }

  /* sticky product bar (products page): shown from the end of the page intro to the end of the last product;
     the product crossing 40% of the viewport is marked current and kept in view on narrow rails */
  var pbar=document.querySelector('.pbar');
  if(pbar)(function(){
  var prail=pbar.querySelector('.prail'),plinks=[].slice.call(prail.querySelectorAll('a'));
  var start=document.querySelector('[data-pbar-start]'),prods=plinks.map(function(a){return document.querySelector(a.getAttribute('href'));});
  var last=prods[prods.length-1],ticking=false,curP=-1;
  function pedges(){var m=prail.scrollWidth-prail.clientWidth;prail.classList.toggle('fade-l',prail.scrollLeft>2);prail.classList.toggle('fade-r',prail.scrollLeft<m-2);}
  function track(){
    ticking=false;
    var line=innerHeight*.4,on=start.getBoundingClientRect().bottom<80&&last.getBoundingClientRect().bottom>line;
    pbar.classList.toggle('on',on);
    var k=-1;prods.forEach(function(s,i){var r=s.getBoundingClientRect();if(r.top<=line&&r.bottom>line)k=i;});
    if(k===curP)return;curP=k;
    plinks.forEach(function(a,i){if(i===k)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
    if(k>-1){var a=plinks[k];if(a.offsetLeft<prail.scrollLeft||a.offsetLeft+a.offsetWidth>prail.scrollLeft+prail.clientWidth)prail.scrollTo({left:a.offsetLeft-24,behavior:reduce?'auto':'smooth'});}
  }
  prail.addEventListener('scroll',pedges,{passive:true});
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(track);}},{passive:true});
  addEventListener('resize',function(){track();pedges();});track();pedges();
  })();

  /* close mobile menu after choosing */
  var mn=document.querySelector('.menu');mn.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mn.open=false;});});

  /* copy email (homepage contact) */
  var copyBtn=document.getElementById('copy');
  if(copyBtn)copyBtn.addEventListener('click',function(){
    var b=this,el=document.getElementById('addr');
    function done(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1600)}
    function fallback(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Press Ctrl+C'}
    try{navigator.clipboard.writeText(el.textContent).then(done,fallback)}catch(e){fallback()}
  });
})();
