import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { api } from '@/services'

const GoogleCallback = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { updateUser } = useAuth()
    const { toast } = useToast()
    const [status, setStatus] = useState('loading') // loading, success, error

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get authorization code from URL
                const code = searchParams.get('code')

                if (!code) {
                    throw new Error('No authorization code received')
                }

                // Send code to backend for verification
                const response = await api.get(`/auth/google/callback?code=${code}`)

                // Store token and user data
                localStorage.setItem('token', response.data.token)
                updateUser(response.data.user)

                setStatus('success')

                toast({
                    title: 'Success!',
                    description: response.data.message || 'Successfully logged in with Google',
                })

                // Redirect to dashboard after short delay
                setTimeout(() => {
                    navigate('/')
                }, 1000)

            } catch (error) {
                setStatus('error')
                console.error('Google OAuth error:', error)

                toast({
                    title: 'Authentication Failed',
                    description: error.response?.data?.message || 'Failed to sign in with Google',
                    variant: 'destructive',
                })

                // Redirect to login after delay
                setTimeout(() => {
                    navigate('/login')
                }, 3000)
            }
        }

        handleCallback()
    }, [searchParams, navigate, updateUser, toast])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-card rounded-2xl p-12 shadow-xl border border-border text-center space-y-6">

                    {status === 'loading' && (
                        <>
                            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
                            <div>
                                <h2 className="text-2xl font-bold">Signing you in...</h2>
                                <p className="text-muted-foreground mt-2">
                                    Please wait while we complete your Google sign-in
                                </p>
                            </div>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Success!</h2>
                                <p className="text-muted-foreground mt-2">
                                    Redirecting to your dashboard...
                                </p>
                            </div>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Authentication Failed</h2>
                                <p className="text-muted-foreground mt-2">
                                    Redirecting to login page...
                                </p>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    )
}

export default GoogleCallback
