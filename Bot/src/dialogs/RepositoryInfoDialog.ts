import * as builder from 'botbuilder';

import fetch from 'node-fetch';

import getRepository from '../utils/get-repository';

const RepositoryInfo: builder.IDialogWaterfallStep = (session, args, next) => {
  const userEntity = builder.EntityRecognizer.findEntity(
    args.intent.entities,
    'user',
  );

  const repositoryEntity = builder.EntityRecognizer.findEntity(
    args.intent.entities,
    'repository',
  );

  if (userEntity && repositoryEntity) {
    next({
      response: userEntity.entity + '/' + repositoryEntity.entity,
    });
  } else {
    builder.Prompts.text(session, session.gettext('repository_info_error'));
  }
};

const RepositoryInfoResult: builder.IDialogWaterfallStep = async (
  session,
  results,
) => {
  const repository = await getRepository(session, results);

  if (repository.message) {
    return;
  }

  const buttons = [
    builder.CardAction.openUrl(session, repository.html_url, 'GitHub'),
  ];

  if (repository.homepage) {
    buttons.push(
      builder.CardAction.openUrl(session, repository.homepage, 'Website'),
    );
  }

  const card = new builder.ThumbnailCard(session)
    .title(repository.full_name)
    .subtitle(repository.description)
    .text(
      session.gettext(
        'repository_info_response',
        repository.full_name,
        repository.language,
        repository.stargazers_count,
        repository.forks_count,
        repository.subscribers_count,
      ),
    )
    .images([builder.CardImage.create(session, repository.owner.avatar_url)])
    .buttons(buttons);

  const msg = new builder.Message(session).addAttachment(card);
  session.send(msg);

  session.endDialog();
};

export default [RepositoryInfo, RepositoryInfoResult];
