/* The Strong Automation: one script for every page, loaded at the end of <body>. Each feature runs only where its
   markup exists. No globals: everything lives inside this function. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rise = document.documentElement.classList.contains('rise');

  /* keep a sideways-scrolling tab row's chosen tab in view without scrolling the page vertically */
  function keepInView(rail, item, offset) {
    if (item.offsetLeft < rail.scrollLeft || item.offsetLeft + item.offsetWidth > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left: item.offsetLeft - offset, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  /* fade whichever edge of a sideways-scrolling tab row hides more tabs */
  function fadeEdges(rail) {
    var max = rail.scrollWidth - rail.clientWidth;
    rail.classList.toggle('fade-l', rail.scrollLeft > 2);
    rail.classList.toggle('fade-r', rail.scrollLeft < max - 2);
  }

  /* run fn at most once per frame */
  function perFrame(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        fn();
      });
    };
  }

  /* Celestial Destiny birth card (products page): solar value = 55 - (2 x month + day); 0 is the Jester */
  function initBirthCard(form) {
    var months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    var daysIn = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    var rankNames = [
      'Ace',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Jack',
      'Queen',
      'King',
    ];
    /* River = Hearts, Feather = Clubs, Sky = Diamonds, Mountain = Spades */
    var suits = [
      ['river', 'Rivers', 'The Suit of Emotion, Connection & Relationship'],
      ['feather', 'Feathers', 'The Suit of Knowledge, News & Communication'],
      ['sky', 'Sky', 'The Suit of Value, Worth & Resources'],
      ['mountain', 'Mountains', 'The Suit of Labor, Effort & Responsibility'],
    ];
    var month = document.getElementById('bcMonth');
    var day = document.getElementById('bcDay');
    var card = document.getElementById('bigcard');
    var rank = document.getElementById('cRank');

    function fillDays() {
      var keep = +day.value || 1;
      var count = daysIn[month.value - 1];
      day.textContent = '';
      for (var d = 1; d <= count; d++) day.add(new Option(d, d));
      day.value = Math.min(keep, count);
    }

    function jesterLabel() {
      var label = document.createElement('span');
      var small = document.createElement('small');
      label.className = 'jt';
      small.textContent = 'THE';
      label.append(small, 'JESTER');
      return label;
    }

    function reveal(animate) {
      var m = +month.value;
      var d = +day.value;
      var value = 55 - (2 * m + d);
      card.className = 'bigcard';
      card.querySelectorAll('.jt').forEach(function (el) {
        el.remove();
      });
      if (value === 0) {
        document.getElementById('bcName').textContent = 'The Jester';
        document.getElementById('bcSuit').textContent = 'The card outside the suits';
        card.classList.add('jester');
        rank.hidden = true;
        card.appendChild(jesterLabel());
      } else {
        var suit = suits[Math.floor((value - 1) / 13)];
        var r = (value - 1) % 13;
        document.getElementById('bcName').textContent = rankNames[r] + ' of ' + suit[1];
        document.getElementById('bcSuit').textContent = suit[2];
        card.classList.add('s-' + suit[0]);
        rank.hidden = false;
        rank.textContent = ranks[r];
      }
      document.getElementById('bcNote').textContent = 'Birthday: ' + months[m - 1] + ' ' + d;
      if (animate && !reduce) {
        void card.offsetWidth; /* restart the flip animation */
        card.classList.add('flipping');
      }
    }

    months.forEach(function (name, i) {
      month.add(new Option(name, i + 1));
    });
    month.addEventListener('change', function () {
      fillDays();
      reveal(true);
    });
    day.addEventListener('change', function () {
      reveal(true);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      reveal(true);
    });
    month.value = 3;
    fillDays();
    day.value = 20;
    reveal(false);
  }

  /* screenshot slideshows: auto-advance every 5s while at least 40% on screen; pause on hover or focus. Any tab
     pick, swipe, tap or form change inside a slide stops auto-play for good, so the Celestial Destiny form is never
     pulled away mid-use. No auto-play with reduced motion. */
  function initSlideshow(root) {
    var slides = [].slice.call(root.querySelectorAll('.slide'));
    var tabs = [].slice.call(root.querySelectorAll('.tabs [role=tab]'));
    var tabRow = root.querySelector('.tabs');
    var track = root.querySelector('.track');
    var current = 0;
    var timer = 0;
    var hover = false;
    var focus = false;
    var visible = false;
    var stopped = reduce;

    var bar = document.createElement('div');
    var toggle = document.createElement('button');
    var underline = document.createElement('span');
    bar.className = 'tabbar';
    toggle.type = 'button';
    toggle.className = 'sp-toggle';
    toggle.innerHTML =
      '<svg class="i-pause" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z"/></svg>' +
      '<svg class="i-play" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.3l7.5 4.7L3 10.7z"/></svg>';
    underline.className = 'ink';
    underline.setAttribute('aria-hidden', 'true');
    tabRow.parentNode.insertBefore(bar, tabRow);
    bar.appendChild(tabRow);
    bar.appendChild(toggle);
    tabRow.appendChild(underline);

    function placeUnderline() {
      var tab = tabs[current];
      underline.style.transform = 'translateX(' + tab.offsetLeft + 'px) scaleX(' + tab.offsetWidth / 100 + ')';
    }

    function show(n, moveFocus) {
      n = (n + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var on = i === n;
        slide.classList.toggle('on', on);
        slide.inert = !on;
        slide.setAttribute('aria-hidden', !on);
      });
      tabs.forEach(function (tab, i) {
        var on = i === n;
        tab.setAttribute('aria-selected', on);
        tab.tabIndex = on ? 0 : -1;
      });
      current = n;
      if (moveFocus) tabs[n].focus();
      placeUnderline();
      keepInView(tabRow, tabs[n], 8);
    }

    function syncToggle() {
      toggle.classList.toggle('paused', stopped);
      toggle.setAttribute('aria-label', (stopped ? 'Play' : 'Pause') + ' slideshow');
    }

    function schedule() {
      clearTimeout(timer);
      if (!stopped && !hover && !focus && visible && !document.hidden) {
        timer = setTimeout(function () {
          show(current + 1);
          schedule();
        }, 5000);
      }
    }

    function stop() {
      stopped = true;
      clearTimeout(timer);
      syncToggle();
    }

    function pick(n, moveFocus) {
      stop();
      show(n, moveFocus);
    }

    /* an explicit Play overrides the hover and focus pause until the pointer or focus leaves */
    toggle.addEventListener('click', function () {
      if (!stopped) return stop();
      stopped = false;
      hover = false;
      focus = false;
      show(current + 1);
      syncToggle();
      schedule();
    });

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        pick(i);
      });
      tab.addEventListener('keydown', function (e) {
        var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault();
        pick(n, true);
      });
    });

    root.addEventListener('mouseenter', function () {
      hover = true;
      schedule();
    });
    root.addEventListener('mouseleave', function () {
      hover = false;
      schedule();
    });
    root.addEventListener('focusin', function (e) {
      focus = e.target !== toggle;
      schedule();
    });
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) {
        focus = false;
        schedule();
      }
    });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        function (entries) {
          visible = entries[0].isIntersecting;
          schedule();
        },
        { threshold: 0.4 },
      ).observe(root);
    } else {
      visible = true;
    }

    /* swipe sideways to change slides; touches on form controls and links are left alone */
    var startX = null;
    var startY = 0;
    ['pointerdown', 'keydown', 'change'].forEach(function (type) {
      track.addEventListener(type, stop);
    });
    track.addEventListener(
      'touchstart',
      function (e) {
        if (e.touches.length > 1 || e.target.closest('select,input,button,a')) {
          startX = null;
          return;
        }
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true },
    );
    track.addEventListener(
      'touchend',
      function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        startX = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) pick(current + (dx < 0 ? 1 : -1));
      },
      { passive: true },
    );

    tabRow.addEventListener(
      'scroll',
      function () {
        fadeEdges(tabRow);
      },
      { passive: true },
    );
    addEventListener('resize', function () {
      fadeEdges(tabRow);
      placeUnderline();
    });
    if (document.fonts)
      document.fonts.ready.then(function () {
        placeUnderline();
        fadeEdges(tabRow);
      });
    show(0);
    syncToggle();
    fadeEdges(tabRow);
    schedule();
    /* the underline is placed instantly first and animated only from the next change on */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        underline.classList.add('ready');
      });
    });
  }

  /* products page: each product's frame rises into place once, when a fifth of it is on screen */
  function initFrameReveal(frames) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('risen');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );
    frames.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* homepage: each part fades up once its top enters the screen, and anything already scrolled past shows at once.
     Checked on scroll and resize rather than with an observer, so nothing can ever stay hidden. */
  function initScrollReveal(parts) {
    var waiting = [].slice.call(parts);
    var check = perFrame(function () {
      var line = innerHeight * 0.94;
      waiting = waiting.filter(function (el) {
        if (el.getBoundingClientRect().top >= line) return true;
        el.classList.add('on');
        return false;
      });
      if (!waiting.length) {
        removeEventListener('scroll', check);
        removeEventListener('resize', check);
      }
    });
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    check();
  }

  /* back to top: shown after the first screen; focus then moves to the brand link so keyboard users carry on from
     the top of the page */
  function initBackToTop(button) {
    function sync() {
      button.classList.toggle('on', scrollY > innerHeight);
    }
    addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
    button.addEventListener('click', function () {
      scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var brand = document.querySelector('header .brand');
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* the mobile menu is a <details>; close it once a link is chosen */
  function initMenu(menu) {
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.open = false;
      });
    });
  }

  /* homepage contact: copy the address; if the clipboard is blocked, select it so it can be copied by hand */
  function initCopyEmail(button, address) {
    function done() {
      button.textContent = 'Copied';
      setTimeout(function () {
        button.textContent = 'Copy';
      }, 1600);
    }
    function selectInstead() {
      var range = document.createRange();
      var selection = getSelection();
      range.selectNodeContents(address);
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = 'Press Ctrl+C';
    }
    button.addEventListener('click', function () {
      try {
        navigator.clipboard.writeText(address.textContent).then(done, selectInstead);
      } catch (e) {
        selectInstead();
      }
    });
  }

  var birthForm = document.getElementById('bcForm');
  var toTop = document.querySelector('.totop');
  var menu = document.querySelector('.menu');
  var copy = document.getElementById('copy');
  var revealParts = document.querySelectorAll('.rv');

  if (birthForm) initBirthCard(birthForm);
  document.querySelectorAll('[data-slides]').forEach(initSlideshow);
  if (rise) initFrameReveal(document.querySelectorAll('.prod .slides'));
  if (rise && revealParts.length) initScrollReveal(revealParts);
  if (toTop) initBackToTop(toTop);
  if (menu) initMenu(menu);
  if (copy) initCopyEmail(copy, document.getElementById('addr'));
})();
