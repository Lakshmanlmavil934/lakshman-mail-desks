
:root {
  --ink: #203b43;
  --muted: #718187;
  --teal: #0d6872;
  --teal2: #0b5660;
  --cream: #f7f5ef;
  --paper: #fffefa;
  --line: #e7e4dc;
  --gold: #c49a4b;
  --pale: #f4eddb;
  --shadow: 0 8px 24px #233d4310;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--cream);
  color: var(--ink);
  font: 14px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.topbar {
  height: 42px;
  background: #0b5963;
  color: #d9eff0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  font-size: 11px;
}

.topbar span:last-child {
  opacity: .75;
}

.app {
  min-height: 100vh;
}

.brandbar {
  height: 68px;
  background: #104f59;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 max(20px, calc((100vw - 1180px)/2));
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: Georgia, serif;
  font-size: 21px;
}

.brandmark {
  width: 38px;
  height: 38px;
  border-radius: 13px;
  background: #f3d991;
  color: #75551e;
  display: grid;
  place-items: center;
  font: 700 17px Georgia;
}

.brand small {
  display: block;
  font: 9px/1.4 ui-monospace, monospace;
  letter-spacing: 2px;
  color: #b9d5d5;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav button {
  border: 1px solid #ffffff30;
  background: transparent;
  color: #d9eeee;
  padding: 9px 16px;
  border-radius: 22px;
  font-size: 12px;
}

.nav button.active {
  background: #ffffff20;
  border-color: #ffffff55;
  color: #fff;
}

main {
  max-width: 1180px;
  margin: auto;
  padding: 26px 22px 60px;
}

.eyebrow {
  font: 10px ui-monospace, monospace;
  letter-spacing: 2px;
  color: #64858a;
  text-transform: uppercase;
}

h1 {
  font: 500 clamp(30px, 4vw, 43px)/1.08 Georgia, serif;
  letter-spacing: -1.3px;
  margin: 9px 0 12px;
  color: #203b43;
}

h1 em {
  font-style: normal;
  color: #9ba9a8;
}

.sub {
  color: var(--muted);
  font-size: 13px;
  max-width: 650px;
  margin: 0 0 22px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 14px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin: 22px 0;
}

.toolbar label {
  font-size: 12px;
  font-weight: 600;
}

.toolbar .datehint {
  font-size: 11px;
  color: var(--muted);
}

.pill {
  border: 1px solid var(--line);
  background: #fffefa;
  border-radius: 20px;
  padding: 8px 13px;
  color: #53666b;
  font-size: 11px;
}

.pill.active {
  background: #174c55;
  color: white;
  border-color: #174c55;
}

.datepick {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.panel {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 24px;
  margin: 18px 0;
}

.panelhead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.panel h2 {
  font: 500 26px/1.12 Georgia, serif;
  margin: 5px 0 7px;
}

.panel p {
  color: var(--muted);
  font-size: 12px;
  margin: 0;
}

.search {
  width: min(100%, 480px);
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #faf8f2;
  margin-top: 20px;
  outline-color: #4c9298;
}

.meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  color: #78878a;
  font-size: 11px;
  margin-top: 17px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.mailcard {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 17px;
  box-shadow: var(--shadow);
  min-width: 0;
}

.cardtop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #7b9295;
  font: 9px ui-monospace, monospace;
  letter-spacing: 1.5px;
}

.edit {
  border: 0;
  background: transparent;
  color: #647d81;
  font-size: 16px;
}

.mailcard h3 {
  font: 500 20px/1.15 Georgia, serif;
  margin: 17px 0 6px;
}

.mailcard .desc {
  font-size: 11px;
  color: #276a72;
  margin-bottom: 9px;
}

.snippet {
  font-size: 11px;
  color: #728187;
  min-height: 34px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cardfoot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid var(--line);
  padding-top: 12px;
  margin-top: 14px;
  color: #859194;
  font: 9px ui-monospace, monospace;
}

.actions {
  display: flex;
  gap: 7px;
  margin-top: 12px;
}

.btn {
  border: 1px solid var(--line);
  background: #fffefa;
  color: #314c52;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 11px;
}

.btn.primary {
  background: #0d6872;
  color: white;
  border-color: #0d6872;
}

.btn:hover {
  filter: brightness(.96);
}

.hidden {
  display: none !important;
}

.backup-intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.count {
  background: #f1eddf;
  border-radius: 20px;
  padding: 5px 10px;
  font: 11px ui-monospace, monospace;
  color: #77683f;
}

.sheetlist {
  margin-top: 18px;
  border: 1px solid var(--line);
  border-radius: 15px;
  overflow: hidden;
  background: #fffefa;
}

.sheethead,
.sheetrow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 104px 145px;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
}

.sheethead {
  background: #f8f5ed;
  color: #7b8584;
  font: 9px ui-monospace, monospace;
  letter-spacing: 1.3px;
}

.sheetrow {
  border-top: 1px solid #eeeae2;
  min-height: 56px;
}

.sheetname {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.sheeticon {
  width: 29px;
  height: 29px;
  flex: 0 0 29px;
  border-radius: 9px;
  background: #f8f0dc;
  color: #a57b30;
  display: grid;
  place-items: center;
}

.sheettitle {
  min-width: 0;
}

.sheettitle strong {
  font-size: 12px;
  font-weight: 600;
}

.sheettitle small {
  display: block;
  color: #879294;
  font: 9px ui-monospace, monospace;
}

.editname {
  border: 0;
  background: transparent;
  color: #688287;
  margin-left: 5px;
}

.copybtn {
  white-space: nowrap;
  padding: 7px 9px;
}

.status {
  font-size: 11px;
  color: #64777b;
  display: flex;
  align-items: center;
  gap: 7px;
}

.status input {
  accent-color: #0d6872;
  width: 15px;
  height: 15px;
}

.empty {
  padding: 30px;
  text-align: center;
  color: #829094;
}

footer {
  text-align: center;
  color: #8b9898;
  font-size: 10px;
  padding: 25px;
}

.modalback {
  position: fixed;
  inset: 0;
  background: #142b30a8;
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 5;
}

.modal {
  width: min(600px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #fffefa;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 20px 70px #0004;
}

.modal h2 {
  font: 26px Georgia, serif;
  margin: 0 0 15px;
}

.modal label {
  display: block;
  font-size: 11px;
  color: #6b7d80;
  margin: 12px 0 5px;
}

.modal input,
.modal textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: #fcfaf5;
  color: var(--ink);
}

.modal textarea {
  min-height: 170px;
  resize: vertical;
}

.modalactions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.toast {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  background: #173f46;
  color: white;
  padding: 10px 16px;
  border-radius: 24px;
  font-size: 12px;
  opacity: 0;
  pointer-events: none;
  transition: .2s;
  z-index: 9;
}

.toast.show {
  opacity: 1;
}

@media(max-width:700px) {
  .brandbar {
    height: auto;
    min-height: 70px;
    padding: 12px 15px;
    gap: 10px;
    flex-wrap: wrap;
  }

  .brand {
    font-size: 18px;
  }

  .nav {
    width: 100%;
  }

  .nav button {
    flex: 1;
    padding: 9px 7px;
  }

  main {
    padding: 22px 14px 45px;
  }

  .panel {
    padding: 18px;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .datepick {
    margin-left: 0;
    width: 100%;
  }

  .sheethead,
  .sheetrow {
    grid-template-columns: minmax(0, 1fr) 85px 105px;
    gap: 7px;
    padding: 10px 8px;
  }

  .sheettitle strong {
    font-size: 11px;
  }

  .status {
    font-size: 10px;
  }

  .copybtn {
    font-size: 10px;
    padding: 7px 6px;
  }

  .sheeticon {
    display: none;
  }

  .sheetname {
    gap: 0;
  }
}

/* Multiple To / CC fields; original visual design is preserved */

.recipient-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
}

.recipient-heading label {
  margin: 0;
}

.add-recipient {
  border: 1px solid var(--line);
  background: #f8f5ed;
  color: #31565c;
  border-radius: 9px;
  padding: 6px 10px;
  font-size: 11px;
}

.add-recipient:hover {
  background: #eee8d9;
}

.recipient-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 7px;
}

.recipient-row input {
  flex: 1;
  min-width: 0;
}

.remove-recipient {
  border: 1px solid #eadbd5;
  background: #fff7f4;
  color: #995b4b;
  border-radius: 9px;
  padding: 8px 10px;
  font-size: 11px;
}

.remove-recipient:hover {
  background: #f7e8e2;
}
