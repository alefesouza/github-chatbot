import * as restify from 'restify';
import * as builder from 'botbuilder';
import * as dotenv from 'dotenv';
import * as path from 'path';

import RepositoryInfoDialog from './dialogs/RepositoryInfoDialog';
import StarsDialog from './dialogs/StarsDialog';
import TrendingDialog from './dialogs/TrendingDialog';
import UserInfoDialog from './dialogs/UserInfoDialog';

import hasImage from './utils/has-image';
import getAttachment from './utils/get-attachment';

dotenv.config();

const server = restify.createServer();

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

server.listen(process.env.PORT || 3978, () => {
  console.log('%s listening to %s', server.name, server.url);
});

server.post('/api/messages', connector.listen());

const bot = new builder.UniversalBot(connector, async (session) => {
  const { text } = session.message;

  if (hasImage(session)) {
    await getAttachment(connector, session);

    session.endDialog();
  } else if (session.message.attachments.length > 0) {
    session.endDialog('attachments_error');
  } else if (text === '') {
    helloMessage(session);
  } else {
    session.endDialog('sorry', text);
  }
});

bot.set('storage', new builder.MemoryBotStorage());

bot.set('localizerSettings', {
  botLocalePath: path.join(__dirname, 'locale'),
  defaultLocale: 'en',
});

const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('RepositoryInfo', RepositoryInfoDialog).triggerAction({
  matches: 'RepositoryInfo',
  onInterrupted: (session) => {
    session.endDialog('repository_info_error');
  },
});

bot.dialog('Stars', StarsDialog).triggerAction({
  matches: 'Stars',
  onInterrupted: (session) => {
    session.endDialog('repository_info_error');
  },
});

bot.dialog('Trending', TrendingDialog).triggerAction({
  matches: 'Trending',
  onInterrupted: (session) => {
    session.endDialog('generic_error');
  },
});

bot.dialog('UserInfo', UserInfoDialog).triggerAction({
  matches: 'UserInfo',
  onInterrupted: (session) => {
    session.endDialog('user_info_error');
  },
});

bot
  .dialog('Greeting', (session) => {
    helloMessage(session);
  })
  .triggerAction({
    matches: 'Greeting',
    onInterrupted: (session) => {
      session.endDialog('generic_error');
    },
  });

const genericDialog = (name: string) => {
  bot
    .dialog(name, (session) => {
      session.endDialog(name.toLocaleLowerCase());
    })
    .triggerAction({
      matches: name,
      onInterrupted: (session) => {
        session.endDialog('generic_error2');
      },
    });
};

genericDialog('Greeting2');
genericDialog('Thanks');
genericDialog('Help');
genericDialog('About');

bot.on('conversationUpdate', (update) => {
  const { membersAdded, address } = update;

  if (!membersAdded) {
    return;
  }

  const members = membersAdded.filter((id) => id.id === address.bot.id);

  members.forEach(() => {
    bot.loadSession(address, (err, session) => {
      helloMessage(session);
    });
  });
});

function helloMessage(session) {
  const card = new builder.HeroCard(session)
    .text('hello')
    .buttons([
      builder.CardAction.openUrl(
        session,
        'https://github.com/alefesouza/github-chatbot',
        'my_repository',
      ),
      builder.CardAction.postBack(session, 'trendings', 'show_trends'),
    ]);

  const msg = new builder.Message(session).addAttachment(card);
  session.send(msg);

  session.endDialog();
}
