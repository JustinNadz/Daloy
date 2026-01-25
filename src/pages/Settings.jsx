import { useState } from 'react'
import { 
  User, 
  Bell, 
  Lock, 
  Shield, 
  Palette, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services'

const Settings = () => {
  const { user, logout, updateUser } = useAuth()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  
  // Profile form state
  const [profile, setProfile] = useState({
    display_name: user?.display_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  })

  // Password form state
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })
  const [showPasswords, setShowPasswords] = useState(false)

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    account_privacy: user?.privacy || 'public',
    show_activity_status: true,
    allow_messages_from: 'everyone'
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    direct_messages: true
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await authService.updateProfile(profile)
      updateUser(response.data)
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.new_password_confirmation) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      await authService.updatePassword(passwords)
      setPasswords({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      })
      toast({
        title: "Success",
        description: "Password updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrivacyUpdate = async () => {
    try {
      setLoading(true)
      await authService.updatePrivacy(privacy)
      toast({
        title: "Success",
        description: "Privacy settings updated"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    })
  }

  const settingsMenu = [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ]

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Menu */}
        <div className="md:w-64 space-y-1">
          {settingsMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
          <Separator className="my-4" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-2xl">
                        {user?.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline">Change Avatar</Button>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={profile.display_name}
                        onChange={(e) => setProfile(p => ({ ...p, display_name: e.target.value }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile(p => ({ ...p, username: e.target.value }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={profile.bio}
                        onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                        maxLength={160}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {profile.bio.length}/160
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Where are you based?"
                        value={profile.location}
                        onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={profile.website}
                        onChange={(e) => setProfile(p => ({ ...p, website: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPasswords ? 'text' : 'password'}
                        value={passwords.current_password}
                        onChange={(e) => setPasswords(p => ({ ...p, current_password: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type={showPasswords ? 'text' : 'password'}
                      value={passwords.new_password}
                      onChange={(e) => setPasswords(p => ({ ...p, new_password: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type={showPasswords ? 'text' : 'password'}
                      value={passwords.new_password_confirmation}
                      onChange={(e) => setPasswords(p => ({ ...p, new_password_confirmation: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your content and activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Account Privacy</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose who can see your posts
                    </p>
                  </div>
                  <Select
                    value={privacy.account_privacy}
                    onValueChange={(value) => setPrivacy(p => ({ ...p, account_privacy: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Activity Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see when you're active
                    </p>
                  </div>
                  <Switch
                    checked={privacy.show_activity_status}
                    onCheckedChange={(checked) => setPrivacy(p => ({ ...p, show_activity_status: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Messages From</Label>
                    <p className="text-sm text-muted-foreground">
                      Control who can send you messages
                    </p>
                  </div>
                  <Select
                    value={privacy.allow_messages_from}
                    onValueChange={(value) => setPrivacy(p => ({ ...p, allow_messages_from: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers</SelectItem>
                      <SelectItem value="none">No one</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handlePrivacyUpdate} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => setNotifications(n => ({ ...n, email_notifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => setNotifications(n => ({ ...n, push_notifications: checked }))}
                  />
                </div>

                <Separator />

                <p className="text-sm font-medium">Notify me about:</p>

                {[
                  { key: 'likes', label: 'Likes on my posts' },
                  { key: 'comments', label: 'Comments on my posts' },
                  { key: 'follows', label: 'New followers' },
                  { key: 'mentions', label: 'Mentions' },
                  { key: 'direct_messages', label: 'Direct messages' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label>{item.label}</Label>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(checked) => setNotifications(n => ({ ...n, [item.key]: checked }))}
                    />
                  </div>
                ))}

                <Button disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred theme
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Sun className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Moon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'help' && (
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>Get help with your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Terms of Service
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
