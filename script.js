
// ========================================
// LAKSHMAN MAIL DESK - SCRIPT.JS
// ========================================

const $ = (id) => document.getElementById(id);

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

function dateInputValue(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

let selectedDate = new Date(today);

$("todayLabel").textContent = formatDate(today);

// ========================================
// PAGE NAVIGATION
// ========================================

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active-page"));

    button.classList.add("active");
    $(button.dataset.page).classList.add("active-page");

    const workspace = button.dataset.page === "workspacePage";
    $("pageTitle").textContent = workspace ? "Workspace 2" : "Mail Desk";
    $("pageSubtitle").textContent = workspace
      ? "Manage your sheet names and dates"
      : "Manage your email templates easily";
  });
});

// ========================================
// WORKSPACE 2 - 22 SHEETS
// ========================================

const DEFAULT_SHEETS = [
  "Uki",
  "Latam",
  "Sheet 03",
  "Sheet 04",
  "Sheet 05",
  "Sheet 06",
  "Sheet 07",
  "Sheet 08",
  "Sheet 09",
  "Sheet 10",
  "Sheet 11",
  "Sheet 12",
  "Sheet 13",
  "Sheet 14",
  "Sheet 15",
  "Sheet 16",
  "Sheet 17",
  "Sheet 18",
  "Sheet 19",
  "Sheet 20",
  "Sheet 21",
  "Sheet 22"
];

function loadSheets() {
  try {
    const saved = JSON.parse(localStorage.getItem("lakshmanSheets"));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.error("Could not load sheets", error);
  }

  return DEFAULT_SHEETS.map((name, index) => ({
    id: index + 1,
    name,
    checked: false
  }));
}

let sheets = loadSheets();

function saveSheets() {
  localStorage.setItem("lakshmanSheets", JSON.stringify(sheets));
}

function renderSheets() {
  const container = $("sheetList");
  container.innerHTML = "";

  $("sheetCount").textContent =
    `${sheets.length} ${sheets.length === 1 ? "Sheet" : "Sheets"}`;

  sheets.forEach(sheet => {
    const row = document.createElement("div");
    row.className = "sheet-row";

    const checkCell = document.createElement("div");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "round-check";
    checkbox.checked = !!sheet.checked;
    checkbox.addEventListener("change", () => {
      sheet.checked = checkbox.checked;
      saveSheets();
    });
    checkCell.appendChild(checkbox);

    const nameCell = document.createElement("div");
    nameCell.className = "sheet-name";
    nameCell.appendChild(document.createTextNode(sheet.name));

    const dateSpan = document.createElement("span");
    dateSpan.className = "sheet-date";
    dateSpan.textContent = formatDate(selectedDate);
    nameCell.appendChild(dateSpan);

    const actions = document.createElement("div");
    actions.className = "sheet-actions";

    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editSheet(sheet.id));

    const copyButton = document.createElement("button");
    copyButton.className = "copy-btn";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", () => copySheet(sheet.id));

    actions.append(editButton, copyButton);

    row.append(checkCell, nameCell, actions);
    container.appendChild(row);
  });
}

function editSheet(id) {
  const sheet = sheets.find(item => String(item.id) === String(id));
  if (!sheet) return;

  const newName = prompt("Enter sheet name:", sheet.name);

  if (newName === null) return;

  const cleanName = newName.trim();

  if (!cleanName) {
    showToast("Sheet name cannot be empty.");
    return;
  }

  sheet.name = cleanName;
  saveSheets();
  renderSheets();
  showToast("Sheet name updated.");
}

// Copy name to clipboard and add another sheet row
async function copySheet(id) {
  const sheet = sheets.find(item => String(item.id) === String(id));
  if (!sheet) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(sheet.name);
    } else {
      const temp = document.createElement("textarea");
      temp.value = sheet.name;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();

      const copied = document.execCommand("copy");
      temp.remove();

      if (!copied) throw new Error("Copy failed");
    }

    sheets.push({
      id: Date.now() + Math.floor(Math.random() * 10000),
      name: sheet.name,
      checked: false
    });

    saveSheets();
    renderSheets();
    showToast("Sheet name copied! You can paste it.");
  } catch (error) {
    showToast("Clipboard permission failed. Please allow clipboard access.");
  }
}

function addSheet() {
  const name = prompt("Enter new sheet name:");

  if (name === null) return;

  const cleanName = name.trim();

  if (!cleanName) {
    showToast("Please enter a sheet name.");
    return;
  }

  sheets.push({
    id: Date.now() + Math.floor(Math.random() * 10000),
    name: cleanName,
    checked: false
  });

  saveSheets();
  renderSheets();
  showToast("New sheet added.");
}

function clearAllSheets() {
  if (!sheets.length) {
    showToast("No sheets to clear.");
    return;
  }

  if (!confirm("Are you sure you want to clear all sheet names?")) return;

  sheets = [];
  saveSheets();
  renderSheets();
  showToast("All sheets cleared.");
}

$("addSheetBtn").addEventListener("click", addSheet);
$("clearSheetsBtn").addEventListener("click", clearAllSheets);

// ========================================
// SHARED DATE CONTROLS
// ========================================

function setSelectedDate(date, activeButton) {
  selectedDate = new Date(date);

  document.querySelectorAll(".date-btn").forEach(button => {
    button.classList.remove("active");
  });

  if (activeButton) activeButton.classList.add("active");

  $("customDate").value = dateInputValue(selectedDate);
  renderSheets();
}

$("todayBtn").addEventListener("click", () => {
  setSelectedDate(new Date(), $("todayBtn"));
});

$("tomorrowBtn").addEventListener("click", () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  setSelectedDate(date, $("tomorrowBtn"));
});

$("customBtn").addEventListener("click", () => {
  $("customDate").classList.add("show");
  $("customBtn").classList.add("active");
  $("todayBtn").classList.remove("active");
  $("tomorrowBtn").classList.remove("active");
  $("customDate").showPicker?.();
});

$("customDate").addEventListener("change", () => {
  if (!$("customDate").value) return;

  const [year, month, day] = $("customDate").value.split("-").map(Number);
  selectedDate = new Date(year, month - 1, day);

  document.querySelectorAll(".date-btn").forEach(button => {
    button.classList.remove("active");
  });

  $("customBtn").classList.add("active");
  renderSheets();
});

renderSheets();

// ========================================
// EMAIL TEMPLATES
// ========================================

const defaultTemplates = [
  {
    id: 1,
    name: "Daily Report",
    description: "Send daily work updates.",
    subject: "Daily Report - {DATE}",
    body: "Hi Team,\n\nPlease find the daily report for {DATE}.\n\nRegards,\nLakshman"
  },
  {
    id: 2,
    name: "Work Update",
    description: "Share your work status.",
    subject: "Work Update - {DATE}",
    body: "Hi Team,\n\nHere is my work update for {DATE}.\n\nRegards,\nLakshman"
  },
  {
    id: 3,
    name: "Leave Request",
    description: "Request leave from your team.",
    subject: "Leave Request",
    body: "Hi Team,\n\nI would like to request leave. Kindly approve my request.\n\nRegards,\nLakshman"
  },
  {
    id: 4,
    name: "Meeting Request",
    description: "Schedule a meeting.",
    subject: "Meeting Request",
    body: "Hi Team,\n\nI would like to schedule a meeting. Please let me know your availability.\n\nRegards,\nLakshman"
  },
  {
    id: 5,
    name: "Issue Report",
    description: "Report a technical issue.",
    subject: "Issue Report - {DATE}",
    body: "Hi Team,\n\nI am facing an issue. Please check and help me resolve it.\n\nRegards,\nLakshman"
  },
  {
    id: 6,
    name: "Follow Up",
    description: "Follow up on a previous request.",
    subject: "Follow Up",
    body: "Hi Team,\n\nI am following up on my previous request. Kindly share an update.\n\nRegards,\nLakshman"
  },
  {
    id: 7,
    name: "Task Completion",
    description: "Confirm task completion.",
    subject: "Task Completed - {DATE}",
    body: "Hi Team,\n\nThe assigned task has been completed successfully.\n\nRegards,\nLakshman"
  },
  {
    id: 8,
    name: "Document Sharing",
    description: "Share required documents.",
    subject: "Document Sharing",
    body: "Hi Team,\n\nPlease find the requested documents attached.\n\nRegards,\nLakshman"
  },
  {
    id: 9,
    name: "Reminder",
    description: "Send a reminder email.",
    subject: "Reminder",
    body: "Hi Team,\n\nThis is a gentle reminder regarding the pending task.\n\nRegards,\nLakshman"
  },
  {
    id: 10,
    name: "General Email",
    description: "Create a general email.",
    subject: "",
    body: "Hi Team,\n\n\n\nRegards,\nLakshman"
  }
];

function loadTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem("lakshmanTemplates"));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) {
    console.error(error);
  }
  return defaultTemplates;
}

let templates = loadTemplates();
let drafts = JSON.parse(localStorage.getItem("lakshmanDrafts") || "[]");

function saveTemplates() {
  localStorage.setItem("lakshmanTemplates", JSON.stringify(templates));
}

function saveDrafts() {
  localStorage.setItem("lakshmanDrafts", JSON.stringify(drafts));
}

function renderTemplates() {
  const container = $("templateList");
  container.innerHTML = "";

  templates.forEach(template => {
    const card = document.createElement("div");
    card.className = "template-card";

    const info = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = template.name;

    const description = document.createElement("p");
    description.textContent = template.description || "Email template";

    info.append(title, description);

    const actions = document.createElement("div");
    actions.className = "template-actions";

    const edit = document.createElement("button");
    edit.className = "small-btn";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => editTemplate(template.id));

    const use = document.createElement("button");
    use.className = "small-btn";
    use.textContent = "Use Template";
    use.addEventListener("click", () => openEmail(template.id));

    actions.append(edit, use);
    card.append(info, actions);
    container.appendChild(card);
  });
}

function editTemplate(id) {
  const template = templates.find(item => item.id === id);
  if (!template) return;

  const name = prompt("Template name:", template.name);
  if (name === null) return;

  const subject = prompt("Email subject:", template.subject);
  if (subject === null) return;

  const body = prompt("Email message:", template.body);
  if (body === null) return;

  template.name = name.trim() || template.name;
  template.subject = subject;
  template.body = body;

  saveTemplates();
  renderTemplates();
  showToast("Template updated.");
}

// ========================================
// EMAIL RECIPIENTS
// ========================================

let recipients = {
  to: [],
  cc: [],
  bcc: []
};

let currentTemplateId = null;

function renderRecipients(type) {
  const container = $(type + "List");
  container.innerHTML = "";

  recipients[type].forEach((email, index) => {
    const chip = document.createElement("span");
    chip.className = "recipient-chip";

    const emailText = document.createElement("span");
    emailText.textContent = email;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      recipients[type].splice(index, 1);
      renderRecipients(type);
    });

    chip.append(emailText, remove);
    container.appendChild(chip);
  });
}

function addRecipient(type) {
  const input = $(type + "Input");
  const email = input.value.trim();

  if (!email) {
    showToast("Enter an email address first.");
    return;
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!validEmail.test(email)) {
    showToast("Please enter a valid email address.");
    return;
  }

  if (recipients[type].includes(email)) {
    showToast("This email is already added.");
    return;
  }

  recipients[type].push(email);
  input.value = "";
  renderRecipients(type);
}

document.querySelectorAll(".add-recipient").forEach(button => {
  button.addEventListener("click", () => addRecipient(button.dataset.target));
});

["to", "cc", "bcc"].forEach(type => {
  $(type + "Input").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addRecipient(type);
    }
  });
});

// ========================================
// EMAIL COMPOSER
// ========================================

function replaceDate(text) {
  const date = formatDate(selectedDate);
  return String(text || "")
    .replace(/\{DATE\}/g, date)
    .replace(/\{TODAY\}/g, date);
}

function openEmail(id) {
  const template = templates.find(item => item.id === id);
  if (!template) return;

  currentTemplateId = id;
  recipients = { to: [], cc: [], bcc: [] };

  ["to", "cc", "bcc"].forEach(type => {
    $(type + "Input").value = "";
    renderRecipients(type);
  });

  $("modalTitle").textContent = template.name;
  $("emailSubject").value = replaceDate(template.subject);
  $("emailBody").value = replaceDate(template.body);

  $("emailModal").classList.add("show");
}

function closeEmail() {
  $("emailModal").classList.remove("show");
}

$("closeModal").addEventListener("click", closeEmail);

$("emailModal").addEventListener("click", event => {
  if (event.target === $("emailModal")) closeEmail();
});

// ========================================
// PREVIEW
// ========================================

function recipientText(type) {
  return recipients[type].join(", ");
}

$("previewBtn").addEventListener("click", () => {
  $("previewTo").textContent = recipientText("to") || "Not added";
  $("previewCc").textContent = recipientText("cc") || "Not added";
  $("previewBcc").textContent = recipientText("bcc") || "Not added";
  $("previewSubject").textContent = $("emailSubject").value;

  $("previewBody").textContent = $("emailBody").value;
  $("previewModal").classList.add("show");
});

$("closePreview").addEventListener("click", () => {
  $("previewModal").classList.remove("show");
});

$("previewModal").addEventListener("click", event => {
  if (event.target === $("previewModal")) {
    $("previewModal").classList.remove("show");
  }
});

// ========================================
// SAVE DRAFT
// ========================================

$("saveDraftBtn").addEventListener("click", () => {
  const draft = {
    id: Date.now(),
    templateId: currentTemplateId,
    to: [...recipients.to],
    cc: [...recipients.cc],
    bcc: [...recipients.bcc],
    subject: $("emailSubject").value,
    body: $("emailBody").value,
    date: new Date().toISOString()
  };

  drafts.unshift(draft);
  saveDrafts();
  renderDrafts();
  showToast("Draft saved successfully.");
});

// ========================================
// OPEN GMAIL
// ========================================

$("sendGmailBtn").addEventListener("click", () => {
  const params = new URLSearchParams();

  if (recipients.to.length) {
    params.set("to", recipients.to.join(","));
  }

  if (recipients.cc.length) {
    params.set("cc", recipients.cc.join(","));
  }

  if (recipients.bcc.length) {
    params.set("bcc", recipients.bcc.join(","));
  }

  params.set("su", $("emailSubject").value);
  params.set("body", $("emailBody").value);

  const gmailURL = "https://mail.google.com/mail/?view=cm&fs=1&" + params.toString();

  window.open(gmailURL, "_blank");
});

// ========================================
// DRAFT LIST
// ========================================

function renderDrafts() {
  const container = $("draftList");
  container.innerHTML = "";

  if (!drafts.length) {
    const empty = document.createElement("p");
    empty.textContent = "No saved drafts yet.";
    empty.style.color = "#829096";
    empty.style.fontSize = "13px";
    container.appendChild(empty);
    return;
  }

  drafts.forEach(draft => {
    const item = document.createElement("div");
    item.className = "draft-item";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = draft.subject || "No subject";

    const date = document.createElement("p");
    date.textContent = new Date(draft.date).toLocaleString();
    date.style.cssText = "font-size:11px;color:#829096;margin:5px 0 0";

    info.append(title, date);

    const actions = document.createElement("div");

    const open = document.createElement("button");
    open.className = "small-btn";
    open.textContent = "Open";
    open.addEventListener("click", () => openDraft(draft.id));

    const remove = document.createElement("button");
    remove.className = "small-btn";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeDraft(draft.id));

    actions.append(open, remove);
    item.append(info, actions);
    container.appendChild(item);
  });
}

function openDraft(id) {
  const draft = drafts.find(item => item.id === id);
  if (!draft) return;

  currentTemplateId = draft.templateId;
  recipients = {
    to: [...(draft.to || [])],
    cc: [...(draft.cc || [])],
    bcc: [...(draft.bcc || [])]
  };

  ["to", "cc", "bcc"].forEach(renderRecipients);

  $("modalTitle").textContent = "Saved Draft";
  $("emailSubject").value = draft.subject || "";
  $("emailBody").value = draft.body || "";

  $("emailModal").classList.add("show");
}

function removeDraft(id) {
  if (!confirm("Remove this saved draft?")) return;

  drafts = drafts.filter(item => item.id !== id);
  saveDrafts();
  renderDrafts();
  showToast("Draft removed.");
}

// ========================================
// INITIAL LOAD
// ========================================

renderTemplates();
renderDrafts();
