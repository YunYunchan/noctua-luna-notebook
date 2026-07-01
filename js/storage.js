/* Noctua Luna Journal — ローカルストレージ層
   サーバーは持たない方針のため、全データはブラウザの localStorage にのみ保存する。 */
(function () {
  "use strict";
  window.NL = window.NL || {};

  var STORAGE_KEY = "noctuaLuna.journal.v1";

  function defaultData() {
    return {
      version: 2,
      entries: {},   // { "YYYY-MM-DD": { date, event, myHappy: string[], yourHappy: string[], updatedAt } }
      cycles: [],    // [{ id, cycleType, startDate, endDate, text, achieved, achievementRate, reflection, smallHappiness, createdAt, completedAt }]
      settings: { cycleType: "month" } // "month" | "moon"
    };
  }

  // My Happy / Your Happy は元々単一の文字列だったため、
  // 旧形式(string)のデータを配列形式に変換する
  function toHappyArray(value) {
    if (Array.isArray(value)) return value.filter(function (v) { return typeof v === "string" && v.trim(); }).slice(0, 3);
    if (typeof value === "string") return value.trim() ? [value] : [];
    return [];
  }

  function migrateEntries(entries) {
    var out = {};
    Object.keys(entries || {}).forEach(function (key) {
      var e = entries[key] || {};
      out[key] = {
        date: e.date || key,
        event: e.event || "",
        schedule: typeof e.schedule === "string" ? e.schedule : "",
        myHappy: toHappyArray(e.myHappy),
        yourHappy: toHappyArray(e.yourHappy),
        updatedAt: e.updatedAt || null
      };
    });
    return out;
  }

  function load() {
    var raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      console.warn("localStorage が利用できません。データは保存されません。", e);
      return defaultData();
    }
    if (!raw) return defaultData();
    try {
      var parsed = JSON.parse(raw);
      var d = defaultData();
      d.entries = migrateEntries(parsed.entries);
      d.cycles = Array.isArray(parsed.cycles) ? parsed.cycles : [];
      d.settings = Object.assign(d.settings, parsed.settings || {});
      return d;
    } catch (e) {
      console.warn("保存データの読み込みに失敗しました。初期状態で開始します。", e);
      return defaultData();
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("保存に失敗しました", e);
      return false;
    }
  }

  function exportJSON(data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var today = new Date();
    var stamp = today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");
    a.href = url;
    a.download = "noctua-luna-backup-" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function importJSON(text) {
    var parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return { ok: false, error: "JSONファイルとして読み込めませんでした。" };
    }
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "ファイルの形式が正しくありません。" };
    }
    var d = defaultData();
    d.entries = migrateEntries(parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {});
    d.cycles = Array.isArray(parsed.cycles) ? parsed.cycles : [];
    d.settings = Object.assign(d.settings, parsed.settings || {});
    return { ok: true, data: d };
  }

  function resetAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* noop */ }
    return defaultData();
  }

  NL.storage = {
    load: load,
    save: save,
    exportJSON: exportJSON,
    importJSON: importJSON,
    resetAll: resetAll,
    defaultData: defaultData
  };
})();
