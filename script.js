/* =====================================================
   SPACE WEEK 2026 — script.js
   A single-mission activity. Nothing is saved or tracked:
   refresh the page and the mission starts again.
     1. SCREEN MANAGER  – moving between screens
     2. HELPERS         – small tools used everywhere
     3. MISSION ENGINE  – plays the steps from missions.js
     4. START-UP        – connects buttons to code
   ===================================================== */

/* ---------- 1. SCREEN MANAGER ---------- */
// Each screen in index.html is <section class="screen" id="screen-NAME">.
// showScreen("hub") fades out the current screen and fades in #screen-hub.

const TRANSITION_MS = 600; // must match screen-out animation in style.css

function showScreen(name) {
  const current = document.querySelector(".screen.is-active");
  const next = document.getElementById("screen-" + name);
  if (!next || current === next) return;

  current.classList.add("is-leaving");

  setTimeout(() => {
    current.classList.remove("is-active", "is-leaving");
    current.hidden = true;

    next.hidden = false;
    next.classList.add("is-active", "is-entering");
    window.scrollTo(0, 0);
    setTimeout(() => next.classList.remove("is-entering"), 800);

    // Move keyboard focus to the new screen's heading (helps screen readers)
    const heading = next.querySelector("h1, h2");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
  }, TRANSITION_MS);
}


/* ---------- 2. HELPERS ---------- */

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// el("p", "my-class", "text") creates <p class="my-class">text</p>
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Counts a number up on screen (XP animation)
function animateNumber(node, from, to) {
  if (prefersReducedMotion || from === to) { node.textContent = to; return; }
  const start = performance.now();
  const duration = 1000;
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    node.textContent = Math.round(from + (to - from) * t);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Small "+100 XP" message
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.remove("toast--show");
  void toast.offsetWidth;            // restarts the animation
  toast.classList.add("toast--show");
}


/* ---------- 3. MISSION ENGINE ----------
   Plays MISSION.steps (from missions.js) one step at a time. */

let run = null;          // { stepIndex, xp }
let renderToken = 0;     // stops old typing animations if the player leaves early

function startMission() {
  run = { stepIndex: 0, xp: 0 };
  $("mission-title").textContent = MISSION.title;
  $("mission-xp").textContent = "0";
  renderStep();
  showScreen("mission");
}

function renderStep() {
  const stage = $("mission-stage");
  const token = ++renderToken;
  stage.innerHTML = "";
  stage.classList.remove("stage--in");
  void stage.offsetWidth;
  stage.classList.add("stage--in");

  const step = MISSION.steps[run.stepIndex];
  if (!step) return renderComplete(stage);

  if (step.type === "briefing") renderBriefing(stage, step, token);
  if (step.type === "decision") renderDecision(stage, step);
  if (step.type === "decode")   renderDecode(stage, step);
}

function nextStep() { run.stepIndex++; renderStep(); }

// XP is just for the feel of the game. It is not saved anywhere.
function earnXp(amount) {
  run.xp += amount;
  $("mission-xp").textContent = run.xp;
  showToast("+" + amount + " XP");
}

function makeButton(text, onClick, extraClass) {
  const button = el("button", "btn " + (extraClass || "btn--primary"), text);
  button.type = "button";
  button.addEventListener("click", () => { onClick(); });
  return button;
}

function makeAlert(kind, title, message) {
  const box = el("div", "alert alert--" + kind);
  box.append(el("p", "alert__title", title));
  if (message) box.append(el("p", "alert__text", message));
  return box;
}

// Types text one letter at a time (instant if the player prefers reduced motion)
async function typeLines(container, lines, token) {
  for (const line of lines) {
    const paragraph = el("p", "tx");
    container.appendChild(paragraph);
    if (prefersReducedMotion) { paragraph.textContent = line; continue; }
    for (let i = 1; i <= line.length; i++) {
      if (token !== renderToken) return false;     // player left; stop
      paragraph.textContent = line.slice(0, i);
      await wait(14);
    }
    await wait(250);
  }
  return token === renderToken;
}

/* ----- Step type: briefing ----- */
async function renderBriefing(stage, step, token) {
  stage.append(el("p", "transmission", "● " + step.heading));
  const textBox = el("div");
  stage.appendChild(textBox);
  if (!(await typeLines(textBox, step.lines, token))) return;

  const objective = el("p", "objective");
  objective.append(el("span", "objective__label", "MISSION OBJECTIVE"), document.createElement("br"), step.objective);
  const button = makeButton(step.button, () => { earnXp(step.xp); nextStep(); });
  stage.append(objective, button);
  button.focus({ preventScroll: true });
}

/* ----- Step type: decision (telemetry/clue + choices) ----- */
function renderDecision(stage, step) {
  if (step.telemetry) {
    const panel = el("dl", "telemetry");
    step.telemetry.forEach((row) => {
      const line = el("div", "telemetry__row");
      line.append(el("dt", "", row.label), el("dd", "", row.icon + " " + row.status));   // icon AND word
      panel.appendChild(line);
    });
    stage.appendChild(panel);
  }
  if (step.clue) {
    const clueBox = el("div", "clue");
    step.clue.forEach((line) => clueBox.appendChild(el("p", "", line)));
    stage.appendChild(clueBox);
  }
  stage.appendChild(el("h3", "question", step.question));

  const choices = el("div", "choices");
  const feedback = el("div");
  stage.append(choices, feedback);

  step.options.forEach((option) => {
    const button = el("button", "choice", option.text);
    button.type = "button";
    button.addEventListener("click", () => {
      choices.hidden = true;
      feedback.innerHTML = "";
      if (option.correct) {
        earnXp(step.xp);
        feedback.append(makeAlert("good", step.goodCall, "+" + step.xp + " XP"));
        const next = makeButton("CONTINUE", nextStep);
        feedback.appendChild(next);
        next.focus({ preventScroll: true });
      } else {
        feedback.append(makeAlert("warn", "MISSION CONTROL WARNING",
          step.warning || "The selected system is currently operating within normal parameters. Review the telemetry and try again."));
        const retry = makeButton("REASSESS", () => { feedback.innerHTML = ""; choices.hidden = false; choices.querySelector("button").focus(); }, "btn--ghost");
        feedback.appendChild(retry);
        retry.focus({ preventScroll: true });
      }
    });
    choices.appendChild(button);
  });
}

/* ----- Step type: decode (typed answer, keyword matching) ----- */
function renderDecode(stage, step) {
  let attempts = 0;
  stage.append(el("p", "transmission", "● " + step.heading), el("p", "", step.instruction), el("p", "cipher", step.cipher));
  stage.appendChild(el("h3", "question", step.question));

  const field = el("div", "field");
  const label = el("label", "", "YOUR ANSWER");
  label.htmlFor = "decode-answer";
  const input = el("input");
  input.type = "text"; input.id = "decode-answer"; input.maxLength = 120; input.autocomplete = "off";
  const feedback = el("div");
  field.append(label, input);
  stage.append(field, feedback);

  function submit() {
    const answer = input.value.trim().toLowerCase();
    feedback.innerHTML = "";
    if (answer && step.keywords.some((word) => answer.includes(word))) {   // simple keyword matching
      earnXp(step.xp);
      input.disabled = true;
      sendButton.hidden = true;
      feedback.append(makeAlert("good", "TRANSMISSION DECODED", "Message: " + step.plaintext + "  |  +" + step.xp + " XP"));
      const next = makeButton("CONTINUE", nextStep);
      feedback.appendChild(next);
      next.focus({ preventScroll: true });
    } else {
      attempts++;
      const extra = attempts >= 2 ? " Decoded message: " + step.plaintext : "";
      feedback.append(makeAlert("warn", "TRANSMISSION NOT UNDERSTOOD", step.hint + extra));
      input.focus();
    }
  }
  const sendButton = makeButton("TRANSMIT ANSWER", submit);
  stage.appendChild(sendButton);
  input.addEventListener("keydown", (event) => { if (event.key === "Enter") submit(); });
}

/* ----- Mission complete ----- */
function renderComplete(stage) {
  earnXp(MISSION.completionXp);

  const total = el("p", "complete__xp");
  const totalNumber = el("span");
  total.append("+", totalNumber, " XP");
  animateNumber(totalNumber, 0, run.xp);

  stage.append(
    el("p", "complete__icon", MISSION.icon),
    el("h3", "complete__title", "MISSION COMPLETE"),
    el("p", "complete__line", MISSION.completeLine),
    total
  );

  if (MISSION.recap && MISSION.recap.length) {
    const recap = el("div", "recap");
    recap.append(el("p", "recap__title", "WHAT YOU LEARNED"));
    const list = el("ul");
    MISSION.recap.forEach((point) => list.appendChild(el("li", "", point)));
    recap.appendChild(list);
    stage.appendChild(recap);
  }

  stage.append(
    el("p", "complete__line", "MISSION 01 COMPLETE"),
    el("p", "complete__center", "Your journey continues."),
    makeButton("PLAY AGAIN", backToStart, "btn--ghost")
  );
}

function backToStart() {
  renderToken++;                // cancel any typing in progress
  showScreen("landing");
}


/* ---------- 4. START-UP ---------- */

$("enter-btn").addEventListener("click", startMission);
$("exit-mission-btn").addEventListener("click", backToStart);
