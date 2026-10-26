(function(){
  var btn = document.getElementById('themeBtn');
  if (!btn) return;
  var root = document.documentElement;
  try { var s = localStorage.getItem('iivent-theme'); if (s) root.setAttribute('data-theme', s); } catch(e){}
  btn.addEventListener('click', function(){
    var isDark = root.getAttribute('data-theme') === 'dark' ||
      (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('iivent-theme', next); } catch(e){}
  });
})();