# PocketLLM Frontend

A React 18.2 frontend application for PocketLLM Portal - an AI chat application with role-based access control and local LLM inference via Ollama.

## 🎨 Design Philosophy

**Technical Precision Aesthetic** - Dark theme interface with clean design, smooth animations, and focus on usability. Built with attention to performance and user experience.

## 🚀 Features

- ✅ **Real-time Chat Interface** - Interactive chat with multiple LLM models
- ✅ **Session Management** - Browse chat history and resume conversations
- ✅ **Admin Dashboard** - System monitoring, user management, and telemetry
- ✅ **Developer Dashboard** - API key management and REST API access
- ✅ **Role-Based Access Control** - User / Developer / Admin roles
- ✅ **Dark Theme** - Professional dark mode interface
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Model Selection** - Choose from available LLM models (gemma2:2b, llama2, mistral)

## 📁 Project Structure

```
pocketllm-frontend 6/
├── public/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx      # Error handling wrapper
│   │   ├── Layout.jsx              # Main layout with navigation
│   │   ├── Layout.css
│   │   └── ProtectedRoute.jsx     # Route authentication guard
│   ├── contexts/
│   │   ├── AuthContext.jsx        # Authentication state management
│   │   └── ThemeContext.jsx       # Theme management
│   ├── pages/
│   │   ├── LandingPage.jsx        # Public landing page
│   │   ├── LandingPage.css
│   │   ├── LoginPage.jsx          # User login
│   │   ├── LoginPage.css
│   │   ├── RegisterPage.jsx       # User registration
│   │   ├── RegisterPage.css
│   │   ├── ChatPage.jsx           # Main chat interface
│   │   ├── ChatPage.css
│   │   ├── HistoryPage.jsx        # Chat history browser
│   │   ├── HistoryPage.css
│   │   ├── DeveloperDashboard.jsx # API key management (Developer role)
│   │   ├── DeveloperDashboard.css
│   │   ├── AdminDashboard.jsx     # System admin panel (Admin role)
│   │   └── AdminDashboard.css
│   ├── App.jsx                    # Main app component with routing
│   ├── App.css                    # Global styles
│   └── main.jsx                   # Entry point
├── index.html
├── package.json
├── vite.config.js                 # Vite configuration
├── Dockerfile                     # Docker container config
└── nginx.conf                     # Nginx config for production
```

## 🛠️ Tech Stack

- **React 18.2** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library
- **Context API** - State management
- **Vite** - Build tool and dev server
- **Docker** - Containerization
- **Nginx** - Production web server

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

### Development Setup

```bash
# Navigate to frontend directory
cd pocketllm-frontend\ 6

# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Docker Setup

```bash
# Build Docker image
docker build -t pocketllm-frontend .

# Run container
docker run -p 80:80 pocketllm-frontend

# Or use docker-compose (from project root)
docker-compose up --build
```

## 🔧 Configuration

### Vite Dev Server

The dev server automatically proxies API requests to avoid CORS issues:

```javascript
// vite.config.js
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true
    }
  }
}
```

### Environment Variables (Optional)

Create a `.env` file for custom configuration:

```env
VITE_API_URL=http://localhost:8000
```

### Backend Integration

The frontend expects the backend FastAPI server to be running on `http://localhost:8000`. All API calls use relative paths (e.g., `/api/auth/login`) which are proxied by Vite in development or configured in Nginx for production.

## 🎯 Application Architecture

### Context Providers (Global State)

1. **AuthContext** - Manages authentication state, login/logout, user information, and JWT token
2. **ThemeContext** - Theme management (currently dark mode only)

### Custom Hooks

- `useAuth()` - Access authentication state and methods
- `useTheme()` - Access theme state and toggle function

### Routing Structure

```
/ (Landing Page - Public)
├── /login (Login Page - Public)
├── /register (Registration Page - Public)
└── /app (Protected Layout)
    ├── /app/chat (Chat Interface - User+)
    ├── /app/history (Chat History - User+)
    ├── /app/developer (Developer Dashboard - Developer+)
    └── /app/admin (Admin Dashboard - Admin only)
```

### Component Hierarchy

```
App
└── ErrorBoundary
    └── AuthProvider
        └── ThemeProvider
            └── Router
                ├── LandingPage (/)
                ├── LoginPage (/login)
                ├── RegisterPage (/register)
                └── Layout (/app)
                    └── ProtectedRoute (Role-based)
                        ├── ChatPage
                        ├── HistoryPage
                        ├── DeveloperDashboard
                        └── AdminDashboard
```

## 🔐 Authentication Flow

1. User navigates to `/login` and enters credentials
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates and returns JWT token + user info
4. Token stored in `sessionStorage` and set as default Axios header
5. User redirected to `/app/chat`
6. Protected routes verify token via `ProtectedRoute` component
7. Automatic redirect to login if unauthenticated or token expired

## 📱 Key Pages & Features

### Landing Page (`/`)
- Marketing homepage with feature highlights
- Navigation to login/register
- Responsive hero section

### Login Page (`/login`)
- Username and password authentication
- Error handling for invalid credentials
- Redirect to chat on success

### Register Page (`/register`)
- New user registration
- Form validation
- Automatic role assignment (user by default)
- Only admins can create admin/developer accounts

### Chat Page (`/app/chat`)
- Real-time chat interface with LLM
- Model selection dropdown (gemma2:2b, llama2, mistral)
- New conversation and session management
- Message history display
- Auto-scroll to latest message
- Loading indicators during AI response

### History Page (`/app/history`)
- View all previous chat threads
- Thread metadata (title, model used, message count, timestamps)
- Click to load and continue conversations
- Reverse chronological order

### Developer Dashboard (`/app/developer`)
- API key generation for enabled models
- View existing API keys
- Delete API keys
- API documentation access
- Role requirement: Developer or Admin

### Admin Dashboard (`/app/admin`)
- **User Management**: View users, promote/demote roles, activate/deactivate accounts
- **Model Management**: Add new models, enable/disable models
- **System Logs**: View activity logs with filtering
- **Telemetry**: System statistics (users, threads, messages, cache hits)
- Role requirement: Admin only

## 🎨 Styling System

### CSS Architecture
- Component-scoped CSS files
- Global styles in `App.css`
- Consistent color scheme with CSS variables
- Dark theme with neon accents

### Theme Colors
```css
/* Dark Theme */
--bg-primary: #0a0e1a
--bg-secondary: #1a1f2e
--text-primary: #e0e6f1
--text-secondary: #8b92a8
--accent-primary: #00ff9f
--accent-secondary: #00d4ff
```

## 📱 Responsive Design

- **Desktop** (>768px): Full sidebar navigation, multi-column layouts
- **Tablet** (768px-1024px): Adaptive layouts
- **Mobile** (<768px): Collapsible navigation, single-column layouts, optimized touch targets

## ⚡ Performance Optimizations

- **React Virtual DOM** - Efficient re-rendering
- **Lazy Loading** - Code splitting by route (can be enhanced)
- **Memoization** - Prevent unnecessary re-renders (can be enhanced with React.memo)
- **Axios Interceptors** - Centralized error handling
- **Session Storage** - Client-side token persistence

## 🔨 Development Tips

### Adding a New Page

1. Create component in `src/pages/NewPage.jsx`
2. Create styles in `src/pages/NewPage.css`
3. Add route in `src/App.jsx`
4. Add navigation link in `src/components/Layout.jsx` (if needed)
5. Wrap with `ProtectedRoute` if authentication required

### Debugging API Calls

```javascript
// In src/contexts/AuthContext.jsx or component
axios.interceptors.request.use(request => {
  console.log('API Request:', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);
```

### Testing Different Roles

To test role-based features:
1. Login as admin (username: `admin`, password: `admin123`)
2. Create developer/admin accounts from Admin Dashboard
3. Logout and login with different roles

## 📚 Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "lucide-react": "^0.555.0"
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.2.0",
  "vite": "^5.0.0"
}
```

## 🐳 Docker Deployment

### Dockerfile Overview
- Multi-stage build for optimization
- Nginx serves static files
- Production-optimized configuration

### Building & Running
```bash
# Build image
docker build -t pocketllm-frontend .

# Run container
docker run -d -p 80:80 pocketllm-frontend

# With docker-compose (recommended)
docker-compose up -d
```

## 🚧 Known Issues & Limitations

- WebSocket streaming not implemented (can add for real-time token streaming)
- Theme toggle only supports dark mode (light mode theme exists but not fully styled)
- No pagination on history page (loads all threads)
- API key encryption not implemented (stored as plain text)
- No file upload functionality yet
- Limited error recovery on network failures

## 🔮 Future Enhancements

- [ ] Real-time streaming responses via WebSocket
- [ ] File upload and document processing
- [ ] Conversation export (JSON, PDF, TXT)
- [ ] Advanced search in chat history
- [ ] User profile customization
- [ ] Notification system
- [ ] Keyboard shortcuts
- [ ] Multi-language support
- [ ] Progressive Web App (PWA) support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Axios Documentation](https://axios-http.com/)
- [Lucide Icons](https://lucide.dev/)

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to backend"**
- Ensure backend server is running on `http://localhost:8000`
- Check Vite proxy configuration in `vite.config.js`

**2. "Login fails with 401"**
- Verify backend is running and accessible
- Check username/password (default admin: admin/admin123)
- Clear sessionStorage: `sessionStorage.clear()`

**3. "Protected routes redirect to login"**
- Check if token exists: `sessionStorage.getItem('token')`
- Verify token hasn't expired
- Check network tab for 401 responses

**4. "Styles not loading"**
- Run `npm install` to ensure all dependencies are installed
- Clear browser cache
- Check for CSS import errors in browser console

**5. "npm install fails"**
- Delete `node_modules` and `package-lock.json`
- Run `npm cache clean --force`
- Run `npm install` again

## 📄 License

MIT License - See LICENSE file in project root

## 🤝 Contributing

This is a student project for CSCI 578 - Software Architecture. Contributions and improvements are welcome for educational purposes.

---

**Built for CSCI 578 - Software Architecture | Team 18 | Fall 2024**
