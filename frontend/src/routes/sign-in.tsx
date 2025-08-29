import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Loader, Sun } from 'lucide-react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { axiosInstance } from '@/lib/axios'
const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
  })
  const [optSent, setOptSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handelResend = useMutation({
    mutationFn: async (formData: any) => {
      const res = await axiosInstance.post(`/api/auth/resend`, formData)
      console.log('data recived', res.data)
      return res.data
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'otp sent to your email')
      setOptSent(true)
    },
    onError: (req: any) => {
      toast.error(req.response.data.error)
      console.log(req)
    },
  })

  const userRegister = useMutation({
    mutationFn: async (formData: any) => {
      const res = await axiosInstance.post(`/api/auth/login`, formData)
      console.log('data recived', res.data)
      return res.data
    },
    onSuccess: (data: any) => {
      toast.success(
        data.message ||
          'User Registered Successfully enter the otp sent to your email',
      )
      setOptSent(true)
    },
    onError: (req: any) => {
      toast.error(req.response.data.error)
      console.log(req)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    if (optSent && formData.otp) {
      userRegister.mutate(formData)
    } else {
      userRegister.mutate(formData)
    }
  }

  const loginWithGoogle = async (credentialResponse: any) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        {
          token: credentialResponse.credential,
        },
      )
      console.log(res.data)
    } catch {
      alert('Login failed')
    }
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex min-h-screen bg-gray-50 p-6">
        {/* Left Panel with Form */}
        <div className="md:w-1/3 bg-white items-center justify-between w-full  rounded-3xl border-2 border-yellow-400 p-8 flex flex-col">
          {/* HD Logo */}
          <div className="flex md:items-start items-center mb-8">
            <div className=" text-2xl rounded flex items-center justify-center mr-2 gap-1">
              <Sun className="text-blue-500 fornt-bold" />
              <span className="font-bold text-sm">HD</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="mt-10 mx-auto my-auto items-center justify-between w-full h-full">
            <h2 className="text-3xl font-semibold mb-2">Sign In</h2>
            <p className="text-gray-500 mb-8">
              Sign In to enjoy the feature of HD
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jonas_khanwald@gmail.com"
                />
              </div>
              {optSent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OPT
                  </label>
                  <input
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456"
                  />
                </div>
              )}
              {optSent && (
                <p
                  className="text-blue-600 cursor-pointer underline"
                  onClick={() => handelResend.mutate(formData)}
                >
                  {handelResend.isPending ? 'Sending...' : 'Resend OTP'}
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={userRegister.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white items-center flex gap-2 justify-center font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {userRegister.isPending && (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                {optSent ? 'Enter OTP' : 'Sign In'}
              </button>
              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <GoogleLogin
                onSuccess={loginWithGoogle}
                onError={() => alert('Login Failed')}
              />
              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/sign-up" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel with Background Image */}
        <div className=" hidden md:w-2/3 md:block ml-6 rounded-3xl overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 relative">
            {/* Flowing Wave Pattern */}
            <div className="absolute inset-0"></div>

            {/* Additional flowing elements */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-blue-400/20"></div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export const Route = createFileRoute('/sign-in')({
  component: SignUp,
})
