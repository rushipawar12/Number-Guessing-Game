import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on app start
  useEffect(() => {
    // Create demo user if no users exist
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.length === 0) {
      const demoUser = {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123',
        createdAt: new Date().toISOString(),
        gamesPlayed: 5,
        bestScore: {
          attempts: 3,
          difficulty: 'Medium (1-100)',
          date: new Date().toLocaleDateString()
        }
      }
      localStorage.setItem('users', JSON.stringify([demoUser]))
    }

    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  // Register new user
  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // In real app, this should be hashed
      createdAt: new Date().toISOString(),
      gamesPlayed: 0,
      bestScore: null
    }

    // Save to users array
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    // Set as current user (without password)
    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password
    setUser(userWithoutPassword)
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  }

  // Login user
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Set as current user (without password)
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    setUser(userWithoutPassword)
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  }

  // Logout user
  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  // Update user stats
  const updateUserStats = (gameData) => {
    if (!user) return

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const userIndex = users.findIndex(u => u.id === user.id)
    
    if (userIndex !== -1) {
      users[userIndex].gamesPlayed += 1
      
      // Update best score if this is better
      if (!users[userIndex].bestScore || gameData.attempts < users[userIndex].bestScore.attempts) {
        users[userIndex].bestScore = {
          attempts: gameData.attempts,
          difficulty: gameData.difficulty,
          date: gameData.date
        }
      }

      localStorage.setItem('users', JSON.stringify(users))
      
      // Update current user state
      const updatedUser = { ...users[userIndex] }
      delete updatedUser.password
      setUser(updatedUser)
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    updateUserStats
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
