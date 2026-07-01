/* Noctua Luna Journal — 月相計算
   平均朔望月(29.530588853日)に基づく近似計算。新月/満月の日付を手入力せず自動で求める。 */
(function () {
  "use strict";
  window.NL = window.NL || {};

  var SYNODIC_MONTH = 29.530588853;
  var DAY_MS = 86400000;
  // 基準となる既知の新月(2000年1月6日 18:14 UTC)
  var KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

  var PHASE_EMOJI = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  var PHASE_NAME = ["新月", "三日月", "上弦の月", "十三夜月", "満月", "十六夜月", "下弦の月", "有明月"];

  function getMoonAge(date) {
    var diffDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / DAY_MS;
    var age = diffDays % SYNODIC_MONTH;
    if (age < 0) age += SYNODIC_MONTH;
    return age;
  }

  function getPhaseFraction(date) {
    return getMoonAge(date) / SYNODIC_MONTH; // 0=新月, 0.5=満月
  }

  function phaseIndex(date) {
    var frac = getPhaseFraction(date);
    return Math.round(frac * 8) % 8;
  }

  function getPhaseEmoji(date) {
    return PHASE_EMOJI[phaseIndex(date)];
  }

  function getPhaseName(date) {
    return PHASE_NAME[phaseIndex(date)];
  }

  // date 以前(当日含む)で直近の新月の日時(UTCベースのタイムスタンプ)を返す
  function getPreviousNewMoonTs(date) {
    var synodicMs = SYNODIC_MONTH * DAY_MS;
    var diff = date.getTime() - KNOWN_NEW_MOON_UTC;
    var k = Math.floor(diff / synodicMs);
    return KNOWN_NEW_MOON_UTC + k * synodicMs;
  }

  function getNextNewMoonTs(date) {
    return getPreviousNewMoonTs(date) + SYNODIC_MONTH * DAY_MS;
  }

  // 新月の時刻から見て次の満月(約14.77日後)の時刻を返す
  function getFullMoonAfterTs(newMoonTs) {
    return newMoonTs + (SYNODIC_MONTH / 2) * DAY_MS;
  }

  function getPreviousNewMoon(date) { return new Date(getPreviousNewMoonTs(date)); }
  function getNextNewMoon(date) { return new Date(getNextNewMoonTs(date)); }
  function getFullMoonAfter(newMoonDate) { return new Date(getFullMoonAfterTs(newMoonDate.getTime())); }

  NL.moon = {
    SYNODIC_MONTH: SYNODIC_MONTH,
    getMoonAge: getMoonAge,
    getPhaseFraction: getPhaseFraction,
    getPhaseEmoji: getPhaseEmoji,
    getPhaseName: getPhaseName,
    getPreviousNewMoon: getPreviousNewMoon,
    getNextNewMoon: getNextNewMoon,
    getFullMoonAfter: getFullMoonAfter
  };
})();
