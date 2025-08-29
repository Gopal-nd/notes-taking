import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export default function App() {
  const { user } = useAuthStore()
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="p-4">
        {user ? (
          <>
            <h2>Welcome, {user.name}</h2>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
          </>
        ) : (
          <Button>
            <Link to="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </GoogleOAuthProvider>
  )
}

export const Route = createFileRoute('/')({
  component: App,
})
