
"use strict";

const TEMPLATE_KEY = "lakshman_templates_v1";
const BACKUP_KEY = "lakshman_backups_v1";
const SHEET_KEY = "lakshman_sheet_names_v1";

const defaultTemplates = [
  {
    title: "Project status — weekly",
    subject: "Weekly project note — {{date}}",
    to: ["project@northstar.studio"],
    cc: [],
    body: "Hi Miraj,\n\nHere is the latest project status as of {{date}}.\n\nHighlights:\n• Product review is on track.\n• Development progress is moving forward.\n\nThanks,\nLakshman"
  },
  {
    title: "Design review follow-up",
    subject: "A few notes after our design review — {{date}}",
    to: ["jo@fieldnotes.co"],
    cc: [],
    body: "Hi Jo,\n\nThank you for the thoughtful review on {{date}}. I have folded the agreed changes into the latest version.\n\nPlease let me know if anything else needs updating.\n\nThanks,\nLakshman"
  },
  {
    title: "Invoice reminder",
    subject: "Invoice follow-up — {{date}}",
    to: ["accounts@example.com"],
    cc: [],
    body: "Hello,\n\nA quick follow-up on invoice #1842. Could you confirm its expected payment date?\n\nThank you,\nLakshman"
  },
  {
    title: "Meeting confirmation",
    subject: "Confirmed: our conversation on {{date}}",
    to: ["nina@example.com"],
    cc: [],
    body: "Hi Nina,\n\nConfirming our conversation for {{date}}. I have set aside the full hour and will share the agenda shortly.\n\nBest,\nLakshman"
  },
  {
    title: "Partner introduction",
    subject: "An introduction to Ana — {{date}}",
    to: ["samir@example.com"],
    cc: [],
    body: "Hi Samir,\n\nSharing this introduction on {{date}}. I wanted to connect you with Ana, who may be a great person to collaborate with.\n\nBest,\nLakshman"
  },
  {
    title: "Request for materials",
    subject: "Materials for our next working session — {{date}}",
    to: ["devon@example.com"],
    cc: [],
    body: "Hi Devon,\n\nBefore we meet on {{date}}, could you send over the latest research notes and the presentation materials?\n\nThanks,\nLakshman"
  },
  {
    title: "Decision log update",
    subject: "Decision log updated — {{date}}",
    to: ["project@northstar.studio"],
    cc: [],
    body: "Hello team,\n\nThe decision log has been updated for {{date}}.\n\nPlease review the latest entries and reply if anything needs correcting.\n\nThanks,\nLakshman"
  },
  {
    title: "Thank-you note",
    subject: "Thank you for the conversation — {{date}}",
    to: ["contact@example.com"],
    cc: [],
    body: "Hello,\n\nThank you for taking the time to speak with me on {{date}}. I appreciated the conversation and look forward to staying in touch.\n\nBest regards,\nLakshman"
  },
  {
    title: "Project handover",
    subject: "Project handover documents — {{date}}",
    to: ["team@example.com"],
    cc: [],
    body: "Hi team,\n\nPlease find the project handover details for {{date}}.\n\nLet me know if you need any additional information.\n\nRegards,\nLakshman"
  },
  {
    title: "Follow-up request",
    subject: "Following up on our discussion — {{date}}",
    to: ["client@example.com"],
    cc: [],
    body: "Hello,\n\nI am following up on our recent discussion on {{date}}. Please share an update when convenient.\n\nThank you,\nLakshman"
  }
];

const defaultSheetNames = [
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJSON(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : clone(fallback);
  } catch (error) {
    return clone(fallback);
  }
}

let templates = readJSON(TEMPLATE_KEY, defaultTemplates);
let backups = readJSON(BACKUP_KEY, {});

let savedNames = readJSON(SHEET_KEY, defaultSheetNames);

let sheetNames =
  Array.isArray(savedNames) && savedNames.length === 20
    ? savedNames.map((name, index) =>
        typeof name === "string" && name.trim()
          ? name
          : defaultSheetNames[index]
      )
    : clone(defaultSheetNames);

if (!Array.isArray(templates) || !templates.length) {
  templates = clone(defaultTemplates);
}

if (!backups || typeof backups !== "object" || Array.isArray(backups)) {
  backups = {};
}

let editingIndex = -1;
let mailDate = new Date();
let backupDate = new Date();

function saveTemplates() {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
}

function saveBackups() {
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
}

function saveSheetNames() {
  localStorage.setItem(SHEET_KEY, JSON.stringify(sheetNames));
}

function iso(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

/* MM/DD/YYYY FORMAT */

function pretty(date) {
  return [
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    date.getFullYear()
  ].join("/");
}

function plusDays(date, number) {
  const result = new Date(date);
  result.setDate(result.getDate() + number);
  return result;
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function withDate(text, date) {
  return String(text || "").replace(
    /\{\{date\}\}|\{date\}/gi,
    pretty(date)
  );
}

function short(text, length) {
  return text.length > length
    ? text.slice(0, length) + "…"
    : text;
}

/* WORKSPACE NAVIGATION */

function showWorkspace(which) {
  const mail = which === "mail";
  const drafts = which === "drafts";
  const backup = which === "backup";

  document.getElementById("mailWorkspace")
    .classList.toggle("hidden", !mail);

  document.getElementById("draftsWorkspace")
    .classList.toggle("hidden", !drafts);

  document.getElementById("backupWorkspace")
    .classList.toggle("hidden", !backup);

  ["mailNav", "draftNav", "backupNav"].forEach(id => {
    document.getElementById(id).classList.remove("active");
  });

  document.getElementById(
    mail ? "mailNav" : drafts ? "draftNav" : "backupNav"
  ).classList.add("active");

  if (backup) renderBackups();
}

/* MAIL DATE */

function setMailDate(which) {
  mailDate = which === "tomorrow"
    ? plusDays(new Date(), 1)
    : new Date();

  document.getElementById("mailDate").value = iso(mailDate);

  updateMailDateLabels();
  renderTemplates();
}

function updateMailDateLabels() {
  const today = new Date();
  const tomorrow = plusDays(today, 1);

  document.getElementById("todayMailLabel").textContent =
    pretty(today);

  document.getElementById("tomorrowMailLabel").textContent =
    pretty(tomorrow);

  document.getElementById("mailDateText").textContent =
    pretty(mailDate);

  document.querySelectorAll("#mailWorkspace .date-chip")
    .forEach((button, index) => {
      const selected =
        (index === 0 && iso(mailDate) === iso(today)) ||
        (index === 1 && iso(mailDate) === iso(tomorrow));

      button.classList.toggle("selected", selected);
    });
}

document.getElementById("mailDate").addEventListener("change", event => {
  if (!event.target.value) return;

  const [year, month, day] = event.target.value.split("-").map(Number);

  mailDate = new Date(year, month - 1, day);

  updateMailDateLabels();
  renderTemplates();
});

/* TEMPLATE DISPLAY */

function renderTemplates() {
  const grid = document.getElementById("templateGrid");

  const query = document.getElementById("searchTemplates")
    .value.trim().toLowerCase();

  const filtered = templates
    .map((template, index) => ({ template, index }))
    .filter(({ template }) => {
      const searchable = [
        template.title,
        template.subject,
        (template.to || []).join(" "),
        (template.cc || []).join(" "),
        template.body
      ].join(" ").toLowerCase();

      return searchable.includes(query);
    });

  document.getElementById("templateCount").textContent =
    `${filtered.length} of ${templates.length} templates ready`;

  document.getElementById("navTemplateCount").textContent =
    templates.length;

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="template-card">
        <h3>No templates found</h3>
        <p>Try another search.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(({ template, index }) => `
    <article class="template-card">

      <div class="card-top">
        <span class="ready">
          ${String(index + 1).padStart(2, "0")} &nbsp; READY
        </span>

        <button class="edit-icon"
          onclick="editTemplate(${index})">
          ✎
        </button>
      </div>

      <h3>${safe(withDate(template.title, mailDate))}</h3>

      <div class="template-subject">
        ${safe(withDate(template.subject, mailDate))}
      </div>

      <div class="template-preview">
        ${safe(withDate(template.body, mailDate)
          .replace(/\s+/g, " ")
          .slice(0, 145))}
      </div>

      <div class="card-meta">
        <span>
          ${safe(short((template.to || []).join(", ") || "No recipient", 28))}
        </span>

        <span>
          ${(template.cc || []).length
            ? template.cc.length + " CC"
            : "No CC"}
          &nbsp; Date-aware
        </span>
      </div>

      <div class="card-actions">
        <button class="primary-button"
          onclick="editTemplate(${index})">
          Preview ↗
        </button>

        <button class="light-button"
          onclick="composeTemplate(${index})">
          ➤ Compose
        </button>
      </div>

    </article>
  `).join("");
}

/* EDIT TEMPLATE */

function editTemplate(index) {
  const template = templates[index];

  if (!template) return;

  editingIndex = index;

  document.getElementById("editTitle").value =
    template.title || "";

  document.getElementById("editSubject").value =
    template.subject || "";

  document.getElementById("editMessage").value =
    template.body || "";

  document.getElementById("toFields").innerHTML = "";
  document.getElementById("ccFields").innerHTML = "";

  (template.to || []).forEach(value => addRecipient("to", value));
  (template.cc || []).forEach(value => addRecipient("cc", value));

  if (!(template.to || []).length) {
    addRecipient("to");
  }

  document.getElementById("editModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("editModal").classList.add("hidden");
  document.body.style.overflow = "";
  editingIndex = -1;
}

/* ADD MULTIPLE TO AND CC */

function addRecipient(type, value = "") {
  const parent = document.getElementById(
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
  remove.onclick = () => row.remove();

  row.append(input, remove);
  parent.append(row);
}

function values(type) {
  return [...document.querySelectorAll("." + type + "-email")]
    .map(input => input.value.trim())
    .filter(Boolean);
}

function validEmails(list) {
  return list.every(email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

/* SAVE TEMPLATE */

function saveTemplate() {
  if (editingIndex < 0) return;

  const to = values("to");
  const cc = values("cc");

  if (!validEmails(to) || !validEmails(cc)) {
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

  toast("Template saved successfully");
}

/* GMAIL COMPOSE */

function composeTemplate(index) {
  if (!templates[index]) return;
  openGmail(templates[index]);
}

function composeFromModal() {
  const to = values("to");
  const cc = values("cc");

  if (!validEmails(to) || !validEmails(cc)) {
    alert("Please check the email addresses.");
    return;
  }

  openGmail({
    title: document.getElementById("editTitle").value,
    subject: document.getElementById("editSubject").value,
    to,
    cc,
    body: document.getElementById("editMessage").value
  });
}

function openGmail(template) {
  const params = new URLSearchParams();

  params.set("view", "cm");
  params.set("fs", "1");

  params.set("su", withDate(template.subject, mailDate));
  params.set("body", withDate(template.body, mailDate));

  if ((template.to || []).length) {
    params.set("to", template.to.join(","));
  }

  if ((template.cc || []).length) {
    params.set("cc", template.cc.join(","));
  }

  const gmailURL =
    "https://mail.google.com/mail/?" + params.toString();

  const newTab = window.open(gmailURL, "_blank");

  if (!newTab) {
    alert(
      "Please allow pop-ups for this website so Gmail can open in a new tab."
    );
  }
}

/* BACKUP DATE */

function setBackupDate(which) {
  backupDate = which === "tomorrow"
    ? plusDays(new Date(), 1)
    : new Date();

  document.getElementById("backupDate").value = iso(backupDate);

  renderBackups();
}

document.getElementById("backupDate").addEventListener("change", event => {
  if (!event.target.value) return;

  const [year, month, day] = event.target.value.split("-").map(Number);

  backupDate = new Date(year, month - 1, day);

  renderBackups();
});

/* EDIT SHEET NAMES */

function editSheetName(index) {
  if (index < 0 || index >= sheetNames.length) return;

  const newName = prompt(
    "Enter new sheet name:",
    sheetNames[index]
  );

  if (newName === null) return;

  const trimmedName = newName.trim();

  if (!trimmedName) {
    alert("Sheet name cannot be empty.");
    return;
  }

  sheetNames[index] = trimmedName;

  saveSheetNames();
  renderBackups();

  toast("Sheet name updated successfully");
}

/* RESET SHEET NAMES */

function resetSheetNames() {
  if (!confirm("Restore all 20 default sheet names?")) return;

  sheetNames = clone(defaultSheetNames);

  saveSheetNames();
  renderBackups();

  toast("Default sheet names restored");
}

/* BACKUP CHECKLIST */

function renderBackups() {
  const key = iso(backupDate);

  if (!backups[key]) {
    backups[key] = {};
  }

  document.getElementById("backupDateLabel").textContent =
    pretty(backupDate);

  const done = sheetNames.filter((name, index) =>
    backups[key][index] === true
  ).length;

  document.getElementById("backupProgress").textContent =
    `${done} / 20 done`;

  document.getElementById("backupList").innerHTML =
    sheetNames.map((name, index) => `
      <tr class="${backups[key][index] ? "done-row" : ""}">

        <td>
          <span class="sheet-name">${safe(name)}</span>

          <button
            type="button"
            class="edit-icon"
            onclick="editSheetName(${index})"
            title="Edit sheet name"
            aria-label="Edit ${safe(name)}">
            ✎
          </button>

          <span class="sheet-date">
            - ${pretty(backupDate)}
          </span>

          <div class="sheet-number">
            Sheet ${String(index + 1).padStart(2, "0")}
          </div>
        </td>

        <td>
          <button class="copy-button"
            onclick="copySheetName(${index})">
            ▢ Copy name
          </button>
        </td>

        <td>
          <label>
            <input
              class="status-check"
              type="checkbox"
              ${backups[key][index] ? "checked" : ""}
              onchange="toggleBackup(${index}, this.checked)"
            >

            ${backups[key][index] ? "Done" : "Not taken"}
          </label>
        </td>

      </tr>
    `).join("");

  saveBackups();
}

/* COPY SHEET NAME */

async function copySheetName(index) {
  const text =
    `${sheetNames[index]} - ${pretty(backupDate)}`;

  try {
    await navigator.clipboard.writeText(text);
    toast("Copied: " + text);

  } catch (error) {
    const element = document.createElement("textarea");

    element.value = text;
    document.body.append(element);
    element.select();

    const success = document.execCommand("copy");

    element.remove();

    if (success) {
      toast("Copied: " + text);
    } else {
      prompt("Copy this sheet name:", text);
    }
  }
}

/* NOTIFICATION */

function toast(message) {
  const old = document.querySelector(".toast");

  if (old) old.remove();

  const element = document.createElement("div");

  element.className = "toast";
  element.textContent = message;

  Object.assign(element.style, {
    position: "fixed",
    bottom: "22px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#164f59",
    color: "white",
    padding: "11px 16px",
    borderRadius: "10px",
    zIndex: "50",
    fontSize: "12px",
    boxShadow: "0 5px 20px #0002"
  });

  document.body.append(element);

  setTimeout(() => element.remove(), 2200);
}

/* CHECK AND UNCHECK BACKUPS */

function toggleBackup(index, checked) {
  const key = iso(backupDate);

  if (!backups[key]) {
    backups[key] = {};
  }

  backups[key][index] = checked;

  saveBackups();
  renderBackups();
}

function uncheckAll() {
  if (!confirm("Uncheck all 20 sheets for this date?")) return;

  backups[iso(backupDate)] = {};

  saveBackups();
  renderBackups();
}

/* CLOSE MODAL */

document.getElementById("editModal").addEventListener("click", event => {
  if (event.target.id === "editModal") {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

/* START WEBSITE */

function init() {
  document.getElementById("mailDate").value = iso(mailDate);

  document.getElementById("backupDate").value = iso(backupDate);

  updateMailDateLabels();
  renderTemplates();
  renderBackups();
  showWorkspace("mail");
}

init();
