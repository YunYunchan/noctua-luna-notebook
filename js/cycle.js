/* Noctua Luna Journal — 日付ユーティリティ & 予祝サイクル境界の計算
   「月ごと(月初/月末)」「月の満ち欠け(新月/満月)」の両方をサポートする。 */
(function () {
  "use strict";
  window.NL = window.NL || {};

  var WEEKDAY_JP = ["日", "月", "火", "水", "木", "金", "土"];

  function pad2(n) { return String(n).padStart(2, "0"); }

  function dateToStr(date) {
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
  }

  function strToDate(str) {
    var parts = str.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, n) {
    var d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
  function endOfMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0); }

  function formatJPDate(date, withWeekday) {
    var s = date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日";
    if (withWeekday) s += "(" + WEEKDAY_JP[date.getDay()] + ")";
    return s;
  }

  function formatShortDate(date) {
    return (date.getMonth() + 1) + "/" + date.getDate();
  }

  // 現在(today)が属する予祝サイクルの境界を返す。
  // cycleType: "month" -> 月初〜月末
  // cycleType: "moon"  -> 新月〜満月(満月を過ぎたら、次の新月〜満月が次サイクルとして active:false で返る)
  function getCurrentBounds(cycleType, today) {
    var t = startOfDay(today);
    if (cycleType === "moon") {
      var prevNew = startOfDay(NL.moon.getPreviousNewMoon(t));
      var fullMoon = startOfDay(NL.moon.getFullMoonAfter(prevNew));
      if (t.getTime() <= fullMoon.getTime()) {
        return { start: prevNew, end: fullMoon, active: true, cycleType: "moon" };
      }
      var nextNew = startOfDay(NL.moon.getNextNewMoon(t));
      var nextFull = startOfDay(NL.moon.getFullMoonAfter(nextNew));
      return { start: nextNew, end: nextFull, active: false, cycleType: "moon" };
    }
    // month
    var start = startOfMonth(t);
    var end = endOfMonth(t);
    return { start: start, end: end, active: true, cycleType: "month" };
  }

  function formatRangeLabel(bounds) {
    if (bounds.cycleType === "moon") {
      return "新月 " + formatShortDate(bounds.start) + " 〜 満月 " + formatShortDate(bounds.end);
    }
    return formatShortDate(bounds.start) + "(月初) 〜 " + formatShortDate(bounds.end) + "(月末)";
  }

  NL.cycleUtil = {
    dateToStr: dateToStr,
    strToDate: strToDate,
    startOfDay: startOfDay,
    addDays: addDays,
    startOfMonth: startOfMonth,
    endOfMonth: endOfMonth,
    formatJPDate: formatJPDate,
    formatShortDate: formatShortDate,
    getCurrentBounds: getCurrentBounds,
    formatRangeLabel: formatRangeLabel,
    WEEKDAY_JP: WEEKDAY_JP
  };
})();
