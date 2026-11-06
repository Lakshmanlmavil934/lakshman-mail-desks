
const DEFAULT_TEMPLATES = [
{
id:1,
title:"Project status — weekly",
subtitle:"Weekly project note",
to:"",cc:"",bcc:"",
subject:"Project status — weekly — {{DATE}}",
body:"Hi {{NAME}},\n\nHere is the latest project status as of {{DATE}}.\n\nHighlights:\n• Product review is on track.\n• The team is working through the remaining tasks.\n\nPlease let me know if you need any additional details.\n\nBest regards,\nLakshman"
},
{
id:2,
title:"Design review follow-up",
subtitle:"A few notes after our design review",
to:"",cc:"",bcc:"",
subject:"Design review follow-up — {{DATE}}",
body:"Hi {{NAME}},\n\nThank you for the thoughtful review on {{DATE}}. I have folded the agreed changes into the latest version.\n\nPlease share any further feedback.\n\nBest,\nLakshman"
},
{
id:3,
title:"Invoice reminder",
subtitle:"Invoice follow-up",
to:"",cc:"",bcc:"",
subject:"Invoice reminder — {{DATE}}",
body:"Hello,\n\nA quick follow-up on invoice #1842. Could you confirm its expected payment date?\n\nThank you,\nLakshman"
},
{
id:4,
title:"Meeting confirmation",
subtitle:"Confirmed: our conversation",
to:"",cc:"",bcc:"",
subject:"Meeting confirmation — {{DATE}}",
body:"Hi {{NAME}},\n\nConfirming our conversation for {{DATE}}. I have set aside the full hour.\n\nLooking forward to speaking with you.\n\nRegards,\nLakshman"
},
{
id:5,
title:"Partner introduction",
subtitle:"An introduction to a new partner",
to:"",cc:"",bcc:"",
subject:"Partner introduction — {{DATE}}",
body:"Hi {{NAME}},\n\nI wanted to connect you with a colleague who may be helpful for your work.\n\nThanks,\nLakshman"
},
{
id:6,
title:"Request for materials",
subtitle:"Materials for our next working session",
to:"",cc:"",bcc:"",
subject:"Request for materials — {{DATE}}",
body:"Hi {{NAME}},\n\nBefore we meet on {{DATE}}, could you send over the latest research notes and presentation materials?\n\nThank you,\nLakshman"
},
{
id:7,
title:"Decision log update",
subtitle:"Decision log updated",
to:"",cc:"",bcc:"",
subject:"Decision log update — {{DATE}}",
body:"Hi team,\n\nThe decision log has been updated with the outcomes from our latest discussion on {{DATE}}.\n\nRegards,\nLakshman"
},
{
id:8,
title:"Thank-you note",
subtitle:"Thank you for the conversation",
to:"",cc:"",bcc:"",
subject:"Thank-you note — {{DATE}}",
body:"Hi {{NAME}},\n\nThank you for taking the time to speak with me. I appreciated the conversation.\n\nWarm regards,\nLakshman"
},
{
id:9,
title:"Leave request",
subtitle:"A polite request for leave",
to:"",cc:"",bcc:"",
subject:"Leave request — {{DATE}}",
body:"Dear {{NAME}},\n\nI would like to request leave on {{DATE}} due to a personal commitment.\n\nThank you for your understanding.\n\nRegards,\nLakshman"
},
{
id:10,
title:"Job application follow-up",
subtitle:"Following up on my application",
to:"",cc:"",bcc:"",
subject:"Application follow-up — {{DATE}}",
body:"Dear Hiring Team,\n\nI am writing to follow up on my application and check whether there are any updates regarding the next steps.\n\nSincerely,\nLakshman"
}
];

const $ = id => document.getElementById(id);

let templates = loadTemplates();
let drafts = JSON.parse(
 localStorage.getItem("lakshmanMailDrafts") || "[]"
);
let selectedDate = "today";
let activeId = null;
let currentView = "templates";

function loadTemplates() {
 try {
  const saved = JSON.parse(
   localStorage.getItem("lakshmanMailTemplates")
  );
  return Array.isArray(saved) && saved.length
   ? saved
   : DEFAULT_TEMPLATES.map(t => ({...t}));
 } catch {
  return DEFAULT_TEMPLATES.map(t => ({...t}));
 }
}

function saveTemplates() {
 localStorage.setItem(
  "lakshmanMailTemplates",
  JSON.stringify(templates)
 );
}

function dateValue() {
 if (selectedDate === "custom" && $("customDate").value) {
  return new Date($("customDate").value + "T12:00:00");
 }
 const d = new Date();
 if (selectedDate === "tomorrow") d.setDate(d.getDate()+1);
 return d;
}

function formatDate(d) {
 return new Intl.DateTimeFormat("en-GB", {
  day:"2-digit",month:"2-digit",year:"numeric"
 }).format(d);
}

function replaceDate(s) {
 return (s || "")
  .replaceAll("{{DATE}}",formatDate(dateValue()))
  .replaceAll("{{NAME}}","there");
}

function escapeHTML(s) {
 return String(s ?? "").replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",
  '"':"&quot;","'":"&#39;"
 }[c]));
}

function render() {
 const query = $("searchInput").value.trim().toLowerCase();
 const list = currentView === "drafts" ? drafts : templates;

 $("templateGrid").innerHTML = "";
 $("libraryPanel").hidden = currentView === "drafts";
 $("draftsHeading").hidden = currentView !== "drafts";

 $("pageTitle").textContent =
  currentView === "drafts"
  ? "Your drafts, ready to continue."
  : "Ready when you are.";

 $("templateCount").textContent = templates.length;
 $("readyCount").textContent = templates.length;

 const shown = list.filter(t =>
  [t.title,t.subtitle,t.subject,t.to]
   .join(" ").toLowerCase().includes(query)
 );

 shown.forEach((t,index) => {
  const card = document.createElement("article");
  card.className = "template-card";

  card.innerHTML = `
   <div class="card-top">
    <span class="ready">
     <span class="number">${String(index+1).padStart(2,"0")}</span>
     READY
    </span>
    <button class="icon-button edit-btn">✎</button>
   </div>
   <h3>${escapeHTML(t.title)}</h3>
   <div class="card-subtitle">${escapeHTML(replaceDate(t.subtitle || ""))}</div>
   <p class="card-excerpt">${escapeHTML(replaceDate(t.body).replace(/\n/g," "))}</p>
   <div class="card-meta">
    <span class="recipient">${escapeHTML(t.to || "No recipient added")}</span>
    <span>Date-aware</span>
   </div>
   <div class="card-actions">
    <button class="primary-button preview-btn">Preview ↗</button>
    <button class="secondary-button compose-btn">➤ Compose</button>
   </div>
  `;

  card.querySelector(".edit-btn").onclick = () => openEdit(t.id);
  card.querySelector(".preview-btn").onclick = () => openPreview(t.id);
  card.querySelector(".compose-btn").onclick = () => compose(t.id);

  $("templateGrid").appendChild(card);
 });

 $("emptyState").hidden = shown.length !== 0;
}

function showToast(message) {
 const el = $("toast");
 el.textContent = message;
 el.classList.add("show");
 setTimeout(() => el.classList.remove("show"),2200);
}

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
 const t = templates.find(x => x.id === id);
 if (!t) return;

 $("modalKicker").textContent = "TEMPLATE DETAILS";
 $("modalTitle").textContent = "Edit template";
 $("editFields").hidden = false;
 $("previewFields").hidden = true;

 $("editTitle").value = t.title;
 $("editTo").value = t.to || "";
 $("editCc").value = t.cc || "";
 $("editBcc").value = t.bcc || "";
 $("editSubject").value = t.subject || "";
 $("editBody").value = t.body || "";

 openModal();
}

function openPreview(id) {
 activeId = id;
 const t = templates.find(x => x.id === id);
 if (!t) return;

 $("modalKicker").textContent = "MESSAGE PREVIEW";
 $("modalTitle").textContent = t.title;
 $("editFields").hidden = true;
 $("previewFields").hidden = false;

 $("previewTo").textContent = t.to || "Not specified";
 $("previewSubject").textContent = replaceDate(t.subject);
 $("previewBody").textContent = replaceDate(t.body);

 openModal();
}

function saveEdit() {
 const t = templates.find(x => x.id === activeId);
 if (!t) return;

 t.title = $("editTitle").value.trim() || "Untitled template";
 t.to = $("editTo").value.trim();
 t.cc = $("editCc").value.trim();
 t.bcc = $("editBcc").value.trim();
 t.subject = $("editSubject").value;
 t.body = $("editBody").value;

 saveTemplates();
 render();
 closeModal();
 showToast("Template saved successfully!");
}

function compose(id) {
 const t = templates.find(x => x.id === id);
 if (!t) return;

 const params = new URLSearchParams();

 if (t.to) params.set("to",t.to);
 if (t.cc) params.set("cc",t.cc);
 if (t.bcc) params.set("bcc",t.bcc);

 params.set("su",replaceDate(t.subject));
 params.set("body",replaceDate(t.body));

 const url =
  "https://mail.google.com/mail/?view=cm&fs=1&"
  + params.toString();

 const win = window.open(
  url,"_blank","noopener,noreferrer"
 );

 if (!win) {
  showToast("Allow pop-ups in Chrome and try again.");
  return;
 }

 drafts.unshift({
  ...t,
  id:Date.now(),
  savedAt:new Date().toISOString()
 });

 drafts = drafts.slice(0,30);

 localStorage.setItem(
  "lakshmanMailDrafts",
  JSON.stringify(drafts)
 );

 showToast("Gmail opened in a new tab!");
}

function updateDateButtons() {
 const today = new Date();
 const tomorrow = new Date();
 tomorrow.setDate(today.getDate()+1);

 $("todayLabel").textContent = formatDate(today);
 $("tomorrowLabel").textContent = formatDate(tomorrow);
 $("activeDateLabel").textContent = formatDate(dateValue());
}

document.querySelectorAll(".date-choice").forEach(btn => {
 btn.addEventListener("click",() => {
  selectedDate = btn.dataset.date;

  document.querySelectorAll(".date-choice")
   .forEach(b => b.classList.toggle("selected",b === btn));

  updateDateButtons();
  render();
 });
});

$("customDate").addEventListener("change",e => {
 if (e.target.value) {
  selectedDate = "custom";
  document.querySelectorAll(".date-choice")
   .forEach(b => b.classList.remove("selected"));

  updateDateButtons();
  render();
 }
});

$("searchInput").addEventListener("input",render);

$("saveEdit").onclick = saveEdit;
$("cancelEdit").onclick = closeModal;
$("closeModal").onclick = closeModal;

$("modalBackdrop").addEventListener("click",e => {
 if (e.target === $("modalBackdrop")) closeModal();
});

$("previewEdit").onclick = () => openEdit(activeId);

$("previewCompose").onclick = () => {
 const id = activeId;
 closeModal();
 compose(id);
};

function switchView(view) {
 currentView = view;
 document.querySelectorAll(".nav-item")
  .forEach(b => b.classList.toggle("active",b.dataset.view === view));

 $("searchInput").value = "";
 render();
 $("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-item").forEach(btn => {
 btn.addEventListener("click",() => switchView(btn.dataset.view));
});

$("backTemplates").onclick = () => switchView("templates");

$("menuButton").onclick = () => {
 $("sidebar").classList.toggle("open");
};

document.addEventListener("keydown",e => {
 if (e.key === "Escape") closeModal();
});

updateDateButtons();
render();
   
