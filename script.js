
"use strict";

const $ = id => document.getElementById(id);

const TEMPLATE_KEY = "lakshman_mail_templates_v5";
const DRAFT_KEY = "lakshman_mail_drafts_v1";
const BACKUP_KEY = "lakshman_backup_status_v5";
const SHEET_KEY = "lakshman_sheet_names_v5";

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* DISPLAY DATE AS MM/DD/YYYY */
function formatDate(value) {
  if (!value) return "";
  const date = typeof value === "string"
    ? new Date(value + "T00:00:00")
    : value;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

function dateForChoice(type) {
  const date = new Date();
  if (type === "tomorrow") date.setDate(date.getDate() + 1);
  return dateKey(date);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function parseEmails(value) {
  return String(value || "")
    .split(/[,;\n]+/)
    .map(v => v.trim())
    .filter(Boolean);
}

function button(text, className, action) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.className = className;
  b.addEventListener("click", action);
  return b;
}

/* DEFAULT EMAIL TEMPLATES */

const defaultTemplates = [
  {
    title: "Project status — weekly",
    subject: "Project status — weekly — {DATE}",
    to: "",
    cc: "",
    body: "Hi Mira,\n\nHere is the latest project status as of {DATE}.\n\nHighlights:\n• Product review is on track\n• Development updates are completed\n• Pending items are being followed up\n\nPlease let me know if you need any additional details.\n\nRegards,\nLakshman Mavilla"
  },
  {
    title: "Design review follow-up",
    subject: "Design review follow-up — {DATE}",
    to: "",
    cc: "",
    body: "Hi Team,\n\nThank you for the thoughtful review. I have folded the agreed changes into the latest version.\n\nPlease review and share any further feedback.\n\nRegards,\nLakshman Mavilla"
  },
  {
    title: "Invoice reminder",
    subject: "Invoice follow-up — {DATE}",
    to: "",
    cc: "",
    body: "Hi,\n\nThis is a quick follow-up on the pending invoice. Could you please confirm its expected processing date?\n\nThank you.\n\nRegards,\nLakshman Mavilla"
  },
  {
    title: "Meeting confirmation",
    subject: "Meeting confirmation — {DATE}",
    to: "",
    cc: "",
    body: "Hi Nina,\n\nConfirming our conversation for {DATE}. I have set aside the full hour and will be ready to discuss the agenda.\n\nLooking forward to speaking with you.\n\nRegards,\nLakshman Mavilla"
  },
  {
    title: "Partner introduction",
    subject: "Partner introduction — {DATE}",
    to: "",
    cc: "",
    body: "Hi Samir,\n\nSharing this introduction with you. I wanted to connect you with our partner team to explore the next steps.\n\nPlease let me know if I can help coordinate.\n\nRegards,\nLakshman Mavilla"
  },
  {
    title: "Request for materials",
    subject: "Request for materials — {DATE}",
    to: "",
    cc: "",
    body: "Hi Devon,\n\nBefore we meet on {DATE}, could you send over the latest research notes and supporting materials?\n\nThank you for your help.\n\nRegards,\nLakshman Mavilla"
  },
  {
    title: "Decision log update",
    subject: "Decision log update — {DATE}",
    to: "",
    cc: "",
    body: "Hi Team,\n\nHere is the decision log update for {DATE}.\n\nDecisions:\n• The current plan is approved\n• Owners have been assigned\n• Next steps will be tracked\n\nRegards,\nLakshman Mavilla"
  },
  {
    title: "Thank-you note",
    subject: "Thank-you for the conversation — {DATE}",
    to: "",
    cc: "",
    body: "Hi,\n\nThank you for your time and support. I appreciate the discussion and the helpful suggestions.\n\nLooking forward to staying in touch.\n\nRegards,\nLakshman Mavilla"
  },
  {
    title: "Daily report",
    subject: "Daily report — {DATE}",
    to: "",
    cc: "",
    body: "Hi Team,\n\nPlease find below the daily summary report for {DATE}.\n\nDaily AM report:\n\nNote: There is no bulk available today.\n\nRegards,\nLakshman Mavilla"
  },
  {
    title: "Task completion update",
    subject: "Task completion update — {DATE}",
    to: "",
    cc: "",
    body: "Hi Team,\n\nI would like to confirm that the assigned tasks have been completed as of {DATE}.\n\nPlease let me know if anything else is required.\n\nRegards,\nLakshman Mavilla"
  }
];

let templates = load(TEMPLATE_KEY, null);

if (!Array.isArray(templates)) {
  templates = defaultTemplates.map(item => ({
    ...item,
    id: uid()
  }));
  save(TEMPLATE_KEY, templates);
}

let drafts = load(DRAFT_KEY, []);

let sheetNames = load(SHEET_KEY, [
  "Weekly Planning",
  "Content Calendar",
  "Project Brief",
  "Budget Tracker",
  "Meeting Notes",
  "Client Intake",
  "Launch Checklist",
  "Resource Library",
  "Team Roster",
  "Quarterly Review",
  "Sheet 11",
  "Sheet 12",
  "Sheet 13",
  "Sheet 14",
  "Sheet 15",
  "Sheet 16",
  "Sheet 17",
  "Sheet 18",
  "Sheet 19",
  "Sheet 20"
]);

let backupStatus = load(BACKUP_KEY, {});
let mailDate = dateKey(new Date());
let backupDate = dateKey(new Date());
let previewTemplateId = null;

/* NAVIGATION */

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".side-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });

  $("mobileMenuBtn").closest(".mobile-header")
    .querySelector("strong").textContent =
      pageId === "backupPage"
        ? "Lakshman Backup List"
        : "Lakshman Workspace";

  $("sidebar").classList.remove("open");
}

document.querySelectorAll(".side-link").forEach(link => {
  link.addEventListener("click", () => showPage(link.dataset.page));
});

$("backToMail").addEventListener("click", () => showPage("mailPage"));

$("mobileMenuBtn").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

/* MAIL DATE */

function updateMailDate() {
  const today = dateKey(new Date());
  const tomorrow = dateForChoice("tomorrow");

  $("todayDate").textContent = formatDate(today);
  $("tomorrowDate").textContent = formatDate(tomorrow);
  $("mailSelectedDate").textContent = formatDate(mailDate);
  $("mailCustomDate").value = mailDate;

  document.querySelectorAll("[data-date]").forEach(b => {
    b.classList.toggle(
      "active",
      b.dataset.date === (
        mailDate === today ? "today" :
        mailDate === tomorrow ? "tomorrow" : "custom"
      )
    );
  });
}

document.querySelectorAll("[data-date]").forEach(b => {
  b.addEventListener("click", () => {
    mailDate = dateForChoice(b.dataset.date);
    updateMailDate();
    renderTemplates();
  });
});

$("mailCustomDate").addEventListener("change", e => {
  if (!e.target.value) return;
  mailDate = e.target.value;
  updateMailDate();
  renderTemplates();
});

/* TEMPLATE RENDERING */

function fillDate(text) {
  return String(text || "").replaceAll("{DATE}", formatDate(mailDate));
}

function renderTemplates() {
  const grid = $("templateGrid");
  const search = $("templateSearch").value.toLowerCase().trim();

  grid.innerHTML = "";

  const filtered = templates.filter(t => {
    const combined = [
      t.title, t.subject, t.to, t.cc, t.body
    ].join(" ").toLowerCase();

    return combined.includes(search);
  });

  filtered.forEach((template, index) => {
    const card = document.createElement("article");
    card.className = "template-card";

    const top = document.createElement("div");
    top.className = "card-topline";

    const number = document.createElement("div");
    number.innerHTML =
      `<span class="card-number">${String(index + 1).padStart(2, "0")}</span>` +
      `<span class="card-ready">READY</span>`;

    const edit = button("✎", "edit-icon", () => {
      openTemplateForm(template.id);
    });

    top.append(number, edit);

    const title = document.createElement("h3");
    title.textContent = fillDate(template.title);

    const subtitle = document.createElement("div");
    subtitle.className = "card-subtitle";
    subtitle.textContent = fillDate(template.subject);

    const excerpt = document.createElement("div");
    excerpt.className = "card-excerpt";
    excerpt.textContent = fillDate(template.body);

    const meta = document.createElement("div");
    meta.className = "card-meta";

    const recipients = document.createElement("span");
    recipients.textContent =
      (parseEmails(template.to)[0] || "No recipient") +
      " · " + (parseEmails(template.cc).length
        ? parseEmails(template.cc).length + " cc"
        : "No cc");

    const dateTag = document.createElement("span");
    dateTag.textContent = "Date-aware";

    meta.append(recipients, dateTag);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    actions.append(
      button("Preview ↗", "preview-btn", () => openPreview(template.id)),
      button("➤ Compose", "compose-btn", () => openGmailComposer(template.id))
    );

    card.append(top, title, subtitle, excerpt, meta, actions);

    grid.appendChild(card);
  });

  $("emptyTemplates").hidden = filtered.length > 0;
  $("readyCount").textContent =
    `${templates.length} of ${templates.length}`;
  $("templateSideCount").textContent = templates.length;
}

$("templateSearch").addEventListener("input", renderTemplates);

/* TEMPLATE EDITOR */

function addEmailRow(containerId, value = "") {
  const container = $(containerId);
  const row = document.createElement("div");
  row.className = "email-row";

  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = "name@example.com";
  input.value = value;

  const remove = button("×", "", () => {
    if (container.children.length > 1) {
      row.remove();
    } else {
      input.value = "";
    }
  });

  row.append(input, remove);
  container.appendChild(row);
}

function setEmailRows(containerId, values) {
  const container = $(containerId);
  container.innerHTML = "";
  (values.length ? values : [""]).forEach(v => addEmailRow(containerId, v));
}

function getEmailRows(containerId) {
  return [...$(containerId).querySelectorAll("input")]
    .map(i => i.value.trim())
    .filter(Boolean);
}

function openTemplateForm(id = "") {
  $("templateForm").reset();
  $("templateId").value = "";

  if (id) {
    const t = templates.find(item => item.id === id);
    if (!t) return;

    $("modalTitle").textContent = "Edit template";
    $("templateId").value = t.id;
    $("formTitle").value = t.title;
    $("formSubject").value = t.subject;
    $("formBody").value = t.body;

    setEmailRows("formToRows", parseEmails(t.to));
    setEmailRows("formCcRows", parseEmails(t.cc));
  } else {
    $("modalTitle").textContent = "Add template";
    setEmailRows("formToRows", [""]);
    setEmailRows("formCcRows", [""]);
  }

  openModal("templateModal");
}

function openModal(id) {
  $(id).classList.add("show");
}

function closeModal(id) {
  $(id).classList.remove("show");
}

$("addTemplateBtn").addEventListener("click", () => openTemplateForm());
$("addToBtn").addEventListener("click", () => addEmailRow("formToRows"));
$("addCcBtn").addEventListener("click", () => addEmailRow("formCcRows"));

$("templateForm").addEventListener("submit", e => {
  e.preventDefault();

  const id = $("templateId").value;
  const old = templates.find(t => t.id === id);

  const item = {
    id: id || uid(),
    title: $("formTitle").value.trim(),
    subject: $("formSubject").value.trim(),
    to: getEmailRows("formToRows").join(", "),
    cc: getEmailRows("formCcRows").join(", "),
    body: $("formBody").value
  };

  if (!item.title || !item.subject || !item.body.trim()) {
    showToast("Complete all required fields.");
    return;
  }

  if (old) {
    templates = templates.map(t => t.id === id ? item : t);
  } else {
    templates.push(item);
  }

  save(TEMPLATE_KEY, templates);
  renderTemplates();
  closeModal("templateModal");
  showToast("Template saved.");
});

/* DIRECT GMAIL COMPOSE */

function openGmailComposer(id) {
  const t = templates.find(item => item.id === id);
  if (!t) return;

  const params = new URLSearchParams();
  params.set("view", "cm");
  params.set("fs", "1");

  const to = parseEmails(t.to);
  const cc = parseEmails(t.cc);

  if (to.length) params.set("to", to.join(","));
  if (cc.length) params.set("cc", cc.join(","));

  params.set("su", fillDate(t.subject));
  params.set("body", fillDate(t.body));

  const url = "https://mail.google.com/mail/u/0/?" + params.toString();

  // Direct Gmail tab. No preview page and no mailto link.
  const tab = window.open(url, "_blank");

  if (!tab) {
    showToast("Allow pop-ups in Chrome to open Gmail.");
  }
}

/* PREVIEW */

function openPreview(id) {
  const t = templates.find(item => item.id === id);
  if (!t) return;

  previewTemplateId = id;

  $("previewTo").textContent = t.to || "No recipient";
  $("previewCc").textContent = t.cc || "No Cc";
  $("previewSubject").textContent = fillDate(t.subject);
  $("previewBody").textContent = fillDate(t.body);

  openModal("previewModal");
}

$("previewComposeBtn").addEventListener("click", () => {
  if (previewTemplateId) {
    closeModal("previewModal");
    openGmailComposer(previewTemplateId);
  }
});

/* DRAFTS */

function renderDrafts() {
  const list = $("draftList");
  list.innerHTML = "";

  if (!drafts.length) {
    list.textContent = "No locally saved drafts yet.";
    return;
  }

  drafts.forEach(draft => {
    const row = document.createElement("div");
    row.className = "draft-item";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = draft.subject || "Untitled draft";

    const small = document.createElement("small");
    small.textContent = "Saved " + formatDate(draft.date);

    info.append(title, small);

    const actions = document.createElement("div");

    actions.append(
      button("Open Gmail ↗", "dark-btn", () => {
        openDraftInGmail(draft);
      }),
      button("Delete", "light-btn", () => {
        drafts = drafts.filter(d => d.id !== draft.id);
        save(DRAFT_KEY, drafts);
        renderDrafts();
      })
    );

    row.append(info, actions);
    list.appendChild(row);
  });
}

function openDraftInGmail(draft) {
  const params = new URLSearchParams();
  params.set("view", "cm");
  params.set("fs", "1");
  if (draft.to) params.set("to", draft.to);
  if (draft.cc) params.set("cc", draft.cc);
  params.set("su", draft.subject || "");
  params.set("body", draft.body || "");
  window.open("https://mail.google.com/mail/u/0/?" + params.toString(), "_blank");
}

/* BACKUP DATE */

function currentBackupStatus() {
  if (!backupStatus[backupDate]) backupStatus[backupDate] = {};
  return backupStatus[backupDate];
}

function updateBackupDateUI() {
  $("backupDateReadable").textContent = formatDate(backupDate);
  $("backupCustomDate").value = backupDate;

  const today = dateForChoice("today");
  const tomorrow = dateForChoice("tomorrow");

  document.querySelectorAll("[data-backup-date]").forEach(b => {
    const active =
      (b.dataset.backupDate === "today" && backupDate === today) ||
      (b.dataset.backupDate === "tomorrow" && backupDate === tomorrow);

    b.classList.toggle("active", active);
  });
}

document.querySelectorAll("[data-backup-date]").forEach(b => {
  b.addEventListener("click", () => {
    backupDate = dateForChoice(b.dataset.backupDate);
    updateBackupDateUI();
    renderSheets();
  });
});

$("backupCustomDate").addEventListener("change", e => {
  if (!e.target.value) return;
  backupDate = e.target.value;
  updateBackupDateUI();
  renderSheets();
});

/* BACKUP LIST */

function renderSheets() {
  const list = $("sheetList");
  const status = currentBackupStatus();

  list.innerHTML = "";

  sheetNames.forEach((name, index) => {
    const row = document.createElement("div");
    row.className = "sheet-row" + (status[name] ? " done" : "");

    const info = document.createElement("div");
    info.className = "sheet-info";

    const icon = document.createElement("div");
    icon.className = "sheet-icon";
    icon.textContent = "▤";

    const titleBox = document.createElement("div");
    titleBox.className = "sheet-title";

    const title = document.createElement("span");
    title.textContent = `${name} - ${formatDate(backupDate)}`;

    const small = document.createElement("small");
    small.textContent = `Sheet ${String(index + 1).padStart(2, "0")}`;

    titleBox.append(title, small);

    const rename = button("✎", "rename-sheet", () => {
      const next = prompt("Enter new sheet name:", name);
      if (!next || !next.trim()) return;

      const clean = next.trim();

      if (sheetNames.some((n, i) =>
        i !== index && n.toLowerCase() === clean.toLowerCase()
      )) {
        showToast("This sheet name already exists.");
        return;
      }

      const wasDone = Boolean(status[name]);
      delete status[name];
      status[clean] = wasDone;
      sheetNames[index] = clean;

      save(SHEET_KEY, sheetNames);
      save(BACKUP_KEY, backupStatus);
      renderSheets();
    });

    info.append(icon, titleBox, rename);

    const copy = button("▢ Copy name", "copy-name", () => {
      copyText(`${name} - ${formatDate(backupDate)}`);
    });

    const statusBox = document.createElement("label");
    statusBox.className = "sheet-status";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = Boolean(status[name]);

    check.addEventListener("change", () => {
      status[name] = check.checked;
      save(BACKUP_KEY, backupStatus);
      renderSheets();
    });

    const statusText = document.createElement("span");
    statusText.textContent = status[name] ? "Done" : "Not taken";

    statusBox.append(check, statusText);
    row.append(info, copy, statusBox);
    list.appendChild(row);
  });

  const completed = sheetNames.filter(name => status[name]).length;
  $("backupProgress").textContent = `${completed} / ${sheetNames.length} done`;
}

$("uncheckAllBtn").addEventListener("click", () => {
  if (!confirm("Uncheck all sheets for this date?")) return;

  backupStatus[backupDate] = {};
  save(BACKUP_KEY, backupStatus);
  renderSheets();
  showToast("All statuses unchecked.");
});

/* COPY */

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    showToast("Copied: " + value);
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showToast("Copied successfully.");
  }
}

/* MODAL CLOSE */

document.querySelectorAll("[data-close]").forEach(b => {
  b.addEventListener("click", () => closeModal(b.dataset.close));
});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", e => {
    if (e.target === backdrop) backdrop.classList.remove("show");
  });
});

/* START */

$("currentDate")?.textContent;
updateMailDate();
updateBackupDateUI();
renderTemplates();
renderDrafts();
renderSheets();
