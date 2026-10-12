/* Agenda – Mahfou's APK */
(function () {
'use strict';

/* ---------- Utilitaires ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const pad = n => String(n).padStart(2, '0');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtDate = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const fmtTime = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
const fmtDT = d => fmtDate(d) + 'T' + fmtTime(d);
const parseDT = s => { const [d, t] = s.split('T'); const [y, m, da] = d.split('-').map(Number); const [h, mi] = t.split(':').map(Number); return new Date(y, m - 1, da, h, mi, 0, 0); };
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function load(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast('Stockage plein / Storage full'); } }

/* ---------- Langues ---------- */
const I18N = {
  fr: {
    title: 'Agenda', tToday: "Aujourd'hui", tWeek: 'Semaine', tMonth: 'Mois', tLate: 'En retard', tDone: 'Terminées', tHist: 'Historique',
    search: 'Rechercher…', allCats: 'Toutes catégories',
    fTitle: 'Titre', fNotes: 'Notes', fDate: 'Date', fTime: 'Heure', fPrio: 'Priorité', fCat: 'Catégorie', fRepeat: 'Répétition',
    fRem: "Rappels avant l'échéance", fSound: 'Sonnerie', fVib: 'Vibration', cancel: 'Annuler', save: 'Enregistrer', close: 'Fermer',
    newTask: 'Nouvelle tâche', editTask: 'Modifier la tâche',
    prio: ['Basse', 'Normale', 'Haute'],
    cats: { these: 'Thèse', cours: 'Cours', admin: 'Administratif', perso: 'Personnel', autre: 'Autre' },
    rep: { none: 'Aucune', daily: 'Tous les jours', weekly: 'Toutes les semaines', monthly: 'Tous les mois', days: 'Jours choisis' },
    days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    rem: { 0: "À l'heure", 10: '10 min avant', 30: '30 min avant', 60: '1 h avant', 1440: '1 jour avant' },
    sounds: { beep: 'Bip', bell: 'Cloche', siren: 'Sirène', none: 'Silencieux' },
    settings: 'Réglages', enableNotif: 'Activer les notifications', sSummary: 'Résumé quotidien', sSummaryTime: 'Heure du résumé',
    sDefSound: 'Sonnerie par défaut', test: 'Tester la sonnerie', expJson: 'Exporter (JSON)', expTxt: 'Exporter (TXT)',
    expIcs: 'Exporter vers le calendrier (.ics)', imp: 'Importer (JSON)',
    batTitle: 'Fiabilité des alarmes',
    batTxt: "• Gardez l'application ouverte ou installée sur l'écran d'accueil.\n• Paramètres Android > Applications > cette appli > Batterie : choisissez « Sans restriction ».\n• Autorisez les notifications.\n• Les tâches manquées (téléphone éteint ou appli fermée) sont signalées au prochain lancement.\n• Les heures suivent le fuseau horaire et l'heure d'été du téléphone.",
    aDone: 'Terminé', aSnooze: 'Reporter 10 min', aOpen: 'Ouvrir',
    empty: 'Aucune tâche ici.', late: 'En retard', missed: 'Manqué', today: "Aujourd'hui", tomorrow: 'Demain',
    del: 'Supprimer', edit: 'Modifier', confirmDel: 'Supprimer cette tâche ?', saved: 'Enregistré', deleted: 'Supprimée',
    notifOk: 'Notifications activées', notifNo: 'Notifications refusées', imported: 'Import réussi', importErr: 'Fichier invalide',
    summaryTitle: 'Résumé du jour', summaryNone: "Aucune tâche aujourd'hui", summaryN: n => n + ' tâche(s) aujourd\'hui',
    doneAt: 'Terminée le', snoozed: 'Reportée de 10 min', micNo: 'Micro non disponible', micLang: 'fr-FR',
    reminder: 'Rappel', in: 'dans', pastDue: 'échéance dépassée', exportDone: 'Fichier exporté', histEmpty: 'Aucun historique.', every: 'Répété'
  },
  ar: {
    title: 'أجندة', tToday: 'اليوم', tWeek: 'الأسبوع', tMonth: 'الشهر', tLate: 'متأخرة', tDone: 'المنجزة', tHist: 'السجل',
    search: 'بحث…', allCats: 'كل الفئات',
    fTitle: 'العنوان', fNotes: 'ملاحظات', fDate: 'التاريخ', fTime: 'الساعة', fPrio: 'الأولوية', fCat: 'الفئة', fRepeat: 'التكرار',
    fRem: 'تذكيرات قبل الموعد', fSound: 'النغمة', fVib: 'اهتزاز', cancel: 'إلغاء', save: 'حفظ', close: 'إغلاق',
    newTask: 'مهمة جديدة', editTask: 'تعديل المهمة',
    prio: ['منخفضة', 'عادية', 'عالية'],
    cats: { these: 'الأطروحة', cours: 'الدروس', admin: 'إداري', perso: 'شخصي', autre: 'أخرى' },
    rep: { none: 'بدون', daily: 'كل يوم', weekly: 'كل أسبوع', monthly: 'كل شهر', days: 'أيام محددة' },
    days: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
    rem: { 0: 'في الوقت', 10: 'قبل 10 دقائق', 30: 'قبل 30 دقيقة', 60: 'قبل ساعة', 1440: 'قبل يوم' },
    sounds: { beep: 'صفير', bell: 'جرس', siren: 'صفارة', none: 'صامت' },
    settings: 'الإعدادات', enableNotif: 'تفعيل الإشعارات', sSummary: 'ملخص يومي', sSummaryTime: 'ساعة الملخص',
    sDefSound: 'النغمة الافتراضية', test: 'تجربة النغمة', expJson: 'تصدير (JSON)', expTxt: 'تصدير (TXT)',
    expIcs: 'تصدير إلى التقويم (.ics)', imp: 'استيراد (JSON)',
    batTitle: 'موثوقية المنبهات',
    batTxt: '• أبقِ التطبيق مفتوحًا أو مثبتًا على الشاشة الرئيسية.\n• إعدادات أندرويد > التطبيقات > هذا التطبيق > البطارية: اختر «بدون قيود».\n• اسمح بالإشعارات.\n• المهام الفائتة (الهاتف مطفأ أو التطبيق مغلق) تظهر عند التشغيل التالي.\n• التوقيت يتبع المنطقة الزمنية والتوقيت الصيفي للهاتف.',
    aDone: 'تم', aSnooze: 'تأجيل 10 دقائق', aOpen: 'فتح',
    empty: 'لا توجد مهام هنا.', late: 'متأخرة', missed: 'فائتة', today: 'اليوم', tomorrow: 'غدًا',
    del: 'حذف', edit: 'تعديل', confirmDel: 'حذف هذه المهمة؟', saved: 'تم الحفظ', deleted: 'تم الحذف',
    notifOk: 'تم تفعيل الإشعارات', notifNo: 'تم رفض الإشعارات', imported: 'تم الاستيراد', importErr: 'ملف غير صالح',
    summaryTitle: 'ملخص اليوم', summaryNone: 'لا توجد مهام اليوم', summaryN: n => 'عدد المهام اليوم: ' + n,
    doneAt: 'أُنجزت في', snoozed: 'تم التأجيل 10 دقائق', micNo: 'الميكروفون غير متاح', micLang: 'ar-MA',
    reminder: 'تذكير', in: 'بعد', pastDue: 'انتهى الموعد', exportDone: 'تم التصدير', histEmpty: 'لا يوجد سجل.', every: 'متكررة'
  }
};

/* ---------- État ---------- */
const CATS = ['these', 'cours', 'admin', 'perso', 'autre'];
const REMS = [0, 10, 30, 60, 1440];
let settings = Object.assign({ lang: 'fr', summary: false, summaryTime: '07:00', sound: 'beep', lastSummary: '' }, load('ag_settings', {}));
let tasks = load('ag_tasks', []);
let history = load('ag_hist', []);
let view = 'today';
let monthRef = new Date();
let selDay = new Date();
let editingId = null;
let alertTask = null;
let selRems = [0], selDays = [];

const T = () => I18N[settings.lang];
const persist = () => { save('ag_tasks', tasks); save('ag_hist', history); save('ag_settings', settings); };
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2200); }

/* ---------- Sons ---------- */
let actx = null;
function audio() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (actx && actx.state === 'suspended') actx.resume(); return actx; }
function tone(freq, start, dur, type, vol) {
  const c = audio(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(vol || 0.4, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  o.connect(g); g.connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
}
function playSound(name) {
  if (name === 'none') return;
  if (name === 'bell') { [0, 0.9, 1.8].forEach(t => { tone(880, t, 0.9, 'sine', 0.5); tone(1320, t, 0.7, 'sine', 0.25); }); }
  else if (name === 'siren') { for (let i = 0; i < 6; i++) tone(i % 2 ? 600 : 900, i * 0.4, 0.4, 'square', 0.25); }
  else { for (let i = 0; i < 4; i++) { tone(1000, i * 0.5, 0.18, 'square', 0.3); tone(1000, i * 0.5 + 0.22, 0.18, 'square', 0.3); } }
}
function vibrate() { try { navigator.vibrate && navigator.vibrate([400, 200, 400, 200, 600]); } catch (e) {} }

/* ---------- Récurrence ---------- */
function nextOccurrence(task) {
  const r = task.repeat || { type: 'none' };
  const cur = parseDT(task.due);
  const n = new Date(cur);
  if (r.type === 'daily') n.setDate(n.getDate() + 1);
  else if (r.type === 'weekly') n.setDate(n.getDate() + 7);
  else if (r.type === 'monthly') {
    const day = cur.getDate();
    n.setDate(1); n.setMonth(n.getMonth() + 1);
    const last = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
    n.setDate(Math.min(day, last));
  } else if (r.type === 'days' && r.days && r.days.length) {
    for (let i = 1; i <= 7; i++) { const t = new Date(cur); t.setDate(t.getDate() + i); if (r.days.includes(t.getDay())) return fmtDT(t); }
    return null;
  } else return null;
  return fmtDT(n);
}
const isRepeat = t => t.repeat && t.repeat.type !== 'none';

function completeTask(t, silent) {
  history.unshift({ id: uid(), title: t.title, due: t.due, doneAt: fmtDT(new Date()), cat: t.cat });
  history = history.slice(0, 500);
  const nxt = isRepeat(t) ? nextOccurrence(t) : null;
  if (nxt) { t.due = nxt; t.fired = {}; t.snoozeUntil = 0; }
  else { t.done = true; t.doneAt = fmtDT(new Date()); }
  persist();
  if (!silent) toast('✔ ' + t.title);
}

/* ---------- Planification ---------- */
function checkAlarms(catchUp) {
  const now = Date.now();
  let changed = false;
  tasks.forEach(t => {
    if (t.done) return;
    const due = parseDT(t.due).getTime();
    t.fired = t.fired || {};
    (t.reminders || [0]).forEach(off => {
      const key = t.due + '|' + off;
      const at = due - off * 60000;
      if (now >= at && !t.fired[key]) {
        t.fired[key] = true; changed = true;
        const missed = now - at > 90000;
        fireAlert(t, off, missed);
      }
    });
    if (t.snoozeUntil && now >= t.snoozeUntil) { t.snoozeUntil = 0; changed = true; fireAlert(t, 0, false); }
  });
  /* résumé quotidien */
  if (settings.summary) {
    const d = new Date(), today = fmtDate(d);
    if (settings.lastSummary !== today && fmtTime(d) >= settings.summaryTime) {
      settings.lastSummary = today; changed = true;
      const n = tasks.filter(t => !t.done && sameDay(parseDT(t.due), d)).length;
      notify(T().summaryTitle, n ? T().summaryN(n) : T().summaryNone, 'summary-' + today);
    }
  }
  if (changed) { persist(); render(); }
}

function fireAlert(t, off, missed) {
  const L = T();
  const body = (off ? L.rem[off] + ' • ' : '') + fmtTime(parseDT(t.due)) + (missed ? ' • ' + L.missed : '');
  notify('⏰ ' + t.title, body, 'task-' + t.id, t);
  if (t.vib !== false) vibrate();
  playSound(t.sound || settings.sound);
  showAlert(t, body);
}

function showAlert(t, body) {
  alertTask = t.id;
  $('#alTitle').textContent = t.title;
  $('#alWhen').textContent = body;
  $('#alertModal').hidden = false;
}

function notify(title, body, tag, t) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const opts = { body, tag, icon: 'icon-192.png', badge: 'icon-192.png', vibrate: [300, 150, 300], requireInteraction: true, data: { id: t ? t.id : null },
      actions: t ? [{ action: 'done', title: T().aDone }, { action: 'snooze', title: T().aSnooze }] : [] };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => reg.showNotification(title, opts)).catch(() => new Notification(title, { body, tag, icon: 'icon-192.png' }));
    } else new Notification(title, { body, tag, icon: 'icon-192.png' });
  } catch (e) {}
}

/* ---------- Rendu ---------- */
function dayLabel(d) {
  const L = T(), now = new Date(), tm = new Date(); tm.setDate(tm.getDate() + 1);
  if (sameDay(d, now)) return L.today;
  if (sameDay(d, tm)) return L.tomorrow;
  return d.toLocaleDateString(settings.lang === 'ar' ? 'ar-MA-u-nu-latn' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}
function repLabel(t) {
  const L = T(); const r = t.repeat || { type: 'none' };
  if (r.type === 'none') return '';
  if (r.type === 'days') return '↻ ' + (r.days || []).map(i => L.days[i]).join(' ');
  return '↻ ' + L.rep[r.type];
}
function filtered(list) {
  const q = $('#search').value.trim().toLowerCase(), c = $('#filterCat').value;
  return list.filter(t => (!c || t.cat === c) && (!q || (t.title + ' ' + (t.notes || '')).toLowerCase().includes(q)));
}
function cardHTML(t) {
  const L = T(), d = parseDT(t.due), late = !t.done && d < new Date();
  return `<div class="card p${t.prio || 2} ${late ? 'late' : ''} ${t.done ? 'isdone' : ''}" data-id="${t.id}">
    <button class="chkbtn" data-a="done" aria-label="${L.aDone}">${t.done ? '✔' : '○'}</button>
    <div class="body" data-a="edit">
      <div class="ttl">${esc(t.title)}</div>
      <div class="meta"><span class="badge">${esc(L.cats[t.cat] || t.cat)}</span>${fmtDate(d).split('-').reverse().join('/')} ${fmtTime(d)} ${repLabel(t)}</div>
      ${t.notes ? `<div class="meta">${esc(t.notes)}</div>` : ''}
    </div>
    <div class="acts"><button data-a="del" aria-label="${L.del}">🗑</button></div>
  </div>`;
}
function listGrouped(list) {
  if (!list.length) return `<div class="empty">${T().empty}</div>`;
  const sorted = list.slice().sort((a, b) => a.due.localeCompare(b.due));
  let out = '', last = '';
  sorted.forEach(t => {
    const k = t.due.slice(0, 10);
    if (k !== last) { out += `<div class="group">${esc(dayLabel(parseDT(t.due)))}</div>`; last = k; }
    out += cardHTML(t);
  });
  return out;
}

function render() {
  const L = T(), v = $('#view'), now = new Date();
  const active = tasks.filter(t => !t.done);
  let html = '';
  if (view === 'today') {
    const l = filtered(active.filter(t => sameDay(parseDT(t.due), now) || parseDT(t.due) < startOfDay(now)));
    html = listGrouped(l);
  } else if (view === 'week') {
    const s = startOfDay(now), e = new Date(s); e.setDate(e.getDate() + 7);
    html = listGrouped(filtered(active.filter(t => { const d = parseDT(t.due); return d >= s && d < e; })));
  } else if (view === 'month') {
    html = monthHTML();
  } else if (view === 'late') {
    html = listGrouped(filtered(active.filter(t => parseDT(t.due) < now)));
  } else if (view === 'done') {
    const l = filtered(tasks.filter(t => t.done)).sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));
    html = l.length ? l.map(cardHTML).join('') : `<div class="empty">${L.empty}</div>`;
  } else if (view === 'hist') {
    const q = $('#search').value.trim().toLowerCase();
    const l = history.filter(h => !q || h.title.toLowerCase().includes(q));
    html = l.length ? l.map(h => `<div class="card isdone"><div class="body"><div class="ttl">${esc(h.title)}</div><div class="meta">${L.doneAt} ${h.doneAt.replace('T', ' ')}</div></div></div>`).join('') : `<div class="empty">${L.histEmpty}</div>`;
  }
  v.innerHTML = html;
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === view));
}

function monthHTML() {
  const L = T(), y = monthRef.getFullYear(), m = monthRef.getMonth();
  const first = new Date(y, m, 1), startOff = first.getDay(), dim = new Date(y, m + 1, 0).getDate();
  const title = first.toLocaleDateString(settings.lang === 'ar' ? 'ar-MA-u-nu-latn' : 'fr-FR', { month: 'long', year: 'numeric' });
  let h = `<div class="mhead"><button data-m="-1">◀</button><span>${esc(title)}</span><button data-m="1">▶</button></div><div class="grid">`;
  L.days.forEach(d => h += `<div class="dn">${d}</div>`);
  for (let i = 0; i < startOff; i++) h += '<div></div>';
  for (let d = 1; d <= dim; d++) {
    const dt = new Date(y, m, d);
    const has = tasks.some(t => !t.done && sameDay(parseDT(t.due), dt));
    h += `<div class="cell ${sameDay(dt, new Date()) ? 'today' : ''} ${sameDay(dt, selDay) ? 'sel' : ''}" data-day="${fmtDate(dt)}">${d}${has ? '<span class="dot"></span>' : ''}</div>`;
  }
  h += '</div>';
  const dayTasks = filtered(tasks.filter(t => !t.done && sameDay(parseDT(t.due), selDay))).sort((a, b) => a.due.localeCompare(b.due));
  h += `<div class="group">${esc(dayLabel(selDay))}</div>` + (dayTasks.length ? dayTasks.map(cardHTML).join('') : `<div class="empty">${L.empty}</div>`);
  return h;
}

/* ---------- Interface statique / langue ---------- */
function applyLang() {
  const L = T();
  document.documentElement.lang = settings.lang;
  document.documentElement.dir = settings.lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i]').forEach(el => { const k = el.dataset.i; if (typeof L[k] === 'string') el.textContent = L[k]; });
  $('#search').placeholder = L.search;
  $('#btnLang').textContent = settings.lang === 'ar' ? 'FR' : 'ع';
  const fc = $('#filterCat'), cur = fc.value;
  fc.innerHTML = `<option value="">${L.allCats}</option>` + CATS.map(c => `<option value="${c}">${L.cats[c]}</option>`).join('');
  fc.value = cur;
  $('#fCat').innerHTML = CATS.map(c => `<option value="${c}">${L.cats[c]}</option>`).join('');
  $('#fPrio').innerHTML = L.prio.map((p, i) => `<option value="${i + 1}">${p}</option>`).join('');
  $('#fRepeat').innerHTML = Object.keys(L.rep).map(k => `<option value="${k}">${L.rep[k]}</option>`).join('');
  const snd = Object.keys(L.sounds).map(k => `<option value="${k}">${L.sounds[k]}</option>`).join('');
  $('#fSound').innerHTML = snd; $('#sSound').innerHTML = snd;
  $('#sSound').value = settings.sound;
  $('#sSummary').checked = !!settings.summary;
  $('#sSummaryTime').value = settings.summaryTime;
  buildChips();
  render();
}
function buildChips() {
  const L = T();
  $('#remBox').innerHTML = REMS.map(r => `<button type="button" class="chip ${selRems.includes(r) ? 'on' : ''}" data-r="${r}">${L.rem[r]}</button>`).join('');
  $('#daysBox').innerHTML = L.days.map((d, i) => `<button type="button" class="chip ${selDays.includes(i) ? 'on' : ''}" data-d="${i}">${d}</button>`).join('');
  $('#daysBox').hidden = $('#fRepeat').value !== 'days';
}

/* ---------- Formulaire ---------- */
function openForm(id, dayStr) {
  const L = T(); editingId = id || null;
  const t = id ? tasks.find(x => x.id === id) : null;
  $('#formTitle').textContent = t ? L.editTask : L.newTask;
  const base = new Date(); base.setMinutes(base.getMinutes() + 30, 0, 0);
  $('#fTitle').value = t ? t.title : '';
  $('#fNotes').value = t ? (t.notes || '') : '';
  $('#fDate').value = t ? t.due.slice(0, 10) : (dayStr || fmtDate(base));
  $('#fTime').value = t ? t.due.slice(11, 16) : fmtTime(base);
  $('#fPrio').value = t ? (t.prio || 2) : 2;
  $('#fCat').value = t ? t.cat : 'perso';
  $('#fRepeat').value = t && t.repeat ? t.repeat.type : 'none';
  $('#fSound').value = t ? (t.sound || settings.sound) : settings.sound;
  $('#fVib').checked = t ? t.vib !== false : true;
  selRems = t ? (t.reminders || [0]).slice() : [0];
  selDays = t && t.repeat && t.repeat.days ? t.repeat.days.slice() : [];
  buildChips();
  $('#modal').hidden = false;
  setTimeout(() => $('#fTitle').focus(), 50);
}
function closeForm() { $('#modal').hidden = true; editingId = null; }

$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const title = $('#fTitle').value.trim(); if (!title) return;
  const due = $('#fDate').value + 'T' + $('#fTime').value;
  const type = $('#fRepeat').value;
  if (type === 'days' && !selDays.length) selDays = [parseDT(due).getDay()];
  const data = {
    title, notes: $('#fNotes').value.trim(), due, prio: +$('#fPrio').value, cat: $('#fCat').value,
    repeat: { type, days: type === 'days' ? selDays.slice().sort() : [] },
    reminders: selRems.length ? selRems.slice().sort((a, b) => a - b) : [0],
    sound: $('#fSound').value, vib: $('#fVib').checked
  };
  if (editingId) {
    const t = tasks.find(x => x.id === editingId);
    const dueChanged = t.due !== data.due;
    Object.assign(t, data);
    if (dueChanged) { t.fired = {}; t.snoozeUntil = 0; t.done = false; }
  } else {
    tasks.push(Object.assign({ id: uid(), done: false, fired: {}, snoozeUntil: 0, created: fmtDT(new Date()) }, data));
  }
  /* les rappels dont l'heure est déjà passée à la création ne doivent pas sonner */
  const tk = editingId ? tasks.find(x => x.id === editingId) : tasks[tasks.length - 1];
  const nowMs = Date.now(), dueMs = parseDT(tk.due).getTime();
  tk.fired = tk.fired || {};
  tk.reminders.forEach(off => { if (nowMs > dueMs - off * 60000 && dueMs > nowMs) tk.fired[tk.due + '|' + off] = true; });
  persist(); closeForm(); render(); toast(T().saved);
  audio(); /* débloque l'audio sur geste utilisateur */
  askNotifOnce();
});
$('#btnCancel').onclick = closeForm;
$('#fRepeat').onchange = buildChips;
$('#remBox').addEventListener('click', e => {
  const b = e.target.closest('[data-r]'); if (!b) return; const r = +b.dataset.r;
  selRems = selRems.includes(r) ? selRems.filter(x => x !== r) : selRems.concat(r); buildChips();
});
$('#daysBox').addEventListener('click', e => {
  const b = e.target.closest('[data-d]'); if (!b) return; const d = +b.dataset.d;
  selDays = selDays.includes(d) ? selDays.filter(x => x !== d) : selDays.concat(d); buildChips();
});

/* ---------- Saisie vocale ---------- */
$('#btnMic').onclick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return toast(T().micNo);
  try {
    const r = new SR(); r.lang = T().micLang; r.interimResults = false;
    r.onresult = ev => { const tx = ev.results[0][0].transcript; $('#fTitle').value = ($('#fTitle').value + ' ' + tx).trim(); };
    r.onerror = () => toast(T().micNo);
    r.start();
  } catch (e) { toast(T().micNo); }
};

/* ---------- Actions sur la liste ---------- */
$('#view').addEventListener('click', e => {
  const m = e.target.closest('[data-m]');
  if (m) { monthRef = new Date(monthRef.getFullYear(), monthRef.getMonth() + +m.dataset.m, 1); render(); return; }
  const c = e.target.closest('[data-day]');
  if (c) { const [y, mo, d] = c.dataset.day.split('-').map(Number); selDay = new Date(y, mo - 1, d); render(); return; }
  const card = e.target.closest('.card'); if (!card || !card.dataset.id) return;
  const t = tasks.find(x => x.id === card.dataset.id); if (!t) return;
  const a = e.target.closest('[data-a]'); if (!a) return;
  if (a.dataset.a === 'done') {
    if (t.done) { t.done = false; persist(); render(); } else { completeTask(t); render(); }
  } else if (a.dataset.a === 'del') {
    if (confirm(T().confirmDel)) { tasks = tasks.filter(x => x.id !== t.id); persist(); render(); toast(T().deleted); }
  } else if (a.dataset.a === 'edit') openForm(t.id);
});
$('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; view = b.dataset.v; render(); });
$('#search').addEventListener('input', render);
$('#filterCat').addEventListener('change', render);
$('#fab').onclick = () => openForm(null, view === 'month' ? fmtDate(selDay) : null);

/* ---------- Alerte plein écran ---------- */
function hideAlert() { $('#alertModal').hidden = true; alertTask = null; }
$('#alDone').onclick = () => { const t = tasks.find(x => x.id === alertTask); if (t) completeTask(t); hideAlert(); render(); };
$('#alSnooze').onclick = () => { const t = tasks.find(x => x.id === alertTask); if (t) { t.snoozeUntil = Date.now() + 600000; persist(); toast(T().snoozed); } hideAlert(); };
$('#alOpen').onclick = () => { const id = alertTask; hideAlert(); if (id) openForm(id); };

/* ---------- Réglages ---------- */
$('#btnSettings').onclick = () => $('#setModal').hidden = false;
$('#btnCloseSet').onclick = () => { settings.summary = $('#sSummary').checked; settings.summaryTime = $('#sSummaryTime').value || '07:00'; settings.sound = $('#sSound').value; persist(); $('#setModal').hidden = true; };
$('#btnLang').onclick = () => { settings.lang = settings.lang === 'fr' ? 'ar' : 'fr'; persist(); applyLang(); };
$('#btnTest').onclick = () => { playSound($('#sSound').value); vibrate(); };
$('#btnNotif').onclick = askNotif;
function askNotif() {
  if (!('Notification' in window)) return toast('Non supporté / Unsupported');
  Notification.requestPermission().then(p => toast(p === 'granted' ? T().notifOk : T().notifNo));
}
function askNotifOnce() {
  if ('Notification' in window && Notification.permission === 'default' && !load('ag_asked', false)) { save('ag_asked', true); askNotif(); }
}

/* ---------- Export / import ---------- */
function download(name, mime, text) {
  const b = new Blob([text], { type: mime }), a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); toast(T().exportDone);
}
$('#btnExportJson').onclick = () => download('agenda-' + fmtDate(new Date()) + '.json', 'application/json', JSON.stringify({ tasks, history, settings }, null, 2));
$('#btnExportTxt').onclick = () => {
  const L = T();
  const lines = tasks.slice().sort((a, b) => a.due.localeCompare(b.due)).map(t => `${t.done ? '[x]' : '[ ]'} ${t.due.replace('T', ' ')} | ${L.cats[t.cat] || t.cat} | ${t.title}${t.notes ? ' — ' + t.notes : ''}${isRepeat(t) ? ' ' + repLabel(t) : ''}`);
  download('agenda-' + fmtDate(new Date()) + '.txt', 'text/plain;charset=utf-8', lines.join('\n'));
};
function icsDate(s) { return s.replace(/[-:]/g, '') + '00'; }
$('#btnExportIcs').onclick = () => {
  const rr = t => { const r = t.repeat || {}; if (r.type === 'daily') return 'RRULE:FREQ=DAILY'; if (r.type === 'weekly') return 'RRULE:FREQ=WEEKLY'; if (r.type === 'monthly') return 'RRULE:FREQ=MONTHLY'; if (r.type === 'days' && r.days.length) return 'RRULE:FREQ=WEEKLY;BYDAY=' + r.days.map(i => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][i]).join(','); return ''; };
  const ev = tasks.filter(t => !t.done).map(t => {
    const s = parseDT(t.due), e = new Date(s.getTime() + 3600000);
    const al = (t.reminders || [0]).map(o => `BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:${t.title.replace(/[\r\n,;]/g, ' ')}\r\nTRIGGER:-PT${o}M\r\nEND:VALARM`).join('\r\n');
    return ['BEGIN:VEVENT', 'UID:' + t.id + '@mahfou-agenda', 'DTSTAMP:' + icsDate(fmtDT(new Date())) , 'DTSTART:' + icsDate(t.due), 'DTEND:' + icsDate(fmtDT(e)), 'SUMMARY:' + t.title.replace(/[\r\n,;]/g, ' '), t.notes ? 'DESCRIPTION:' + t.notes.replace(/[\r\n,;]/g, ' ') : '', rr(t), al, 'END:VEVENT'].filter(Boolean).join('\r\n');
  });
  download('agenda-' + fmtDate(new Date()) + '.ics', 'text/calendar;charset=utf-8', 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Mahfou APK//Agenda//FR\r\n' + ev.join('\r\n') + '\r\nEND:VCALENDAR');
};
$('#btnImport').onclick = () => $('#fileImport').click();
$('#fileImport').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || !Array.isArray(d.tasks)) throw 0;
      const ids = new Set(tasks.map(t => t.id));
      d.tasks.forEach(t => { if (t && t.title && t.due && !ids.has(t.id)) tasks.push(Object.assign({ id: uid(), fired: {}, reminders: [0], cat: 'autre', prio: 2, repeat: { type: 'none' } }, t)); });
      if (Array.isArray(d.history)) history = d.history.concat(history).slice(0, 500);
      persist(); render(); toast(T().imported);
    } catch (err) { toast(T().importErr); }
  };
  r.readAsText(f); e.target.value = '';
};

/* ---------- Messages du service worker (actions de notification) ---------- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', e => {
    const d = e.data || {}; const t = tasks.find(x => x.id === d.id); if (!t) return;
    if (d.action === 'done') { completeTask(t); render(); }
    else if (d.action === 'snooze') { t.snoozeUntil = Date.now() + 600000; persist(); toast(T().snoozed); }
    else { render(); }
  });
}

/* ---------- Démarrage ---------- */
function start() {
  applyLang();
  $('#app').hidden = false;
  /* logo clignotant ~3 s puis disparition */
  setTimeout(() => { $('#splash').classList.add('out'); setTimeout(() => $('#splash').remove(), 900); }, 3200);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  /* au lancement : replanifier tout (redémarrage du téléphone, appli fermée) et signaler les manqués */
  checkAlarms(true);
  setInterval(() => checkAlarms(false), 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkAlarms(true); });
  window.addEventListener('focus', () => checkAlarms(true));
  document.addEventListener('click', () => audio(), { once: true });
}
window.__agenda = { nextOccurrence, parseDT, fmtDT, get tasks() { return tasks; } };
start();
})();
