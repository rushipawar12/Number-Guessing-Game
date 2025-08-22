import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const UserProfile = () => {
  const { user, logout } = useAuth()
  const [allUsers, setAllUsers] = useState([])

  // Load all users from localStorage
  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      setAllUsers(Array.isArray(users) ? users : [])
    } catch (error) {
      console.error('Error loading users:', error)
      setAllUsers([])
    }
  }, [user]) // Refresh when user changes

  if (!user) return null

  return (
    <div className="user-profile-section">
      {/* Current User Information Table */}
      <div className="profile-header">
        <h3 className="profile-title">User Information</h3>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="user-info-table-container">
        <table className="user-info-table">
          <tbody>
            <tr>
              <td className="info-label">Name:</td>
              <td className="info-value">{user.name || 'Unknown User'}</td>
            </tr>
            <tr>
              <td className="info-label">Email:</td>
              <td className="info-value">{user.email || 'No email'}</td>
            </tr>
            <tr>
              <td className="info-label">Games Played:</td>
              <td className="info-value">{user.gamesPlayed || 0}</td>
            </tr>
            <tr>
              <td className="info-label">Best Score:</td>
              <td className="info-value">
                {user.bestScore
                  ? `${user.bestScore.attempts} attempts (${user.bestScore.difficulty})`
                  : 'No games played yet'
                }
              </td>
            </tr>
            <tr>
              <td className="info-label">Member Since:</td>
              <td className="info-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* All Users Details Table */}
      <div className="profile-header" style={{marginTop: '40px'}}>
        <h3 className="profile-title">All Users Details</h3>
      </div>

      <div className="simple-table-container">
        {allUsers.length === 0 ? (
          <p>No users found. Please register to see user data.</p>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Games Played</th>
                <th>Best Score</th>
                <th>Member Since</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((userData, index) => {
              // Safe name splitting with null check
              const fullName = userData.name || 'Unknown User'
              const nameParts = fullName.split(' ')
              const firstName = nameParts[0] || ''
              const lastName = nameParts.slice(1).join(' ') || ''

              return (
                <tr key={userData.id || index}>
                  <td data-label="First Name">{firstName}</td>
                  <td data-label="Last Name">{lastName}</td>
                  <td data-label="Email" className="email-cell">{userData.email || 'No email'}</td>
                  <td data-label="Games Played">{userData.gamesPlayed || 0}</td>
                  <td data-label="Best Score">
                    {userData.bestScore
                      ? `${userData.bestScore.attempts} attempts`
                      : 'No games played'
                    }
                  </td>
                  <td data-label="Member Since">{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}

export default UserProfile
