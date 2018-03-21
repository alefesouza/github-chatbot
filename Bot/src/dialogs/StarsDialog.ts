import * as builder from 'botbuilder';

import fetch from 'node-fetch';

import getRepository from '../utils/get-repository';

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

    return;
  }

  builder.Prompts.text(session, session.gettext('repository_info_error'));
};

const StarsResult: builder.IDialogWaterfallStep = async (session, results) => {
  const repository = await getRepository(session, results);

  if (repository.message) return;

  session.endDialog(
    'stars_response',
    repository.full_name,
    repository.stargazers_count,
  );
};

export default [Stars, StarsResult];
