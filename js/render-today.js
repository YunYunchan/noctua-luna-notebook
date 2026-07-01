/* Noctua Luna Journal — 「今日」タブ */
(function () {
  "use strict";
  window.NL = window.NL || {};
  NL.render = NL.render || {};

  var saveTimer = null;

  var GREETINGS = [
    "今日もよく頑張りましたね。",
    "ここは、あなただけの休息の場所。",
    "小さな幸せを、そっと書き留めてみましょう。",
    "今日という一日を、ゆっくり振り返る時間です。",
    "フクロウが静かに見守っています。"
  ];

  function pickGreeting(dateStr) {
    var sum = 0;
    for (var i = 0; i < dateStr.length; i++) sum += dateStr.charCodeAt(i);
    return GREETINGS[sum % GREETINGS.length];
  }

  function today() {
    var today = new Date();
    var dateStr = NL.cycleUtil.dateToStr(today);
    var data = NL.state.data;
    var entry = data.entries[dateStr] || { date: dateStr, event: "", myHappy: [], yourHappy: [] };

    var html =
      '<section class="page page-today">' +
        '<div class="today-hero">' +
          '<p class="today-date">' + NL.cycleUtil.formatJPDate(today, true) + "</p>" +
          '<div class="today-moon">' +
            '<span class="moon-emoji" aria-hidden="true">' + NL.moon.getPhaseEmoji(today) + "</span>" +
            '<span class="moon-name">' + NL.moon.getPhaseName(today) + "</span>" +
          "</div>" +
          '<p class="today-greeting">' + pickGreeting(dateStr) + "</p>" +
        "</div>" +

        '<div class="card">' +
          '<label class="field-label" for="f-event">今日の出来事</label>' +
          '<textarea id="f-event" class="input textarea" rows="4" placeholder="今日あったことを、自由に書いてみましょう…">' +
            escapeHTML(entry.event) +
          "</textarea>" +
        "</div>" +

        '<div class="card">' +
          '<label class="field-label">My Happy <span class="field-hint">— 今日、自分が感じた幸せ(最大3つ)</span></label>' +
          '<div class="happy-group" id="f-myhappy-group">' +
            NL.happyFields.groupHTML(entry.myHappy, "例:朝のコーヒーがおいしかった") +
          "</div>" +
        "</div>" +

        '<div class="card">' +
          '<label class="field-label">Your Happy <span class="field-hint">— 今日、誰かのためにできた幸せ(最大3つ)</span></label>' +
          '<div class="happy-group" id="f-yourhappy-group">' +
            NL.happyFields.groupHTML(entry.yourHappy, "例:友人に「ありがとう」と伝えた") +
          "</div>" +
        "</div>" +

        '<p class="save-indicator" id="save-indicator" aria-live="polite">&nbsp;</p>' +
      "</section>";

    NL.dom.content().innerHTML = html;

    var eventEl = document.getElementById("f-event");
    var myHappyGroupEl = document.getElementById("f-myhappy-group");
    var yourHappyGroupEl = document.getElementById("f-yourhappy-group");
    var indicator = document.getElementById("save-indicator");

    function persist() {
      var cur = NL.state.data.entries[dateStr] || { date: dateStr };
      cur.event = eventEl.value;
      cur.myHappy = NL.happyFields.collect(myHappyGroupEl);
      cur.yourHappy = NL.happyFields.collect(yourHappyGroupEl);
      cur.updatedAt = new Date().toISOString();
      NL.state.data.entries[dateStr] = cur;
      NL.storage.save(NL.state.data);
      indicator.textContent = "保存しました ✓";
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { indicator.textContent = ""; }, 1800);
    }

    var debouncedPersist = debounce(persist, 400);
    eventEl.addEventListener("input", debouncedPersist);
    NL.happyFields.init(myHappyGroupEl, "例:朝のコーヒーがおいしかった", debouncedPersist);
    NL.happyFields.init(yourHappyGroupEl, "例:友人に「ありがとう」と伝えた", debouncedPersist);
  }

  var debounceTimers = {};
  function debounce(fn, wait) {
    var id = fn;
    return function () {
      clearTimeout(debounceTimers[id]);
      var args = arguments;
      var self = this;
      debounceTimers[id] = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  function escapeHTML(s) {
    return String(s || "").replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }
  function escapeAttr(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  NL.render.today = today;
  NL.util = NL.util || {};
  NL.util.escapeHTML = escapeHTML;
  NL.util.escapeAttr = escapeAttr;
})();
