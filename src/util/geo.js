import b from 'bluebird';
import create from 'node-geocoder';
import r from 'ramda';
import rs from 'ramdasauce';

const coder = create({
  provider: 'google',
  apiKey: process.env.GOOGLE_MAPS_API_KEY});

const log = error => {
  console.error(
    (e.stack || e.toString())
      .replace(/^/gm, '  '));

  throw error;
};

export default function geo(location) {
  return coder
    .reverse({lat: location.latitude, lon: location.longitude})
    .then(rs.log)
    .catch(log)
    .then(r.head)
    .then(result => result.countryCode == 'UZ'
      ? r.merge(result, location)
      : b.reject('Заказы принимаются только по Узбекистану'));
}

export function format(location) {
  return r.join(', ',
    r.filter(r.identity, [
      location.city,
      location.extra && location.extra.neighborhood,
      location.streetName,
      location.streetNumber]));
}
