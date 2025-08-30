import { axiosInstance } from '@/lib/axios'
import { useAuthStore } from '@/lib/store'
import { Link, useNavigate } from '@tanstack/react-router'
import { Sun } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Header() {
  const { user, clearUser } = useAuthStore()
  const naviagate = useNavigate()
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout')
      clearUser()
      toast('logout successful')
      naviagate({ to: '/' as string })
    } catch (error) {
      console.log('logut error', error)
    }
  }
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between items-center shadow">
      <nav className="flex flex-row">
        <div className="px-2 font-bold flex items-center gap-2">
          <Sun className="w-6 h-6 text-blue-500" />
          <Link to={'/' as string}>Home</Link>
        </div>
      </nav>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <span className="font-medium">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/sign-in"
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
