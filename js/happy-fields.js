/* Noctua Luna Journal — My Happy / Your Happy 入力欄(最大3つまで追加可能) */
(function () {
  "use strict";
  window.NL = window.NL || {};

  var MAX = 3;

  function rowHTML(value, placeholder) {
    return (
      '<div class="happy-row">' +
        '<input type="text" class="input happy-input" maxlength="200" value="' + NL.util.escapeAttr(value) + '" placeholder="' + NL.util.escapeAttr(placeholder) + '">' +
        '<button type="button" class="happy-remove" aria-label="削除">×</button>' +
      "</div>"
    );
  }

  // グループの中身(入力欄リスト+追加ボタン)のHTMLを返す
  function groupHTML(values, placeholder) {
    var list = (values && values.length ? values : [""]).slice(0, MAX);
    var rows = list.map(function (v) { return rowHTML(v, placeholder); }).join("");
    return (
      '<div class="happy-list">' + rows + "</div>" +
      '<button type="button" class="happy-add">＋ もう一つ追加</button>'
    );
  }

  function updateVisibility(groupEl) {
    var rows = groupEl.querySelectorAll(".happy-row");
    var addBtn = groupEl.querySelector(".happy-add");
    Array.prototype.forEach.call(rows, function (row) {
      var removeBtn = row.querySelector(".happy-remove");
      removeBtn.style.display = rows.length > 1 ? "" : "none";
    });
    if (addBtn) addBtn.style.display = rows.length >= MAX ? "none" : "";
  }

  // groupEl: groupHTML() を挿入した親要素。onChange は入力/削除のたびに呼ばれる
  function init(groupEl, placeholder, onChange) {
    updateVisibility(groupEl);

    groupEl.addEventListener("input", function (e) {
      if (e.target.classList.contains("happy-input")) onChange();
    });

    groupEl.addEventListener("click", function (e) {
      if (e.target.classList.contains("happy-add")) {
        var list = groupEl.querySelector(".happy-list");
        if (list.querySelectorAll(".happy-row").length >= MAX) return;
        var wrapper = document.createElement("div");
        wrapper.innerHTML = rowHTML("", placeholder);
        var row = wrapper.firstElementChild;
        list.appendChild(row);
        updateVisibility(groupEl);
        row.querySelector(".happy-input").focus();
      } else if (e.target.classList.contains("happy-remove")) {
        var list2 = groupEl.querySelector(".happy-list");
        if (list2.querySelectorAll(".happy-row").length <= 1) return;
        e.target.closest(".happy-row").remove();
        updateVisibility(groupEl);
        onChange();
      }
    });
  }

  function collect(groupEl) {
    var inputs = groupEl.querySelectorAll(".happy-input");
    var values = [];
    Array.prototype.forEach.call(inputs, function (input) {
      var v = input.value.trim();
      if (v) values.push(v);
    });
    return values.slice(0, MAX);
  }

  NL.happyFields = { groupHTML: groupHTML, init: init, collect: collect, MAX: MAX };
})();
