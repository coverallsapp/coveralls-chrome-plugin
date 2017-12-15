import browser from 'webextension-polyfill';

import optionsHelper from './optionsHelper';
import coverageHelper from './coverageHelper';

function shouldLoadOverlay(options, changeInfo, tab) {
  if (options.overlayEnabled && changeInfo.status === 'loading' && tab.url.split('/')[2] === options.gitUrl) {
    return true;
  }

  return false;
}

function loadOverlay(options, url) {
  coverageHelper.apiCoverageGrab(options, url.split('/').splice(3).join('/'));
}

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const options = await optionsHelper.getOptions();

  if (shouldLoadOverlay(options, changeInfo, tab)) {
    loadOverlay(options, tab.url);
  }
});
