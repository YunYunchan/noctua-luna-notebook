/* Noctua Luna Journal — 「予祝」タブ
   予祝:叶えたい未来を「もう叶った」こととして過去形で書く。
   サイクル(月ごと / 月相)が終わったら、達成チェック・達成率・振り返りメモ・
   予祝のおかげで起きた小さな幸せ、を記録する。 */
(function () {
  "use strict";
  window.NL = window.NL || {};
  NL.render = NL.render || {};

  function findCycle(startStr, endStr, cycleType) {
    var cycles = NL.state.data.cycles;
    for (var i = 0; i < cycles.length; i++) {
      var c = cycles[i];
      if (c.cycleType === cycleType && c.startDate === startStr && c.endDate === endStr) return c;
    }
    return null;
  }

  function yoshuku() {
    var settings = NL.state.data.settings;
    var cycleType = settings.cycleType;
    var today = new Date();
    var todayStr = NL.cycleUtil.dateToStr(today);
    var bounds = NL.cycleUtil.getCurrentBounds(cycleType, today);
    var startStr = NL.cycleUtil.dateToStr(bounds.start);
    var endStr = NL.cycleUtil.dateToStr(bounds.end);
    var existing = findCycle(startStr, endStr, cycleType);
    var ended = todayStr > endStr;

    var currentHTML;
    if (bounds.active) {
      currentHTML = renderCurrentCycle(bounds, existing, ended);
    } else {
      currentHTML =
        '<div class="card yoshuku-upcoming">' +
          '<p class="field-hint">次のサイクルは、まだ始まっていません。</p>' +
          '<p class="yoshuku-range">' + NL.cycleUtil.formatRangeLabel(bounds) + " から新しい予祝を書けます</p>" +
        "</div>";
    }

    var unresolvedHTML = renderUnresolvedPrompt(existing, bounds, todayStr);

    var html =
      '<section class="page page-yoshuku">' +
        '<div class="yoshuku-hero">' +
          '<p class="yoshuku-heading">予祝</p>' +
          '<p class="field-hint">叶えたい未来を、もう叶ったこととして書いてみましょう。</p>' +
        "</div>" +
        unresolvedHTML +
        currentHTML +
        '<h3 class="section-title">これまでの予祝</h3>' +
        '<div id="yoshuku-history">' + renderHistory() + "</div>" +
      "</section>";

    NL.dom.content().innerHTML = html;
    attachHandlers();
  }

  function renderUnresolvedPrompt(existing, bounds, todayStr) {
    // 現在のサイクルが「終了済みなのに振り返り未了」の場合は上で表示するので、
    // それ以外に振り返り待ちのサイクルがないかも軽く案内する
    if (existing) return "";
    var cycles = NL.state.data.cycles.filter(function (c) {
      return !c.completedAt && c.endDate < todayStr;
    });
    if (cycles.length === 0) return "";
    return (
      '<div class="card yoshuku-nudge">' +
        '<p class="field-hint">振り返りがまだの予祝が ' + cycles.length + ' 件あります。下の「これまでの予祝」から振り返ってみましょう。</p>' +
      "</div>"
    );
  }

  function renderCurrentCycle(bounds, existing, ended) {
    var rangeLabel = NL.cycleUtil.formatRangeLabel(bounds);
    if (!existing) {
      return (
        '<div class="card">' +
          '<p class="yoshuku-range">' + rangeLabel + "</p>" +
          '<label class="field-label" for="y-text">今サイクルの予祝</label>' +
          '<textarea id="y-text" class="input textarea" rows="5" placeholder="例:「〜が叶いました。ありがとうございます。」"></textarea>' +
          '<div class="modal-actions">' +
            '<button type="button" class="btn btn-primary" id="y-create">この予祝を書く</button>' +
          "</div>" +
        "</div>"
      );
    }

    var reflectionHTML = "";
    if (ended) {
      reflectionHTML =
        '<div class="card yoshuku-reflection">' +
          '<p class="section-title-sm">振り返り</p>' +
          '<label class="field-check">' +
            '<input type="checkbox" id="y-achieved"' + (existing.achieved ? " checked" : "") + ">" +
            " 達成できた" +
          "</label>" +
          '<label class="field-label" for="y-rate">達成率 <span id="y-rate-value">' + (existing.achievementRate || 0) + "%</span></label>" +
          '<input id="y-rate" type="range" min="0" max="100" step="5" value="' + (existing.achievementRate || 0) + '">' +
          '<label class="field-label" for="y-reflection">振り返りメモ</label>' +
          '<textarea id="y-reflection" class="input textarea" rows="3">' + NL.util.escapeHTML(existing.reflection) + "</textarea>" +
          '<label class="field-label" for="y-smallhappy">予祝のおかげで起きた小さな幸せ</label>' +
          '<textarea id="y-smallhappy" class="input textarea" rows="2">' + NL.util.escapeHTML(existing.smallHappiness) + "</textarea>" +
          '<div class="modal-actions">' +
            '<button type="button" class="btn btn-primary" id="y-save-reflection">振り返りを保存する</button>' +
          "</div>" +
        "</div>";
    } else {
      reflectionHTML =
        '<p class="field-hint yoshuku-end-note">振り返りは ' + NL.cycleUtil.formatShortDate(bounds.end) + " から書けます</p>";
    }

    return (
      '<div class="card">' +
        '<p class="yoshuku-range">' + rangeLabel + "</p>" +
        '<label class="field-label" for="y-text">今サイクルの予祝</label>' +
        '<textarea id="y-text" class="input textarea" rows="5">' + NL.util.escapeHTML(existing.text) + "</textarea>" +
        '<div class="modal-actions">' +
          '<button type="button" class="btn btn-secondary" id="y-update-text" data-id="' + existing.id + '">予祝を更新する</button>' +
        "</div>" +
      "</div>" + reflectionHTML
    );
  }

  function renderHistory() {
    var cycles = NL.state.data.cycles.slice().sort(function (a, b) {
      return a.startDate < b.startDate ? 1 : -1;
    });
    if (cycles.length === 0) {
      return '<p class="field-hint">まだ記録がありません。</p>';
    }
    return cycles.map(function (c) {
      var start = NL.cycleUtil.strToDate(c.startDate);
      var end = NL.cycleUtil.strToDate(c.endDate);
      var label = c.cycleType === "moon"
        ? "新月 " + NL.cycleUtil.formatShortDate(start) + " 〜 満月 " + NL.cycleUtil.formatShortDate(end)
        : NL.cycleUtil.formatShortDate(start) + " 〜 " + NL.cycleUtil.formatShortDate(end);
      var statusBadge = c.completedAt
        ? '<span class="badge badge-done">達成率 ' + (c.achievementRate || 0) + "%</span>"
        : (c.endDate < NL.cycleUtil.dateToStr(new Date())
            ? '<span class="badge badge-pending">振り返り未了</span>'
            : '<span class="badge badge-active">進行中</span>');
      return (
        '<details class="history-item">' +
          "<summary>" +
            '<span class="history-label">' + label + "</span>" + statusBadge +
          "</summary>" +
          '<div class="history-body" data-id="' + c.id + '">' +
            '<label class="field-label">予祝</label>' +
            '<textarea class="input textarea h-text" rows="3">' + NL.util.escapeHTML(c.text) + "</textarea>" +
            '<label class="field-check"><input type="checkbox" class="h-achieved"' + (c.achieved ? " checked" : "") + "> 達成できた</label>" +
            '<label class="field-label">達成率 <span class="h-rate-value">' + (c.achievementRate || 0) + "%</span></label>" +
            '<input type="range" class="h-rate" min="0" max="100" step="5" value="' + (c.achievementRate || 0) + '">' +
            '<label class="field-label">振り返りメモ</label>' +
            '<textarea class="input textarea h-reflection" rows="2">' + NL.util.escapeHTML(c.reflection) + "</textarea>" +
            '<label class="field-label">予祝のおかげで起きた小さな幸せ</label>' +
            '<textarea class="input textarea h-smallhappy" rows="2">' + NL.util.escapeHTML(c.smallHappiness) + "</textarea>" +
            '<div class="modal-actions">' +
              '<button type="button" class="btn btn-primary h-save">保存する</button>' +
            "</div>" +
          "</div>" +
        "</details>"
      );
    }).join("");
  }

  function attachHandlers() {
    var createBtn = document.getElementById("y-create");
    if (createBtn) {
      createBtn.addEventListener("click", function () {
        var settings = NL.state.data.settings;
        var bounds = NL.cycleUtil.getCurrentBounds(settings.cycleType, new Date());
        var cycle = {
          id: "c-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          cycleType: bounds.cycleType,
          startDate: NL.cycleUtil.dateToStr(bounds.start),
          endDate: NL.cycleUtil.dateToStr(bounds.end),
          text: document.getElementById("y-text").value,
          achieved: false,
          achievementRate: 0,
          reflection: "",
          smallHappiness: "",
          createdAt: new Date().toISOString(),
          completedAt: null
        };
        NL.state.data.cycles.push(cycle);
        NL.storage.save(NL.state.data);
        yoshuku();
      });
    }

    var updateBtn = document.getElementById("y-update-text");
    if (updateBtn) {
      updateBtn.addEventListener("click", function () {
        var id = updateBtn.getAttribute("data-id");
        var c = NL.state.data.cycles.find(function (x) { return x.id === id; });
        if (c) {
          c.text = document.getElementById("y-text").value;
          NL.storage.save(NL.state.data);
          yoshuku();
        }
      });
    }

    var rateInput = document.getElementById("y-rate");
    if (rateInput) {
      rateInput.addEventListener("input", function () {
        document.getElementById("y-rate-value").textContent = rateInput.value + "%";
      });
    }

    var saveReflectionBtn = document.getElementById("y-save-reflection");
    if (saveReflectionBtn) {
      saveReflectionBtn.addEventListener("click", function () {
        var settings = NL.state.data.settings;
        var bounds = NL.cycleUtil.getCurrentBounds(settings.cycleType, new Date());
        var startStr = NL.cycleUtil.dateToStr(bounds.start);
        var endStr = NL.cycleUtil.dateToStr(bounds.end);
        var c = findCycle(startStr, endStr, bounds.cycleType);
        if (c) {
          c.achieved = document.getElementById("y-achieved").checked;
          c.achievementRate = Number(document.getElementById("y-rate").value);
          c.reflection = document.getElementById("y-reflection").value;
          c.smallHappiness = document.getElementById("y-smallhappy").value;
          c.completedAt = new Date().toISOString();
          NL.storage.save(NL.state.data);
          yoshuku();
        }
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll(".history-item .h-rate"), function (el) {
      el.addEventListener("input", function () {
        el.closest(".history-body").querySelector(".h-rate-value").textContent = el.value + "%";
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll(".history-item .h-save"), function (btn) {
      btn.addEventListener("click", function () {
        var body = btn.closest(".history-body");
        var id = body.getAttribute("data-id");
        var c = NL.state.data.cycles.find(function (x) { return x.id === id; });
        if (!c) return;
        c.text = body.querySelector(".h-text").value;
        c.achieved = body.querySelector(".h-achieved").checked;
        c.achievementRate = Number(body.querySelector(".h-rate").value);
        c.reflection = body.querySelector(".h-reflection").value;
        c.smallHappiness = body.querySelector(".h-smallhappy").value;
        if (!c.completedAt) c.completedAt = new Date().toISOString();
        NL.storage.save(NL.state.data);
        yoshuku();
      });
    });
  }

  NL.render.yoshuku = yoshuku;
})();
