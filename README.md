# 🎙️ AI Meeting Notes Generator — Azure Edition

Full-stack app using **100% Azure services**:
- **Azure Speech Service** — audio transcription (Speech-to-Text)
- **Azure OpenAI GPT-4o** — structured notes generation
- **Azure Blob Storage** — audio file archiving
- **Azure App Service** — Python FastAPI backend
- **Azure Static Web Apps** — React frontend with global CDN

---

## 🗂️ Project Structure

```
ai-meeting-notes-azure/
├── .vscode/
│   ├── launch.json       ← Run both backend + frontend from VS Code
│   ├── extensions.json   ← Recommended extensions
│   └── settings.json     ← Workspace settings
├── backend/
│   ├── main.py           ← FastAPI: Speech + OpenAI + Blob Storage
│   ├── requirements.txt  ← All Azure SDK dependencies
│   └── .env.example      ← Copy to .env and fill in keys
├── frontend/
│   ├── src/
│   │   ├── App.jsx       ← Main React UI
│   │   ├── App.css       ← Styling
│   │   ├── index.css     ← Global styles
│   │   ├── main.jsx      ← Entry point
│   │   └── services/
│   │       └── api.js    ← API calls to backend
│   ├── public/
│   │   └── staticwebapp.config.json  ← Azure SWA routing
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── deploy-azure.sh       ← One-command Azure deployment
└── README.md
```

---

## ✅ Prerequisites — Install These First

### 1. Python 3.11+
- Download: https://www.python.org/downloads/
- During install: ✅ check **"Add Python to PATH"**
- Verify: open terminal → `python --version`

### 2. Node.js 20+
- Download: https://nodejs.org (LTS version)
- Verify: `node --version` and `npm --version`

### 3. VS Code
- Download: https://code.visualstudio.com
- Open this project folder in VS Code

### 4. Azure CLI
- Download: https://aka.ms/installazurecliwindows (Windows)
- Mac: `brew install azure-cli`
- Verify: `az --version`

### 5. VS Code Extensions (install these)
Open VS Code → press `Ctrl+Shift+X` → search and install:
- **Python** (Microsoft)
- **Pylance** (Microsoft)
- **Azure App Service** (Microsoft)
- **Azure Static Web Apps** (Microsoft)
- **Azure Account** (Microsoft)

Or press `Ctrl+Shift+P` → type **"Show Recommended Extensions"** → install all.

---

## 🔑 Step 1 — Get Azure Service Keys

### 1A. Azure Speech Key (from your existing kktproj)
1. Go to **portal.azure.com** → click **kktproj**
2. Left sidebar → **Keys and Endpoint**
3. Copy **Key 1** → this is your `AZURE_SPEECH_KEY`
4. Note the region (e.g. `southindia`) → this is `AZURE_SPEECH_REGION`

> **Note:** kktproj (Cognitive Services) supports Azure Speech Service natively!
> No new resource needed for speech transcription.

### 1B. OpenAI API Key (platform.openai.com)
1. Go to **platform.openai.com** → sign in
2. Click your profile → **API Keys**
3. Click **"+ Create new secret key"** → copy it → this is `OPENAI_API_KEY`
4. Make sure you have **billing enabled** (Settings → Billing → add $5+)

> This uses OpenAI directly — no Azure OpenAI resource needed.

### 1C. Azure Blob Storage Connection String
1. Go to **portal.azure.com** → click **meetingnotesstorage123**
2. Left sidebar → **Access keys**
3. Click **Show** → copy **Connection string** for key1

---

## 🖥️ Step 2 — Run Locally in VS Code

### 2A. Open the Project
```
File → Open Folder → select the ai-meeting-notes-azure folder
```

### 2B. Set Up Backend Environment

Open the VS Code **Terminal** (`Ctrl+` `` ` ``):

```bash
# Go to backend folder
cd backend

# Create Python virtual environment
python -m venv .venv

# Activate it (Windows)
.venv\Scripts\activate

# Activate it (Mac/Linux)
source .venv/bin/activate

# Install all Azure dependencies
pip install -r requirements.txt
```

> You will see `(.venv)` in your terminal — that means it's active.

### 2C. Create the .env File

```bash
# Still in the backend folder
copy .env.example .env        # Windows
# OR
cp .env.example .env          # Mac/Linux
```

Now open `backend/.env` in VS Code and fill in your keys:

```env
AZURE_SPEECH_KEY=paste_your_speech_key_here
AZURE_SPEECH_REGION=southindia

OPENAI_API_KEY=sk-paste-your-openai-key-here
OPENAI_MODEL=gpt-4o

AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=meetingnotesstorage123;...
AZURE_STORAGE_CONTAINER=meeting-audio
```

### 2D. Start the Backend

**Option A — Using VS Code Run button:**
1. Press `F5`
2. Select **"Backend: FastAPI"** from the dropdown
3. Backend starts at http://localhost:8000

**Option B — Using Terminal:**
```bash
# Make sure you're in backend/ with .venv active
uvicorn main:app --reload --port 8000
```

Test it: open browser → http://localhost:8000
You should see: `{"status":"ok","service":"AI Meeting Notes Generator"}`

API docs: http://localhost:8000/docs

### 2E. Set Up and Start the Frontend

Open a **new terminal** in VS Code (`Ctrl+Shift+` `` ` ``):

```bash
# Go to frontend folder
cd frontend

# Install packages
npm install

# Start dev server
npm run dev
```

Frontend starts at: **http://localhost:3000**

### 2F. Run Both at Once (Easiest)

Press `F5` → select **"Full Stack (Backend + Frontend)"**

This launches both servers simultaneously.

---

## 🧪 Step 3 — Test the App Locally

1. Open http://localhost:3000 in your browser
2. Enter a meeting title (optional)
3. Click **"Audio file"** tab
4. Upload any `.mp3` or `.wav` audio file
5. Click **"Full pipeline"**
6. Watch it:
   - Send to **Azure Speech Service** → get transcript
   - Send to **Azure OpenAI GPT-4o** → get structured notes
7. Review notes, download as `.md`

**To test with text only** (no audio needed):
1. Click **"Paste transcript"** tab
2. Paste any text
3. Click **"Generate notes with GPT-4o"**

---

## ☁️ Step 4 — Deploy to Azure

### 4A. Login to Azure CLI
```bash
az login
```
A browser window opens → sign in with your Azure account.

### 4B. Edit the Deploy Script

Open `deploy-azure.sh` and fill in the top section:

```bash
AZURE_SPEECH_KEY="your_speech_key"
AZURE_SPEECH_REGION="southindia"
AZURE_OPENAI_KEY="your_openai_key"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
AZURE_GPT_DEPLOYMENT="gpt-4o"
STORAGE_ACCOUNT="meetingnotesstorage123"   # your existing storage account
```

### 4C. Run the Deploy Script

**Windows (Git Bash or WSL):**
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

**Mac/Linux:**
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

The script will automatically:
1. Create resource group
2. Set up blob storage container
3. Create App Service Plan (Linux B1)
4. Deploy Python backend with all env vars
5. Build React frontend
6. Deploy to Azure Static Web Apps

### 4D. Manual Deploy via VS Code (Alternative)

**Backend:**
1. VS Code → Azure icon in left sidebar
2. App Service → right-click your app → **Deploy to Web App**
3. Select the `backend` folder

**Frontend:**
1. VS Code → Azure icon → Static Web Apps
2. Right-click → **Deploy to Static Web App**
3. Select the `frontend/dist` folder (run `npm run build` first)

---

## 🔧 Azure Resources Summary

After deployment you will have:

```
meeting-notes-rg/
├── meeting-notes-plan          App Service Plan (Linux B1)
├── meeting-notes-api           App Service (Python FastAPI backend)
├── meeting-notes-web           Static Web App (React frontend)
└── meetingnotesstorage123      Blob Storage (audio archives)

Existing resources used:
├── kktproj                     Azure Speech Service (Speech-to-Text)
└── your-openai-resource        Azure OpenAI (GPT-4o)
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Detailed health + config |
| POST | `/transcribe` | Upload audio → Azure Speech → transcript |
| POST | `/generate-notes` | Text → Azure OpenAI GPT-4o → notes JSON |
| POST | `/process-full` | Upload audio → transcript + notes (one shot) |

Interactive docs: `http://localhost:8000/docs`

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `AZURE_SPEECH_KEY not configured` | Check `.env` file exists in `backend/` folder |
| `No speech detected` | Use a clear WAV or MP3 file with audible speech |
| `Notes generation failed` | Check your OpenAI endpoint URL ends with `/` |
| `pip install` fails | Make sure `.venv` is activated — you should see `(.venv)` |
| `npm install` fails | Make sure Node 20+ is installed: `node --version` |
| Port 8000 already in use | Run `uvicorn main:app --reload --port 8001` instead |
| Azure CLI not found | Restart VS Code after installing Azure CLI |
| `az login` opens wrong account | Run `az account set --subscription "Azure for Students"` |

---

## 💰 Azure Cost Estimate (Azure for Students — $100 credit)

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Azure Speech Service | Free (5 hrs/month) then $1/hr | ~$0 for light use |
| Azure OpenAI GPT-4o | Pay per token | ~$0.01–0.05 per meeting |
| Azure Blob Storage | LRS Standard | ~$0.02/GB |
| App Service | B1 Basic | ~$13/month |
| Static Web App | Free tier | $0 |
| **Total** | | **~$13–15/month** |

> Your $100 Azure for Students credit covers ~6–7 months of running this app.
