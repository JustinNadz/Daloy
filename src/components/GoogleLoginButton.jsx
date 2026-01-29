import { Button } from './ui/button'
import { FcGoogle } from 'react-icons/fc'

const GoogleLoginButton = ({ mode = 'login' }) => {
    const handleGoogleAuth = () => {
        // Redirect to backend Google OAuth
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`
    }

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handleGoogleAuth}
            className="w-full h-12 text-base font-medium flex items-center justify-center gap-3 border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
            <FcGoogle className="w-6 h-6" />
            {mode === 'login' ? 'Sign in' : 'Sign up'} with Google
        </Button>
    )
}

export default GoogleLoginButton
