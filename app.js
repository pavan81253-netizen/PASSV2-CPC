// ----------------------
// app.js — PASSV2 Assessment
// ----------------------
// NOTE: This is an ES module. index.html loads it with <script type="module">.

// ---------- Firebase imports (CDN modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ---------- Firebase config (replace if needed) - using your project values
const firebaseConfig = {
  apiKey: "AIzaSyDAsQUSQIkwYpMe_t1P5DHcRvh93b1hHh4",
  authDomain: "passv2-assessment-app-484cc.firebaseapp.com",
  projectId: "passv2-assessment-app-484cc",
  storageBucket: "passv2-assessment-app-484cc.firebasestorage.app",
  messagingSenderId: "814919410709",
  appId: "1:814919410709:web:017f29a9088e69c37c9a1c",
  measurementId: "G-69EDH4FLBL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ---------- App state
let questions = [];      // loaded exam questions (array of objects)
let currentIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 14400;    // 4 hours default in seconds

// ---------- DOM helpers
const el = id => document.getElementById(id);

// ---------- Authentication functions
export async function signup() {
  const email = el('email').value.trim();
  const password = el('password').value;
  if (!email || !password) { alert('Enter email and password'); return; }
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert('Account created — please login.');
  } catch (err) {
    alert('Signup error: ' + (err.message || err));
  }
}
window.signup = signup;

export async function login() {
  const email = el('email').value.trim();
  const password = el('password').value;
  if (!email || !password) { alert('Enter email and password'); return; }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // hide login area and let user start exam
    el('login').style.display = 'block'; // keep visible so they can select exam
    alert('Login successful — choose an exam and click Start Selected Exam');
  } catch (err) {
    alert('Login failed: ' + (err.message || err));
  }
}
window.login = login;

// ---------- Start selected exam (called from dropdown button)
window.startSelectedExam = async function() {
  // Ensure user is logged in
  if (!auth.currentUser) {
    alert('Please login first.');
    return;
  }

  const examFile = el('examSelect').value; // e.g., "exam1.json"
  await loadExamFile(examFile);
};

// ---------- Load exam JSON from file (same folder)
async function loadExamFile(filename) {
  try {
    // show a quick loading state
    el('question').innerText = 'Loading exam... please wait';
    el('options').innerHTML = '';
    // fetch JSON
    const res = await fetch(filename);
    if (!res.ok) throw new Error('Failed to load ' + filename + ' (status ' + res.status + ')');
    const data = await res.json();
    // Validate shape: should be array of { q, options, answer }
    if (!Array.isArray(data) || data.length === 0) throw new Error('Exam JSON is empty or invalid');
    questions = data;
    currentIndex = 0;
    score = 0;
    timeLeft = 14400; // reset 4 hours
    startTimer();
    renderQuestion();
    el('quiz').style.display = 'block';
    el('result').innerHTML = '';
    // Save which exam is active in sessionStorage
    sessionStorage.setItem('activeExamFile', filename);
  } catch (err) {
    alert('Error loading exam: ' + (err.message || err));
    // hide quiz
    el('quiz').style.display = 'none';
  }
}

// ---------- Timer
function startTimer() {
  // Clear any existing timer first
  if (timer) clearInterval(timer);
  updateTimerDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      finishQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  el('timer').innerText = `⏳ Time left: ${hours}h ${minutes}m ${seconds}s`;
}

// ---------- Render question
function renderQuestion() {
  if (!questions || questions.length === 0) {
    el('question').innerText = 'No questions loaded.';
    el('options').innerHTML = '';
    return;
  }
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= questions.length) return finishQuiz();

  const q = questions[currentIndex];
  el('question').innerText = `Q${currentIndex + 1}. ${q.q || 'Question text missing'}`;
  const opts = q.options || [];
  const optionsDiv = el('options');
  optionsDiv.innerHTML = '';
  opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.innerText = `${String.fromCharCode(65 + i)}. ${opt}`;
    btn.onclick = () => { handleAnswer(i); };
    optionsDiv.appendChild(btn);
  });
}

// ---------- Handle answer chosen
function handleAnswer(selectedIndex) {
  const q = questions[currentIndex];
  const correct = Number(q.answer);
  if (selectedIndex === correct) score++;
  // mark answered (optional), then move next
  currentIndex++;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
}

// ---------- Prev / Next navigation
window.prevQuestion = function() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
};

window.nextQuestion = function() {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    finishQuiz();
  }
};

// ---------- Finish quiz and show summary
function finishQuiz() {
  if (timer) { clearInterval(timer); timer = null; }
  // Show score summary
  el('result').innerHTML = `
    <div style="font-weight:600; margin-top:12px;">✅ Test finished</div>
    <div>Score: <strong>${score}</strong> / ${questions.length}</div>
    <div class="small">You can retake the exam by selecting it and clicking "Start Selected Exam" again.</div>
  `;
  // Optionally save result to localStorage or Firestore in future
  // hide questions
  el('options').innerHTML = '';
  el('question').innerText = 'Test completed';
}

// ---------- On load: if a session active, try to restore (optional)
(function restoreActiveExam() {
  const file = sessionStorage.getItem('activeExamFile');
  if (file) {
    // do not auto-start — just remember selection
    const select = el('examSelect');
    if (select) {
      for (let i=0;i<select.options.length;i++){
        if (select.options[i].value === file) select.selectedIndex = i;
      }
    }
  }
})();
