import { google } from 'googleapis';
import { createWriteStream, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';
import Busboy from 'busboy';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const corsHeaders = {
  ...headers,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'GOOGLE_DRIVE_FOLDER_ID',
];

function getMissingEnvVars() {
  return requiredEnvVars.filter((name) => !process.env[name]);
}

function createDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ success: false, message: 'Method not allowed.' }),
      };
    }

    const missingEnvVars = getMissingEnvVars();
    if (missingEnvVars.length > 0) {
      const message = `Missing required upload environment variables: ${missingEnvVars.join(', ')}`;
      console.error(message);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message }),
      };
    }

    console.log('Processing file upload...');
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    console.log('Received Content-Type:', contentType);

    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('Invalid Content-Type:', contentType);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid Content-Type header.' }),
      };
    }

    const drive = createDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const bodyBuffer = Buffer.from(event.body, 'base64'); // Lambda sends body as base64
    const busboy = Busboy({ headers: { 'content-type': contentType } });
    const uploadedFiles = [];
    const uploadPromises = [];

    return new Promise((resolve) => {
      busboy.on('file', (fieldname, file, fileDetails) => {
        console.log(`Processing file: ${fileDetails.filename}`);
        const uploadPromise = new Promise((res, rej) => {
          const filename = fileDetails.filename || `unknown_${Date.now()}`;
          const tempFilePath = join('/tmp', filename);
          const writeStream = createWriteStream(tempFilePath);

          file.pipe(writeStream);

          writeStream.on('finish', async () => {
            try {
              const fileMetadata = { name: filename, parents: [folderId] };
              const media = {
                mimeType: fileDetails.mimeType || 'application/octet-stream',
                body: createReadStream(tempFilePath),
              };

              const response = await drive.files.create({
                requestBody: fileMetadata,
                media,
                fields: 'id, name, webViewLink',
              });

              uploadedFiles.push(response.data);
              console.log(`Uploaded file to Drive: ${response.data.name} (${response.data.id})`);
              unlinkSync(tempFilePath); // Clean up temporary file
              res();
            } catch (error) {
              console.error('Error uploading file to Google Drive:', {
                filename,
                message: error.message,
                code: error.code,
              });
              try {
                unlinkSync(tempFilePath); // Clean up on error
              } catch (cleanupError) {
                console.error('Error cleaning temporary upload file:', cleanupError.message);
              }
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
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Files uploaded successfully!',
              files: uploadedFiles,
              fileIds: uploadedFiles.map((file) => file.id),
            }),
          });
        } catch (error) {
          console.error('Error completing Google Drive upload:', {
            message: error.message,
            code: error.code,
          });
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'File upload to Google Drive failed.',
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
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Unexpected server error.',
        error: error.message,
      }),
    };
  }
}
