import browser from 'webextension-polyfill';

function githubApiCoverageUrl(pathName, options) {
  const pathArray = pathName.replace(/^\//, '').split('/');
  const baseUrl = `http://${options.coverallsUrl}/github`;
  if (pathArray.length === 2) {
    return `${baseUrl}${pathName}.json`;
  } else if (pathArray[3] === 'blob') {
    return false;
  }

  return false;
}

const apiCoverageGrab = async (options) => {
  if (githubApiCoverageUrl(window.location.pathname, options)) {
    const response = await browser.runtime.sendMessage({
      requestUrl: githubApiCoverageUrl(window.location.pathname, options),
      token: options.apiToken,
    });

    console.log(response);
  }
};


export default {
  apiCoverageGrab,
};
