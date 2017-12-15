import * as $ from 'jquery';

async function grabCoverageFromWeb (options, buildNum, filename) => {
  let coverageUrl = `${options.coverallsUrl}/build/${buildNum}`;

  if (filename) {
    coverageUrl += `/source.json?filename=${filename}`;
  } else {
    coverageUrl += '.json';
  }

  return $.getJSON(coverageUrl);
};


export default {
  ,
};
