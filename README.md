# 💼 GigScroll

**GigScroll** is a modern, "Tinder-style" job application platform where users can swipe right to apply for jobs and left to pass. It streamlines the job hunt with instant applications, intelligent match insights, and resume parsing.

---

## 🚀 Features

### 👤 User Experience
- **Tinder-Style Interface:** Swipe **Right (→)** to Apply, **Left (←)** to Pass.
- **Keyboard Controls:** Use arrow keys for rapid-fire browsing.
- **Second Chance:** Accidentally swiped left? Use the "Revisit Rejected Jobs" feature to reset your history.

### 🔍 Discovery & Search
- **Smart Matching:** "AI Insights" analyze your profile against job descriptions to show why you match (e.g., "✅ Skills match", "✅ Salary meets preference").
- **Browse Mode:** Search for jobs by title, company, location, or work mode (Remote/Hybrid).
- **Direct Apply:** Apply directly from search results with a single click.

### 📝 Profile & Resume
- **Resume Parsing:** Upload a PDF resume; the backend automatically extracts your skills.
- **Editable Profile:** Update your details, skills, and preferences manually.
- **Job Preferences:** Set your preferred **Work Mode** and **Minimum Salary** to get tailored "Match" badges on job cards.

### 📊 Dashboard
- **Application Tracking:** View a history of all jobs you have applied to.
- **Status Updates:** See live status updates (Applied, Accepted, Rejected).

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Hooks
- **Routing:** React Router DOM

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens) & bcrypt
- **File Handling:** Multer (for Resume Uploads)

---

## ⚙️ Installation & Setup

Follow these steps to run GigScroll locally on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/GigScroll.git](https://github.com/YOUR_USERNAME/GigScroll.git)
cd GigScroll

```

### 2. Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install

```

**Configure Environment Variables:**
Create a `.env` file in the `backend` folder:

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gigscroll?schema=public"
JWT_SECRET="your_super_secret_key_123"

```

*(Make sure you have a PostgreSQL database running and update the URL above)*

**Run Database Migrations & Seed Data:**

```bash
npx prisma migrate dev --name init
npm run seed  # (Optional: Seeds dummy jobs/users)

```

**Start the Server:**

```bash
npm run dev

```

*Server should be running at `http://localhost:3000*`

### 3. Frontend Setup

Open a new terminal, navigate to the frontend folder, and install dependencies:

```bash
cd frontend
npm install

```

**Start the React App:**

```bash
npm run dev

```

*Frontend should be running at `http://localhost:5173*`

---

## 📖 Usage Guide

1. **Register:** Create a new account on the `/register` page.
2. **Upload Resume:** Go to **Profile** and upload a PDF resume. The system will extract your skills.
3. **Set Preferences:** Click the **Edit (Pencil)** icon in Profile to set your Min Salary and Work Mode.
4. **Start Swiping:** Go to **Jobs**. You will see cards customized to your profile.
* **Right Arrow:** Apply
* **Left Arrow:** Pass


5. **Browse:** Use the **Browse** tab to search for specific roles (e.g., "React Developer").
6. **Track:** Check the **Applications** tab to see your applied jobs.

---

## 📂 Project Structure

```text
GigScroll/
├── backend/
│   ├── prisma/            # Database schema & seeds
│   ├── src/
│   │   ├── controllers/   # Logic for Jobs, Users, Auth
│   │   ├── middleware/    # Auth protection
│   │   ├── routes/        # API Endpoints
│   │   └── index.ts       # Server entry point
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios setup
│   │   ├── components/    # Navbar, UI elements
│   │   ├── pages/         # Jobs, Profile, Login, Register
│   │   └── App.tsx        # Routing logic
│   └── package.json
└── README.md

```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the MIT License.

```

```
