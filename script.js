
/* =========================================
   LAKSHMAN PERSONAL WORKSPACE
   MAIL DASHBOARD + SHEETS BACKUP
========================================= */

const TEMPLATE_KEY = "lakshman_mail_templates_v1";
const BACKUP_KEY = "lakshman_backup_status_v1";

const defaultTemplates = [
  {
    title: "Project status — weekly",
    subject: "Weekly project note",
    to: ["project@northstar.studio"],
    cc: [],
    body: "Hi Mira,\n\nHere is the latest project status as of {date}.\n\nHighlights:\n• Product review is on track.\n• Development work is progressing.\n• Next steps are being reviewed.\n\nThanks,\nLakshman"
  },
  {
    title: "Design review follow-up",
    subject: "A few notes after our design review",
    to: ["jo@fieldnotes.co"],
    cc: [],
    body: "Hi Jo,\n\nThank you for the thoughtful review on {date}.\n\nI have folded the agreed changes into the latest design. Please review them and let me know if anything needs attention.\n\nBest regards,\nLakshman"
  },
  {
    title: "Invoice reminder",
    subject: "Invoice follow-up",
    to: ["accounts@example.com"],
    cc: [],
    body: "Hello,\n\nA quick follow-up on invoice #1842.\n\nCould you confirm its expected payment date?\n\nPlease let me know if you need another copy.\n\nThanks,\nLakshman"
  },
  {
    title: "Meeting confirmation",
    subject: "Confirmed: our conversation",
    to: ["nina@example.com"],
    cc: [],
    body: "Hi Nina,\n\nConfirming our conversation on {date}.\n\nI have set aside the full hour and will share the necessary materials beforehand.\n\nLooking forward to speaking with you.\n\nRegards,\nLakshman"
  },
  {
    title: "Partner introduction",
    subject: "An introduction to Ana",
    to: ["sam@example.com"],
    cc: ["ana@example.com"],
    body: "Hi Sam,\n\nSharing this introduction on {date}.\n\nI wanted to connect you with Ana, who may be a great person to work with on this project.\n\nI'll let you both take it from here.\n\nBest,\nLakshman"
  },
  {
    title: "Request for materials",
    subject: "Materials for our next working session",
    to: ["devon@example.com"],
    cc: [],
    body: "Hi Devon,\n\nBefore we meet on {date}, could you send over the latest research notes and the supporting materials?\n\nThis will help us prepare for the discussion.\n\nThanks,\nLakshman"
  },
  {
    title: "Decision log update",
    subject: "Decision log updated",
    to: ["project@northstar.studio"],
    cc: ["team@example.com"],
    body: "Hello team,\n\nThe decision log has been updated for {date}.\n\nPlease review the latest entries and reply if anything needs correcting.\n\nThanks,\nLakshman"
  },
  {
    title: "Thank-you note",
    subject: "Thank you for the conversation",
    to: ["contact@example.com"],
    cc: [],
    body: "Hello,\n\nThank you for taking the time to speak with me on {date}.\n\nI appreciated the conversation and the ideas we discussed. I look forward to staying in touch.\n\nBest regards,\nLakshman"
  },
  {
    title: "Task handover",
    subject: "Task handover and next steps",
    to: ["team@example.com"],
    cc: [],
    body: "Hi team,\n\nHere is the task handover for {date}.\n\nPlease check the latest files, review the pending items and update the task status when complete.\n\nLet me know if you need any clarification.\n\nThanks,\nLakshman"
  },
  {
    title: "Weekly appreciation",
    subject: "Thank you for this week's work",
    to: ["team@example.com"],
    cc: [],
    body: "Hello team,\n\nThank you for all your hard work this week.\n\nYour effort and support are appreciated. Let's keep the momentum going into next week.\n\nBest wishes,\nLakshman"
  }
];

const defaultSheets = [
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
];

let templates = loadTemplates();
let backups = loadBackups();
let editingIndex = -1;
let mailDate = new Date();
let backupDate = new Date();

/* =========================================
   STORAGE
========================================= */

function loadTemplates() {
  try {
    const saved = localStorage.getItem(TEMPLATE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Could not load templates:", error);
  }

  return JSON.parse(JSON.stringify(defaultTemplates));
}

function loadBackups() {
  try {
    const saved = localStorage.getItem(BACKUP_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.warn("Could not load backup status:", error);
    return {};
  }
}

function saveTemplates() {
  try {
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
  } catch (error) {
    alert("Unable to save templates in this browser.");
  }
}

function saveBackups() {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
  } catch (error) {
    alert("Unable to save backup status.");
  }
}

/* =========================================
   DATE HELPERS
========================================= */

function dateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function replaceDate(text, date) {
  return String(text || "").replaceAll("{date}", formatDate(date));
}

/* =========================================
   WORKSPACE SWITCHER
========================================= */

function showWorkspace(workspace) {
  const mail = workspace === "mail";

  document.getElementById("mailWorkspace").classList.toggle("hidden", !mail);
  document.getElementById("backupWorkspace").classList.toggle("hidden", mail);

  document.getElementById("mailTab").classList.toggle("active", mail);
  document.getElementById("backupTab").classList.toggle("active", !mail);

  if (!mail) {
    renderBackups();
  }
}

/* =========================================
   MAIL DATE
========================================= */

function setMailDate(option) {
  mailDate = option === "tomorrow"
    ? addDays(new Date(), 1)
    : new Date();

  document.getElementById("mailDate").value = dateISO(mailDate);
  renderTemplates();
}

document.getElementById("mailDate").addEventListener("change", function () {
  if (!this.value) return;

  const parts = this.value.split("-").map(Number);
  mailDate = new Date(parts[0], parts[1] - 1, parts[2]);

  renderTemplates();
});

/* =========================================
   TEMPLATE LIBRARY
========================================= */

function renderTemplates() {
  const grid = document.getElementById("templateGrid");
  const search = document.getElementById("searchTemplates").value
    .trim()
    .toLowerCase();

  const filtered = templates.filter(template => {
    const text = [
      template.title,
      template.subject,
      ...(template.to || []),
      ...(template.cc || []),
      template.body
    ].join(" ").toLowerCase();

    return text.includes(search);
  });

  document.getElementById("templateCount").textContent =
    `${filtered.length} of ${templates.length} templates ready`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="template-card">
        <h3>No templates found</h3>
        <p>Try another search.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(template => {
    const index = templates.indexOf(template);

    const body = replaceDate(template.body, mailDate)
      .replace(/\s+/g, " ")
      .slice(0, 155);

    const recipient = (template.to || []).join(", ") || "No recipient";
    const ccCount = (template.cc || []).length;

    return `
      <article class="template-card">

        <div class="card-top">
          <span class="ready">READY</span>
          <button class="edit-icon"
            onclick="editTemplate(${index})"
            title="Edit template">✎</button>
        </div>

        <h3>${escapeHTML(template.title)}</h3>

        <div class="template-subject">
          ${escapeHTML(template.subject)}
        </div>

        <div class="template-preview">
          ${escapeHTML(body)}
        </div>

        <div class="card-meta">
          <span title="${escapeHTML(recipient)}">
            ${escapeHTML(shortText(recipient, 28))}
          </span>
          <span>${ccCount} CC · ${formatDate(mailDate)}</span>
        </div>

        <div class="card-actions">
          <button class="primary-button"
            onclick="editTemplate(${index})">
            Preview ↗
          </button>

          <button class="light-button"
            onclick="composeTemplate(${index})">
            ✉ Compose
          </button>
        </div>

      </article>
    `;
  }).join("");
}

function shortText(text, max) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

/* =========================================
   EDIT TEMPLATE
========================================= */

function editTemplate(index) {
  if (!templates[index]) return;

  editingIndex = index;

  const template = templates[index];

  document.getElementById("editTitle").value = template.title || "";
  document.getElementById("editSubject").value = template.subject || "";
  document.getElementById("editMessage").value =
    replaceDate(template.body, mailDate);

  document.getElementById("toFields").innerHTML = "";
  document.getElementById("ccFields").innerHTML = "";

  (template.to || []).forEach(email => addRecipient("to", email));
  (template.cc || []).forEach(email => addRecipient("cc", email));

  if (!template.to || template.to.length === 0) {
    addRecipient("to");
  }

  openModal();
}

function openModal() {
  document.getElementById("editModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("editModal").classList.add("hidden");
  document.body.style.overflow = "";
  editingIndex = -1;
}

/* =========================================
   MULTIPLE TO AND CC FIELDS
========================================= */

function addRecipient(type, value = "") {
  const container = document.getElementById(
    type === "to" ? "toFields" : "ccFields"
  );

  const row = document.createElement("div");
  row.className = "recipient-row";

  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = "name@example.com";
  input.value = value;
  input.className = type + "-email";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-recipient";
  remove.textContent = "Remove";

  remove.addEventListener("click", () => {
    row.remove();
  });

  row.appendChild(input);
  row.appendChild(remove);
  container.appendChild(row);
}

function getRecipientValues(type) {
  return Array.from(
    document.querySelectorAll("." + type + "-email")
  )
    .map(input => input.value.trim())
    .filter(Boolean);
}

function validateEmails(emails) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emails.every(email => pattern.test(email));
}

/* =========================================
   SAVE TEMPLATE
========================================= */

function saveTemplate() {
  if (editingIndex < 0 || !templates[editingIndex]) return;

  const to = getRecipientValues("to");
  const cc = getRecipientValues("cc");

  if (!validateEmails(to) || !validateEmails(cc)) {
    alert("Please enter valid email addresses.");
    return;
  }

  templates[editingIndex] = {
    ...templates[editingIndex],
    title: document.getElementById("editTitle").value.trim(),
    subject: document.getElementById("editSubject").value.trim(),
    to,
    cc,
    body: document.getElementById("editMessage").value
  };

  saveTemplates();
  closeModal();
  renderTemplates();

  alert("Template saved successfully!");
}

/* =========================================
   GMAIL COMPOSE
========================================= */

// Opens Gmail Compose in a NEW TAB.
// It does not open the edit modal.
// It does not automatically send an email.

function openGmailCompose(template) {
  const to = template.to || [];
  const cc = template.cc || [];

  if (!validateEmails(to) || !validateEmails(cc)) {
    alert("Please check the recipient email addresses.");
    return;
  }

  const params = new URLSearchParams();

  params.set("view", "cm");
  params.set("fs", "1");

  if (to.length) {
    params.set("to", to.join(","));
  }

  if (cc.length) {
    params.set("cc", cc.join(","));
  }

  params.set("su", template.subject || "");
  params.set(
    "body",
    replaceDate(template.body || "", mailDate)
  );

  const gmailURL =
    "https://mail.google.com/mail/?" + params.toString();

  const newTab = window.open(gmailURL, "_blank");

  if (!newTab) {
    alert("Please allow pop-ups for this website to open Gmail.");
  }
}

// Compose directly from the dashboard card.

function composeTemplate(index) {
  const template = templates[index];

  if (!template) return;

  openGmailCompose(template);
}

// Compose from inside the editor.

function composeFromModal() {
  const to = getRecipientValues("to");
  const cc = getRecipientValues("cc");

  if (!validateEmails(to) || !validateEmails(cc)) {
    alert("Please check the email addresses.");
    return;
  }

  const template = {
    title: document.getElementById("editTitle").value,
    subject: document.getElementById("editSubject").value,
    to,
    cc,
    body: document.getElementById("editMessage").value
  };

  openGmailCompose(template);
}

/* =========================================
   BACKUP WORKSPACE
========================================= */

function getBackupDateKey() {
  return dateISO(backupDate);
}

function setBackupDate(option) {
  backupDate = option === "tomorrow"
    ? addDays(new Date(), 1)
    : new Date();

  document.getElementById("backupDate").value =
    dateISO(backupDate);

  renderBackups();
}

document.getElementById("backupDate").addEventListener("change", function () {
  if (!this.value) return;

  const parts = this.value.split("-").map(Number);

  backupDate = new Date(
    parts[0],
    parts[1] - 1,
    parts[2]
  );

  renderBackups();
});

function renderBackups() {
  const list = document.getElementById("backupList");
  const dateKey = getBackupDateKey();

  if (!backups[dateKey]) {
    backups[dateKey] = {};
  }

  document.getElementById("backupDateLabel").textContent =
    formatDate(backupDate);

  const doneCount = defaultSheets.filter(
    (_, index) => backups[dateKey][index] === true
  ).length;

  document.getElementById("backupProgress").textContent =
    `${doneCount} / ${defaultSheets.length} done`;

  list.innerHTML = defaultSheets.map((name, index) => {
    const done = backups[dateKey][index] === true;

    const datedName = `${name} - ${formatDate(backupDate)}`;

    return `
      <tr class="${done ? "done-row" : ""}">
        <td>
          <div class="sheet-name">${escapeHTML(name)}</div>
          <div class="sheet-date">${formatDate(backupDate)}</div>
          <div class="sheet-number">
            Sheet ${String(index + 1).padStart(2, "0")}
          </div>
        </td>

        <td>
          <button
            class="copy-button"
            onclick="copySheetName(${index})">
            ▢ Copy name
          </button>
        </td>

        <td>
          <label>
            <input
              class="status-check"
              type="checkbox"
              ${done ? "checked" : ""}
              onchange="toggleBackup(${index}, this.checked)">
            ${done ? "Done" : "Not taken"}
          </label>
        </td>
      </tr>
    `;
  }).join("");

  saveBackups();
}

/* =========================================
   COPY SHEET NAME
========================================= */

async function copySheetName(index) {
  const name =
    `${defaultSheets[index]} - ${formatDate(backupDate)}`;

  try {
    await navigator.clipboard.writeText(name);
    alert("Copied: " + name);
  } catch (error) {
    // Fallback for browsers without Clipboard API access.
    const textarea = document.createElement("textarea");

    textarea.value = name;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand("copy");
    textarea.remove();

    if (success) {
      alert("Copied: " + name);
    } else {
      alert("Copy failed. Please copy this name manually:\n" + name);
    }
  }
}

/* =========================================
   BACKUP CHECKBOXES
========================================= */

function toggleBackup(index, checked) {
  const dateKey = getBackupDateKey();

  if (!backups[dateKey]) {
    backups[dateKey] = {};
  }

  backups[dateKey][index] = checked;

  saveBackups();
  renderBackups();
}

function uncheckAll() {
  const dateKey = getBackupDateKey();

  if (!confirm("Uncheck all 20 sheets for this date?")) {
    return;
  }

  backups[dateKey] = {};

  saveBackups();
  renderBackups();
}

/* =========================================
   INITIALIZE WEBSITE
========================================= */

function initializeWebsite() {
  document.getElementById("mailDate").value =
    dateISO(mailDate);

  document.getElementById("backupDate").value =
    dateISO(backupDate);

  renderTemplates();
  renderBackups();

  showWorkspace("mail");
}

// Close modal if user clicks outside the modal card.

document.getElementById("editModal").addEventListener("click", function (event) {
  if (event.target === this) {
    closeModal();
  }
});

// Escape key closes the editor.

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

initializeWebsite();
