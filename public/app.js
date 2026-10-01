const chat = document.querySelector("#chat");
const input = document.querySelector("#input");
const send = document.querySelector("#send");
const mic = document.querySelector("#mic");
const voiceChip = document.querySelector("#voiceChip");
const status = document.querySelector("#status");
const clock = document.querySelector("#clock");

let recognition = null;
let speaking = true;

function addMessage(text, who="friday") {
  const el = document.createElement("div");
  el.className = `msg ${who}`;
  if (who === "friday") {
    el.innerHTML = `<div class="label">F R I D A Y</div><div>${escapeHtml(text)}</div>`;
  } else {
    el.textContent = text;
  }
  chat.appendChild(el);
  el.scrollIntoView({behavior:"smooth", block:"end"});
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function sendMessage(text=input.value.trim()) {
  if (!text) return;
  input.value = "";
  addMessage(text, "you");
  setBusy(true);
  try {
    const r = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text})
    });
    const data = await r.json().catch(()=>({}));
    if (!r.ok) throw new Error(data.error || "Cloud service error");
    addMessage(data.reply || "I'm online.");
    if (speaking) speak(data.reply || "");
  } catch (e) {
    addMessage(`I couldn't reach the cloud AI right now. ${e.message}`);
  } finally {
    setBusy(false);
  }
}

function setBusy(busy) {
  status.innerHTML = busy ? '<span></span> THINKING' : '<span></span> ONLINE';
  document.querySelector(".orb").style.animation = busy ? "pulse 1s infinite" : "";
}

function speak(text) {
  if (!("speechSynthesis" in window) || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = .98; u.pitch = 1.02; u.volume = 1;
  speechSynthesis.speak(u);
}

send.addEventListener("click", ()=>sendMessage());
input.addEventListener("keydown", e=>{if(e.key==="Enter")sendMessage()});
document.querySelectorAll("[data-msg]").forEach(b=>b.addEventListener("click",()=>sendMessage(b.dataset.msg)));

function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    addMessage("Voice input is not supported by this browser. Try Chrome on Android.");
    return;
  }
  if (recognition) { recognition.stop(); return; }
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onstart = ()=>{ mic.textContent="⏹️"; status.innerHTML='<span></span> LISTENING'; };
  recognition.onresult = e => {
    const text = e.results[0][0].transcript;
    input.value = text;
    sendMessage();
  };
  recognition.onerror = ()=>{ status.innerHTML='<span></span> ONLINE'; };
  recognition.onend = ()=>{ mic.textContent="🎙️"; recognition=null; };
  recognition.start();
}
mic.addEventListener("click", startVoice);
voiceChip.addEventListener("click", startVoice);

function tick(){clock.textContent=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});}
tick(); setInterval(tick,1000);

addMessage("Hello. I'm FRIDAY. How can I help?");
