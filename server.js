require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'https://dev-api-frontend.vercel.app', // Adjust origin without trailing slash
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // Enable credentials (cookies, authorization headers)
};

app.use(cors(corsOptions));
app.use(express.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Route to fetch latest GitHub repositories
app.get('/api/github', async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: 'created:>2024-01-01',
        sort: 'stars',
        order: 'desc'
      },
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    // Extract necessary fields from GitHub API response
    const repos = response.data.items.map(repo => ({
      author: repo.owner.login,
      repository_name: repo.name,
      language: repo.language,
      description: repo.description,
      url: repo.html_url
    }));

    res.json(repos);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Route to fetch popular GitHub repositories for a given topic
app.get('/api/github/topic', async (req, res) => {
  const topic = req.query.topic;

  if (!topic) {
    return res.status(400).send('Topic query parameter is required');
  }

  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: `topic:${topic}`,
        sort: 'stars',
        order: 'desc'
      },
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    // Extract necessary fields from GitHub API response
    const repos = response.data.items.map(repo => ({
      author: repo.owner.login,
      repository_name: repo.name,
      language: repo.language,
      description: repo.description,
      url: repo.html_url
    }));

    res.json(repos);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
