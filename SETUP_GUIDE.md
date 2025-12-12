# Complete Setup Guide - Step by Step

This guide will walk you through setting up your FREE wedding website from scratch. Follow each step carefully.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Sheets Setup](#google-sheets-setup)
3. [Google Drive Setup](#google-drive-setup)
4. [Google Cloud Setup](#google-cloud-setup)
5. [Share Folders/Sheets](#share-folderssheets)
6. [Configure Environment Variables](#configure-environment-variables)
7. [Test Locally](#test-locally)
8. [Deploy to Netlify](#deploy-to-netlify)
9. [Custom Domain (Optional)](#custom-domain-optional)

---

## Prerequisites

Before you begin, make sure you have:

- ✅ A Google account (Gmail account works)
- ✅ Node.js installed ([Download here](https://nodejs.org/))
- ✅ A code editor (VS Code recommended)
- ✅ Git installed (optional, for version control)

**No credit card needed for any step!**

---

## Google Sheets Setup

### Purpose
Store blessings/messages and RSVP data from your guests.

### Steps

1. **Go to Google Sheets**
   - Visit [https://sheets.google.com/](https://sheets.google.com/)
   - Sign in with your Google account

2. **Create a New Spreadsheet**
   - Click the "+" button or "Blank" spreadsheet
   - Name it "Wedding Blessings" (or any name you prefer)

3. **Set Up Headers (Optional but Recommended)**
   - In row 1, add these headers:
     - Column A: `Name`
     - Column B: `Email`
     - Column C: `Message`
     - Column D: `Timestamp`
   - Format them as bold (optional)

4. **Get Your Spreadsheet ID**
   - Look at the URL in your browser
   - It will look like: `https://docs.google.com/spreadsheets/d/ABC123XYZ789/edit`
   - Copy the part between `/d/` and `/edit`
   - In this example, it's `ABC123XYZ789`
   - **Save this ID** - you'll need it later

5. **Done!**
   - Your spreadsheet is ready
   - You can close it for now

### What You Should Have
- ✅ A Google Sheet named "Wedding Blessings"
- ✅ Headers in row 1 (Name, Email, Message, Timestamp)
- ✅ Your Spreadsheet ID saved somewhere

---

## Google Drive Setup

### Purpose
Store photos that guests upload to your website.

### Steps

1. **Go to Google Drive**
   - Visit [https://drive.google.com/](https://drive.google.com/)
   - Sign in with your Google account

2. **Create a New Folder**
   - Click "New" > "Folder"
   - Name it "Wedding Photos" (or any name you prefer)
   - Click "Create"

3. **Get Your Folder ID**
   - Open the folder you just created
   - Look at the URL in your browser
   - It will look like: `https://drive.google.com/drive/folders/ABC123XYZ789`
   - Copy the part after `/folders/`
   - In this example, it's `ABC123XYZ789`
   - **Save this ID** - you'll need it later

4. **Share Folder for Photo Gallery (Important!)**
   - Click "Share" on the folder
   - Click "Change to anyone with the link"
   - Set permission to "Viewer"
   - Click "Done"
   - This allows uploaded photos to be displayed in the Photo Gallery

5. **Done!**
   - Your folder is ready
   - You can close it for now

### What You Should Have
- ✅ A Google Drive folder named "Wedding Photos"
- ✅ Folder shared with "Anyone with the link" (Viewer permission)
- ✅ Your Folder ID saved somewhere

---

## Google Cloud Setup

### Purpose
Enable API access so your website can interact with Google Drive and Sheets.

### Steps

#### Part 1: Create a Project

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top (it may say "Select a project")
   - Click "New Project"
   - Project name: "Wedding Website" (or any name)
   - Click "Create"
   - Wait a few seconds for the project to be created

3. **Select Your Project**
   - Click the project dropdown again
   - Select your newly created project

**Important:** If asked about billing, click "Skip" or "Cancel". You don't need a billing account for this.

#### Part 2: Enable APIs

1. **Enable Google Drive API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on "Google Drive API"
   - Click "Enable"
   - Wait for it to enable

2. **Enable Google Sheets API**
   - Still in the Library, search for "Google Sheets API"
   - Click on "Google Sheets API"
   - Click "Enable"
   - Wait for it to enable

#### Part 3: Create Service Account

1. **Go to Service Accounts**
   - In the left sidebar, go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"

2. **Fill in Details**
   - Service account name: "wedding-website" (or any name)
   - Service account ID: Will auto-fill (leave as is)
   - Description: "Service account for wedding website" (optional)
   - Click "Create and Continue"

3. **Skip Role Assignment**
   - You don't need to assign any roles
   - Click "Continue"

4. **Finish**
   - Click "Done"
   - You'll see your service account in the list

#### Part 4: Create Key

1. **Open Your Service Account**
   - Click on the service account you just created

2. **Go to Keys Tab**
   - Click the "Keys" tab at the top

3. **Create New Key**
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Click "Create"
   - A JSON file will download automatically

4. **Save the JSON File**
   - The file will be named something like `wedding-website-abc123.json`
   - Save it somewhere safe (like your Desktop)
   - **Don't lose this file!** You'll need it later

5. **Get Service Account Email**
   - Still on the service account page
   - Copy the email address (looks like `wedding-website@project-id.iam.gserviceaccount.com`)
   - **Save this email** - you'll need it in the next step

### What You Should Have
- ✅ A Google Cloud project created
- ✅ Google Drive API enabled
- ✅ Google Sheets API enabled
- ✅ A service account created
- ✅ A JSON key file downloaded
- ✅ Service account email saved

---

## Share Folders/Sheets

### Purpose
Give your service account permission to access your Drive folder and Sheet.

### Steps

#### Share Google Drive Folder

1. **Open Your Drive Folder**
   - Go to [Google Drive](https://drive.google.com/)
   - Open the "Wedding Photos" folder you created earlier

2. **Share the Folder**
   - Click the "Share" button (top right)
   - In the "Add people and groups" field, paste your service account email
   - Click the dropdown next to the email and select "Editor"
   - Click "Send"
   - You can uncheck "Notify people" if you want

3. **Verify**
   - You should see the service account email in the sharing list
   - Make sure it has "Editor" permissions

#### Share Google Sheet

1. **Open Your Sheet**
   - Go to [Google Sheets](https://sheets.google.com/)
   - Open the "Wedding Blessings" sheet you created earlier

2. **Share the Sheet**
   - Click the "Share" button (top right)
   - In the "Add people and groups" field, paste your service account email
   - Click the dropdown next to the email and select "Editor"
   - Click "Send"
   - You can uncheck "Notify people" if you want

3. **Verify**
   - You should see the service account email in the sharing list
   - Make sure it has "Editor" permissions

### What You Should Have
- ✅ Google Drive folder shared with service account (Editor access)
- ✅ Google Sheet shared with service account (Editor access)

---

## Configure Environment Variables

### Purpose
Connect your website to Google services using the credentials you just created.

### Steps

1. **Copy the Example File**
   - In your project folder, copy `env.example.txt` to `.env`
   - On Mac/Linux: `cp env.example.txt .env`
   - On Windows: `copy env.example.txt .env`

2. **Open the .env File**
   - Open `.env` in your code editor
   - You'll see placeholders for all the values you need

3. **Add GOOGLE_SERVICE_ACCOUNT_JSON**
   - Open the JSON file you downloaded from Google Cloud
   - Copy the ENTIRE contents (it's one long line starting with `{` and ending with `}`)
   - In `.env`, find the line: `GOOGLE_SERVICE_ACCOUNT_JSON=`
   - Paste the JSON after the `=` sign
   - **Important:** It must be on one line, no line breaks
   - Example:
     ```
     GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}
     ```

4. **Add GOOGLE_DRIVE_FOLDER_ID**
   - In `.env`, find: `GOOGLE_DRIVE_FOLDER_ID=`
   - Paste your folder ID (the one you saved from Google Drive setup)
   - Example:
     ```
     GOOGLE_DRIVE_FOLDER_ID=ABC123XYZ789
     ```

5. **Add GOOGLE_SPREADSHEET_ID**
   - In `.env`, find: `GOOGLE_SPREADSHEET_ID=`
   - Paste your spreadsheet ID (the one you saved from Google Sheets setup)
   - Example:
     ```
     GOOGLE_SPREADSHEET_ID=XYZ789ABC123
     ```

6. **Add REACT_APP_RSVP_API_URL (Optional)**
   - If you're using Google Apps Script for RSVP, add the URL here
   - Otherwise, leave it empty:
     ```
     REACT_APP_RSVP_API_URL=
     ```

7. **Save the File**
   - Save `.env`
   - **Important:** Never commit this file to git! It's already in `.gitignore`

### What Your .env Should Look Like

```
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id",...}
GOOGLE_DRIVE_FOLDER_ID=ABC123XYZ789
GOOGLE_SPREADSHEET_ID=XYZ789ABC123
REACT_APP_RSVP_API_URL=
```

### What You Should Have
- ✅ A `.env` file with all your credentials filled in
- ✅ All values are correct (double-check IDs!)

---

## Test Locally

### Purpose
Make sure everything works before deploying.

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```
   - Your browser should open automatically
   - If not, go to `http://localhost:3000`

3. **Test Photo Upload**
   - Navigate to "Upload Photos" page
   - Upload a test photo
   - Check your Google Drive folder - the photo should appear there
   - If it doesn't, check:
     - Service account has Editor access to folder
     - `GOOGLE_DRIVE_FOLDER_ID` is correct
     - `GOOGLE_SERVICE_ACCOUNT_JSON` is valid

4. **Test Blessings**
   - Navigate to "Blessings" page
   - Submit a test blessing
   - Check your Google Sheet - the blessing should appear there
   - If it doesn't, check:
     - Service account has Editor access to sheet
     - `GOOGLE_SPREADSHEET_ID` is correct
     - `GOOGLE_SERVICE_ACCOUNT_JSON` is valid

5. **Test Other Features**
   - Browse through all pages
   - Check that navigation works
   - Verify countdown timer shows correct date
   - Test RSVP form (if enabled)

### Troubleshooting Local Testing

**Photos not uploading?**
- Check browser console for errors (F12)
- Verify folder ID is correct
- Make sure service account has Editor access

**Blessings not saving?**
- Check browser console for errors (F12)
- Verify spreadsheet ID is correct
- Make sure service account has Editor access

**Environment variables not loading?**
- Make sure `.env` file is in the root directory
- Restart the development server after changing `.env`
- Check that variable names match exactly (case-sensitive)

### What You Should Have
- ✅ Website running locally at `http://localhost:3000`
- ✅ Photo upload working (photos appear in Drive)
- ✅ Blessings working (messages appear in Sheet)
- ✅ All features functioning correctly

---

## Deploy to Netlify

### Purpose
Make your website live on the internet for free.

### Steps

#### Part 1: Prepare Your Code

1. **Make Sure .env is NOT Committed**
   - Check `.gitignore` includes `.env`
   - Never commit your `.env` file!

2. **Push to GitHub (if not already)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

#### Part 2: Connect to Netlify

1. **Sign Up for Netlify**
   - Go to [https://www.netlify.com/](https://www.netlify.com/)
   - Click "Sign up" (use GitHub to sign up - easiest)
   - Complete the signup process

2. **Create New Site**
   - Click "Add new site" > "Import an existing project"
   - Choose "GitHub"
   - Authorize Netlify to access your GitHub (if first time)
   - Select your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Click "Deploy site"

4. **Wait for Deployment**
   - Netlify will build your site
   - This takes 1-2 minutes
   - You'll see build logs

#### Part 3: Add Environment Variables

1. **Go to Site Settings**
   - In your Netlify dashboard, go to your site
   - Click "Site settings"

2. **Add Environment Variables**
   - Click "Environment variables" in the left sidebar
   - Click "Add variable"
   - Add each variable from your `.env` file:
     
     **Variable 1:**
     - Key: `GOOGLE_SERVICE_ACCOUNT_JSON`
     - Value: Paste your entire JSON (same as in `.env`)
     - Click "Save"
     
     **Variable 2:**
     - Key: `GOOGLE_DRIVE_FOLDER_ID`
     - Value: Your folder ID
     - Click "Save"
     
     **Variable 3:**
     - Key: `GOOGLE_SPREADSHEET_ID`
     - Value: Your spreadsheet ID
     - Click "Save"
     
     **Variable 4 (if using):**
     - Key: `REACT_APP_RSVP_API_URL`
     - Value: Your Apps Script URL (or leave empty)
     - Click "Save"

3. **Redeploy**
   - Go to "Deploys" tab
   - Click "Trigger deploy" > "Clear cache and deploy site"
   - Wait for deployment to complete

#### Part 4: Test Your Live Site

1. **Visit Your Site**
   - Netlify gives you a URL like `your-site-name.netlify.app`
   - Visit it in your browser

2. **Test All Features**
   - Upload a photo (check Drive)
   - Submit a blessing (check Sheet)
   - Test RSVP form
   - Verify all pages work

### What You Should Have
- ✅ Website live on Netlify
- ✅ All environment variables set in Netlify dashboard
- ✅ All features working on live site
- ✅ Your Netlify URL (e.g., `your-site.netlify.app`)

---

## Custom Domain (Optional)

### Purpose
Use your own domain name instead of `your-site.netlify.app`.

### Steps

1. **Buy a Domain (if you don't have one)**
   - Use any domain registrar (Namecheap, Google Domains, etc.)
   - Cost: ~$10-15/year

2. **Add Domain in Netlify**
   - Go to Site Settings > Domain Management
   - Click "Add custom domain"
   - Enter your domain
   - Follow Netlify's instructions to update DNS

3. **Wait for DNS Propagation**
   - Usually takes a few hours
   - Netlify will show status

### What You Should Have
- ✅ Custom domain connected (optional)
- ✅ Website accessible at your custom domain

---

## Next Steps

1. **Customize Your Content**
   - Edit `src/siteConfig.js` with your details
   - Add your photos
   - Customize events, stories, etc.

2. **Test Everything**
   - Have friends test the site
   - Check all features work
   - Verify data appears in Drive/Sheets

3. **Share Your Website**
   - Send the link to your guests
   - Share on social media
   - Add to wedding invitations

---

## Common Issues & Solutions

### Issue: "Permission denied" error
**Solution:** Make sure service account has Editor access to both folder and sheet

### Issue: Photos not uploading
**Solution:** 
- Check `GOOGLE_DRIVE_FOLDER_ID` is correct
- Verify service account JSON is valid
- Check browser console for specific errors

### Issue: Blessings not saving
**Solution:**
- Check `GOOGLE_SPREADSHEET_ID` is correct
- Verify service account JSON is valid
- Make sure sheet headers match expected format

### Issue: Environment variables not working on Netlify
**Solution:**
- Make sure variables are set in Netlify dashboard (not just `.env`)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

---

## Support

If you run into issues:
1. Check the troubleshooting section above
2. Review the error messages in browser console
3. Check Netlify build logs
4. Open an issue on GitHub

---

**Congratulations!** You now have a fully functional, FREE wedding website! 🎉

