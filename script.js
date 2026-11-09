
// ==========================================
// LAKSHMAN PERSONAL WORKSPACE
// Mail Dashboard + Google Sheets Backup
// ==========================================

// ---------- DEFAULT EMAIL TEMPLATES ----------

const defaultTemplates = [
  {
    id: "t1",
    title: "Project status — weekly",
    subject: "Weekly project note",
    to: ["mira@northstar.studio"],
    cc: ["team@northstar.studio"],
    body: `Hi Mira,

Here is the latest project status as of {DATE}.

Highlights:
• Product review is on track.
• The design handoff is progressing.
• I will share the next update on Friday.

Please let me know if you need more details.

Best,
Lakshman`
  },
  {
    id: "t2",
    title: "Design review follow-up",
    subject: "A few notes after our design review",
    to: ["jo@fieldnotes.co"],
    cc: [],
    body: `Hi Jo,

Thank you for the thoughtful review on {DATE}.

I have folded the agreed changes into the latest version.

Please take a look when you have a moment.

Best,
Lakshman`
  },
  {
    id: "t3",
    title: "Invoice reminder",
    subject: "Invoice follow-up",
    to: ["accounts@samirfoods.in"],
    cc: ["finance@samirfoods.in"],
    body: `Hello,

A quick follow-up on invoice #1842.

Could you confirm its expected payment date?

Thank you,
Lakshman`
  },
  {
    id: "t4",
    title: "Meeting confirmation",
    subject: "Confirmed: our conversation",
    to: ["nina@terracotta.in"],
    cc: [],
    body: `Hi Nina,

Confirming our conversation for {DATE}.

I have set aside the full hour and will bring the notes and agenda.

Looking forward to speaking.

Best,
Lakshman`
  },
  {
    id: "t5",
    title: "Partner introduction",
    subject: "An introduction to Ana",
    to: ["samir@inkolcapital.com"],
    cc: ["ana@example.com"],
    body: `Hi Samir,

I wanted to connect you with Ana, who I think would be a valuable person for you to know.

I'll let you both take it from here.

Best,
Lakshman`
  },
  {
    id: "t6",
    title: "Request for materials",
    subject: "Materials for our next working session",
    to: ["devon@papertrail.org"],
    cc: [],
    body: `Hi Devon,

Before we meet on {DATE}, could you send over the latest research notes and current presentation?

Thanks,
Lakshman`
  },
  {
    id: "t7",
    title: "Decision log update",
    subject: "Decision log updated",
    to: ["project@northstar.studio"],
    cc: [],
    body: `Hello team,

The decision log has been updated for {DATE}.

Please review the latest entries and reply if anything needs correcting.

Thanks,
Lakshman`
  },
  {
    id: "t8",
    title: "Thank-you note",
    subject: "Thank you for the conversation",
    to: ["hello@example.com"],
    cc: [],
    body: `Hello,

Thank you for taking the time to speak with me.

I appreciated the conversation and the helpful context you shared.

Best,
Lakshman`
  },
  {
    id: "t9",
    title: "Deadline extension request",
    subject: "Request to adjust the deadline",
    to: ["manager@example.com"],
    cc: [],
    body: `Hello,

Would it be possible to extend the deadline to allow time for a careful final review?

Thank you for considering my request.

Best,
Lakshman`
  },
  {
    id: "t10",
    title: "Task completion update",
    subject: "Task completed",
    to: ["team@example.com"],
    cc: [],
    body: `Hello team,

The requested task is complete as of {DATE}.

The updated files are ready for review.

Best,
Lakshman`
  }
];

// ---------- DEFAULT GOOGLE SHEETS ----------

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

// ---------- HELPER FUNCTIONS ----------

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];

const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(
        localStorage.getItem(key)
      ) ?? fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  }
};

let templates = storage.get(
  "lakshman_templates",
  defaultTemplates
);

let activeTemplate = null;
let toastTimer;

function todayISO() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function addDays(iso, number) {
  const d = new Date(iso + "T12:00:00");

  d.setDate(d.getDate() + number);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function prettyDate(iso) {
  if (!iso) iso = todayISO();

  return new Date(
    iso + "T12:00:00"
  ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function safe(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character])
  );
}

function toast(message) {
  const element = $("#toast");

  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2200);
}

// ==========================================
// WORKSPACE NAVIGATION
// ==========================================

function showWorkspace(name) {
  const mail = name === "mail";

  $("#mail-workspace").classList.toggle(
    "hidden",
    !mail
  );

  $("#backup-workspace").classList.toggle(
    "hidden",
    mail
  );

  $$(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.workspace === name
    );
  });

  $("#page-title").textContent = mail
    ? "Ready when you are."
    : "Keep every backup accounted for.";

  localStorage.setItem(
    "lakshman_workspace",
    name
  );
}

$$(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    showWorkspace(button.dataset.workspace);
  });
});

// ==========================================
// MAIL DASHBOARD
// ==========================================

function renderTemplates() {
  const search = $("#template-search")
    .value.toLowerCase();

  const filtered = templates.filter(template => {
    const content = [
      template.title,
      template.subject,
      ...template.to,
      ...template.cc
    ].join(" ").toLowerCase();

    return content.includes(search);
  });

  $("#template-count").textContent =
    templates.length;

  $("#template-grid").innerHTML =
    filtered.map(template => `
      <article class="template-card">

        <div class="card-top">
          <span class="card-number">
            ${String(
              templates.indexOf(template) + 1
            ).padStart(2, "0")} READY
          </span>

          <button
            class="icon-button edit-template"
            data-id="${safe(template.id)}">
            ✎
          </button>
        </div>

        <h3>
          ${safe(template.title)}
          — ${safe(prettyDate($("#mail-date").value))}
        </h3>

        <div class="template-subject">
          ${safe(template.subject)}
        </div>

        <p class="template-snippet">
          ${safe(
            template.body
              .replaceAll(
                "{DATE}",
                prettyDate($("#mail-date").value)
              )
              .replace(/\s+/g, " ")
              .slice(0, 145)
          )}...
        </p>

        <div class="card-meta">
          <span>
            ${safe(template.to.join(", ") || "No recipient")}
            · ${template.cc.length} CC
          </span>
          <span>Date-aware</span>
        </div>

        <div class="card-actions">

          <button
            class="primary preview-template"
            data-id="${safe(template.id)}">
            Preview ↗
          </button>

          <button
            class="secondary compose-template"
            data-id="${safe(template.id)}">
            ➤ Compose
          </button>

        </div>
      </article>
    `).join("") ||
    "<p>No templates match your search.</p>";

  $$(".edit-template").forEach(button => {
    button.onclick = () =>
      openTemplate(button.dataset.id);
  });

  $$(".preview-template").forEach(button => {
    button.onclick = () =>
      openTemplate(button.dataset.id);
  });

  $$(".compose-template").forEach(button => {
    button.onclick = () =>
      openTemplate(button.dataset.id);
  });
}

$("#template-search").addEventListener(
  "input",
  renderTemplates
);

$("#mail-date").value = todayISO();

$("#mail-date").addEventListener(
  "change",
  renderTemplates
);

// ==========================================
// MULTIPLE TO AND CC EMAIL FIELDS
// ==========================================

function addressField(value = "", type = "to") {
  const wrap = document.createElement("div");

  wrap.className = "address-line";

  const input = document.createElement("input");

  input.type = "email";
  input.placeholder = "name@example.com";
  input.value = value;
  input.setAttribute(
    "aria-label",
    type.toUpperCase() + " email address"
  );

  const remove = document.createElement("button");

  remove.type = "button";
  remove.className = "remove-address";
  remove.textContent = "Remove";

  remove.onclick = () => {
    if (wrap.parentElement.children.length > 1) {
      wrap.remove();
    } else {
      input.value = "";
    }
  };

  wrap.append(input, remove);

  return wrap;
}

function addAddress(type, value = "") {
  const container = $(`#${type}-fields`);

  container.append(
    addressField(value, type)
  );
}

function fillAddresses(type, values) {
  const container = $(`#${type}-fields`);

  container.innerHTML = "";

  (values.length ? values : [""])
    .forEach(value => {
      addAddress(type, value);
    });
}

function readAddresses(type) {
  return [
    ...$(`#${type}-fields`).querySelectorAll("input")
  ]
    .map(input => input.value.trim())
    .filter(Boolean);
}

$("#add-to").onclick = () =>
  addAddress("to");

$("#add-cc").onclick = () =>
  addAddress("cc");

// ==========================================
// TEMPLATE EDITOR AND PREVIEW
// ==========================================

function openTemplate(id = null) {
  activeTemplate = templates.find(
    template => template.id === id
  ) || null;

  const template = activeTemplate || {
    title: "",
    subject: "",
    to: [""],
    cc: [],
    body: ""
  };

  $("#editing-id").value =
    template.id || "";

  $("#dialog-title").textContent =
    activeTemplate
      ? "Edit or preview template"
      : "Create a template";

  $("#field-title").value =
    template.title;

  $("#field-subject").value =
    template.subject;

  $("#field-body").value =
    template.body.replaceAll(
      "{DATE}",
      prettyDate($("#mail-date").value)
    );

  fillAddresses("to", template.to);
  fillAddresses("cc", template.cc);

  $("#template-dialog").showModal();
}

function formTemplate() {
  const title = $("#field-title").value.trim();

  const subject = $("#field-subject")
    .value.trim();

  const body = $("#field-body").value;

  if (!title || !subject || !body.trim()) {
    toast("Please complete all required fields.");
    return null;
  }

  const allEmails = [
    ...readAddresses("to"),
    ...readAddresses("cc")
  ];

  const invalid = allEmails.some(email =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

  if (invalid) {
    toast("Please enter valid email addresses.");
    return null;
  }

  return {
    id:
      $("#editing-id").value ||
      "t" + Date.now(),

    title,
    subject,
    to: readAddresses("to"),
    cc: readAddresses("cc"),
    body
  };
}

$("#add-template").onclick = () =>
  openTemplate();

$("#close-dialog").onclick = () =>
  $("#template-dialog").close();

// SAVE TEMPLATE

$("#save-template").onclick = () => {
  const template = formTemplate();

  if (!template) return;

  const index = templates.findIndex(
    item => item.id === template.id
  );

  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }

  storage.set(
    "lakshman_templates",
    templates
  );

  renderTemplates();

  $("#template-dialog").close();

  toast("Template saved successfully.");
};

// COMPOSE EMAIL

$("#compose-email").onclick = () => {
  const template = formTemplate();

  if (!template) return;

  const date = prettyDate(
    $("#mail-date").value
  );

  const subject = template.subject.replaceAll(
    "{DATE}",
    date
  );

  const body = template.body.replaceAll(
    "{DATE}",
    date
  );

  const params = new URLSearchParams({
    subject: subject,
    body: body
  });

  if (template.cc.length > 0) {
    params.set(
      "cc",
      template.cc.join(",")
    );
  }

  const mailto =
    "mailto:" +
    encodeURIComponent(template.to.join(",")) +
    "?" +
    params.toString();

  window.location.href = mailto;
};

// ==========================================
// GOOGLE SHEETS BACKUP WORKSPACE
// ==========================================

function backupKey() {
  const date =
    $("#backup-date").value || todayISO();

  return "lakshman_backup_" + date;
}

function renderBackup() {
  const date = $("#backup-date").value || todayISO();

  const checks = storage.get(
    backupKey(),
    {}
  );

  $("#backup-list").innerHTML =
    defaultSheets.map((name, index) => {

      const done = !!checks[index];

      const datedName =
        name + " - " + prettyDate(date);

      return `
        <div class="backup-row ${done ? "done" : ""}">

          <div class="sheet-name">

            <span class="sheet-icon">
              ▦
            </span>

            <span class="sheet-label">

              <strong>
                ${safe(datedName)}
              </strong>

              <small>
                Sheet ${String(index + 1).padStart(2, "0")}
              </small>

            </span>

          </div>

          <button
            class="copy-button"
            data-copy="${safe(datedName)}">

            ▢ Copy name

          </button>

          <label class="check-label">

            <input
              type="checkbox"
              data-check="${index}"
              ${done ? "checked" : ""}
            />

            ${done ? "Done" : "Not taken"}

          </label>

        </div>
      `;
    }).join("");

  updateProgress();

  // COPY SHEET NAME

  $$(".copy-button").forEach(button => {

    button.onclick = async () => {

      const text = button.dataset.copy;

      try {
        await navigator.clipboard.writeText(text);
        toast("Sheet name copied.");
      } catch (error) {

        const textarea =
          document.createElement("textarea");

        textarea.value = text;

        document.body.append(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        toast("Sheet name copied.");
      }
    };

  });

  // CHECKBOX STATUS

  $$("[data-check]").forEach(checkbox => {

    checkbox.onchange = () => {

      const state = storage.get(
        backupKey(),
        {}
      );

      state[checkbox.dataset.check] =
        checkbox.checked;

      storage.set(
        backupKey(),
        state
      );

      const row = checkbox.closest(
        ".backup-row"
      );

      row.classList.toggle(
        "done",
        checkbox.checked
      );

      checkbox.parentElement.lastChild.textContent =
        checkbox.checked
          ? " Done"
          : " Not taken";

      updateProgress();
    };

  });
}

// ==========================================
// BACKUP PROGRESS COUNTER
// ==========================================

function updateProgress() {
  const checks = storage.get(
    backupKey(),
    {}
  );

  const completed = Object.values(checks)
    .filter(Boolean).length;

  $("#backup-progress").textContent =
    `${completed} / ${defaultSheets.length} done`;
}

// ==========================================
// DATE CONTROLS
// ==========================================

$("#backup-date").value = todayISO();

$("#backup-date").addEventListener(
  "change",
  renderBackup
);

$("#backup-today").onclick = () => {
  $("#backup-date").value = todayISO();
  renderBackup();
};

$("#backup-tomorrow").onclick = () => {
  $("#backup-date").value =
    addDays(todayISO(), 1);

  renderBackup();
};

$("#backup-custom").onclick = () => {

  const datePicker = $("#backup-date");

  if (datePicker.showPicker) {
    datePicker.showPicker();
  } else {
    datePicker.focus();
  }

};

// ==========================================
// UNCHECK ALL BACKUPS
// ==========================================

$("#uncheck-all").onclick = () => {

  storage.set(
    backupKey(),
    {}
  );

  renderBackup();

  toast("All checks cleared for this date.");

};

// ==========================================
// INITIALIZE WEBSITE
// ==========================================

renderTemplates();

renderBackup();

showWorkspace(
  localStorage.getItem("lakshman_workspace") || "mail"
);

// ==========================================
// END OF SCRIPT
// ==========================================
