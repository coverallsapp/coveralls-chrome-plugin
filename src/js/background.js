import browser from 'webextension-polyfill';

import optionsHelper from './optionsHelper';
import coverageHelper from './coverageHelper';
import CoverallsCache from './coveralls';

const pageListener = (port) => {
  const tabId = port.sender.tab.id;
  let currentUrl = port.sender.url;

  browser.tabs.onUpdated.addListener(async (updatedTabId, changeInfo, tab) => {
    if (updatedTabId === tabId && tab.url !== currentUrl && changeInfo.status === 'complete') {
      currentUrl = tab.url;
    }

    port.postMessage('getCommitSha');
  });

  let currentSha = null;
  let currentCache = null;

  port.onMessage.addListener((message) => {
    if (message && message.sha && message.sha !== currentSha) {
      currentSha = message.sha;
      currentCache = new CoverallsCache(currentSha);

      port.postMessage('sendFilesForLoading');
    }
  });
};

browser.runtime.onConnect.addListener(pageListener);

