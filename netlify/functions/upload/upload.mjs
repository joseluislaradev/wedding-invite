import { google } from 'googleapis';
import { createWriteStream, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';
import Busboy from 'busboy';

// Google Auth setup
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Get folder ID from environment variable
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!FOLDER_ID) {
  console.error('ERROR: GOOGLE_DRIVE_FOLDER_ID environment variable is not set');
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Method not allowed.' }),
      };
    }

    console.log('Processing file upload...');
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    console.log('Received Content-Type:', contentType);

    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('Invalid Content-Type:', contentType);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Invalid Content-Type header.' }),
      };
    }

    const bodyBuffer = Buffer.from(event.body, 'base64'); // Lambda sends body as base64
    const busboy = new Busboy({ headers: { 'content-type': contentType } });
    const fileIds = [];
    const uploadPromises = [];

    return new Promise((resolve, reject) => {
      busboy.on('file', (fieldname, file, fileDetails, encoding, mimetype) => {
        console.log(`Processing file: ${fileDetails.filename}`);
        const uploadPromise = new Promise((res, rej) => {
          const filename = fileDetails.filename || `unknown_${Date.now()}`;
          const tempFilePath = join('/tmp', filename);
          const writeStream = createWriteStream(tempFilePath);

          file.pipe(writeStream);

          file.on('end', async () => {
            try {
              const fileMetadata = { name: filename, parents: [FOLDER_ID] };
              const media = { mimeType: mimetype, body: createReadStream(tempFilePath) };

              const response = await drive.files.create({
                resource: fileMetadata,
                media,
                fields: 'id',
              });

              fileIds.push(response.data.id);
              console.log(`Uploaded file ID: ${response.data.id}`);
              unlinkSync(tempFilePath); // Clean up temporary file
              res();
            } catch (error) {
              console.error('Error during file upload:', error.message);
              unlinkSync(tempFilePath); // Clean up on error
              rej(error);
            }
          });

          file.on('error', (error) => {
            console.error('File stream error:', error.message);
            rej(error);
          });
        });

        uploadPromises.push(uploadPromise);
      });

      busboy.on('finish', async () => {
        try {
          await Promise.all(uploadPromises);
          resolve({
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
              success: true,
              message: 'Files uploaded successfully!',
              fileIds,
            }),
          });
        } catch (error) {
          console.error('Error completing upload:', error.message);
          reject({
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
              success: false,
              message: 'File upload failed.',
              error: error.message,
            }),
          });
        }
      });

      busboy.end(bodyBuffer);
    });
  } catch (error) {
    console.error('Unexpected server error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: false,
        message: 'Unexpected server error.',
        error: error.message,
      }),
    };
  }
}