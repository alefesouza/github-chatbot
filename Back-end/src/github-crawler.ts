const gitHubCrawler = (expressRes) => (error, res, done) => {
  if (error) expressRes.send({ error: true });

  const $ = res.$;

  const repos = [];

  $('ol.repo-list li').each(function() {
    const $this = $(this);

    const getSelector = (selector): string =>
      $this
        .find(selector)
        .text()
        .trim();

    // Pipeline operator :(
    const getNumber = (selector) =>
      parseInt(getSelector(selector).replace(/[^0-9]/g, ''));

    const name = getSelector('h3 a').replace(/ /g, '');

    const repository: Repository = {
      name,
      description: getSelector('.py-1'),
      stars: getNumber('a[href*=stargazers]'),
      recent_stars: getNumber('.float-sm-right'),
      forks: getNumber('a[href*=network]'),
      language: getSelector('span[itemprop=programmingLanguage]'),
    };

    repos.push(repository);
  });

  expressRes.send(repos);

  done();
};

export default gitHubCrawler;
