import { google } from 'googleapis';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_NAME = process.env.GOOGLE_UPLOAD_CONFIG_SHEET_NAME || 'UploadConfig';

function parseConfigValue(key, value) {
  if (key === 'maxFileSize') {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : value;
  }

  if (key === 'allowedTypes') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value;
}

function createSheetsClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is required to read upload page config.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ success: false, message: 'Method not allowed.' }),
      };
    }

    if (!SPREADSHEET_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'GOOGLE_SPREADSHEET_ID is required to read upload page config.',
        }),
      };
    }

    const sheets = createSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`,
    });

    const rows = response.data.values || [];
    const config = {};

    rows.forEach(([key, value]) => {
      if (!key || value === undefined || key.trim().toLowerCase() === 'key') {
        return;
      }

      const normalizedKey = key.trim();
      config[normalizedKey] = parseConfigValue(normalizedKey, String(value).trim());
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        config,
      }),
    };
  } catch (error) {
    console.error('Error reading upload page config from Google Sheets:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to read upload page config from Google Sheets.',
        error: error.message,
      }),
    };
  }
}
