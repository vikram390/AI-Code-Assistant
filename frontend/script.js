let currentSessionId = localStorage.getItem("currentSessionId") || Date.now().toString();
localStorage.setItem("currentSessionId", currentSessionId); // Force save it immediately
let guestPromptCount = parseInt(localStorage.getItem("guestPromptCount")) || 0;

document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI(); 
    loadChatHistory(); 
    
    document.getElementById("sendBtn")?.addEventListener("click", sendCode);

    document.getElementById("codeInput")?.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendCode();
        }
    });
});

function updateAuthUI() {
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName"); 
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const historySection = document.querySelector(".history-section");

    if (userEmail && userEmail !== "null") {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "block";
        // Update the logo or a label to show the user's name
        document.querySelector(".logo").innerText = `Hello, ${userName || 'User'}`;
    } else {
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
        document.querySelector(".logo").innerText = "AI Assistant";
    }
}

function startNewChat() {
    currentSessionId = Date.now().toString();
    localStorage.setItem("currentSessionId", currentSessionId);
    document.getElementById("messages").innerHTML = `<div class="ai-message">New Chat Started. How can I help you?</div>`;
}

function showTypingIndicator() {
    const container = document.getElementById("messages");
    const typingDiv = document.createElement("div");
    typingDiv.className = "ai-message";
    typingDiv.id = "ai-typing";
    typingDiv.innerHTML = `<div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

async function sendCode() {
    const email = localStorage.getItem("userEmail");
    const codeInput = document.getElementById("codeInput");
    const code = codeInput.value.trim();
    const isLoggedIn = !!(email && email !== "null");
    
    if (!code) return;
    if (!isLoggedIn && guestPromptCount >= 5) {
        alert("Guest limit reached! Please login.");
        window.location.href = "login.html";
        return;
    }

    appendMessage("user", code);
    codeInput.value = "";
    codeInput.style.height = "auto"; 
    showTypingIndicator(); 

    try {
        const res = await fetch("http://localhost:8080/api/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
    email: isLoggedIn ? email : null, 
    code: code, 
    sessionId: currentSessionId, // This must be the updated ID
    guestCount: guestPromptCount 
})
        });
        
        const explanation = await res.text();
        document.getElementById("ai-typing")?.remove();
        appendMessage("ai", explanation);

        if (!isLoggedIn && !explanation.includes("Error")) {
            guestPromptCount++;
            localStorage.setItem("guestPromptCount", guestPromptCount);
        }
        if (isLoggedIn) loadChatHistory(); 
    } catch (err) {
        document.getElementById("ai-typing")?.remove();
        appendMessage("ai", "Error: Server not responding.");
    }
}

async function loadChatHistory() {
    const email = localStorage.getItem("userEmail");
    const historyList = document.getElementById("chatHistory");
    if (!email || !historyList) return;
    try {
        const res = await fetch(`http://localhost:8080/api/history/${email}`);
        if (res.ok) {
            const sessions = await res.json();
            historyList.innerHTML = ""; 
            sessions.forEach(s => {
                const item = document.createElement("div");
                item.className = "history-item";
                item.innerText = s.code.split('\n')[0].substring(0, 20) + "...";
                item.onclick = () => loadFullSession(s.sessionId);
                historyList.appendChild(item);
            });
        }
    } catch (err) { console.error(err); }
}

async function loadFullSession(sid) {
    currentSessionId = sid;
    localStorage.setItem("currentSessionId", sid);
    
    try {
        const res = await fetch(`http://localhost:8080/api/session/${sid}`);
        if (!res.ok) throw new Error("Session not found");
        
        const messages = await res.json();
        const container = document.getElementById("messages");
        container.innerHTML = "";

        // CHECK IF IT IS AN ARRAY
        if (Array.isArray(messages)) {
            messages.forEach(m => {
                appendMessage("user", m.code);
                appendMessage("ai", m.explanation);
            });
        }
    } catch (err) {
        console.error("Failed to load session:", err);
    }
}

/**
 * FIXED: Formats AI responses into sections based on headers
 */
function appendMessage(type, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = type === "user" ? "user-message" : "ai-message";
    
    if (type === "user") {
        msgDiv.innerText = text;
    } else {
    let formatted = text;

    // 1. Highlight code blocks first and ensure they have spacing
    formatted = formatted.replace(/```(?:[a-z]+)?\n?([\s\S]*?)```/g, '<div class="code-wrapper"><pre><code>$1</code></pre></div>');

    // 2. Add bolding and ensure a NEW line exists before every header
    formatted = formatted
        .replace(/📌 CATEGORY:/g, '<br><b>📌 CATEGORY:</b>')
        .replace(/🎯 PURPOSE:/g, '<br><b>🎯 PURPOSE:</b>')
        .replace(/🔍 LOGIC:/g, '<br><b>🔍 LOGIC:</b>')
        .replace(/💡 EXAMPLE:/g, '<br><b>💡 EXAMPLE:</b>');

    msgDiv.innerHTML = formatted;
}
    
    const container = document.getElementById("messages");
    if (container) {
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    }
    return msgDiv;
}

function logout() {
    localStorage.clear();
    window.location.reload(); 
}

// Auto-resize textarea
document.getElementById("codeInput")?.addEventListener("input", function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});