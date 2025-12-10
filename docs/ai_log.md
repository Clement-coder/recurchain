
# AI Logs and Vibe Coding Documentation for RecurChain

This document captures the **AI-assisted development process** for RecurChain, including tools, prompts, iteration history, demo video, project description, team info, and deployment instructions.  

---

## Demo Video

🎥 Watch the 5-minute demo walkthrough here:  
[https://youtu.be/KQ4VfJQXUzA](https://youtu.be/KQ4VfJQXUzA)

The video showcases:

- Dashboard walkthrough  
- Recurring payment agent creation  
- Automated USDC transfers and NAIRA off-ramp  
- Real-time notifications  
- UI/UX interactions  
- Inspiration and challenges solved using AI  

---

## AI Tools Used

| Component | Tool / Version | Purpose |
|-----------|----------------|---------|
| Frontend UI generation | Gemini ChatGPT US v0 | Created React components, dashboard, modals, and agent management UI |
| CLI & Backend assistance | Claude | Assisted with Node.js backend logic, Express routes, and MongoDB integration |
| Additional CLI tasks | Gemini CLI | Generated scripts, automated prompts, and repetitive code snippets |

---

## AI-Assisted Development Workflow

All source code in this project was **generated or refined using AI**, following the Vibe Coding methodology.

### Iteration 1 – Frontend Layout & Dashboard
- **Prompt:** "Generate a futuristic minimalist dashboard with React, Tailwind CSS, showing user agents and metrics."
- **Tool:** Gemini ChatGPT US v0  
- **Outcome:** Fully functional dashboard skeleton, responsive layout, sidebar navigation.

![Sample Dashboard](https://via.placeholder.com/600x300.png?text=Dashboard+Sample)

### Iteration 2 – Agent Management UI
- **Prompt:** "Create components to add, edit, pause, resume, and delete recurring payment agents."
- **Tool:** Gemini ChatGPT US v0  
- **Outcome:** React components with modals, form validation, and state management.

![Sample Agent Modal](https://via.placeholder.com/600x300.png?text=Agent+Management+Sample)

### Iteration 3 – Backend API Setup
- **Prompt:** "Create Node.js/Express backend routes for agent creation, recurring payment scheduling, and notifications. Use MongoDB for storage."
- **Tool:** Claude  
- **Outcome:** CRUD API endpoints, JWT authentication, scheduler logic integrated.

![Sample Backend](https://via.placeholder.com/600x300.png?text=Backend+Sample)

### Iteration 4 – Smart Contract Integration
- **Prompt:** "Integrate Base blockchain for automated USDC transfers. Verify sender, receiver, amount, and schedule."
- **Tool:** Claude + Gemini CLI  
- **Outcome:** Hardhat smart contract setup, interaction scripts with backend scheduler.

### Iteration 5 – Off-Ramp & Notifications
- **Prompt:** "Add NAIRA off-ramp using API, with real-time notifications for payment success/failure."
- **Tool:** Claude  
- **Outcome:** Webhooks configured, email/alert system integrated.

### Iteration 6 – Testing & Verification
- **Prompt:** "Generate unit tests for backend API routes and agent logic."
- **Tool:** Gemini ChatGPT US v0  
- **Outcome:** Automated tests for CRUD operations, payment scheduling, and notification triggers.

---

## Commit History Highlights

The commit history reflects AI-assisted development, including examples:

- `"AI-generated backend refactor"`  
- `"AI-assisted frontend dashboard design"`  
- `"AI-assisted agent management components"`  
- `"AI-integrated Base smart contract scripts"`  

---

## Project Description (max 150 words)

**RecurChain** is a decentralized recurring payment automation system for freelancers, SMEs, and individuals who rely on regular transactions. It enables users to schedule automated USDC payments, track transaction history, and off-ramp to local currency like NAIRA.  

By combining blockchain integration via Base with authentication via Privy, RecurChain ensures secure, verifiable transactions. Users can create and manage payment agents with real-time notifications, downloadable receipts, and responsive dashboard interfaces.  

The system bridges traditional finance and Web3, simplifying recurring payments while reducing errors and improving reliability. Its modern, minimalist UI and intuitive workflow make automation accessible to anyone looking to save time and increase financial efficiency.  

---

## Team Info (max 150 words)

Our team consists of developers and blockchain enthusiasts experienced in **TypeScript, Next.js, Node.js, MongoDB, and smart contracts on Base**.  

We leverage AI-assisted development (Vibe Coding) to accelerate iteration, generate UI components, refactor backend logic, and create tests. Each team member focuses on delivering secure, scalable, and revenue-focused solutions. Together, we ensure RecurChain is reliable, intuitive, and bridges both traditional and decentralized finance effectively.  

---

## Deployment Instructions & TIP

### Prerequisites
- Node.js v18+  
- npm or Yarn  
- MongoDB (local or cloud)  
- Privy App ID & Secret  
- Base RPC URL  
- Off-ramp API keys  

### Steps
1. Clone the repo:
```bash
git clone https://github.com/your-username/RecurChain.git
cd RecurChain
````

2. Frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Backend:

```bash
cd ../backend
npm install
npm start
```

4. Smart Contracts (Optional):

```bash
cd ../smartContract
npm install
# Deploy scripts in smartContract/README.md
```

### TIP (Testing in Production)

* Use **Base Testnet** accounts to test USDC payments safely.
* Use mock NAIRA off-ramp keys for testing payouts.
* Verify notifications and receipts on the dashboard.

---

## Folder Reference

```
docs/
└── ai_logs.md      # This file documenting AI workflow, tools, prompts, demo, and iteration
```

```
