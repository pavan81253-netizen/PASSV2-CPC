// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Firebase config (from your Firebase console)
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

// Replace YOUR_GEMINI_API_KEY_HERE with your actual Gemini API key
const GEMINI_API_KEY = "passv2-gemini-key";

/**
 * Fetches CPC practice questions from Gemini AI for a given chapter
 * Returns an array of questions: [{q:"Question text", options:["opt1","opt2","opt3"], answer:0}]
 */
async function fetchQuestions(chapter = "Chapter 1") {
    const prompt = `Generate 5 multiple-choice CPC practice questions for ${chapter}.
Include question text, 3 options, and correct answer index (0,1,2).
Return JSON like: [{ "q": "Question text", "options": ["opt1","opt2","opt3"], "answer": 0 }]`;

    try {
        const response = await fetch(
            "https://api.generativeai.google/v1beta2/models/text-bison-001:generate",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GEMINI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt: prompt, maxOutputTokens: 500 })
            }
        );

        const data = await response.json();
        // Gemini returns text, so parse JSON from the response text
        return JSON.parse(data.output_text);
    } catch (err) {
        console.error("Error fetching questions from Gemini:", err);
        return [];
    }
}


// SIGN UP function
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created! Login now.");
  } catch (e) {
    alert("Signup error: " + e.message);
    console.log(e);
  }
}

// LOGIN function
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("login").style.display = "none";
    document.getElementById("quiz").style.display = "block";
    startQuiz();
  } catch (e) {
    alert("Login error: " + e.message);
    console.log(e);
  }
}

// Start quiz timer
function startQuiz() {
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = "Time left: " + timeLeft + "s";
    if(timeLeft <= 0) finishQuiz();
  }, 1000);
  showQuestion();
}

// Show each question
function showQuestion() {
  let q = questions[index];
  document.getElementById("question").innerText = q.q;
  let optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options.forEach((opt,i)=>{
    let btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(i);
    optionsDiv.appendChild(btn);
  });
}

// Check answer
function checkAnswer(selected){
  if(selected === questions[index].answer) score++;
  nextQuestion();
}

// Next question
function nextQuestion(){
  index++;
  if(index < questions.length) showQuestion();
  else finishQuiz();
}

// Finish quiz
function finishQuiz(){
  clearInterval(timer);
  document.getElementById("quiz").innerHTML = `<h2>Your Score: ${score}/${questions.length}</h2>`;
}

// Attach functions to buttons (optional if using HTML onclick)
window.signup = signup;
window.login = login;
