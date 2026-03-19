const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load environment variables for Pimcore credentials
const PIMCORE_URL = process.env.PIMCORE_BACKEND_URL || 'https://pimcore.example.com';
const PIMCORE_API_KEY = process.env.PIMCORE_API_KEY || 'YOUR_API_KEY';

app.post('/pimcore', async (req, res) => {
  const { query, variables } = req.body;

  try {
    const response = await axios.post(`${PIMCORE_URL}/pimcore-graphql-webservices/bsava?apikey=${PIMCORE_API_KEY}`, 
      {
        query,
        variables
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Pimcore Proxy Error:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'Proxy Error connecting to Pimcore',
      details: error.response ? error.response.data : error.message
    });
  }
});

app.get('/image-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL missing');

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    console.error('Image Proxy Error:', error.message);
    res.status(500).send('Error proxying image');
  }
});

const serverless = require('serverless-http');

// ... (existing endpoints) ...

module.exports.handler = serverless(app);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Pimcore Proxy middleware listening at http://localhost:${port}`);
  });
}
