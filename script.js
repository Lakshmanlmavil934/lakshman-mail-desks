
const DEFAULT_TEMPLATES = [
 {id:1,title:"Project status — weekly",subtitle:"Weekly project note",to:"",cc:"",bcc:"",subject:"Project status — weekly — {{DATE}}",body:"Hi {{NAME}},\n\nHere is the latest project status as of {{DATE}}.\n\nHighlights:\n• Product review is on track.\n• The team is working through the remaining tasks.\n• I will share another update if anything changes.\n\nPlease let me know if you need any additional details.\n\nBest regards,\nLakshman"},
 {id:2,title:"Design review follow-up",subtitle:"A few notes after our design review",to:"",cc:"",bcc:"",subject:"Design review follow-up — {{DATE}}",body:"Hi {{NAME}},\n\nThank you for the thoughtful review on {{DATE}}. I have folded the agreed changes into the latest version.\n\nPlease take a look when you have a moment and share any further feedback.\n\nBest,\nLakshman"},
 {id:3,title:"Invoice reminder",subtitle:"Invoice follow-up",to:"",cc:"",bcc:"",subject:"Invoice reminder — {{DATE}}",body:"Hello,\n\nA quick follow-up on invoice #1842. Could you confirm its expected payment date?\n\nPlease let me know if you need the invoice sent again.\n\nThank you,\nLakshman"},
 {id:4,title:"Meeting confirmation",subtitle:"Confirmed: our conversation",to:"",cc:"",bcc:"",subject:"Meeting confirmation — {{DATE}}",body:"Hi {{NAME}},\n\nConfirming our conversation for {{DATE}}. I have set aside the full hour and will come prepared with the notes.\n\nLooking forward to speaking with you.\n\nRegards,\nLakshman"},
 {id:5,title:"Partner introduction",subtitle:"An introduction to a new partner",to:"",cc:"",bcc:"",subject:"Partner introduction — {{DATE}}",body:"Hi {{NAME}},\n\nI wanted to connect you with a colleague who may be helpful for your work. I will let you both take it from here.\n\nThanks,\nLakshman"},
 {id:6,title:"Request for materials",subtitle:"Materials for our next working session",to:"",cc:"",bcc:"",subject:"Request for materials — {{DATE}}",body:"Hi {{NAME}},\n\nBefore we meet on {{DATE}}, could you send over the latest research notes and the relevant presentation materials?\n\nHaving them in advance will help us make the best use of our time.\n\nThank you,\nLakshman"},
 {id:7,title:"Decision log update",subtitle:"Decision log updated",to:"",cc:"",bcc:"",subject:"Decision log update — {{DATE}}",body:"Hi team,\n\nThe decision log has been updated with the outcomes from our latest discussion on {{DATE}}.\n\nPlease review the notes and let me know if anything needs correcting.\n\nRegards,\nLakshman"},
 {id:8,title:"Thank-you note",subtitle:"Thank you for the conversation",to:"",cc:"",bcc:"",subject:"Thank-you note — {{DATE}}",body:"Hi {{NAME}},\n\nThank you for taking the time to speak with me. I appreciated the conversation and the helpful insights you shared.\n\nI look forward to staying in touch.\n\nWarm regards,\nLakshman"},
 {id:9,title:"Leave request",subtitle:"A polite request for leave",to:"",cc:"",bcc:"",subject:"Leave request — {{DATE}}",body:"Dear {{NAME}},\n\nI would like to request leave on {{DATE}} due to a personal commitment.\n\nPlease let me know if you need any further information. Thank you for your understanding.\n\nRegards,\nLakshman"},
 {id:10,title:"Job application follow-up",subtitle:"Following up on my application",to:"",cc:"",bcc:"",subject:"Application follow-up — {{DATE}}",body:"Dear Hiring Team,\n\nI am writing to follow up on my application and to check whether there are any updates regarding the next steps.\n\nThank you for your time and consideration.\n\nSincerely,\nLakshman"}
];

const $ = id => document.getElementById(id);

let templates = loadTemplates();
let drafts = JSON.parse(localStorage.getItem("lakshmanMailDrafts") || "[]");
let selectedDate = "today";
let activeId = null;
let modalMode = "edit";
let currentView = "templates";

const DEFAULT_SHEETS = Array.from(
 {length:22},
 (_,i)=>({id:i+1,name:`Sheet ${String(i+1).padStart(2,"0")}`,checked:false})
);

let sheets = loadSheets();
let w2SelectedDate = "today";

function loadSheets(){
 try{
  const x=JSON.parse(localStorage.getItem("lakshmanWorkspace2Sheets"));
  return Array.isArray(x)?x:DEFAULT_SHEETS.map(s=>({...s}));
 }catch{
  return DEFAULT_SHEETS.map(s=>({...s}));
 }
}

function saveSheets(){
 localStorage.setItem("lakshmanWorkspace2Sheets",JSON.stringify(sheets));
}

function getEmailList(value){
 if(Array.isArray(value)) return value.filter(Boolean);
 return String(value||"").split(/[;,\n]+/).map(x=>x.trim()).filter(Boolean);
}

function collectRecipientEmails(type){
 return [...document.querySelectorAll(`#${type}Recipients input`)]
  .map(x=>x.value.trim()).filter(Boolean);
}

function renderRecipientInputs(type,values){
 const host=$(type+"Recipients");
 host.innerHTML="";
 (values&&values.length?values:[""]).forEach(value=>addRecipientInput(type,value));
}

function addRecipientInput(type,value=""){
 const host=$(type+"Recipients");
 const row=document.createElement("div");
 row.className="recipient-row";

 const input=document.createElement("input");
 input.type="email";
 input.placeholder="name@example.com";
 input.value=value;
 input.setAttribute("aria-label",type.toUpperCase()+" email");

 const remove=document.createElement("button");
 remove.type="button";
 remove.className="remove-recipient";
 remove.textContent="×";
 remove.title="Remove email";

 remove.onclick=()=>{
  if(host.children.length>1) row.remove();
  else input.value="";
 };

 row.append(input,remove);
 host.appendChild(row);
}

function formatRecipients(v){
 return getEmailList(v).join(", ");
}

function loadTemplates(){
 try{
  const saved=JSON.parse(localStorage.getItem("lakshmanMailTemplates"));
  return Array.isArray(saved)&&saved.length
   ?saved
   :DEFAULT_TEMPLATES.map(x=>({...x}));
 }catch{
  return DEFAULT_TEMPLATES.map(x=>({...x}));
 }
}

function saveTemplates(){
 localStorage.setItem("lakshmanMailTemplates",JSON.stringify(templates));
}

function dateValue(){
 if(selectedDate==="custom"&&$("customDate").value){
  return new Date($("customDate").value+"T12:00:00");
 }
 const d=new Date();
 if(selectedDate==="tomorrow") d.setDate(d.getDate()+1);
 return d;
}

function formatDate(d){
 return new Intl.DateTimeFormat("en-GB",{
  day:"2-digit",month:"2-digit",year:"numeric"
 }).format(d);
}

function prettyDate(d){
 return new Intl.DateTimeFormat("en-GB",{
  day:"2-digit",month:"2-digit",year:"numeric"
 }).format(d);
}

function replaceDate(s){
 return (s||"")
  .replaceAll("{{DATE}}",formatDate(dateValue()))
  .replaceAll("{{NAME}}","there");
}

function escapeHTML(s){
 return String(s??"").replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 }[c]));
}

function render(){
 const query=$("searchInput").value.trim().toLowerCase();
 const isW2=currentView==="workspace2";
 const list=currentView==="drafts"?drafts:templates;

 $("workspace2Panel").hidden=!isW2;
 $("mailDateRow").hidden=isW2;
 $("mailDateNote").hidden=isW2;
 $("templateGrid").hidden=isW2;
 $("emptyState").hidden=isW2;

 if(isW2){
  $("libraryPanel").hidden=true;
  $("draftsHeading").hidden=true;
  $("pageTitle").textContent="Your sheet names, ready to use.";
  renderSheets();
  return;
 }

 $("templateGrid").innerHTML="";
 $("libraryPanel").hidden=currentView==="drafts";
 $("draftsHeading").hidden=currentView!=="drafts";

 $("pageTitle").textContent=currentView==="drafts"
  ?"Your drafts, ready to continue."
  :"Ready when you are.";

 $("templateCount").textContent=templates.length;
 $("readyCount").textContent=templates.length;

 let shown=list.filter(t=>
  [t.title,t.subtitle,t.subject,t.to].join(" ").toLowerCase().includes(query)
 );

 shown.forEach((t,index)=>{
  const card=document.createElement("article");
  card.className="template-card";

  const subtitle=t.subtitle||"Email template";

  card.innerHTML=`
   <div class="card-top">
    <span class="ready">
     <span class="number">${String(index+1).padStart(2,"0")}</span> READY
    </span>
    <button class="icon-button edit-btn" title="Edit template" aria-label="Edit template">✎</button>
   </div>
   <h3>${escapeHTML(t.title)}</h3>
   <div class="card-subtitle">${escapeHTML(replaceDate(subtitle))}</div>
   <p class="card-excerpt">${escapeHTML(replaceDate(t.body).replace(/\n/g," "))}</p>
   <div class="card-meta">
    <span class="recipient">${escapeHTML(formatRecipients(t.to)||"No recipient added")} · ${t.cc?"CC added":"No CC"}</span>
    <span>Date-aware</span>
   </div>
   <div class="card-actions">
    <button class="primary-button preview-btn">Preview ↗</button>
    <button class="secondary-button compose-btn">➤ &nbsp; Compose</button>
   </div>
  `;

  card.querySelector(".edit-btn").onclick=()=>openEdit(t.id);
  card.querySelector(".preview-btn").onclick=()=>openPreview(t.id);
  card.querySelector(".compose-btn").onclick=()=>compose(t.id);

  $("templateGrid").appendChild(card);
 });

 $("emptyState").hidden=shown.length!==0;
 $("emptyState").textContent=currentView==="drafts"
  ?"No saved drafts yet."
  :"No matching templates found. Try another search.";
}

function showToast(msg){
 const el=$("toast");
 el.textContent=msg;
 el.classList.add("show");
 setTimeout(()=>el.classList.remove("show"),2200);
}

function openModal(){
 $("modalBackdrop").hidden=false;
 document.body.style.overflow="hidden";
}

function closeModal(){
 $("modalBackdrop").hidden=true;
 document.body.style.overflow="";
}

function openEdit(id){
 activeId=id;
 const t=templates.find(x=>x.id===id);
 if(!t)return;

 modalMode="edit";
 $("modalKicker").textContent="TEMPLATE DETAILS";
 $("modalTitle").textContent="Edit template";
 $("editFields").hidden=false;
 $("previewFields").hidden=true;

 $("editTitle").value=t.title;
 renderRecipientInputs("to",getEmailList(t.to));
 renderRecipientInputs("cc",getEmailList(t.cc));
 renderRecipientInputs("bcc",getEmailList(t.bcc));
 $("editSubject").value=t.subject||"";
 $("editBody").value=t.body||"";

 openModal();
}

function openPreview(id){
 activeId=id;
 const t=templates.find(x=>x.id===id);
 if(!t)return;

 modalMode="preview";
 $("modalKicker").textContent="MESSAGE PREVIEW";
 $("modalTitle").textContent=t.title;
 $("editFields").hidden=true;
 $("previewFields").hidden=false;

 $("previewTo").textContent=formatRecipients(t.to)||"Not specified — add recipient in Gmail";
 $("previewCc").textContent=formatRecipients(t.cc)||"—";
 $("previewBcc").textContent=formatRecipients(t.bcc)||"—";
 $("previewSubject").textContent=replaceDate(t.subject);
 $("previewBody").textContent=replaceDate(t.body);

 openModal();
}

function saveEdit(){
 const t=templates.find(x=>x.id===activeId);
 if(!t)return;

 t.title=$("editTitle").value.trim()||"Untitled template";
 t.to=collectRecipientEmails("to").join(", ");
 t.cc=collectRecipientEmails("cc").join(", ");
 t.bcc=collectRecipientEmails("bcc").join(", ");
 t.subject=$("editSubject").value;
 t.body=$("editBody").value;

 saveTemplates();
 render();
 closeModal();
 showToast("Template saved in this browser.");
}

function compose(id){
 const t=templates.find(x=>x.id===id)||drafts.find(x=>x.id===id);
 if(!t)return;

 const params=new URLSearchParams();

 if(t.to)params.set("to",formatRecipients(t.to));
 if(t.cc)params.set("cc",formatRecipients(t.cc));
 if(t.bcc)params.set("bcc",formatRecipients(t.bcc));

 params.set("su",replaceDate(t.subject));
 params.set("body",replaceDate(t.body));

 const url="https://mail.google.com/mail/?view=cm&fs=1&"+params.toString();

 const win=window.open(url,"_blank","noopener,noreferrer");

 if(!win){
  showToast("Chrome blocked the new tab. Allow pop-ups and try again.");
  return;
 }

 drafts.unshift({...t,id:Date.now(),savedAt:new Date().toISOString()});
 drafts=drafts.slice(0,30);

 localStorage.setItem("lakshmanMailDrafts",JSON.stringify(drafts));
 showToast("Gmail opened in a new tab.");
}

/* WORKSPACE 2 */

function renderSheets(){
 const host=$("sheetList");
 host.innerHTML="";

 $("sheetCount").textContent=`${sheets.length} sheet names`;

 sheets.forEach(s=>{
  const item=document.createElement("div");
  item.className="sheet-item";

  const check=document.createElement("input");
  check.type="checkbox";
  check.checked=!!s.checked;
  check.setAttribute("aria-label","Select "+s.name);

  check.onchange=()=>{
   s.checked=check.checked;
   saveSheets();
  };

  const name=document.createElement("span");
  name.className="sheet-name";
  name.textContent=s.name;

  const actions=document.createElement("div");
  actions.className="sheet-actions";

  const copy=document.createElement("button");
  copy.textContent="Copy";

  copy.onclick=async()=>{
   try{
    await navigator.clipboard.writeText(s.name);
    showToast("Sheet name copied.");
   }catch{
    const t=document.createElement("textarea");
    t.value=s.name;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
    showToast("Sheet name copied.");
   }
  };

  const edit=document.createElement("button");
  edit.textContent="Edit";

  edit.onclick=()=>{
   const next=prompt("Edit sheet name:",s.name);
   if(next!==null&&next.trim()){
    s.name=next.trim();
    saveSheets();
    renderSheets();
   }
  };

  const del=document.createElement("button");
  del.textContent="Delete";

  del.onclick=()=>{
   if(confirm(`Delete ${s.name}?`)){
    sheets=sheets.filter(x=>x.id!==s.id);
    saveSheets();
    renderSheets();
   }
  };

  actions.append(copy,edit,del);
  item.append(check,name,actions);
  host.appendChild(item);
 });
}

function addSheet(){
 const name=prompt("Enter new sheet name:");
 if(!name||!name.trim())return;

 const id=sheets.reduce((m,s)=>Math.max(m,Number(s.id)||0),0)+1;

 sheets.push({
  id,
  name:name.trim(),
  checked:false
 });

 saveSheets();
 renderSheets();
}

function clearAllSheets(){
 sheets.forEach(s=>s.checked=false);
 saveSheets();
 renderSheets();
}

function updateW2Date(){
 const today=new Date();
 const tomorrow=new Date();
 tomorrow.setDate(today.getDate()+1);

 const val=w2SelectedDate==="tomorrow"
  ?tomorrow
  :w2SelectedDate==="custom"&&$("w2CustomDate").value
   ?new Date($("w2CustomDate").value+"T12:00:00")
   :today;

 $("w2TodayLabel").textContent=prettyDate(today);
 $("w2TomorrowLabel").textContent=prettyDate(tomorrow);
 $("w2ActiveDateLabel").textContent=formatDate(val);
}

/* DATE CONTROLS */

function updateDateButtons(){
 const today=new Date();
 const tomorrow=new Date();
 tomorrow.setDate(today.getDate()+1);

 $("todayLabel").textContent=prettyDate(today);
 $("tomorrowLabel").textContent=prettyDate(tomorrow);
 $("activeDateLabel").textContent=formatDate(dateValue());
}

document.querySelectorAll("[data-date]").forEach(btn=>{
 btn.addEventListener("click",()=>{
  selectedDate=btn.dataset.date;

  document.querySelectorAll("[data-date]").forEach(b=>
   b.classList.toggle("selected",b===btn)
  );

  updateDateButtons();
  render();
 });
});

$("customDate").addEventListener("change",e=>{
 if(e.target.value){
  selectedDate="custom";
  document.querySelectorAll("[data-date]").forEach(b=>b.classList.remove("selected"));
  updateDateButtons();
  render();
 }
});

$("searchInput").addEventListener("input",render);

/* MODAL BUTTONS */

$("saveEdit").onclick=saveEdit;
$("cancelEdit").onclick=closeModal;
$("closeModal").onclick=closeModal;

$("modalBackdrop").addEventListener("click",e=>{
 if(e.target===$("modalBackdrop"))closeModal();
});

$("previewEdit").onclick=()=>openEdit(activeId);

$("previewCompose").onclick=()=>{
 const id=activeId;
 closeModal();
 compose(id);
};

/* MULTIPLE RECIPIENTS */

document.querySelectorAll("[data-add-recipient]").forEach(b=>{
 b.addEventListener("click",()=>{
  addRecipientInput(b.dataset.addRecipient);
 });
});

/* WORKSPACE 2 DATE */

document.querySelectorAll("[data-w2-date]").forEach(b=>{
 b.addEventListener("click",()=>{
  w2SelectedDate=b.dataset.w2Date;

  document.querySelectorAll("[data-w2-date]").forEach(x=>
   x.classList.toggle("selected",x===b)
  );

  updateW2Date();
 });
});

$("w2CustomDate").addEventListener("change",e=>{
 if(e.target.value){
  w2SelectedDate="custom";
  document.querySelectorAll("[data-w2-date]").forEach(x=>x.classList.remove("selected"));
  updateW2Date();
 }
});

/* WORKSPACE 2 BUTTONS */

$("clearAllSheets").onclick=clearAllSheets;
$("addSheetButton").onclick=addSheet;

/* SIDEBAR NAVIGATION */

function switchView(view){
 currentView=view;

 document.querySelectorAll(".nav-item").forEach(b=>
  b.classList.toggle("active",b.dataset.view===view)
 );

 $("searchInput").value="";
 render();
 $("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-item").forEach(b=>{
 b.addEventListener("click",()=>{
  switchView(b.dataset.view);
 });
});

$("menuButton").onclick=()=>$("sidebar").classList.toggle("open");

document.addEventListener("keydown",e=>{
 if(e.key==="Escape")closeModal();
});

/* START WEBSITE */

updateDateButtons();
updateW2Date();
render();
   
