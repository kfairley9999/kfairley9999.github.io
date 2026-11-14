(function () {
  var root = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  function current() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function label() { if (btn) btn.setAttribute('aria-label', 'Switch to ' + (current() === 'dark' ? 'light' : 'dark') + ' theme'); }
  if (btn) btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });
  label();
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
