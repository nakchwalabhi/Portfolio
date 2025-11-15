## Steps to Run This Portfolio on Your Desktop

### **Prerequisites to Install:**

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Python** (v3.9 or higher) - [Download here](https://www.python.org/)
3. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
4. **Yarn** (Node package manager) - Install after Node.js:
   ```bash
   npm install -g yarn
   ```

---

### **Step 1: Download the Code**

You need to copy the project files from this environment. I can help you view and download them:

**Project Structure:**
```
portfolio/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
```

---

### **Step 2: Setup Backend**

Open terminal/command prompt and navigate to the backend folder:

```bash
cd portfolio/backend
```

**Install Python dependencies:**
```bash
pip install -r requirements.txt
```

**Update `.env` file:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=portfolio_db
CORS_ORIGINS=http://localhost:3000
EMERGENT_LLM_KEY=sk-emergent-25bC6A5Bf2cE51d503
```

**Start MongoDB:**
```bash
# On Windows (if installed as service, it starts automatically)
# Or manually:
mongod

# On Mac:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

**Run the backend server:**
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend will run on: `http://localhost:8001`

---

### **Step 3: Setup Frontend**

Open a **new terminal** and navigate to the frontend folder:

```bash
cd portfolio/frontend
```

**Install Node dependencies:**
```bash
yarn install
```

**Update `.env` file:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Run the frontend:**
```bash
yarn start
```

Frontend will open automatically at: `http://localhost:3000`

---

### **Step 4: Verify Everything is Running**

You should now have:
- ✅ MongoDB running on port 27017
- ✅ Backend API running on http://localhost:8001
- ✅ Frontend running on http://localhost:3000

Open your browser and go to: **http://localhost:3000**

---

### **Important Notes:**

1. **AI Chatbot:** The chatbot uses the EMERGENT_LLM_KEY. If you want to use your own OpenAI key:
   - Replace `EMERGENT_LLM_KEY` with `OPENAI_API_KEY=your-key-here` in backend/.env
   - Update the code in `server.py` to use your key

2. **Port Conflicts:** If ports 3000 or 8001 are already in use, you can change them:
   - Backend: Add `--port 8002` to uvicorn command
   - Frontend: Set `PORT=3001` in frontend/.env

3. **Production Build:**
   ```bash
   # In frontend folder
   yarn build
   # This creates an optimized production build in /build folder
   ```

---

### **Quick Start Commands (Summary):**

```bash
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Start Backend
cd portfolio/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Terminal 3 - Start Frontend
cd portfolio/frontend
yarn install
yarn start
```

---

Would you like me to help you download the specific files or create a README.md with these instructions?
# Portfolio
