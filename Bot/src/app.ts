import * as restify from 'restify';
import * as builder from 'botbuilder';
import * as dotenv from 'dotenv';
import * as path from 'path';

import RepositoryInfoDialog from './dialogs/RepositoryInfoDialog';
import StarsDialog from './dialogs/StarsDialog';
import TrendingDialog from './dialogs/TrendingDialog';
import UserInfoDialog from './dialogs/UserInfoDialog';

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

const bot = new builder.UniversalBot(connector, (session) => {
  session.send('sorry', session.message.text);
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
    session.send('repository_info_error');
  },
});

bot.dialog('Stars', StarsDialog).triggerAction({
  matches: 'Stars',
  onInterrupted: (session) => {
    session.send('repository_info_error');
  },
});

bot.dialog('Trending', TrendingDialog).triggerAction({
  matches: 'Trending',
  onInterrupted: (session) => {
    session.send('generic_error');
  },
});

bot.dialog('UserInfo', UserInfoDialog).triggerAction({
  matches: 'UserInfo',
  onInterrupted: (session) => {
    session.send('user_info_error');
  },
});

bot
  .dialog('Greeting', (session) => {
    helloMessage(session);
  })
  .triggerAction({
    matches: 'Greeting',
    onInterrupted: (session) => {
      session.send('generic_error');
    },
  });

const genericDialog = (name: string) => {
  bot
    .dialog(name, (session) => {
      session.send(name.toLocaleLowerCase());

      session.endDialog();
    })
    .triggerAction({
      matches: name,
      onInterrupted: (session) => {
        session.send('generic_error');
      },
    });
};

genericDialog('Greeting2');
genericDialog('Thanks');
genericDialog('Help');
genericDialog('About');

bot.on('conversationUpdate', (update: builder.IConversationUpdate) => {
  if (
    update.membersAdded &&
    update.membersAdded.length > 0 &&
    update.membersAdded[0].id !== 'default-bot'
  ) {
    bot.loadSession(update.address, (err, session) => {
      helloMessage(session);
    });
  }
});

function helloMessage(session) {
  const card = new builder.ThumbnailCard(session)
    .text('hello')
    .buttons([
      builder.CardAction.openUrl(
        session,
        'https://github.com/alefesouza/github-chatbot',
        'GitHub',
      ),
    ]);

  const msg = new builder.Message(session).addAttachment(card);
  session.send(msg);
}
