import { google } from 'googleapis';

// Google Auth setup
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Google Sheets configuration - get from environment variable
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

if (!SPREADSHEET_ID) {
  console.error('ERROR: GOOGLE_SPREADSHEET_ID environment variable is not set');
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default async (request) => {
  try {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers });
    }

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method not allowed.' }),
        { status: 405, headers }
      );
    }

    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, message: 'All fields are required.' }),
        { status: 400, headers }
      );
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:D1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, email, message, new Date().toLocaleString()]],
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Blessing submitted successfully!' }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error in submit-blessing:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to submit blessing.',
        error: error.message,
      }),
      { status: 500, headers }
    );
  }
};