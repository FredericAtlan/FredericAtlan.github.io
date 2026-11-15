/* Planche d'architecture animée CycleGen (FR/EN selon <html lang>). */
(function () {
  "use strict";
  var racine = document.getElementById("archi-cyclegen");
  if (!racine) return;
  var EN = (document.documentElement.lang || "fr").slice(0, 2) === "en";
  function T(fr, en) { return EN ? en : fr; }
  var NS = "http://www.w3.org/2000/svg";
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 200, H = 64;
  var NOEUDS = {
    atelier:  { x: 30,  y: 70,  t: T("Atelier web", "Web workbench"), s: "Next.js · Leaflet" },
    vehicule: { x: 30,  y: 220, t: T("Modèle véhicule", "Vehicle model"), s: T("forces, couple, puissance", "forces, torque, power") },
    script:   { x: 30,  y: 400, t: T("Script ou pipeline", "Script or pipeline"), s: T("appel HTTP, sans écran", "HTTP calls, no screen") },
    api:      { x: 400, y: 70,  t: "API FastAPI", s: T("serveur Python", "Python server") },
    corridor: { x: 400, y: 220, t: "Corridor", s: T("gardé en mémoire 1 h", "kept in memory 1 h") },
    idm:      { x: 400, y: 400, t: T("Solveur conducteur", "Driver solver"), s: "IDM · Eco / Normal / Sportif" },
    photon:   { x: 770, y: 30,  t: "Photon", s: T("adresses → GPS", "addresses → GPS") },
    osrm:     { x: 770, y: 120, t: "OSRM", s: T("itinéraire", "routing") },
    altitude: { x: 770, y: 210, t: T("Altitude", "Elevation"), s: "Open-Meteo · OpenTopoData" },
    overpass: { x: 770, y: 300, t: "Overpass (OSM)", s: T("feux, limitations", "lights, speed limits") },
    mapbox:   { x: 770, y: 400, t: "Mapbox", s: T("trafic, option avec clé", "traffic, optional key"), opt: true }
  };
  var ZONES = [
    { x: 15,  y: 40,  w: 230, h: 270, t: T("NAVIGATEUR", "BROWSER"), c: "#45a99c" },
    { x: 385, y: 40,  w: 230, h: 450, t: T("SERVEUR (RENDER)", "SERVER (RENDER)"), c: "#7aa2ff" },
    { x: 755, y: 0,   w: 230, h: 490, t: T("SERVICES CARTOGRAPHIQUES", "MAPPING SERVICES"), c: "#b48cff" }
  ];
  var CAS = [
    { id: "trajet", nom: T("Nouveau trajet", "New route"), c: "#7aa2ff",
      legende: T("La voie lente : une seule fois par trajet, le serveur interroge les services cartographiques et construit le corridor.",
                 "The slow lane: once per route, the server queries the mapping services and builds the corridor."),
      etapes: [
        ["atelier", "api", "POST /api/route/analyze", T("L’atelier envoie le départ et l’arrivée.", "The workbench sends start and destination.")],
        ["api", "photon", T("adresse → GPS", "address → GPS"), T("Les adresses deviennent des points GPS (Nominatim en secours).", "Addresses become GPS points (Nominatim as fallback).")],
        ["api", "osrm", T("itinéraire", "route"), T("OSRM trace la route et donne des vitesses de base.", "OSRM draws the route and returns base speeds.")],
        ["api", "altitude", T("altitude", "elevation"), T("Le profil d’altitude est échantillonné le long du tracé.", "The elevation profile is sampled along the path.")],
        ["api", "overpass", T("feux, limitations", "lights, limits"), T("OpenStreetMap fournit les feux et les limitations de vitesse.", "OpenStreetMap supplies traffic lights and speed limits.")],
        ["atelier", "api", "POST /api/corridor/build", T("L’atelier demande la construction du corridor.", "The workbench asks for the corridor.")],
        ["api", "corridor", T("pente, courbure, enveloppe", "gradient, curvature, envelope"), T("Pente lissée, courbure et enveloppe de vitesse sont gardées en mémoire.", "Smoothed gradient, curvature and speed envelope are kept in memory.")],
        ["api", "atelier", T("corridor prêt", "corridor ready"), T("La carte affiche le tracé et ses limites.", "The map shows the path and its limits.")]
      ] },
    { id: "conducteur", nom: T("Changer de conducteur", "Change driver"), c: "#45a99c",
      legende: T("La voie rapide : le corridor est déjà en mémoire, aucun service extérieur n’est rappelé.",
                 "The fast lane: the corridor is already in memory, no external service is called."),
      etapes: [
        ["atelier", "api", "POST /api/simulate/start", T("Nouveau profil de conducteur : Eco, Normal ou Sportif.", "New driver profile: Eco, Normal or Sportif.")],
        ["corridor", "idm", T("corridor en cache", "cached corridor"), T("Le solveur relit le corridor sans rappeler les services.", "The solver reads the corridor without calling the services again.")],
        ["idm", "api", "t, v, s, a", T("Le conducteur IDM roule sous l’enveloppe, seconde par seconde.", "The IDM driver runs under the envelope, second by second.")],
        ["api", "atelier", T("cycle", "cycle"), T("Le cycle revient à l’atelier.", "The cycle comes back to the workbench.")],
        ["atelier", "vehicule", T("forces", "forces"), T("Forces, couple et puissance sont calculés dans le navigateur.", "Forces, torque and power are computed in the browser.")]
      ] },
    { id: "vehicule", nom: T("Changer de véhicule", "Change vehicle"), c: "#f5b94a",
      legende: T("Tout se passe dans l’atelier : aucun appel au serveur.",
                 "Everything happens in the workbench: no server call."),
      etapes: [
        ["atelier", "vehicule", T("masse, F0 F1 F2, rayon", "mass, F0 F1 F2, radius"), T("Seuls changent la masse, la loi de route et le rayon de roue.", "Only mass, road-load law and wheel radius change.")],
        ["vehicule", "atelier", T("forces, couple, puissance", "forces, torque, power"), T("Recalcul instantané des courbes, le cycle reste le même.", "Curves are recomputed instantly; the cycle stays the same.")]
      ] },
    { id: "serie", nom: T("Série par script", "Batch by script"), c: "#b48cff",
      legende: T("Pour une base de roulages : un script enchaîne les mêmes appels HTTP, sans écran.",
                 "For a driving database: a script chains the same HTTP calls, with no screen."),
      etapes: [
        ["script", "api", T("analyze + build", "analyze + build"), T("Le script envoie une liste de trajets.", "The script sends a list of routes.")],
        ["api", "osrm", T("itinéraires", "routes"), T("Les services cartographiques sont appelés pour chaque trajet.", "Mapping services are called for each route.")],
        ["api", "corridor", "corridors", T("Chaque corridor est gardé en mémoire.", "Each corridor is kept in memory.")],
        ["corridor", "idm", T("simulation", "simulation"), T("Le solveur produit un cycle par trajet et par conducteur.", "The solver produces one cycle per route and driver.")],
        ["api", "script", "POST /api/export → CSV", T("Les cycles repartent en CSV vers la base de roulages.", "Cycles go back as CSV into the driving database.")]
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
  var svg = el("svg", { viewBox: "0 0 1000 500", class: "archi-svg", role: "img", "aria-label": T("Architecture de CycleGen", "CycleGen architecture") });
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
    cas.etapes.forEach(function (e) { tracer(e, cas.c); });
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
  function pulse(k) { var g = gNoeuds[k]; g.classList.remove("is-pulse"); void g.getBBox(); g.classList.add("is-pulse"); }
  function etape() {
    if (enPause || enCours) return;
    if (i >= cas.etapes.length) { minuteur = setTimeout(function () { choisir(cas); }, 2600); return; }
    enCours = true; marquerListe();
    var e = cas.etapes[i], p = tracer(e, cas.c), L = p.getTotalLength(), t0 = null, duree = 1100;
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    pulse(e[0]); poserEtiquette(p, e[2]); point.setAttribute("opacity", 1);
    function anim(ts) {
      if (enPause) { raf = requestAnimationFrame(anim); t0 = null; return; }
      if (t0 === null) t0 = ts - (p._fait || 0) * duree;
      var f = Math.min(1, (ts - t0) / duree); p._fait = f;
      var q = p.getPointAtLength(f * L);
      point.setAttribute("cx", q.x); point.setAttribute("cy", q.y);
      p.style.strokeDashoffset = L * (1 - f);
      if (f < 1) { raf = requestAnimationFrame(anim); return; }
      pulse(e[1]); point.setAttribute("opacity", 0); i++; enCours = false;
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
