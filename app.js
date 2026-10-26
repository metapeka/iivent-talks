(function(){
  var btn = document.getElementById('themeBtn');
  var root = document.documentElement;
  try { var s = localStorage.getItem('iivent-theme'); if (s) root.setAttribute('data-theme', s); } catch(e){}
  if (btn) btn.addEventListener('click', function(){
    var isDark = root.getAttribute('data-theme') === 'dark' ||
      (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('iivent-theme', next); } catch(e){}
  });

  // Expand bar on talk pages
  var tpBody = document.querySelector('.tp-body');
  if (tpBody) {
    var details = tpBody.querySelectorAll('details.extra');
    if (details.length) {
      var bar = document.createElement('div');
      bar.className = 'expand-bar';
      bar.innerHTML = '<button type="button" data-act="open">Развернуть всё</button><button type="button" data-act="close">Свернуть</button>';
      // insert before first part or after hook
      var hook = tpBody.querySelector('.hook');
      if (hook && hook.nextSibling) hook.parentNode.insertBefore(bar, hook.nextSibling);
      else tpBody.insertBefore(bar, tpBody.firstChild);

      bar.addEventListener('click', function(e){
        var act = e.target.getAttribute('data-act');
        if (!act) return;
        details.forEach(function(d){ d.open = (act === 'open'); });
      });

      // open details if hash points inside
      if (location.hash) {
        var target = document.querySelector(location.hash);
        if (target) {
          var d = target.closest('details');
          if (d) d.open = true;
          // open details that contain target
          details.forEach(function(dd){ if (dd.contains(target)) dd.open = true; });
        }
      }
    }
  }
})();