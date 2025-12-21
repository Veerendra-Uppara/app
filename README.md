# 💕 Private Chat Application

An end-to-end private chat application built with React and Node.js, perfect for couples to communicate privately.

## Features

- ✨ Real-time messaging using Socket.io
- 💾 Message persistence with SQLite database
- 💕 Beautiful, modern UI design
- 🔒 Private chat between users
- ⌨️ Typing indicators
- 📱 Responsive design (mobile-friendly)
- 📜 Chat history - messages are saved and loaded automatically
- ☁️ Ready for Oracle Cloud deployment

## Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Real-time**: Socket.io
- **Database**: SQLite (file-based, perfect for cloud deployment)
- **Containerization**: Docker

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Start the application:

**Option A: Using batch files (Easiest - Windows)**
```cmd
# Terminal 1 - Start backend
start-server.bat

# Terminal 2 - Start frontend  
start-client.bat
```

**Option B: Using npm scripts**
```bash
# Terminal 1 - Start backend
cd server
npm start

# Terminal 2 - Start frontend
cd client
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser (dev mode) or [http://localhost:5000](http://localhost:5000) (production mode)

## Docker Build

### Build the Docker image:
```bash
docker build -t private-chat-app .
```

### Run the container locally:
```bash
docker run -p 5000:5000 private-chat-app
```

The app will be available at [http://localhost:5000](http://localhost:5000)

### Run with Docker Compose (with persistent database):
```bash
docker-compose up -d
```

This will persist the database file in a Docker volume, so your messages won't be lost when the container restarts.

## Oracle Cloud Deployment

### Using Oracle Cloud Infrastructure (OCI)

1. **Push Docker image to Oracle Container Registry**:
```bash
# Login to Oracle Cloud
docker login <region-key>.ocir.io

# Tag your image
docker tag private-chat-app <region-key>.ocir.io/<tenancy-namespace>/private-chat-app:latest

# Push the image
docker push <region-key>.ocir.io/<tenancy-namespace>/private-chat-app:latest
```

2. **Deploy to OCI Container Instances or Kubernetes**:
   - Create a Container Instance or Kubernetes cluster
   - Use the pushed image
   - Set environment variables if needed (PORT, etc.)
   - Expose port 5000

### Using Oracle Cloud Always Free Tier

1. Build the Docker image on your local machine
2. Create an OCI Container Instance:
   - Go to OCI Console → Developer Services → Container Instances
   - Create new instance
   - Use your Docker image
   - Set port 5000
   - Configure networking (public IP if needed)

3. Access your application via the public IP address assigned

## Environment Variables

You can set the following environment variables:

- `PORT`: Server port (default: 5000)
- `REACT_APP_SOCKET_URL`: Socket.io server URL for frontend (default: http://localhost:5000)

Example:
```bash
docker run -p 5000:5000 -e PORT=5000 private-chat-app
```

## Usage

1. Enter your name and a unique ID
2. Share the application URL with your partner
3. Start chatting!

## Message Storage

Messages are stored in a SQLite database file (`server/chat.db`). This means:
- ✅ All messages are persisted and survive server restarts
- ✅ Chat history is automatically loaded when users join
- ✅ No additional database service required (perfect for Oracle Cloud)
- ✅ Database file is created automatically on first run

**Note**: For production deployments, consider:
- Using a persistent volume for the database file (in Docker/Kubernetes)
- Regular database backups
- For Oracle Cloud, you can use Object Storage or attach a block volume for the database file

## Security Notes

- This is a basic private chat application
- For production use, consider adding:
  - Authentication/Authorization
  - Message encryption
  - User session management
  - Rate limiting
  - HTTPS/SSL certificates
  - Database encryption for stored messages

## License

ISC

