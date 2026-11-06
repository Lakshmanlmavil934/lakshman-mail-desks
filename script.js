
const mailTemplates = [
  {
    id: 1,
    title: "Daily Work Update",
    subject: "Daily Work Update",
    to: "",
    body: "Hi Team,\n\nPlease find my daily work update below.\n\nCompleted Tasks:\n1. \n2. \n\nPending Tasks:\n1. \n\nRegards,\nLakshman"
  },
  {
    id: 2,
    title: "Shift End Update",
    subject: "Shift End Update",
    to: "",
    body: "Hi Team,\n\nMy shift has been completed.\n\nWork Status:\nCompleted:\nPending:\n\nRegards,\nLakshman"
  },
  {
    id: 3,
    title: "Leave Request",
    subject: "Leave Request",
    to: "",
    body: "Hi Team,\n\nI would like to request leave on [Date] due to personal reasons.\n\nKindly approve my request.\n\nRegards,\nLakshman"
  },
  {
    id: 4,
    title: "Late Login Update",
    subject: "Late Login Update",
    to: "",
    body: "Hi Team,\n\nI may log in late today due to an unexpected delay.\n\nSorry for the inconvenience.\n\nRegards,\nLakshman"
  },
  {
    id: 5,
    title: "Meeting Request",
    subject: "Meeting Request",
    to: "",
    body: "Hi Team,\n\nI would like to schedule a meeting to discuss the work updates.\n\nPlease let me know your availability.\n\nRegards,\nLakshman"
  },
  {
    id: 6,
    title: "Issue Escalation",
    subject: "Issue Escalation",
    to: "",
    body: "Hi Team,\n\nI would like to bring the following issue to your attention.\n\nIssue Details:\nImpact:\nAction Required:\n\nRegards,\nLakshman"
  },
  {
    id: 7,
    title: "Task Completion",
    subject: "Task Completion Update",
    to: "",
    body: "Hi Team,\n\nThe assigned task has been completed successfully.\n\nPlease let me know if anything else is required.\n\nRegards,\nLakshman"
  },
  {
    id: 8,
    title: "Apology Email",
    subject: "Apology",
    to: "",
    body: "Hi Team,\n\nI sincerely apologize for the mistake.\nI will ensure that this does not happen again.\n\nThank you for your understanding.\n\nRegards,\nLakshman"
  },
  {
    id: 9,
    title: "Request for Feedback",
    subject: "Request for Feedback",
    to: "",
    body: "Hi Team,\n\nCould you please share your feedback on my recent performance?\n\nYour suggestions will help me improve.\n\nRegards,\nLakshman"
  },
  {
    id: 10,
    title: "Thank You Email",
    subject: "Thank You",
    to: "",
    body: "Hi Team,\n\nThank you for your support and guidance.\nI really appreciate your help.\n\nRegards,\nLakshman"
  }
];

const sheets = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  name: `Backup Sheet ${index + 1}`
}));

let activeTemplate = null;

// DATE SETUP

function getToday() {
  return new Date().toLocaleDateString("en-CA");
}

document.getElementById("mailDate").value = getToday();
document.getElementById("sheetDate").value = getToday();

// WORKSPACE NAVIGATION

function showWorkspace(id) {
  document.querySelector(".welcome").classList.add("hidden");
  document.querySelector(".workspace-grid").classList.add("hidden");

  document.getElementById("mailWorkspace").classList.add("hidden");
  document.getElementById("sheetWorkspace").classList.add("hidden");

  document.getElementById(id).classList.remove("hidden");

  if (id === "mailWorkspace") renderMail();
  if (id === "sheetWorkspace") renderSheets();
}

function goHome() {
  document.querySelector(".welcome").classList.remove("hidden");
  document.querySelector(".workspace-grid").classList.remove("hidden");

  document.getElementById("mailWorkspace").classList.add("hidden");
  document.getElementById("sheetWorkspace").classList.add("hidden");
}

// MAIL DASHBOARD

function renderMail() {
  const search = document.getElementById("searchMail").value.toLowerCase();
  const list = document.getElementById("mailList");

  const filtered = mailTemplates.filter(template =>
    template.title.toLowerCase().includes(search)
  );

  list.innerHTML = "";

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-message">No email templates found.</div>`;
    return;
  }

  filtered.forEach(template => {
    const card = document.createElement("div");
    card.className = "mail-card";

    const info = document.createElement("div");
    const heading = document.createElement("h3");
    const description = document.createElement("p");

    heading.textContent = template.title;
    description.textContent = "Email template";

    info.append(heading, description);

    const button = document.createElement("button");
    button.textContent = "Preview Email";
    button.addEventListener("click", () => openModal(template.id));

    card.append(info, button);
    list.appendChild(card);
  });
}

document.getElementById("searchMail").addEventListener("input", renderMail);

// OPEN EMAIL MODAL

function openModal(id) {
  activeTemplate = mailTemplates.find(item => item.id === id);

  document.getElementById("emailSubject").value = activeTemplate.subject;
  document.getElementById("emailBody").value = activeTemplate.body;

  document.getElementById("toFields").innerHTML = "";
  document.getElementById("ccFields").innerHTML = "";

  addRecipient("to", activeTemplate.to || "");
  addRecipient("cc");

  document.getElementById("emailModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("emailModal").classList.add("hidden");
}

// ADD MULTIPLE TO AND CC RECIPIENTS

function addRecipient(type, value = "") {
  const container = document.getElementById(
    type === "to" ? "toFields" : "ccFields"
  );

  const row = document.createElement("div");
  row.className = "recipient-row";

  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = "Enter email address";
  input.value = value;
  input.dataset.recipient = type;

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.className = "remove-recipient";

  removeButton.addEventListener("click", () => {
    row.remove();
    if (container.children.length === 0) {
      addRecipient(type);
    }
  });

  row.append(input, removeButton);
  container.appendChild(row);
}

function getRecipients(type) {
  return Array.from(
    document.querySelectorAll(`[data-recipient="${type}"]`)
  )
    .map(input => input.value.trim())
    .filter(Boolean)
    .flatMap(value => value.split(/[;,]/).map(email => email.trim()))
    .filter(Boolean);
}

// EMAIL CONTENT

function emailText() {
  const subject = document.getElementById("emailSubject").value;
  const body = document.getElementById("emailBody").value;
  const to = getRecipients("to");
  const cc = getRecipients("cc");

  return `To: ${to.join(", ")}\nCC: ${cc.join(", ")}\nSubject: ${subject}\n\n${body}`;
}

// COPY EMAIL

async function copyEmail() {
  const text = emailText();

  try {
    await navigator.clipboard.writeText(text);
    alert("Email copied successfully!");
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    alert("Email copied successfully!");
  }
}

// OPEN EMAIL APP

function openEmail() {
  const subject = document.getElementById("emailSubject").value;
  const body = document.getElementById("emailBody").value;

  const to = getRecipients("to");
  const cc = getRecipients("cc");

  if (to.length === 0) {
    alert("Please enter at least one To email address.");
    return;
  }

  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);

  if (cc.length > 0) {
    params.set("cc", cc.join(","));
  }

  const mailtoUrl = `mailto:${to.map(encodeURIComponent).join(",")}?${params.toString()}`;

  window.location.href = mailtoUrl;
}

// SHEET BACKUP

function getBackupKey() {
  return `backup-${document.getElementById("sheetDate").value}`;
}

function getSavedChecks() {
  try {
    return JSON.parse(localStorage.getItem(getBackupKey())) || [];
  } catch {
    return [];
  }
}

function saveChecks(checks) {
  localStorage.setItem(getBackupKey(), JSON.stringify(checks));
}

function renderSheets() {
  const search = document.getElementById("searchSheet").value.toLowerCase();
  const list = document.getElementById("sheetList");
  const completed = getSavedChecks();

  list.innerHTML = "";

  const filtered = sheets.filter(sheet =>
    sheet.name.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-message">No sheets found.</div>`;
  }

  filtered.forEach(sheet => {
    const card = document.createElement("div");
    card.className = "sheet-card";

    const info = document.createElement("div");
    info.className = "sheet-info";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed.includes(sheet.id);

    checkbox.addEventListener("change", () => {
      const updated = getSavedChecks();

      const next = checkbox.checked
        ? [...updated, sheet.id]
        : updated.filter(id => id !== sheet.id);

      saveChecks(next);
      updateBackupCount();
    });

    const name = document.createElement("h3");
    name.textContent = sheet.name;

    info.append(checkbox, name);

    const renameButton = document.createElement("button");
    renameButton.textContent = "Rename";
    renameButton.className = "secondary-btn";

    renameButton.addEventListener("click", () => {
      const newName = prompt("Enter new sheet name:", sheet.name);

      if (newName && newName.trim()) {
        sheet.name = newName.trim();
        renderSheets();
      }
    });

    card.append(info, renameButton);
    list.appendChild(card);
  });

  updateBackupCount();
}

function updateBackupCount() {
  const count = getSavedChecks().length;
  document.getElementById("backupCount").textContent =
    `${count} of ${sheets.length} completed`;
}

function clearBackup() {
  if (confirm("Are you sure you want to clear all backup checks for this date?")) {
    localStorage.removeItem(getBackupKey());
    renderSheets();
  }
}

document.getElementById("searchSheet").addEventListener("input", renderSheets);
document.getElementById("sheetDate").addEventListener("change", renderSheets);
document.getElementById("mailDate").addEventListener("change", renderMail);

// INITIAL DISPLAY

renderMail();
renderSheets();
