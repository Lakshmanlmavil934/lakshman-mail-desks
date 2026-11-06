
const today = new Date();

const pad = n => String(n).padStart(2, "0");

const iso = d =>
  `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

const pretty = d =>
  `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;

const plusDays = (d, n) => {
  let x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

let mailDate = iso(today);
let backupDate = iso(today);

const templates = [
  [
    "Project status — weekly",
    "Weekly project note",
    "Hi Mira, Here is the latest project status as of {date}. Highlights: Product review is on track. Please let me know if you need any details.",
    "mira@example.com",
    "Project status update"
  ],
  [
    "Design review follow-up",
    "A few notes after our design review",
    "Hi Jo, Thank you for the thoughtful review on {date}. I have folded the agreed changes into the latest version. Please share any final feedback.",
    "jo@example.com",
    "Design review follow-up"
  ],
  [
    "Invoice reminder",
    "Invoice follow-up",
    "Hello, A quick follow-up on invoice #1842. Could you confirm its expected payment date? Please let me know if you need another copy.",
    "accounts@example.com",
    "Reminder: Invoice #1842"
  ],
  [
    "Meeting confirmation",
    "Confirmed: our conversation on {date}",
    "Hi Nina, Confirming our conversation for {date}. I have set aside the full hour and will share the agenda before the meeting.",
    "nina@example.com",
    "Meeting confirmation"
  ],
  [
    "Partner introduction",
    "An introduction to Ana",
    "Hi Samir, Sharing this introduction on {date}. I wanted to connect you with Ana, who may be a great person to speak with about the project.",
    "samir@example.com",
    "Partner introduction"
  ],
  [
    "Request for materials",
    "Materials for our next working session",
    "Hi Devon, Before we meet on {date}, could you send over the latest research notes and presentation materials? Thanks for your help.",
    "devon@example.com",
    "Request for materials"
  ],
  [
    "Decision log update",
    "Decision log updated",
    "Hi team, The decision log has been updated on {date}. Please review the latest notes and let me know if anything needs correction.",
    "team@example.com",
    "Decision log update"
  ],
  [
    "Thank-you note",
    "Thank you for the conversation",
    "Hi, Thank you for taking the time to speak with me on {date}. I appreciate your guidance and look forward to staying in touch.",
    "hello@example.com",
    "Thank you"
  ],
  [
    "Task handoff",
    "Handoff and next steps",
    "Hi team, I have completed my part of the task as of {date}. The key files and next steps are included below. Please reach out with questions.",
    "team@example.com",
    "Task handoff"
  ],
  [
    "Weekly reminder",
    "A quick weekly reminder",
    "Hello, Sharing a quick reminder for {date}. Please update your items before the end of the day so we can keep everything on track.",
    "team@example.com",
    "Weekly reminder"
  ]
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
  ...Array.from({length: 10}, (_, i) => `Sheet ${i+11}`)
];

let sheetNames;

try {
  sheetNames = JSON.parse(
    localStorage.getItem("lak_sheet_names") || "null"
  ) || defaultSheets.slice();
} catch {
  sheetNames = defaultSheets.slice();
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

function dateFor(mode, custom) {
  if (mode === "tomorrow") {
    return iso(plusDays(today, 1));
  }

  if (mode === "custom") {
    return custom || iso(today);
  }

  return iso(today);
}


// SWITCH WORKSPACES

function showWorkspace(which) {
  document.getElementById("mailWorkspace")
    .classList.toggle("hidden", which !== "mail");

  document.getElementById("backupWorkspace")
    .classList.toggle("hidden", which !== "backup");

  document.getElementById("mailTab")
    .classList.toggle("active", which === "mail");

  document.getElementById("backupTab")
    .classList.toggle("active", which === "backup");
}


// MAIL DASHBOARD

function setMailDate(mode) {
  mailDate = dateFor(
    mode,
    document.getElementById("mailCustom").value
  );

  ["today", "tomorrow"].forEach(x => {
    document.getElementById(
      "mail" + x[0].toUpperCase() + x.slice(1)
    ).classList.toggle("active", mode === x);
  });

  if (mode === "custom") {
    document.getElementById("mailCustom").value = mailDate;
    document.getElementById("mailCustom").classList.add("active");
  } else {
    document.getElementById("mailCustom").classList.remove("active");
  }

  renderMails();
}


function renderMails() {
  const q = document.getElementById("mailSearch")
    .value.toLowerCase();

  const list = templates
    .map((t, i) => ({t, i}))
    .filter(({t}) => t.join(" ").toLowerCase().includes(q));

  document.getElementById("templateCount").textContent =
    `${list.length} of 10 templates ready`;

  const date = pretty(new Date(mailDate + "T12:00:00"));

  document.getElementById("mailCards").innerHTML =
    list.map(({t, i}) => `
      <article class="mailcard">

        <div class="cardtop">
          <span>${String(i+1).padStart(2,"0")} READY</span>
          <button class="edit"
            onclick="editTemplate(${i})">✎</button>
        </div>

        <h3>${esc(t[0])} — ${date}</h3>

        <div class="desc">
          ${esc(t[1])} — ${date}
        </div>

        <div class="snippet">
          ${esc(t[2].replaceAll("{date}", date))}
        </div>

        <div class="cardfoot">
          <span>${esc(t[3])}</span>
          <span>DATE-AWARE</span>
        </div>

        <div class="actions">
          <button class="btn primary"
            onclick="previewTemplate(${i})">
            Preview ↗
          </button>

          <button class="btn"
            onclick="composeTemplate(${i})">
            ➤ Compose
          </button>
        </div>

      </article>
    `).join("") ||
    '<div class="empty">No matching templates found.</div>';
}


// EMAIL PREVIEW

function openModal(i) {
  const t = templates[i];
  const date = pretty(new Date(mailDate + "T12:00:00"));

  document.getElementById("modalTitle").textContent = t[0];
  document.getElementById("editTo").value = t[3];
  document.getElementById("editSubject").value =
    t[4] + " — " + date;

  document.getElementById("editBody").value =
    t[2].replaceAll("{date}", date);

  document.getElementById("modalBack")
    .classList.remove("hidden");
}

function previewTemplate(i) {
  openModal(i);
}

function composeTemplate(i) {
  openModal(i);
}

function editTemplate(i) {
  openModal(i);
}

function closeModal() {
  document.getElementById("modalBack")
    .classList.add("hidden");
}


// COPY EMAIL

function emailText() {
  return `To: ${document.getElementById("editTo").value}
Subject: ${document.getElementById("editSubject").value}

${document.getElementById("editBody").value}`;
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(emailText());
    toast("Message copied to clipboard");
  } catch {
    toast("Clipboard permission unavailable");
  }
}


// OPEN EMAIL APP

function openEmail() {
  const to = encodeURIComponent(
    document.getElementById("editTo").value
  );

  const subject = encodeURIComponent(
    document.getElementById("editSubject").value
  );

  const body = encodeURIComponent(
    document.getElementById("editBody").value
  );

  location.href =
    `mailto:${to}?subject=${subject}&body=${body}`;
}


// SHEET BACKUP WORKSPACE

function setBackupDate(mode) {
  backupDate = dateFor(
    mode,
    document.getElementById("backupCustom").value
  );

  ["today", "tomorrow"].forEach(x => {
    document.getElementById(
      "backup" + x[0].toUpperCase() + x.slice(1)
    ).classList.toggle("active", mode === x);
  });

  if (mode === "custom") {
    document.getElementById("backupCustom").value = backupDate;
    document.getElementById("backupCustom").classList.add("active");
  } else {
    document.getElementById("backupCustom").classList.remove("active");
  }

  renderSheets();
}


// GET COMPLETED CHECKBOXES

function checks() {
  try {
    return JSON.parse(
      localStorage.getItem("lak_checks_" + backupDate) || "[]"
    );
  } catch {
    return [];
  }
}


// DISPLAY SHEETS

function renderSheets() {
  const date = new Date(backupDate + "T12:00:00");

  document.getElementById("backupDateLabel").textContent =
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  const done = checks();

  document.getElementById("doneCount").textContent =
    `${done.length} / 20 done`;

  document.getElementById("sheetRows").innerHTML =
    sheetNames.map((name, i) => `
      <div class="sheetrow">

        <div class="sheetname">

          <div class="sheeticon">▤</div>

          <div class="sheettitle">

            <strong>${esc(name)}</strong>

            <button class="editname"
              onclick="renameSheet(${i})">✎</button>

            <small>
              Sheet ${String(i+1).padStart(2,"0")}
              · ${pretty(date)}
            </small>

          </div>
        </div>

        <button class="btn copybtn"
          onclick="copySheet(${i})">
          ▢ Copy name
        </button>

        <label class="status">

          <input type="checkbox"
            ${done.includes(i) ? "checked" : ""}
            onchange="toggleCheck(${i}, this.checked)">

          <span>
            ${done.includes(i) ? "Completed" : "Not taken"}
          </span>

        </label>

      </div>
    `).join("");
}


// COPY SHEET NAME

async function copySheet(i) {
  const name =
    `${sheetNames[i]} - ${pretty(new Date(backupDate + "T12:00:00"))}`;

  try {
    await navigator.clipboard.writeText(name);
    toast("Sheet name copied");
  } catch {
    toast("Clipboard unavailable — allow clipboard access");
  }
}


// CHECKBOX STATUS

function toggleCheck(i, on) {
  let a = checks().filter(x => x !== i);

  if (on) {
    a.push(i);
  }

  localStorage.setItem(
    "lak_checks_" + backupDate,
    JSON.stringify(a)
  );

  renderSheets();
}


// UNCHECK ALL

function clearChecks() {
  localStorage.setItem(
    "lak_checks_" + backupDate,
    "[]"
  );

  renderSheets();
  toast("All checkboxes cleared for this date");
}


// RENAME SHEET

function renameSheet(i) {
  const n = prompt("Enter sheet name:", sheetNames[i]);

  if (n && n.trim()) {
    sheetNames[i] = n.trim();

    localStorage.setItem(
      "lak_sheet_names",
      JSON.stringify(sheetNames)
    );

    renderSheets();
  }
}


// TOAST MESSAGE

function toast(msg) {
  const el = document.getElementById("toast");

  el.textContent = msg;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 1900);
}


// INITIALIZE WEBSITE

renderMails();
renderSheets();
