# Unsplash Collector
Bulk downloads unsplash images by size + category

## Usage
  app [options]

  Options:

    -h, --help                 output usage information
    -w, --width [width]        specify width in px (for a range, include two numbers separated by comma (ex: 600,1200)
    -h, --height [height]      specify height in px (for a range, include two numbers separated by comma (ex: 600,1200)
    -n, --number [number]      number of images to download (required), max 50
    -k, --keywords [keywords]  string of keyword(s) to search, seprated by commas
    -x, --prefix [prefix]      prefix for the file names of downloaded files
    -p, --path [path]          path to write downloaded files to

  Example:

    node app.js --number=10  --width=800,1200 --height=200,400 --keywords=horses --path=~/Design/Stock --prefix=kentucky_derby
