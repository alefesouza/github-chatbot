import * as builder from 'botbuilder';
import fetch from 'node-fetch';

const UserInfo: builder.IDialogWaterfallStep = (session, args, next) => {
  const userEntity = builder.EntityRecognizer.findEntity(
    args.intent.entities,
    'user',
  );

  if (userEntity) {
    next({
      response: {
        user: userEntity.entity,
      },
    });
  } else {
    builder.Prompts.text(
      session,
      'Please enter the repository in the format user/repository',
    );
  }
};

const UserInfoResult: builder.IDialogWaterfallStep = async (
  session,
  results,
) => {
  const { user } = results.response;

  const userInfo = await fetch(`https://api.github.com/users/${user}`);
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
  } = await userInfo.json();

  const buttons = [builder.CardAction.openUrl(session, html_url, 'GitHub')];

  if (blog) {
    buttons.push(builder.CardAction.openUrl(session, blog, 'Website'));
  }

  const card = new builder.ThumbnailCard(session)
    .title(name)
    .subtitle(bio ? bio : '')
    .text(
      `The user ${login}, ${company ? `works at ${company}` : ''}, ${
        location ? `lives at ${location}` : ''
      }, has ${followers} followers and follows ${following} users`,
    )
    .images([builder.CardImage.create(session, avatar_url)])
    .buttons(buttons);

  const msg = new builder.Message(session).addAttachment(card);
  session.send(msg);

  session.endDialog();
};

export default [UserInfo, UserInfoResult];
