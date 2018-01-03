import * as axios from 'axios';

function githubApiCoverageUrl(pathName, options) {
  const pathArray = pathName.replace(/^\//, '').split('/');
  const baseUrl = `http://${options.coverallsUrl}/github/${pathArray[0]}/${pathArray[1]}`;
  if (pathArray.length === 2) {
    return `${baseUrl}.json?branch=master`;
  } else if (pathArray.length === 4) {
    switch (pathArray[2]) {
      case 'blob':
        return `${baseUrl}.json?branch=${pathArray[3]}`;
      case 'pull':
        return `${baseUrl}.json?pull=${pathArray[3]}`;
      case 'commit':
        return `${baseUrl}.json?commit=${pathArray[3]}`;
      default:
        return false;
    }
  } else {
    switch (pathArray[2]) {
      case 'blob':
        return `${baseUrl}.json?branch=${pathArray[3]}&filename=${pathArray.splice(4).join('/')}`;
      case 'tree':
        return `${baseUrl}.json?branch=${pathArray[3]}&path=${pathArray.splice(3).join('/')}`;
      default:
        return false;
    }
  }
}

const apiCoverageGrab = async (options, pathname) => {
  if (githubApiCoverageUrl(pathname, options)) {
    const response = await axios.get(githubApiCoverageUrl(pathname, options), {
      headers: { Authentication: `token ${options.api_token}` },
    });

  }
};


export default {
  apiCoverageGrab,
};
