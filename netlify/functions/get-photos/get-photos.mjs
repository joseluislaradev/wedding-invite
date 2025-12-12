import { google } from 'googleapis';

// Google Auth setup
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

// Get folder ID from environment variable
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      };
    }

    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Method not allowed.' }),
      };
    }

    if (!FOLDER_ID) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false, 
          message: 'GOOGLE_DRIVE_FOLDER_ID not configured.' 
        }),
      };
    }

    console.log('Fetching photos from Google Drive folder:', FOLDER_ID);

    // List all files in the folder
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed=false`,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, thumbnailLink)',
      orderBy: 'createdTime desc', // Newest first
    });

    const files = response.data.files || [];

    // Generate viewable URLs for each file
    // Note: Files need to be shared publicly or with "Anyone with the link" for these URLs to work
    const photos = files.map((file) => {
      // Generate direct view URL (works if file is shared publicly)
      // Format: https://drive.google.com/uc?export=view&id=FILE_ID
      const viewUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
      
      // Alternative: Use thumbnail API (works better for images)
      // Format: https://drive.google.com/thumbnail?id=FILE_ID&sz=w800
      const thumbnailUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w800-h800`;
      
      // For better compatibility, also provide the download URL format
      // This works if the file is shared with the service account
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;

      return {
        id: file.id,
        name: file.name,
        url: viewUrl, // Primary view URL
        thumbnailUrl: thumbnailUrl, // Thumbnail for grid view
        downloadUrl: downloadUrl, // Download URL (fallback)
        caption: file.name,
        date: file.createdTime || file.modifiedTime,
        category: 'uploaded',
      };
    });

    console.log(`Found ${photos.length} photos`);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        photos,
        count: photos.length,
      }),
    };
  } catch (error) {
    console.error('Error fetching photos:', error.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to fetch photos.',
        error: error.message,
      }),
    };
  }
}

