#!/bin/bash

pip install fastapi uvicorn gunicorn openai python-dotenv python-multipart azure-storage-blob

python -m uvicorn main:app --host 0.0.0.0 --port 8000