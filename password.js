

// # 📚 Concept Before Coding

// # I want you to understand why we have so many layers.

// # When a request comes in:

// # POST /api/products

// # the flow will be:

// # Route
// # ↓
// # Controller
// # ↓
// # Service
// # ↓
// # Repository
// # ↓
// # MongoDB
// # Route

// # Defines which URL maps to which controller.

// # Controller

// # Receives the HTTP request and sends the HTTP response. It should not contain business logic.

// # Service

// # Contains business rules, such as checking whether a product already exists or calculating values.

// # Repository

// # Contains only database operations using Mongoose.

// # This separation makes the code easier to test, reuse, and maintain.


// Implement and test these endpoints in order:

// GET /api/products
// GET /api/products/:id
// PUT /api/products/:id
// DELETE /api/products/:id



// The frontend we'll build afterward

// We'll create a modern React application with:

// React 19 + Vite
// Tailwind CSS v4
// React Router
// Axios
// TanStack Query (React Query)
// React Hook Form
// Zod validation
// JWT authentication
// Protected routes
// Admin dashboard
// Product management
// Pagination
// Search
// Filters
// Dark/Light mode
// Responsive UI
// Toast notifications
// Loading skeletons
// Professional folder structure



// ✅ Layers and Responsibilities
// Routes
// Define API endpoints
// Call controllers
// Controllers
// Receive requests
// Call services
// Return responses
// No business logic
// Services
// Business logic
// Validation decisions
// Authentication logic
// Authorization logic
// Repositories
// Database operations only
// No business rules
// MongoDB
// Data storage