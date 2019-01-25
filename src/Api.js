export const fetchPhotos = callback => {
  const url = 'https://api.eyeem.com/photos/popular?limit=10';
  const clientId = '9iNUTAc4FCsRj5Co6vJgzVySHxuJtL3Y';
  fetch(url, {
    method: 'GET',
    headers: {
      'X-Client-Id': clientId
    }
  })
    .then(data => data.json())
    .then(res => {
      const photos = res.photos.items.map(photo => {
        return {
          id: photo.id,
          photoUrl: photo.photoUrl
        };
      });
      return callback(photos);
    })
    .catch(() => {
      return callback({ error: 'API_FETCHING_ERROR' });
    });
};
