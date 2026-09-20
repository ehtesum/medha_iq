#!/usr/bin/env bash
set -e

echo "Starting Medha IQ Backend..."
cd backend
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
