/* Noctua Luna Journal — 汎用モーダル */
(function () {
  "use strict";
  window.NL = window.NL || {};

  var root = null;

  function ensureRoot() {
    if (!root) root = document.getElementById("modal-root");
    return root;
  }

  function open(innerHTML, onMount) {
    var r = ensureRoot();
    r.innerHTML =
      '<div class="modal-overlay" data-close="overlay">' +
        '<div class="modal-card" role="dialog" aria-modal="true">' +
          '<button type="button" class="modal-close" data-close="btn" aria-label="閉じる">×</button>' +
          '<div class="modal-body">' + innerHTML + "</div>" +
        "</div>" +
      "</div>";
    r.querySelector(".modal-overlay").addEventListener("click", function (e) {
      if (e.target && e.target.getAttribute("data-close")) close();
    });
    r.querySelector(".modal-close").addEventListener("click", close);
    if (typeof onMount === "function") onMount(r.querySelector(".modal-card"));
  }

  function close() {
    var r = ensureRoot();
    r.innerHTML = "";
  }

  NL.modal = { open: open, close: close };
})();
