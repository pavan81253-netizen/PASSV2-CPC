import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_APP",
  storageBucket: "YOUR_APP.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let questions = [
  { q: "What is ICD-10-CM?", options: ["Diagnosis coding system","Procedure code","Drug name"], answer:0 },
  { q: "How many chapters are in ICD-10-CM?", options:["20","21","18"], answer:1 }
];

let index=0, score=0, timeLeft=60, timer;

async function signup() {
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;
  await createUserWithEmailAndPassword(auth,email,password);
  alert("Account created! Login now.");
}

async function login() {
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;
  await signInWithEmailAndPassword(auth,email,password);
  document.getElementById("login").style.display="none";
  document.getElementById("quiz").style.display="block";
  startQuiz();
}

function startQuiz() {
  timer=setInterval(()=>{
    timeLeft--;
    document.getElementById("timer").innerText="Time left: "+timeLeft+"s";
    if(timeLeft<=0) finishQuiz();
  },1000);
  showQuestion();
}

function showQuestion() {
  let q=questions[index];
  document.getElementById("question").innerText=q.q;
  let optionsDiv=document.getElementById("options");
  optionsDiv.innerHTML="";
  q.options.forEach((opt,i)=>{
    let btn=document.createElement("button");
    btn.innerText=opt;
    btn.onclick=()=>checkAnswer(i);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(selected){
  if(selected===questions[index].answer) score++;
  nextQuestion();
}

function nextQuestion(){
  index++;
  if(index<questions.length) showQuestion();
  else finishQuiz();
}

function finishQuiz(){
  clearInterval(timer);
  document.getElementById("quiz").innerHTML=`<h2>Your Score: ${score}/${questions.length}</h2>`;
}
