const fs        = require('fs');
const axios     = require('axios');
const url       = require('url');
const parseArgs = require('minimist');
const random    = require('lodash/random');

const createNumRange = (num) => {
  const numString = num ? num.toString() : '[800,1600]';
  return num.toString().indexOf(',') === -1 ?
    [num,num] :
    num.split(",");
}

const args      = parseArgs(process.argv.slice(2)),
      number    = args.number <= 50 ? (args.number <= 50 ? args.number : 50) : null,
      keywords  = args.keywords,
      name      = `${keywords ? keywords.replace(",", "_") : ''}_photo`,
      width     = createNumRange(args.width),
      height    = createNumRange(args.height);

if (!number) {
  console.log("You have to specify the number of images to download.");
  return false;
}

const fetchImage = (name, count) => {
  const searchUrl = `https://source.unsplash.com/${random(width[0],width[1])}x${random(height[0],height[1])}/?${keywords || ''}`;

  console.log(searchUrl)

  return axios({
    method:'get',
    url: searchUrl,
    responseType:'stream'
  })
  .then((response) => {
    console.log(`Downloading Photo ${count}`)
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
  return fetchImage(name, i);
});

return Promise.all(promisedImages).then(() => console.log('Finished Downloading!'))