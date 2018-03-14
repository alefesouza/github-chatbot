import * as builder from 'botbuilder';

const Greeting: builder.IDialogWaterfallStep = (session, args, next) => {
  session.send('hello');

  session.endDialog();
};

export default [Greeting];
