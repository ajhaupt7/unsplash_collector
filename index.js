const fs    = require('fs');
const axios = require('axios');
const url   = require('url');

const number = process.argv[2] <= 50 ? process.argv[2] : 50,
      query  = process.argv[3],
      width  = process.argv[4],
      height = process.argv[5],
      name   = `${query.replace(",", "_")}_photo`

const searchUrl = `https://source.unsplash.com/${width || 1200}x${height || 800}/?${query}`;

const fetchImage = (searchUrl, name, count) => {
  return axios({
    method:'get',
    url: searchUrl,
    responseType:'stream'
  })
  .then((response) => {
    console.log(`Found Photo #${count}`)
    const { responseUrl } = response.data,
          urlParts = url.parse(responseUrl, true),
          fileExt = urlParts.query.fm;
   
    return response.data.pipe(fs.createWriteStream(`${name}_${count}.${fileExt}`))
  })
  .catch((error) => {
    console.log(error);
  });
}

const promisedImages = [...Array(Number(number))].map((_,i) => {
  return fetchImage(searchUrl, name, i);
});

return Promise.all(promisedImages).then(() => console.log('Done'))