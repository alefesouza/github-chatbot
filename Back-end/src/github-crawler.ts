const gitHubCrawler = (expressRes) => (error, res, done) => {
  if (error) expressRes.send({ error: true });

  const $ = res.$;

  const repos = [];

  $('ol.repo-list li').each(function() {
    const $this = $(this);

    const getSelector = (selector) =>
      $this
        .find(selector)
        .text()
        .trim();

    const url = getSelector('h3 a').replace(/ /g, '');

    const repository = {
      url,
      description: getSelector('.py-1'),
      stars: getSelector('a[href*=stargazers]'),
      stars_this_week: getSelector('.float-sm-right'),
      forks: getSelector('a[href*=network]'),
      languages: getSelector('span[itemprop=programmingLanguage]'),
    };

    repos.push(repository);
  });

  expressRes.send(repos);

  done();
};

export default gitHubCrawler;
