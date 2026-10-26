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

  // Expand bar on talk pages
  var tpBody = document.querySelector('.tp-body');
  if (tpBody) {
    var details = tpBody.querySelectorAll('details.extra');
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
        details.forEach(function(d){ d.open = (act === 'open'); });
      });
      if (location.hash) {
        var target = document.querySelector(location.hash);
        if (target) {
          var d = target.closest('details');
          if (d) d.open = true;
          details.forEach(function(dd){ if (dd.contains(target)) dd.open = true; });
        }
      }
    }
  }
})();