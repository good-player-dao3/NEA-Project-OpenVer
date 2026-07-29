// ==UserScript==
// @name         Box-GO hide iframe capture UI
// @namespace    https://github.com/CodeManTeam/box-go
// @version      0.1.0
// @description  Keep the capture panel visible only on the top-level game page
// @match        https://dao3.fun/play/*
// @match        https://view.dao3.fun/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  if (window.top === window.self) return;

  const hide = () => {
    for (const element of document.querySelectorAll('body *')) {
      if (element.textContent && /^Box-GO\s+sockets:/.test(element.textContent.trim())) {
        const panel = element.parentElement;
        if (panel) panel.style.display = 'none';
      }
    }
  };
  new MutationObserver(hide).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState !== 'loading') hide();
  else document.addEventListener('DOMContentLoaded', hide, { once: true });
})();
