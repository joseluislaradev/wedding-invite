import http from 'http';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { google } from 'googleapis';

const DEFAULT_PORT = 3333;
const DEFAULT_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const rl = readline.createInterface({ input, output });

async function promptIfMissing(label, value) {
  if (value) {
    return value;
  }

  return rl.question(`${label}: `);
}

function waitForOAuthCallback(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>OAuth failed</h1><p>You can close this tab.</p>');
        server.close();
        reject(new Error(error));
        return;
      }

      if (!code) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>OAuth complete</h1><p>You can return to your terminal.</p>');
      server.close();
      resolve(code);
    });

    server.listen(port, () => {
      console.log(`Waiting for Google OAuth callback on http://localhost:${port}/oauth2callback`);
    });

    server.on('error', reject);
  });
}

try {
  const port = Number(process.env.GOOGLE_OAUTH_LOCAL_PORT || DEFAULT_PORT);
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${port}/oauth2callback`;
  const scope = process.env.GOOGLE_DRIVE_OAUTH_SCOPE || DEFAULT_SCOPE;
  const clientId = await promptIfMissing('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID);
  const clientSecret = await promptIfMissing('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET);

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [scope],
  });

  console.log('\n1. Add this redirect URI to your Google OAuth client if it is not already there:');
  console.log(`   ${redirectUri}`);
  console.log('\n2. Open this URL and approve access with the Google account that owns the Drive folder:\n');
  console.log(authUrl);
  console.log('\n3. After approval, this script will print GOOGLE_REFRESH_TOKEN.\n');

  const code = await waitForOAuthCallback(port);
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      'Google did not return a refresh token. Revoke the app access from your Google account, then run this script again.'
    );
  }

  console.log('\nAdd this value to Netlify environment variables and your local .env:');
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
} catch (error) {
  console.error('\nFailed to get refresh token:', error.message);
  process.exitCode = 1;
} finally {
  rl.close();
}
