// Global scope variables
var isOtpSent = false; 
var countdownTimer = null;
const API_BASE_URL = "http://localhost:8080/api";

async function handleAuth() {
    const emailInput = document.getElementById("authEmail");
    const email = emailInput ? emailInput.value.trim() : "";
    const nameSection = document.getElementById("nameSection");
    const otpSection = document.getElementById("otpSection");
    const authBtn = document.getElementById("authBtn");

    if (!email) { 
        alert("Please enter email."); 
        return; 
    }

    if (!isOtpSent) {
        // PHASE 1: Send OTP
        try {
            authBtn.innerText = "Sending...";
            authBtn.disabled = true;

            const res = await fetch(`${API_BASE_URL}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email })
            });

            if (res.ok) {
                const data = await res.json();
                isOtpSent = true;
                
                if (data.isNewUser) {
                    nameSection.style.display = "block";
                }
                otpSection.style.display = "block";
                
                authBtn.innerText = "Verify & Login";
                authBtn.disabled = false; // RE-ENABLE so user can click Verify
                startTimer(60); 
            } else {
                authBtn.innerText = "Send OTP";
                authBtn.disabled = false;
                alert("Failed to send OTP. Check backend console.");
            }
        } catch (err) { 
            authBtn.innerText = "Send OTP";
            authBtn.disabled = false;
            alert("Server Error: Connection Refused"); 
        }
    } else {
        // PHASE 2: Verify OTP
        const otp = document.getElementById("authOtp").value.trim();
        const nameField = document.getElementById("authName");
        const name = nameField ? nameField.value.trim() : "";

        if (!otp) { alert("Please enter the 6-digit code."); return; }

        try {
            const res = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, name })
            });

            if (res.ok) {
                const user = await res.json();
                localStorage.setItem("userEmail", user.email);
                window.location.href = "index.html";
            } else {
                alert("Invalid OTP code.");
            }
        } catch (err) { alert("Verification request failed."); }
    }
}

function startTimer(duration) {
    const timerDisplay = document.getElementById("timerDisplay");
    let timer = duration;

    if (countdownTimer) clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
        timerDisplay.innerText = `Resend available in ${timer}s`;
        if (--timer < 0) {
            clearInterval(countdownTimer);
            timerDisplay.innerHTML = `<span style="cursor:pointer; text-decoration:underline;" onclick="resetAuthFlow()">Resend OTP</span>`;
        }
    }, 1000);
}

function resetAuthFlow() {
    isOtpSent = false;
    document.getElementById("authBtn").innerText = "Send OTP";
    document.getElementById("timerDisplay").innerText = "";
}