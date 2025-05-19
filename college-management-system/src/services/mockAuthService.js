// Mock authentication service for development without a backend

// Mock user database
const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Faculty User',
    email: 'faculty@example.com',
    password: 'password123',
    role: 'faculty'
  },
  {
    id: '3',
    name: 'Student User',
    email: 'student@example.com',
    password: 'password123',
    role: 'student'
  }
];

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Random delay between 800ms and 1500ms to simulate network latency
const randomDelay = () => delay(Math.floor(Math.random() * 700) + 800);

// Register user
const register = async (userData) => {
  // Simulate API delay with random latency
  await randomDelay();

  // Check if user already exists
  const existingUser = users.find(user => user.email === userData.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role
  };

  // Add to mock database
  users.push(newUser);

  // Return user without password
  const { password, ...userWithoutPassword } = newUser;

  return {
    user: userWithoutPassword,
    token: 'mock-jwt-token-' + Date.now()
  };
};

// Login user
const login = async (userData) => {
  // Simulate API delay with random latency
  await randomDelay();

  // Find user
  const user = users.find(user => user.email === userData.email);

  // Check if user exists and password matches
  if (!user || user.password !== userData.password) {
    throw new Error('Invalid credentials');
  }

  // Return user without password
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token: 'mock-jwt-token-' + Date.now()
  };
};

// Logout user
const logout = () => {
  // Nothing to do in mock service
  return;
};

const mockAuthService = {
  register,
  login,
  logout
};

export default mockAuthService;
