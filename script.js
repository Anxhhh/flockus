const terminal = document.getElementById("terminal");
const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const bootEl = document.getElementById("boot");
const appEl = document.getElementById("app");

/* ---------- FAKE BOOT ---------- */

const bootLines = [
  "initializing focus environment...",
  "checking system integrity...",
  "loading minimal modules...",
  "mounting workspace...",
  "allocating memory...",
  "syncing system clock...",
  "calibrating display output...",
  "verifying input devices...",
  "applying user preferences...",
  "stabilizing session state...",
  "workspace ready.",
  "entering focus mode..."
];

let b = 0;
(function boot() {
  if (b < bootLines.length) {
    bootEl.textContent += bootLines[b++] + "\n";
    setTimeout(boot, 200);
  } else {
    setTimeout(() => {
      bootEl.style.display = "none";
appEl.classList.remove("hidden");
bootFinished = true;
terminalBeep();
wake();

    }, 320);
  }
})();
/* ---------- TERMINAL BEEP (FIXED) ---------- */

let audioCtx = null;
let bootFinished = false;
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioUnlocked = true;

  // If boot already finished, play beep now
  if (bootFinished) {
    terminalBeep();
  }
}

function terminalBeep() {
  if (!audioUnlocked || !audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = 880; // terminal beep
  gain.gain.value = 0.03;   // very soft

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
}
document.addEventListener("keydown", unlockAudio, { once: true });
document.addEventListener("click", unlockAudio, { once: true });

/* ---------- TIME + DATE ---------- */

let lastMinute = null;

function updateTime() {
  const d = new Date();

  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;

  timeEl.textContent = `${h}:${m} ${ampm}`;
  dateEl.textContent = d.toDateString();

  if (m !== lastMinute) {
    timeEl.classList.add("tick");
    setTimeout(() => timeEl.classList.remove("tick"), 250);
    lastMinute = m;
  }
}

setInterval(updateTime, 1000);
updateTime();

/* ---------- BLACK SHADES / BRIGHTNESS ---------- */

const blacks = [
  "#0b0b0b",
  "#0f0f0f",
  "#141414",
  "#1a1a1a",
  "#202020"
];

/* ---------- DIM ---------- */

let dimTimer;
let manualDim = false;

function wake() {
  if (!manualDim) {
    terminal.classList.remove("dim");
    clearTimeout(dimTimer);
    dimTimer = setTimeout(() => terminal.classList.add("dim"), 60000);
  }
}

/* ---------- FULLSCREEN ---------- */

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

/* ---------- KEYS ---------- */

document.addEventListener("keydown", e => {
  if (e.key >= "1" && e.key <= "5") {
    document.documentElement.style.setProperty("--bg", blacks[e.key - 1]);
    localStorage.setItem("theme", blacks[e.key - 1]);
  }

  if (e.key.toLowerCase() === "f") toggleFullscreen();

  if (e.key.toLowerCase() === "d") {
    manualDim = !manualDim;
    terminal.classList.toggle("dim", manualDim);
  }

  wake();
});

["mousemove"].forEach(evt =>
  document.addEventListener(evt, wake)
);

/* ---------- PERSIST THEME ---------- */

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.style.setProperty("--bg", savedTheme);
}
/* ---------- NEGATIVE SELECTION (HARD) ---------- */

// Disable right-click
document.addEventListener("contextmenu", e => {
  e.preventDefault();
});

// Disable copy / cut
document.addEventListener("copy", e => e.preventDefault());
document.addEventListener("cut", e => e.preventDefault());

// Prevent accidental drag
document.addEventListener("dragstart", e => {
  e.preventDefault();
});
