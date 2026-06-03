# EcoFeed: Food Waste Management & Donation Platform

EcoFeed is a modern, responsive, full-stack web application designed for hackathons and startup demonstrations. It minimizes food waste by connecting food donors (restaurants, hotels, hostels, and wedding halls) with verified NGOs and local charities.

---

## 🚀 Instant Zero-Install Showcase (For Pitching)

If you don't have Python, Node.js, or MySQL installed on your presentation device, you can still showcase the platform's complete workflow immediately:

1. Locate the **`index.html`** file in the root directory.
2. Double-click it to open it directly in any web browser.
3. Use the **Hackathon Sandbox Controls** panel at the top of the page to switch between roles on the fly:
   - **🔑 Donor Sandbox:** Add donations, upload images, set expirations, and track status.
   - **🔑 NGO Sandbox:** Search, filter categories, claim donations, open navigation maps, and trigger dispatches.
   - **🔑 Admin Sandbox:** Verify NGO registrations, monitor live SVG charts, and inspect audit logs.
   - **🌓 Dark Mode:** Click the sun/moon icon to toggle the dark theme.

---

## 🛠️ Full-Stack Project Structure

```
.
├── index.html                   # Interactive Standalone Demo (React & Tailwind CDN)
├── README.md                    # Startup Documentation & Guides
├── database/
│   └── schema.sql               # MySQL Database schema DDL
├── backend/
│   ├── config.py                # Database and Security Settings (SQLite/MySQL toggles)
│   ├── models.py                # SQLAlchemy Models (Users, NGOs, Donations, Feedbacks)
│   ├── app.py                   # Flask REST API endpoints
│   ├── seed.py                  # Script to seed the database with sample entries
│   └── requirements.txt         # Python package dependencies
└── frontend/
    ├── package.json             # NPM build configurations
    ├── vite.config.js           # Vite server configurations
    ├── tailwind.config.js       # CSS theme configurations
    ├── postcss.config.js        # PostCSS configurations
    ├── index.html               # Frontend HTML root
    └── src/
        ├── index.css            # Stylesheets
        ├── main.jsx             # React entry points
        ├── App.jsx              # Routing & guards
        ├── context/             # Authentication & Theme states
        ├── components/          # Shared layout, mock maps, and SVG graphs
        └── pages/               # Landing pages and user dashboards
```

---

## ⚙️ Backend (Flask) Setup

### 1. Install Python 3
Ensure Python 3 is installed on your computer.

### 2. Configure Virtual Environment & Install Packages
Open a terminal in the `/backend` folder and run:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Configuration (MySQL vs SQLite)
By default, the backend runs on **SQLite** (`ecofeed.db` is auto-created on startup) for a zero-configuration presentation. 

To use a **MySQL** database instead:
1. Create a database in MySQL named `ecofeed_db` using `/database/schema.sql`.
2. Create a `.env` file in the `/backend` folder.
3. Add the following parameters:
   ```env
   DB_TYPE=mysql
   MYSQL_USER=your_mysql_username
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DB=ecofeed_db
   ```

### 4. Seed and Launch Backend
```bash
# Seed sample donors, NGOs, donations, and reviews
python seed.py

# Start Flask Server (starts on http://localhost:5000)
python app.py
```

---

## 🎨 Frontend (React + Vite + Tailwind) Setup

### 1. Install Node.js
Ensure Node.js and NPM are installed on your computer.

### 2. Install Packages & Run Dev Server
Open a terminal in the `/frontend` folder and run:
```bash
# Install node packages
npm install

# Run the Vite hot-reloading dev server
npm run dev
```
Open **http://localhost:3000** in your browser. The Vite server is configured to proxy all API requests from `http://localhost:3000/api/*` to the Flask backend running on `http://localhost:5000`.

---

## 📋 Features Walkthrough

1. **User Authentication:** Registered users are categorized as **Donors** or **NGOs**. Password hashing (bcrypt) and authentication token signing (JWT) are handled by the Flask server.
2. **Donor Operations:** Donors can list surplus food items, define quantities, choose categories, upload picture references, select addresses, specify expiration times, cancel listings, and rate NGO collectors.
3. **NGO Operations:** NGOs can browse available donations, search by keyword, filter by categories, claim donations, update dispatches, check simulated route navigation, and review donors.
4. **Admin Operations:** System administrators can approve pending NGO requests to verify their authenticity, inspect live visual charts of food saved, and check global transaction audits.
