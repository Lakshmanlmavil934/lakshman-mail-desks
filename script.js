
const DEFAULT_TEMPLATES = [
  {id:1,title:"Project status — weekly",subtitle:"Weekly project note",to:"",cc:"",bcc:"",subject:"Project status — weekly — {{DATE}}",body:"Hi {{NAME}},\n\nHere is the latest project status as of {{DATE}}.\n\nHighlights:\n• Product review is on track.\n• The team is working through the remaining tasks.\n• I will share another update if anything changes.\n\nPlease let me know if you need any additional details.\n\nBest regards,\nLakshman"},
  {id:2,title:"Design review follow-up",subtitle:"A few notes after our design review",to:"",cc:"",bcc:"",subject:"Design review follow-up — {{DATE}}",body:"Hi {{NAME}},\n\nThank you for the thoughtful review on {{DATE}}. I have folded the agreed changes into the latest version.\n\nPlease take a look when you have a moment and share any further feedback.\n\nBest,\nLakshman"},
  {id:3,title:"Invoice reminder",subtitle:"Invoice follow-up",to:"",cc:"",bcc:"",subject:"Invoice reminder — {{DATE}}",body:"Hello,\n\nA quick follow-up on invoice #1842. Could you confirm its expected payment date?\n\nPlease let me know if you need the invoice sent again.\n\nThank you,\nLakshman"},
  {id:4,title:"Meeting confirmation",subtitle:"Confirmed: our conversation",to:"",cc:"",bcc:"",subject:"Meeting confirmation — {{DATE}}",body:"Hi {{NAME}},\n\nConfirming our conversation for {{DATE}}. I have set aside the full hour and will come prepared with the notes.\n\nLooking forward to speaking with you.\n\nRegards,\nLakshman"},
  {id:5,title:"Partner introduction",subtitle:"An introduction to a new partner",to:"",cc:"",bcc:"",subject:"Partner introduction — {{DATE}}",body:"Hi {{NAME}},\n\nI wanted to connect you with a colleague who may be helpful for your work. I will let you both take it from here.\n\nThanks,\nLakshman"},
  {id:6,title:"Request for materials",subtitle:"Materials for our next working session",to:"",cc:"",bcc:"",subject:"Request for materials — {{DATE}}",body:"Hi {{NAME}},\n\nBefore we meet on {{DATE}}, could you send over the latest research notes and the relevant presentation materials?\n\nHaving them in advance will help us make the best use of our time.\n\nThank you,\nLakshman"},
  {id:7,title:"Decision log update",subtitle:"Decision log updated",to:"",cc:"",bcc:"",subject:"Decision log update — {{DATE}}",body:"Hi team,\n\nThe decision log has been updated with the outcomes from our latest discussion on {{DATE}}.\n\nPlease review the notes and let me know if anything needs correcting.\n\nRegards,\nLakshman"},
  {id:8,title:"Thank-you note",subtitle:"Thank you for the conversation",to:"",cc:"",bcc:"",subject:"Thank-you note — {{DATE}}",body:"Hi {{NAME}},\n\nThank you for taking the time to speak with me. I appreciated the conversation and the helpful insights you shared.\n\nI look forward to staying in touch.\n\nWarm regards,\nLakshman"},
  {id:9,title:"Leave request",subtitle:"A polite request for leave",to:"",cc:"",bcc:"",subject:"Leave request — {{DATE}}",body:"Dear {{NAME}},\n\nI would like to request leave on {{DATE}} due to a personal commitment.\n\nPlease let me know if you need any further information. Thank you for your understanding.\n\nRegards,\nLakshman"},
  {id:10,title:"Job application follow-up",subtitle:"Following up on my application",to:"",cc:"",bcc:"",subject:"Application follow-up — {{DATE}}",body:"Dear Hiring Team,\n\nI am writing to follow up on my application and to check whether there are any updates regarding the next steps.\n\nThank you for your time and consideration.\n\nSincerely,\nLakshman"}
];

const DEFAULT_SHEETS = [
  "Uki","Latam","Sheet 03","Sheet 04","Sheet 05","Sheet 06",
  "Sheet 07","Sheet 08","Sheet 09","Sheet 10","Sheet 11",
  "Sheet 12","Sheet 13","Sheet 14","Sheet 15","Sheet 16",
  "Sheet 17","Sheet 18","Sheet 19","Sheet 20","Sheet 21","Sheet 22"
];

const $ = id => document.getElementById(id);

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

let templates = readStorage("lakshmanMailTemplates", null);
if (!Array.isArray(templates) || !templates.length) {
  templates = DEFAULT_TEMPLATES.map(item => ({...item}));
}

let drafts = readStorage("lakshmanMailDrafts", []);
if (!Array.isArray(drafts)) drafts = [];

let sheets = readStorage("lakshmanWorkspace2Sheets", null);
if (!Array.isArray(sheets)) {
  sheets = DEFAULT_SHEETS.map((name, index) => ({
    id: Date.now() + index,
    name,
    checked: false
  }));
}

let selectedDate = "today";
let w2SelectedDate = "today";
let activeId = null;
let modalMode = "edit";
let currentView = "templates";
let toastTimer = null;

/* STORAGE */

function saveTemplates() {
  localStorage.setItem("lakshmanMailTemplates", JSON.stringify(templates));
}

function saveDrafts() {
  localStorage.setItem("lakshmanMailDrafts", JSON.stringify(drafts));
}

function saveSheets() {
  localStorage.setItem("lakshmanWorkspace2Sheets", JSON.stringify(sheets));
}

/* DATE FUNCTIONS */

function getDateValue(type, customId) {
  const now = new Date();

  if (type === "tomorrow") {
    now.setDate(now.getDate() + 1);
    return now;
  }

  if (type === "custom") {
    const value = $(customId).value;
    if (value) {
      const parts = value.split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2], 12);
    }
  }

  return now;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function mailDate() {
  return getDateValue(selectedDate, "customDate");
}

function workspaceDate() {
  return getDateValue(w2SelectedDate, "w2CustomDate");
}

function replaceDate(text) {
  return String(text || "")
    .replaceAll("{{DATE}}", formatDate(mailDate()))
    .replaceAll("{{NAME}}", "there");
}

function updateMailDateLabels() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  $("todayLabel").textContent = formatDate(today);
  $("tomorrowLabel").textContent = formatDate(tomorrow);
  $("activeDateLabel").textContent = formatDate(mailDate());

  document.querySelectorAll("[data-date]").forEach(button => {
    button.classList.toggle("selected", button.dataset.date === selectedDate);
  });
}

function updateWorkspaceDateLabels() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  $("w2TodayLabel").textContent = formatDate(today);
  $("w2TomorrowLabel").textContent = formatDate(tomorrow);
  $("w2ActiveDateLabel").textContent = formatDate(workspaceDate());

  document.querySelectorAll("[data-w2-date]").forEach(button => {
    button.classList.toggle("selected", button.dataset.w2Date === w2SelectedDate);
  });

  renderSheets();
}

/* GENERAL */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function showToast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2300);
}

function openModal() {
  $("modalBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("modalBackdrop").hidden = true;
  document.body.style.overflow = "";
}

function getCurrentItem(id) {
  const list = currentView === "drafts" ? drafts : templates;
  return list.find(item => String(item.id) === String(id));
}

/* RECIPIENT INPUTS */

function splitRecipients(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(/[;,\n]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function renderRecipientInputs(type, values) {
  const container = $(type + "Recipients");
  container.innerHTML = "";

  const list = splitRecipients(values);
  if (!list.length) list.push("");

  list.forEach(value => addRecipientRow(type, value));
}

function addRecipientRow(type, value = "") {
  const container = $(type + "Recipients");
  const row = document.createElement("div");
  row.className = "recipient-row";

  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = "Enter email address";
  input.value = value;
  input.className = "recipient-input";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-recipient";
  remove.textContent = "×";
  remove.title = "Remove email";

  remove.addEventListener("click", () => {
    row.remove();

    if (!container.children.length) {
      addRecipientRow(type);
    }
  });

  row.append(input, remove);
  container.appendChild(row);
}

function getRecipientValues(type) {
  return [...$(type + "Recipients").querySelectorAll("input")]
    .map(input => input.value.trim())
    .filter(Boolean)
    .join(", ");
}

/* TEMPLATE AND DRAFT DISPLAY */

function render() {
  const query = $("searchInput").value.trim().toLowerCase();
  const isWorkspace = currentView === "workspace2";
  const isDrafts = currentView === "drafts";

  $("libraryPanel").hidden = isWorkspace || isDrafts;
  $("mailDateRow").hidden = isWorkspace;
  $("mailDateNote").hidden = isWorkspace;
  $("workspace2Panel").hidden = !isWorkspace;
  $("draftsHeading").hidden = !isDrafts;
  $("templateGrid").hidden = isWorkspace;
  $("emptyState").hidden = true;

  $("pageTitle").textContent =
    isWorkspace ? "Your sheets, your way." :
    isDrafts ? "Your drafts, ready to continue." :
    "Ready when you are.";

  $("templateCount").textContent = templates.length;
  $("readyCount").textContent = templates.length;

  if (isWorkspace) return;

  const list = isDrafts ? drafts : templates;

  const shown = list.filter(item => {
    const text = [
      item.title, item.subtitle, item.subject,
      item.to, item.cc, item.bcc
    ].join(" ").toLowerCase();

    return text.includes(query);
  });

  $("templateGrid").innerHTML = "";

  shown.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "template-card";

    const recipient = item.to || "No recipient added";
    const subtitle = item.subtitle || "Email template";

    card.innerHTML = `
      <div class="card-top">
        <span class="ready">
          <span class="number">${String(index + 1).padStart(2, "0")}</span>
          READY
        </span>
        <button class="icon-button edit-btn" title="Edit template">✎</button>
      </div>

      <h3>${escapeHTML(item.title)}</h3>
      <div class="card-subtitle">${escapeHTML(replaceDate(subtitle))}</div>
      <p class="card-excerpt">${escapeHTML(replaceDate(item.body).replace(/\n/g, " "))}</p>

      <div class="card-meta">
        <span class="recipient">${escapeHTML(recipient)} · ${item.cc ? "CC added" : "No CC"}</span>
        <span>Date-aware</span>
      </div>

      <div class="card-actions">
        <button class="primary-button preview-btn">Preview ↗</button>
        <button class="secondary-button compose-btn">➤ &nbsp; Compose</button>
      </div>
    `;

    card.querySelector(".edit-btn").addEventListener("click", () => openEdit(item.id));
    card.querySelector(".preview-btn").addEventListener("click", () => openPreview(item.id));
    card.querySelector(".compose-btn").addEventListener("click", () => compose(item.id));

    $("templateGrid").appendChild(card);
  });

  $("emptyState").hidden = shown.length !== 0;
  $("emptyState").textContent = isDrafts
    ? "No saved drafts yet."
    : "No matching templates found. Try another search.";
}

/* EDIT TEMPLATE OR DRAFT */

function openEdit(id) {
  activeId = id;

  const item = getCurrentItem(id);
  if (!item) return;

  modalMode = "edit";

  $("modalKicker").textContent = "TEMPLATE DETAILS";
  $("modalTitle").textContent = "Edit template";

  $("editFields").hidden = false;
  $("previewFields").hidden = true;

  $("editTitle").value = item.title || "";
  $("editSubject").value = item.subject || "";
  $("editBody").value = item.body || "";

  renderRecipientInputs("to", item.to);
  renderRecipientInputs("cc", item.cc);
  renderRecipientInputs("bcc", item.bcc);

  openModal();
}

function saveEdit() {
  const item = getCurrentItem(activeId);
  if (!item) return;

  item.title = $("editTitle").value.trim() || "Untitled template";
  item.to = getRecipientValues("to");
  item.cc = getRecipientValues("cc");
  item.bcc = getRecipientValues("bcc");
  item.subject = $("editSubject").value;
  item.body = $("editBody").value;

  if (currentView === "drafts") {
    saveDrafts();
  } else {
    saveTemplates();
  }

  render();
  closeModal();
  showToast("Changes saved successfully.");
}

/* PREVIEW */

function openPreview(id) {
  activeId = id;

  const item = getCurrentItem(id);
  if (!item) return;

  modalMode = "preview";

  $("modalKicker").textContent = "MESSAGE PREVIEW";
  $("modalTitle").textContent = item.title;

  $("editFields").hidden = true;
  $("previewFields").hidden = false;

  $("previewTo").textContent = item.to || "Not specified";
  $("previewCc").textContent = item.cc || "Not specified";
  $("previewBcc").textContent = item.bcc || "Not specified";
  $("previewSubject").textContent = replaceDate(item.subject);
  $("previewBody").textContent = replaceDate(item.body);

  openModal();
}

/* GMAIL COMPOSE */

function compose(id) {
  const item = getCurrentItem(id);
  if (!item) return;

  const params = new URLSearchParams();

  if (item.to) params.set("to", item.to);
  if (item.cc) params.set("cc", item.cc);
  if (item.bcc) params.set("bcc", item.bcc);

  params.set("su", replaceDate(item.subject));
  params.set("body", replaceDate(item.body));

  const url = "https://mail.google.com/mail/?view=cm&fs=1&" + params.toString();

  const newDraft = {
    ...item,
    id: Date.now(),
    savedAt: new Date().toISOString()
  };

  drafts.unshift(newDraft);
  drafts = drafts.slice(0, 50);
  saveDrafts();

  const win = window.open(url, "_blank");

  if (!win) {
    showToast("Allow pop-ups in your browser to open Gmail.");
    return;
  }

  showToast("Gmail opened. Draft saved in your workspace.");
}

/* WORKSPACE 2 */

function renderSheets() {
  const container = $("sheetList");
  if (!container) return;

  container.innerHTML = "";

  const dateText = formatDate(workspaceDate());

  sheets.forEach(sheet => {
    const item = document.createElement("div");
    item.className = "sheet-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!sheet.checked;
    checkbox.setAttribute("aria-label", "Select " + sheet.name);

    checkbox.addEventListener("change", () => {
      sheet.checked = checkbox.checked;
      saveSheets();
      updateSheetCount();
    });

    const details = document.createElement("div");
    details.className = "sheet-details";

    const name = document.createElement("span");
    name.className = "sheet-name";
    name.textContent = sheet.name;

    const date = document.createElement("span");
    date.className = "sheet-date";
    date.textContent = dateText;

    details.append(name, date);

    const actions = document.createElement("div");
    actions.className = "sheet-actions";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editSheet(sheet.id));

    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", () => copySheet(sheet.id));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteSheet(sheet.id));

    actions.append(editButton, copyButton, deleteButton);
    item.append(checkbox, details, actions);
    container.appendChild(item);
  });

  updateSheetCount();
}

function updateSheetCount() {
  const checked = sheets.filter(sheet => sheet.checked).length;
  $("sheetCount").textContent =
    sheets.length + " sheet names · " + checked + " selected";
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
    id: Date.now(),
    name: cleanName,
    checked: false
  });

  saveSheets();
  renderSheets();
  showToast("Sheet name added.");
}

function editSheet(id) {
  const sheet = sheets.find(item => String(item.id) === String(id));
  if (!sheet) return;

  const newName = prompt("Edit sheet name:", sheet.name);

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

function copySheet(id) {
  const sheet = sheets.find(item => String(item.id) === String(id));
  if (!sheet) return;

  sheets.push({
    id: Date.now() + Math.floor(Math.random() * 10000),
    name: sheet.name + " Copy",
    checked: false
  });

  saveSheets();
  renderSheets();
  showToast("Sheet copied.");
}

function deleteSheet(id) {
  const sheet = sheets.find(item => String(item.id) === String(id));
  if (!sheet) return;

  if (!confirm("Delete " + sheet.name + "?")) return;

  sheets = sheets.filter(item => String(item.id) !== String(id));

  saveSheets();
  renderSheets();
  showToast("Sheet deleted.");
}

function clearAllSheets() {
  sheets.forEach(sheet => {
    sheet.checked = false;
  });

  saveSheets();
  renderSheets();
  showToast("All checkboxes cleared.");
}

/* NAVIGATION */

function switchView(view) {
  currentView = view;

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  $("searchInput").value = "";

  render();

  $("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    switchView(button.dataset.view);
  });
});

/* DATE BUTTON EVENTS */

document.querySelectorAll("[data-date]").forEach(button => {
  button.addEventListener("click", () => {
    selectedDate = button.dataset.date;
    updateMailDateLabels();
    render();
  });
});

$("customDate").addEventListener("change", event => {
  if (!event.target.value) return;

  selectedDate = "custom";
  updateMailDateLabels();
  render();
});

document.querySelectorAll("[data-w2-date]").forEach(button => {
  button.addEventListener("click", () => {
    w2SelectedDate = button.dataset.w2Date;
    updateWorkspaceDateLabels();
  });
});

$("w2CustomDate").addEventListener("change", event => {
  if (!event.target.value) return;

  w2SelectedDate = "custom";
  updateWorkspaceDateLabels();
});

/* RECIPIENT BUTTON EVENTS */

document.querySelectorAll("[data-add-recipient]").forEach(button => {
  button.addEventListener("click", () => {
    addRecipientRow(button.dataset.addRecipient);
  });
});

/* OTHER BUTTON EVENTS */

$("addSheetButton").addEventListener("click", addSheet);
$("clearAllSheets").addEventListener("click", clearAllSheets);

$("searchInput").addEventListener("input", render);

$("saveEdit").addEventListener("click", saveEdit);
$("cancelEdit").addEventListener("click", closeModal);
$("closeModal").addEventListener("click", closeModal);

$("modalBackdrop").addEventListener("click", event => {
  if (event.target === $("modalBackdrop")) closeModal();
});

$("previewEdit").addEventListener("click", () => {
  openEdit(activeId);
});

$("previewCompose").addEventListener("click", () => {
  const id = activeId;
  closeModal();
  compose(id);
});

$("backTemplates").addEventListener("click", () => {
  switchView("templates");
});

$("menuButton").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

/* START APP */

updateMailDateLabels();
updateWorkspaceDateLabels();
render();
