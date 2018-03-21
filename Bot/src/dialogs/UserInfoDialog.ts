import * as builder from 'botbuilder';
import fetch from 'node-fetch';

const UserInfo: builder.IDialogWaterfallStep = (session, args, next) => {
  const userEntity = builder.EntityRecognizer.findEntity(
    args.intent.entities,
    'user',
  );

  if (userEntity) {
    next({
      response: userEntity.entity,
    });

    return;
  }

  builder.Prompts.text(session, session.gettext('user_info_error'));
};

const UserInfoResult: builder.IDialogWaterfallStep = async (
  session,
  results,
) => {
  const user = results.response;

  session.sendTyping();

  const userInfo = await fetch(`https://api.github.com/users/${user}`);
  const json = await userInfo.json();

  if (json.message) {
    session.endDialog('user_info_not_found', user);

    return;
  }

  const {
    login,
    name,
    followers,
    following,
    bio,
    blog,
    location,
    company,
    avatar_url,
    html_url,
  } = json;

  const buttons = [builder.CardAction.openUrl(session, html_url, 'GitHub')];

  if (blog) {
    buttons.push(builder.CardAction.openUrl(session, blog, 'Website'));
  }

  const card = new builder.ThumbnailCard(session)
    .title(name)
    .subtitle(bio || '')
    .text(
      `The user ${login} ${company ? ` works at ${company},` : ''}${
        location ? ` lives at ${location}, ` : ''
      } has ${followers} followers and follows ${following} users.`,
    )
    .images([builder.CardImage.create(session, avatar_url)])
    .buttons(buttons);

  const msg = new builder.Message(session).addAttachment(card);
  session.send(msg);

  session.endDialog();
};

export default [UserInfo, UserInfoResult];
