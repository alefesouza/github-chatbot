import * as builder from 'botbuilder';
import fetch from 'node-fetch';

const Stars: builder.IDialogWaterfallStep = (session, args, next) => {
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

const StarsResult: builder.IDialogWaterfallStep = async (session, results) => {
  const { user, repository } = results.response;

  const repoInfo = await fetch(
    `https://api.github.com/repos/${user}/${repository}`,
  );
  const json = await repoInfo.json();

  session.send(
    `The repository ${user}/${repository} has ${json.stargazers_count} stars.`,
  );

  session.endDialog();
};

export default [Stars, StarsResult];
