import { REGIONS, LEVELS, SUITS, EMBLEMS } from "./content.js";
import { getLesson } from "./lessons.js";
import {
  fresh,
  settingsDefault,
  validate,
  complete,
  calculate,
  money,
  cloudSnapshot,
  exportSave,
  SAVE_KEY,
} from "./engine.js";
import {
  hero,
  robot,
  icon,
  landscape,
  trailHero,
  lantern,
  POSITIONS,
} from "./art.js";
import { mountGame } from "./minigames.js";
import { createSync } from "./sync.js";
import { bootAcademy } from "./academy-client.js";
let academyAccount;

const app = document.querySelector("#app"),
  dialog = document.querySelector("#dialog"),
  toastEl = document.querySelector("#toast");
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let p = fresh(),
  settings = settingsDefault(),
  view = "play",
  region = 0,
  selected = 0,
  choice = null,
  helped = false,
  cleanup = null,
  lastFocus = null,
  toastTimer;
try {
  const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
  if (data) {
    p = validate(data.profile);
    settings = { ...settings, ...data.settings };
  }
} catch {
  toast(
    "The previous save could not be opened. You can restore a backup in Grown-ups.",
  );
}
if (!["GBP", "EUR", "USD"].includes(settings.currency))
  settings.currency = "GBP";
if (![1, 1.15, 1.3].includes(settings.scale)) settings.scale = 1;
region = Math.min(4, Math.floor(p.current / 6));
selected = Math.min(29, p.current);
const fmt = (n) => money(n, settings.currency);
const sync = createSync({ getProfile: () => p, onChange: updateSync });
function toast(t) {
  clearTimeout(toastTimer);
  toastEl.textContent = t;
  toastEl.classList.add("show");
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 4500);
}
function persist(cloud = true) {
  p.updatedAt = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ profile: p, settings }));
  } catch {
    toast("This browser cannot save progress. Export a backup in Grown-ups.");
    return;
  }
  if (cloud && !academyAccount?.isConnected()) sync.changed(cloudSnapshot(p));
}
function applySettings() {
  document.documentElement.style.setProperty("--scale", settings.scale);
  document.body.classList.toggle(
    "reduced",
    settings.reduce || matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
}
function updateSync() {
  const s = sync.status();
  if (academyAccount?.isConnected()) {
    for (const b of document.querySelectorAll('[data-sync-status]'))
      b.innerHTML = `<span class="dot online"></span>Central ChoreQuest account ${icon('link')}`;
    return;
  }
  for (const b of document.querySelectorAll("[data-sync-status]"))
    b.innerHTML = `<span class="dot ${s.connected && !s.blocked ? "online" : ""}"></span>${s.connected ? (s.blocked ? "Reconnect hero" : s.conflict ? "Choose saved journey" : s.pending || s.dirty ? "Journey saved here · sync pending" : "ChoreQuest connected") : "Saved on this device"} ${icon("link")}`;
}
function render() {
  applySettings();
  app.innerHTML = `<header class="header"><a href="./" class="brand" aria-label="Hero Academy MoneyQuest home"><img src="./icon.svg" alt=""><span>HERO ACADEMY<small>MONEYQUEST</small></span></a><nav class="nav" aria-label="Main navigation">${[
    ["play", "Adventure", "map"],
    ["hero", "My hero", "star"],
    ["adult", "Grown-ups", "settings"],
  ]
    .map(
      ([v, label, i]) =>
        `<button data-view="${v}" class="${view === v ? "active" : ""}" ${view === v ? 'aria-current="page"' : ""}>${icon(i)}${label}</button>`,
    )
    .join(
      "",
    )}</nav><button class="profile-pill" data-view="hero"><span class="avatar">${hero(p.colour, p.emblem)}</span><span>${esc(p.name)}</span></button></header><main class="page" id="main" tabindex="-1">${view === "play" ? playView() : view === "hero" ? heroView() : adultView()}<footer class="page-footer"><span>Small steps. Brilliant adventures.</span><button class="sync-pill" data-action="connect" data-sync-status></button></footer></main>`;
  app.querySelectorAll("[data-view]").forEach(
    (b) =>
      (b.onclick = () => {
        view = b.dataset.view;
        render();
        document.querySelector("#main").focus({ preventScroll: true });
      }),
  );
  app
    .querySelectorAll('[data-action="connect"]')
    .forEach((b) => (b.onclick = connection));
  if (view === "play") bindPlay();
  else if (view === "hero") bindHero();
  else bindAdult();
  updateSync();
}
function playView() {
  const r = REGIONS[region],
    level = LEVELS[selected],
    completed = p.done.includes(selected),
    locked = selected > p.current,
    local = p.done.filter((id) => Math.floor(id / 6) === region).length;
  return `<div class="heading-row"><div><p class="eyebrow">THE LANTERN TRAIL</p><h1>${p.current === 30 ? "You brought the light home." : p.started ? "Adventure awaits, hero." : "Your next great adventure."}</h1><p>${p.started ? "Explore. Make choices. Bring the lanterns to life." : "A world to explore. A little wisdom along the way."}</p></div><span class="chapter-pill">${p.done.length} / 30 stops explored</span></div><section class="hud" aria-label="Journey supplies"><div class="stat">${icon("wallet")}<span><small>WALLET</small><strong>${fmt(p.wallet)}</strong></span></div><div class="stat">${icon("jar")}<span><small>SAVED</small><strong>${fmt(p.savings)}</strong></span></div><div class="stat xp">${icon("star")}<span><small>HERO XP</small><strong>${p.xp}</strong></span></div><span class="day">${icon("tent")} Day ${p.day}${p.debt ? " · Owe " + fmt(p.debt) : ""}</span></section><div class="adventure-layout"><section class="world" aria-label="${esc(r.name)} adventure map">${landscape(region, local === 6)}<div class="world-title"><p class="eyebrow">CHAPTER ${region + 1} OF 5</p><h2>${esc(r.name)}</h2><span>${esc(r.skill)}</span></div><div class="map-surface">${LEVELS.filter(
    (l) => l.region === region,
  )
    .map(
      (l, i) =>
        `<button class="stop ${p.done.includes(l.id) ? "done" : l.id === p.current ? "current" : "locked"} ${selected === l.id ? "selected" : ""}" style="left:${POSITIONS[i][0]}%;top:${POSITIONS[i][1]}%" data-stop="${l.id}" aria-label="Stop ${l.number}: ${esc(l.title)}${p.done.includes(l.id) ? ", completed" : l.id > p.current ? ", locked" : ", ready"}" ${selected === l.id ? 'aria-pressed="true"' : 'aria-pressed="false"'}>${p.done.includes(l.id) ? icon("check") : l.id > p.current ? icon("lock") : l.type === "play" ? icon("flag") : l.number}<span class="stop-label">${esc(l.title)}</span></button>`,
    )
    .join(
      "",
    )}</div>${trailHero(p)}<div class="map-legend"><span><i></i>Your next stop</span><span><i class="green"></i>Explored</span></div></section><aside class="quest-card"><div class="quest-meta"><span>${locked ? "UP AHEAD" : completed ? "EXPLORE AGAIN" : "YOUR NEXT QUEST"}</span><span>${level.number} / 30</span></div><div class="quest-art">${icon(level.type === "play" ? "flag" : level.choices[0].icon)}</div><h2>${esc(level.title)}</h2><p>${esc(locked ? "Keep exploring the trail to reach this stop." : level.question)}</p><div class="quest-type">${icon(level.type === "play" ? "flag" : "wallet")}<span>${level.type === "play" ? "Adventure challenge" : esc(level.concept)}</span></div><button class="btn orange" id="go" ${locked ? "disabled" : ""}>${completed ? "Replay" : level.type === "money" ? "Learn & choose" : p.started ? "Go" : "Play"} ${icon("arrow")}</button></aside></div><section class="journey" aria-label="Choose a region"><div class="journey-header"><strong>Your journey</strong><span>${p.done.length} of 30 stops</span></div><div class="region-tabs">${REGIONS.map(
    (r, i) => {
      const d = p.done.filter((id) => Math.floor(id / 6) === i).length;
      return `<button class="region-tab ${region === i ? "active" : ""}" data-region="${i}" ${region === i ? 'aria-current="true"' : ""} aria-label="${esc(r.name)}, ${d} of 6 stops completed"><span class="region-lantern">${lantern(d === 6)}</span><span><strong>${esc(r.name)}</strong><small>${d === 6 ? "✓ Beacon lit" : d + " / 6 stops"}</small></span></button>`;
    },
  ).join(
    "",
  )}</div></section><div class="pip-note"><div>${robot()}</div><p>${p.current === 30 ? "Every lantern is glowing. Visit My hero to see your journey." : "Pip’s tip: " + REGIONS[region].intro}</p></div>`;
}
function bindPlay() {
  app.querySelectorAll("[data-region]").forEach(
    (b) =>
      (b.onclick = () => {
        region = +b.dataset.region;
        selected = Math.max(region * 6, Math.min(region * 6 + 5, p.current));
        render();
      }),
  );
  app.querySelectorAll("[data-stop]").forEach(
    (b) =>
      (b.onclick = () => {
        selected = +b.dataset.stop;
        render();
      }),
  );
  app.querySelector("#go").onclick = () => startLevel(selected);
}
function openDialog(title, html) {
  const wasOpen = dialog.open;
  if (!wasOpen) lastFocus = document.activeElement;
  cleanup?.();
  cleanup = null;
  dialog.innerHTML = `<div class="dialog-head"><h2 id="dialog-title">${esc(title)}</h2><button class="close" id="close-dialog" aria-label="Back to adventure">${icon("close")}</button></div><div class="dialog-content">${html}</div>`;
  dialog.querySelector("#close-dialog").onclick = closeDialog;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}
function closeDialog() {
  cleanup?.();
  cleanup = null;
  globalThis.speechSynthesis?.cancel();
  dialog.close();
  if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
}
dialog.addEventListener("cancel", () => {
  cleanup?.();
  cleanup = null;
  globalThis.speechSynthesis?.cancel();
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (
      e.clientX < box.left ||
      e.clientX > box.right ||
      e.clientY < box.top ||
      e.clientY > box.bottom
    )
      closeDialog();
  }
});
function hear(text) {
  if (!("speechSynthesis" in window)) {
    toast("Speech is not available on this device.");
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  u.voice =
    voices.find(
      (v) =>
        v.lang === "en-GB" && /Samantha|Serena|Kate|Sonia|female/i.test(v.name),
    ) ||
    voices.find((v) => v.lang === "en-GB") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null;
  u.lang = "en-GB";
  u.rate = 0.85;
  speechSynthesis.speak(u);
}
function optionDetail(e = {}) {
  const parts = [];
  if (e.earn) parts.push("Earn " + fmt(e.earn));
  if (e.borrow) parts.push("Borrow " + fmt(e.borrow));
  if (e.spend) parts.push("Pay " + fmt(e.spend));
  if (e.deposit) parts.push("Save up to " + fmt(e.deposit));
  if (e.withdraw) parts.push("Take up to " + fmt(e.withdraw));
  if (e.emergency) parts.push("Pay " + fmt(e.emergency) + " · savings first");
  if (e.interest) parts.push("Savings +5%");
  if (e.repay) parts.push("Repay " + fmt(p.debt));
  if (e.debt) parts.push("Owe " + fmt(e.debt));
  parts.push((e.days || 1) + " day" + ((e.days || 1) > 1 ? "s" : ""));
  return parts.join(" · ");
}
function startLevel(id) {
  if (id > p.current || id < 0 || id >= 30) return;
  selected = id;
  choice = null;
  helped = false;
  const l = LEVELS[id],
    replay = id < p.current;
  if (l.type === "play") {
    openDialog(
      `Stop ${l.number} · ${l.title}`,
      `<div class="activity-top"><div class="picture">${icon("flag")}</div><div><p class="eyebrow">ADVENTURE CHALLENGE${replay ? " · REPLAY" : ""}</p><h2>${esc(l.title)}</h2></div></div><p class="question">${esc(l.question)}</p><div id="game-root"></div><div class="dialog-actions"><button class="btn light" id="game-help">${icon("robot")} Pip, help</button><button class="btn plain" id="listen">${icon("speaker")} Hear</button></div><p class="muted">${replay ? "Replay for fun. Your saved journey stays as it is." : "No lives to lose. Take your time."}</p>`,
    );
    cleanup = mountGame(dialog.querySelector("#game-root"), l.game, {
      level: id,
      gentle: settings.gentle,
      reduce:
        settings.reduce ||
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      onFinish: (s) => finishLevel(id, 0, s),
    });
    dialog.querySelector("#listen").onclick = () => hear(l.question);
    dialog.querySelector("#game-help").onclick = () => {
      cleanup?.();
      cleanup = null;
      openDialog(
        "Pip is here",
        `<div class="outcome"><div class="reward-art">${robot()}</div><h2>We can do it together.</h2><p>Pip can finish this challenge with you.</p><div class="actions" style="justify-content:center"><button class="btn light" id="try-game">Try again</button><button class="btn orange" id="pip-finish">Finish with Pip</button></div></div>`,
      );
      dialog.querySelector("#try-game").onclick = () => startLevel(id);
      dialog.querySelector("#pip-finish").onclick = () =>
        finishLevel(id, 0, true);
    };
    return;
  }
  if (id === 0 && !p.started) {
    renderTrailIntro(l);
    return;
  }
  renderLesson(l, replay);
}
function renderTrailIntro(l) {
  openDialog(
    "Welcome to the Lantern Trail",
    `<section class="lesson-flow intro-flow">
      <div class="lesson-pip"><div class="lesson-robot">${robot()}</div><div><p class="eyebrow">BEFORE YOUR FIRST STOP</p><h2>Let's learn the trail!</h2><p>These are pretend coins. Practise with Pip before making each money choice.</p></div></div>
      <div class="intro-cards">
        <div class="lesson-picture"><div class="lesson-picture-icon">${icon("wallet")}</div><strong>Wallet</strong><span>Coins for now</span></div>
        <div class="lesson-picture"><div class="lesson-picture-icon">${icon("jar")}</div><strong>Savings</strong><span>Coins for later</span></div>
        <div class="lesson-picture"><div class="lesson-picture-icon">${icon("tent")}</div><strong>Days</strong><span>Food and camp cost 2 coins each day</span></div>
      </div>
      <p class="notice">Pip teaches you first. Then you practise. Then you make your choice. You can always ask for help.</p>
      <div class="dialog-actions lesson-actions"><button class="btn light" id="intro-hear">${icon("speaker")} Hear</button><button class="btn orange" id="intro-go">Learn with Pip ${icon("arrow")}</button></div>
      <p class="muted">This is a game, not real pocket money. Trying again never loses coins or XP.</p>
    </section>`,
  );
  dialog.querySelector("#intro-hear").onclick = () =>
    hear("Welcome to the Lantern Trail! Wallet means coins for now. Savings are coins for later. Each game day costs two pretend coins for food and camp. Pip teaches you, then you practise, then you choose. You can always ask for help.");
  dialog.querySelector("#intro-go").onclick = () => renderLesson(l, false);
}
function renderLesson(l, replay) {
  const lesson = getLesson(l.id);
  if (!lesson) {
    toast("Pip could not open this lesson.");
    return;
  }
  openDialog(
    `Learn · ${l.title}`,
    `<section class="lesson-flow" aria-label="Learn before making your money choice">
      <div class="lesson-pip"><div class="lesson-robot">${robot()}</div><div><p class="eyebrow">1 · LEARN</p><h2>${esc(l.concept)}</h2><p>${esc(lesson.explain)}</p></div></div>
      <div class="lesson-pictures">${lesson.pictures.map(([symbol, label, tag]) => `<div class="lesson-picture"><div class="lesson-picture-icon">${icon(symbol)}</div><strong>${esc(label)}</strong><small>${esc(tag)}</small></div>`).join("")}</div>
      <div class="lesson-check"><p class="eyebrow">2 · TRY IT</p><h3>${esc(lesson.ask)}</h3>
      <div class="lesson-answers" role="group" aria-label="Practice your new skill">${lesson.answers.map((answer, i) => `<button class="lesson-answer" type="button" data-lesson-answer="${i}" aria-pressed="false">${esc(answer)}</button>`).join("")}</div>
      <p class="lesson-feedback" id="lesson-feedback" role="status" aria-live="polite"></p></div>
      <div class="dialog-actions lesson-actions"><button type="button" class="btn light" id="lesson-hear">${icon("speaker")} Hear lesson</button><button type="button" class="btn orange lesson-next" id="lesson-continue" hidden>3 · ${replay ? "Practise choices" : "Make your choice"} ${icon("arrow")}</button></div>
      <p class="muted">Practice is free. No coins or XP are won or lost.</p>
    </section>`,
  );
  const feedback = dialog.querySelector("#lesson-feedback");
  const next = dialog.querySelector("#lesson-continue");
  const buttons = [...dialog.querySelectorAll("[data-lesson-answer]")];
  for (const button of buttons) {
    button.onclick = () => {
      const answer = Number(button.dataset.lessonAnswer);
      const correct = answer === lesson.correct;
      for (const other of buttons) {
        other.setAttribute("aria-pressed", String(other === button));
        other.classList.toggle("lesson-correct", correct && other === button);
      }
      feedback.textContent = correct ? "That's it! " + lesson.why : "Good try. " + lesson.hint + " Have another go.";
      feedback.className = correct ? "notice lesson-feedback lesson-right" : "notice hint lesson-feedback";
      next.hidden = !correct;
      if (correct) next.focus({ preventScroll: true });
    };
  }
  dialog.querySelector("#lesson-hear").onclick = () =>
    hear(lesson.explain + " " + lesson.ask + " " + lesson.answers.join(". "));
  next.onclick = () => {
    choice = null;
    helped = false;
    renderChoices(l, replay);
  };
}
function renderChoices(l, replay) {
  openDialog(
    `Stop ${l.number} · ${REGIONS[l.region].name}`,
    `<div class="activity-top"><div class="picture">${icon(l.choices[0].icon)}</div><div><p class="eyebrow">${esc(l.concept)}${replay ? " · PRACTICE" : ""}</p><h2>${esc(l.title)}</h2></div></div><p class="question">${esc(l.question)}</p><div class="activity-tools"><button class="btn light small" id="listen">${icon("speaker")} Hear</button><button class="btn light small" id="help">${icon("robot")} Help</button></div>${helped ? `<p class="notice hint">${esc(l.hint)}</p>` : ""}<div class="choices" role="group" aria-label="Choose your plan">${l.choices.map((c, i) => `<button class="choice ${choice === i ? "selected" : ""}" data-choice="${i}" aria-pressed="${choice === i}">${icon(c.icon)}<span>${esc(c.label)}</span><small>${esc(optionDetail(c.effect))}</small></button>`).join("")}</div><div class="cost-strip" id="preview">${choice === null ? `<span>Every game day: <strong>${fmt(200)}</strong> for food + camp.</span><span>Wallet: <strong>${fmt(p.wallet)}</strong></span>` : choicePreview(l.choices[choice].effect)}</div><div class="dialog-actions"><span class="muted">${replay ? "Practice · no coins or XP change" : "Your choice. Your adventure."}</span><button class="btn orange" id="choose" ${choice === null ? "disabled" : ""}>Choose ${icon("arrow")}</button></div>`,
  );
  dialog.querySelectorAll("[data-choice]").forEach(
    (b) =>
      (b.onclick = () => {
        choice = +b.dataset.choice;
        const scroll = dialog.scrollTop;
        renderChoices(l, replay);
        dialog.scrollTop = scroll;
        dialog
          .querySelector(`[data-choice="${choice}"]`)
          .focus({ preventScroll: true });
      }),
  );
  dialog.querySelector("#listen").onclick = () =>
    hear(
      l.question +
        " " +
        l.choices
          .map((c, i) => i + 1 + ". " + c.label + ". " + optionDetail(c.effect))
          .join(". "),
    );
  dialog.querySelector("#help").onclick = () => {
    helped = true;
    const scroll = dialog.scrollTop;
    renderChoices(l, replay);
    dialog.scrollTop = scroll;
  };
  dialog.querySelector("#choose").onclick = () =>
    finishLevel(l.id, choice, helped);
}
function choicePreview(effect) {
  const result = calculate(p, effect);
  return `<span>${result.days} day${result.days > 1 ? "s" : ""} · living: <strong>${fmt(result.living)}</strong></span><span>Wallet after: <strong>${fmt(result.profile.wallet)}</strong></span><span>Saved: <strong>${fmt(result.profile.savings)}</strong></span>${result.help ? `<span>Academy help: <strong>${fmt(result.help)}</strong></span>` : ""}`;
}
function finishLevel(id, index, supported) {
  cleanup?.();
  cleanup = null;
  const replay = id < p.current,
    l = LEVELS[id];
  let result;
  if (replay) {
    result = {
      points: 0,
      outcome:
        l.choices?.[index]?.outcome || "A little adventure, just for fun.",
      profile: p,
      help: 0,
    };
  } else {
    try {
      result = complete(p, id, index, supported);
      p = result.profile;
      persist(false);
      if (!academyAccount?.isConnected()) {
        sync.enqueue(id);
        sync.changed(cloudSnapshot(p));
        void sync.sync();
      }
    } catch (e) {
      toast(e.message);
      return;
    }
  }
  region = l.region;
  selected = Math.min(29, p.current);
  render();
  const beacon = !replay && p.current % 6 === 0,
    finished = p.current === 30;
  openDialog(
    replay
      ? "Adventure revisited"
      : beacon
        ? "A beacon is glowing!"
        : "A step along the trail",
    `<div class="outcome"><div class="reward-art">${beacon ? lantern(true) : robot()}</div><span class="xp-reward">${icon("star")} ${replay ? "Played for fun" : "+" + result.points + " Hero XP"}</span><h2>${finished ? "The trail is shining." : beacon ? REGIONS[l.region].name + " is glowing!" : "Onwards, hero."}</h2><p>${esc(result.outcome)}</p>${result.help ? `<p class="notice hint">The academy helped with ${fmt(result.help)}. Asking for help keeps your journey moving.</p>` : ""}<div class="outcome-stats"><span>Wallet<strong>${fmt(p.wallet)}</strong></span><span>Savings<strong>${fmt(p.savings)}</strong></span><span>Journey<strong>Day ${p.day}</strong></span></div><button class="btn orange" id="continue">${finished ? "My hero" : beacon ? "Next region" : "Back to trail"} ${icon("arrow")}</button><p class="checkpoint">${beacon ? "A good place for a break. Your journey is saved." : "Saved. You can stop here and come back any time."}</p></div>`,
  );
  dialog.querySelector("#continue").onclick = () => {
    if (finished) view = "hero";
    else if (beacon) region = Math.min(4, l.region + 1);
    else region = Math.min(4, Math.floor(p.current / 6));
    closeDialog();
    render();
  };
}
function heroView() {
  return `<div class="heading-row"><div><p class="eyebrow">HERO HEADQUARTERS</p><h1>My hero</h1><p>A trail of good choices. A hero who is all you.</p></div></div><section class="panel hero-panel"><div class="hero-portrait">${hero(p.colour, p.emblem, true)}<div class="mini-pip">${robot()}</div></div><div><h2>${esc(p.name)}</h2><p class="muted">${p.xp} Hero XP · ${p.done.length} stops explored</p><h3>Suit colour</h3><div class="swatches">${SUITS.map((c, i) => `<button class="swatch" data-colour="${c}" style="background:${c}" aria-label="${["Orange", "Teal", "Blue", "Berry"][i]} suit" aria-pressed="${p.colour === c}"></button>`).join("")}</div><h3>Hero badge</h3><div class="emblems">${EMBLEMS.map((e) => `<button data-emblem="${e}" aria-label="${e} badge" aria-pressed="${p.emblem === e}">${icon(e === "bolt" ? "signal" : e === "diamond" ? "scan" : "star")}</button>`).join("")}</div><h3>Your beacons</h3><div class="badge-row">${REGIONS.map((r, i) => `<div class="badge ${p.done.includes(i * 6 + 5) ? "won" : ""}" aria-label="${esc(r.name)} ${p.done.includes(i * 6 + 5) ? "restored" : "not yet restored"}">${lantern(p.done.includes(i * 6 + 5))}<span>${esc(r.name)}</span></div>`).join("")}</div><div class="connection-card"><h3>${icon("link")} Take your hero with you</h3><p class="muted">A grown-up can connect ChoreQuest to save your journey and new Hero XP.</p><button class="btn" data-action="connect">${sync.status().connected ? "My connection" : "Connect ChoreQuest"} ${icon("arrow")}</button></div></div></section>`;
}
function bindHero() {
  app.querySelectorAll("[data-colour]").forEach(
    (b) =>
      (b.onclick = () => {
        p.colour = b.dataset.colour;
        persist();
        render();
      }),
  );
  app.querySelectorAll("[data-emblem]").forEach(
    (b) =>
      (b.onclick = () => {
        p.emblem = b.dataset.emblem;
        persist();
        render();
      }),
  );
}
function adultView() {
  return `<div class="heading-row"><div><p class="eyebrow">A LITTLE HELP BEHIND THE SCENES</p><h1>Grown-ups</h1><p>Make the adventure work for your hero.</p></div></div><section class="panel"><div class="settings-grid"><div><h2>Your hero</h2><label for="nickname">Nickname</label><input id="nickname" maxlength="24" value="${esc(p.name)}" autocomplete="off"><label for="currency">Pretend-money currency</label><select id="currency">${[
    ["GBP", "Pounds (£)"],
    ["EUR", "Euros (€)"],
    ["USD", "Dollars ($)"],
  ]
    .map(
      ([k, t]) =>
        `<option value="${k}" ${settings.currency === k ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select><p class="muted">Changes the symbol, without currency conversion. All money in this game is pretend.</p></div><div><h2>Comfort and access</h2><label for="text-size">Activity text size</label><select id="text-size">${[
    [1, "Standard"],
    [1.15, "Larger"],
    [1.3, "Largest"],
  ]
    .map(
      ([v, t]) =>
        `<option value="${v}" ${settings.scale === v ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select><label class="check-label"><input id="reduce" type="checkbox" ${settings.reduce ? "checked" : ""}> Reduce animation</label><label class="check-label"><input id="gentle" type="checkbox" ${settings.gentle ? "checked" : ""}> Gentler moving challenges</label><p>Speech starts only when Hear is tapped. Moving challenges start with Play and can be paused. Pip can help finish any action challenge.</p></div></div><section class="adult-section"><h2>How the journey works</h2><div class="adult-copy"><p>30 stops in five regions: 20 money decisions and 10 action challenges. Each stop advances one to three pretend days. Food and camp cost ${fmt(200)} per day. Children practise needs and wants, earning, value, bills, saving, borrowing, scams, giving and planning. There can be more than one reasonable choice.</p><p>Children receive ${50} Hero XP for each first money stop and ${25} for each first action challenge. Replays are practice and do not change the journey economy or earn XP. Help earns the same XP. If money runs short, savings and then academy support keep play moving. Support so far: ${fmt(p.support)}.</p><p>These are simplified practice scenarios, aimed roughly at ages 7–11 with younger players supported by a grown-up. The one-off 5% savings bonus, guaranteed stall sales, borrowing terms and purchase outcomes are fictional examples. There is no real-money trading, gambling, paid reward or financial assessment.</p></div></section><section class="adult-section"><h2>ChoreQuest and saves</h2><p class="adult-copy">Play works without an account. A parent-approved connection can save this hero’s position, wallet, outfit and records to ChoreQuest, then restore them on another connected device. Only newly completed stops send Hero XP. Game coins never become pocket money, and ChoreQuest chore balances are separate. Conflicting journeys require a choice before replacement.</p><div class="actions"><button class="btn" data-action="connect">${icon("link")} ${sync.status().connected ? "Manage connection" : "Connect ChoreQuest"}</button><button class="btn light" id="export">Export backup</button><label class="btn light" for="import" style="margin:0">Restore backup</label><input class="sr-only" type="file" id="import" accept="application/json,.json"></div><p class="muted">Backups contain progress and settings. They never include connection codes or tokens. One local hero per browser; use a separate browser profile for another child.</p></section><section class="adult-section"><h2>Journey record</h2><p class="muted">Records show practice with or without help; completion does not prove mastery. No time-based judgement.</p><ul class="record-list">${p.records.length ? p.records.map((r) => `<li><span>${r.level + 1}. ${esc(LEVELS[r.level].title)}</span><small>${r.supported ? "With support" : "No help requested"}</small></li>`).join("") : "<li>The adventure is ready to begin.</li>"}</ul></section><section class="adult-section"><h2>Privacy</h2><p class="adult-copy">Unconnected progress stays in this browser. This game includes no advertising, analytics or third-party scripts. Connecting sends the hero nickname, outfit, game progress, practice records and new XP events to ChoreQuest. The hosting provider still handles ordinary technical request data. Do not use a child’s full name in a nickname.</p><div class="actions"><a href="https://heroacademy.app" class="btn light" target="_blank" rel="noopener noreferrer">Hero Academy ↗</a><button class="btn light" id="reset">Start a fresh journey</button></div></section></section>`;
}
function bindAdult() {
  document.querySelector("#nickname").onchange = (e) => {
    p.name = e.target.value.trim().slice(0, 24) || "Trail Hero";
    persist();
  };
  for (const [id, key, parse] of [
    ["currency", "currency", String],
    ["text-size", "scale", Number],
  ])
    document.getElementById(id).onchange = (e) => {
      settings[key] = parse(e.target.value);
      persist(false);
      render();
    };
  for (const id of ["reduce", "gentle"])
    document.getElementById(id).onchange = (e) => {
      settings[id] = e.target.checked;
      persist(false);
      applySettings();
    };
  document.querySelector("#export").onclick = download;
  document.querySelector("#import").onchange = restore;
  document.querySelector("#reset").onclick = resetJourney;
}
function download() {
  const blob = new Blob([JSON.stringify(exportSave(p, settings), null, 2)], {
      type: "application/json",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "moneyquest-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Backup exported.");
}
async function restore(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 100000) throw Error("This backup is too large.");
    const d = JSON.parse(await file.text());
    if (d.app !== "hero-academy-moneyquest")
      throw Error("Choose a MoneyQuest backup.");
    const profile = validate(d.profile);
    openDialog(
      "Restore this journey?",
      `<p>This replaces the journey saved on this device. Export your current backup first if you want to keep it.</p><p>${profile.done.length} stops · Day ${profile.day} · ${profile.xp} XP</p><div class="actions"><button class="btn light" id="backup-first">Export current backup</button><button class="btn orange" id="restore-yes">Restore</button></div>`,
    );
    dialog.querySelector("#backup-first").onclick = download;
    dialog.querySelector("#restore-yes").onclick = () => {
      if (sync.status().connected || academyAccount?.isConnected()) {
        toast(
          "Disconnect ChoreQuest before restoring a different local journey.",
        );
        return;
      }
      p = { ...profile, id: crypto.randomUUID() };
      persist(false);
      region = Math.min(4, Math.floor(p.current / 6));
      selected = Math.min(29, p.current);
      closeDialog();
      render();
      toast("Journey restored.");
    };
  } catch (err) {
    toast(err.message);
  } finally {
    e.target.value = "";
  }
}
function resetJourney() {
  openDialog(
    "Start a fresh journey?",
    `<p>Your current device progress will be replaced. A connected ChoreQuest hero must be disconnected first. An exported backup lets you keep this adventure.</p><div class="actions"><button class="btn light" id="backup-first">Export backup</button><button class="btn orange" id="reset-yes">Start fresh</button></div>`,
  );
  dialog.querySelector("#backup-first").onclick = download;
  dialog.querySelector("#reset-yes").onclick = () => {
    if (sync.status().connected || academyAccount?.isConnected()) {
      toast("Disconnect ChoreQuest in My connection first.");
      return;
    }
    p = fresh();
    region = 0;
    selected = 0;
    persist(false);
    closeDialog();
    render();
  };
}
function connection() {
  if (academyAccount?.isConnected()) {
    document.querySelector('.academy-account')?.scrollIntoView({block:'nearest'});
    return;
  }
  sync.start();
  const s = sync.status();
  if (!s.connected) {
    openDialog(
      "Connect ChoreQuest",
      `<div class="activity-top"><div class="picture">${icon("link")}</div><div><p class="eyebrow">OPTIONAL · GROWN-UP APPROVED</p><h2>One hero. More adventures.</h2></div></div><p>Ask a grown-up to open ChoreQuest, choose your hero and make a MoneyQuest connection code.</p><a class="btn light" href="https://chorequest.heroacademy.app/api/games/moneyquest/link" target="_blank" rel="noopener noreferrer">Open ChoreQuest ↗</a><form id="connect-form"><label for="connect-code">Connection code</label><input id="connect-code" maxlength="24" placeholder="ABCD-EFGH-JKLM-NPQR" autocomplete="off" autocapitalize="characters" spellcheck="false" required style="width:100%"><p class="muted">The code works once and expires in 10 minutes. Your game coins stay pretend. Only new Hero XP is credited.</p><p id="connect-status" role="status"></p><button class="btn orange" type="submit" id="connect-submit">Connect hero ${icon("arrow")}</button></form>`,
    );
    dialog.querySelector("#connect-form").onsubmit = async (e) => {
      e.preventDefault();
      const button = dialog.querySelector("#connect-submit"),
        status = dialog.querySelector("#connect-status");
      button.disabled = true;
      try {
        const d = await sync.connect(
          dialog.querySelector("#connect-code").value,
        );
        if (d.save) {
          connection();
        } else {
          p.name = String(d.child.name || p.name).slice(0, 24);
          if (SUITS.includes(d.child.colour)) p.colour = d.child.colour;
          if (EMBLEMS.includes(d.child.emblem)) p.emblem = d.child.emblem;
          persist();
          render();
          connection();
        }
      } catch (err) {
        status.textContent = err.message;
        status.className = "status-error";
        button.disabled = false;
      }
    };
    return;
  }
  const conflict = s.conflict;
  openDialog(
    "My ChoreQuest connection",
    `<h2>${esc(s.name)}</h2><p class="muted">${s.xp} total Hero XP · ${s.gameXP} from MoneyQuest</p><p class="notice">${s.blocked ? "This connection needs replacing. Disconnect here, then ask your grown-up for a new code." : s.error ? esc(s.error) : s.pending || s.dirty ? "Your journey is saved on this device. Pending changes retry when the connection is available." : "Your hero is connected."}</p>${conflict ? `<h3>Choose your journey</h3><p>A ChoreQuest journey is available: <strong>${Number(conflict.state?.current) || 0} stops</strong>. This device has <strong>${p.current} stops</strong>. Choosing one replaces the other journey after confirmation.</p><div class="actions"><button class="btn orange" id="use-cloud">Continue ChoreQuest save</button><button class="btn light" id="use-local">Keep this device’s journey</button></div><p class="muted">Export a backup before replacing a journey you want to keep.</p>` : ""}<p class="muted">${s.pending} new XP events waiting. ${s.lastSync ? "Last synced: " + esc(new Date(s.lastSync).toLocaleString("en-GB")) : "No completed sync on this device yet."}</p><div class="actions"><button class="btn light" id="sync-now">Sync now</button><button class="btn light" id="link-backup">Export backup</button><button class="btn light" id="disconnect">Disconnect</button></div><p class="muted">A grown-up can revoke this device in ChoreQuest. Disconnecting leaves the journey here, and any unsent XP stays local.</p>`,
  );
  dialog.querySelector("#link-backup").onclick = download;
  dialog.querySelector("#sync-now").onclick = async () => {
    dialog.querySelector("#sync-now").disabled = true;
    await sync.sync();
    connection();
  };
  dialog.querySelector("#disconnect").onclick = () => confirmDisconnect(s);
  if (conflict) {
    dialog.querySelector("#use-cloud").onclick = () =>
      confirmJourney(true, conflict);
    dialog.querySelector("#use-local").onclick = () =>
      confirmJourney(false, conflict);
  }
}
function confirmJourney(remote, saved) {
  openDialog(
    remote ? "Continue the ChoreQuest save?" : "Keep this device’s journey?",
    `<p>${remote ? "This device will switch to the journey saved in ChoreQuest." : "This device’s journey will replace the saved ChoreQuest journey."} Your previously credited Hero XP stays in ChoreQuest.</p><div class="actions"><button class="btn light" id="backup-first">Export backup first</button><button class="btn orange" id="confirm-journey">Continue</button></div>`,
  );
  dialog.querySelector("#backup-first").onclick = download;
  dialog.querySelector("#confirm-journey").onclick = () => {
    try {
      if (remote) {
        const id = p.id;
        p = { ...validate(saved.state), id };
        persist(false);
        sync.resolve(true);
        region = Math.min(4, Math.floor(p.current / 6));
        selected = Math.min(29, p.current);
      } else sync.resolve(false, cloudSnapshot(p));
      closeDialog();
      render();
      toast("Your chosen journey is ready.");
    } catch (e) {
      toast("The saved journey could not be opened: " + e.message);
    }
  };
}
function confirmDisconnect(s) {
  openDialog(
    "Disconnect this hero?",
    `<p>The journey stays on this device. ${s.pending || s.dirty ? "Some XP or progress has not synced yet. Disconnecting discards that pending sync." : "Your previously credited XP stays in ChoreQuest."}</p><div class="actions"><button class="btn light" id="cancel-disconnect">Keep connected</button><button class="btn orange" id="yes-disconnect">Disconnect</button></div><p id="disconnect-status" role="status"></p>`,
  );
  dialog.querySelector("#cancel-disconnect").onclick = connection;
  dialog.querySelector("#yes-disconnect").onclick = async () => {
    const b = dialog.querySelector("#yes-disconnect");
    b.disabled = true;
    try {
      await sync.disconnect();
      closeDialog();
      render();
      toast("This device is disconnected.");
    } catch (e) {
      dialog.querySelector("#disconnect-status").textContent = e.message;
      b.disabled = false;
    }
  };
}
render();
let centralRequested = new URLSearchParams(
  globalThis.location?.hash?.slice(1) || "",
).has("academy_launch");
try {
  centralRequested =
    centralRequested ||
    !!JSON.parse(
      localStorage.getItem("hero-academy-central:moneyquest") || '{"links":{}}',
    ).links?.[p.id];
} catch {}
if (centralRequested) {
  sync.stop();
  academyAccount = await bootAcademy({
    game: "moneyquest",
    identity: () => p.id,
    select: (id) => {
      if (p.id !== id) {
        const archived = localStorage.getItem(
          "hero-academy-moneyquest:local:" + id,
        );
        if (!archived) return false;
        localStorage.setItem(
          "hero-academy-moneyquest:local:" + p.id,
          JSON.stringify(p),
        );
        p = validate(JSON.parse(archived));
        persist(false);
      }
      region = Math.min(4, Math.floor(p.current / 6));
      selected = Math.min(29, p.current);
      render();
      return true;
    },
    create: (hero) => {
      localStorage.setItem(
        "hero-academy-moneyquest:local:" + p.id,
        JSON.stringify(p),
      );
      p = fresh();
      p.name = hero.name.slice(0, 24);
      p.colour = hero.colour.toUpperCase();
      p.emblem = hero.emblem;
      p = validate(p);
      persist(false);
      region = 0;
      selected = 0;
      render();
      return p.id;
    },
    connected: () => sync.stop(),
    status: () => updateSync(),
    snapshot: () => cloudSnapshot(p),
    restore: (remote) => {
      const id = p.id;
      p = validate({ ...remote, id });
      region = Math.min(4, Math.floor(p.current / 6));
      selected = Math.min(29, p.current);
      persist(false);
      closeDialog();
      render();
    },
    milestones: () => p.done,
  });
  updateSync();
} else sync.start();
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register("./sw.js").catch(() => {});
