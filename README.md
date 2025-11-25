# AI Chat Application

A comprehensive AI chat application with role-based access control, user management, and admin features.

## Features

### User Features
- **Authentication**: Register, login, and logout
- **Chat Interface**: Minimalist, user-friendly chat interface
- **Chat History**: Access old chats and continue conversations
- **Model Selection**: Choose between supported LLM models
- **Caching**: Frequently asked questions/prompts are cached for better performance

### Role-Based Access Control
- **Admin**: Full system access including logs, telemetry, model management, user management
- **Developer**: API key management and REST API access
- **User**: Standard chat functionality

### Admin Features
- **Logs**: View system logs with timestamps and metadata
- **Telemetry**: Dashboard with system statistics
- **Model Management**: Add and manage LLM models
- **User Management**: Promote/demote users, activate/deactivate accounts
- **Database Access**: Direct database queries

### Developer Features
- **API Keys**: Generate and manage API keys for enabled models. 
- **REST API**: Access to API endpoints for integration.

## Setup

### Prerequisites
- Python 3.9 (preferrably cuz I developed in it)
- pip
- Ollama installed and running

### Option 1: Local Setup

First create a venv

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the application:
```bash
uvicorn main:app --host 0.0.0.0 --port 5000
```

The application will be available at `http://localhost:5000`

### Option 2: Docker Setup

#### Prerequisites
- Docker
- Docker Compose

#### Running with Docker Compose

1. Build and start the services:
```bash
docker-compose up --build
```

This command will:
- Build the FastAPI application image
- Start the Ollama service
- Start the FastAPI application
- Create a Docker network for inter-service communication
- Set up persistent volumes for the database and Ollama models

2. Pull and load default models (run in a new terminal):
```bash
docker exec pocket-llm-ollama ollama pull gemma2:2b
docker exec pocket-llm-ollama ollama pull llama2
docker exec pocket-llm-ollama ollama pull mistral
```

3. Access the application:
- Web UI: `http://localhost:5000`
- Swagger API docs: `http://localhost:5000/docs`
- Ollama: `http://localhost:11434`

#### Stopping Docker Services

```bash
docker-compose down
```

To also remove volumes and data:
```bash
docker-compose down -v
```

#### Building the Image Separately

```bash
docker build -t pocket-llm-app .
```

#### Running the Container Manually

```bash
docker run -p 5000:5000 \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  --name pocket-llm-app \
  pocket-llm-app
```

**Note:** Ensure Ollama is running on your host machine or accessible at the specified URL.

### Default Admin Account
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change the default admin password in production!**

## API Endpoints (YOU CAN REFER localhost:5000/docs for a GUI Swagger version)

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Chat
- `POST /api/chat` - Send a message and get LLM response
- `GET /api/chat/threads` - Get all chat threads for current user
- `GET /api/chat/threads/<thread_id>` - Get specific thread with messages
- `GET /api/models` - Get all enabled models

### Developer
- `GET /api/developer/api-keys` - Get API keys for current user
- `POST /api/developer/api-keys` - Create new API key
- `DELETE /api/developer/api-keys/<key_id>` - Delete API key

### Admin
- `GET /api/admin/logs` - Get system logs
- `GET /api/admin/telemetry` - Get telemetry data
- `POST /api/admin/models` - Add new model
- `PUT /api/admin/models/<model_id>` - Update model
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/<user_id>/role` - Update user role
- `PUT /api/admin/users/<user_id>/status` - Update user status

## Usage

### Using the Web Interface

1. Open `http://localhost:5000` in your browser
2. Register a new account or login with the admin account
3. Start chatting! Select a model from the dropdown
4. Access chat history from the "Chat History" button
5. Admins can access the Admin Panel for system management
6. Developers can access the Developer Panel for API key management

### Using the API

All API endpoints require authentication via JWT token (except registration and login).

Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

Example:
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!", "model": "gemma2:2b"}'
```

## Database

The application uses SQLite by default (can be changed to PostgreSQL via `DATABASE_URL` environment variable).

Database schema includes:
- `users` - User accounts with roles
- `chat_threads` - Chat conversation threads
- `chat_messages` - Individual messages in threads
- `models` - Available LLM models
- `api_keys` - API keys for developers
- `logs` - System activity logs

## Security Notes

1. **Change default credentials**: The default admin password should be changed immediately
2. **JWT Secret**: Update `JWT_SECRET_KEY` in `auth.py` for production
3. **Database**: Use PostgreSQL in production instead of SQLite
4. **API Keys**: Implement proper encryption for API keys in production
5. **HTTPS**: Use HTTPS in production

## Project Structure

```
.
├── main.py                 # Main Flask application
├── models.py              # Database models
├── auth.py                # Authentication and authorization
├── logger.py              # Activity logging
├── ollama_client.py       # Ollama client wrapper
├── caching.py             # Caching system
├── constants.py           # Application constants
├── requirements.txt       # Python dependencies
```

# Some useful tips to make life easier

1. Install postman and create a free account (because its easy to import the project on postman and see all the apis)

2. Go to localhost:5000/docs and copy the /openapi.json (small blue text beneath AI Chat Application)

3. In postman, click on the import button and paste the copied json. Load it as a collection

4. Download and install "DB Browser for SQLite" and open the project database located in chat_app.db
