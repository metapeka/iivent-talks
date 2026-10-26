(function(){
  var btn = document.getElementById('themeBtn');
  var root = document.documentElement;
  // Light is default — dark only if explicitly chosen
  try {
    var s = localStorage.getItem('iivent-theme');
    if (s === 'dark' || s === 'light') root.setAttribute('data-theme', s);
    else root.setAttribute('data-theme', 'light');
  } catch(e){ root.setAttribute('data-theme','light'); }
  function updateBtn(){
    if (!btn) return;
    var isDark = root.getAttribute('data-theme') === 'dark';
    btn.textContent = isDark ? '☀' : '◐';
    btn.setAttribute('aria-label', isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
    btn.setAttribute('title', isDark ? 'Светлая тема' : 'Тёмная тема');
  }
  updateBtn();
  if (btn) btn.addEventListener('click', function(){
    var isDark = root.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('iivent-theme', next); } catch(e){}
    updateBtn();
  });

  // Toast helper
  function showToast(msg){
    var t = document.querySelector('.toast');
    if (!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._to);
    t._to = setTimeout(function(){ t.classList.remove('show'); }, 2200);
  }

  // Reading progress bar for talk pages
  var tp = document.querySelector('.tp');
  if (tp) {
    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    if (tp.classList.contains('hall-a')) bar.classList.add('a');
    else if (tp.classList.contains('hall-b')) bar.classList.add('b');
    else bar.classList.add('s');
    document.body.appendChild(bar);
    var ticking = false;
    function upd(){
      var sc = window.scrollY;
      var dh = document.documentElement.scrollHeight - window.innerHeight;
      var p = dh > 0 ? (sc / dh * 100) : 0;
      bar.style.width = p + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function(){
      if (!ticking){ requestAnimationFrame(upd); ticking = true; }
    }, {passive:true});
    upd();
  }

  // Expand bar + detail persistence on talk pages
  var tpBody = document.querySelector('.tp-body');
  if (tpBody) {
    var details = tpBody.querySelectorAll('details.extra');
    // persistence
    details.forEach(function(d,i){
      var key = location.pathname + '__detail_' + i;
      try {
        var saved = localStorage.getItem(key);
        if (saved === 'open') d.open = true;
        else if (saved === 'closed') d.open = false;
      } catch(e){}
      d.addEventListener('toggle', function(){
        try { localStorage.setItem(key, d.open ? 'open' : 'closed'); } catch(e){}
      });
    });

    if (details.length) {
      var bar2 = document.createElement('div');
      bar2.className = 'expand-bar';
      bar2.innerHTML = '<button type="button" data-act="open">Развернуть всё</button><button type="button" data-act="close">Свернуть</button>';
      var hook = tpBody.querySelector('.hook');
      if (hook && hook.nextSibling) hook.parentNode.insertBefore(bar2, hook.nextSibling);
      else tpBody.insertBefore(bar2, tpBody.firstChild);
      bar2.addEventListener('click', function(e){
        var act = e.target.getAttribute('data-act');
        if (!act) return;
        var open = act === 'open';
        details.forEach(function(d){
          d.open = open;
          var idx = Array.prototype.indexOf.call(details, d);
          try { localStorage.setItem(location.pathname + '__detail_' + idx, open ? 'open' : 'closed'); } catch(e){}
        });
        showToast(open ? 'Развернули все блоки' : 'Свернули все блоки');
      });
      if (location.hash) {
        var target = document.querySelector(location.hash);
        if (target) {
          var dd = target.closest('details');
          if (dd) dd.open = true;
          details.forEach(function(d){ if (d.contains(target)) d.open = true; });
        }
      }
    }

    // Anchors for each .part
    var parts = tpBody.querySelectorAll('.part');
    parts.forEach(function(part, i){
      var h2 = part.querySelector('h2');
      if (!h2) return;
      if (h2.querySelector('.anchor-btn')) return;
      var raw = h2.textContent.trim().toLowerCase();
      var base = raw.replace(/[^a-z0-9а-яё]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,36);
      if (!base) base = 'part';
      var id = 'p' + (i+1) + '-' + base;
      // ensure unique
      if (document.getElementById(id) && document.getElementById(id) !== part) id += '-' + Math.random().toString(36).slice(2,4);
      part.id = id;
      var anchor = document.createElement('button');
      anchor.className = 'anchor-btn';
      anchor.type = 'button';
      anchor.setAttribute('aria-label','Скопировать ссылку на раздел');
      anchor.innerHTML = '⧉ копировать';
      anchor.addEventListener('click', function(){
        var url = location.origin + location.pathname + '#' + id;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function(){
            anchor.classList.add('copied');
            anchor.textContent = '✓ скопировано';
            showToast('Ссылка скопирована');
            setTimeout(function(){ anchor.classList.remove('copied'); anchor.innerHTML='⧉ копировать'; }, 1800);
            try{ history.replaceState(null,'', '#'+id); } catch(e){}
          }, function(){
            location.hash = id;
            showToast('Ссылка в адресной строке');
          });
        } else {
          location.hash = id;
          showToast('Ссылка в адресной строке');
        }
      });
      h2.appendChild(anchor);
    });
  }

  // View Switcher (Dashboard vs Timeline)
  var viewSwitch = document.querySelector('.view-switch');
  var viewDash = document.getElementById('view-dashboard');
  var viewTl = document.getElementById('view-timeline');
  if (viewSwitch && viewDash && viewTl) {
    var activeView = 'dashboard';
    try {
      var sv = localStorage.getItem('iivent-view');
      if (sv === 'timeline' || sv === 'dashboard') activeView = sv;
    } catch(e){}
    // check ?view= param
    try {
      var vp = new URLSearchParams(location.search).get('view');
      if (vp === 'timeline' || vp === 'dashboard') activeView = vp;
    } catch(e){}

    function setView(v){
      activeView = v;
      try { localStorage.setItem('iivent-view', v); } catch(e){}
      var isTl = v === 'timeline';
      viewDash.hidden = isTl;
      viewTl.hidden = !isTl;
      viewDash.classList.toggle('is-active', !isTl);
      viewTl.classList.toggle('is-active', isTl);
      viewSwitch.querySelectorAll('button').forEach(function(b){
        var match = b.getAttribute('data-view') === v;
        b.classList.toggle('is-active', match);
        b.setAttribute('aria-selected', match ? 'true' : 'false');
      });
      // re-apply filters so hidden counts / states match the view
      if (window._applyFilters) window._applyFilters();
    }
    viewSwitch.addEventListener('click', function(e){
      var btn = e.target.closest('button[data-view]');
      if (!btn) return;
      var v = btn.getAttribute('data-view');
      if (v) setView(v);
    });
    setView(activeView);
  }

  // Index: filter + search
  var filterBar = document.querySelector('.filter-bar');
  var searchInput = document.getElementById('searchInput');
  if (filterBar || searchInput) {
    var talks = Array.prototype.slice.call(document.querySelectorAll('.talk:not(.ghost)'));
    var halls = Array.prototype.slice.call(document.querySelectorAll('.hall'));
    var tlGroups = Array.prototype.slice.call(document.querySelectorAll('.tl-group'));
    var resultsInfo = document.getElementById('resultsInfo');
    var clearBtn = document.getElementById('clearSearch');
    var activeFilter = 'all';
    try { var sf = localStorage.getItem('iivent-filter'); if (sf) activeFilter = sf; } catch(e){}
    var searchQuery = '';
    // handle ?q= param
    try {
      var params = new URLSearchParams(location.search);
      if (params.get('q') && searchInput) {
        searchInput.value = params.get('q');
        searchQuery = params.get('q').trim().toLowerCase();
      }
    } catch(e){}

    function matchesFilter(talk){
      if (activeFilter === 'all') return true;
      if (activeFilter === 'a') return talk.classList.contains('a') || talk.classList.contains('hall-s');
      if (activeFilter === 'b') return talk.classList.contains('b') || talk.classList.contains('hall-s');
      if (activeFilter === 'mine') return !!talk.querySelector('.badge.mine');
      return true;
    }
    function matchesSearch(talk){
      if (!searchQuery) return true;
      var h3 = talk.querySelector('h3');
      var thesis = talk.querySelector('.thesis');
      var hay = ((h3 ? h3.textContent : '') + ' ' + (thesis ? thesis.textContent : '')).toLowerCase();
      return hay.indexOf(searchQuery) !== -1;
    }
    function apply(){
      var visible = 0;
      // talks
      talks.forEach(function(t){
        var ok = matchesFilter(t) && matchesSearch(t);
        t.classList.toggle('is-hidden', !ok);
        // count visible only in currently active view to avoid double-counting 24 * 2
        var inActiveView = t.closest('.view') && !t.closest('.view').hidden;
        if (ok && inActiveView) visible++;
      });
      // hide dashboard halls
      halls.forEach(function(h){
        var hasVis = Array.prototype.slice.call(h.querySelectorAll('.talk')).some(function(t){ return !t.classList.contains('is-hidden'); });
        h.classList.toggle('is-hidden', !hasVis);
      });
      // hide timeline groups
      tlGroups.forEach(function(g){
        var hasVis = Array.prototype.slice.call(g.querySelectorAll('.talk:not(.ghost)')).some(function(t){ return !t.classList.contains('is-hidden'); });
        g.classList.toggle('is-hidden', !hasVis);
      });
      // buttons
      if (filterBar) filterBar.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.toggle('is-active', b.getAttribute('data-filter') === activeFilter); });
      // info
      if (resultsInfo) {
        if (searchQuery || activeFilter !== 'all') {
          var fLabel = activeFilter === 'all' ? '' : ' · фильтр: ' + (activeFilter==='a' ? 'Зал 1' : activeFilter==='b' ? 'Зал 2' : 'Мои');
          resultsInfo.textContent = 'Показано ' + visible + ' из 24' + (searchQuery ? ' по запросу “' + searchQuery + '”' : '') + fLabel;
        } else resultsInfo.textContent = '';
      }
      if (searchInput) searchInput.parentElement.classList.toggle('has-value', !!searchQuery);
    }
    window._applyFilters = apply;

    if (filterBar) {
      filterBar.addEventListener('click', function(e){
        var btn = e.target.closest('.filter-btn');
        if (!btn) return;
        activeFilter = btn.getAttribute('data-filter');
        try { localStorage.setItem('iivent-filter', activeFilter); } catch(e){}
        apply();
      });
      // init active
      filterBar.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.toggle('is-active', b.getAttribute('data-filter') === activeFilter); });
    }
    if (searchInput) {
      searchInput.addEventListener('input', function(){
        searchQuery = searchInput.value.trim().toLowerCase();
        apply();
      });
      searchInput.addEventListener('keydown', function(e){
        if (e.key === 'Escape') {
          searchInput.value = '';
          searchQuery = '';
          apply();
        }
      });
      if (clearBtn) clearBtn.addEventListener('click', function(){
        searchInput.value = '';
        searchQuery = '';
        apply();
        searchInput.focus();
      });
    }
    apply();
  }
})();