# 🎙️ AI Meeting Notes Generator — Complete Guide

## ─────────────────────────────────────────
## 📁 SECTION 1 — ALL FILES TO DOWNLOAD
## ─────────────────────────────────────────

Download every file below and place them exactly in this folder structure
on your computer. Create the folders manually if needed.

```
ai-meeting-notes/                        ← CREATE this root folder
│
├── .vscode/                             ← CREATE this folder
│   ├── launch.json                      ← DOWNLOAD
│   ├── extensions.json                  ← DOWNLOAD
│   └── settings.json                    ← DOWNLOAD
│
├── backend/                             ← CREATE this folder
│   ├── main.py                          ← DOWNLOAD  (FastAPI app)
│   ├── requirements.txt                 ← DOWNLOAD  (Python packages)
│   └── .env.example                     ← DOWNLOAD  (rename to .env)
│
├── frontend/                            ← CREATE this folder
│   ├── public/                          ← CREATE this folder
│   │   └── staticwebapp.config.json     ← DOWNLOAD
│   ├── src/                             ← CREATE this folder
│   │   ├── services/                    ← CREATE this folder
│   │   │   └── api.js                   ← DOWNLOAD
│   │   ├── App.jsx                      ← DOWNLOAD  (main UI)
│   │   ├── App.css                      ← DOWNLOAD  (styles)
│   │   ├── index.css                    ← DOWNLOAD  (global styles)
│   │   └── main.jsx                     ← DOWNLOAD  (entry point)
│   ├── index.html                       ← DOWNLOAD
│   ├── package.json                     ← DOWNLOAD
│   └── vite.config.js                   ← DOWNLOAD
│
├── .gitignore                           ← DOWNLOAD
└── deploy-azure.sh                      ← DOWNLOAD  (deploy script)
```

Total: 19 files to download.

---

## ─────────────────────────────────────────
## 🛠️ SECTION 2 — INSTALL THESE TOOLS FIRST
## ─────────────────────────────────────────

Install all 4 tools before doing anything else.

### Tool 1 — Python 3.11
- Go to: https://www.python.org/downloads/
- Click "Download Python 3.11.x"
- Run the installer
- ⚠️  IMPORTANT: On the first screen, check ✅ "Add Python to PATH"
- Click "Install Now"
- Verify: open Command Prompt → type `python --version` → should show 3.11.x

### Tool 2 — Node.js 20 LTS
- Go to: https://nodejs.org
- Click "20.x.x LTS" (left button)
- Run the installer, click Next through all steps
- Verify: open Command Prompt → type `node --version` → should show v20.x.x

### Tool 3 — VS Code
- Go to: https://code.visualstudio.com
- Click "Download for Windows" (or Mac)
- Run the installer
- ⚠️  Check ✅ "Add to PATH" during install

### Tool 4 — Azure CLI
- Windows: go to https://aka.ms/installazurecliwindows → download and run
- Mac: open Terminal → run: brew install azure-cli
- Verify: open new Command Prompt → type `az --version`

---

## ─────────────────────────────────────────
## 🔑 SECTION 3 — GET YOUR API KEYS
## ─────────────────────────────────────────

You need 3 keys before running the app.

### Key 1 — Azure Speech Key (FREE with your existing kktproj)

1. Go to portal.azure.com
2. Click "kktproj" from your dashboard
3. In the left sidebar, click "Keys and Endpoint"
4. Click "Show Keys"
5. Copy "KEY 1" → save it (this is AZURE_SPEECH_KEY)
6. Note the Region shown (e.g. southindia) → save it (AZURE_SPEECH_REGION)

### Key 2 — OpenAI API Key

1. Go to platform.openai.com
2. Sign up or log in
3. Click your profile icon (top right) → "API Keys"
4. Click "+ Create new secret key"
5. Give it a name: "meeting-notes"
6. Copy the key starting with sk-... → save it (OPENAI_API_KEY)
7. Go to Settings → Billing → Add payment → add $5 minimum

### Key 3 — Azure Storage Connection String

1. Go to portal.azure.com
2. Click "meetingnotesstorage123" from your dashboard
3. In the left sidebar, scroll down → click "Access keys"
4. Click "Show" next to key1
5. Copy the full "Connection string" → save it (AZURE_STORAGE_CONNECTION_STRING)

---

## ─────────────────────────────────────────
## 💻 SECTION 4 — RUN IN VS CODE (LOCAL)
## ─────────────────────────────────────────

### Step 1 — Open the project in VS Code

1. Open VS Code
2. Click File → Open Folder
3. Select your "ai-meeting-notes" folder
4. Click "Select Folder"
5. VS Code will show all your files in the left panel

### Step 2 — Install VS Code Extensions

1. In VS Code, press Ctrl+Shift+X (opens Extensions panel)
2. Search and install each of these:
   - "Python" by Microsoft
   - "Pylance" by Microsoft
   - "Azure App Service" by Microsoft
   - "Azure Static Web Apps" by Microsoft
   - "Azure Account" by Microsoft
   - "Prettier" by Prettier

### Step 3 — Set up Python environment for Backend

1. In VS Code, press Ctrl+` (backtick) to open Terminal
2. Type these commands one by one, pressing Enter after each:

   cd backend

   python -m venv .venv

   (Windows) → .venv\Scripts\activate
   (Mac/Linux) → source .venv/bin/activate

   You should now see (.venv) at the start of your terminal line.

   pip install -r requirements.txt

   This will take 2-3 minutes. Wait for it to finish.

### Step 4 — Create your .env file

1. In VS Code Explorer (left panel), open the backend folder
2. Right-click ".env.example" → "Copy"
3. Right-click the backend folder → "Paste"
4. Rename the pasted file from ".env.example" to ".env"
5. Click on ".env" to open it
6. Fill in your keys:

   AZURE_SPEECH_KEY=paste_key1_from_kktproj_here
   AZURE_SPEECH_REGION=southindia
   OPENAI_API_KEY=sk-paste_your_openai_key_here
   OPENAI_MODEL=gpt-4o
   AZURE_STORAGE_CONNECTION_STRING=paste_full_connection_string_here
   AZURE_STORAGE_CONTAINER=meeting-audio

7. Press Ctrl+S to save

### Step 5 — Start the Backend

In the terminal (make sure you see (.venv)):

   uvicorn main:app --reload --port 8000

You should see output like:
   INFO: Uvicorn running on http://127.0.0.1:8000

Test it: open your browser → go to http://localhost:8000
You should see: {"status":"ok","service":"AI Meeting Notes Generator"}

API docs: http://localhost:8000/docs

### Step 6 — Start the Frontend

1. Open a NEW terminal in VS Code
   Click the + button in the terminal panel (top right of terminal)
2. Type these commands:

   cd frontend

   npm install

   (This takes 1-2 minutes the first time)

   npm run dev

You should see:
   Local:   http://localhost:3000/

### Step 7 — Use the App

1. Open browser → go to http://localhost:3000
2. You will see the AI Meeting Notes app
3. Enter a meeting title (optional)
4. Click "Audio file" → upload a .mp3 or .wav file
5. Click "Full pipeline"
6. Wait ~10-20 seconds
7. Your notes appear with summary, action items, decisions

OR click "Paste transcript" tab → paste any text → click "Generate notes"

---

## ─────────────────────────────────────────
## ☁️  SECTION 5 — DEPLOY TO AZURE
## ─────────────────────────────────────────

### Step 1 — Sign in to Azure CLI

Open Command Prompt or VS Code terminal:

   az login

A browser window opens automatically.
Sign in with your Azure account (the one with your student subscription).
Come back to the terminal — it will show your subscription details.

### Step 2 — Verify your subscription

   az account show

Check it shows "Azure for Students". If not, run:

   az account list --output table

Then set the correct one:

   az account set --subscription "Azure for Students"

### Step 3 — Create the Blob Storage container

Your storage account already exists. Just create the container:

   az storage container create \
     --name meeting-audio \
     --account-name meetingnotesstorage123 \
     --auth-mode login

### Step 4 — Create App Service Plan

   az group create \
     --name meeting-notes-rg \
     --location southindia

   az appservice plan create \
     --name meeting-notes-plan \
     --resource-group meeting-notes-rg \
     --location southindia \
     --is-linux \
     --sku B1

### Step 5 — Create the Backend Web App

   az webapp create \
     --name meeting-notes-api \
     --resource-group meeting-notes-rg \
     --plan meeting-notes-plan \
     --runtime "PYTHON:3.11"

⚠️  "meeting-notes-api" must be globally unique.
    If it fails, try: meeting-notes-api-yourname (e.g. meeting-notes-api-kkt)

### Step 6 — Set Environment Variables on App Service

Copy this entire block, replace the values with YOUR keys, then paste and run:

   az webapp config appsettings set \
     --name meeting-notes-api \
     --resource-group meeting-notes-rg \
     --settings \
       AZURE_SPEECH_KEY="YOUR_SPEECH_KEY" \
       AZURE_SPEECH_REGION="southindia" \
       OPENAI_API_KEY="YOUR_OPENAI_KEY" \
       OPENAI_MODEL="gpt-4o" \
       AZURE_STORAGE_CONNECTION_STRING="YOUR_STORAGE_CONNECTION_STRING" \
       AZURE_STORAGE_CONTAINER="meeting-audio" \
       SCM_DO_BUILD_DURING_DEPLOYMENT=true

### Step 7 — Set Backend Startup Command

   az webapp config set \
     --name meeting-notes-api \
     --resource-group meeting-notes-rg \
     --startup-file "uvicorn main:app --host 0.0.0.0 --port 8000"

### Step 8 — Deploy Backend Code

Run these commands from the project root folder:

   cd backend

   (Windows CMD)
   powershell Compress-Archive -Path * -DestinationPath ..\backend.zip -Force

   (Mac/Linux)
   zip -r ../backend.zip . -x "*.pyc" -x "__pycache__/*" -x ".env"

   cd ..

   az webapp deploy \
     --name meeting-notes-api \
     --resource-group meeting-notes-rg \
     --src-path backend.zip \
     --type zip

Wait 2-3 minutes. Then test:

   https://meeting-notes-api.azurewebsites.net/health

You should see: {"status":"healthy",...}

### Step 9 — Build Frontend for Production

   cd frontend

Copy your backend URL into the frontend:

   (Windows CMD)
   echo VITE_API_URL=https://meeting-notes-api.azurewebsites.net > .env.production

   (Mac/Linux)
   echo "VITE_API_URL=https://meeting-notes-api.azurewebsites.net" > .env.production

Build:

   npm run build

This creates a "dist" folder with your compiled frontend.

### Step 10 — Create Azure Static Web App

   az staticwebapp create \
     --name meeting-notes-web \
     --resource-group meeting-notes-rg \
     --location "eastasia"

Get the deployment token:

   az staticwebapp secrets list \
     --name meeting-notes-web \
     --resource-group meeting-notes-rg \
     --query "properties.apiKey" \
     --output tsv

Copy the token shown.

### Step 11 — Deploy Frontend

Install the SWA CLI:

   npm install -g @azure/static-web-apps-cli

Deploy (replace YOUR_TOKEN with the token from Step 10):

   swa deploy dist \
     --deployment-token YOUR_TOKEN \
     --env production

### Step 12 — Get Your Live URLs

   az webapp show \
     --name meeting-notes-api \
     --resource-group meeting-notes-rg \
     --query defaultHostName \
     --output tsv

   az staticwebapp show \
     --name meeting-notes-web \
     --resource-group meeting-notes-rg \
     --query defaultHostname \
     --output tsv

Your app is now live at those URLs!

---

## ─────────────────────────────────────────
## 🔧 SECTION 6 — TROUBLESHOOTING
## ─────────────────────────────────────────

Problem: (.venv) not showing in terminal
Fix: Close VS Code completely → reopen → open terminal again
     Then run: .venv\Scripts\activate

Problem: "python is not recognized"
Fix: Reinstall Python with ✅ "Add Python to PATH" checked

Problem: pip install fails on azure-cognitiveservices-speech
Fix: Make sure .venv is active. Run:
     pip install --upgrade pip
     pip install -r requirements.txt

Problem: "No speech detected" error
Fix: Use a WAV file with clear English speech
     Test with a short 10-second recording first

Problem: "AZURE_SPEECH_KEY not configured"
Fix: Make sure .env file is in the backend/ folder (not root folder)
     Make sure there are no spaces around the = sign

Problem: Frontend shows blank page
Fix: Check browser console (F12 → Console tab) for errors
     Make sure backend is running on port 8000

Problem: az webapp deploy fails
Fix: Make sure you're logged in: az login
     Check the app name is exactly right
     Try: az webapp restart --name meeting-notes-api --resource-group meeting-notes-rg

Problem: App Service shows "Application Error"
Fix: Check logs:
     az webapp log tail --name meeting-notes-api --resource-group meeting-notes-rg

---

## ─────────────────────────────────────────
## 📊 SECTION 7 — AZURE SERVICES USED
## ─────────────────────────────────────────

Service                  Purpose                    Cost (est.)
─────────────────────────────────────────────────────────────────
kktproj (existing)       Azure Speech-to-Text       Free (5hrs/mo)
meetingnotesstorage123   Audio file archiving       ~$0.02/GB
App Service B1           Host Python backend        ~$13/month
Azure Static Web Apps    Host React frontend        Free tier
OpenAI API               GPT-4o notes generation    ~$0.01-0.05/meeting

Total: ~$13-15/month (covered by Azure for Students $100 credit)
