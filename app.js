/* app.js — alle logica en rendering. Vanilla JS, geen build. */
(function () {
  'use strict';

  const { CHALLENGES, LOOSE_QUESTS, THEORY } = window.REPS_CONTENT;
  const STORAGE_KEY = 'social_app_v1';
  const FOCUS_UNLOCK = 10; // daily-reps in focus-tier om volgende tier te ontgrendelen

  // ---------- Datum helpers (lokale datum, YYYY-MM-DD) ----------
  function todayStr(d) {
    d = d || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function addDays(str, n) {
    const [y, m, d] = str.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + n);
    return todayStr(dt);
  }
  function daysBetween(a, b) {
    // hele dagen van a naar b (b - a)
    const [ay, am, ad] = a.split('-').map(Number);
    const [by, bm, bd] = b.split('-').map(Number);
    const da = new Date(ay, am - 1, ad);
    const db = new Date(by, bm - 1, bd);
    return Math.round((db - da) / 86400000);
  }

  // ---------- Storage (alles in try/catch) ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('load faalde', e);
      return null;
    }
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('save faalde', e);
    }
  }

  let state = null;
  let dryNoteText = ''; // droge melding bij gemiste dag, alleen deze sessie

  // ---------- Challenge selectie ----------
  function tiersUpTo(t) {
    const arr = [];
    for (let i = 1; i <= t; i++) arr.push(i);
    return arr;
  }
  function challengesInTier(t) {
    return CHALLENGES.filter((c) => c.tier === t);
  }
  function challengeById(id) {
    return CHALLENGES.find((c) => c.id === id);
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Kies een daily challenge. ~70% uit focus-tier, rest uit lagere actieve tiers.
  // Vermijd avoidId (vorige opdracht).
  function rollChallenge(avoidId) {
    const focus = state.focusTier;
    const lower = tiersUpTo(focus - 1); // [] als focus===1
    let useFocus = lower.length === 0 || Math.random() < 0.7;
    let tier = useFocus ? focus : pick(lower);

    let pool = challengesInTier(tier).filter((c) => c.id !== avoidId);
    if (pool.length === 0) {
      // val terug op alle actieve tiers
      pool = CHALLENGES.filter((c) => c.tier <= focus && c.id !== avoidId);
    }
    if (pool.length === 0) pool = CHALLENGES.filter((c) => c.tier <= focus);
    return pick(pool).id;
  }

  // ---------- Nieuwe dag afhandelen ----------
  function rolloverIfNeeded() {
    const t = todayStr();
    if (state.day === t) return;

    // Streak: gemiste dag(en) sinds laatste rep?
    if (state.lastRepDay) {
      const gap = daysBetween(state.lastRepDay, t);
      if (gap >= 2 && state.streak > 0) {
        // minstens één hele dag overgeslagen
        dryNoteText = `Laatste rep ${gap} dagen geleden. Streak terug op 0.`;
        state.streak = 0;
      }
    }

    // Nieuwe daily + reset
    state.day = t;
    state.todaysChallengeId = rollChallenge(state.todaysChallengeId);
    state.todaysHard = false;
    state.awaitingLog = true;
    state.doneToday = false;
    state.completedTodayCount = 0;

    // Theorie vooruit (op volgorde, wrapt)
    if (state.theoryDay !== t) {
      state.theoryIndex = (state.theoryIndex + 1) % THEORY.length;
      state.theoryDay = t;
    }
    save();
  }

  // ---------- Rep loggen (kern) ----------
  function logRep(type, challengeId, hard, looseId) {
    const t = todayStr();

    // Streak
    if (state.lastRepDay === t) {
      // al een rep vandaag, streak ongemoeid
    } else if (state.lastRepDay && daysBetween(state.lastRepDay, t) === 1) {
      state.streak += 1;
    } else {
      state.streak = 1;
    }
    state.lastRepDay = t;
    dryNoteText = ''; // er is weer een rep, droge melding weg

    state.totalReps += 1;

    // History entry
    const entry = { day: t, type: type, hard: !!hard };
    if (type === 'daily') entry.challengeId = challengeId;
    if (type === 'loose') entry.looseId = looseId;
    state.history.push(entry);

    // Focus-reps tellen alleen voor daily in de focus-tier
    if (type === 'daily') {
      const ch = challengeById(challengeId);
      if (ch && ch.tier === state.focusTier && state.focusTier < 3) {
        state.focusReps += 1;
        if (state.focusReps >= FOCUS_UNLOCK) {
          state.focusTier += 1;
          state.focusReps = 0;
        }
      }
    }
    save();
  }

  // ---------- Render ----------
  const $ = (id) => document.getElementById(id);

  function renderStats() {
    $('stat-streak').textContent = state.streak;
    $('stat-streak').classList.toggle('streak-active', state.streak > 0);
    $('stat-total').textContent = state.totalReps;
    $('stat-tier').textContent = state.focusTier;

    const note = $('dry-note');
    if (dryNoteText) {
      note.textContent = dryNoteText;
      note.hidden = false;
    } else {
      note.hidden = true;
    }
  }

  const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#248A3D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function renderChallenge() {
    const el = $('challenge-card');

    if (state.awaitingLog) {
      const ch = challengeById(state.todaysChallengeId);
      el.innerHTML = `
        <span class="tier-badge">Tier ${ch.tier}</span>
        <p class="challenge-text">${escapeHtml(ch.text)}</p>
        <p class="challenge-why">${escapeHtml(ch.why)}</p>
        <div class="hard-toggle" id="hard-toggle">
          <span class="hard-toggle-label">Dit vond ik eng. Toch gedaan.</span>
          <button class="switch" id="hard-switch" role="switch"
            aria-checked="${state.todaysHard ? 'true' : 'false'}"
            aria-label="Dit vond ik eng, toch gedaan"></button>
        </div>
        <button class="btn-primary" id="done-btn">Gedaan</button>
        <div class="reroll-row">
          <button class="btn-secondary" id="reroll-btn">Andere opdracht</button>
        </div>`;

      $('hard-toggle').addEventListener('click', (e) => {
        if (e.target.closest('#hard-switch')) return; // switch handelt zelf
        toggleHard();
      });
      $('hard-switch').addEventListener('click', toggleHard);
      $('done-btn').addEventListener('click', onDone);
      $('reroll-btn').addEventListener('click', onReroll);
    } else {
      // Confirmation state (na Gedaan)
      const count = state.completedTodayCount;
      const countLine = count > 1 ? `<p class="today-count">${count} reps vandaag.</p>` : '';
      el.innerHTML = `
        <div class="confirm">
          <div class="confirm-mark">${CHECK_SVG}</div>
          <p class="confirm-text">Gelogd. Uitkomst telt niet.</p>
          <p class="confirm-sub">Dagstreak binnen.</p>
          <button class="btn-primary" id="another-btn">Nog een</button>
          ${countLine}
        </div>`;
      $('another-btn').addEventListener('click', onAnother);
    }
    renderTierProgress();
  }

  function renderTierProgress() {
    const el = $('tier-progress');
    if (state.focusTier >= 3) {
      el.textContent = 'Tier 3 actief. Hoogste niveau.';
    } else {
      const left = FOCUS_UNLOCK - state.focusReps;
      el.textContent = `Nog ${left} ${left === 1 ? 'rep' : 'reps'} tot Tier ${state.focusTier + 1}.`;
    }
  }

  function toggleHard() {
    state.todaysHard = !state.todaysHard;
    save();
    const sw = $('hard-switch');
    if (sw) sw.setAttribute('aria-checked', state.todaysHard ? 'true' : 'false');
  }

  function onDone() {
    logRep('daily', state.todaysChallengeId, state.todaysHard);
    state.awaitingLog = false;
    state.doneToday = true;
    state.completedTodayCount += 1;
    save();
    renderChallenge();
    renderStats();
    renderActivity();
  }

  function onAnother() {
    state.todaysChallengeId = rollChallenge(state.todaysChallengeId);
    state.todaysHard = false;
    state.awaitingLog = true;
    save();
    renderChallenge();
  }

  function onReroll() {
    state.todaysChallengeId = rollChallenge(state.todaysChallengeId);
    save();
    renderChallenge();
  }

  // ---------- Losse quests ----------
  function renderLoose() {
    renderQuestList('loose-soc', LOOSE_QUESTS.filter((q) => q.cat === 'soc'));
    renderQuestList('loose-date', LOOSE_QUESTS.filter((q) => q.cat === 'date'));
  }
  function renderQuestList(containerId, quests) {
    const el = $(containerId);
    el.innerHTML = quests
      .map((q) => {
        const n = state.looseCounts[q.id] || 0;
        return `<div class="quest-row" data-loose="${q.id}" role="button" tabindex="0">
          <span class="quest-text">${escapeHtml(q.text)}</span>
          <span class="quest-count ${n > 0 ? 'done' : ''}">${n}x</span>
        </div>`;
      })
      .join('');
    el.querySelectorAll('.quest-row').forEach((row) => {
      const id = row.getAttribute('data-loose');
      row.addEventListener('click', () => logLoose(id, row));
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          logLoose(id, row);
        }
      });
    });
  }
  function logLoose(id, row) {
    state.looseCounts[id] = (state.looseCounts[id] || 0) + 1;
    logRep('loose', null, false, id);
    // update count inline + flash
    const countEl = row.querySelector('.quest-count');
    countEl.textContent = `${state.looseCounts[id]}x`;
    countEl.classList.add('done');
    row.classList.remove('quest-flash');
    void row.offsetWidth; // restart animatie
    row.classList.add('quest-flash');
    renderStats();
    renderActivity();
  }

  // ---------- Theorie ----------
  function renderTheory() {
    const el = $('theory-card');
    const card = THEORY[state.theoryIndex];
    const open = !!state.theoryOpen;
    el.classList.toggle('open', open);
    el.innerHTML = `
      <div class="theory-head" id="theory-head" role="button" tabindex="0"
           aria-expanded="${open ? 'true' : 'false'}">
        <h3 class="theory-title">${escapeHtml(card.title)}</h3>
        <svg class="theory-chevron" width="12" height="18" viewBox="0 0 12 18" fill="none">
          <path d="M2 2l8 7-8 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="theory-body">
        <p class="theory-text">${escapeHtml(card.body)}</p>
        <p class="theory-source">${escapeHtml(card.source)}</p>
      </div>`;
    const head = $('theory-head');
    head.addEventListener('click', toggleTheory);
    head.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheory();
      }
    });
  }
  function toggleTheory() {
    state.theoryOpen = !state.theoryOpen;
    save();
    const el = $('theory-card');
    el.classList.toggle('open', state.theoryOpen);
    $('theory-head').setAttribute('aria-expanded', state.theoryOpen ? 'true' : 'false');
  }

  // ---------- Activity (laatste 5 weken, stippen) ----------
  function renderActivity() {
    const el = $('activity');
    const WEEKS = 5;
    const TOTAL = WEEKS * 7;
    const t = todayStr();

    // dagen met reps + dagen met een eng-rep
    const repDays = new Set();
    const hardDays = new Set();
    state.history.forEach((h) => {
      repDays.add(h.day);
      if (h.hard) hardDays.add(h.day);
    });

    // raster eindigt vandaag; begin TOTAL-1 dagen terug
    let html = '';
    for (let i = TOTAL - 1; i >= 0; i--) {
      const day = addDays(t, -i);
      const cls = ['dot'];
      if (repDays.has(day)) cls.push(hardDays.has(day) ? 'hard' : 'filled');
      if (day === t) cls.push('today');
      html += `<span class="${cls.join(' ')}" title="${day}"></span>`;
    }
    el.innerHTML = html;

    const activeDays = repDays.size;
    $('activity-caption').textContent =
      activeDays === 0
        ? 'Nog geen dagen met een rep.'
        : `${activeDays} ${activeDays === 1 ? 'dag' : 'dagen'} met minstens één rep.`;
  }

  // ---------- Bewijs ----------
  function renderEvidence() {
    const el = $('evidence-list');
    if (!state.evidence.length) {
      el.innerHTML = '<li class="evidence-empty">Nog geen entries.</li>';
      return;
    }
    const items = [...state.evidence].sort((a, b) => b.id - a.id);
    el.innerHTML = items
      .map(
        (e) => `<li class="evidence-item">
          <div class="evidence-body">
            <p class="evidence-entry-text">${escapeHtml(e.text)}</p>
            <span class="evidence-date">${formatDate(e.day)}</span>
          </div>
          <button class="evidence-del" data-id="${e.id}" aria-label="Verwijder entry">&times;</button>
        </li>`
      )
      .join('');
    el.querySelectorAll('.evidence-del').forEach((btn) => {
      btn.addEventListener('click', () => deleteEvidence(Number(btn.getAttribute('data-id'))));
    });
  }
  function addEvidence() {
    const ta = $('evidence-text');
    const text = ta.value.trim();
    if (!text) return;
    state.evidence.push({ id: Date.now(), day: todayStr(), text: text });
    save();
    ta.value = '';
    renderEvidence();
  }
  function deleteEvidence(id) {
    state.evidence = state.evidence.filter((e) => e.id !== id);
    save();
    renderEvidence();
  }

  // ---------- Data: export / import ----------
  function exportData() {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reps-backup-${todayStr()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('export faalde', e);
      alert('Exporteren lukte niet op dit toestel.');
    }
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try {
        data = JSON.parse(reader.result);
      } catch (e) {
        alert('Kon de backup niet lezen. Geen geldig bestand.');
        return;
      }
      if (!data || !data.calibration || !Array.isArray(data.history)) {
        alert('Dit lijkt geen geldige Reps-backup.');
        return;
      }
      if (!confirm('Backup importeren? Dit vervangt je huidige voortgang op dit toestel.')) return;
      state = normalize(data);
      save();
      rolloverIfNeeded();
      renderAll();
    };
    reader.onerror = () => alert('Kon het bestand niet openen.');
    reader.readAsText(file);
  }

  // ---------- Helpers ----------
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function formatDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return `${d} ${months[m - 1]} ${y}`;
  }

  // ---------- Init / onboarding ----------
  function freshState(calibration) {
    const focusTier = calibration === 'begin' ? 1 : calibration === 'verder' ? 2 : 3;
    const t = todayStr();
    const s = {
      version: 1,
      startedOn: t,
      calibration: calibration,
      focusTier: focusTier,
      focusReps: 0,
      day: t,
      todaysChallengeId: null,
      todaysHard: false,
      awaitingLog: true,
      doneToday: false,
      completedTodayCount: 0,
      theoryIndex: 0,
      theoryDay: t,
      totalReps: 0,
      streak: 0,
      lastRepDay: null,
      history: [],
      looseCounts: {},
      evidence: [],
      theoryOpen: false,
    };
    state = s;
    state.todaysChallengeId = rollChallenge(null);
    save();
  }

  // Migratie / defaults voor bestaande state
  function normalize(s) {
    s.looseCounts = s.looseCounts || {};
    s.evidence = s.evidence || [];
    s.history = s.history || [];
    if (typeof s.awaitingLog !== 'boolean') s.awaitingLog = !s.doneToday;
    if (typeof s.theoryOpen !== 'boolean') s.theoryOpen = false;
    if (typeof s.completedTodayCount !== 'number') s.completedTodayCount = 0;
    if (!s.todaysChallengeId || !challengeById(s.todaysChallengeId)) {
      state = s;
      s.todaysChallengeId = rollChallenge(null);
    }
    return s;
  }

  function renderAll() {
    renderStats();
    renderChallenge();
    renderLoose();
    renderTheory();
    renderActivity();
    renderEvidence();
  }

  function startApp() {
    rolloverIfNeeded();
    $('onboarding').hidden = true;
    $('app').hidden = false;
    $('evidence-add').addEventListener('click', addEvidence);
    $('export-btn').addEventListener('click', exportData);
    $('import-btn').addEventListener('click', () => $('import-file').click());
    $('import-file').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importData(file);
      e.target.value = ''; // zelfde bestand opnieuw kunnen kiezen
    });
    renderAll();
  }

  function initOnboarding() {
    const ob = $('onboarding');
    ob.hidden = false;
    ob.querySelectorAll('.calib-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        freshState(btn.getAttribute('data-calib'));
        startApp();
      });
    });
  }

  // ---------- Boot ----------
  function boot() {
    const existing = load();
    if (existing && existing.calibration) {
      state = normalize(existing);
      save();
      startApp();
    } else {
      initOnboarding();
    }
  }

  // Service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  // Detecteer dagwissel als app op de achtergrond stond
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state && state.calibration) {
      if (state.day !== todayStr()) {
        rolloverIfNeeded();
        renderAll();
      }
    }
  });

  document.addEventListener('DOMContentLoaded', boot);
})();
