/* Noctua Luna Journal — アプリ全体の制御 */
(function () {
  "use strict";
  window.NL = window.NL || {};

  var contentEl = null;
  NL.dom = {
    content: function () {
      if (!contentEl) contentEl = document.getElementById("app-content");
      return contentEl;
    }
  };

  var now = new Date();
  NL.state = {
    data: NL.storage.load(),
    activeTab: "today",
    calendar: { year: now.getFullYear(), month: now.getMonth() }
  };

  var RENDERERS = {
    today: function () { NL.render.today(); },
    calendar: function () { NL.render.calendar(); },
    yoshuku: function () { NL.render.yoshuku(); },
    settings: function () { NL.render.settings(); }
  };

  function renderActive() {
    var fn = RENDERERS[NL.state.activeTab];
    if (fn) fn();
  }

  function setActiveTab(tab) {
    NL.state.activeTab = tab;
    Array.prototype.forEach.call(document.querySelectorAll(".tab-btn"), function (btn) {
      var isActive = btn.getAttribute("data-tab") === tab;
      btn.classList.toggle("tab-btn-active", isActive);
      btn.setAttribute("aria-current", isActive ? "page" : "false");
    });
    NL.modal.close();
    renderActive();
    NL.dom.content().scrollTop = 0;
  }

  function initTabBar() {
    Array.prototype.forEach.call(document.querySelectorAll(".tab-btn"), function (btn) {
      btn.addEventListener("click", function () {
        setActiveTab(btn.getAttribute("data-tab"));
      });
    });
  }

  function renderHeaderMoon() {
    var el = document.getElementById("header-moon");
    if (el) el.textContent = NL.moon.getPhaseEmoji(new Date());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTabBar();
    renderHeaderMoon();
    setActiveTab("today");
  });
})();
