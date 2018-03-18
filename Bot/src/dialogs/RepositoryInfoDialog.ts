import * as builder from 'botbuilder';
import fetch from 'node-fetch';

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
      response: {
        user: userEntity.entity,
        repository: repositoryEntity.entity,
      },
    });
  } else {
    builder.Prompts.text(
      session,
      'Please enter the repository in the format user/repository',
    );
  }
};

const RepositoryInfoResult: builder.IDialogWaterfallStep = async (
  session,
  results,
) => {
  const { user, repository } = results.response;

  const repoInfo = await fetch(
    `https://api.github.com/repos/${user}/${repository}`,
  );
  const json = await repoInfo.json();

  const buttons = [
    builder.CardAction.openUrl(session, json.html_url, 'GitHub'),
  ];

  if (json.homepage) {
    buttons.push(builder.CardAction.openUrl(session, json.homepage, 'Website'));
  }

  const card = new builder.ThumbnailCard(session)
    .title(`${user}/${repository}`)
    .subtitle(json.description)
    .text(
      session.gettext(
        'repository_info_response',
        `${user}/${repository}`,
        json.language,
        json.stargazers_count,
        json.forks_count,
        json.subscribers_count,
      ),
    )
    .images([builder.CardImage.create(session, json.owner.avatar_url)])
    .buttons(buttons);

  const msg = new builder.Message(session).addAttachment(card);
  session.send(msg);

  session.endDialog();
};

export default [RepositoryInfo, RepositoryInfoResult];
