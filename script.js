
"use strict";

/* =====================================
   LAKSHMAN MAIL DESK - FIXED VERSION
===================================== */

const $ = id => document.getElementById(id);

const KEYS = {
  templates: "lakshman_templates_fixed_2",
  drafts: "lakshman_drafts_fixed_2",
  sheets: "lakshman_sheets_fixed_2"
};

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    notify("Unable to save. Check browser storage.");
  }
}

function notify(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

/* =====================================
   ORIGINAL 10 TEMPLATES
===================================== */

const defaultTemplates = [
  {
    id: 1,
    title: "Project status — weekly",
    to: [""], cc: [""], bcc: [""],
    subject: "Weekly project status — {{DATE}}",
    body: "Hi Team,\n\nHere is the weekly project status update for {{DATE}}.\n\nCompleted:\n\nIn Progress:\n\nPending:\n\nRegards,\nLakshman"
  },
  {
    id: 2,
    title: "Design review follow-up",
    to: [""], cc: [""], bcc: [""],
    subject: "Follow-up: Design review",
    body: "Hi Team,\n\nI am following up on the design review.\n\nPlease share your feedback and let me know if any changes are required.\n\nRegards,\nLakshman"
  },
  {
    id: 3,
    title: "Invoice reminder",
    to: [""], cc: [""], bcc: [""],
    subject: "Invoice payment reminder — {{DATE}}",
    body: "Hi Team,\n\nThis is a gentle reminder regarding the pending invoice.\n\nKindly check and share the payment status.\n\nRegards,\nLakshman"
  },
  {
    id: 4,
    title: "Meeting confirmation",
    to: [""], cc: [""], bcc: [""],
    subject: "Meeting confirmation — {{DATE}}",
    body: "Hi Team,\n\nThis email is to confirm our meeting scheduled for {{DATE}}.\n\nPlease let me know if there are any changes.\n\nRegards,\nLakshman"
  },
  {
    id: 5,
    title: "Partner introduction",
    to: [""], cc: [""], bcc: [""],
    subject: "Introduction and collaboration",
    body: "Hi,\n\nI would like to introduce myself and discuss possible collaboration opportunities.\n\nLooking forward to hearing from you.\n\nRegards,\nLakshman"
  },
  {
    id: 6,
    title: "Request for materials",
    to: [""], cc: [""], bcc: [""],
    subject: "Request for required materials",
    body: "Hi Team,\n\nCould you please share the required materials and documents?\n\nThank you for your support.\n\nRegards,\nLakshman"
  },
  {
    id: 7,
    title: "Decision log update",
    to: [""], cc: [""], bcc: [""],
    subject: "Decision log update — {{DATE}}",
    body: "Hi Team,\n\nPlease find the decision log update for {{DATE}}.\n\nDecisions:\n\nAction Items:\n\nPending Clarifications:\n\nRegards,\nLakshman"
  },
  {
    id: 8,
    title: "Thank-you note",
    to: [""], cc: [""], bcc: [""],
    subject: "Thank you for your support",
    body: "Hi Team,\n\nThank you for your valuable support and assistance.\n\nI really appreciate your help.\n\nRegards,\nLakshman"
  },
  {
    id: 9,
    title: "Leave request",
    to: [""], cc: [""], bcc: [""],
    subject: "Leave request — {{DATE}}",
    body: "Hi Team,\n\nI would like to request leave on {{DATE}} due to personal reasons.\n\nKindly consider and approve my request.\n\nRegards,\nLakshman"
  },
  {
    id: 10,
    title: "Job application follow-up",
    to: [""], cc: [""], bcc: [""],
    subject: "Follow-up on job application",
    body: "Dear Hiring Team,\n\nI am following up regarding my job application.\n\nI would appreciate an update on the application status.\n\nThank you.\n\nRegards,\nLakshman"
  }
];

let templates = read(KEYS.templates, defaultTemplates);
let drafts = read(KEYS.drafts, []);

if (!Array.isArray(templates)) templates = defaultTemplates;
if (!Array.isArray(drafts)) drafts = [];

templates = templates.map((t, i) => ({
  id: t.id ?? i + 1,
  title: t.title || "Untitled template",
  to: Array.isArray(t.to) ? t.to : [""],
  cc: Array.isArray(t.cc) ? t.cc : [""],
  bcc: Array.isArray(t.bcc) ? t.bcc : [""],
  subject: t.subject || "",
  body: t.body || ""
}));

let currentId = null;
let mailMode = "today";
let mailCustom = "";
let sheetMode = "today";
let sheetCustom = "";

/* =====================================
   DATE FUNCTIONS
===================================== */

function getDate(mode, custom) {
  if (mode === "custom" && custom) {
    return new Date(custom + "T12:00:00");
  }

  const date = new Date();
  if (mode === "tomorrow") date.setDate(date.getDate() + 1);
  return date;
}

function displayDate(date) {
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear()
  ].join("/");
}

function inputDate(date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

function mailDate() {
  return displayDate(getDate(mailMode, mailCustom));
}

function sheetDate() {
  return displayDate(getDate(sheetMode, sheetCustom));
}

function updateMailDate() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  $("todayLabel").textContent = displayDate(today);
  $("tomorrowLabel").textContent = displayDate(tomorrow);
  $("customDate").value = mailCustom;

  document.querySelectorAll("[data-date]").forEach(button => {
    button.classList.toggle("selected", button.dataset.date === mailMode);
  });

  $("activeDateLabel").textContent = mailDate();
}

function updateSheetDate() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  $("w2TodayLabel").textContent = displayDate(today);
  $("w2TomorrowLabel").textContent = displayDate(tomorrow);
  $("w2CustomDate").value = sheetCustom;

  document.querySelectorAll("[data-w2-date]").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.w2Date === sheetMode
    );
  });

  $("w2ActiveDateLabel").textContent = sheetDate();
}

document.querySelectorAll("[data-date]").forEach(button => {
  button.addEventListener("click", () => {
    mailMode = button.dataset.date;
    updateMailDate();
    renderTemplates();
  });
});

$("customDate").addEventListener("change", event => {
  if (!event.target.value) return;
  mailCustom = event.target.value;
  mailMode = "custom";
  updateMailDate();
  renderTemplates();
});

document.querySelectorAll("[data-w2-date]").forEach(button => {
  button.addEventListener("click", () => {
    sheetMode = button.dataset.w2Date;
    updateSheetDate();
    renderSheets();
  });
});

$("w2CustomDate").addEventListener("change", event => {
  if (!event.target.value) return;
  sheetCustom = event.target.value;
  sheetMode = "custom";
  updateSheetDate();
  renderSheets();
});

/* =====================================
   TEMPLATE RENDERING
===================================== */

function dated(text) {
  return String(text || "").replace(/\{\{DATE\}\}/g, mailDate());
}

function renderTemplates() {
  const grid = $("templateGrid");
  const search = $("searchInput").value.toLowerCase().trim();

  grid.innerHTML = "";

  const results = templates.filter(t =>
    [t.title, t.subject, t.body, ...t.to, ...t.cc, ...t.bcc]
      .join(" ").toLowerCase().includes(search)
  );

  $("readyCount").textContent = templates.length;
  $("templateCount").textContent = templates.length;
  $("emptyState").hidden = results.length > 0;

  results.forEach((t, index) => {
    const card = document.createElement("article");
    card.className = "template-card";

    const number = document.createElement("div");
    number.className = "card-number";
    number.textContent = "TEMPLATE " + String(index + 1).padStart(2, "0");

    const title = document.createElement("h3");
    title.textContent = t.title;

    const subject = document.createElement("p");
    subject.className = "card-subject";
    subject.textContent = dated(t.subject);

    const body = document.createElement("p");
    body.className = "card-description";
    body.textContent = t.body.slice(0, 110) + "...";

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const preview = document.createElement("button");
    preview.className = "primary-button";
    preview.textContent = "Preview";
    preview.onclick = () => openPreview(t.id);

    const edit = document.createElement("button");
    edit.className = "secondary-button";
    edit.textContent = "Edit";
    edit.onclick = () => openEditor(t.id);

    actions.append(preview, edit);
    card.append(number, title, subject, body, actions);
    grid.appendChild(card);
  });
}

$("searchInput").addEventListener("input", renderTemplates);

/* =====================================
   RECIPIENT INPUTS
===================================== */

function addRecipient(type, value = "") {
  const container = $(type + "Recipients");

  const row = document.createElement("div");
  row.className = "recipient-row";

  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = "Enter email address";
  input.value = value;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-recipient";
  remove.textContent = "×";

  remove.onclick = () => {
    if (container.children.length > 1) row.remove();
    else input.value = "";
  };

  row.append(input, remove);
  container.appendChild(row);
}

function showRecipients(type, values) {
  const container = $(type + "Recipients");
  container.innerHTML = "";

  (values && values.length ? values : [""])
    .forEach(value => addRecipient(type, value));
}

function readRecipients(type) {
  return [...$(type + "Recipients").querySelectorAll("input")]
    .map(input => input.value.trim())
    .filter(Boolean);
}

document.querySelectorAll("[data-add-recipient]").forEach(button => {
  button.addEventListener("click", () => {
    addRecipient(button.dataset.addRecipient);
  });
});

/* =====================================
   MODAL AND EDITING
===================================== */

function showModal() {
  $("modalBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("modalBackdrop").hidden = true;
  document.body.style.overflow = "";
}

function openEditor(id) {
  const t = templates.find(item => item.id === id);
  if (!t) return;

  currentId = id;

  $("modalKicker").textContent = "TEMPLATE DETAILS";
  $("modalTitle").textContent = "Edit template";
  $("editTitle").value = t.title;
  $("editSubject").value = dated(t.subject);
  $("editBody").value = dated(t.body);

  showRecipients("to", t.to);
  showRecipients("cc", t.cc);
  showRecipients("bcc", t.bcc);

  $("editFields").hidden = false;
  $("previewFields").hidden = true;

  showModal();
}

function openPreview(id) {
  const t = templates.find(item => item.id === id);
  if (!t) return;

  currentId = id;

  $("modalKicker").textContent = "TEMPLATE PREVIEW";
  $("modalTitle").textContent = t.title;

  $("previewTo").textContent = t.to.filter(Boolean).join(", ") || "—";
  $("previewCc").textContent = t.cc.filter(Boolean).join(", ") || "—";
  $("previewBcc").textContent = t.bcc.filter(Boolean).join(", ") || "—";
  $("previewSubject").textContent = dated(t.subject);
  $("previewBody").textContent = dated(t.body);

  $("editFields").hidden = true;
  $("previewFields").hidden = false;

  showModal();
}

$("saveEdit").addEventListener("click", () => {
  const t = templates.find(item => item.id === currentId);
  if (!t) return;

  const title = $("editTitle").value.trim();

  if (!title) {
    notify("Enter a template title");
    return;
  }

  const recipients = {
    to: readRecipients("to"),
    cc: readRecipients("cc"),
    bcc: readRecipients("bcc")
  };

  for (const type of ["to", "cc", "bcc"]) {
    for (const email of recipients[type]) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        notify("Check the " + type.toUpperCase() + " email address");
        return;
      }
    }
  }

  t.title = title;
  t.subject = $("editSubject").value;
  t.body = $("editBody").value;
  t.to = recipients.to;
  t.cc = recipients.cc;
  t.bcc = recipients.bcc;

  save(KEYS.templates, templates);
  closeModal();
  renderTemplates();
  notify("Template saved");
});

$("previewEdit").addEventListener("click", () => openEditor(currentId));
$("closeModal").addEventListener("click", closeModal);
$("cancelEdit").addEventListener("click", closeModal);

$("modalBackdrop").addEventListener("click", event => {
  if (event.target === $("modalBackdrop")) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !$("modalBackdrop").hidden) closeModal();
});

/* =====================================
   GMAIL COMPOSE
===================================== */

function composeGmail(t) {
  const params = new URLSearchParams();

  const to = (t.to || []).filter(Boolean).join(",");
  const cc = (t.cc || []).filter(Boolean).join(",");
  const bcc = (t.bcc || []).filter(Boolean).join(",");

  if (to) params.set("to", to);
  if (cc) params.set("cc", cc);
  if (bcc) params.set("bcc", bcc);

  params.set("su", dated(t.subject));
  params.set("body", dated(t.body));

  const url = "https://mail.google.com/mail/?view=cm&fs=1&" +
    params.toString();

  const win = window.open(url, "_blank");

  if (!win) {
    notify("Allow pop-ups to open Gmail");
    return;
  }

  drafts.unshift({
    ...t,
    to: [...(t.to || [])],
    cc: [...(t.cc || [])],
    bcc: [...(t.bcc || [])],
    subject: dated(t.subject),
    body: dated(t.body),
    savedAt: new Date().toISOString()
  });

  save(KEYS.drafts, drafts);
  notify("Gmail compose opened");
}

$("previewCompose").addEventListener("click", () => {
  const t = templates.find(item => item.id === currentId);
  if (t) composeGmail(t);
});

/* =====================================
   DRAFTS
===================================== */

function renderDrafts() {
  const grid = $("templateGrid");
  grid.innerHTML = "";

  $("emptyState").hidden = drafts.length > 0;

  drafts.forEach((draft, index) => {
    const card = document.createElement("article");
    card.className = "template-card";

    const title = document.createElement("h3");
    title.textContent = draft.title;

    const subject = document.createElement("p");
    subject.className = "card-subject";
    subject.textContent = draft.subject;

    const body = document.createElement("p");
    body.className = "card-description";
    body.textContent = (draft.body || "").slice(0, 110);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const compose = document.createElement("button");
    compose.className = "primary-button";
    compose.textContent = "Open in Gmail";
    compose.onclick = () => composeGmail(draft);

    const remove = document.createElement("button");
    remove.className = "secondary-button";
    remove.textContent = "Delete";

    remove.onclick = () => {
      if (!confirm("Delete this saved draft?")) return;
      drafts.splice(index, 1);
      save(KEYS.drafts, drafts);
      renderDrafts();
      notify("Draft deleted");
    };

    actions.append(compose, remove);
    card.append(title, subject, body, actions);
    grid.appendChild(card);
  });
}

/* =====================================
   WORKSPACE 2 - 22 SHEETS
===================================== */

const defaultSheets = Array.from({ length: 22 }, (_, i) => ({
  id: i + 1,
  name: "Sheet " + String(i + 1).padStart(2, "0"),
  checked: false
}));

let sheets = read(KEYS.sheets, defaultSheets);

if (!Array.isArray(sheets)) sheets = defaultSheets;

sheets = sheets.filter(s => s && typeof s === "object")
  .map((s, i) => ({
    id: s.id ?? i + 1,
    name: String(s.name || "Sheet " + String(i + 1).padStart(2, "0")),
    checked: Boolean(s.checked)
  }));

let nextSheetId = Math.max(0, ...sheets.map(s => Number(s.id) || 0)) + 1;

function saveSheets() {
  save(KEYS.sheets, sheets);
}

async function copySheetName(name) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(name);
    return;
  }

  const input = document.createElement("textarea");
  input.value = name;
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();

  const success = document.execCommand("copy");
  input.remove();

  if (!success) throw new Error("Copy failed");
}

function renderSheets() {
  const container = $("sheetList");
  container.innerHTML = "";

  sheets.forEach(sheet => {
    const row = document.createElement("div");
    row.className = "sheet-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "sheet-checkbox";
    checkbox.checked = sheet.checked;

    checkbox.addEventListener("change", () => {
      sheet.checked = checkbox.checked;
      saveSheets();
    });

    const info = document.createElement("div");
    info.className = "sheet-info";

    const name = document.createElement("span");
    name.className = "sheet-name";
    name.textContent = sheet.name;

    const date = document.createElement("span");
    date.className = "sheet-date";
    date.textContent = sheetDate();

    info.append(name, date);

    const actions = document.createElement("div");
    actions.className = "sheet-actions";

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "sheet-action copy";
    copy.textContent = "Copy";

    copy.addEventListener("click", async () => {
      try {
        await copySheetName(sheet.name);
        notify("Sheet name copied: " + sheet.name);
      } catch {
        notify("Copy failed. Please try again.");
      }
    });

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "sheet-action";
    edit.textContent = "Edit";

    edit.addEventListener("click", () => {
      const result = prompt("Edit sheet name:", sheet.name);
      if (result === null) return;

      if (!result.trim()) {
        notify("Sheet name cannot be empty");
        return;
      }

      sheet.name = result.trim();
      saveSheets();
      renderSheets();
      notify("Sheet name updated");
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "sheet-action delete";
    remove.textContent = "Delete";

    remove.addEventListener("click", () => {
      if (!confirm("Delete " + sheet.name + "?")) return;

      sheets = sheets.filter(s => s.id !== sheet.id);
      saveSheets();
      renderSheets();
      notify("Sheet deleted");
    });

    actions.append(copy, edit, remove);
    row.append(checkbox, info, actions);
    container.appendChild(row);
  });

  $("sheetCount").textContent =
    sheets.length + (sheets.length === 1 ? " sheet name" : " sheet names");
}

/* ADD SHEET */

$("addSheetButton").addEventListener("click", () => {
  const result = prompt("Enter new sheet name:");

  if (result === null) return;

  if (!result.trim()) {
    notify("Enter a sheet name");
    return;
  }

  sheets.push({
    id: nextSheetId++,
    name: result.trim(),
    checked: false
  });

  saveSheets();
  renderSheets();
  notify("New sheet added");
});

/* CLEAR ALL */

$("clearAllSheets").addEventListener("click", () => {
  if (!sheets.length) {
    notify("No sheet names available");
    return;
  }

  if (!confirm("Are you sure you want to delete all sheet names?")) return;

  sheets = [];
  saveSheets();
  renderSheets();
  notify("All sheets cleared
