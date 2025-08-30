import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
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

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  dob: z.string().nonempty('Date of Birth is required'),
  email: z.string().email('Enter a valid email'),
  otp: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const SignUp = () => {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({ resolver: zodResolver(formSchema) })
  const otp = watch('otp')

  const handelResend = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post(`/api/auth/resend`, data)
      return res.data
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'OTP sent to your email')
    },
    onError: (req: any) => {
      toast.error(req.response?.data?.error || 'Something went wrong')
    },
  })

  const userRegister = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post(
        `/api/auth/${otp ? 'login' : 'register'}`,
        data,
      )
      return res.data
    },
    onSuccess: (data: any) => {
      toast.success(
        data.message ||
          'User Registered Successfully, enter the OTP sent to your email',
      )
      if (otp) {
        setUser(data.user)
        navigate({ to: '/' })
      }
    },
    onError: (req: any) => {
      toast.error(req.response?.data?.error || 'Something went wrong')
    },
  })

  const onSubmit = (data: FormData) => {
    userRegister.mutate(data)
  }

  const loginWithGoogle = async (credentialResponse: any) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        { token: credentialResponse.credential },
      )
      setUser(res.data.user)
      navigate({ to: '/' })
    } catch {
      toast.error('Login failed')
    }
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex min-h-screen bg-gray-50 p-6">
        <div className="md:w-1/3 bg-white w-full rounded-3xl border-2 border-yellow-400 p-8 flex flex-col">
          <div className="flex mb-8">
            <div className="text-2xl flex items-center gap-1">
              <Sun className="text-blue-500" />
              <span className="font-bold text-sm">HD</span>
            </div>
          </div>
          <div className="mt-10 w-full">
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
                  className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  type="date"
                  {...register('dob')}
                  className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jonas_khanwald@gmail.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              {userRegister.isSuccess && !otp && (
                <p className="text-green-600 text-sm">OTP sent to your email</p>
              )}
              {otp !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP
                  </label>
                  <input
                    {...register('otp')}
                    className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123456"
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-sm">{errors.otp.message}</p>
                  )}
                </div>
              )}
              {otp !== undefined && (
                <p
                  className="text-blue-600 cursor-pointer underline"
                  onClick={() => handelResend.mutate({ email: watch('email') })}
                >
                  {handelResend.isPending ? 'Sending...' : 'Resend OTP'}
                </p>
              )}
              <button
                type="submit"
                disabled={userRegister.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex gap-2 justify-center py-3 rounded-lg"
              >
                {userRegister.isPending && (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                {otp ? 'Enter OTP' : 'Sign Up'}
              </button>
              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <GoogleLogin
                onSuccess={loginWithGoogle}
                onError={() => toast.error('Login Failed')}
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
        <div className="hidden md:w-2/3 md:block ml-6 rounded-3xl overflow-hidden">
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
