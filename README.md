# CampusVote — Student Council Election 2026

A secure, feature-rich online voting system built for Student Council Elections. CampusVote offers voice-assisted voting, real-time results tracking, and role-based access control — all within a sleek, glassmorphism-inspired dark UI.

---

## Features

### Authentication & Access Control
- **User Registration & Login** — Sign in with email/password or create a new account
- **Role-Based Access Control (RBAC)** — Two roles: **Voter** (Student) and **Admin** (Faculty)
- **Session Persistence** — Stay logged in across page refreshes via `localStorage`

### Voting
- **One-Person-One-Vote** — Each voter can cast exactly one vote
- **Confirmation Modal** — Prevents accidental votes with a confirmation step
- **Vote Integrity** — Votes are recorded and cannot be modified after submission
- **Election Status** — Admins can open/close voting at any time

### Voice-Assisted Voting
- **Speech Recognition** — Click the microphone and say a candidate's name to vote
- **Text-to-Speech Feedback** — Audio confirmation of selections and errors
- **Browser API Powered** — Uses the Web Speech API (best supported in Chrome)

### Live Results
- **Real-Time Dashboard** — Vote distribution with progress bars and percentages
- **Auto-Refresh** — Results update every 3 seconds
- **Voter Turnout Stats** — Track participation rate and leading candidate

### Admin Panel
- **Election Control** — Open/close voting and reset the entire election
- **Voter Registry** — View all registered users and their voting status
- **Activity Log** — Audit trail of all sign-ins, votes, and admin actions
- **Statistics Overview** — Registered users, votes cast, turnout rate, and vote integrity

---

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Structure | HTML5 (semantic, accessible)                  |
| Styling   | Vanilla CSS (glassmorphism, CSS custom props)  |
| Logic     | Vanilla JavaScript (no frameworks)            |
| Storage   | `localStorage` (client-side persistence)       |
| Fonts     | Google Fonts — Inter, Space Grotesk           |
| Voice     | Web Speech API (SpeechRecognition + Synthesis) |

> **No build tools, frameworks, or backend required.** Open `index.html` in a browser and you're good to go.

---

## Getting Started

### Prerequisites
- A modern web browser (Chrome recommended for voice features)

### Run Locally

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Voting system"
   ```

2. **Open in browser**
   - Simply double-click `index.html`, **or**
   - Use a local server:
     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js
     npx serve .
     ```

3. **Sign in with demo credentials** (see below)

---

## Demo Credentials

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | `admin@university.edu` | `admin123` |
| Voter | `alice@student.edu`    | `vote123`  |
| Voter | `bob@student.edu`      | `vote123`  |
| Voter | `charlie@student.edu`  | `vote123`  |

---

## Project Structure

```
Voting system/
├── index.html                 # Entry point — mounts the SPA
├── styles.css                 # Complete design system & responsive styles
├── app.js                     # Application logic (auth, voting, admin, voice)
├── assets/
│   └── images/
│       ├── candidate1.jpg     # Arjun Mehta (President)
│       ├── candidate2.jpg     # Amara Okafor (Vice President)
│       ├── candidate3.jpg     # Carlos Rivera (Secretary)
│       └── candidate4.jpg     # Mei Lin Chen (Treasurer)
└── README.md                  # This file
```

---

## Design Highlights

- **Dark Navy + Electric Blue + Gold** color palette
- **Glassmorphism** cards with backdrop blur and subtle borders
- **Animated mesh background** with floating gradients
- **Micro-animations** — hover lifts, shake errors, staggered card entrances
- **Responsive sidebar** with mobile hamburger toggle
- **Custom scrollbar** styling
- **Toast notifications** with auto-dismiss

---

## Candidates

| #  | Name            | Position        |
|----|-----------------|-----------------|
| 1  | Arjun Mehta     | President       |
| 2  | Amara Okafor    | Vice President  |
| 3  | Carlos Rivera   | Secretary       |
| 4  | Mei Lin Chen    | Treasurer       |

---

## Important Notes

- **Client-side only** — All data is stored in `localStorage`. Clearing browser data will reset everything.
- **Not for production** — Passwords are stored in plaintext. This is a demonstration/educational project.
- **Voice features** — Require microphone permissions and work best in Google Chrome.

---

## License

This project is open source and available for educational purposes.
