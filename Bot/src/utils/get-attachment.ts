import * as builder from 'botbuilder';

import fetch from 'node-fetch';
import needle from 'needle';

const getImageStreamFromMessage = (connector, message) => {
  const headers = {};
  const attachment = message.attachments[0];

  if (checkRequiresToken(message)) {
    connector.getAccessToken((error, token) => {
      headers['Authorization'] = 'Bearer ' + token;
      headers['Content-Type'] = 'application/octet-stream';

      return needle.get(attachment.contentUrl, { headers });
    });
  }

  headers['Content-Type'] = attachment.contentType;

  return needle.get(attachment.contentUrl, { headers: headers });
};

const checkRequiresToken = (message) =>
  message.source === 'skype' || message.source === 'msteams';

const getAttachment = async (connector, session) => {
  const stream = getImageStreamFromMessage(connector, session.message);

  session.sendTyping();

  const response = await fetch(process.env.CUSTOM_VISION_IMAGE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Prediction-Key': process.env.CUSTOM_VISION_PREDICTION_KEY,
    },
    body: stream,
  });

  const json = await response.json();

  const repository = json.Predictions[0];

  if (repository.Probability > 0.8) {
    const card = new builder.HeroCard(session)
      .title(repository.Tag)
      .text('attachments_repository', repository.Tag)
      .buttons([
        builder.CardAction.postBack(
          session,
          repository.Tag + ' repo',
          'attachments_info',
        ),
      ]);

    const msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
  } else {
    session.send('attachments_sorry');
  }
};

export default getAttachment;
