require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Busboy = require('busboy');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Enable CORS for communication with the frontend
app.use(cors({ origin: CORS_ORIGIN }));
app.use(bodyParser.json()); // Parse JSON body for blessings

// Validate required environment variables
if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  console.error('ERROR: GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
  console.error('Please set it in your .env file. See .env.example for reference.');
  process.exit(1);
}

if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
  console.error('ERROR: GOOGLE_DRIVE_FOLDER_ID environment variable is required');
  console.error('Please set it in your .env file. See .env.example for reference.');
  process.exit(1);
}

if (!process.env.GOOGLE_SPREADSHEET_ID) {
  console.error('ERROR: GOOGLE_SPREADSHEET_ID environment variable is required');
  console.error('Please set it in your .env file. See .env.example for reference.');
  process.exit(1);
}

// Google Auth setup
let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error('ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON');
  console.error('Please ensure it is a valid JSON string in your .env file.');
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

// Google Drive and Sheets configuration
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// Upload files to Google Drive
app.post('/upload', (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  const fileIds = [];
  const uploadPromises = [];

  req.pipe(busboy);

  busboy.on('file', (fieldname, file, fileDetails, encoding, mimetype) => {
    const uploadPromise = new Promise((resolve, reject) => {
      const filename = fileDetails?.filename || `unknown_${Date.now()}`;
      console.log('Received file:', { fieldname, filename, encoding, mimetype });

      const tempFilePath = path.join(__dirname, 'uploads', filename);
      const writeStream = fs.createWriteStream(tempFilePath);
      file.pipe(writeStream);

      file.on('end', async () => {
        try {
          const fileMetadata = {
            name: filename,
            parents: [FOLDER_ID],
          };
          const media = {
            mimeType: mimetype || 'application/octet-stream',
            body: fs.createReadStream(tempFilePath),
          };
          const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
          });

          fileIds.push(response.data.id);
          console.log(`File uploaded: ${filename} (ID: ${response.data.id})`);
          fs.unlinkSync(tempFilePath);
          resolve();
        } catch (error) {
          console.error(`Error uploading file ${filename}:`, error.message);
          reject(error);
        }
      });

      file.on('error', (error) => {
        console.error(`Error processing file ${filename}:`, error.message);
        reject(error);
      });
    });

    uploadPromises.push(uploadPromise);
  });

  busboy.on('finish', () => {
    Promise.all(uploadPromises)
      .then(() => {
        console.log('All files processed.');
        res.status(200).json({
          success: true,
          message: fileIds.length
            ? `Files uploaded successfully!`
            : 'No files were uploaded.',
          fileIds,
        });
      })
      .catch((error) => {
        console.error('Error processing files:', error.message);
        res.status(500).json({ success: false, message: 'File upload failed' });
      });
  });

  req.on('error', (err) => {
    console.error('Request error:', err.message);
    res.status(500).json({ success: false, message: 'File upload failed' });
  });
});

// Submit blessings to Google Sheets
app.post('/submit-blessing', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: 'All fields are required.' });
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:D1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, email, message, new Date().toLocaleString()]],
      },
    });

    res.status(200).json({ success: true, message: 'Blessing submitted successfully!' });
  } catch (error) {
    console.error('Error submitting blessing:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit blessing.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});