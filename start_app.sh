echo "Starting backend..."
cd backend
npm run dev &

BACKEND_PID=$!

echo "Waiting for backend to initialize..."
sleep 3

echo "Starting frontend..."
cd ../frontend
npm run dev

wait $BACKEND_PID