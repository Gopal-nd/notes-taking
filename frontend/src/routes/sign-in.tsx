import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Loader, Sun } from 'lucide-react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { axiosInstance } from '@/lib/axios'
import { useAuthStore } from '@/lib/store'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().optional(),
})

type SignInForm = z.infer<typeof SignInSchema>

const SignIn = () => {
  const [optSent, setOptSent] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
  })

  const handelResend = useMutation({
    mutationFn: async (formData: any) => {
      const res = await axiosInstance.post(`/api/auth/resend`, formData)
      return res.data
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'OTP sent to your email')
      setOptSent(true)
    },
    onError: (req: any) => {
      toast.error(req.response?.data?.error || 'Failed to send OTP')
    },
  })

  const userRegister = useMutation({
    mutationFn: async (formData: any) => {
      const res = await axiosInstance.post(`/api/auth/login`, formData)
      return res.data
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'Login successful')
      if (optSent) {
        setUser(data.user)
        navigate({ to: '/' })
      }
      setOptSent(true)
    },
    onError: (req: any) => {
      toast.error(req.response?.data?.error || 'Login failed')
    },
  })

  const onSubmit = (formData: SignInForm) => {
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
        { token: credentialResponse.credential },
      )
      setUser(res.data.user)
      navigate({ to: '/' })
    } catch (error) {
      console.log(error)
      alert('Login failed')
    }
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex min-h-screen bg-gray-50 p-6">
        <div className="md:w-1/3 bg-white w-full rounded-3xl border-2 border-yellow-400 p-8 flex flex-col">
          <div className="flex items-center mb-8">
            <Sun className="text-blue-500 mr-2" />
            <span className="font-bold text-sm">HD</span>
          </div>

          <div className="mt-10 w-full">
            <h2 className="text-3xl font-semibold mb-2">Sign In</h2>
            <p className="text-gray-500 mb-8">
              Sign In to enjoy the feature of HD
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="jonas_khanwald@gmail.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* OTP */}
              {optSent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP
                  </label>
                  <input
                    type="text"
                    {...register('otp', {
                      required: 'OTP is required once sent',
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123456"
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.otp.message}
                    </p>
                  )}
                </div>
              )}

              {optSent && (
                <p
                  className="text-blue-600 cursor-pointer"
                  onClick={() => handelResend.mutate({ email: watch('email') })}
                >
                  {handelResend.isPending ? 'Sending...' : 'Resend OTP'}
                </p>
              )}

              <button
                type="submit"
                disabled={userRegister.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex gap-2 justify-center py-3 px-4 rounded-lg"
              >
                {userRegister.isPending && (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                {optSent ? 'Enter OTP' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <GoogleLogin
              onSuccess={loginWithGoogle}
              onError={() => alert('Login Failed')}
            />

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/sign-up" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:w-2/3 md:block ml-6 rounded-3xl overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 relative"></div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
})
