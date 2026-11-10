(function () {
  "use strict";
  var M = window.MENU;
  var lang = "bg";
  var T = {
    bg: { soon: "Английската версия идва скоро.", note: "Цените са в евро (€). Номерата след * означават алергени." },
    en: { soon: "English menu coming soon.", note: "" }
  };
  var CHILI = '<svg class="chili" viewBox="0 0 24 24" aria-label="люто" role="img"><path fill="#d43823" d="M20.6 6.2c-.9-.6-2-.6-2.9 0-.6.4-1 1.2-1.3 2-1 3-3.7 6.2-8.6 7.6-2.1.6-4.6.9-6.5.6-.6-.1-.9.6-.4 1 2.3 1.9 6.6 3.4 11 1.9 5.6-1.9 8.8-6.9 9.4-10.1.2-1.1 0-2.3-.7-3z"/><path fill="#3f7d2c" d="M18.4 6.1c.1-1.4.9-2.8 2.4-3.6l.7 1.1c-1 .6-1.6 1.5-1.7 2.6l-1.4-.1z"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function txt(o) { return o && (o[lang] || o.bg) || ""; }

  function item(it, flip) {
    var ph = it.photo;
    var cls = "it " + (ph ? "it--photo" + (flip ? " flip" : "") : "it--plain");
    var h = '<li class="' + cls + '" id="i-' + it.id + '">';
    if (ph) {
      h += '<div class="it-ph"><img src="' + ph.src + '" width="' + ph.w + '" height="' + ph.h +
        '" alt="' + esc(txt(it.name)) + '" loading="lazy" decoding="async"></div>';
    }
    h += '<div class="it-tx">';
    if (it["new"]) h += '<div class="it-flags"><span class="tag-new">Ново</span></div>';
    h += '<h3 class="it-name">' + esc(txt(it.name)) + (it.spicy ? CHILI : "") + "</h3>";
    var d = txt(it.desc);
    var al = it.allergens.length ? ' <span class="it-all">*' + it.allergens.join(", ") + "</span>" : "";
    if (d) h += '<p class="it-desc">' + esc(d) + al + "</p>";
    var vs = it.variants || [{ weight: it.weight, price_eur: it.price_eur }];
    vs.forEach(function (v, i) {
      h += '<div class="it-meta">';
      if (v.weight) h += '<span class="it-w">' + esc(v.weight) + "</span>";
      h += '<span class="it-p">' + esc(v.price_eur) + " €" + (it.price_per ? '<span class="it-per"> / ' + esc(it.price_per) + "</span>" : "") + "</span>";
      if (!d && al && i === vs.length - 1) h += al;
      h += "</div>";
    });
    h += "</div></li>";
    return h;
  }

  function render() {
    var main = document.getElementById("menu"), chips = document.getElementById("chips");
    var html = "", nav = "";
    M.sections.forEach(function (s) {
      html += '<section class="sec' + (s.dark ? " sec--dark" : "") + '" id="' + s.id + '" aria-label="' + esc(s.nav) + '">';
      s.groups.forEach(function (g) {
        html += '<div class="grp"><div class="grp-head"><h2 class="grp-script">' + esc(g.script) + "</h2>" +
          (g.label ? '<span class="grp-label">' + esc(g.label) + "</span>" : "") + "</div>" +
          (g.note ? '<p class="grp-note">' + esc(g.note) + "</p>" : "") + '<ul class="items">';
        var k = 0;
        g.items.forEach(function (it) { html += item(it, it.photo ? (k++ % 2 === 1) : false); });
        html += "</ul></div>";
      });
      html += "</section>";
      nav += '<a class="chip" href="#' + s.id + '" data-id="' + s.id + '">' + esc(s.nav) + "</a>";
    });
    main.innerHTML = html;
    chips.innerHTML = nav;
    document.getElementById("footNote").textContent = M.note || T.bg.note;
    Array.prototype.forEach.call(document.querySelectorAll(".foot-notice,.foot-contact"), function (n) { n.remove(); });
    if (M.notice) document.getElementById("footNote").insertAdjacentHTML("afterend", '<p class="foot-note foot-notice">' + esc(M.notice) + "</p>");
    if (M.contact) {
      var c = M.contact;
      document.getElementById("allergens").insertAdjacentHTML("afterend", '<div class="foot-contact"><p>' + esc(c.delivery) + '</p><p><a href="tel:' + c.phone.replace(/\s/g, "") + '">' + esc(c.phone) + '</a> · <a href="https://' + c.web + '">' + esc(c.web) + "</a></p><p>" + esc(c.address) + "</p></div>");
    }
    if (M.allergens) {
      var a = '<div class="alg"><h2>Алергени</h2>';
      Object.keys(M.allergens).forEach(function (k) { a += "<p>" + esc(k) + ". " + esc(M.allergens[k]) + "</p>"; });
      document.getElementById("allergens").innerHTML = a + "</div>";
    }
  }

  function spy() {
    var chips = document.getElementById("chips");
    var links = {}; Array.prototype.forEach.call(chips.querySelectorAll(".chip"), function (a) { links[a.dataset.id] = a; });
    var current = null;
    function setOn(id) {
      if (id === current) return; current = id;
      Object.keys(links).forEach(function (k) { links[k].classList.toggle("is-on", k === id); });
      var a = links[id]; if (!a) return;
      var left = a.offsetLeft - (chips.clientWidth - a.offsetWidth) / 2;
      chips.scrollTo({ left: left, behavior: "smooth" });
    }
    var secs = Array.prototype.slice.call(document.querySelectorAll(".sec"));
    function onScroll() {
      var y = 56 + 40, id = null;
      for (var i = 0; i < secs.length; i++) { if (secs[i].getBoundingClientRect().top <= y) id = secs[i].id; }
      if (id) setOn(id); else { current = null; Object.keys(links).forEach(function (k) { links[k].classList.remove("is-on"); }); }
    }
    var ticking = false;
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });
    onScroll();
  }

  function toast(msg) {
    var t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  function langs() {
    var hasEn = M.sections.some(function (s) { return s.groups.some(function (g) { return g.items.some(function (i) { return i.name.en; }); }); });
    Array.prototype.forEach.call(document.querySelectorAll(".lang-btn"), function (b) {
      b.addEventListener("click", function () {
        var l = b.dataset.lang;
        if (l === "en" && !hasEn) { toast(T.en.soon + " / " + T.bg.soon); return; }
        lang = l; document.documentElement.lang = l;
        Array.prototype.forEach.call(document.querySelectorAll(".lang-btn"), function (x) {
          var on = x.dataset.lang === l; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on);
        });
        render(); spy();
      });
    });
  }

  render(); spy(); langs();
})();
