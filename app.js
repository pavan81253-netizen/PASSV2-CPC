// ----------------------
// Import Firebase SDK
// ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ----------------------
// Firebase Configuration
// ----------------------
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

// ----------------------
// Global Variables
// ----------------------
let questions = [];
let index = 0;
let score = 0;
let timeLeft = 14400; // 4 hours in seconds
let timer;

// ----------------------
// User Authentication
// ----------------------
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Account created successfully! Please log in.");
  } catch (error) {
    alert("❌ Signup error: " + error.message);
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("login").style.display = "none";
    document.getElementById("quiz").style.display = "block";
    fetchQuestionsFromGemini(); // Load questions dynamically
  } catch (error) {
    alert("❌ Login failed: " + error.message);
  }
}

// ----------------------
// Start Quiz & Timer
// ----------------------
function startQuiz() {
  index = 0;
  score = 0;
  timeLeft = 14400; // Reset 4 hours
  timer = setInterval(() => {
    timeLeft--;
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    document.getElementById("timer").innerText =
      `⏳ Time left: ${hours}h ${minutes}m ${seconds}s`;
    if (timeLeft <= 0) finishQuiz();
  }, 1000);
  showQuestion();
}

// ----------------------
// Show Questions
// ----------------------
function showQuestion() {
  if (index >= questions.length) return finishQuiz();
  const q = questions[index];
  document.getElementById("question").innerText = q.q;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
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
  document.getElementById("quiz").innerHTML = `
    <h2>✅ Quiz Completed</h2>
    <p>Your Score: ${score} / ${questions.length}</p>
  `;
}

// ----------------------
// Fetch Questions from Gemini
// ----------------------
async function fetchQuestionsFromGemini() {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer AIzaSyBIilgDkFBoCCD6xPvowCx2QC8zdbVrNm0"
        },
        body: JSON.stringify({
          prompt: {
            text: "Generate 100 CPC exam-style multiple choice questions (Chapter 1 - Evaluation and Management) with 3 options each and the correct answer index. Format output strictly as JSON array with fields 'q', 'options', and 'answer'."
          },
          temperature: 0.7,
          maxOutputTokens: 2000
        })
      }
    );

    const data = await response.json();
    let text = data?.candidates?.[0]?.output || data?.candidates?.[0]?.content || "[]";

    try {
      questions = JSON.parse(text);
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid question format received");
      }
      startQuiz();
    } catch (err) {
      alert("⚠️ Error parsing Gemini response. Using fallback sample questions.");
      questions = [
        { q: "What is ICD-10-CM?", options: ["Diagnosis coding system", "Procedure code", "Drug name"], answer: 0 },
        { q: "How many chapters are in ICD-10-CM?", options: ["20", "21", "18"], answer: 1 }
      ];
      startQuiz();
    }

  } catch (error) {
    alert("❌ Error fetching questions: " + error.message);
  }
}

// ----------------------
// Expose Functions to HTML
// ----------------------
window.signup = signup;
window.login = login;
