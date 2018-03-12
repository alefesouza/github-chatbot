import * as builder from 'botbuilder';

const RepositoryInfo: builder.IDialogWaterfallStep = (session, args, next) => {
  session.send('repository_info_welcome', session.message.text);

  const repositoryEntity = builder.EntityRecognizer.findEntity(
    args.intent.entities,
    'repository',
  );

  if (repositoryEntity) {
    session.dialogData.searchType = 'repository';

    next({ response: repositoryEntity.entity });
  } else {
    builder.Prompts.text(
      session,
      'Please enter the repository in the format user/repository',
    );
  }
};

const RepositoryInfoResult: builder.IDialogWaterfallStep = (
  session,
  results,
) => {
  const repository = results.response;

  session.endDialog();
};

export default [RepositoryInfo, RepositoryInfoResult];
