import browser from 'webextension-polyfill';

import optionsHelper from './optionsHelper';
import coverageHelper from './coverageHelper';
import CoverallsCache from './coveralls';

const pageListener = (port) => {
  const tabId = port.sender.tab.id;
  let currentUrl = port.sender.url;
  let currentSha = null;
  let currentCache = null;

  port.postMessage('getCommitSha');

  const tabUpdateListener = async (updatedTabId, changeInfo, tab) => {
    if (updatedTabId === tabId && tab.url !== currentUrl && changeInfo.status === 'complete') {
      currentUrl = tab.url;

      port.postMessage('getCommitSha');
    }
  };
  browser.tabs.onUpdated.addListener(tabUpdateListener);

  const messageHandler = (message) => {
    if (message && message.sha && message.sha !== currentSha) {
      currentSha = message.sha;
      currentCache = new CoverallsCache(currentSha);

      port.postMessage('sendFilesForLoading');
    }
  };
  port.onMessage.addListener(messageHandler);

  port.onDisconnect.addListener((p) => {
    browser.tabs.onUpdated.removeListener(tabUpdateListener);
    port.onMessage.removeListener(messageHandler);
  });
};
browser.runtime.onConnect.addListener(pageListener);

