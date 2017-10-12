import r from 'ramda';

export default r.curry((message, value) => {
  if (!value)
    throw new Error(message);

  return value;
})
