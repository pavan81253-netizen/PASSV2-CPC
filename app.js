// ----------------------
// Global variables
// ----------------------
let questions = [];
let index = 0;
let score = 0;
let timeLeft = 14400; // 4 hours (in seconds)
let timer;

// ----------------------
// Firebase configuration
// ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAsQUSQIkwYpMe_t1P5DHcRvh93b1hHh4",
  authDomain: "passv2-assessment-app-484cc.firebaseapp.com",
  projectId: "passv2-assessment-app-484cc",
  storageBucket: "passv2-assessment-app-484cc.firebasestorage.app",
  messagingSenderId: "814919410709",
  appId: "1:814919410709:web:017f29a9088e69c37c9a1c",
  measurementId: "G-69EDH4FLBL",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ----------------------
// User Authentication
// ----------------------
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Account created! Please log in now.");
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("login").style.display = "none";
    document.getElementById("quiz").style.display = "block";

    questions = await loadExamQuestions();
    if (questions.length > 0) {
      startQuiz();
    } else {
      alert("No questions found. Please check exam1.json file.");
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// ----------------------
// Load Exam Questions from JSON
// ----------------------
async function loadExamQuestions() {
  try {
    const response = await fetch("exam1.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading exam1.json:", error);
    alert("Error loading exam1.json file. Please check path.");
    return [];
  }
}

// ----------------------
// Start Quiz & Timer
// ----------------------
function startQuiz() {
  index = 0;
  score = 0;
  timeLeft = 14400; // reset timer

  timer = setInterval(() => {
    timeLeft--;
    let hours = Math.floor(timeLeft / 3600);
    let minutes = Math.floor((timeLeft % 3600) / 60);
    let seconds = timeLeft % 60;
    document.getElementById("timer").innerText = `⏰ Time left: ${hours}h ${minutes}m ${seconds}s`;
    if (timeLeft <= 0) finishQuiz();
  }, 1000);

  showQuestion();
}

// ----------------------
// Show Question
// ----------------------
function showQuestion() {
  if (index >= questions.length) {
    finishQuiz();
    return;
  }

  let q = questions[index];
  document.getElementById("question").innerText = q.q;

  let optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, i) => {
    let btn = document.createElement("button");
    btn.innerText = opt;
    btn.className = "option-btn";
    btn.onclick = () => checkAnswer(i);
    optionsDiv.appendChild(btn);
  });

  document.getElementById("progress").innerText = `Question ${index + 1} of ${questions.length}`;
}

// ----------------------
// Check Answer
// ----------------------
function checkAnswer(selected) {
  if (selected === questions[index].answer) {
    score++;
  }
  index++;
  showQuestion();
}

// ----------------------
// Finish Quiz
// ----------------------
function finishQuiz() {
  clearInterval(timer);
  document.getElementById("quiz").innerHTML = `
    <h2>🎯 Exam Completed!</h2>
    <h3>Your Score: ${score} / ${questions.length}</h3>
    <button onclick="reviewAnswers()">🔍 Review Answers</button>
  `;
}

// ----------------------
// Review Answers
// ----------------------
function reviewAnswers() {
  let reviewHTML = "<h2>📋 Review Answers</h2>";
  questions.forEach((q, i) => {
    reviewHTML += `
      <div class='review'>
        <p><strong>Q${i + 1}:</strong> ${q.q}</p>
        <p>✅ Correct Answer: ${q.options[q.answer]}</p>
        <hr>
      </div>
    `;
  });
  document.getElementById("quiz").innerHTML = reviewHTML;
}

window.signup = signup;
window.login = login;
