const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

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
    const response = await axios.post(`${PIMCORE_URL}/admin/bundle/pimcoredatahub/graphql/default`, 
      {
        query,
        variables
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': PIMCORE_API_KEY
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

app.listen(port, () => {
  console.log(`Pimcore Proxy middleware listening at http://localhost:${port}`);
});
