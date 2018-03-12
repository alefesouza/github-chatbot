import * as restify from 'restify';
import * as builder from 'botbuilder';
import * as dotenv from 'dotenv';
import * as path from 'path';

import RepositoryInfoDialog from './dialogs/RepositoryInfoDialog';
import StarsDialog from './dialogs/StarsDialog';
import TimelineDialog from './dialogs/TimelineDialog';
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

const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.set('localizerSettings', {
  botLocalePath: path.join(__dirname, 'locale'),
  defaultLocale: 'en',
});

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
    session.send('trending_error');
  },
});

bot.dialog('UserInfo', UserInfoDialog).triggerAction({
  matches: 'UserInfo',
  onInterrupted: (session) => {
    session.send('user_info_error');
  },
});

bot.on('conversationUpdate', (update: builder.IConversationUpdate) => {
  if (
    update.membersAdded &&
    update.membersAdded.length > 0 &&
    update.membersAdded[0].id !== 'default-bot'
  ) {
    bot.send(new builder.Message().address(update.address).text('hello'));
  }
});
