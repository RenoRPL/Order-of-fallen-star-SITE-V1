# Google Sheets API Setup Guide

## Step 1: Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Create a new project: "OFS-Website" 
3. Enable APIs:
   - Google Sheets API
   - Google Drive API (optional, for file access)

## Step 2: Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: "ofs-sheets-service"
4. Description: "Service account for OFS website Google Sheets access"
5. Click "Create and Continue"
6. Skip role assignment (we'll use sheet-level permissions)
7. Click "Done"

## Step 3: Generate Credentials

1. Click on your new service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Download the JSON file
6. **IMPORTANT: Keep this file secure!**

## Step 4: Share Spreadsheet

1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (from the JSON file, looks like: ofs-sheets-service@your-project.iam.gserviceaccount.com)
4. Give "Editor" permissions
5. Click "Send"

## Step 5: Netlify Environment Variables

Add these to your Netlify site settings → Environment variables:

```
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n[your private key]\n-----END PRIVATE KEY-----
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PROJECT_ID=your-project-id
GOOGLE_SPREADSHEET_ID=12OiRHpEALj1hzXRxaXgBOWjHtmUT5hg2ztxIgr4J4y8
```

## Step 6: Install Dependencies

```bash
npm install googleapis
```

## Step 7: Implementation

The code is ready in `googleSheetsWriteService.js` - just add the environment variables and it will work!

## Security Notes

- Never commit the JSON credentials to git
- Use environment variables only
- Limit service account permissions to specific sheets
- Regularly rotate credentials if needed

## Testing

Once set up, you can test with:
```
POST /.netlify/functions/update-member-verification
{
  "discordId": "123456789",
  "verified": true,
  "rsiHandle": "TestUser"
}
```