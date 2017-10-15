import r from 'ramda';

class AssertError extends Error {}

export default r.curry((message, value) => {
  if (!value)
    throw new AssertError(message);

  return value;
})

export function failure(handler) {
  return error => {
    if (error instanceof AssertError) {
      return handler(error.message);
    }

    throw error;
  }
}
