
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

const $ = id => document.getElementById(id);

let templates = loadTemplates();
let drafts = loadDrafts();
let selectedDate = "today";
let activeId = null;
let modalMode = "edit";
let currentView = "templates";

const DEFAULT_SHEETS = [
 "Uki", "Latam", "Sheet 03", "Sheet 04", "Sheet 05", "Sheet 06",
 "Sheet 07", "Sheet 08", "Sheet 09", "Sheet 10", "Sheet 11",
 "Sheet 12", "Sheet 13", "Sheet 14", "Sheet 15", "Sheet 16",
 "Sheet 17", "Sheet 18", "Sheet 19", "Sheet 20", "Sheet 21", "Sheet 22"
].map((name, i) => ({id:i + 1, name, checked:false}));

let sheets = loadSheets();
let w2SelectedDate = "today";

function loadDrafts() {
  try {
    const saved = JSON.parse(localStorage.getItem("lakshmanMailDrafts") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadSheets() {
  try {
    const saved = JSON.parse(localStorage.getItem("lakshmanWorkspace2Sheets"));
    return Array.isArray(saved) ? saved : DEFAULT_SHEETS.map(s => ({...s}));
  } catch {
    return DEFAULT_SHEETS.map(s => ({...s}));
  }
}

function saveSheets() {
  localStorage.setItem("lakshmanWorkspace2Sheets", JSON.stringify(sheets));
}

function getEmailList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "").split(/[;,\n]+/).map(x => x.trim()).filter(Boolean);
}

function collectRecipientEmails(type) {
  return [...document.querySelectorAll(`#${type}Recipients input`)]
    .map(x => x.value.trim())
    .filter(Boolean);
}

function renderRecipientInputs(type, values) {
  const host = $(type + "Recipients");
  host.innerHTML = "";
  (values && values.length ? values : [""]).forEach(value => addRecipientInput(type, value));
}

function addRecipientInput(type, value = "") {
  const host = $(type + "Recipients");
  const row = document.createElement("div");
  row.className = "recipient-row";

  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = "name@example.com";
  input.value = value;
  input.setAttribute("aria-label", type.toUpperCase() + " email");

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-recipient";
  remove.textContent = "×";
  remove.title = "Remove email";
  remove.onclick = () => {
    if (host.children.length > 1) row.remove();
    else input.value = "";
  };

  row.append(input, remove);
  host.appendChild(row);
}

function formatRecipients(value) {
  return getEmailList(value).join(", ");
}

function loadTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem("lakshmanMailTemplates"));
    return Array.isArray(saved) && saved.length
      ? saved
      : DEFAULT_TEMPLATES.map(x => ({...x}));
  } catch {
    return DEFAULT_TEMPLATES.map(x => ({...x}));
  }
}

function saveTemplates() {
  localStorage.setItem("lakshmanMailTemplates", JSON.stringify(templates));
}

function dateValue() {
  if (selectedDate === "custom" && $("customDate").value) {
    return new Date($("customDate").value + "T12:00:00");
  }

  const date = new Date();
  if (selectedDate === "tomorrow") date.setDate(date.getDate() + 1);
  return date;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day:"2-digit", month:"2-digit", year:"numeric"
  }).format(date);
}

function prettyDate(date) {
  return formatDate(date);
}

function replaceDate(text) {
  return (text || "")
    .replaceAll("{{DATE}}", formatDate(dateValue()))
    .replaceAll("{{NAME}}", "there");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}

// ========================================
// MAIN RENDER
// ========================================

function render() {
  const query = $("searchInput").value.trim().toLowerCase();
  const isWorkspace = currentView === "workspace2";
  const list = currentView === "drafts" ? drafts : templates;

  $("workspace2Panel").hidden = !isWorkspace;
  $("mailDateRow").hidden = isWorkspace;
  $("mailDateNote").hidden = isWorkspace;
  $("templateGrid").hidden = isWorkspace;
  $("emptyState").hidden = isWorkspace;

  if (isWorkspace) {
    $("libraryPanel").hidden = true;
    $("draftsHeading").hidden = true;
    $("pageTitle").textContent = "Your sheet names, ready to use.";
    renderSheets();
    return;
  }

  $("templateGrid").innerHTML = "";
  $("libraryPanel").hidden = currentView === "drafts";
  $("draftsHeading").hidden = currentView !== "drafts";

  $("pageTitle").textContent = currentView === "drafts"
    ? "Your drafts, ready to continue."
    : "Ready when you are.";

  $("templateCount").textContent = templates.length;
  $("readyCount").textContent = templates.length;

  const shown = list.filter(t =>
    [t.title, t.subtitle, t.subject, t.to].join(" ").toLowerCase().includes(query)
  );

  shown.forEach((t, index) => {
    const card = document.createElement("article");
    card.className = "template-card";

    card.innerHTML = `
      <div class="card-top">
        <span class="ready"><span class="number">${String(index + 1).padStart(2,"0")}</span> READY</span>
        <button class="icon-button edit-btn" title="Edit template" aria-label="Edit template">✎</button>
      </div>
      <h3>${escapeHTML(t.title)}</h3>
      <div class="card-subtitle">${escapeHTML(replaceDate(t.subtitle || "Email template"))}</div>
      <p class="card-excerpt">${escapeHTML(replaceDate(t.body).replace(/\n/g," "))}</p>
      <div class="card-meta">
        <span class="recipient">${escapeHTML(formatRecipients(t.to) || "No recipient added")} · ${t.cc ? "CC added" : "No CC"}</span>
        <span>Date-aware</span>
      </div>
      <div class="card-actions">
        <button class="primary-button preview-btn">Preview ↗</button>
        <button class="secondary-button compose-btn">➤ &nbsp; Compose</button>
      </div>`;

    card.querySelector(".edit-btn").onclick = () => {
      if (currentView === "drafts") openDraft(t.id);
      else openEdit(t.id);
    };

    card.querySelector(".preview-btn").onclick = () => openPreview(t.id);
    card.querySelector(".compose-btn").onclick = () => compose(t.id);

    $("templateGrid").appendChild(card);
  });

  $("emptyState").hidden = shown.length !== 0;
  $("emptyState").textContent = currentView === "drafts"
    ? "No saved drafts yet."
    : "No matching templates found. Try another search.";
}

function showToast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => element.classList.remove("show"), 2200);
}

// ========================================
// EMAIL MODAL
// ========================================

function openModal() {
  $("modalBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("modalBackdrop").hidden = true;
  document.body.style.overflow = "";
}

function openEdit(id) {
  activeId = id;
  const template = templates.find(x => x.id === id);
  if (!template) return;

  modalMode = "edit";
  $("modalKicker").textContent = "TEMPLATE DETAILS";
  $("modalTitle").textContent = "Edit template";
  $("editFields").hidden = false;
  $("previewFields").hidden = true;

  $("editTitle").value = template.title;
  renderRecipientInputs("to", getEmailList(template.to));
  renderRecipientInputs("cc", getEmailList(template.cc));
  renderRecipientInputs("bcc", getEmailList(template.bcc));
  $("editSubject").value = template.subject || "";
  $("editBody").value = template.body || "";

  openModal();
}

function openPreview(id) {
  activeId = id;
  const template = templates.find(x => x.id === id) ||
    drafts.find(x => x.id === id);

  if (!template) return;

  modalMode = "preview";
  $("modalKicker").textContent = "MESSAGE PREVIEW";
  $("modalTitle").textContent = template.title;
  $("editFields").hidden = true;
  $("previewFields").hidden = false;

  $("previewTo").textContent = formatRecipients(template.to) || "Not specified — add recipient in Gmail";
  $("previewCc").textContent = formatRecipients(template.cc) || "—";
  $("previewBcc").textContent = formatRecipients(template.bcc) || "—";
  $("previewSubject").textContent = replaceDate(template.subject);
  $("previewBody").textContent = replaceDate(template.body);

  openModal();
}

function saveEdit() {
  const template = templates.find(x => x.id === activeId);
  if (!template) return;

  template.title = $("editTitle").value.trim() || "Untitled template";
  template.to = collectRecipientEmails("to").join(", ");
  template.cc = collectRecipientEmails("cc").join(", ");
  template.bcc = collectRecipientEmails("bcc").join(", ");
  template.subject = $("editSubject").value;
  template.body = $("editBody").value;

  saveTemplates();
  render();
  closeModal();
  showToast("Template saved in this browser.");
}

// ========================================
// GMAIL COMPOSE
// ========================================

function compose(id) {
  const template = templates.find(x => x.id === id) ||
    drafts.find(x => x.id === id);

  if (!template) return;

  const params = new URLSearchParams();

  if (template.to) params.set("to", formatRecipients(template.to));
  if (template.cc) params.set("cc", formatRecipients(template.cc));
  if (template.bcc) params.set("bcc", formatRecipients(template.bcc));

  params.set("su", replaceDate(template.subject));
  params.set("body", replaceDate(template.body));

  const url = "https://mail.google.com/mail/?view=cm&fs=1&" + params.toString();
  const win = window.open(url, "_blank");

  if (!win) {
    showToast("Chrome blocked the new tab. Allow pop-ups and try again.");
    return;
  }

  drafts.unshift({
    ...template,
    id: Date.now(),
    savedAt: new Date().toISOString()
  });

  drafts = drafts.slice(0, 30);
  localStorage.setItem("lakshmanMailDrafts", JSON.stringify(drafts));
  showToast("Gmail opened in a new tab.");
}

function openDraft(id) {
  const draft = drafts.find(x => x.id === id);
  if (!draft) return;

  activeId = id;
  $("modalKicker").textContent = "SAVED DRAFT";
  $("modalTitle").textContent = "Edit draft";
  $("editFields").hidden = false;
  $("previewFields").hidden = true;

  $("editTitle").value = draft.title || "";
  renderRecipientInputs("to", getEmailList(draft.to));
  renderRecipientInputs("cc", getEmailList(draft.cc));
  renderRecipientInputs("bcc", getEmailList(draft.bcc));
  $("editSubject").value = draft.subject || "";
  $("editBody").value = draft.body || "";

  openModal();
}

// ========================================
// WORKSPACE 2 - SHEET NAMES
// ========================================

function renderSheets() {
  const host = $("sheetList");
  host.innerHTML = "";

  $("sheetCount").textContent = `${sheets.length} sheet names`;

  sheets.forEach(sheet => {
    const item = document.createElement("div");
    item.className = "sheet-item";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = !!sheet.checked;
    check.setAttribute("aria-label", "Select " + sheet.name);

    check.onchange = () => {
      sheet.checked = check.checked;
      saveSheets();
    };

    const name = document.createElement("span");
    name.className = "sheet-name";
    name.textContent = sheet.name;

    const date = document.createElement("span");
    date.className = "sheet-date";
    date.textContent = getWorkspaceDate();

    const nameWrap = document.createElement("div");
    nameWrap.className = "sheet-name-wrap";
    nameWrap.append(name, date);

    const actions = document.createElement("div");
    actions.className = "sheet-actions";

    // BIG LIGHT-BLUE COPY BUTTON
    const copy = document.createElement("button");
    copy.className = "copy-sheet-button";
    copy.textContent = "Copy";

    copy.onclick = async () => {
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

        showToast("Sheet name copied. Paste it wherever you need.");
      } catch (error) {
        showToast("Could not copy. Please allow clipboard permission.");
      }
    };

    const edit = document.createElement("button");
    edit.className = "edit-sheet-button";
    edit.textContent = "Edit";

    edit.onclick = () => {
      const next = prompt("Edit sheet name:", sheet.name);

      if (next !== null && next.trim()) {
        sheet.name = next.trim();
        saveSheets();
        renderSheets();
        showToast("Sheet name updated.");
      }
    };

    // Only Edit and Copy. Delete option removed.
    actions.append(copy, edit);
    item.append(check, nameWrap, actions);
    host.appendChild(item);
  });
}

function getWorkspaceDate() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  let date = today;

  if (w2SelectedDate === "tomorrow") {
    date = tomorrow;
  } else if (w2SelectedDate === "custom" && $("w2CustomDate").value) {
    date = new Date($("w2CustomDate").value + "T12:00:00");
  }

  return formatDate(date);
}

function addSheet() {
  const name = prompt("Enter new sheet name:");

  if (!name || !name.trim()) return;

  const id = sheets.reduce((max, sheet) =>
    Math.max(max, Number(sheet.id) || 0), 0) + 1;

  sheets.push({
    id,
    name: name.trim(),
    checked: false
  });

  saveSheets();
  renderSheets();
  showToast("Sheet name added.");
}

function clearAllSheets() {
  if (!confirm("Clear all selected sheet checkboxes?")) return;

  sheets.forEach(sheet => {
    sheet.checked = false;
  });

  saveSheets();
  renderSheets();
  showToast("All selections cleared.");
}

function updateW2Date() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  $("w2TodayLabel").textContent = prettyDate(today);
  $("w2TomorrowLabel").textContent = prettyDate(tomorrow);
  $("w2ActiveDateLabel").textContent = getWorkspaceDate();
  renderSheets();
}

// ========================================
// DATE CONTROLS
// ========================================

function updateDateButtons() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  $("todayLabel").textContent = prettyDate(today);
  $("tomorrowLabel").textContent = prettyDate(tomorrow);
  $("activeDateLabel").textContent = formatDate(dateValue());
}

document.querySelectorAll("[data-date]").forEach(button => {
  button.addEventListener("click", () => {
    selectedDate = button.dataset.date;

    document.querySelectorAll("[data-date]").forEach(item => {
      item.classList.toggle("selected", item === button);
    });

    updateDateButtons();
    render();
  });
});

$("customDate").addEventListener("change", event => {
  if (!event.target.value) return;

  selectedDate = "custom";
  document.querySelectorAll("[data-date]").forEach(item => {
    item.classList.remove("selected");
  });

  updateDateButtons();
  render();
});

document.querySelectorAll("[data-w2-date]").forEach(button => {
  button.addEventListener("click", () => {
    w2SelectedDate = button.dataset.w2Date;

    document.querySelectorAll("[data-w2-date]").forEach(item => {
      item.classList.toggle("selected", item === button);
    });

    updateW2Date();
  });
});

$("w2CustomDate").addEventListener("change", event => {
  if (!event.target.value) return;

  w2SelectedDate = "custom";

  document.querySelectorAll("[data-w2-date]").forEach(item => {
    item.classList.remove("selected");
  });

  updateW2Date();
});

// ========================================
// BUTTON EVENTS
// ========================================

$("searchInput").addEventListener("input", render);

$("saveEdit").onclick = saveEdit;
$("cancelEdit").onclick = closeModal;
$("closeModal").onclick = closeModal;

$("modalBackdrop").addEventListener("click", event => {
  if (event.target === $("modalBackdrop")) closeModal();
});

$("previewEdit").onclick = () => {
  if 
