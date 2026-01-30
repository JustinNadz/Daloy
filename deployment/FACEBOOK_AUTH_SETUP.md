# Facebook Authentication Setup Guide

## ✅ What's Already Implemented

Your Facebook OAuth is **100% coded and ready**! You just need to configure API keys.

**Backend:**
- ✅ `SocialAuthController.php` - Facebook login/callback handlers
- ✅ Routes configured: `/auth/facebook/redirect`, `/auth/facebook/callback`
- ✅ User creation/login logic
- ✅ Token generation
- ✅ Socialite package installed

**Frontend:**
- ✅ `FacebookLoginButton.jsx` - Facebook login button component
- ✅ Integrated in Login & Register pages
- ✅ Redirects to backend OAuth flow

---

## 🔧 Setup Instructions (10 minutes)

### Step 1: Create Facebook App

1. **Go to Facebook Developers:**
   - Visit: https://developers.facebook.com/
   - Click **"My Apps"** → **"Create App"**

2. **Choose App Type:**
   - Select: **"Consumer"**
   - Click **"Next"**

3. **Enter App Details:**
   - **App Name:** Daloy
   - **App Contact Email:** your-email@example.com
   - Click **"Create App"**

4. **Add Facebook Login Product:**
   - In left sidebar, find **"Products"** section
   - Click **"+ Add Product"** on **"Facebook Login"**
   - Click **"Set Up"**

---

### Step 2: Configure OAuth Settings

1. **Go to Facebook Login → Settings:**
   - In left sidebar: **Facebook Login → Settings**

2. **Add Valid OAuth Redirect URIs:**

   **For Local Development:**
   ```
   http://localhost:8000/api/auth/facebook/callback
   ```

   **For Production:**
   ```
   https://yourdomain.com/api/auth/facebook/callback
   ```

3. **Configure Client OAuth Settings:**
   - Enable: ✅ **"Client OAuth Login"**
   - Enable: ✅ **"Web OAuth Login"**
   - Disable: ❌ **"Use Strict Mode for Redirect URIs"** (for development)

4. **Click "Save Changes"**

---

### Step 3: Get App Credentials

1. **Go to Settings → Basic:**
   - In left sidebar: **Settings → Basic**

2. **Copy Your Credentials:**
   - **App ID:** Copy this number
   - **App Secret:** Click **"Show"**, then copy

3. **Add App Domains (for production):**
   - Add: `yourdomain.com`

---

### Step 4: Add to Backend .env

Edit `backend/.env`:

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_CLIENT_SECRET=your_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/auth/facebook/callback
```

**For production `.env`:**
```env
FACEBOOK_REDIRECT_URI=https://yourdomain.com/api/auth/facebook/callback
```

---

### Step 5: Configure Services

The Facebook service should already be configured in `config/services.php`:

```php
'facebook' => [
    'client_id' => env('FACEBOOK_CLIENT_ID'),
    'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
    'redirect' => env('FACEBOOK_REDIRECT_URI'),
],
```

If not, add it!

---

### Step 6: Clear Cache

```bash
cd backend
php artisan config:cache
```

---

### Step 7: Test Facebook Login

1. **Start your app:**
   ```bash
   # Backend
   cd backend
   php artisan serve

   # Frontend (new terminal)
   npm run dev
   ```

2. **Go to:** http://localhost:5174/login

3. **Click "Sign in with Facebook"**

4. **Expected flow:**
   - Redirects to Facebook login
   - Ask for permissions
   - Redirects back to your app
   - User logged in! ✅

---

## 🔐 App Permissions Requested

By default, your app requests:
- **Public Profile** (required)
- **Email** (required)

To request more data, update `SocialAuthController.php`:

```php
public function redirectToFacebook()
{
    return Socialite::driver('facebook')
        ->stateless()
        ->scopes(['email', 'public_profile']) // Add more scopes here
        ->redirect();
}
```

**Available scopes:**
- `user_friends` - Friend list
- `user_photos` - Photos
- `user_posts` - Posts
- `user_birthday` - Birthday

---

## 🚨 Troubleshooting

### Issue: "App Not Set Up"

**Solution:** Make sure your app is in **Development Mode**
1. Go to **Settings → Basic**
2. At top, check if it says **"Development Mode"**
3. Add test users if needed

---

### Issue: "Redirect URI Mismatch"

**Solution:** Check your redirect URI exactly matches:
1. In Facebook app settings
2. In your `.env` file
3. No trailing slashes
4. Correct protocol (http vs https)

---

### Issue: "Invalid Scopes"

**Solution:** Some scopes require app review
1. For development, use only `email` and `public_profile`
2. For production, submit for App Review

---

### Issue: "This App is in Development Mode"

**Solution:** For production:
1. Go to **Settings → Basic**
2. Switch **"App Mode"** to **"Live"**
3. Complete Privacy Policy URL
4. Complete Terms of Service URL

---

## 📝 Production Checklist

Before going live with Facebook login:

- [ ] Add production redirect URI
- [ ] Add Privacy Policy URL
- [ ] Add Terms of Service URL
- [ ] Add App Icon (1024x1024px)
- [ ] Complete **Data Deletion Instructions URL**
- [ ] Switch to **Live Mode**
- [ ] Update `.env` with production URLs
- [ ] Test login on production domain

---

## 🎨 Customization

### Change Button Appearance

Edit `src/components/FacebookLoginButton.jsx`:

```jsx
// Current: Blue Facebook color
className="bg-[#1877F2] hover:bg-[#166FE5]"

// Alternative: White with Facebook logo
className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
```

---

## 📊 User Data Retrieved

When a user logs in with Facebook, you get:

```json
{
  "id": "facebook_user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://graph.facebook.com/v12.0/USER_ID/picture"
}
```

This is automatically mapped to your User model.

---

## 🔗 Useful Links

- **Facebook Developers Console:** https://developers.facebook.com/apps/
- **Facebook Login Docs:** https://developers.facebook.com/docs/facebook-login/
- **Socialite Docs:** https://laravel.com/docs/socialite
- **Test Your App:** https://developers.facebook.com/tools/debug/accesstoken/

---

## ✅ Summary

**Setup Time:** 10 minutes  
**Code Required:** 0 lines (already done!)  
**Just Need:** Facebook App ID & Secret

Your Facebook authentication is **fully implemented**. Just add credentials and test! 🎉
