// ----------------------
// Global variables
// ----------------------
let questions = [];    // will be filled dynamically from Gemini
let index = 0;         // current question index
let score = 0;         // user score
let timeLeft = 14400;  // 4 hours in seconds
let timer;             // countdown timer

// ----------------------
// Firebase configuration
// ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
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
    alert("Account created! Login now.");
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
    fetchQuestionsFromGemini(); // Fetch chapter 1 questions
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// ----------------------
// Start Quiz & Timer
// ----------------------
function startQuiz() {
  index = 0;
  score = 0;
  timer = setInterval(() => {
    timeLeft--;
    let hours = Math.floor(timeLeft / 3600);
    let minutes = Math.floor((timeLeft % 3600) / 60);
    let seconds = timeLeft % 60;
    document.getElementById("timer").innerText =
      `Time left: ${hours}h ${minutes}m ${seconds}s`;
    if (timeLeft <= 0) finishQuiz();
  }, 1000);

  showQuestion();
}

// ----------------------
// Show Question
// ----------------------
function showQuestion() {
  if (index >= questions.length) return finishQuiz();
  let q = questions[index];
  document.getElementById("question").innerText = q.q;
  let optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options.forEach((opt, i) => {
    let btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(i);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(selected) {
  if (selected === questions[index].answer) score++;
  index++;
  if (index < questions.length) showQuestion();
  else finishQuiz();
}

function finishQuiz() {
  clearInterval(timer);
  document.getElementById("quiz").innerHTML = `<h2>Your Score: ${score}/${questions.length}</h2>`;
}

// ----------------------
// Gemini API Integration
// ----------------------
async function fetchQuestionsFromGemini() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer AIzaSyBIilgDkFBoCCD6xPvowCx2QC8zdbVrNm0"
      },
      body: JSON.stringify({
        "prompt": {
          "text": "Generate 5 CPC exam-style multiple choice questions (chapter 1) with 3 options each. Return JSON array with 'q', 'options', 'answer' index."
        },
        "temperature": 0.7,
        "maxOutputTokens": 500
      })
    });

    const data = await response.json();
    // Example: data.candidates[0].content
    // Parse JSON safely
    questions = JSON.parse(data.candidates[0].content || "[]");
    startQuiz();
  } catch (error) {
    alert("Error fetching questions from Gemini: " + error.message);
  }
}
