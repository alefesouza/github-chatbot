import * as builder from 'botbuilder';

import getTrendings from './../utils/github-crawler';

const Trending: builder.IDialogWaterfallStep = (session, args, next) => {
  const datetimeEntity = builder.EntityRecognizer.findEntity(
    args.intent.entities,
    'builtin.datetimeV2.daterange',
  );

  const languageEntity = builder.EntityRecognizer.findEntity(
    args.intent.entities,
    'language',
  );

  next({
    response: {
      datetime: datetimeEntity,
      language: languageEntity ? languageEntity.entity : null,
    },
  });
};

const TrendingResult: builder.IDialogWaterfallStep = async (
  session,
  results,
) => {
  let { datetime, language } = results.response;

  let since = '';
  let period = session.gettext('trending_today');

  if (datetime) {
    const week = new Date();
    // I am adding 7 + 1 due to time differences that I don't want to deal with right now zzzzz
    week.setDate(week.getDate() - 8);

    const month = new Date();
    month.setDate(month.getDate() - 32);

    const { start } = datetime.resolution.values[0];
    const entityDate = new Date(start);

    if (week <= entityDate) {
      since = 'weekly';
      period = session.gettext('trending_by_week');
    } else if (month <= entityDate) {
      since = 'monthly';
      period = session.gettext('trending_by_month');
    }
  }

  const theLanguage = language
    ? language
    : session.gettext('trending_all_languages');

  session.send('trending_consulting', theLanguage, period);

  session.sendTyping();

  const typingInterval = setInterval(() => {
    session.sendTyping();
  }, 2000);

  const repositories = await getTrendings(language, since);

  const cards = [];

  for (let repository of repositories) {
    const card = new builder.ThumbnailCard(session)
      .title(repository.name)
      .subtitle(repository.description)
      .text(
        session.gettext(
          'trending_info_response',
          repository.name,
          repository.language,
          repository.stars,
          repository.forks,
          repository.recent_stars,
        ),
      )
      .images([
        builder.CardImage.create(
          session,
          `https://github.com/${repository.owner}.png`,
        ),
      ])
      .buttons([
        builder.CardAction.openUrl(
          session,
          'https://github.com/' + repository.name,
          'GitHub',
        ),
      ]);

    cards.push(card);
  }

  const response = new builder.Message(session)
    .attachmentLayout(builder.AttachmentLayout.carousel)
    .attachments(cards);

  clearInterval(typingInterval);

  session.send(response);

  session.endDialog();
};

export default [Trending, TrendingResult];
