const fs         = require('fs');
const axios      = require('axios');
const url        = require('url');
const parseArgs  = require('minimist');
const random     = require('lodash/random');
const mkdirp     = require('mkdirp');
const os         = require('os');
const getDirName = require('path').dirname;

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

const args      = parseArgs(process.argv.slice(2)),
      help      = args.help,
      number    = args.number <= 50 ? (args.number <= 50 ? args.number : 50) : null,
      keywords  = args.keywords,
      prefix    = args.prefix || `${keywords ? keywords.replace(",", "_") : ''}_photo`,
      width     = createNumRange(args.width),
      height    = createNumRange(args.height),
      writeDir  = args.path ? formatPath(args.path) : '.';

if (help) {
  console.log("Options:");
  return false; 
}

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