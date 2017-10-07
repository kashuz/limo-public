import create from 'node-geocoder';
import r from 'ramda';

const geocoder = create({
  provider: 'google',
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
});

export default function geo(location) {
  return geocoder
    .reverse({
      lat: location.latitude,
      lon: location.longitude,
    })
    .then(r.head)
    .then(result => r.merge(result, location));
}

export function enabled(location) {
  return geo(location).then(
    result =>
      process.env.ENABLED_CITIES.split(',').includes(result.city)
        ? result
        : Promise.reject(),
  );
}

export function format(location) {
  return r.join(
    ', ',
    r.filter(r.identity, [
      location.extra && location.extra.neighborhood,
      location.streetName,
      location.streetNumber,
    ]),
  );
}
