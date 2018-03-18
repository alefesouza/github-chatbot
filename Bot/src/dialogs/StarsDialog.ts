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
      response: userEntity.entity + '/' + repositoryEntity.entity,
    });
  } else {
    builder.Prompts.text(session, session.gettext('repository_info_error'));
  }
};

const StarsResult: builder.IDialogWaterfallStep = async (session, results) => {
  const repository = results.response;

  session.sendTyping();

  const repoInfo = await fetch(`https://api.github.com/repos/${repository}`);
  const json = await repoInfo.json();

  session.send('stars_response', repository, json.stargazers_count);

  session.endDialog();
};

export default [Stars, StarsResult];
