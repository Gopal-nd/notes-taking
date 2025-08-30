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

const signUpSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  dob: z.string().nonempty('Date of Birth is required'),
  email: z.string().email('Invalid email address'),
  otp: z.string().optional(),
})

type SignUpFormData = z.infer<typeof signUpSchema>

const SignUp = () => {
  const [optSent, setOptSent] = useState(false)
  const { setUser } = useAuthStore()
  const naviagate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      dob: '',
      email: '',
      otp: '',
    },
  })

  const formData = watch()

  const handelResend = useMutation({
    mutationFn: async (formData: any) => {
      const res = await axiosInstance.post(`/api/auth/resend`, formData)
      return res.data
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'otp sent to your email')
      setOptSent(true)
    },
    onError: (req: any) => {
      toast.error(req.response.data.error)
    },
  })

  const userRegister = useMutation({
    mutationFn: async (formData: any) => {
      const res = await axiosInstance.post(
        `/api/auth/${optSent ? 'login' : 'register'}`,
        formData,
      )
      return res.data
    },
    onSuccess: (data: any) => {
      toast.success(
        data.message ||
          'User Registered Successfully enter the otp sent to your email',
      )
      if (optSent) {
        setUser(data.user)
        naviagate({ to: '/' })
      }
      setOptSent(true)
    },
    onError: (req: any) => {
      toast.error(req.response.data.error)
    },
  })

  const onSubmit = (data: SignUpFormData) => {
    if (optSent && data.otp) {
      userRegister.mutate(data)
    } else {
      userRegister.mutate(data)
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
      setUser(res.data.user)
      naviagate({ to: '/' })
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
            <h2 className="text-3xl font-semibold mb-2">Sign up</h2>
            <p className="text-gray-500 mb-8">
              Sign up to enjoy the feature of HD
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jonas Khanwald"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  {...register('dob')}
                  type="date"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.dob && (
                  <p className="text-red-500 text-sm">{errors.dob.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jonas_khanwald@gmail.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              {optSent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP
                  </label>
                  <input
                    {...register('otp')}
                    type="text"
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
                type="submit"
                disabled={userRegister.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white items-center flex gap-2 justify-center font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {userRegister.isPending && (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                {optSent ? 'Enter OTP' : 'Sign Up'}
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
                Already have an account?{' '}
                <Link to="/sign-in" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Panel with Background Image */}
        <div className=" hidden md:w-2/3 md:block ml-6 rounded-3xl overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 relative">
            <div className="absolute inset-0"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-blue-400/20"></div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export const Route = createFileRoute('/sign-up')({
  component: SignUp,
})
