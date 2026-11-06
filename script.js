
/* ==========================================
   LAKSHMAN PERSONAL WORKSPACE
   MAIL DASHBOARD + SHEETS BACKUP
   DIRECT GMAIL COMPOSE IN NEW TAB
========================================== */

const STORAGE_KEY = "lakshman_workspace_v1";

const SHEETS_DEFAULT = [
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

/* EMAIL TEMPLATES */

const DEFAULT_TEMPLATES = [
{
id:"t1",
title:"Project status — weekly",
subject:"Weekly project note",
to:"",
cc:"",
body:"Hi [Name],\n\nHere is the latest project status as of [Date].\n\nHighlights:\n• [Highlight 1]\n• [Highlight 2]\n\nNext steps:\n• [Next step]\n\nPlease let me know if you have any questions.\n\nRegards,\nLakshman"
},
{
id:"t2",
title:"Design review follow-up",
subject:"A few notes after our design review",
to:"",
cc:"",
body:"Hi [Name],\n\nThank you for the thoughtful review. I have folded the agreed changes into the latest version.\n\nPlease review when you have a moment and share any additional feedback.\n\nRegards,\nLakshman"
},
{
id:"t3",
title:"Invoice reminder",
subject:"Invoice follow-up",
to:"",
cc:"",
body:"Hello,\n\nA quick follow-up on invoice [Invoice Number]. Could you confirm its expected payment date?\n\nThank you,\nLakshman"
},
{
id:"t4",
title:"Meeting confirmation",
subject:"Confirmed: our conversation",
to:"",
cc:"",
body:"Hi [Name],\n\nConfirming our conversation on [Date]. I have set aside the time for our discussion.\n\nPlease let me know if anything changes.\n\nRegards,\nLakshman"
},
{
id:"t5",
title:"Partner introduction",
subject:"An introduction to [Name]",
to:"",
cc:"",
body:"Hi [Name],\n\nI wanted to connect you with [Person] because I think there may be a useful opportunity to work together.\n\nI'll let you both take it from here.\n\nRegards,\nLakshman"
},
{
id:"t6",
title:"Request for materials",
subject:"Materials for our next working session",
to:"",
cc:"",
body:"Hi [Name],\n\nBefore we meet on [Date], could you send over the latest research notes and the relevant files?\n\nThanks for your help.\n\nRegards,\nLakshman"
},
{
id:"t7",
title:"Decision log update",
subject:"Decision log updated",
to:"",
cc:"",
body:"Hello team,\n\nThe decision log has been updated with the latest outcomes and owners.\n\nPlease review your action items and let me know if anything needs correcting.\n\nRegards,\nLakshman"
},
{
id:"t8",
title:"Thank-you note",
subject:"Thank you for the conversation",
to:"",
cc:"",
body:"Hi [Name],\n\nThank you for your time and for sharing your thoughts. I appreciated the conversation and the helpful suggestions.\n\nBest regards,\nLakshman"
},
{
id:"t9",
title:"Leave request",
subject:"Leave request — [Dates]",
to:"",
cc:"",
body:"Hi [Manager],\n\nI would like to request leave from [Start Date] to [End Date]. Please let me know if you need any additional information.\n\nThank you,\nLakshman"
},
{
id:"t10",
title:"Task completion update",
subject:"Task completed — [Task Name]",
to:"",
cc:"",
body:"Hi team,\n\nThe task [Task Name] has been completed.\n\nSummary:\n[Add a short summary]\n\nPlease let me know if any follow-up is required.\n\nRegards,\nLakshman"
}
];

/* LOAD SAVED DATA */

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    return {
      templates: Array.isArray(saved.templates)
        ? saved.templates
        : structuredCloneSafe(DEFAULT_TEMPLATES),

      drafts: Array.isArray(saved.drafts)
        ? saved.drafts
        : [],

      sheetNames: Array.isArray(saved.sheetNames)
        ? saved.sheetNames
        : [...SHEETS_DEFAULT],

      checks: saved.checks &&
        typeof saved.checks === "object"
        ? saved.checks
        : {}
    };

  } catch (error) {
    return {
      templates: structuredCloneSafe(DEFAULT_TEMPLATES),
      drafts: [],
      sheetNames: [...SHEETS_DEFAULT],
      checks: {}
    };
  }
}

let state = loadState();
let activeDate = dateISO(new Date());
let toastTimer;

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

/* DATE FUNCTIONS */

function dateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function parseDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function displayDate(value) {
  return parseDate(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function niceDate(value) {
  return parseDate(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* SECURITY AND NOTIFICATIONS */

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function showToast(message) {
  const element = document.getElementById("toast");

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2300);
}

/* COPY TO CLIPBOARD */

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");

  } catch (error) {
    const area = document.createElement("textarea");

    area.value = text;
    document.body.appendChild(area);
    area.select();

    document.execCommand("copy");
    area.remove();

    showToast("Copied to clipboard");
  }
}

/* ==========================================
   WORKSPACE NAVIGATION
========================================== */

function switchWorkspace(which) {

  document.querySelectorAll(".nav-link").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.workspace === which
    );

  });

  document.getElementById("mailWorkspace")
    .classList.toggle("active", which === "mail");

  document.getElementById("backupWorkspace")
    .classList.toggle("active", which === "backup");
}

document.querySelectorAll(".nav-link").forEach(button => {

  button.addEventListener("click", () => {
    switchWorkspace(button.dataset.workspace);
  });

});

/* ==========================================
   MAIL DASHBOARD
========================================== */

function renderTemplates() {

  const q = document.getElementById("templateSearch")
    .value.trim().toLowerCase();

  const list = state.templates.filter(template => {

    return [
      template.title,
      template.subject,
      template.to,
      template.cc,
      template.body
    ].join(" ").toLowerCase().includes(q);

  });

  document.getElementById("templateCount").textContent =
    state.templates.length;

  document.getElementById("templateReady").textContent =
    `${state.templates.length} templates ready`;

  const grid = document.getElementById("templateGrid");

  grid.innerHTML = list.map(template => `

    <article class="template-card">

      <div class="card-top">

        <span class="ready-tag">

          <span class="card-number">
            ${String(state.templates.indexOf(template) + 1).padStart(2, "0")}
          </span>

          READY

        </span>

        <button
          class="icon-button"
          data-edit="${escapeHTML(template.id)}"
          title="Edit template">

          ✎

        </button>

      </div>

      <h3>${escapeHTML(template.title)}</h3>

      <div class="template-subject">
        ${escapeHTML(template.subject)}
      </div>

      <p class="template-preview">
        ${escapeHTML(template.body).replace(/\n/g, " ").slice(0, 125)}
        ${template.body.length > 125 ? "…" : ""}
      </p>

      <div class="card-meta">

        <span>
          ${escapeHTML(template.to || "No To recipient")}
        </span>

        <span>
          ${template.cc ? "Cc added" : "No Cc"}
        </span>

      </div>

      <div class="card-actions">

        <button
          class="primary-button"
          data-preview="${escapeHTML(template.id)}">

          Preview ↗

        </button>

        <button
          class="compose-button"
          data-compose="${escapeHTML(template.id)}">

          ➤ Compose

        </button>

      </div>

    </article>

  `).join("");

  document.getElementById("emptyTemplates")
    .classList.toggle("hidden", list.length !== 0);

  /* EDIT BUTTON */

  grid.querySelectorAll("[data-edit]").forEach(button => {

    button.addEventListener("click", () => {
      openTemplateForm(button.dataset.edit);
    });

  });

  /* DIRECT GMAIL COMPOSE BUTTON */

  grid.querySelectorAll("[data-compose]").forEach(button => {

    button.addEventListener("click", () => {
      openGmailComposer(button.dataset.compose);
    });

  });

  /* PREVIEW BUTTON */

  grid.querySelectorAll("[data-preview]").forEach(button => {

    button.addEventListener("click", () => {
      openComposer(button.dataset.preview);
    });

  });

}

document.getElementById("templateSearch")
  .addEventListener("input", renderTemplates);

/* ==========================================
   MODAL FUNCTIONS
========================================== */

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

document.querySelectorAll("[data-close]").forEach(button => {

  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });

});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {

  backdrop.addEventListener("click", event => {

    if (event.target === backdrop) {
      backdrop.classList.add("hidden");
    }

  });

});

/* ==========================================
   CREATE AND EDIT EMAIL TEMPLATES
========================================== */

function openTemplateForm(id) {

  const template = state.templates.find(item => item.id === id);

  document.getElementById("templateForm").reset();

  document.getElementById("templateId").value =
    template?.id || "";

  document.getElementById("formTitle").value =
    template?.title || "";

  document.getElementById("formSubject").value =
    template?.subject || "";

  document.getElementById("formTo").value =
    template?.to || "";

  document.getElementById("formCc").value =
    template?.cc || "";

  document.getElementById("formBody").value =
    template?.body || "";

  document.getElementById("modalTitle").textContent =
    template ? "Edit template" : "Create template";

  openModal("templateModal");
}

document.getElementById("newTemplateBtn")
  .addEventListener("click", () => openTemplateForm());

document.getElementById("templateForm")
  .addEventListener("submit", event => {

    event.preventDefault();

    const id =
      document.getElementById("templateId").value ||
      `t${Date.now()}`;

    const item = {

      id,

      title: document.getElementById("formTitle")
        .value.trim(),

      subject: document.getElementById("formSubject")
        .value.trim(),

      to: document.getElementById("formTo")
        .value.trim(),

      cc: document.getElementById("formCc")
        .value.trim(),

      body: document.getElementById("formBody")
        .value

    };

    const index = state.templates.findIndex(
      template => template.id === id
    );

    if (index >= 0) {
      state.templates[index] = item;
    } else {
      state.templates.push(item);
    }

    saveState();
    renderTemplates();

    closeModal("templateModal");

    showToast("Template saved");

  });

/* ==========================================
   MULTIPLE TO AND CC RECIPIENTS
========================================== */

function addRecipientRow(containerId, value = "") {

  const container = document.getElementById(containerId);

  const row = document.createElement("div");

  row.className = "recipient-row";

  row.innerHTML = `

    <input
      type="email"
      placeholder="email@example.com"
      aria-label="Email recipient">

    <button
      type="button"
      class="remove-recipient"
      aria-label="Remove recipient">

      ×

    </button>

  `;

  row.querySelector("input").value = value;

  row.querySelector("button").addEventListener("click", () => {

    if (container.children.length > 1) {
      row.remove();
    } else {
      row.querySelector("input").value = "";
    }

  });

  container.appendChild(row);

}

function setRecipientRows(containerId, raw) {

  const container = document.getElementById(containerId);

  container.innerHTML = "";

  const values = String(raw || "")
    .split(/[,\n;]/)
    .map(value => value.trim())
    .filter(Boolean);

  (values.length ? values : [""]).forEach(value => {

    addRecipientRow(containerId, value);

  });

}

function recipientValues(containerId) {

  return [...document.querySelectorAll(`#${containerId} input`)]
    .map(input => input.value.trim())
    .filter(Boolean);

}

/* ==========================================
   WEBSITE EMAIL PREVIEW
========================================== */

function openComposer(id) {

  const template = state.templates.find(
    item => item.id === id
  );

  if (!template) return;

  document.getElementById("composeTemplateId").value =
    template.id;

  document.getElementById("composeSubject").value =
    template.subject;

  document.getElementById("composeBody").value =
    template.body;

  setRecipientRows("toRows", template.to);

  setRecipientRows("ccRows", template.cc);

  openModal("composeModal");

}

/* ==========================================
   DIRECT GMAIL COMPOSE IN NEW CHROME TAB
========================================== */

function openGmailComposer(id) {

  const template = state.templates.find(
    item => item.id === id
  );

  if (!template) {

    showToast("Template not found");

    return;

  }

  const to = String(template.to || "")
    .split(/[,\n;]/)
    .map(value => value.trim())
    .filter(Boolean)
    .join(",");

  const cc = String(template.cc || "")
    .split(/[,\n;]/)
    .map(value => value.trim())
    .filter(Boolean)
    .join(",");

  const params = new URLSearchParams();

  params.set("view", "cm");

  params.set("fs", "1");

  if (to) {
    params.set("to", to);
  }

  if (cc) {
    params.set("cc", cc);
  }

  params.set("su", template.subject || "");

  params.set("body", template.body || "");

  const gmailURL =
    "https://mail.google.com/mail/?" +
    params.toString();

  /* OPEN GMAIL IN NEW TAB */

  const newTab = window.open(
    gmailURL,
    "_blank"
  );

  if (!newTab) {

    showToast(
      "Allow pop-ups in Chrome and try again"
    );

  }

}

/* ==========================================
   ADD MORE TO AND CC IN PREVIEW COMPOSER
========================================== */

document.getElementById("addToBtn")
  .addEventListener("click", () => {

    addRecipientRow("toRows");

  });

document.getElementById("addCcBtn")
  .addEventListener("click", () => {

    addRecipientRow("ccRows");

  });

/* COMPOSER DATA */

function composeData() {

  return {

    id: document.getElementById("composeTemplateId").value,

    to: recipientValues("toRows"),

    cc: recipientValues("ccRows"),

    subject: document.getElementById("composeSubject").value,

    body: document.getElementById("composeBody").value

  };

}

/* MAILTO */

function mailtoURL(data) {

  const params = new URLSearchParams();

  if (data.cc.length) {
    params.set("cc", data.cc.join(","));
  }

  if (data.subject) {
    params.set("subject", data.subject);
  }

  if (data.body) {
    params.set("body", data.body);
  }

  return `mailto:${data.to.join(",")}?${params.toString()}`;

}

/* OPEN EMAIL APP FROM PREVIEW */

document.getElementById("composeForm")
  .addEventListener("submit", event => {

    event.preventDefault();

    const data = composeData();

    if (!data.to.length) {

      showToast("Add at least one To recipient");

      return;

    }

    window.location.href = mailtoURL(data);

    showToast("Opening your email app");

  });

/* SAVE DRAFT */

document.getElementById("saveDraftBtn")
  .addEventListener("click", () => {

    const data = composeData();

    if (!data.subject.trim() && !data.body.trim()) {

      showToast("Nothing to save yet");

      return;

    }

    state.drafts.unshift({

      ...data,

      savedAt: new Date().toISOString()

    });

    saveState();

    showToast("Draft saved on this device");

  });

/* COPY COMPLETE EMAIL */

document.getElementById("copyEmailBtn")
  .addEventListener("click", () => {

    const data = composeData();

    const text =

      `To: ${data.to.join(", ")}\n` +

      `Cc: ${data.cc.join(", ")}\n` +

      `Subject: ${data.subject}\n\n` +

      data.body;

    copyText(text);

  });

/* ==========================================
   EXPORT EMAIL TEMPLATES
========================================== */

document.getElementById("exportTemplatesBtn")
  .addEventListener("click", () => {

    const blob = new Blob(

      [JSON.stringify(state.templates, null, 2)],

      { type: "application/json" }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "lakshman-mail-templates.json";

    link.click();

    URL.revokeObjectURL(url);

    showToast("Templates exported");

  });

/* ==========================================
   IMPORT EMAIL TEMPLATES
========================================== */

document.getElementById("importTemplatesInput")
  .addEventListener("change", async event => {

    const file = event.target.files[0];

    if (!file) return;

    try {

      const parsed = JSON.parse(await file.text());

      if (!Array.isArray(parsed)) {
        throw new Error("Expected an array");
      }

      const incoming = parsed

        .filter(template =>
          template &&
          typeof template.title === "string" &&
          typeof template.subject === "string" &&
          typeof template.body === "string"
        )

        .map((template, index) => ({

          ...template,

          id: String(
            template.id ||
            `import-${Date.now()}-${index}`
          ),

          to: String(template.to || ""),

          cc: String(template.cc || "")

        }));

      if (!incoming.length) {
        throw new Error("No valid templates found");
      }

      const map = new Map(
        state.templates.map(template => [
          template.id,
          template
        ])
      );

      incoming.forEach(template => {
        map.set(template.id, template);
      });

      state.templates = [...map.values()];

      saveState();

      renderTemplates();

      showToast(
        `${incoming.length} template(s) imported`
      );

    } catch (error) {

      showToast(
        "Import failed: choose a valid templates JSON file"
      );

    }

    event.target.value = "";

  });

/* ==========================================
   SHEETS BACKUP WORKSPACE
========================================== */

function currentChecks() {

  return state.checks[activeDate] ||

    (state.checks[activeDate] = {});

}

function renderSheets() {

  const list = document.getElementById("sheetList");

  const checks = currentChecks();

  const done = state.sheetNames.filter((name, index) => {

    return !!checks[index];

  }).length;

  document.getElementById("progressText").textContent =

    `${done} / ${state.sheetNames.length} done`;

  document.getElementById("selectedDateText").textContent =

    niceDate(activeDate);

  list.innerHTML = state.sheetNames.map((name, index) => {

    const checked = !!checks[index];

    return `

      <div class="sheet-row ${checked ? "done" : ""}">

        <div class="sheet-info">

          <span class="sheet-icon">▤</span>

          <div>

            <div>

              <span class="sheet-name">
                ${escapeHTML(name)}
              </span>

              <span class="sheet-date">
                - ${displayDate(activeDate)}
              </span>

              <button
                class="edit-sheet"
                data-rename="${index}"
                title="Rename sheet">

                ✎

              </button>

            </div>

            <div class="sheet-sub">
              Sheet ${String(index + 1).padStart(2, "0")}
            </div>

          </div>

        </div>

        <div>

          <button
            class="copy-button"
            data-copy="${index}">

            ▢ Copy name

          </button>

        </div>

        <label class="status-check">

          <input
            type="checkbox"
            data-check="${index}"
            ${checked ? "checked" : ""}>

          <span>
            ${checked ? "Completed" : "Not taken"}
          </span>

        </label>

      </div>

    `;

  }).join("");

  /* COPY SHEET NAME */

  list.querySelectorAll("[data-copy]").forEach(button => {

    button.addEventListener("click", () => {

      const index = Number(button.dataset.copy);

      copyText(

        `${state.sheetNames[index]} - ${displayDate(activeDate)}`

      );

    });

  });

  /* BACKUP STATUS */

  list.querySelectorAll("[data-check]").forEach(button => {

    button.addEventListener("change", () => {

      const index = Number(button.dataset.check);

      currentChecks()[index] = button.checked;

      saveState();

      renderSheets();

    });

  });

  /* RENAME SHEET */

  list.querySelectorAll("[data-rename]").forEach(button => {

    button.addEventListener("click", () => {

      const index = Number(button.dataset.rename);

      const next = prompt(

        "Enter sheet name:",

        state.sheetNames[index]

      );

      if (next && next.trim()) {

        state.sheetNames[index] = next.trim();

        saveState();

        renderSheets();

      }

    });

  });

}

/* ==========================================
   BACKUP DATE CONTROLS
========================================== */

function setBackupDate(value) {

  activeDate = value;

  document.getElementById("backupDate").value = value;

  document.querySelectorAll(".date-choice").forEach(button => {

    const isToday =

      button.dataset.date === "today" &&

      value === dateISO(new Date());

    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    const isTomorrow =

      button.dataset.date === "tomorrow" &&

      value === dateISO(tomorrow);

    button.classList.toggle(
      "active",
      isToday || isTomorrow
    );

  });

  renderSheets();

}

/* TODAY AND TOMORROW */

document.querySelectorAll(".date-choice").forEach(button => {

  button.addEventListener("click", () => {

    const date = new Date();

    if (button.dataset.date === "tomorrow") {

      date.setDate(date.getDate() + 1);

    }

    setBackupDate(dateISO(date));

  });

});

/* CUSTOM DATE */

document.getElementById("backupDate")
  .addEventListener("change", event => {

    if (event.target.value) {

      setBackupDate(event.target.value);

    }

  });

/* UNCHECK ALL */

document.getElementById("uncheckAllBtn")
  .addEventListener("click", () => {

    if (!confirm(
      "Clear all completed checkmarks for this date?"
    )) {

      return;

    }

    state.checks[activeDate] = {};

    saveState();

    renderSheets();

    showToast(
      "All statuses cleared for this date"
    );

  });

/* ==========================================
   INITIALIZE WEBSITE
========================================== */

function init() {

  const today = dateISO(new Date());

  document.getElementById("mailToday").textContent =
    niceDate(today);

  document.getElementById("backupToday").textContent =
    niceDate(today);

  setBackupDate(today);

  renderTemplates();

}

init();
