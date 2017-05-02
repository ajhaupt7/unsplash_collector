const fs         = require('fs');
const axios      = require('axios');
const url        = require('url');
const random     = require('lodash/random');
const mkdirp     = require('mkdirp');
const os         = require('os');
const program    = require('commander');

const createNumRange = (num) => {
  const numString = num ? num.toString() : '[800,1600]';
  return num.toString().indexOf(',') === -1 ?
    [num,num] :
    num.split(",");
}

const formatPath = (path) => {
  let formattedPath = path.replace("~", os.homedir());
  if (fs.existsSync(formattedPath)) {
    return formattedPath
  } else {
    console.log(`${path} does not exist, creating directory`)
    mkdirp(formattedPath, err => {
      console.log(err)
    });
    return formattedPath
  }
} 

program
  .version('0.0.1')
  .option('-w, --width [width]', 'specify width in px (for a range, include two numbers separated by comma (ex: 600,1200)')
  .option('-h, --height [height]', 'specify height in px (for a range, include two numbers separated by comma (ex: 600,1200)')
  .option('-n, --number [number]', 'number of images to download (required), max 50')
  .option('-k, --keywords [keywords]', 'string of keyword(s) to search, seprated by commas')
  .option('-x, --prefix [prefix]', 'prefix for the file names of downloaded files')
  .option('-p, --path [path]', 'path to write downloaded files to')
  .parse(process.argv);

const number    = program.number <= 50 ? (program.number <= 50 ? program.number : 50) : null,
      keywords  = program.keywords,
      prefix    = program.prefix || `${keywords && keywords.length ? keywords.replace(",", "_") : ''}_photo`,
      width     = createNumRange(program.width),
      height    = createNumRange(program.height),
      writeDir  = program.path.length ? formatPath(program.path) : '.';

if (!number) {
  console.log("You have to specify the number of images to download.");
  return false;
}

const fetchImage = (name, count) => {
  const searchUrl = `https://source.unsplash.com/${random(width[0],width[1])}x${random(height[0],height[1])}/?${keywords || ''}`;

  return axios({
    method:'get',
    url: searchUrl,
    responseType:'stream'
  })
  .then((response) => {
    const { responseUrl } = response.data,
          urlParts = url.parse(responseUrl, true),
          fileExt = urlParts.query.fm,
          fullPath = `${writeDir}/${prefix}_${count}.${fileExt}`;

    console.log(`Downloading photo to ${fullPath}`)
   
    return response.data.pipe(fs.createWriteStream(fullPath))
  })
  .catch((error) => {
    console.log(error);
  });
}

const promisedImages = [...Array(Number(number))].map((_,i) => {
  return fetchImage(prefix, i);
});

return Promise.all(promisedImages).then(() => console.log('Finished Downloading!'))