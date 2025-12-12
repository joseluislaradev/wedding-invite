import { google } from 'googleapis';

// Google Auth setup
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

export async function handler(event) {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
      };
    }

    if (!SPREADSHEET_ID) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'GOOGLE_SPREADSHEET_ID not configured.',
        }),
      };
    }

    if (event.httpMethod === 'GET') {
      // Get all gift reservations
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'GiftTracking!A:D', // Assuming a sheet named "GiftTracking"
        });

        const rows = response.data.values || [];
        const reservations = {};

        // Skip header row
        for (let i = 1; i < rows.length; i++) {
          const [giftId, giftName, reservedBy, reservedDate] = rows[i];
          if (giftId && reservedBy) {
            reservations[giftId] = {
              giftName,
              reservedBy,
              reservedDate,
            };
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            reservations,
          }),
        };
      } catch (error) {
        // If sheet doesn't exist, return empty reservations
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            reservations: {},
          }),
        };
      }
    }

    if (event.httpMethod === 'POST') {
      // Reserve a gift
      const { giftId, giftName, reservedBy } = JSON.parse(event.body);

      if (!giftId || !giftName || !reservedBy) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Missing required fields: giftId, giftName, reservedBy',
          }),
        };
      }

      try {
        // Check if GiftTracking sheet exists, create if not
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId: SPREADSHEET_ID,
        });

        const sheetExists = spreadsheet.data.sheets.some(
          (sheet) => sheet.properties.title === 'GiftTracking'
        );

        if (!sheetExists) {
          // Create the sheet
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: 'GiftTracking',
                    },
                  },
                },
              ],
            },
          });

          // Add headers
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'GiftTracking!A1:D1',
            valueInputOption: 'RAW',
            resource: {
              values: [['Gift ID', 'Gift Name', 'Reserved By', 'Reserved Date']],
            },
          });
        }

        // Check if gift is already reserved
        const existing = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'GiftTracking!A:D',
        });

        const rows = existing.data.values || [];
        const existingRow = rows.findIndex((row) => row[0] === giftId);

        if (existingRow > 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'This gift has already been reserved.',
            }),
          };
        }

        // Add reservation
        const reservedDate = new Date().toISOString();
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: 'GiftTracking!A:D',
          valueInputOption: 'RAW',
          resource: {
            values: [[giftId, giftName, reservedBy, reservedDate]],
          },
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Gift reserved successfully!',
          }),
        };
      } catch (error) {
        console.error('Error reserving gift:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Failed to reserve gift.',
            error: error.message,
          }),
        };
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed.',
      }),
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'Unexpected server error.',
        error: error.message,
      }),
    };
  }
}

