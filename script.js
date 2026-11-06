/* =========================================
   LAKSHMAN MAIL DESK
   Main application script
========================================= */

const $ = (id) => document.getElementById(id);

const STORAGE = {
  templates: "lakshman_mail_templates_v1",
  drafts: "lakshman_mail_drafts_v1",
  sheets: "lakshman_mail_sheets_v1"
};

function loadData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =========================================
   DEFAULT EMAIL TEMPLATES
========================================= */

const DEFAULT_TEMPLATES = [
  {
    id: 1,
    title: "Work Update",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Daily Work Update - {{DATE}}",
    body: "Hi Team,\n\nPlease find the work update for {{DATE}}.\n\nRegards,\nLakshman"
  },
  {
    id: 2,
    title: "Leave Request",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Leave Request - {{DATE}}",
    body: "Hi Team,\n\nI would like to request leave on {{DATE}} due to personal reasons.\n\nKindly approve my request.\n\nRegards,\nLakshman"
  },
  {
    id: 3,
    title: "Work From Home",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Work From Home Request - {{DATE}}",
    body: "Hi Team,\n\nI would like to request work from home on {{DATE}}.\n\nPlease let me know if any further details are required.\n\nRegards,\nLakshman"
  },
  {
    id: 4,
    title: "Meeting Request",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Meeting Request - {{DATE}}",
    body: "Hi Team,\n\nI would like to schedule a meeting on {{DATE}}.\n\nPlease share your availability.\n\nRegards,\nLakshman"
  },
  {
    id: 5,
    title: "Follow Up",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Follow Up - {{DATE}}",
    body: "Hi Team,\n\nI am following up regarding the previous communication.\n\nPlease share an update when possible.\n\nRegards,\nLakshman"
  },
  {
    id: 6,
    title: "Task Completion",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Task Completed - {{DATE}}",
    body: "Hi Team,\n\nThe assigned task has been completed successfully on {{DATE}}.\n\nPlease let me know if anything else is required.\n\nRegards,\nLakshman"
  },
  {
    id: 7,
    title: "Issue Report",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Issue Report - {{DATE}}",
    body: "Hi Team,\n\nI would like to report an issue.\n\nIssue details:\n\nPlease check and help resolve this issue.\n\nRegards,\nLakshman"
  },
  {
    id: 8,
    title: "Status Update",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Status Update - {{DATE}}",
    body: "Hi Team,\n\nHere is the current status update as of {{DATE}}.\n\nStatus:\n\nRegards,\nLakshman"
  },
  {
    id: 9,
    title: "Thank You",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Thank You",
    body: "Hi Team,\n\nThank you for your support and assistance.\n\nI really appreciate your help.\n\nRegards,\nLakshman"
  },
  {
    id: 10,
    title: "General Email",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "Regarding - {{DATE}}",
    body: "Hi Team,\n\nI am writing this email regarding the below details.\n\nPlease check and let me know.\n\nRegards,\nLakshman"
  }
];

let templates = loadData(STORAGE.templates, DEFAULT_TEMPLATES);
let drafts = loadData(STORAGE.drafts, []);

let currentTemplateId = null;
let currentView = "templates";
let toastTimer;

/* =========================================
   DATE MANAGEMENT - WORKSPACE 1
========================================= */

let mailDateMode = "today";
let mailCustomDate = "";

function dateValue(mode, custom) {
  const date = new Date();

  if (mode === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }

  if (mode === "custom" && custom) {
    return new Date(custom + "T12:00:00");
  }

  return date;
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatInputDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMailDate() {
  return formatDate(dateValue(mailDateMode, mailCustomDate));
}

function updateMailDateUI() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  $("todayLabel").textContent = formatDate(today);
  $("tomorrowLabel").textContent = formatDate(tomorrow);

  document.querySelectorAll("[data-date]").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.date === mailDateMode
    );
  });

  $("customDate").value = mailCustomDate;
  $("activeDateLabel").textContent = getMailDate();
}

document.querySelectorAll("[data-date]").forEach(button => {
  button.addEventListener("click", () => {
    mailDateMode = button.dataset.date;
    updateMailDateUI();
    renderTemplates();
  });
});

$("customDate").addEventListener("change", event => {
  if (!event.target.value) return;

  mailCustomDate = event.target.value;
  mailDateMode = "custom";

  updateMailDateUI();
  renderTemplates();
});

/* =========================================
   DATE MANAGEMENT - WORKSPACE 2
========================================= */

let w2DateMode = "today";
let w2CustomDate = "";

function getW2Date() {
  return formatDate(dateValue(w2DateMode, w2CustomDate));
}

function updateW2DateUI() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  $("w2TodayLabel").textContent = formatDate(today);
  $("w2TomorrowLabel").textContent = formatDate(tomorrow);

  document.querySelectorAll("[data-w2-date]").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.w2Date === w2DateMode
    );
  });

  $("w2CustomDate").value = w2CustomDate;
  $("w2ActiveDateLabel").textContent = getW2Date();
}

document.querySelectorAll("[data-w2-date]").forEach(button => {
  button.addEventListener("click", () => {
    w2DateMode = button.dataset.w2Date;
    updateW2DateUI();
    renderSheets();
  });
});

$("w2CustomDate").addEventListener("change", event => {
  if (!event.target.value) return;

  w2CustomDate = event.target.value;
  w2DateMode = "custom";

  updateW2DateUI();
  renderSheets();
});

/* =========================================
   TOAST MESSAGE
========================================= */

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

/* =========================================
   TEMPLATE MANAGEMENT
========================================= */

function cleanArray(array) {
  return (Array.isArray(array) ? array : [""])
    .map(value => String(value || ""));
}

function normalizeTemplate(template) {
  return {
    id: template.id,
    title: template.title || "Untitled",
    to: cleanArray(template.to),
    cc: cleanArray(template.cc),
    bcc: cleanArray(template.bcc),
    subject: template.subject || "",
    body: template.body || ""
  };
}

templates = templates.map(normalizeTemplate);

function replaceDate(text) {
  return String(text || "").replace(/\{\{DATE\}\}/g, getMailDate());
}

function renderTemplates() {
  const grid = $("templateGrid");
  const search = $("searchInput").value.toLowerCase();

  grid.innerHTML = "";

  const filtered = templates.filter(template => {
    const text = [
      template.title,
      template.subject,
      ...template.to,
      ...template.cc,
      ...template.bcc
    ].join(" ").toLowerCase();

    return text.includes(search);
  });

  $("readyCount").textContent = templates.length;
  $("templateCount").textContent = templates.length;

  $("emptyState").hidden = filtered.length !== 0;

  filtered.forEach((template, index) => {
    const card = document.createElement("article");
    card.className = "template-card";

    const number = String(index + 1).padStart(2, "0");

    const heading = document.createElement("div");
    heading.className = "card-number";
    heading.textContent = `TEMPLATE ${number}`;

    const title = document.createElement("h3");
    title.textContent = template.title;

    const subject = document.createElement("p");
    subject.className = "card-subject";
    subject.textContent = replaceDate(template.subject);

    const description = document.createElement("p");
    description.className = "card-description";
    description.textContent = template.body.substring(0, 105) + "...";

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const preview = document.createElement("button");
    preview.className = "primary-button";
    preview.textContent = "View Details";
    preview.addEventListener("click", () => openPreview(template.id));

    const edit = document.createElement("button");
    edit.className = "secondary-button";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => openEditor(template.id));

    actions.append(preview, edit);
    card.append(heading, title, subject, description, actions);
    grid.appendChild(card);
  });
}

$("searchInput").addEventListener("input", renderTemplates);

/* =========================================
   MODAL MANAGEMENT
========================================= */

function openModal() {
  $("modalBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("modalBackdrop").hidden = true;
  document.body.style.overflow = "";
}

function openEditor(id) {
  const template = templates.find(item => item.id === id);
  if (!template) return;

  currentTemplateId = id;

  $("modalKicker").textContent = "EDIT TEMPLATE";
  $("modalTitle").textContent = template.title;

  $("editTitle").value = template.title;
  $("editSubject").value = replaceDate(template.subject);
  $("editBody").value = replaceDate(template.body);

  renderRecipientFields("to", template.to);
  renderRecipientFields("cc", template.cc);
  renderRecipientFields("bcc", template.bcc);

  $("editFields").hidden = false;
  $("previewFields").hidden = true;

  openModal();
}

function openPreview(id) {
  const template = templates.find(item => item.id === id);
  if (!template) return;

  currentTemplateId = id;

  $("modalKicker").textContent = "TEMPLATE PREVIEW";
  $("modalTitle").textContent = template.title;

  $("previewTo").textContent = template.to.filter(Boolean).join(", ") || "—";
  $("previewCc").textContent = template.cc.filter(Boolean).join(", ") || "—";
  $("previewBcc").textContent = template.bcc.filter(Boolean).join(", ") || "—";
  $("previewSubject").textContent = replaceDate(template.subject);
  $("previewBody").textContent = replaceDate(template.body);

  $("editFields").hidden = true;
  $("previewFields").hidden = false;

  openModal();
}

function renderRecipientFields(type, values) {
  const container = $(`${type}Recipients`);
  container.innerHTML = "";

  const list = values.length ? values : [""];

  list.forEach(value => {
    addRecipientRow(type, value);
  });
}

function addRecipientRow(type, value = "") {
  const container = $(`${type}Recipients`);

  const row = document.createElement("div");
  row.className = "recipient-row";

  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = "Enter email address";
  input.value = value;
  input.className = `${type}-email`;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-recipient";
  remove.textContent = "×";
  remove.setAttribute("aria-label", "Remove email");

  remove.addEventListener("click", () => {
    if (container.children.length > 1) {
      row.remove();
    } else {
      input.value = "";
    }
  });

  row.append(input, remove);
  container.appendChild(row);
}

document.querySelectorAll("[data-add-recipient]").forEach(button => {
  button.addEventListener("click", () => {
    addRecipientRow(button.dataset.addRecipient);
  });
});

function getRecipients(type) {
  return [...$(`${type}Recipients`).querySelectorAll("input")]
    .map(input => input.value.trim())
    .filter(Boolean);
}

/* =========================================
   SAVE TEMPLATE
========================================= */

$("saveEdit").addEventListener("click", () => {
  const title = $("editTitle").value.trim();
  const subject = $("editSubject").value.trim();

  if (!title) {
    showToast("Please enter template title");
    return;
  }

  const recipients = {
    to: getRecipients("to"),
    cc: getRecipients("cc"),
    bcc: getRecipients("bcc")
  };

  for (const type of ["to", "cc", "bcc"]) {
    for (const email of recipients[type]) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast(`Please check the ${type.toUpperCase()} email address`);
        return;
      }
    }
  }

  const index = templates.findIndex(
    template => template.id === currentTemplateId
  );

  if (index === -1) return;

  templates[index] = {
    ...templates[index],
    title,
    subject,
    body: $("editBody").value,
    ...recipients
  };

  saveData(STORAGE.templates, templates);

  closeModal();
  renderTemplates();
  showToast("Template saved successfully");
});

/* =========================================
   PREVIEW ACTIONS
========================================= */

$("previewEdit").addEventListener("click", () => {
  openEditor(currentTemplateId);
});

function composeGmail(template) {
  const to = template.to.filter(Boolean).join(",");
  const cc = template.cc.filter(Boolean).join(",");
  const bcc = template.bcc.filter(Boolean).join(",");

  const params = new URLSearchParams();

  if (to) params.set("to", to);
  if (cc) params.set("cc", cc);
  if (bcc) params.set("bcc", bcc);

  params.set("su", replaceDate(template.subject));
  params.set("body", replaceDate(template.body));

  const url = "https://mail.google.com/mail/?view=cm&fs=1&" +
    params.toString();

  window.open(url, "_blank");

  const draft = {
    ...template,
    savedAt: new Date().toISOString(),
    subject: replaceDate(template.subject),
    body: replaceDate(template.body)
  };

  drafts.unshift(draft);
  saveData(STORAGE.drafts, drafts);

  showToast("Gmail compose opened");
}

$("previewCompose").addEventListener("click", () => {
  const template = templates.find(
    item => item.id === currentTemplateId
  );

  if (!template) return;

  composeGmail(template);
});

$("closeModal").addEventListener("click", closeModal);
$("cancelEdit").addEventListener("click", closeModal);

$("modalBackdrop").addEventListener("click", event => {
  if (event.target === $("modalBackdrop")) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !$("modalBackdrop").hidden) {
    closeModal();
  }
});

/* =========================================
   DRAFTS
========================================= */

function renderDrafts() {
  const grid = $("templateGrid");
  grid.innerHTML = "";

  $("emptyState").hidden = drafts.length !== 0;

  drafts.forEach((draft, index) => {
    const card = document.createElement("article");
    card.className = "template-card";

    const number = document.createElement("div");
    number.className = "card-number";
    number.textContent = `SAVED DRAFT ${index + 1}`;

    const title = document.createElement("h3");
    title.textContent = draft.title;

    const subject = document.createElement("p");
    subject.className = "card-subject";
    subject.textContent = draft.subject || "";

    const description = document.createElement("p");
    description.className = "card-description";
    description.textContent = draft.body.substring(0, 105) + "...";

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const compose = document.createElement("button");
    compose.className = "primary-button";
    compose.textContent = "Open in Gmail";
    compose.addEventListener("click", () => composeGmail(draft));

    const remove = document.createElement("button");
    remove.className = "secondary-button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      if (!confirm("Delete this saved draft?")) return;

      drafts.splice(index, 1);
      saveData(STORAGE.drafts, drafts);
      renderDrafts();
      showToast("Draft deleted");
    });

    actions.append(compose, remove);
    card.append(number, title, subject, description, actions);
    grid.appendChild(card);
  });
}

/* =========================================
   WORKSPACE 2 - 22 SHEET NAMES
========================================= */

const DEFAULT_SHEETS = [
  "Uki",
  "Latam",
  "Operations",
  "Reports",
  "Daily Updates",
  "Team Details",
  "Attendance",
  "Work Status",
  "Project Data",
  "Sales Report",
  "Monthly Report",
  "Weekly Report",
  "Task Details",
  "Employee Data",
  "Client Details",
  "Finance Report",
  "Performance",
  "Audit Report",
  "Data Sheet",
  "Final Report",
  "Summary",
  "Backup Data"
];

let sheets = loadData(STORAGE.sheets, null);

if (!Array.isArray(sheets)) {
  sheets = DEFAULT_SHEETS.map((name, index) => ({
    id: index + 1,
    name,
    checked: false
  }));
  saveData(STORAGE.sheets, sheets);
}

let nextSheetId = Math.max(0, ...sheets.map(s => Number(s.id) || 0)) + 1;

function saveSheets() {
  saveData(STORAGE.sheets, sheets);
}

function updateSheetCount() {
  const count = sheets.length;
  $("sheetCount").textContent =
    `${count} sheet ${count === 1 ? "name" : "names"}`;
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
    checkbox.checked = Boolean(sheet.checked);
    checkbox.setAttribute("aria-label", `Select ${sheet.name}`);

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
    date.textContent = getW2Date();

    info.append(name, date);

    const actions = document.createElement("div");
    actions.className = "sheet-actions";

    /* COPY BUTTON */
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "sheet-action copy";
    copyButton.textContent = "Copy";

    copyButton.addEventListener("click", async () => {
      const sheetName = sheet.name;

      try {
        await copyText(sheetName);
        showToast(`Copied: ${sheetName}`);
      } catch (error) {
        showToast("Copy failed. Please select and copy manually.");
      }
    });

    /* EDIT BUTTON */
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "sheet-action";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      const updatedName = prompt("Enter new sheet name:", sheet.name);

      if (updatedName === null) return;

      const cleanName = updatedName.trim();

      if (!cleanName) {
        showToast("Sheet name cannot be empty");
        return;
      }

      sheet.name = cleanName;
      saveSheets();
      renderSheets();
      showToast("Sheet name updated");
    });

    /* DELETE BUTTON */
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "sheet-action delete";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      if (!confirm(`Delete "${sheet.name}"?`)) return;

      sheets = sheets.filter(item => item.id !== sheet.id);

      saveSheets();
      renderSheets();
      showToast("Sheet deleted");
    });

    actions.append(copyButton, editButton, deleteButton);

    row.append(checkbox, info, actions);
    container.appendChild(row);
  });

  updateSheetCount();
}

/* =========================================
   COPY FUNCTION
========================================= */

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const success = document.execCommand("copy");
  textarea.remove();

  if (!success) {
    throw new Error("Clipboard copy failed");
  }
}

/* =========================================
   ADD SHEET NAME
========================================= */

$("addSheetButton").addEventListener("click", () => {
  const name = prompt("Enter new sheet name:");

  if (name === null) return;

  const cleanName = name.trim();

  if (!cleanName) {
    showToast("Please enter a sheet name");
    return;
  }

  sheets.push({
    id: nextSheetId++,
    name: cleanName,
    checked: false
  });

  saveSheets();
  renderSheets();

  showToast("New sheet added");
});

/* =========================================
   CLEAR ALL SHEETS
========================================= */

$("clearAllSheets").addEventListener("click", () => {
  if (!sheets.length) {
    showToast("No sheets to clear");
    return;
  }

  if (!confirm("Are you sure you want to delete all sheet names?")) {
    return;
  }

  sheets = [];
  saveSheets();
  renderSheets();

  showToast("All sheet names cleared");
});

/* =========================================
   NAVIGATION
========================================= */

function switchView(view) {
  currentView = view;

  $("libraryPanel").hidden = view !== "templates";
  $("workspace2Panel").hidden = view !== "workspace2";
  $("draftsHeading").hidden = view !== "drafts";

  $("templateGrid").hidden = view === "workspace2";
  $("emptyState").hidden = true;

  $("mailDateRow").hidden = view !== "templates";
  $("mailDateNote").hidden = view !== "templates";

  const titles = {
    templates: "Ready when you are.",
    drafts: "Your saved drafts.",
    workspace2: "Your sheets, organised."
  };

  $("pageTitle").textContent = titles[view];

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.view === view
    );
  });

  if (view === "templates") {
    renderTemplates();
  }

  if (view === "drafts") {
    renderDrafts();
  }

  if (view === "workspace2") {
    updateW2DateUI();
    renderSheets();
  }

  $("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    switchView(button.dataset.view);
  });
});

$("backTemplates").addEventListener("click", () => {
  switchView("templates");
});

$("menuButton").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

/* =========================================
   INITIAL LOAD
========================================= */

function initializeApp() {
  updateMailDateUI();
  updateW2DateUI();

  renderTemplates();
  renderSheets();

  switchView("templates");
}

initializeApp();
