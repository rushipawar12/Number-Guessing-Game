import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import UserProfile from './components/UserProfile'
import './App.css'

function App() {
  const { user, isLoading, updateUserStats } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  
  const [targetNumber, setTargetNumber] = useState(0)
  const [userGuess, setUserGuess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [gameStatus, setGameStatus] = useState('playing')
  const [feedback, setFeedback] = useState('Make your first guess!')
  const [difficulty, setDifficulty] = useState('medium')
  const [gameRange, setGameRange] = useState({ min: 1, max: 100 })
  const [leaderboard, setLeaderboard] = useState([])

  const difficultySettings = {
    easy: { min: 1, max: 50, name: 'Easy (1-50)' },
    medium: { min: 1, max: 100, name: 'Medium (1-100)' },
    hard: { min: 1, max: 200, name: 'Hard (1-200)' }
  }

  
  const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  
  const initializeGame = () => {
    const range = difficultySettings[difficulty]
    setGameRange(range)
    setTargetNumber(generateRandomNumber(range.min, range.max))
    setUserGuess('')
    setAttempts(0)
    setGameStatus('playing')
    setFeedback(`I'm thinking of a number between ${range.min} and ${range.max}. Can you guess it?`)
  }

  
  useEffect(() => {
    const savedLeaderboard = localStorage.getItem('numberGuessingLeaderboard')
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard))
    }
  }, [])


  useEffect(() => {
    initializeGame()
  }, [difficulty]) 

  
  const handleGuess = () => {
    const guess = parseInt(userGuess)

   
    if (isNaN(guess) || guess < gameRange.min || guess > gameRange.max) {
      setFeedback(`Please enter a valid number between ${gameRange.min} and ${gameRange.max}`)
      return
    }

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    if (guess === targetNumber) {
     
      setGameStatus('won')
      setFeedback(`🎉 Congratulations! You guessed it in ${newAttempts} attempts!`)
      saveToLeaderboard(newAttempts)
    } else if (guess < targetNumber) {
      setFeedback(`📈 Too low! Try a higher number.`)
    } else {
      setFeedback(`📉 Too high! Try a lower number.`)
    }

    setUserGuess('')
  }

  // Save score to leaderboard
  const saveToLeaderboard = (attempts) => {
    const newScore = {
      attempts,
      difficulty: difficultySettings[difficulty].name,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
      playerName: user ? user.name : 'Guest'
    }

    // Update user stats if logged in
    if (user) {
      updateUserStats({
        attempts,
        difficulty: difficultySettings[difficulty].name,
        date: new Date().toLocaleDateString()
      })
    }

    const updatedLeaderboard = [...leaderboard, newScore]
      .sort((a, b) => a.attempts - b.attempts)
      .slice(0, 10)

    setLeaderboard(updatedLeaderboard)
    localStorage.setItem('numberGuessingLeaderboard', JSON.stringify(updatedLeaderboard))
  }


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userGuess && gameStatus === 'playing') {
      handleGuess()
    }
  }

  // Show loading screen
  if (isLoading) {
    return (
      <div className="app">
        <div className="game-container">
          <h1 className="game-title">🎯 Loading...</h1>
        </div>
      </div>
    )
  }

  // Show authentication if user not logged in
  if (!user) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    )
  }

  return (
    <div className="app">
      <div className="game-container">
        <h1 className="game-title">🎯 Number Guessing Game</h1>

        <div className="difficulty-selector">
          <label htmlFor="difficulty">Choose Difficulty:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={gameStatus === 'playing' && attempts > 0}
          >
            {Object.entries(difficultySettings).map(([key, setting]) => (
              <option key={key} value={key}>{setting.name}</option>
            ))}
          </select>
        </div>

      
        <div className="game-info">
          <p className="range-info">Range: {gameRange.min} - {gameRange.max}</p>
          <p className="attempts-info">Attempts: {attempts}</p>
        </div>

        
        <div className={`feedback ${gameStatus}`}>
          {feedback}
        </div>

      
        {gameStatus === 'playing' && (
          <div className="game-input">
            <input
              type="number"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your guess"
              min={gameRange.min}
              max={gameRange.max}
              className="guess-input"
              autoFocus
            />
            <button
              onClick={handleGuess}
              disabled={!userGuess}
              className="guess-button"
            >
              Guess!
            </button>
          </div>
        )}

        
        {gameStatus === 'won' && (
          <button onClick={initializeGame} className="play-again-button">
            🎮 Play Again
          </button>
        )}

        
        {leaderboard.length > 0 && (
          <div className="leaderboard">
            <h3>🏆 Recent Best Scores</h3>
            <div className="leaderboard-list">
              {leaderboard.slice(0, 5).map((score, index) => (
                <div key={index} className="leaderboard-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="player-name">{score.playerName || 'Guest'}</span>
                  <span className="score">{score.attempts} attempts</span>
                  <span className="difficulty">{score.difficulty}</span>
                  <span className="date">{score.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Profile - Separate Table Below Game */}
      <UserProfile />
    </div>
  )
}

export default App
