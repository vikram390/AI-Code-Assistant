# AI Code Assistant

## 🚀 Project Overview
AI Code Assistant is a web-based developer tool that helps users:
- Understand code through AI-generated explanations
- Detect bugs and provide debugging insights
- Generate optimized and corrected code suggestions
- Store query and response history for future reference

The system runs **locally** using **Ollama with DeepSeek-Coder 6.7B**, ensuring privacy, fast inference, and offline capability.  
The backend is built with **Java Spring Boot** and uses **PostgreSQL** to store code queries, AI responses, and feedback logs.  
The frontend is implemented using **HTML, CSS, and JavaScript** for a clean, responsive, and user-friendly experience.

---

## 🧠 How It Works
1. User pastes code in the frontend input box
2. Request is sent to the Spring Boot backend API
3. Backend creates an AI prompt and forwards it to **Ollama (DeepSeek-Coder 6.7B)**
4. AI generates:
   - Code explanation
   - Bug report (if found)
   - Fixed/optimized code suggestions
5. Response is returned to UI and stored in **PostgreSQL**
6. User can revisit previous queries using history

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Java Spring Boot (REST API) |
| Database | PostgreSQL |
| AI Model | Ollama → DeepSeek-Coder 6.7B |

---

## 🔥 Key Features
- Local AI inference (offline + private)
- Beginner-friendly code explanations
- Automatic bug detection
- Optimized code generation
- Query & response history storage
- Feedback logging for improvements
- Responsive UI

---

## ⚙ Setup & Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd AI-Code-Assistant

2. Start PostgreSQL and create database
CREATE DATABASE ai_code_assistant;

3. Configure application.properties
Update DB credentials:

spring.datasource.url=jdbc:postgresql://localhost:5432/ai_code_assistant
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

4. Run DeepSeek-Coder 6.7B locally using Ollama
ollama pull deepseek-coder:6.7b
ollama run deepseek-coder:6.7b

5. Build and start the Spring Boot backend
mvn clean install
mvn spring-boot:run

6. Open the frontend
Open in browser:

frontend/index.html
