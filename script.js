
const emailTemplates = [
  {
    title: "Daily Work Update",
    subject: "Daily Work Update",
    message: "Hi Team,\n\nPlease find my daily work update below.\n\nThanks,\nLakshman"
  },
  {
    title: "Shift Handover",
    subject: "Shift Handover Update",
    message: "Hi Team,\n\nPlease find the shift handover details below.\n\nThanks,\nLakshman"
  },
  {
    title: "Leave Request",
    subject: "Leave Request",
    message: "Hi Team,\n\nI would like to request leave. Kindly approve my request.\n\nThanks,\nLakshman"
  },
  {
    title: "Late Login",
    subject: "Late Login Intimation",
    message: "Hi Team,\n\nI would like to inform you that I may log in late today.\n\nThanks,\nLakshman"
  },
  {
    title: "System Issue",
    subject: "System Issue",
    message: "Hi Team,\n\nI am facing a system issue. Please help me resolve it.\n\nThanks,\nLakshman"
  },
  {
    title: "Work Completion",
    subject: "Work Completion Update",
    message: "Hi Team,\n\nI have completed the assigned work.\n\nThanks,\nLakshman"
  },
  {
    title: "Meeting Request",
    subject: "Meeting Request",
    message: "Hi Team,\n\nCould you please schedule a meeting to discuss this?\n\nThanks,\nLakshman"
  },
  {
    title: "Request for Support",
    subject: "Request for Support",
    message: "Hi Team,\n\nI need your support regarding the below-mentioned task.\n\nThanks,\nLakshman"
  },
  {
    title: "Thank You",
    subject: "Thank You",
    message: "Hi Team,\n\nThank you for your support and guidance.\n\nRegards,\nLakshman"
  },
  {
    title: "General Update",
    subject: "General Update",
    message: "Hi Team,\n\nI would like to share a quick update.\n\nThanks,\nLakshman"
  }
];

const sampleSheets = Array.from(
  { length: 20 },
  (_, index) => `Sheet ${String(index + 1).padStart(2, "0")}`
);

let selectedTemplate = null;
let selectedDate = new Date().toISOString().split("T")[0];

function getElement(id) {
  return document.getElementById(id);
}

function getSelectedDate() {
  const dateInput = getElement("datePicker");
  return dateInput && dateInput.value ? dateInput.value : selectedDate;
}

function getStorageKey() {
  return `lakshmanWorkspace_${getSelectedDate()}`;
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => alert("Copied successfully!"))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
    alert("Copied successfully!");
  } catch (error) {
    alert("Copy failed. Please copy the text manually.");
  }

  textarea.remove();
}

function renderTemplates() {
  const container =
    getElement("templateContainer") ||
    getElement("templates") ||
    getElement("emailTemplates");

  if (!container) return;

  const searchInput = getElement("searchInput");
  const searchText = searchInput ? searchInput.value.toLowerCase() : "";

  container.innerHTML = "";

  emailTemplates.forEach((template, index) => {
    if (
      !template.title.toLowerCase().includes(searchText) &&
      !template.subject.toLowerCase().includes(searchText)
    ) return;

    const card = document.createElement("div");
    card.className = "template-card";

    card.innerHTML = `
      <h3>${template.title}</h3>
      <p>${template.subject}</p>
      <div class="card-actions">
        <button type="button" onclick="previewTemplate(${index})">Preview</button>
        <button type="button" onclick="editTemplate(${index})">Edit</button>
        <button type="button" onclick="composeTemplate(${index})">Compose</button>
      </div>
    `;

    container.appendChild(card);
  });
}

function previewTemplate(index) {
  selectedTemplate = index;
  const template = emailTemplates[index];

  const modal = getElement("previewModal");
  const title = getElement("previewTitle");
  const subject = getElement("previewSubject");
  const message = getElement("previewMessage");

  if (title) title.textContent = template.title;
  if (subject) subject.textContent = template.subject;
  if (message) message.textContent = template.message;

  if (modal) modal.style.display = "flex";
  else alert(`${template.subject}\n\n${template.message}`);
}

function editTemplate(index) {
  selectedTemplate = index;
  const template = emailTemplates[index];

  const modal = getElement("editModal");
  const subject = getElement("editSubject");
  const message = getElement("editMessage");

  if (subject) subject.value = template.subject;
  if (message) message.value = template.message;

  const to = getElement("editTo");
  const cc = getElement("editCc");

  if (to) to.value = "";
  if (cc) cc.value = "";

  if (modal) modal.style.display = "flex";
  else alert("Edit modal not found. Check your index.html.");
}

function saveTemplate() {
  if (selectedTemplate === null) return;

  const subject = getElement("editSubject");
  const message = getElement("editMessage");

  if (!subject || !message) return;

  emailTemplates[selectedTemplate].subject = subject.value;
  emailTemplates[selectedTemplate].message = message.value;

  closeEditModal();
  renderTemplates();
  alert("Template updated successfully!");
}

function composeTemplate(index) {
  const template = emailTemplates[index];
  const subject = encodeURIComponent(template.subject);
  const body = encodeURIComponent(template.message);

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function composeEditedEmail() {
  const to = getElement("editTo");
  const cc = getElement("editCc");
  const subject = getElement("editSubject");
  const message = getElement("editMessage");

  if (!subject || !message) return;

  const emailTo = to ? to.value.trim() : "";
  const emailCc = cc ? cc.value.trim() : "";

  const url =
    `mailto:${encodeURIComponent(emailTo)}` +
    `?subject=${encodeURIComponent(subject.value)}` +
    `&body=${encodeURIComponent(message.value)}` +
    (emailCc ? `&cc=${encodeURIComponent(emailCc)}` : "");

  window.location.href = url;
}

function copyEditedEmail() {
  const subject = getElement("editSubject");
  const message = getElement("editMessage");

  if (!subject || !message) return;

  copyText(`Subject: ${subject.value}\n\n${message.value}`);
}

function closePreviewModal() {
  const modal = getElement("previewModal");
  if (modal) modal.style.display = "none";
}

function closeEditModal() {
  const modal = getElement("editModal");
  if (modal) modal.style.display = "none";
}

function renderSheets() {
  const container = getElement("sheetContainer");
  if (!container) return;

  const savedChecks = JSON.parse(
    localStorage.getItem(getStorageKey()) || "{}"
  );

  container.innerHTML = "";

  sampleSheets.forEach((sheet, index) => {
    const checked = savedChecks[index] === true;

    const item = document.createElement("div");
    item.className = "sheet-item";

    item.innerHTML = `
      <label>
        <input
          type="checkbox"
          ${checked ? "checked" : ""}
          onchange="toggleSheet(${index}, this.checked)"
        >
        <span>${sheet}</span>
      </label>
      <button type="button" onclick="renameSheet(${index})">Rename</button>
      <button type="button" onclick="copySheetName(${index})">Copy</button>
    `;

    container.appendChild(item);
  });
}

function toggleSheet(index, checked) {
  const savedChecks = JSON.parse(
    localStorage.getItem(getStorageKey()) || "{}"
  );

  savedChecks[index] = checked;
  localStorage.setItem(getStorageKey(), JSON.stringify(savedChecks));
}

function renameSheet(index) {
  const newName = prompt("Enter new sheet name:", sampleSheets[index]);

  if (newName && newName.trim()) {
    sampleSheets[index] = newName.trim();
    renderSheets();
  }
}

function copySheetName(index) {
  copyText(sampleSheets[index]);
}

function clearSheetChecks() {
  localStorage.removeItem(getStorageKey());
  renderSheets();
}

function copyAllSheetNames() {
  copyText(sampleSheets.join("\n"));
}

function initializeWorkspace() {
  const datePicker = getElement("datePicker");

  if (datePicker) {
    datePicker.value = selectedDate;
    datePicker.addEventListener("change", () => {
      selectedDate = datePicker.value;
      renderSheets();
    });
  }

  const searchInput = getElement("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", renderTemplates);
  }

  renderTemplates();
  renderSheets();
}

window.previewTemplate = previewTemplate;
window.editTemplate = editTemplate;
window.composeTemplate = composeTemplate;
window.saveTemplate = saveTemplate;
window.composeEditedEmail = composeEditedEmail;
window.copyEditedEmail = copyEditedEmail;
window.closePreviewModal = closePreviewModal;
window.closeEditModal = closeEditModal;
window.toggleSheet = toggleSheet;
window.renameSheet = renameSheet;
window.copySheetName = copySheetName;
window.clearSheetChecks = clearSheetChecks;
window.copyAllSheetNames = copyAllSheetNames;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeWorkspace);
} else {
  initializeWorkspace();
}
