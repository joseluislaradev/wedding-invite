const { pathToFileURL } = require('url');
const path = require('path');

const functions = {
  upload: {
    file: 'netlify/functions/upload/upload.mjs',
    type: 'event',
  },
  'get-photos': {
    file: 'netlify/functions/get-photos/get-photos.mjs',
    type: 'event',
  },
  'gift-status': {
    file: 'netlify/functions/gift-status/gift-status.mjs',
    type: 'event',
  },
  'submit-blessings': {
    file: 'netlify/functions/submit-blessings/submit-blessings.mjs',
    type: 'request',
  },
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function setHeaders(res, headers = {}) {
  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined) {
      res.setHeader(key, value);
    }
  });
}

module.exports = function setupProxy(app) {
  app.all('/.netlify/functions/:functionName', async (req, res) => {
    const functionConfig = functions[req.params.functionName];

    if (!functionConfig) {
      res.status(404).json({
        success: false,
        message: `Local function "${req.params.functionName}" is not configured.`,
      });
      return;
    }

    try {
      const body = await readBody(req);
      const modulePath = path.resolve(__dirname, '..', functionConfig.file);
      const functionModule = await import(pathToFileURL(modulePath).href);

      if (functionConfig.type === 'request') {
        const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const requestOptions = {
          method: req.method,
          headers: req.headers,
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
          requestOptions.body = body;
        }

        const response = await functionModule.default(new Request(requestUrl, requestOptions));
        setHeaders(res, Object.fromEntries(response.headers.entries()));
        res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
        return;
      }

      const result = await functionModule.handler({
        httpMethod: req.method,
        headers: req.headers,
        body: body.toString('base64'),
        isBase64Encoded: true,
        path: req.originalUrl,
        queryStringParameters: req.query,
      });

      setHeaders(res, result.headers);
      res.status(result.statusCode || 200).send(result.body || '');
    } catch (error) {
      console.error(`Local Netlify function failed: ${req.originalUrl}`, error);
      res.status(500).json({
        success: false,
        message: 'Local Netlify function failed.',
        error: error.message,
      });
    }
  });
};
