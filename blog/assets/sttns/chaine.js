/* Planche animée du framework STTNS (FR/EN selon <html lang>). */
(function () {
  "use strict";
  var racine = document.getElementById("archi-sttns");
  if (!racine) return;
  var EN = (document.documentElement.lang || "fr").slice(0, 2) === "en";
  function T(fr, en) { return EN ? en : fr; }
  var NS = "http://www.w3.org/2000/svg";
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 200, H = 64, ROUGE = "#ef6b6b";
  var NOEUDS = {
    persona:  { x: 30,  y: 70,  t: "Persona", s: T("Karim, chef de cantine", "Karim, school chef") },
    douleur:  { x: 30,  y: 160, t: T("Douleur", "Pain point"), s: T("menus sur volumes incertains", "menus on uncertain volumes") },
    job:      { x: 30,  y: 250, t: "JTBD", s: T("Quand… je veux… afin de…", "When… I want… so I can…") },
    produit:  { x: 30,  y: 395, t: T("Produit", "Product"), s: T("CEO · product manager", "CEO · product manager") },
    tech:     { x: 30,  y: 465, t: "Tech", s: T("experts du projet", "project experts") },
    epic:     { x: 400, y: 70,  t: "Epic", s: T("aucune saisie", "no input") },
    feature:  { x: 400, y: 175, t: "Feature", s: T("impact 0 à 3 · job servi", "impact 0 to 3 · job served") },
    story:    { x: 400, y: 280, t: "Story", s: T("jours · risque", "days · risk") },
    tache:    { x: 400, y: 385, t: T("Tâche", "Task"), s: T("qui fait quoi", "who does what") },
    ratio:    { x: 770, y: 70,  t: T("Ratio valeur / effort", "Value / effort ratio"), s: T("∑ impact ÷ ∑ jours", "∑ impact ÷ ∑ days") },
    kanban:   { x: 770, y: 175, t: T("Cycles · Kanban", "Cycles · Kanban"), s: T("4 colonnes · 5 en cours max", "4 columns · max 5 in progress") },
    radar:    { x: 770, y: 268, t: T("Radar · Copilot Santé", "Radar · Health Copilot"), s: T("gaspillage, orphelins", "waste, orphans") },
    trace:    { x: 770, y: 349, t: T("Dépendances", "Dependencies"), s: T("jobs sans feature", "jobs without a feature") },
    base:     { x: 770, y: 450, t: "PostgreSQL", s: T("déclencheurs · RLS", "triggers · RLS") }
  };
  var ZONES = [
    { x: 15,  y: 40,  w: 230, h: 300, t: T("BESOINS", "NEEDS"), c: "#f5b94a" },
    { x: 15,  y: 365, w: 230, h: 180, t: T("ÉQUIPE", "TEAM"), c: "#b48cff" },
    { x: 385, y: 40,  w: 230, h: 505, t: T("PORTEFEUILLE", "PORTFOLIO"), c: "#45a99c" },
    { x: 755, y: 40,  w: 230, h: 505, t: T("PILOTAGE ET CONTRÔLE", "STEERING AND CONTROL"), c: "#7aa2ff" }
  ];
  var CAS = [
    { id: "chaine", nom: T("De la douleur à la tâche", "From pain to task"), c: "#45a99c",
      legende: T("Persona et epic sont les racines ; chaque autre objet a un seul type de parent permis. On part toujours d’une personne et de ce qui la gêne.",
                 "Persona and epic are the roots; every other object has a single allowed parent type. It always starts with a person and what gets in their way."),
      etapes: [
        ["persona", "douleur", T("sa douleur", "their pain"), T("Karim compose ses menus trois semaines à l’avance, sans savoir ce que les maraîchers auront.", "Karim plans menus three weeks ahead without knowing what the growers will have.")],
        ["douleur", "job", T("ce qu’il veut accomplir", "what they want done"), T("La douleur devient un job à accomplir, relié à la douleur qu’il résout.", "The pain becomes a job to be done, linked to the pain it solves.")],
        ["epic", "feature", T("parent : un epic", "parent: an epic"), T("La feature « Prévisions de disponibilité à 3 semaines » naît sous un epic.", "The feature “3-week availability forecasts” is created under an epic.")],
        ["job", "feature", T("sert ce job", "serves this job"), T("Elle doit nommer le job qu’elle sert, sinon l’application refuse de l’enregistrer.", "It must name the job it serves, or the application refuses to save it.")],
        ["feature", "story", T("≤ 5 jours", "≤ 5 days"), T("Elle se découpe en stories de cinq jours au plus.", "It is split into stories of five days at most.")],
        ["story", "tache", T("qui fait quoi", "who does what"), T("Chaque story porte ses tâches et leurs responsables.", "Each story carries its tasks and their owners.")],
        ["story", "kanban", T("cycle à capacité fixe", "fixed-capacity cycle"), T("La story entre dans un cycle, puis sur le Kanban.", "The story enters a cycle, then the Kanban board.")]
      ] },
    { id: "saisies", nom: T("Trois mains, trois saisies", "Three hands, three inputs"), c: "#b48cff",
      legende: T("Personne ne saisit à la fois la valeur et le coût. L’epic, lui, ne reçoit aucune saisie.",
                 "Nobody enters both value and cost. The epic gets no input at all."),
      etapes: [
        ["produit", "feature", T("impact 0 à 3", "impact 0 to 3"), T("Le Produit attribue un impact à la feature, de 0 (gaspillage) à 3 (vital).", "Product assigns the feature an impact, from 0 (waste) to 3 (vital).")],
        ["tech", "story", T("jours + risque", "days + risk"), T("Les experts estiment chaque story en jours et en risque : connu, probable ou inconnu.", "The experts estimate each story in days and risk: known, likely or unknown.")],
        ["feature", "epic", T("∑ impact · ∑ jours", "∑ impact · ∑ days"), T("Impacts et jours remontent vers l’epic.", "Impacts and days roll up to the epic.")],
        ["epic", "ratio", T("calculé, jamais saisi", "computed, never entered"), T("Le système calcule le ratio valeur / effort de l’epic.", "The system computes the epic’s value / effort ratio.")]
      ] },
    { id: "refus", nom: T("Ce qui est refusé", "What gets refused"), c: ROUGE,
      legende: T("Le premier refus vient de la base, les deux suivants de l’application.",
                 "The first refusal comes from the database, the next two from the application."),
      etapes: [
        ["story", "base", T("story sans feature", "story without a feature"), T("Une story arrive en base sans feature…", "A story reaches the database without a feature…")],
        ["base", "story", T("✕ refusée", "✕ rejected"), T("… et le déclencheur PostgreSQL la refuse, quel que soit l’écran qui l’envoie.", "… and the PostgreSQL trigger rejects it, whichever screen sent it."), "rejet"],
        ["kanban", "feature", T("✕ impact 0 → en cours", "✕ impact 0 → in progress"), T("Une feature d’impact 0 ne peut pas passer « en cours », ni ses stories.", "A feature with impact 0 cannot move to “in progress”, nor can its stories."), "rejet"],
        ["kanban", "story", T("✕ 6ᵉ story en cours", "✕ 6th story in progress"), T("Au-delà de cinq stories en cours (réglage par défaut), le Kanban bloque.", "Past five stories in progress (default setting), the board blocks."), "rejet"]
      ] },
    { id: "radar", nom: T("Ce que l’outil signale", "What the tool flags"), c: "#f5b94a",
      legende: T("Le Radar et le Copilot Santé repèrent les features sans besoin ; le graphe de dépendances montre les besoins sans feature.",
                 "The Radar and the Health Copilot spot features without a need; the dependency graph shows needs without a feature."),
      etapes: [
        ["radar", "feature", T("impact 0, aucun besoin", "impact 0, no need"), T("Le Radar repère « Classement gamifié des collèges » : impact 0, aucun persona ne l’a demandée.", "The Radar spots “Gamified school ranking”: impact 0, no persona asked for it.")],
        ["trace", "job", T("job sans feature", "job without a feature"), T("Le graphe de dépendances montre un job qu’aucune feature ne sert : comparer prix locaux et prix grossistes.", "The dependency graph shows a job no feature serves: comparing local and wholesale prices.")],
        ["job", "persona", T("retour au besoin", "back to the need"), T("On repart des besoins : revaloriser, archiver, ou servir le besoin oublié.", "Back to the needs: re-rate, archive, or serve the forgotten need.")]
      ] }
  ];

  function el(nom, attrs, parent) {
    var e = document.createElementNS(NS, nom);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function centre(n) { return { x: n.x + W / 2, y: n.y + H / 2 }; }
  function chemin(a, b) {
    var A = NOEUDS[a], B = NOEUDS[b], ca = centre(A), cb = centre(B);
    if (Math.abs(ca.x - cb.x) < 60) {
      var sens = cb.y > ca.y ? 1 : -1;
      var y1 = ca.y + sens * H / 2, y2 = cb.y - sens * H / 2, dx = 0;
      if (Math.abs(ca.y - cb.y) > 200) dx = 70;
      return "M" + (ca.x + dx) + "," + y1 + " C" + (ca.x + dx) + "," + (y1 + sens * 40) + " " + (cb.x + dx) + "," + (y2 - sens * 40) + " " + (cb.x + dx) + "," + y2;
    }
    var d = cb.x > ca.x ? 1 : -1;
    var x1 = ca.x + d * W / 2, x2 = cb.x - d * W / 2, m = (x1 + x2) / 2;
    return "M" + x1 + "," + ca.y + " C" + m + "," + ca.y + " " + m + "," + cb.y + " " + x2 + "," + cb.y;
  }

  /* --- construction du DOM --- */
  var barre = document.createElement("div"); barre.className = "archi-barre";
  var onglets = document.createElement("div"); onglets.className = "archi-onglets"; onglets.setAttribute("role", "tablist");
  var cmd = document.createElement("div"); cmd.className = "archi-commandes";
  var bPause = document.createElement("button"); bPause.type = "button"; bPause.className = "btn btn-ghost"; bPause.textContent = T("Pause", "Pause");
  var bRejouer = document.createElement("button"); bRejouer.type = "button"; bRejouer.className = "btn btn-ghost"; bRejouer.textContent = T("Rejouer", "Replay");
  cmd.appendChild(bPause); cmd.appendChild(bRejouer);
  barre.appendChild(onglets); barre.appendChild(cmd);
  var legende = document.createElement("p"); legende.className = "archi-legende";
  var scene = document.createElement("div"); scene.className = "archi-scene";
  var svg = el("svg", { viewBox: "0 0 1000 560", class: "archi-svg", role: "img", "aria-label": T("Le framework STTNS, du besoin à la tâche", "The STTNS framework, from need to task") });
  scene.appendChild(svg);
  var liste = document.createElement("ol"); liste.className = "archi-etapes";
  var astuce = document.createElement("p"); astuce.className = "archi-astuce"; astuce.textContent = T("← faites glisser le schéma →", "← swipe the diagram →");
  racine.appendChild(barre); racine.appendChild(legende); racine.appendChild(scene); racine.appendChild(astuce); racine.appendChild(liste);

  ZONES.forEach(function (z) {
    el("rect", { x: z.x, y: z.y, width: z.w, height: z.h, rx: 16, class: "archi-zone", stroke: z.c }, svg);
    var t = el("text", { x: z.x + 12, y: z.y + 18, class: "archi-zone-titre", fill: z.c }, svg); t.textContent = z.t;
  });
  var calqueChemins = el("g", {}, svg);
  var dessines = {};
  CAS.forEach(function (c) { c.etapes.forEach(function (e) {
    var k = [e[0], e[1]].sort().join("-");
    if (!dessines[k]) dessines[k] = el("path", { d: chemin(e[0], e[1]), class: "archi-chemin" }, calqueChemins);
  }); });
  var calqueTrace = el("g", {}, svg);
  var gNoeuds = {};
  Object.keys(NOEUDS).forEach(function (k) {
    var n = NOEUDS[k], g = el("g", { class: "archi-noeud" + (n.opt ? " is-optionnel" : "") }, svg);
    el("rect", { x: n.x, y: n.y + (k === "atelier" || k === "api" ? 0 : 0), width: W, height: H, rx: 12, class: "archi-boite" }, g);
    var t1 = el("text", { x: n.x + 14, y: n.y + 27, class: "archi-titre-noeud" }, g); t1.textContent = n.t;
    var t2 = el("text", { x: n.x + 14, y: n.y + 48, class: "archi-sous-titre" }, g); t2.textContent = n.s;
    gNoeuds[k] = g;
  });
  var etiquette = el("g", { class: "archi-etiq", opacity: 0 }, svg);
  var etiqFond = el("rect", { rx: 6, fill: "#070b14", stroke: "rgba(232,236,244,.25)" }, etiquette);
  var etiqTxt = el("text", { class: "archi-etiq-txt", fill: "#f3f5f9" }, etiquette);
  var point = el("circle", { r: 7, opacity: 0 }, svg);

  /* --- lecture --- */
  var cas = CAS[0], i = 0, enPause = false, enCours = false, minuteur = null, raf = null, demarre = false;
  function marquerListe() {
    Array.prototype.forEach.call(liste.children, function (li, j) {
      li.className = j < i ? "is-done" : (j === i ? "is-current" : "");
    });
  }
  function choisir(c) {
    cas = c; i = 0; clearTimeout(minuteur); cancelAnimationFrame(raf); enCours = false;
    Array.prototype.forEach.call(onglets.children, function (b) {
      var actif = b.dataset.id === c.id; b.className = "btn " + (actif ? "btn-primary" : "btn-ghost"); b.setAttribute("aria-selected", actif);
    });
    legende.textContent = c.legende;
    liste.innerHTML = "";
    c.etapes.forEach(function (e) { var li = document.createElement("li"); li.textContent = e[3]; liste.appendChild(li); });
    while (calqueTrace.firstChild) calqueTrace.removeChild(calqueTrace.firstChild);
    var utiles = {};
    c.etapes.forEach(function (e) { utiles[e[0]] = utiles[e[1]] = 1; });
    Object.keys(gNoeuds).forEach(function (k) { gNoeuds[k].classList.toggle("is-muet", !utiles[k]); });
    etiquette.setAttribute("opacity", 0); point.setAttribute("opacity", 0); point.setAttribute("fill", c.c);
    if (reduit) { toutAfficher(); return; }
    if (demarre && !enPause) etape();
  }
  function tracer(e, couleur) {
    var p = el("path", { d: chemin(e[0], e[1]), class: "archi-chemin is-actif archi-trace", style: "stroke:" + couleur + ";color:" + couleur }, calqueTrace);
    return p;
  }
  function toutAfficher() {
    cas.etapes.forEach(function (e) { tracer(e, e[4] ? ROUGE : cas.c); });
    i = cas.etapes.length; marquerListe();
  }
  function poserEtiquette(p, texte) {
    var L = p.getTotalLength(), m = p.getPointAtLength(L / 2);
    etiqTxt.textContent = texte;
    var bb = etiqTxt.getBBox ? null : null;
    etiqTxt.setAttribute("x", m.x); etiqTxt.setAttribute("y", m.y + 4); etiqTxt.setAttribute("text-anchor", "middle");
    var b = etiqTxt.getBBox();
    etiqFond.setAttribute("x", b.x - 8); etiqFond.setAttribute("y", b.y - 4);
    etiqFond.setAttribute("width", b.width + 16); etiqFond.setAttribute("height", b.height + 8);
    etiquette.setAttribute("opacity", 1);
  }
  function pulse(k, rejet) { var g = gNoeuds[k], c = rejet ? "is-rejet" : "is-pulse"; g.classList.remove("is-pulse", "is-rejet"); void g.getBBox(); g.classList.add(c); }
  function etape() {
    if (enPause || enCours) return;
    if (i >= cas.etapes.length) { minuteur = setTimeout(function () { choisir(cas); }, 2600); return; }
    enCours = true; marquerListe();
    var e = cas.etapes[i], p = tracer(e, e[4] ? ROUGE : cas.c), L = p.getTotalLength(), t0 = null, duree = 1100;
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    pulse(e[0]); poserEtiquette(p, e[2]); point.setAttribute("fill", e[4] ? ROUGE : cas.c); point.setAttribute("opacity", 1);
    function anim(ts) {
      if (enPause) { raf = requestAnimationFrame(anim); t0 = null; return; }
      if (t0 === null) t0 = ts - (p._fait || 0) * duree;
      var f = Math.min(1, (ts - t0) / duree); p._fait = f;
      var q = p.getPointAtLength(f * L);
      point.setAttribute("cx", q.x); point.setAttribute("cy", q.y);
      p.style.strokeDashoffset = L * (1 - f);
      if (f < 1) { raf = requestAnimationFrame(anim); return; }
      pulse(e[1], e[4]); point.setAttribute("opacity", 0); i++; enCours = false;
      minuteur = setTimeout(etape, 650);
    }
    raf = requestAnimationFrame(anim);
  }

  CAS.forEach(function (c) {
    var b = document.createElement("button"); b.type = "button"; b.dataset.id = c.id; b.textContent = c.nom; b.setAttribute("role", "tab");
    b.addEventListener("click", function () { enPause = false; bPause.textContent = T("Pause", "Pause"); choisir(c); });
    onglets.appendChild(b);
  });
  bPause.addEventListener("click", function () {
    if (reduit) return;
    enPause = !enPause; bPause.textContent = enPause ? T("Reprendre", "Resume") : T("Pause", "Pause");
    if (!enPause && !enCours) etape();
  });
  bRejouer.addEventListener("click", function () { enPause = false; bPause.textContent = T("Pause", "Pause"); choisir(cas); });
  if (reduit) { bPause.disabled = true; }

  choisir(CAS[0]);
  if (!reduit && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (x) { return x.isIntersecting; }) && !demarre) { demarre = true; io.disconnect(); etape(); }
    }, { threshold: 0.3 });
    io.observe(racine);
  } else if (!reduit) { demarre = true; etape(); }
})();
