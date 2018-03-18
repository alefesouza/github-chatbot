import * as builder from 'botbuilder';

import fetch from 'node-fetch';

const getRepository: builder.IDialogWaterfallStep = async (
  session,
  results,
) => {
  let repository = results.response;

  // It's necessary when the message comes from builder.Prompts
  if (typeof results.response === 'boolean') {
    repository = session.message.text;
  }

  if (!repository.includes('/')) {
    repository = repository.split(' ').join('/');
  }

  session.sendTyping();

  const repoInfo = await fetch(`https://api.github.com/repos/${repository}`);
  const json = await repoInfo.json();

  if (json.message) {
    session.endDialog('repository_info_not_found', repository.full_name);
  }

  return json;
};

export default getRepository;
