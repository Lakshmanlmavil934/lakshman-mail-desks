
const DEFAULT_TEMPLATES = [
{
  id: 1,
  title: "Project status — weekly",
  subtitle: "Weekly project note",
  to: [],
  cc: [],
  subject: "Project status — weekly — {{DATE}}",
  body: "Hi {{NAME}},\n\nHere is the latest project status as of {{DATE}}.\n\nHighlights:\n• Product review is on track.\n• The team is working through the remaining tasks.\n\nPlease let me know if you need any additional details.\n\nBest regards,\nLakshman"
},
{
  id: 2,
  title: "Design review follow-up",
  subtitle: "A few notes after our design review",
  to: [],
  cc: [],
  subject: "Design review follow-up — {{DATE}}",
  body: "Hi {{NAME}},\n\nThank you for the thoughtful review on {{DATE}}. I have folded the agreed changes into the latest version.\n\nPlease share any further feedback.\n\nBest,\nLakshman"
},
{
  id: 3,
  title: "Invoice reminder",
  subtitle: "Invoice follow-up",
  to: [],
  cc: [],
  subject: "Invoice reminder — {{DATE}}",
  body: "Hello,\n\nA quick follow-up on invoice #1842. Could you confirm its expected payment date?\n\nThank you,\nLakshman"
},
{
  id: 4,
  title: "Meeting confirmation",
  subtitle: "Confirmed: our conversation",
  to: [],
  cc: [],
  subject: "Meeting confirmation — {{DATE}}",
  body: "Hi {{NAME}},\n\nConfirming our conversation for {{DATE}}. I have set aside the full hour.\n\nLooking forward to speaking with you.\n\nRegards,\nLakshman"
},
{
  id: 5,
  title: "Partner introduction",
  subtitle: "An introduction to a new partner",
  to: [],
  cc: [],
  subject: "Partner introduction — {{DATE}}",
  body: "Hi {{NAME}},\n\nI wanted to connect you with a colleague who may be helpful for your work.\n\nThanks,\nLakshman"
},
{
  id: 6,
  title: "Request for materials",
  subtitle: "Materials for our next working session",
  to: [],
  cc: [],
  subject: "Request for materials — {{DATE}}",
  body: "Hi {{NAME}},\n\nBefore we meet on {{DATE}}, could you send over the latest research notes and presentation materials?\n\nThank you,\nLakshman"
},
{
  id: 7,
  title: "Decision log update",
  subtitle: "Decision log updated",
  to: [],
  cc: [],
  subject: "Decision log update — {{DATE}}",
  body: "Hi team,\n\nThe decision log has been updated with the outcomes from our latest discussion on {{DATE}}.\n\nRegards,\nLakshman"
},
{
  id: 8,
  title: "Thank-you note",
  subtitle: "Thank you for the conversation",
  to: [],
  cc: [],
  subject: "Thank-you note — {{DATE}}",
  body: "Hi {{NAME}},\n\nThank you for taking the time to speak with me. I appreciated the conversation.\n\nWarm regards,\nLakshman"
},
{
  id: 9,
  title: "Leave request",
  subtitle: "A polite request for leave",
  to: [],
  cc: [],
  subject: "Leave request — {{DATE}}",
  body: "Dear {{NAME}},\n\nI would like to request leave on {{DATE}} due to a personal commitment.\n\nThank you for your understanding.\n\nRegards,\nLakshman"
},
{
  id: 10,
  title: "Job application follow-up",
  subtitle: "Following up on my application",
  to: [],
  cc: [],
  subject: "Application follow-up — {{DATE}}",
  body: "Dear Hiring Team,\n\nI am writing to follow up on my application and check whether there are any updates regarding the next steps.\n\nSincerely,\nLakshman"
}
];

/* 22 DEFAULT SHEET NAMES */

const DEFAULT_SHEETS = Array.from(
  { length: 22 },
  (_, i) => ({
    id: i + 1,
    name: `Sheet ${String(i + 1).padStart(2, "0")}`
  })
);

const $ = id => document.getElementById(id);

let templates = loadTemplates();

let drafts = JSON.parse(
  localStorage.getItem("lakshmanMailDrafts") || "[]"
);

let sheets = loadSheets();

let selectedSheets = new Set();

let selectedDate = "today";
let selectedW2Date = "today";
let activeId = null;
let currentView = "templates";

/* --------------------------------
   LOAD AND SAVE EMAIL TEMPLATES
-------------------------------- */

function loadTemplates() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("lakshmanMailTemplates")
    );

    return Array.isArray(saved) && saved.length
      ? saved.map(t => ({
          ...t,
          to: getEmailList(t.to),
          cc: getEmailList(t.cc)
        }))
      : DEFAULT_TEMPLATES.map(t => ({ ...t }));

  } catch {
    return DEFAULT_TEMPLATES.map(t => ({ ...t }));
  }
}

function saveTemplates() {
  localStorage.setItem(
    "lakshmanMailTemplates",
    JSON.stringify(templates)
  );
}

function getEmailList(value) {
  if (Array.isArray(value)) {
    return value
      .map(x => String(x).trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(/[,\n;]/)
    .map(x => x.trim())
    .filter(Boolean);
}

/* --------------------------------
   TO AND CC MULTIPLE EMAIL INPUTS
-------------------------------- */

function renderRecipientInputs(containerId, values) {
  const container = $(containerId);
  container.innerHTML = "";

  const emails = getEmailList(values);
  const list = emails.length ? emails : [""];

  list.forEach(email => {
    addRecipientInput(containerId, email);
  });
}

function addRecipientInput(containerId, value = "") {
  const container = $(containerId);

  const row = document.createElement("div");
  row.className = "recipient-row";

  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = "name@example.com";
  input.className = "recipient-input";
  input.value = value;
  input.autocomplete = "email";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-recipient";
  remove.textContent = "×";
  remove.title = "Remove email";

  remove.onclick = () => {
    if (container.children.length > 1) {
      row.remove();
    } else {
      input.value = "";
    }
  };

  row.append(input, remove);
  container.appendChild(row);
}

function collectRecipientEmails(containerId) {
  return [...$(containerId).querySelectorAll("input")]
    .map(input => input.value.trim())
    .filter(Boolean);
}

function formatRecipients(value) {
  return getEmailList(value).join(", ");
}

/* --------------------------------
   DATE FUNCTIONS - WORKSPACE 1
-------------------------------- */

function dateValue() {
  if (selectedDate === "custom" && $("customDate").value) {
    return new Date($("customDate").value + "T12:00:00");
  }

  const d = new Date();

  if (selectedDate === "tomorrow") {
    d.setDate(d.getDate() + 1);
  }

  return d;
}

/* --------------------------------
   DATE FUNCTIONS - WORKSPACE 2
-------------------------------- */

function w2DateValue() {
  if (selectedW2Date === "custom" && $("w2CustomDate").value) {
    return new Date($("w2CustomDate").value + "T12:00:00");
  }

  const d = new Date();

  if (selectedW2Date === "tomorrow") {
    d.setDate(d.getDate() + 1);
  }

  return d;
}

function formatDate(d) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(d);
}

function replaceDate(s) {
  return (s || "")
    .replaceAll("{{DATE}}", formatDate(dateValue()))
    .replaceAll("{{NAME}}", "there");
}

/* --------------------------------
   HTML SECURITY
-------------------------------- */

function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

/* --------------------------------
   WORKSPACE 2 - LOAD SHEETS
-------------------------------- */

function loadSheets() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("lakshmanWorkspace2Sheets")
    );

    if (Array.isArray(saved)) {
      return saved;
    }

  } catch (error) {
    console.log("Could not load saved sheets.");
  }

  return DEFAULT_SHEETS.map(sheet => ({ ...sheet }));
}

function saveSheets() {
  localStorage.setItem(
    "lakshmanWorkspace2Sheets",
    JSON.stringify(sheets)
  );
}

/* --------------------------------
   WORKSPACE 2 - DISPLAY SHEETS
-------------------------------- */

function renderSheets() {
  const container = $("sheetList");

  container.innerHTML = "";

  $("sheetCount").textContent =
    `${sheets.length} sheet name${sheets.length === 1 ? "" : "s"}`;

  sheets.forEach(sheet => {

    const item = document.createElement("div");
    item.className = "sheet-item";

    /* CHECKBOX */

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = selectedSheets.has(sheet.id);

    checkbox.setAttribute(
      "aria-label",
      `Select ${sheet.name}`
    );

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedSheets.add(sheet.id);
      } else {
        selectedSheets.delete(sheet.id);
      }
    });

    /* SHEET NAME */

    const name = document.createElement("span");

    name.className = "sheet-name";
    name.textContent = sheet.name;

    /* ACTION BUTTONS */

    const actions = document.createElement("div");
    actions.className = "sheet-actions";

    /* COPY BUTTON */

    const copyButton = document.createElement("button");

    copyButton.className = "sheet-action copy-sheet";
    copyButton.textContent = "Copy";

    copyButton.addEventListener("click", () => {
      copySheetName(sheet.name);
    });

    /* EDIT BUTTON */

    const editButton = document.createElement("button");

    editButton.className = "sheet-action edit-sheet";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      editSheet(sheet.id);
    });

    /* DELETE BUTTON */

    const deleteButton = document.createElement("button");

    deleteButton.className = "sheet-action delete-sheet";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteSheet(sheet.id);
    });

    actions.append(
      copyButton,
      editButton,
      deleteButton
    );

    item.append(
      checkbox,
      name,
      actions
    );

    container.appendChild(item);
  });
}

/* --------------------------------
   WORKSPACE 2 - COPY SHEET NAME
-------------------------------- */

function copySheetName(name) {

  if (navigator.clipboard && window.isSecureContext) {

    navigator.clipboard.writeText(name)
      .then(() => {
        showToast(`Copied: ${name}`);
      })
      .catch(() => {
        fallbackCopy(name);
      });

  } else {
    fallbackCopy(name);
  }
}

function fallbackCopy(name) {

  const textarea = document.createElement("textarea");

  textarea.value = name;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);

  textarea.select();

  try {

    const copied = document.execCommand("copy");

    showToast(
      copied
        ? `Copied: ${name}`
        : "Copy failed. Please try again."
    );

  } catch {
    showToast("Copy failed. Please try again.");
  }

  textarea.remove();
}

/* --------------------------------
   WORKSPACE 2 - EDIT SHEET NAME
-------------------------------- */

function editSheet(id) {

  const sheet = sheets.find(s => s.id === id);

  if (!sheet) return;

  const newName = prompt(
    "Enter the new sheet name:",
    sheet.name
  );

  if (newName === null) return;

  const cleanName = newName.trim();

  if (!cleanName) {
    showToast("Sheet name cannot be empty.");
    return;
  }

  sheet.name = cleanName;

  saveSheets();
  renderSheets();

  showToast("Sheet name updated!");
}

/* --------------------------------
   WORKSPACE 2 - ADD NEW SHEET
-------------------------------- */

function addSheet() {

  const newName = prompt("Enter the new sheet name:");

  if (newName === null) return;

  const cleanName = newName.trim();

  if (!cleanName) {
    showToast("Please enter a sheet name.");
    return;
  }

  const newId = sheets.length
    ? Math.max(...sheets.map(s => Number(s.id) || 0)) + 1
    : 1;

  sheets.push({
    id: newId,
    name: cleanName
  });

  saveSheets();
  renderSheets();

  showToast("New sheet added!");
}

/* --------------------------------
   WORKSPACE 2 - DELETE SHEET
-------------------------------- */

function deleteSheet(id) {

  const sheet = sheets.find(s => s.id === id);

  if (!sheet) return;

  if (!confirm(`Delete "${sheet.name}"?`)) {
    return;
  }

  sheets = sheets.filter(s => s.id !== id);

  selectedSheets.delete(id);

  saveSheets();
  renderSheets();

  showToast("Sheet deleted.");
}

/* --------------------------------
   WORKSPACE 2 - CLEAR CHECKBOXES
-------------------------------- */

function clearAllSheets() {

  selectedSheets.clear();

  renderSheets();

  showToast("All checkboxes cleared.");
}

/* --------------------------------
   MAIN RENDER FUNCTION
-------------------------------- */

function render() {

  const isWorkspace2 = currentView === "workspace2";
  const isDrafts = currentView === "drafts";

  $("libraryPanel").hidden = isDrafts || isWorkspace2;

  $("draftsHeading").hidden = !isDrafts;

  $("workspace2Panel").hidden = !isWorkspace2;

  $("mailDateRow").hidden = isWorkspace2;

  $("mailDateNote").hidden = isWorkspace2;

  $("templateGrid").hidden = isWorkspace2;

  $("emptyState").hidden = isWorkspace2;

  $("pageTitle").textContent =
    isDrafts
      ? "Your drafts, ready to continue."
      : isWorkspace2
        ? "Your sheets, neatly organised."
        : "Ready when you are.";

  $("templateCount").textContent = templates.length;

  $("readyCount").textContent = templates.length;

  if (isWorkspace2) {
    renderSheets();
    return;
  }

  const query = $("searchInput").value
    .trim()
    .toLowerCase();

  const list = isDrafts ? drafts : templates;

  $("templateGrid").innerHTML = "";

  const shown = list.filter(t =>
    [
      t.title,
      t.subtitle,
      t.subject,
      formatRecipients(t.to)
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );

  shown.forEach((t, index) => {

    const card = document.createElement("article");

    card.className = "template-card";

    card.innerHTML = `
      <div class="card-top">
        <span class="ready">
          <span class="number">${String(index + 1).padStart(2, "0")}</span>
          READY
        </span>

        <button class="icon-button edit-btn">✎</button>
      </div>

      <h3>${escapeHTML(t.title)}</h3>

      <div class="card-subtitle">
        ${escapeHTML(replaceDate(t.subtitle || ""))}
      </div>

      <p class="card-excerpt">
        ${escapeHTML(replaceDate(t.body).replace(/\n/g, " "))}
      </p>

      <div class="card-meta">
        <span class="recipient">
          ${escapeHTML(formatRecipients(t.to) || "No recipient added")}
        </span>

        <span>Date-aware</span>
      </div>

      <div class="card-actions">
        <button class="primary-button preview-btn">Preview ↗</button>
        <button class="secondary-button compose-btn">➤ Compose</button>
      </div>
    `;

    card.querySelector(".edit-btn").onclick = () => {
      openEdit(t.id);
    };

    card.querySelector(".preview-btn").onclick = () => {
      openPreview(t.id);
    };

    card.querySelector(".compose-btn").onclick = () => {
      compose(t.id);
    };

    $("templateGrid").appendChild(card);
  });

  $("emptyState").hidden = shown.length !== 0;
}

/* --------------------------------
   TOAST MESSAGE
-------------------------------- */

function showToast(message) {

  const el = $("toast");

  el.textContent = message;

  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 2200);
}

/* --------------------------------
   MODAL FUNCTIONS
-------------------------------- */

function openModal() {

  $("modalBackdrop").hidden = false;

  document.body.style.overflow = "hidden";
}

function closeModal() {

  $("modalBackdrop").hidden = true;

  document.body.style.overflow = "";
}

/* --------------------------------
   EDIT EMAIL TEMPLATE
-------------------------------- */

function openEdit(id) {

  activeId = id;

  const t = templates.find(x => x.id === id);

  if (!t) return;

  $("modalKicker").textContent = "TEMPLATE DETAILS";

  $("modalTitle").textContent = "Edit template";

  $("editFields").hidden = false;

  $("previewFields").hidden = true;

  $("editTitle").value = t.title;

  renderRecipientInputs("editTo", t.to);

  renderRecipientInputs("editCc", t.cc);

  $("editSubject").value = t.subject || "";

  $("editBody").value = t.body || "";

  openModal();
}

/* --------------------------------
   PREVIEW EMAIL
-------------------------------- */

function openPreview(id) {

  activeId = id;

  const t = templates.find(x => x.id === id);

  if (!t) return;

  $("modalKicker").textContent = "MESSAGE PREVIEW";

  $("modalTitle").textContent = t.title;

  $("editFields").hidden = true;

  $("previewFields").hidden = false;

  $("previewTo").textContent =
    formatRecipients(t.to) || "Not specified";

  $("previewCc").textContent =
    formatRecipients(t.cc) || "Not specified";

  $("previewSubject").textContent =
    replaceDate(t.subject);

  $("previewBody").textContent =
    replaceDate(t.body);

  openModal();
}

/* --------------------------------
   SAVE EMAIL TEMPLATE
-------------------------------- */

function saveEdit() {

  const t = templates.find(x => x.id === activeId);

  if (!t) return;

  t.title =
    $("editTitle").value.trim() || "Untitled template";

  t.to = collectRecipientEmails("editTo");

  t.cc = collectRecipientEmails("editCc");

  t.subject = $("editSubject").value;

  t.body = $("editBody").value;

  saveTemplates();

  render();

  closeModal();

  showToast("Template saved successfully!");
}

/* --------------------------------
   COMPOSE IN GMAIL
-------------------------------- */

function compose(id) {

  const t = templates.find(x => x.id === id);

  if (!t) return;

  const params = new URLSearchParams();

  const toEmails = getEmailList(t.to);

  const ccEmails = getEmailList(t.cc);

  if (toEmails.length) {
    params.set("to", toEmails.join(","));
  }

  if (ccEmails.length) {
    params.set("cc", ccEmails.join(","));
  }

  params.set("su", replaceDate(t.subject));

  params.set("body", replaceDate(t.body));

  const url =
    "https://mail.google.com/mail/?view=cm&fs=1&"
    + params.toString();

  const win = window.open(url, "_blank");

  if (!win) {
    showToast("Allow pop-ups in Chrome and try again.");
    return;
  }

  drafts.unshift({
    ...t,
    id: Date.now(),
    savedAt: new Date().toISOString()
  });

  drafts = drafts.slice(0, 30);

  localStorage.setItem(
    "lakshmanMailDrafts",
    JSON.stringify(drafts)
  );

  showToast("Gmail opened in a new tab!");
}

/* --------------------------------
   UPDATE BOTH DATE DISPLAYS
-------------------------------- */

function updateDateButtons() {

  const today = new Date();

  const tomorrow = new Date();

  tomorrow.setDate(today.getDate() + 1);

  $("todayLabel").textContent = formatDate(today);

  $("tomorrowLabel").textContent = formatDate(tomorrow);

  $("activeDateLabel").textContent = formatDate(dateValue());

  $("w2TodayLabel").textContent = formatDate(today);

  $("w2TomorrowLabel").textContent = formatDate(tomorrow);

  $("w2ActiveDateLabel").textContent =
    formatDate(w2DateValue());
}

/* --------------------------------
   WORKSPACE 1 DATE BUTTONS
-------------------------------- */

document.querySelectorAll("[data-date]").forEach(btn => {

  btn.addEventListener("click", () => {

    selectedDate = btn.dataset.date;

    document.querySelectorAll("[data-date]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });

    updateDateButtons();

    render();
  });
});

$("customDate").addEventListener("change", e => {

  if (!e.target.value) return;

  selectedDate = "custom";

  document.querySelectorAll("[data-date]").forEach(b => {
    b.classList.remove("selected");
  });

  updateDateButtons();

  render();
});

/* --------------------------------
   WORKSPACE 2 DATE BUTTONS
-------------------------------- */

document.querySelectorAll("[data-w2-date]").forEach(btn => {

  btn.addEventListener("click", () => {

    selectedW2Date 
