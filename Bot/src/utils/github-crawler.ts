import Crawler from 'crawler';

const c = new Crawler({
  maxConnections: 10,
});

const getCrawlerInfo = ($) => {
  const repos = [];

  const getSelector = (elem, selector): string =>
    elem
      .find(selector)
      .text()
      .trim();

  const getNumber = (elem, selector) =>
    parseInt(getSelector(elem, selector).replace(/[^0-9]/g, ''));

  $('ol.repo-list li').each(function() {
    const $this = $(this);

    const name = getSelector($this, 'h3 a').replace(/ /g, '');

    const repository: Repository = {
      name,
      description: getSelector($this, '.py-1'),
      stars: getNumber($this, 'a[href*=stargazers]'),
      recent_stars: getNumber($this, '.float-sm-right'),
      forks: getNumber($this, 'a[href*=network]'),
      language: getSelector($this, 'span[itemprop=programmingLanguage]'),
    };

    repos.push(repository);
  });

  return repos;
};

const gitHubCrawler = (uri) =>
  new Promise<Repository[]>((resolve, reject) => {
    c.queue([
      {
        uri,
        callback: (err, res, done) => {
          if (err) reject();

          const $ = res.$;

          const repos: Repository[] = getCrawlerInfo($);

          resolve(repos);

          done();
        },
      },
    ]);
  });

const getTrendings = (language: string, since: string) => {
  let uri = 'https://github.com/trending/';

  if (language) {
    uri += language;
  }

  if (since) {
    uri += '?since=' + since;
  }

  return gitHubCrawler(uri);
};

export default getTrendings;
