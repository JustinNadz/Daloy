import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import GoogleLoginButton from '@/components/GoogleLoginButton'

const Login = () => {
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Real-time validation: reCAPTCHA required
    if (!recaptchaToken) {
      toast({
        title: 'Verification Required',
        description: 'Please complete the reCAPTCHA verification',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      // Include reCAPTCHA token
      await login({ login: loginValue, password, recaptcha_token: recaptchaToken })
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      })
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      console.error('Error response:', err.response)
      console.error('Error data:', err.response?.data)

      toast({
        title: 'Login failed',
        description: err.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-6 shadow-xl border border-border">
          {/* Logo */}
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-primary mb-1">Daloy</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Google Sign-In */}
          <GoogleLoginButton mode="login" />

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login" className="text-sm">Email</Label>
              <Input
                id="login"
                type="email"
                placeholder="Enter your email"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                required
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded border-border w-4 h-4" />
                <span className="text-xs text-muted-foreground">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* reCAPTCHA - Real-time Bot Protection */}
            {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
              <div className="flex justify-center scale-90 origin-center">
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={setRecaptchaToken}
                  theme="light"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
