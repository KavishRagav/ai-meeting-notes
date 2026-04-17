#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  deploy-azure.sh  —  Full Azure deployment script
#  Services: App Service (backend) + Static Web App (frontend)
#            + Azure Speech + Azure OpenAI + Blob Storage
# ══════════════════════════════════════════════════════════════
set -e

# ── EDIT THESE BEFORE RUNNING ─────────────────────────────────
RESOURCE_GROUP="meeting-notes-rg"
LOCATION="southindia"

# App Service (backend)
PLAN_NAME="meeting-notes-plan"
BACKEND_APP="meeting-notes-api"          # must be globally unique

# Static Web App (frontend)
SWA_NAME="meeting-notes-web"             # must be globally unique

# Azure Storage
STORAGE_ACCOUNT="meetingnotesstorage"    # use your existing one
STORAGE_CONTAINER="meeting-audio"

# Azure Speech (from kktproj — paste your key here)
AZURE_SPEECH_KEY="YOUR_SPEECH_KEY_HERE"
AZURE_SPEECH_REGION="southindia"

# OpenAI API key (platform.openai.com)
OPENAI_API_KEY="sk-your-openai-key-here"
OPENAI_MODEL="gpt-4o"
# ──────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  AI Meeting Notes — Azure Deploy     ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Step 1: Resource Group ────────────────────────────────────
echo "📦 [1/7] Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none
echo "    ✅ $RESOURCE_GROUP created"

# ── Step 2: Blob Storage Container ───────────────────────────
echo ""
echo "🗄  [2/7] Setting up Blob Storage container..."
STORAGE_CONN=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv 2>/dev/null || echo "")

if [ -z "$STORAGE_CONN" ]; then
  echo "    Creating storage account..."
  az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --output none
  STORAGE_CONN=$(az storage account show-connection-string \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query connectionString -o tsv)
fi

az storage container create \
  --name $STORAGE_CONTAINER \
  --connection-string "$STORAGE_CONN" \
  --output none 2>/dev/null || true

echo "    ✅ Storage container '$STORAGE_CONTAINER' ready"

# ── Step 3: App Service Plan ──────────────────────────────────
echo ""
echo "🖥  [3/7] Creating App Service Plan..."
az appservice plan create \
  --name $PLAN_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1 \
  --output none
echo "    ✅ $PLAN_NAME (Linux B1) created"

# ── Step 4: Backend Web App ───────────────────────────────────
echo ""
echo "⚙️  [4/7] Creating Backend Web App (Python 3.11)..."
az webapp create \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --plan $PLAN_NAME \
  --runtime "PYTHON:3.11" \
  --output none

# Set environment variables
az webapp config appsettings set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    AZURE_SPEECH_KEY="$AZURE_SPEECH_KEY" \
    AZURE_SPEECH_REGION="$AZURE_SPEECH_REGION" \
    OPENAI_API_KEY="$OPENAI_API_KEY" \
    OPENAI_MODEL="$OPENAI_MODEL" \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONN" \
    AZURE_STORAGE_CONTAINER="$STORAGE_CONTAINER" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
  --output none

# Set startup command
az webapp config set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --startup-file "uvicorn main:app --host 0.0.0.0 --port 8000" \
  --output none

echo "    ✅ Backend app $BACKEND_APP created"

# ── Step 5: Deploy Backend Code ───────────────────────────────
echo ""
echo "🚀 [5/7] Deploying backend code..."
cd backend
zip -r ../backend.zip . -x "*.pyc" -x "__pycache__/*" -x ".env" -x "*.zip" -x ".venv/*"
cd ..
az webapp deploy \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --src-path backend.zip \
  --type zip \
  --output none
rm -f backend.zip

BACKEND_URL="https://${BACKEND_APP}.azurewebsites.net"
echo "    ✅ Backend live: $BACKEND_URL"

# ── Step 6: Build Frontend ────────────────────────────────────
echo ""
echo "🎨 [6/7] Building React frontend..."
cd frontend
echo "VITE_API_URL=${BACKEND_URL}" > .env.production
npm install --silent
npm run build --silent
cd ..
echo "    ✅ Frontend built"

# ── Step 7: Deploy to Azure Static Web Apps ───────────────────
echo ""
echo "🌐 [7/7] Deploying to Azure Static Web Apps..."
az staticwebapp create \
  --name $SWA_NAME \
  --resource-group $RESOURCE_GROUP \
  --location "eastasia" \
  --output none 2>/dev/null || true

SWA_TOKEN=$(az staticwebapp secrets list \
  --name $SWA_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.apiKey" -o tsv)

cd frontend
npx @azure/static-web-apps-cli@latest deploy dist \
  --deployment-token "$SWA_TOKEN" \
  --env production
cd ..

FRONTEND_URL="https://$(az staticwebapp show \
  --name $SWA_NAME \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostname -o tsv)"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  Deployment Complete!                            ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  🌐 Frontend  : $FRONTEND_URL"
echo "║  🔌 Backend   : $BACKEND_URL"
echo "║  📖 API Docs  : ${BACKEND_URL}/docs"
echo "╚══════════════════════════════════════════════════════╝"
