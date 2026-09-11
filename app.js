/* Dariia Pabolkova — site behaviour: email, header, mobile nav, scroll-spy, lightbox. */
(function () {
  'use strict';

  // Email is assembled at runtime and never appears as plain text in the HTML.
  var addr = ['1243', '1468'].join('') + '@' + ['mail', 'sustech', 'edu', 'cn'].join('.');
  document.querySelectorAll('.js-email').forEach(function (a) {
    a.href = 'mailto:' + addr;
    a.textContent = addr;
  });

  // Hairline under the sticky header once the page scrolls.
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu.
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('site-nav');
  function setMenu(open) { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  // Scroll-spy.
  var links = {};
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); links[k].removeAttribute('aria-current'); });
        var l = links[en.target.id];
        if (l) { l.classList.add('active'); l.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  // Lightbox: groups are the closest [data-gallery]; Esc / background click close; arrows browse.
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('.lb-cap');
  var btnClose = lb.querySelector('.lb-close'), btnPrev = lb.querySelector('.lb-prev'), btnNext = lb.querySelector('.lb-next');
  var group = [], idx = 0, opener = null;

  function captionOf(img) {
    var f = img.closest('figure');
    var c = f && f.querySelector('figcaption');
    return c ? c.textContent : '';
  }
  function show(i) {
    idx = (i + group.length) % group.length;
    var img = group[idx];
    lbImg.src = img.dataset.full || img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = captionOf(img);
    btnPrev.hidden = btnNext.hidden = group.length < 2;
  }
  function open(img) {
    var g = img.closest('[data-gallery]');
    group = g ? Array.prototype.slice.call(g.querySelectorAll('img.zoom')) : [img];
    opener = img;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(group.indexOf(img));
    btnClose.focus();
  }
  function close() {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }

  document.querySelectorAll('img.zoom').forEach(function (img) {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.addEventListener('click', function () { open(img); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
    });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-fig')) close(); });
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', function () { show(idx - 1); });
  btnNext.addEventListener('click', function () { show(idx + 1); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'Tab') {            // keep focus inside the dialog
      var f = [btnClose, btnPrev, btnNext].filter(function (b) { return !b.hidden; });
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
})();
