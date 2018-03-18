const hasImageAttachment = (session) =>
  session.message.attachments.length > 0 &&
  session.message.attachments[0].contentType.indexOf('image') !== -1;

export default hasImageAttachment;
