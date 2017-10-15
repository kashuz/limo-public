import r from 'ramda';

export default function(messages) {
  return error => {
    if (!messages || (r.any(
        message => typeof message == 'string'
          ? message == error.message
          : message.exec(error.message),
        Array.isArray(messages) ? messages : [messages])))
      return;

    throw error;
  }
}
