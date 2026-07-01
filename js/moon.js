/* Noctua Luna Journal — 月相計算
   Jean Meeus「Astronomical Algorithms」の月相近似式(章49)に基づく計算。
   平均朔望月だけを使う単純な計算だと、月の軌道が楕円であることによる
   ズレ(±1日程度)が出るため、太陽・月の平均近点角などの補正項を加えて
   新月・満月・上弦・下弦の実際の日時を正確に求める。 */
(function () {
  "use strict";
  window.NL = window.NL || {};

  var DAY_MS = 86400000;
  var UNIX_EPOCH_JD = 2440587.5;

  var PHASE_EMOJI = {
    newMoon: "🌑",
    waxingCrescent: "🌒",
    firstQuarter: "🌓",
    waxingGibbous: "🌔",
    fullMoon: "🌕",
    waningGibbous: "🌖",
    lastQuarter: "🌗",
    waningCrescent: "🌘"
  };
  var PHASE_NAME = {
    newMoon: "新月",
    waxingCrescent: "三日月",
    firstQuarter: "上弦の月",
    waxingGibbous: "十三夜月",
    fullMoon: "満月",
    waningGibbous: "十六夜月",
    lastQuarter: "下弦の月",
    waningCrescent: "有明月"
  };

  function toJD(date) { return date.getTime() / DAY_MS + UNIX_EPOCH_JD; }
  function fromJD(jd) { return new Date((jd - UNIX_EPOCH_JD) * DAY_MS); }
  function deg2rad(d) { return d * Math.PI / 180; }
  function normalizeDeg(d) { d = d % 360; if (d < 0) d += 360; return d; }

  // 与えられた日時に近いおおよその朔望月番号(k)。k=0が2000年1月6日頃の新月。
  function approxK(date) {
    var year = date.getUTCFullYear();
    var startOfYear = Date.UTC(year, 0, 1);
    var startOfNextYear = Date.UTC(year + 1, 0, 1);
    var frac = (date.getTime() - startOfYear) / (startOfNextYear - startOfYear);
    var decYear = year + frac;
    return (decYear - 2000) * 12.3685;
  }

  // phase: 0=新月, 0.25=上弦, 0.5=満月, 0.75=下弦。 kInt + phase が実際の朔望月番号。
  function phaseJDE(kInt, phase) {
    var k = kInt + phase;
    var T = k / 1236.85;
    var T2 = T * T, T3 = T2 * T, T4 = T3 * T;

    var JDE0 = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.000000150 * T3 + 0.00000000073 * T4;
    var E = 1 - 0.002516 * T - 0.0000074 * T2;

    var M = deg2rad(normalizeDeg(2.5534 + 29.10535670 * k - 0.0000014 * T2 - 0.00000011 * T3));
    var Mp = deg2rad(normalizeDeg(201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4));
    var F = deg2rad(normalizeDeg(160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4));
    var Om = deg2rad(normalizeDeg(124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3));

    var correction;
    if (phase === 0 || phase === 1) {
      correction =
        -0.40720 * Math.sin(Mp) +
         0.17241 * E * Math.sin(M) +
         0.01608 * Math.sin(2 * Mp) +
         0.01039 * Math.sin(2 * F) +
         0.00739 * E * Math.sin(Mp - M) -
         0.00514 * E * Math.sin(Mp + M) +
         0.00208 * E * E * Math.sin(2 * M) -
         0.00111 * Math.sin(Mp - 2 * F) -
         0.00057 * Math.sin(Mp + 2 * F) +
         0.00056 * E * Math.sin(2 * Mp + M) -
         0.00042 * Math.sin(3 * Mp) +
         0.00042 * E * Math.sin(M + 2 * F) +
         0.00038 * E * Math.sin(M - 2 * F) -
         0.00024 * E * Math.sin(2 * Mp - M) -
         0.00017 * Math.sin(Om);
    } else if (phase === 0.5) {
      correction =
        -0.40614 * Math.sin(Mp) +
         0.17302 * E * Math.sin(M) +
         0.01614 * Math.sin(2 * Mp) +
         0.01043 * Math.sin(2 * F) +
         0.00734 * E * Math.sin(Mp - M) -
         0.00515 * E * Math.sin(Mp + M) +
         0.00209 * E * E * Math.sin(2 * M) -
         0.00111 * Math.sin(Mp - 2 * F) -
         0.00057 * Math.sin(Mp + 2 * F) +
         0.00056 * E * Math.sin(2 * Mp + M) -
         0.00042 * Math.sin(3 * Mp) +
         0.00042 * E * Math.sin(M + 2 * F) +
         0.00038 * E * Math.sin(M - 2 * F) -
         0.00024 * E * Math.sin(2 * Mp - M) -
         0.00017 * Math.sin(Om);
    } else {
      correction =
        -0.62801 * Math.sin(Mp) +
         0.17172 * E * Math.sin(M) -
         0.01183 * E * Math.sin(Mp + M) +
         0.00862 * Math.sin(2 * Mp) +
         0.00804 * Math.sin(2 * F) +
         0.00454 * E * Math.sin(Mp - M) +
         0.00204 * E * E * Math.sin(2 * M) -
         0.00180 * Math.sin(Mp - 2 * F) -
         0.00070 * Math.sin(Mp + 2 * F);
      var W = 0.00306 - 0.00038 * E * Math.cos(M) + 0.00026 * Math.cos(Mp) -
        0.00002 * Math.cos(Mp - M) + 0.00002 * Math.cos(Mp + M) + 0.00002 * Math.cos(2 * F);
      correction += (phase === 0.25) ? W : -W;
    }

    return JDE0 + correction;
  }

  function newMoonAtK(kInt) { return fromJD(phaseJDE(kInt, 0)); }
  function firstQuarterAtK(kInt) { return fromJD(phaseJDE(kInt, 0.25)); }
  function fullMoonAtK(kInt) { return fromJD(phaseJDE(kInt, 0.5)); }
  function lastQuarterAtK(kInt) { return fromJD(phaseJDE(kInt, 0.75)); }

  function getPreviousNewMoon(date) {
    var k0 = Math.floor(approxK(date));
    for (var k = k0 + 1; k >= k0 - 2; k--) {
      var nm = newMoonAtK(k);
      if (nm.getTime() <= date.getTime()) return nm;
    }
    return newMoonAtK(k0 - 2);
  }

  function getNextNewMoon(date) {
    var k0 = Math.floor(approxK(date));
    for (var k = k0 - 1; k <= k0 + 2; k++) {
      var nm = newMoonAtK(k);
      if (nm.getTime() > date.getTime()) return nm;
    }
    return newMoonAtK(k0 + 2);
  }

  // newMoonDate に対応する朔望月番号(k)を特定する
  function kForNewMoon(newMoonDate) {
    var k0 = Math.round(approxK(newMoonDate));
    var best = k0, bestDiff = Infinity;
    for (var k = k0 - 1; k <= k0 + 1; k++) {
      var diff = Math.abs(newMoonAtK(k).getTime() - newMoonDate.getTime());
      if (diff < bestDiff) { bestDiff = diff; best = k; }
    }
    return best;
  }

  function getFullMoonAfter(newMoonDate) {
    return fullMoonAtK(kForNewMoon(newMoonDate));
  }

  // 与えられた日が、実際の新月/上弦/満月/下弦のどれかと「同じ日(ローカル日付)」かどうかを見て、
  // 一致すればその名前を、しなければ三日月/十三夜月/十六夜月/有明月のいずれかを返す
  function getPhaseKey(date) {
    var dateStr = NL.cycleUtil.dateToStr(date);
    var prevNew = getPreviousNewMoon(date);
    var k = kForNewMoon(prevNew);
    var firstQ = firstQuarterAtK(k);
    var full = fullMoonAtK(k);
    var lastQ = lastQuarterAtK(k);
    var nextNew = newMoonAtK(k + 1);

    if (NL.cycleUtil.dateToStr(prevNew) === dateStr) return "newMoon";
    if (NL.cycleUtil.dateToStr(nextNew) === dateStr) return "newMoon";
    if (NL.cycleUtil.dateToStr(firstQ) === dateStr) return "firstQuarter";
    if (NL.cycleUtil.dateToStr(full) === dateStr) return "fullMoon";
    if (NL.cycleUtil.dateToStr(lastQ) === dateStr) return "lastQuarter";

    if (date.getTime() < firstQ.getTime()) return "waxingCrescent";
    if (date.getTime() < full.getTime()) return "waxingGibbous";
    if (date.getTime() < lastQ.getTime()) return "waningGibbous";
    return "waningCrescent";
  }

  function getPhaseEmoji(date) { return PHASE_EMOJI[getPhaseKey(date)]; }
  function getPhaseName(date) { return PHASE_NAME[getPhaseKey(date)]; }

  NL.moon = {
    getPhaseEmoji: getPhaseEmoji,
    getPhaseName: getPhaseName,
    getPreviousNewMoon: getPreviousNewMoon,
    getNextNewMoon: getNextNewMoon,
    getFullMoonAfter: getFullMoonAfter
  };
})();
