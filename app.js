/* app.js — alle logica en rendering. Vanilla JS, geen build. */
(function () {
  'use strict';

  const { CHALLENGES, LOOSE_QUESTS, THEORY, TIER_NAMES } = window.REPS_CONTENT;
  const STORAGE_KEY = 'social_app_v1';
  const FOCUS_UNLOCK = 10;
  const REMINDER_OPTIONS = ['08:00', '12:00', '18:00', '21:00'];

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
    const [ay, am, ad] = a.split('-').map(Number);
    const [by, bm, bd] = b.split('-').map(Number);
    const da = new Date(ay, am - 1, ad);
    const db = new Date(by, bm - 1, bd);
    return Math.round((db - da) / 86400000);
  }
  function mondayOfWeek(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dow = dt.getDay(); // 0=zo, 1=ma
    const diff = dow === 0 ? -6 : 1 - dow;
    dt.setDate(dt.getDate() + diff);
    return todayStr(dt);
  }

  // ---------- Storage ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
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

  // ---------- Challenge selectie ----------
  function tiersUpTo(t) {
    const arr = [];
    for (let i = 1; i <= t; i++) arr.push(i);
    return arr;
  }
  function challengesInTier(t) {
    // daily: nooit ctx:'uit' serveren
    return CHALLENGES.filter((c) => c.tier === t && c.ctx !== 'uit');
  }
  function challengeById(id) {
    return CHALLENGES.find((c) => c.id === id);
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function rollChallenge(avoidId) {
    const focus = state.focusTier;
    const lower = tiersUpTo(focus - 1);
    let useFocus = lower.length === 0 || Math.random() < 0.7;
    let tier = useFocus ? focus : pick(lower);

    let pool = challengesInTier(tier).filter((c) => c.id !== avoidId);
    if (pool.length === 0) {
      pool = CHALLENGES.filter((c) => c.tier <= focus && c.ctx !== 'uit' && c.id !== avoidId);
    }
    if (pool.length === 0) pool = CHALLENGES.filter((c) => c.tier <= focus && c.ctx !== 'uit');
    return pick(pool).id;
  }

  // ---------- Week-metric ----------
  function weekReps() {
    const monday = mondayOfWeek(todayStr());
    return state.history.filter((h) => h.day >= monday).length;
  }

  // ---------- Nieuwe dag afhandelen ----------
  function rolloverIfNeeded() {
    const t = todayStr();
    if (state.day === t) return;

    state.day = t;
    state.todaysChallengeId = rollChallenge(state.todaysChallengeId);
    state.todaysHard = false;
    state.awaitingLog = true;
    state.doneToday = false;
    state.completedTodayCount = 0;

    if (state.theoryDay !== t) {
      state.theoryIndex = (state.theoryIndex + 1) % THEORY.length;
      state.theoryDay = t;
    }
    save();
  }

  // ---------- Rep loggen ----------
  function logRep(type, challengeId, hard, looseId) {
    const t = todayStr();
    state.lastRepDay = t;
    state.totalReps += 1;

    const entry = { day: t, type: type, hard: !!hard };
    if (type === 'daily') entry.challengeId = challengeId;
    if (type === 'loose') entry.looseId = looseId;
    state.history.push(entry);

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
    const wr = weekReps();
    $('stat-week').textContent = wr;
    $('stat-week').classList.toggle('streak-active', wr > 0);
    $('stat-total').textContent = state.totalReps;
    $('stat-tier').textContent = state.focusTier;
    $('dry-note').hidden = true;
  }

  const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#248A3D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function renderChallenge() {
    const el = $('challenge-card');
    if (state.awaitingLog) {
      const ch = challengeById(state.todaysChallengeId);
      const tierName = TIER_NAMES[ch.tier] || '';
      el.innerHTML = `
        <span class="tier-badge">Tier ${ch.tier} · ${escapeHtml(tierName)}</span>
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
        if (e.target.closest('#hard-switch')) return;
        toggleHard();
      });
      $('hard-switch').addEventListener('click', toggleHard);
      $('done-btn').addEventListener('click', onDone);
      $('reroll-btn').addEventListener('click', onReroll);
    } else {
      const count = state.completedTodayCount;
      const countLine = count > 1 ? `<p class="today-count">${count} reps vandaag.</p>` : '';
      el.innerHTML = `
        <div class="confirm">
          <div class="confirm-mark">${CHECK_SVG}</div>
          <p class="confirm-text">Gelogd. Uitkomst telt niet.</p>
          <p class="confirm-sub">Rep binnen.</p>
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
      el.textContent = `Tier 3 · ${TIER_NAMES[3]} actief. Hoogste niveau.`;
    } else {
      const left = FOCUS_UNLOCK - state.focusReps;
      el.textContent = `Nog ${left} ${left === 1 ? 'rep' : 'reps'} tot Tier ${state.focusTier + 1} · ${TIER_NAMES[state.focusTier + 1]}.`;
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
    const today = todayStr();
    el.innerHTML = quests
      .map((q) => {
        const total = state.looseCounts[q.id] || 0;
        let countHtml;
        if (q.target) {
          const todayCount = state.history.filter(
            (h) => h.type === 'loose' && h.looseId === q.id && h.day === today
          ).length;
          const done = todayCount >= q.target;
          countHtml = `<span class="quest-count ${done ? 'done' : ''}">${todayCount}/${q.target} vandaag</span>`;
        } else {
          countHtml = `<span class="quest-count ${total > 0 ? 'done' : ''}">${total}x</span>`;
        }
        return `<div class="quest-row" data-loose="${q.id}" role="button" tabindex="0">
          <span class="quest-text">${escapeHtml(q.text)}</span>
          ${countHtml}
        </div>`;
      })
      .join('');
    el.querySelectorAll('.quest-row').forEach((row) => {
      const id = row.getAttribute('data-loose');
      row.addEventListener('click', () => logLoose(id));
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          logLoose(id);
        }
      });
    });
  }

  function logLoose(id) {
    state.looseCounts[id] = (state.looseCounts[id] || 0) + 1;
    logRep('loose', null, false, id);
    renderLoose();
    renderStats();
    renderActivity();
    // flash de nieuwe rij
    const newRow = document.querySelector(`[data-loose="${id}"]`);
    if (newRow) {
      newRow.classList.remove('quest-flash');
      void newRow.offsetWidth;
      newRow.classList.add('quest-flash');
    }
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

  // ---------- Activity ----------
  function renderActivity() {
    const el = $('activity');
    const WEEKS = 5;
    const TOTAL = WEEKS * 7;
    const t = todayStr();

    const repDays = new Set();
    const hardDays = new Set();
    state.history.forEach((h) => {
      repDays.add(h.day);
      if (h.hard) hardDays.add(h.day);
    });

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

  // ---------- Herinneringen (.ics) ----------
  function renderReminders() {
    const el = $('reminder-times');
    if (!el) return;
    const selected = state.reminders || [];
    el.innerHTML = REMINDER_OPTIONS.map((t) => {
      const checked = selected.includes(t);
      return `<label class="reminder-option">
        <input type="checkbox" class="reminder-check" data-time="${t}" ${checked ? 'checked' : ''} />
        <span>${t}</span>
      </label>`;
    }).join('');
    el.querySelectorAll('.reminder-check').forEach((cb) => {
      cb.addEventListener('change', () => {
        const time = cb.getAttribute('data-time');
        if (cb.checked) {
          if (!state.reminders.includes(time)) state.reminders.push(time);
        } else {
          state.reminders = state.reminders.filter((t) => t !== time);
        }
        save();
      });
    });
  }

  function generateIcs() {
    const times = (state.reminders || []).slice().sort();
    if (!times.length) {
      alert('Selecteer eerst minstens één tijd.');
      return;
    }
    const today = todayStr();
    const [y, m, d] = today.split('-').map(Number);
    const pad = (n) => String(n).padStart(2, '0');

    let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Reps//NL\r\nCALSCALE:GREGORIAN\r\n';
    times.forEach((time) => {
      const [hh, mm] = time.split(':');
      const dtStr = `${y}${pad(m)}${pad(d)}T${hh}${mm}00`;
      ics += 'BEGIN:VEVENT\r\n';
      ics += `UID:reps-${time.replace(':', '')}-${today}@repsapp\r\n`;
      ics += `DTSTART;TZID=Europe/Amsterdam:${dtStr}\r\n`;
      ics += 'RRULE:FREQ=DAILY\r\n';
      ics += 'SUMMARY:Reps — dagelijkse rep\r\n';
      ics += 'DESCRIPTION:Open de app en pak je rep.\r\n';
      ics += 'BEGIN:VALARM\r\n';
      ics += 'TRIGGER:-PT0M\r\n';
      ics += 'ACTION:DISPLAY\r\n';
      ics += 'DESCRIPTION:Reps — dagelijkse rep\r\n';
      ics += 'END:VALARM\r\n';
      ics += 'END:VEVENT\r\n';
    });
    ics += 'END:VCALENDAR';

    try {
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reps-herinneringen.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Downloaden lukte niet op dit toestel.');
    }
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
    state = {
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
      reminders: [],
    };
    state.todaysChallengeId = rollChallenge(null);
    save();
  }

  function normalize(s) {
    s.looseCounts = s.looseCounts || {};
    s.evidence = s.evidence || [];
    s.history = s.history || [];
    s.reminders = s.reminders || [];
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
    renderReminders();
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
      e.target.value = '';
    });
    $('ics-btn').addEventListener('click', generateIcs);
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

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

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
