# 🎬 CineBook - Full-Stack Movie & Event Booking Platform

A full-stack web application built with **React 19 + Vite**, **Node.js + Express**, and **MySQL**, featuring real-time seat reservation, ACID-compliant transactions, JWT authentication, and an Admin Control Center.

---

## 📋 Prerequisites

Ensure the following are installed on your machine:
- **[Node.js](https://nodejs.org/)** (v18+ or v20+ recommended)
- **[Git](https://git-scm.com/)**
- **[MySQL](https://dev.mysql.com/downloads/installer/)** or **MariaDB** (or XAMPP / MySQL Workbench)

---

## ⚡ Quick Start Guide (Run on Any PC)

### 1. Clone the Repository
```bash
git clone https://github.com/NikhilMungi/wpt-mini-project.git
cd wpt-mini-project
```

---

### 2. Set Up the Database
1. Open your MySQL client (Command Line, MySQL Workbench, or phpMyAdmin in XAMPP).
2. Execute the database initialization script:
   - **Via Terminal / Command Prompt:**
     ```bash
     mysql -u root -p < Frontend/Backend/schema.sql
     ```
   - **Or via MySQL Workbench / phpMyAdmin:**
     Open `Frontend/Backend/schema.sql`, copy all contents, and click **Execute**.
3. This creates the `cinebook` database along with pre-seeded movies, events, shows, seats, and test accounts.

---

### 3. Start the Backend Server (Terminal 1)
```bash
cd Frontend/Backend

# 1. Install dependencies
npm install

# 2. Configure environment file
# On Windows (cmd):
copy .env.example .env
# On Mac/Linux/Git Bash:
cp .env.example .env
```

Open `.env` in any text editor and make sure `DB_PASSWORD` matches your local MySQL password:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=cinebook
JWT_SECRET=nikhil123456
```

Start the backend:
```bash
npm start
```
> Server runs at `http://localhost:5000`

---

### 4. Start the Frontend (Terminal 2)
Open a **new terminal window** in the project root:
```bash
cd Frontend

# 1. Install dependencies
npm install

# 2. Launch Vite dev server
npm run dev
```
> Frontend runs at `http://localhost:5173`

Open **http://localhost:5173** in your browser!

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin123` | Full Admin Dashboard (Add/Edit Movies, Events, Shows, File Uploads, View All Bookings) |
| **Customer** | `john@gmail.com` | `password123` | Browse Movies & Events, Book Seats, View & Cancel Personal Bookings |

*(You can also use the one-click demo quick-fill buttons on the Login page).*

---

## 🏗️ Project Architecture & Tech Stack

```text
wpt-mini-project/
├── README.md                      # Setup and architecture documentation
└── Frontend/
    ├── src/
    │   ├── components/            # Navbar, Footer, MovieCard
    │   ├── pages/                 # Home, Movies, Events, SeatSelection, Admin, MyBookings, About, Contact
    │   ├── services/api.js        # Centralized Axios HTTP client
    │   └── style/App.css          # Modern dark/light responsive styles
    └── Backend/
        ├── config/db.js           # MySQL connection pool
        ├── schema.sql             # 3NF database schema + seed data
        ├── uploadMiddleware.js    # Multer local image storage (uploads/)
        ├── authController.js      # JWT issuing and bcrypt validation
        ├── bookingController.js   # ACID transaction-safe seat reservations
        ├── adminController.js     # Admin CRUD, KPIs, and show scheduler
        └── Server.js              # Express API & static uploads server
```

- **Frontend**: React 19, React Router v7, Bootstrap 5, Vite, Axios
- **Backend**: Node.js, Express, Multer (file upload), JWT, bcryptjs
- **Database**: MySQL 8.0+ / MariaDB (ACID transactions with row-level locking)
