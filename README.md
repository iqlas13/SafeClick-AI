🔐 SafeClick AI
SafeClick AI is an intelligent cybersecurity assistant designed to proactively identify digital threats. By leveraging the Gemini 3 Pro engine alongside traditional rule-based safety checks, it helps users navigate the web safely by detecting phishing links, fraudulent emails, and malicious messages before a breach occurs.

🚀 Key Features
🔍 Multi-Vector URL Analysis: Scans links for phishing patterns, HTTP/HTTPS inconsistencies, and IP-based masking.

🤖 Aegis AI Chatbot: A dedicated conversational assistant for cybersecurity education, explaining complex threats like "Quishing" or "Social Engineering" in plain language.

📧 Phishing Intelligence: Analyzes email and SMS content for urgency-based triggers and deceptive social engineering tactics.

📷 Secure QR Scanning: Decodes QR codes to inspect embedded URLs for malicious intent before redirection.

🛡️ Fallback Resilience: Automatically switches to rule-based analysis if the AI engine is throttled, ensuring consistent protection.

🛠️ Technical Arsenal (Tech Stack)
Frontend: Next.js (App Router), TypeScript, Tailwind CSS.

AI Engine: Google Gemini API (utilizing gemini-3-flash-preview and gemini-2.5-flash-lite).

Backend: Next.js API Routes (Server-side reasoning).

Security: Firebase Authentication & Vercel HTTPS Deployment.

⚙️ Local Development Setup
Follow these steps to get a copy of the project up and running on your local machine for development and testing purposes.

1. Prerequisites
Node.js (v18.x or higher)

A Google AI Studio API Key

2. Installation
Bash

# Clone the repository
git clone https://github.com/iqlas13/SafeClick-AI.git
cd SafeClick-AI

# Install dependencies
npm install
3. Environment Variables
Create a .env.local file in the root directory and add your keys:

Code snippet

GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
4. Run the Development Server
Bash

npm run dev
Open http://localhost:3000 to view the application.

🔒 Security Architecture
SafeClick AI follows a privacy-first approach:

No Data Retention: User inputs and analyzed URLs are processed in memory and are not stored in any permanent database.

Isolated Reasoning: The AI reasoning (Thinking Mode) is performed server-side to prevent API key exposure.

👥 Contributors
This project was collaboratively developed by our dedicated security team:

Iqlas Tharannum - GitHub

Azra Khan

Zainab Mani

Mohammed Adnan

