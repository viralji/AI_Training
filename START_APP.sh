#!/bin/bash

echo "🚀 Starting AI Training Platform..."
echo ""

# Check if already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend already running on port 3000"
else
    echo "Starting backend server..."
    cd backend && npm start &
    sleep 3
    echo "✅ Backend started on http://localhost:3000"
fi

# Check if already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Frontend already running on port 5173"
else
    echo "Starting frontend server..."
    cd ../frontend && npm run dev &
    sleep 3
    echo "✅ Frontend started on http://localhost:5173"
fi

echo ""
echo "✨ Both servers are running!"
echo "🌐 Open http://localhost:5173 in your browser"
echo ""
echo "Press Ctrl+C to stop"

