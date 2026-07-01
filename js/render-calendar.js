/* Noctua Luna Journal — 「カレンダー」タブ */
(function () {
  "use strict";
  window.NL = window.NL || {};
  NL.render = NL.render || {};

  function calendar() {
    var cal = NL.state.calendar; // { year, month(0-11) }
    var year = cal.year, month = cal.month;
    var first = new Date(year, month, 1);
    var last = new Date(year, month + 1, 0);
    var startWeekday = first.getDay();
    var daysInMonth = last.getDate();
    var todayStr = NL.cycleUtil.dateToStr(new Date());

    var cells = [];
    for (var i = 0; i < startWeekday; i++) cells.push(null);
    for (var d = 1; d <= daysInMonth; d++) cells.push(d);

    var weekdayRow = NL.cycleUtil.WEEKDAY_JP.map(function (w) {
      return '<div class="cal-weekday">' + w + "</div>";
    }).join("");

    var dayCells = cells.map(function (d) {
      if (d === null) return '<div class="cal-cell cal-cell-empty"></div>';
      var date = new Date(year, month, d);
      var dateStr = NL.cycleUtil.dateToStr(date);
      var e = NL.state.data.entries[dateStr];
      var hasEntry = !!(e && (e.event || (e.myHappy && e.myHappy.length) || (e.yourHappy && e.yourHappy.length)));
      var schedule = e && e.schedule ? e.schedule : "";
      var isToday = dateStr === todayStr;
      return (
        '<button type="button" class="cal-cell' + (isToday ? " cal-cell-today" : "") + '" data-date="' + dateStr + '">' +
          '<span class="cal-day">' + d + "</span>" +
          '<span class="cal-moon" aria-hidden="true">' + NL.moon.getPhaseEmoji(date) + "</span>" +
          (schedule ? '<span class="cal-schedule">' + NL.util.escapeHTML(schedule) + "</span>" : "") +
          (hasEntry ? '<span class="cal-dot" aria-hidden="true"></span>' : "") +
        "</button>"
      );
    }).join("");

    var html =
      '<section class="page page-calendar">' +
        '<div class="cal-nav">' +
          '<button type="button" class="icon-btn" id="cal-prev" aria-label="前の月">‹</button>' +
          '<p class="cal-title">' + year + "年" + (month + 1) + "月</p>" +
          '<button type="button" class="icon-btn" id="cal-next" aria-label="次の月">›</button>' +
        "</div>" +
        '<div class="cal-grid cal-grid-head">' + weekdayRow + "</div>" +
        '<div class="cal-grid">' + dayCells + "</div>" +
        '<p class="cal-legend"><span class="cal-dot" aria-hidden="true"></span> 記録がある日</p>' +
      "</section>";

    NL.dom.content().innerHTML = html;

    document.getElementById("cal-prev").addEventListener("click", function () {
      cal.month -= 1;
      if (cal.month < 0) { cal.month = 11; cal.year -= 1; }
      calendar();
    });
    document.getElementById("cal-next").addEventListener("click", function () {
      cal.month += 1;
      if (cal.month > 11) { cal.month = 0; cal.year += 1; }
      calendar();
    });

    Array.prototype.forEach.call(document.querySelectorAll(".cal-cell[data-date]"), function (btn) {
      btn.addEventListener("click", function () {
        openDayModal(btn.getAttribute("data-date"));
      });
    });
  }

  function openDayModal(dateStr) {
    var date = NL.cycleUtil.strToDate(dateStr);
    var entry = NL.state.data.entries[dateStr] || { date: dateStr, event: "", schedule: "", myHappy: [], yourHappy: [] };

    var html =
      '<h2 class="modal-title">' + NL.cycleUtil.formatJPDate(date, true) +
        ' <span class="moon-emoji">' + NL.moon.getPhaseEmoji(date) + "</span></h2>" +
      '<label class="field-label" for="m-schedule">予定 <span class="field-hint">(短いメモでOK)</span></label>' +
      '<input id="m-schedule" class="input" type="text" maxlength="40" value="' + NL.util.escapeAttr(entry.schedule) + '" placeholder="例:友達とランチ">' +
      '<label class="field-label" for="m-event">今日の出来事</label>' +
      '<textarea id="m-event" class="input textarea" rows="4">' + NL.util.escapeHTML(entry.event) + "</textarea>" +
      '<label class="field-label">My Happy <span class="field-hint">(最大3つ)</span></label>' +
      '<div class="happy-group" id="m-myhappy-group">' + NL.happyFields.groupHTML(entry.myHappy, "例:朝のコーヒーがおいしかった") + "</div>" +
      '<label class="field-label">Your Happy <span class="field-hint">(最大3つ)</span></label>' +
      '<div class="happy-group" id="m-yourhappy-group">' + NL.happyFields.groupHTML(entry.yourHappy, "例:友人に「ありがとう」と伝えた") + "</div>" +
      '<div class="modal-actions">' +
        '<button type="button" class="btn btn-primary" id="m-save">保存する</button>' +
      "</div>";

    NL.modal.open(html, function () {
      var myHappyGroupEl = document.getElementById("m-myhappy-group");
      var yourHappyGroupEl = document.getElementById("m-yourhappy-group");
      NL.happyFields.init(myHappyGroupEl, "例:朝のコーヒーがおいしかった", function () {});
      NL.happyFields.init(yourHappyGroupEl, "例:友人に「ありがとう」と伝えた", function () {});

      document.getElementById("m-save").addEventListener("click", function () {
        var cur = NL.state.data.entries[dateStr] || { date: dateStr };
        cur.schedule = document.getElementById("m-schedule").value.trim();
        cur.event = document.getElementById("m-event").value;
        cur.myHappy = NL.happyFields.collect(myHappyGroupEl);
        cur.yourHappy = NL.happyFields.collect(yourHappyGroupEl);
        cur.updatedAt = new Date().toISOString();
        NL.state.data.entries[dateStr] = cur;
        NL.storage.save(NL.state.data);
        NL.modal.close();
        calendar();
      });
    });
  }

  NL.render.calendar = calendar;
})();
