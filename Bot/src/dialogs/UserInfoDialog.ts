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

  const card = new builder.ThumbnailCard(session)
    .title(`${user}/${repository}`)
    .subtitle(json.description)
    .text(
      `The repository ${user}/${repository} uses the language ${
        json.language
      }, and has ${json.stargazers_count} stars, ${
        json.forks_count
      } forks and ${json.subscribers_count} watchers`,
    )
    .images([
      builder.CardImage.create(
        session,
        'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg',
      ),
    ])
    .buttons([
      builder.CardAction.openUrl(session, json.html_url, 'Open GitHub'),
    ]);

  var msg = new builder.Message(session).addAttachment(card);
  session.send(msg);

  session.endDialog();
};

export default [RepositoryInfo, RepositoryInfoResult];
