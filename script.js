
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
let mailDate = "today";
let backupDate = "today";
let customMailDate = "";
let customBackupDate = "";

function getElement(id) {
  return document.getElementById(id);
}

function getLocalDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMailDate() {
  if (mailDate === "tomorrow") return getLocalDate(1);
  if (mailDate === "custom") return customMailDate;
  return getLocalDate();
}

function getBackupDate() {
  if (backupDate === "tomorrow") return getLocalDate(1);
  if (backupDate === "custom") return customBackupDate;
  return getLocalDate();
}

function getStorageKey() {
  return `lakshmanWorkspace_${getBackupDate()}`;
}

function showToast(message) {
  const toast = getElement("toast");

  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  } else {
    alert(message);
  }
}

// ==========================================
// COPY FUNCTION
// ==========================================

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
      return;
    }

    showToast("Copied successfully!");
  } catch (error) {
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
    showToast("Copied successfully!");
  } catch (error) {
    alert("Copy failed. Please copy manually.");
  }

  textarea.remove();
}

// ==========================================
// WORKSPACE NAVIGATION
// ==========================================

function showWorkspace(workspace) {
  const mail = getElement("mailWorkspace");
  const backup = getElement("backupWorkspace");

  const mailTab = getElement("mailTab");
  const backupTab = getElement("backupTab");

  if (!mail || !backup) return;

  mail.classList.toggle("hidden", workspace !== "mail");
  backup.classList.toggle("hidden", workspace !== "backup");

  if (mailTab) {
    mailTab.classList.toggle("active", workspace === "mail");
  }

  if (backupTab) {
    backupTab.classList.toggle("active", workspace === "backup");
  }

  if (workspace === "backup") renderSheets();
}

// ==========================================
// EMAIL DATE SELECTION
// ==========================================

function setMailDate(type) {
  mailDate = type;

  const today = getElement("mailToday");
  const tomorrow = getElement("mailTomorrow");
  const custom = getElement("mailCustom");

  if (today) today.classList.toggle("active", type === "today");
  if (tomorrow) tomorrow.classList.toggle("active", type === "tomorrow");

  if (custom) {
    custom.classList.toggle("active", type === "custom");

    if (type === "custom" && custom.value) {
      customMailDate = custom.value;
    }
  }

  renderMails();
}

// ==========================================
// RENDER EMAIL TEMPLATES
// ==========================================

function renderMails() {
  const container = getElement("mailCards");
  const searchInput = getElement("mailSearch");
  const count = getElement("templateCount");

  if (!container) return;

  const searchText = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";

  container.innerHTML = "";

  let visibleCount = 0;

  emailTemplates.forEach((template, index) => {
    const content =
      `${template.title} ${template.subject} ${template.message}`.toLowerCase();

    if (!content.includes(searchText)) return;

    visibleCount++;

    const card = document.createElement("div");
    card.className = "template-card";

    const title = document.createElement("h3");
    title.textContent = template.title;

    const subject = document.createElement("p");
    subject.textContent = template.subject;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const previewBtn = document.createElement("button");
    previewBtn.type = "button";
    previewBtn.textContent = "Preview";
    previewBtn.onclick = () => previewTemplate(index);

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editTemplate(index);

    const composeBtn = document.createElement("button");
    composeBtn.type = "button";
    composeBtn.textContent = "Compose";
    composeBtn.onclick = () => editTemplate(index);

    actions.append(previewBtn, editBtn, composeBtn);
    card.append(title, subject, actions);
    container.appendChild(card);
  });

  if (count) {
    count.textContent =
      `${visibleCount} of ${emailTemplates.length} templates ready`;
  }
}

// ==========================================
// PREVIEW TEMPLATE
// ==========================================

function previewTemplate(index) {
  selectedTemplate = index;

  const template = emailTemplates[index];

  const modal = getElement("modalBack");
  const title = getElement("modalTitle");
  const to = getElement("editTo");
  const cc = getElement("editCc");
  const subject = getElement("editSubject");
  const message = getElement("editBody");

  if (title) title.textContent = template.title;
  if (to) to.value = "";
  if (cc) cc.value = "";
  if (subject) subject.value = template.subject;
  if (message) message.value = template.message;

  if (modal) {
    modal.classList.remove("hidden");
  }
}

function editTemplate(index) {
  previewTemplate(index);
}

// ==========================================
// SAVE TEMPLATE
// ==========================================

function saveTemplate() {
  if (selectedTemplate === null) return;

  const subject = getElement("editSubject");
  const message = getElement("editBody");

  if (!subject || !message) return;

  emailTemplates[selectedTemplate].subject = subject.value;
  emailTemplates[selectedTemplate].message = message.value;

  closeModal();
  renderMails();

  showToast("Template updated successfully!");
}

// ==========================================
// MULTIPLE EMAIL ADDRESS SUPPORT
// ==========================================

function getEmailList(value) {
  if (!value || !value.trim()) return [];

  return value
    .split(",")
    .map(email => email.trim())
    .filter(Boolean);
}

function validateEmails(emails) {
  const pattern = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

  return emails.filter(email => !pattern.test(email));
}

// ==========================================
// OPEN EMAIL APP
// MULTIPLE TO AND CC RECIPIENTS
// ==========================================

function openEmail() {
  const to = getElement("editTo");
  const cc = getElement("editCc");
  const subject = getElement("editSubject");
  const message = getElement("editBody");

  if (!subject || !message) {
    alert("Subject or message field not found.");
    return;
  }

  const emailTo = getEmailList(to ? to.value : "");
  const emailCc = getEmailList(cc ? cc.value : "");

  const invalidEmails = validateEmails([
    ...emailTo,
    ...emailCc
  ]);

  if (invalidEmails.length > 0) {
    alert(
      "Please check these invalid email addresses:\n\n" +
      invalidEmails.join("\n")
    );
    return;
  }

  const params = new URLSearchParams();

  params.set("subject", subject.value);
  params.set("body", message.value);

  if (emailCc.length > 0) {
    params.set("cc", emailCc.join(","));
  }

  const recipients = emailTo
    .map(email => encodeURIComponent(email))
    .join(",");

  const mailtoURL =
    `mailto:${recipients}?${params.toString()}`;

  window.location.href = mailtoURL;
}

// ==========================================
// COPY EMAIL MESSAGE
// ==========================================

function copyEmail() {
  const to = getElement("editTo");
  const cc = getElement("editCc");
  const subject = getElement("editSubject");
  const message = getElement("editBody");

  if (!subject || !message) return;

  const emailTo = getEmailList(to ? to.value : "");
  const emailCc = getEmailList(cc ? cc.value : "");

  const text =
    `To: ${emailTo.join(", ")}\n` +
    `Cc: ${emailCc.join(", ")}\n` +
    `Subject: ${subject.value}\n\n` +
    message.value;

  copyText(text);
}

// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {
  const modal = getElement("modalBack");

  if (modal) {
    modal.classList.add("hidden");
  }

  selectedTemplate = null;
}

// ==========================================
// BACKUP DATE SELECTION
// ==========================================

function setBackupDate(type) {
  backupDate = type;

  const today = getElement("backupToday");
  const tomorrow = getElement("backupTomorrow");
  const custom = getElement("backupCustom");

  if (today) today.classList.toggle("active", type === "today");
  if (tomorrow) tomorrow.classList.toggle("active", type === "tomorrow");

  if (custom) {
    custom.classList.toggle("active", type === "custom");

    if (type === "custom" && custom.value) {
      customBackupDate = custom.value;
    }
  }

  renderSheets();
}

// ==========================================
// RENDER BACKUP SHEETS
// ==========================================

function renderSheets() {
  const container = getElement("sheetRows");

  if (!container) return;

  const savedChecks = JSON.parse(
    localStorage.getItem(getStorageKey()) || "{}"
  );

  container.innerHTML = "";

  let doneCount = 0;

  const date = getBackupDate();
  const formattedDate = date
    ? date.split("-").reverse().join("-")
    : "";

  const dateLabel = getElement("backupDateLabel");

  if (dateLabel) {
    dateLabel.textContent = formattedDate;
  }

  sampleSheets.forEach((sheet, index) => {
    const checked = savedChecks[index] === true;

    if (checked) doneCount++;

    const row = document.createElement("div");
    row.className = "sheet-row";

    const name = document.createElement("span");
    name.textContent = `${sheet} ${formattedDate}`;

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "btn";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => copySheetName(index);

    const statusLabel = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    checkbox.onchange = () => toggleSheet(index, checkbox.checked);

    statusLabel.appendChild(checkbox);
    statusLabel.appendChild(
      document.createTextNode(checked ? " Done" : " Pending")
    );

    row.append(name, copyBtn, statusLabel);
    container.appendChild(row);
  });

  const count = getElement("doneCount");

  if (count) {
    count.textContent = `${doneCount} / 20 done`;
  }
}

// ==========================================
// TOGGLE BACKUP STATUS
// ==========================================

function toggleSheet(index, checked) {
  const savedChecks = JSON.parse(
    localStorage.getItem(getStorageKey()) || "{}"
  );

  savedChecks[index] = checked;

  localStorage.setItem(
    getStorageKey(),
    JSON.stringify(savedChecks)
  );

  renderSheets();
}

// ==========================================
// COPY SHEET NAME
// ==========================================

function copySheetName(index) {
  const date = getBackupDate();
  const formattedDate = date.split("-").reverse().join("-");

  copyText(`${sampleSheets[index]} ${formattedDate}`);
}

// ==========================================
// CLEAR ALL CHECKS
// ==========================================

function clearChecks() {
  localStorage.removeItem(getStorageKey());
  renderSheets();

  showToast("All backup checks cleared!");
}

// ==========================================
// INITIALIZE WORKSPACE
// ==========================================

function initializeWorkspace() {
  const mailCustom = getElement("mailCustom");

  if (mailCustom) {
    mailCustom.addEventListener("change", () => {
      customMailDate = mailCustom.value;
      setMailDate("custom");
    });
  }

  const backupCustom = getElement("backupCustom");

  if (backupCustom) {
    backupCustom.addEventListener("change", () => {
      customBackupDate = backupCustom.value;
      setBackupDate("custom");
    });
  }

  const searchInput = getElement("mailSearch");

  if (searchInput) {
    searchInput.addEventListener("input", renderMails);
  }

  renderMails();
  renderSheets();
}

// ==========================================
// GLOBAL FUNCTION CONNECTIONS
// ==========================================

window.showWorkspace = showWorkspace;

window.setMailDate = setMailDate;
window.setBackupDate = setBackupDate;

window.renderMails = renderMails;

window.previewTemplate = previewTemplate;
window.editTemplate = editTemplate;
window.saveTemplate = saveTemplate;

window.openEmail = openEmail;
window.copyEmail = copyEmail;
window.closeModal = closeModal;

window.toggleSheet = toggleSheet;
window.copySheetName = copySheetName;
window.clearChecks = clearChecks;

// ==========================================
// START APPLICATION
// ==========================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeWorkspace
  );
} else {
  initializeWorkspace();
}
