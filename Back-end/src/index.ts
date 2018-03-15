import express from 'express';
import Crawler from 'crawler';

import githubCrawler from './github-crawler';

const c = new Crawler({
  maxConnections: 10,
});

const app = express();

app.get('/', (req, res) => {
  let uri = 'https://github.com/trending/';

  const language = req.query.language;
  const since = req.query.since;

  if (language) {
    uri += language;
  }

  if (since) {
    uri += '?since=' + since;
  }

  c.queue([
    {
      uri,
      callback: githubCrawler(res),
    },
  ]);
});

app.listen(3000, () => {
  console.log('App running on http://localhost:3000');
});
