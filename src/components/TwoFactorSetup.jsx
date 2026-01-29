import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Shield, Check, AlertTriangle, Copy, Loader2 } from 'lucide-react'
import { api } from '@/services'

const TwoFactorSetup = () => {
    const [step, setStep] = useState('disabled') // disabled, setup, enabled
    const [loading, setLoading] = useState(false)
    const [qrCode, setQrCode] = useState('')
    const [secret, setSecret] = useState('')
    const [recoveryCodes, setRecoveryCodes] = useState([])
    const [verificationCode, setVerificationCode] = useState('')
    const [password, setPassword] = useState('')
    const { toast } = useToast()

    // Check 2FA status on mount
    useState(() => {
        checkStatus()
    }, [])

    const checkStatus = async () => {
        try {
            const response = await api.get('/auth/2fa/status')
            setStep(response.data.enabled ? 'enabled' : 'disabled')
        } catch (error) {
            console.error('Failed to check 2FA status:', error)
        }
    }

    const handleEnable = async () => {
        setLoading(true)
        try {
            const response = await api.post('/auth/2fa/enable')

            setQrCode(response.data.qr_code_svg)
            setSecret(response.data.secret)
            setRecoveryCodes(response.data.recovery_codes)
            setStep('setup')

            toast({
                title: '2FA Setup Started',
                description: 'Scan the QR code with your authenticator app',
            })
        } catch (error) {
            toast({
                title: 'Failed to Enable 2FA',
                description: error.response?.data?.message || 'An error occurred',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleConfirm = async (e) => {
        e.preventDefault()
        if (verificationCode.length !== 6) {
            toast({
                title: 'Invalid Code',
                description: 'Please enter a 6-digit code',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)
        try {
            await api.post('/auth/2fa/confirm', {
                code: verificationCode,
            })

            setStep('enabled')
            setVerificationCode('')

            toast({
                title: 'Success!',
                description: '2FA has been enabled successfully',
            })
        } catch (error) {
            toast({
                title: 'Verification Failed',
                description: error.response?.data?.message || 'Invalid code',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDisable = async (e) => {
        e.preventDefault()
        if (!password) {
            toast({
                title: 'Password Required',
                description: 'Please enter your password to disable 2FA',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)
        try {
            await api.post('/auth/2fa/disable', {
                password,
            })

            setStep('disabled')
            setPassword('')
            setQrCode('')
            setSecret('')
            setRecoveryCodes([])

            toast({
                title: '2FA Disabled',
                description: 'Two-factor authentication has been turned off',
            })
        } catch (error) {
            toast({
                title: 'Failed to Disable',
                description: error.response?.data?.message || 'Invalid password',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast({
            title: 'Copied!',
            description: 'Code copied to clipboard',
        })
    }

    if (step === 'disabled') {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <CardTitle>Two-Factor Authentication</CardTitle>
                    </div>
                    <CardDescription>
                        Add an extra layer of security to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium">Not Protected</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Enable 2FA to secure your account with time-based codes from an authenticator app.
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleEnable} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Setting up...
                            </>
                        ) : (
                            'Enable Two-Factor Authentication'
                        )}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (step === 'setup') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Setup Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Follow the steps below to secure your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 1: Scan QR Code */}
                    <div className="space-y-3">
                        <h3 className="font-medium">Step 1: Scan QR Code</h3>
                        <p className="text-sm text-muted-foreground">
                            Use Google Authenticator, Authy, or any TOTP-compatible app to scan this code:
                        </p>
                        <div
                            className="flex justify-center p-4 bg-white rounded-lg border"
                            dangerouslySetInnerHTML={{ __html: qrCode }}
                        />
                    </div>

                    {/* Manual Entry */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Or enter this code manually:</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 p-2 bg-muted rounded font-mono text-sm">
                                {secret}
                            </code>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(secret)}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Step 2: Enter Code */}
                    <form onSubmit={handleConfirm} className="space-y-3">
                        <h3 className="font-medium">Step 2: Verify Code</h3>
                        <p className="text-sm text-muted-foreground">
                            Enter the 6-digit code from your authenticator app:
                        </p>
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-widest font-mono"
                                maxLength={6}
                                autoFocus
                            />
                        </div>
                        <Button type="submit" disabled={loading || verificationCode.length !== 6} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Confirm and Enable'
                            )}
                        </Button>
                    </form>

                    {/* Recovery Codes */}
                    <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                                    Save Your Recovery Codes
                                </h3>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                                    Store these codes in a safe place. Each code can only be used once.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            {recoveryCodes.map((code, index) => (
                                <code key={index} className="p-2 bg-white dark:bg-gray-900 rounded text-sm font-mono">
                                    {code}
                                </code>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(recoveryCodes.join('\n'))}
                            className="w-full mt-2"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy All Codes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (step === 'enabled') {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <CardTitle>Two-Factor Authentication</CardTitle>
                    </div>
                    <CardDescription>
                        Your account is protected with 2FA
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium text-green-900 dark:text-green-100">
                                Protected
                            </p>
                            <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                                Your account requires a 6-digit code from your authenticator app when logging in.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleDisable} className="space-y-3">
                        <div className="space-y-2">
                            <Label>Enter your password to disable 2FA</Label>
                            <Input
                                type="password"
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={loading || !password}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Disabling...
                                </>
                            ) : (
                                'Disable Two-Factor Authentication'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )
    }
}

export default TwoFactorSetup
