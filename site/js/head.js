/* Runs in <head>, before first paint, so it stays out of site.js (which loads at the end of <body>). It is a file
   rather than an inline script so the CSP can forbid inline scripts. */
(function (root) {
  var home = root.hasAttribute('data-home');
  var hash = location.hash;

  /* old homepage links: the products moved to products.html (where these hashes are real anchors), and the
     dashboards to dashboards.html */
  if (home && /^#(strongpantry|celestial-destiny|signal|colortunelyrics|run-offline)$/.test(hash)) location.replace('products.html' + hash);
  if (home && /^#(dashboards|dash-title)$/.test(hash)) location.replace('dashboards.html');

  /* the reveal starting state only exists when the reveal can run */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('rise');
})(document.documentElement);
