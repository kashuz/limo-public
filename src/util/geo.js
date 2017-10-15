import b from 'bluebird';
import create from 'node-geocoder';
import r from 'ramda';

const coder = create({
  provider: 'google',
  apiKey: process.env.GOOGLE_MAPS_API_KEY});

const enabled = r.contains(r.__,
  r.split(',', process.env.ENABLED_CITIES));

export default function geo(location) {
  return coder
    .reverse({lat: location.latitude, lon: location.longitude})
    .then(r.head)
    .then(r.merge(r.__, location))
    .then(result => enabled(result.city)
      ? result
      : b.reject('Пока заказы принимаются только в Ташкенте'));
}

export function format(location) {
  return r.join(', ',
    r.filter(r.identity, [
      location.extra && location.extra.neighborhood,
      location.streetName,
      location.streetNumber]));
}
