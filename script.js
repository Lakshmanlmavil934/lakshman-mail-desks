
"use strict";

const $ = (id) => document.getElementById(id);

const STORAGE_TEMPLATES = "lakshman_workspace_templates_v3";
const STORAGE_BACKUP = "lakshman_workspace_backup_v3";

let templates = loadTemplates();
let backupStatus = loadBackupStatus();
let selectedBackupDate = dateKey(new Date());

const sheetNames = [
  "Sheet 01", "Sheet 02", "Sheet 03", "Sheet 04",
  "Sheet 05", "Sheet 06", "Sheet 07", "Sheet 08",
  "Sheet 09", "Sheet 10", "Sheet 11", "Sheet 12",
  "Sheet 13", "Sheet 14", "Sheet 15", "Sheet 16",
  "Sheet 17", "Sheet 18", "Sheet 19", "Sheet 20"
];

function loadTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_TEMPLATES));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadBackupStatus() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_BACKUP));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveTemplates() {
  localStorage.setItem(STORAGE_TEMPLATES, JSON.stringify(templates));
}

function saveBackupStatus() {
  localStorage.setItem(STORAGE_BACKUP, JSON.stringify(backupStatus));
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function parseEmails(value) {
  return String(value || "")
    .split(/[,;\n]+/)
    .map(email => email.trim())
    .filter(Boolean);
}

function collectEmailRows(containerId) {
  return [...$(containerId).querySelectorAll("input")]
    .map(input => input.value.trim())
    .filter(Boolean);
}

function addEmailRow(containerId, value = "") {
  const container = $(containerId);
  const row = document.createElement("div");
  row.className = "email-row";

  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = "name@example.com";
  input.value = value;
  input.multiple = false;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "×";
  remove.title = "Remove email";

  remove.addEventListener("click", () => {
    if (container.querySelectorAll(".email-row").length > 1) {
      row.remove();
    } else {
      input.value = "";
    }
  });

  row.append(input, remove);
  container.appendChild(row);
}

function setEmailRows(containerId, emails) {
  const container = $(containerId);
  container.innerHTML = "";

  const values = emails.length ? emails : [""];
  values.forEach(email => addEmailRow(containerId, email));
}

function openModal(id) {
  $(id).classList.add("show");
}

function closeModal(id) {
  $(id).classList.remove("show");
}

function updateStats() {
  $("templateCount").textContent = templates.length;
  $("templateReady").textContent = templates.filter(t =>
    t.title && t.subject && t.body
  ).length;
}

function renderTemplates() {
  const search = $("templateSearch").value.toLowerCase().trim();
  const grid = $("templateGrid");

  const filtered = templates.filter(template => {
    const text = [
      template.title,
      template.subject,
      template.to,
      template.cc,
      template.body
    ].join(" ").toLowerCase();

    return text.includes(search);
  });

  grid.innerHTML = "";

  filtered.forEach(template => {
    const card = document.createElement("article");
    card.className = "template-card";

    const title = document.createElement("h3");
    title.textContent = template.title;

    const subject = document.createElement("p");
    subject.className = "template-subject";
    subject.textContent = "Subject: " + template.subject;

    const to = document.createElement("p");
    to.textContent = "To: " + (template.to || "Not added");

    const cc = document.createElement("p");
    cc.textContent = "Cc: " + (template.cc || "Not added");

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const compose = makeButton("Compose", "compose-btn", () => {
      openGmailComposer(template.id);
    });

    const preview = makeButton("Preview", "preview-btn", () => {
      openPreview(template.id);
    });

    const edit = makeButton("Edit", "edit-btn", () => {
      openTemplateForm(template.id);
    });

    const remove = makeButton("Delete", "delete-btn", () => {
      deleteTemplate(template.id);
    });

    actions.append(compose, preview, edit, remove);
    card.append(title, subject, to, cc, actions);
    grid.appendChild(card);
  });

  $("emptyTemplates").hidden = filtered.length !== 0;
  updateStats();
}

function makeButton(label, className, callback) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", callback);
  return button;
}

function openTemplateForm(id = "") {
  $("templateForm").reset();
  $("templateId").value = "";

  if (id) {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    $("modalTitle").textContent = "Edit Template";
    $("templateId").value = template.id;
    $("formTitle").value = template.title;
    $("formSubject").value = template.subject;
    $("formBody").value = template.body;

    setEmailRows("formToRows", parseEmails(template.to));
    setEmailRows("formCcRows", parseEmails(template.cc));
  } else {
    $("modalTitle").textContent = "Add Template";
    setEmailRows("formToRows", [""]);
    setEmailRows("formCcRows", [""]);
  }

  openModal("templateModal");
}

function saveTemplate(event) {
  event.preventDefault();

  const id = $("templateId").value;
  const existing = templates.find(t => t.id === id);

  const template = {
    id: id || crypto.randomUUID(),
    title: $("formTitle").value.trim(),
    subject: $("formSubject").value.trim(),
    to: collectEmailRows("formToRows").join(", "),
    cc: collectEmailRows("formCcRows").join(", "),
    body: $("formBody").value
  };

  if (!template.title || !template.subject || !template.body.trim()) {
    showToast("Please complete the required fields.");
    return;
  }

  if (existing) {
    templates = templates.map(t => t.id === id ? template : t);
  } else {
    templates.unshift(template);
  }

  saveTemplates();
  renderTemplates();
  closeModal("templateModal");
  showToast(existing ? "Template updated." : "Template saved.");
}

function deleteTemplate(id) {
  if (!confirm("Delete this email template?")) return;

  templates = templates.filter(t => t.id !== id);
  saveTemplates();
  renderTemplates();
  showToast("Template deleted.");
}

/*
  IMPORTANT:
  Compose opens Gmail Web directly in a new browser tab.
  It does not use mailto: and does not open the phone email app.
  The new Gmail tab is prefilled; the user must review and send.
*/
function openGmailComposer(id) {
  const template = templates.find(t => t.id === id);

  if (!template) {
    showToast("Template not found.");
    return;
  }

  const params = new URLSearchParams();
  params.set("view", "cm");
  params.set("fs", "1");

  const to = parseEmails(template.to);
  const cc = parseEmails(template.cc);

  if (to.length) params.set("to", to.join(","));
  if (cc.length) params.set("cc", cc.join(","));

  params.set("su", template.subject || "");
  params.set("body", template.body || "");

  const gmailURL =
    "https://mail.google.com/mail/u/0/?" + params.toString();

  // Open synchronously during the button click to avoid popup blocking.
  const newTab = window.open(gmailURL, "_blank");

  if (!newTab) {
    showToast("Chrome blocked the new tab. Allow pop-ups for this site and try again.");
  }
}

function openPreview(id) {
  const template = templates.find(t => t.id === id);
  if (!template) return;

  $("previewTo").textContent = template.to || "Not added";
  $("previewCc").textContent = template.cc || "Not added";
  $("composeSubject").textContent = template.subject;
  $("composeBody").textContent = template.body;

  $("copyEmailBtn").onclick = () => {
    const text =
      `To: ${template.to}\n` +
      `Cc: ${template.cc}\n` +
      `Subject: ${template.subject}\n\n` +
      template.body;

    copyText(text);
  };

  openModal("composeModal");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard.");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast("Copied to clipboard.");
  }
}

function exportTemplates() {
  const blob = new Blob(
    [JSON.stringify(templates, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lakshman-email-templates.json";
  link.click();
  URL.revokeObjectURL(url);

  showToast("Templates exported.");
}

function importTemplates(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);

      if (!Array.isArray(imported)) {
        throw new Error("Invalid file");
      }

      const valid = imported
        .filter(item => item && typeof item === "object")
        .map(item => ({
          id: crypto.randomUUID(),
          title: String(item.title || "Imported Template"),
          subject: String(item.subject || ""),
          to: String(item.to || ""),
          cc: String(item.cc || ""),
          body: String(item.body || "")
        }));

      templates = [...valid, ...templates];
      saveTemplates();
      renderTemplates();
      showToast(`${valid.length} templates imported.`);
    } catch {
      showToast("Invalid JSON file.");
    }

    $("importTemplatesInput").value = "";
  };

  reader.readAsText(file);
}

/* SHEETS BACKUP */

function getDayStatus() {
  if (!backupStatus[selectedBackupDate]) {
    backupStatus[selectedBackupDate] = {};
  }

  return backupStatus[selectedBackupDate];
}

function renderSheets() {
  const status = getDayStatus();
  const list = $("sheetList");
  list.innerHTML = "";

  sheetNames.forEach((name, index) => {
    const done = Boolean(status[name]);

    const item = document.createElement("div");
    item.className = "sheet-item" + (done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = done;
    checkbox.setAttribute("aria-label", `Mark ${name} complete`);

    checkbox.addEventListener("change", () => {
      status[name] = checkbox.checked;
      saveBackupStatus();
      renderSheets();
    });

    const label = document.createElement("span");
    label.className = "sheet-name";
    label.textContent = name;

    const rename = makeButton("Rename", "", () => {
      const newName = prompt("Enter new sheet name:", name);

      if (!newName || !newName.trim()) return;

      const cleanName = newName.trim();

      if (sheetNames.some(n => n.toLowerCase() === cleanName.toLowerCase() && n !== name)) {
        showToast("That sheet name already exists.");
        return;
      }

      const oldStatus = Boolean(status[name]);
      sheetNames[index] = cleanName;
      delete status[name];
      status[cleanName] = oldStatus;

      saveBackupStatus();
      renderSheets();
    });

    const copy = makeButton("Copy", "", () => {
      copyText(name);
    });

    item.append(checkbox, label, rename, copy);
    list.appendChild(item);
  });

  const completed = sheetNames.filter(name => status[name]).length;
  const total = sheetNames.length;

  $("progressText").textContent = `${completed} / ${total}`;
  $("progressBar").style.width = `${total ? completed / total * 100 : 0}%`;

  const readableDate = new Date(selectedBackupDate + "T00:00:00");
  $("selectedDateText").textContent = readableDate.toLocaleDateString(
    undefined,
    { day: "numeric", month: "short", year: "numeric" }
  );
}

function selectBackupDate(type) {
  const date = new Date();

  if (type === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }

  selectedBackupDate = dateKey(date);
  $("backupDate").value = selectedBackupDate;

  document.querySelectorAll(".date-choice").forEach(button => {
    button.classList.toggle("active", button.dataset.date === type);
  });

  renderSheets();
}

/* EVENT LISTENERS */

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    document.querySelectorAll(".workspace").forEach(section => {
      section.classList.remove("active");
    });

    button.classList.add("active");
    $(button.dataset.workspace).classList.add("active");
  });
});

$("addTemplateBtn").addEventListener("click", () => openTemplateForm());
$("templateForm").addEventListener("submit", saveTemplate);
$("templateSearch").addEventListener("input", renderTemplates);

$("addFormToBtn").addEventListener("click", () => {
  addEmailRow("formToRows");
});

$("addFormCcBtn").addEventListener("click", () => {
  addEmailRow("formCcRows");
});

$("exportTemplatesBtn").addEventListener("click", exportTemplates);

$("importTemplatesBtn").addEventListener("click", () => {
  $("importTemplatesInput").click();
});

$("importTemplatesInput").addEventListener("change", event => {
  importTemplates(event.target.files[0]);
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.dataset.close));
});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) {
      backdrop.classList.remove("show");
    }
  });
});

document.querySelectorAll(".date-choice").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.date === "custom") {
      $("backupDate").showPicker?.();
      $("backupDate").focus();
      return;
    }

    selectBackupDate(button.dataset.date);
  });
});

$("backupDate").addEventListener("change", event => {
  if (!event.target.value) return;

  selectedBackupDate = event.target.value;

  document.querySelectorAll(".date-choice").forEach(button => {
    button.classList.toggle("active", button.dataset.date === "custom");
  });

  renderSheets();
});

$("uncheckAllBtn").addEventListener("click", () => {
  if (!confirm("Clear all completed statuses for this date?")) return;

  backupStatus[selectedBackupDate] = {};
  saveBackupStatus();
  renderSheets();
  showToast("All statuses cleared.");
});

/* INITIAL LOAD */

$("currentDate").textContent = new Date().toLocaleDateString(
  undefined,
  { weekday: "short", day: "numeric", month: "short", year: "numeric" }
);

$("backupDate").value = selectedBackupDate;

renderTemplates();
renderSheets();
