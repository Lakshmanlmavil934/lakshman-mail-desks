
"use strict";

const today = new Date();

const pad = n => String(n).padStart(2, "0");

const iso = d =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const pretty = d =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

const plusDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

let mailDate = iso(today);
let backupDate = iso(today);

const templates = [
  ["Project status — weekly", "Weekly project note", "Hi Mira, Here is the latest project status as of {date}. Highlights: Product review is on track. Please let me know if you need any details.", "mira@example.com", "Project status update"],
  ["Design review follow-up", "A few notes after our design review", "Hi Jo, Thank you for the thoughtful review on {date}. I have folded the agreed changes into the latest version. Please share any final feedback.", "jo@example.com", "Design review follow-up"],
  ["Invoice reminder", "Invoice follow-up", "Hello, A quick follow-up on invoice #1842. Could you confirm its expected payment date? Please let me know if you need another copy.", "accounts@example.com", "Reminder: Invoice #1842"],
  ["Meeting confirmation", "Confirmed: our conversation on {date}", "Hi Nina, Confirming our conversation for {date}. I have set aside the full hour and will share the agenda before the meeting.", "nina@example.com", "Meeting confirmation"],
  ["Partner introduction", "An introduction to Ana", "Hi Samir, Sharing this introduction on {date}. I wanted to connect you with Ana, who may be a great person to speak with about the project.", "samir@example.com", "Partner introduction"],
  ["Request for materials", "Materials for our next working session", "Hi Devon, Before we meet on {date}, could you send over the latest research notes and presentation materials? Thanks for your help.", "devon@example.com", "Request for materials"],
  ["Decision log update", "Decision log updated", "Hi team, The decision log has been updated on {date}. Please review the latest notes and let me know if anything needs correction.", "team@example.com", "Decision log update"],
  ["Thank-you note", "Thank you for the conversation", "Hi, Thank you for taking the time to speak with me on {date}. I appreciate your guidance and look forward to staying in touch.", "hello@example.com", "Thank you"],
  ["Task handoff", "Handoff and next steps", "Hi team, I have completed my part of the task as of {date}. The key files and next steps are included below. Please reach out with questions.", "team@example.com", "Task handoff"],
  ["Weekly reminder", "A quick weekly reminder", "Hello, Sharing a quick reminder for {date}. Please update your items before the end of the day so we can keep everything on track.", "team@example.com", "Weekly reminder"]
];

const defaultSheets = [
  "Weekly Planning", "Content Calendar", "Project Brief", "Budget Tracker",
  "Meeting Notes", "Client Intake", "Launch Checklist", "Resource Library",
  "Team Roster", "Quarterly Review",
  ...Array.from({ length: 10 }, (_, i) => `Sheet ${i + 11}`)
];

function safeGet(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value === null ? fallback : value;
  } catch (error) {
    console.warn("Could not read saved workspace data:", error);
    return fallback;
  }
}

let sheetNames = safeGet("lak_sheet_names", defaultSheets.slice());
if (!Array.isArray(sheetNames) || sheetNames.length !== 20) {
  sheetNames = defaultSheets.slice();
}

const esc = value => String(value).replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

function byId(id) {
  return document.getElementById(id);
}

function dateFor(mode, custom) {
  if (mode === "tomorrow") return iso(plusDays(today, 1));
  if (mode === "custom") return custom || iso(today);
  return iso(today);
}


// SWITCH WORKSPACES

function showWorkspace(which) {
  const mail = byId("mailWorkspace");
  const backup = byId("backupWorkspace");
  const mailTab = byId("mailTab");
  const backupTab = byId("backupTab");

  if (!mail || !backup || !mailTab || !backupTab) return;

  mail.classList.toggle("hidden", which !== "mail");
  backup.classList.toggle("hidden", which !== "backup");
  mailTab.classList.toggle("active", which === "mail");
  backupTab.classList.toggle("active", which === "backup");

  if (which === "mail") renderMails();
  if (which === "backup") renderSheets();
}


// MAIL DASHBOARD

function setMailDate(mode) {
  const custom = byId("mailCustom");
  mailDate = dateFor(mode, custom ? custom.value : "");

  ["today", "tomorrow"].forEach(x => {
    const button = byId("mail" + x[0].toUpperCase() + x.slice(1));
    if (button) button.classList.toggle("active", mode === x);
  });

  if (custom) {
    if (mode === "custom") {
      custom.value = mailDate;
      custom.classList.add("active");
    } else {
      custom.classList.remove("active");
    }
  }
  renderMails();
}

function renderMails() {
  const search = byId("mailSearch");
  const cards = byId("mailCards");
  const count = byId("templateCount");
  if (!search || !cards || !count) return;

  const q = search.value.toLowerCase().trim();
  const list = templates
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.join(" ").toLowerCase().includes(q));

  count.textContent = `${list.length} of 10 templates ready`;
  const date = pretty(new Date(mailDate + "T12:00:00"));

  cards.innerHTML = list.map(({ t, i }) => `
    <article class="mailcard">
      <div class="cardtop">
        <span>${String(i + 1).padStart(2, "0")} READY</span>
        <button type="button" class="edit" onclick="editTemplate(${i})" aria-label="Edit ${esc(t[0])}">✎</button>
      </div>
      <h3>${esc(t[0])} — ${date}</h3>
      <div class="desc">${esc(t[1])} — ${date}</div>
      <div class="snippet">${esc(t[2].replaceAll("{date}", date))}</div>
      <div class="cardfoot">
        <span>${esc(t[3])}</span>
        <span>DATE-AWARE</span>
      </div>
      <div class="actions">
        <button type="button" class="btn primary" onclick="previewTemplate(${i})">Preview ↗</button>
        <button type="button" class="btn" onclick="composeTemplate(${i})">➤ Compose</button>
      </div>
    </article>
  `).join("") || '<div class="empty">No matching templates found.</div>';
}


// EMAIL PREVIEW, EDIT AND COMPOSE

function openModal(i) {
  const t = templates[Number(i)];
  if (!t) {
    console.error("Template not found:", i);
    return;
  }

  const title = byId("modalTitle");
  const to = byId("editTo");
  const cc = byId("editCc");
  const subject = byId("editSubject");
  const body = byId("editBody");
  const modal = byId("modalBack");

  if (!title || !to || !subject || !body || !modal) {
    console.error("A required email modal element is missing from index.html.");
    toast("Email window could not open. Check index.html.");
    return;
  }

  const date = pretty(new Date(mailDate + "T12:00:00"));
  title.textContent = t[0];
  to.value = t[3];
  if (cc) cc.value = "";
  subject.value = t[4] + " — " + date;
  body.value = t[2].replaceAll("{date}", date);
  modal.classList.remove("hidden");
}

function previewTemplate(i) { openModal(i); }
function composeTemplate(i) { openModal(i); }
function editTemplate(i) { openModal(i); }

function closeModal() {
  const modal = byId("modalBack");
  if (modal) modal.classList.add("hidden");
}

function emailText() {
  const to = byId("editTo");
  const cc = byId("editCc");
  const subject = byId("editSubject");
  const body = byId("editBody");

  return `To: ${to ? to.value : ""}
Cc: ${cc ? cc.value : ""}
Subject: ${subject ? subject.value : ""}

${body ? body.value : ""}`;
}

async function copyEmail() {
  const text = emailText();

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const temporary = document.createElement("textarea");
      temporary.value = text;
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.appendChild(temporary);
      temporary.select();
      const copied = document.execCommand("copy");
      temporary.remove();
      if (!copied) throw new Error("Copy command failed");
    }

    toast("Message copied to clipboard");
  } catch (error) {
    console.error(error);
    toast("Could not copy. Please select and copy the message.");
  }
}

function openEmail() {
  const to = (byId("editTo")?.value || "")
    .split(",").map(x => x.trim()).filter(Boolean).join(",");

  const cc = (byId("editCc")?.value || "")
    .split(",").map(x => x.trim()).filter(Boolean).join(",");

  const subject = encodeURIComponent(byId("editSubject")?.value || "");
  const body = encodeURIComponent(byId("editBody")?.value || "");
  const ccPart = cc ? `&cc=${encodeURIComponent(cc)}` : "";

  window.location.href =
    `mailto:${to}?subject=${subject}${ccPart}&body=${body}`;
}


// SHEET BACKUP WORKSPACE

function setBackupDate(mode) {
  const custom = byId("backupCustom");
  backupDate = dateFor(mode, custom ? custom.value : "");

  ["today", "tomorrow"].forEach(x => {
    const button = byId("backup" + x[0].toUpperCase() + x.slice(1));
    if (button) button.classList.toggle("active", mode === x);
  });

  if (custom) {
    if (mode === "custom") {
      custom.value = backupDate;
      custom.classList.add("active");
    } else {
      custom.classList.remove("active");
    }
  }

  renderSheets();
}

function checks() {
  const value = safeGet("lak_checks_" + backupDate, []);
  return Array.isArray(value) ? value : [];
}

function renderSheets() {
  const label = byId("backupDateLabel");
  const count = byId("doneCount");
  const rows = byId("sheetRows");

  if (!label || !count || !rows) return;

  const date = new Date(backupDate + "T12:00:00");

  label.textContent = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const done = checks();
  count.textContent = `${done.length} / 20 done`;

  rows.innerHTML = sheetNames.map((name, i) => `
    <div class="sheetrow">
      <div class="sheetname">
        <div class="sheeticon">▤</div>
        <div class="sheettitle">
          <strong>${esc(name)}</strong>
          <button type="button" class="editname" onclick="renameSheet(${i})" aria-label="Rename ${esc(name)}">✎</button>
          <small>Sheet ${String(i + 1).padStart(2, "0")} · ${pretty(date)}</small>
        </div>
      </div>

      <button type="button" class="btn copybtn" onclick="copySheet(${i})">▢ Copy name</button>

      <label class="status">
        <input type="checkbox" ${done.includes(i) ? "checked" : ""} onchange="toggleCheck(${i}, this.checked)">
        <span>${done.includes(i) ? "Completed" : "Not taken"}</span>
      </label>
    </div>
  `).join("");
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temporary = document.createElement("textarea");
  temporary.value = text;
  temporary.style.position = "fixed";
  temporary.style.opacity = "0";
  document.body.appendChild(temporary);
  temporary.select();

  const copied = document.execCommand("copy");
  temporary.remove();

  if (!copied) throw new Error("Copy command failed");
}

async function copySheet(i) {
  const name = `${sheetNames[i]} - ${pretty(new Date(backupDate + "T12:00:00"))}`;

  try {
    await copyText(name);
    toast("Sheet name copied");
  } catch (error) {
    console.error(error);
    toast("Could not copy. Please copy the name manually.");
  }
}

function toggleCheck(i, on) {
  const a = checks().filter(x => x !== i);

  if (on) a.push(i);

  try {
    localStorage.setItem("lak_checks_" + backupDate, JSON.stringify(a));
  } catch (error) {
    console.error("Could not save checkbox status:", error);
  }

  renderSheets();
}

function clearChecks() {
  try {
    localStorage.setItem("lak_checks_" + backupDate, "[]");
  } catch (error) {
    console.error(error);
  }

  renderSheets();
  toast("All checkboxes cleared for this date");
}

function renameSheet(i) {
  const n = prompt("Enter sheet name:", sheetNames[i]);

  if (n && n.trim()) {
    sheetNames[i] = n.trim();

    try {
      localStorage.setItem("lak_sheet_names", JSON.stringify(sheetNames));
    } catch (error) {
      console.error("Could not save sheet names:", error);
    }

    renderSheets();
  }
}


// TOAST MESSAGE

function toast(msg) {
  const el = byId("toast");
  if (!el) return;

  el.textContent = msg;
  el.classList.add("show");

  window.setTimeout(() => el.classList.remove("show"), 1900);
}


// MAKE INLINE HTML BUTTON HANDLERS AVAILABLE

Object.assign(window, {
  showWorkspace,
  setMailDate,
  renderMails,
  previewTemplate,
  composeTemplate,
  editTemplate,
  closeModal,
  copyEmail,
  openEmail,
  setBackupDate,
  clearChecks,
  renameSheet,
  copySheet,
  toggleCheck
});


// INITIALIZE AFTER THE HTML HAS LOADED

function initializeWorkspace() {
  renderMails();
  renderSheets();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeWorkspace);
} else {
  initializeWorkspace();
}
