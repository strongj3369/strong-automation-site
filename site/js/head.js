/* Runs in <head>, before first paint, so it stays out of site.js (which loads at the end of <body>). Kept external so the CSP can forbid inline scripts. */
(function(root){
  /* old one-page product links now live on products.html (homepage only: those hashes are real anchors on products.html) */
  if(root.hasAttribute('data-home')&&/^#(strongpantry|celestial-destiny|signal|colortunelyrics|run-offline)$/.test(location.hash))location.replace('products.html'+location.hash);
  /* the rise starting state only exists when the reveal can run */
  if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches)root.classList.add('rise');
})(document.documentElement);
