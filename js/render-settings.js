/* Noctua Luna Journal — 「設定」タブ */
(function () {
  "use strict";
  window.NL = window.NL || {};
  NL.render = NL.render || {};

  function settings() {
    var cycleType = NL.state.data.settings.cycleType;

    var html =
      '<section class="page page-settings">' +
        '<h3 class="section-title">予祝の振り返りサイクル</h3>' +
        '<div class="card">' +
          '<label class="radio-row">' +
            '<input type="radio" name="cycleType" value="month"' + (cycleType === "month" ? " checked" : "") + ">" +
            '<span><span class="radio-title">月ごと</span><br><span class="field-hint">月初に予祝を書き、月末に振り返ります</span></span>' +
          "</label>" +
          '<label class="radio-row">' +
            '<input type="radio" name="cycleType" value="moon"' + (cycleType === "moon" ? " checked" : "") + ">" +
            '<span><span class="radio-title">月の満ち欠け</span><br><span class="field-hint">新月に予祝を書き、満月に振り返ります(日付は自動計算)</span></span>' +
          "</label>" +
        "</div>" +

        '<h3 class="section-title">データの管理</h3>' +
        '<div class="card">' +
          '<p class="field-hint">記録はこの端末のブラウザ内にのみ保存されています。機種変更やブラウザのデータ削除で消えてしまうため、定期的なバックアップをおすすめします。</p>' +
          '<div class="settings-actions">' +
            '<button type="button" class="btn btn-secondary" id="s-export">データをエクスポート</button>' +
            '<label class="btn btn-secondary file-btn">データをインポート' +
              '<input type="file" id="s-import" accept="application/json" hidden>' +
            "</label>" +
          "</div>" +
          '<button type="button" class="btn btn-danger" id="s-reset">全データを削除する</button>' +
          '<p class="settings-message" id="s-message" aria-live="polite">&nbsp;</p>' +
        "</div>" +

        '<h3 class="section-title">Noctua Luna について</h3>' +
        '<div class="card credits-card">' +
          '<p class="field-hint">「月に今日を預けて、また明日、笑って過ごそう。」</p>' +
          '<p class="field-hint">この記録帳は、あなたのブラウザだけに保存され、どこにも送信されません。</p>' +
        "</div>" +
      "</section>";

    NL.dom.content().innerHTML = html;

    Array.prototype.forEach.call(document.querySelectorAll('input[name="cycleType"]'), function (radio) {
      radio.addEventListener("change", function () {
        NL.state.data.settings.cycleType = radio.value;
        NL.storage.save(NL.state.data);
      });
    });

    document.getElementById("s-export").addEventListener("click", function () {
      NL.storage.exportJSON(NL.state.data);
    });

    document.getElementById("s-import").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var result = NL.storage.importJSON(String(reader.result));
        var msg = document.getElementById("s-message");
        if (result.ok) {
          NL.state.data = result.data;
          NL.storage.save(NL.state.data);
          msg.textContent = "インポートが完了しました ✓";
          settings();
        } else {
          msg.textContent = result.error;
        }
      };
      reader.readAsText(file);
    });

    document.getElementById("s-reset").addEventListener("click", function () {
      if (window.confirm("すべての記録を削除します。この操作は取り消せません。よろしいですか?")) {
        NL.state.data = NL.storage.resetAll();
        settings();
      }
    });
  }

  NL.render.settings = settings;
})();
