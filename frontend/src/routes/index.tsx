import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000/api'

export default function App() {
  const [user, setUser] = useState<any>(null)

  const loginWithGoogle = async (credentialResponse: any) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, {
        token: credentialResponse.credential,
      })
      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
    } catch {
      alert('Login failed')
    }
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(res.data)
    } catch {
      localStorage.removeItem('token')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="p-4">
        {user ? (
          <>
            <h2>Welcome, {user.name}</h2>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
            <img src={user.avatar} alt="avatar" width={50} />
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <GoogleLogin
            onSuccess={loginWithGoogle}
            onError={() => alert('Login Failed')}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  )
}

export const Route = createFileRoute('/')({
  component: App,
})
