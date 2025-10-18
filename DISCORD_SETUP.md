# Discord OAuth Setup Guide

## Prerequisites
You'll need to create a Discord application and get the necessary credentials.

## Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Order of the Fallen Star Website")
4. Click "Create"

## Step 2: Configure OAuth2

1. In your Discord application, go to "OAuth2" → "General"
2. Copy your **Client ID**
3. Copy your **Client Secret** (keep this secret!)
4. Add redirect URIs:
   - For development: `http://localhost:5174/auth/callback`
   - For production: `https://your-domain.com/auth/callback`

## Step 3: Set Up Environment Variables

### For Local Development:
1. Create a `.env` file in your project root:
```env
VITE_DISCORD_CLIENT_ID=your_client_id_here
VITE_DISCORD_REDIRECT_URI=http://localhost:5174/auth/callback
```

### For Netlify Deployment:
1. Go to your Netlify site dashboard
2. Go to "Site settings" → "Environment variables"
3. Add these variables:
   - `DISCORD_CLIENT_ID` = your_client_id_here
   - `DISCORD_CLIENT_SECRET` = your_client_secret_here
   - `VITE_DISCORD_CLIENT_ID` = your_client_id_here
   - `VITE_DISCORD_REDIRECT_URI` = https://your-domain.netlify.app/auth/callback

## Step 4: Update Discord Application Settings

1. In Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Select scopes: `identify` and `guilds`
3. Test the OAuth flow with the generated URL

## Features Included

✅ **Discord Sign-In Button** - Users can authenticate with Discord
✅ **User Avatar & Name Display** - Shows Discord profile in header
✅ **Secure Token Exchange** - Uses Netlify Functions for security
✅ **User Dropdown Menu** - Profile info and sign-out option
✅ **Persistent Sessions** - Users stay logged in between visits
✅ **Guild Access** - Can check if users are in your Discord server
✅ **Responsive Design** - Works on all devices

## Security Features

- Client secret is kept secure on the server (Netlify Functions)
- State parameter validation prevents CSRF attacks
- Token expiration handling
- Secure localStorage for session management

## Testing

1. Start your development server: `npm run dev`
2. Click "Sign in with Discord" in the header
3. Complete the OAuth flow
4. You should see your Discord avatar and name in the header

## Production Deployment

1. Deploy to Netlify
2. Set environment variables in Netlify dashboard
3. Update Discord app redirect URI to your production URL
4. Test the live authentication flow

## Troubleshooting

- **"Invalid redirect URI"**: Make sure the redirect URI in Discord matches exactly
- **"Missing client_id"**: Check your environment variables are set correctly
- **Token exchange fails**: Verify your client secret is set in Netlify environment variables
