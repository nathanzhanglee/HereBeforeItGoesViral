#!/bin/bash
chmod +x run.sh

# Activate virtual environment (if applicable)
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "Virtual environment not found. Please create one using 'python -m venv venv'."
    exit 1
fi

# Install dependencies (if needed)
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the FastAPI backend server
echo "Starting FastAPI server..."
python backend/main.py