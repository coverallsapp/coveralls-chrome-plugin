import browser from 'webextension-polyfill';

import optionsHelper from './optionsHelper';
import CoverallsCache from './coveralls';

const pageListener = async (port) => {
  const tabId = port.sender.tab.id;
  let currentUrl = port.sender.url;
  let currentSha = null;
  let currentCache = null;

  port.postMessage('getCommitSha');


  // Set up listener for new page, request the commitSha on the page when it reloads
  const tabUpdateListener = async (updatedTabId, changeInfo, tab) => {
    if (updatedTabId === tabId && tab.url !== currentUrl && changeInfo.status === 'complete') {
      currentUrl = tab.url;

      port.postMessage('getCommitSha');
    }
  };
  browser.tabs.onUpdated.addListener(tabUpdateListener);


  // Functions used for handling messages requesting data from the content script
  const processInitialCommitLoad = (message) => {
    currentSha = message.sha;
    currentCache = new CoverallsCache(currentSha);

    port.postMessage('sendFilesForLoading');
  };

  const processFileRequest = (file) => {
    currentCache.getFile(file).then((coverage) => {
      port.postMessage({ file, coverage });
    });
  };

  const processPathRequest = (path) => {
    currentCache.getFile(path).then((coverage) => {
      port.postMessage({ path, coverage });
    });
  };


  // Message handler, identify message type call correct function defined above
  const messageHandler = (message) => {
    console.log(message);
    if (message && message.sha && message.sha !== currentSha) {
      processInitialCommitLoad(message);
    }

    if (message && message.files) {
      message.files.forEach(processFileRequest);
    } else if (message && message.paths) {
      message.paths.forEach(processPathRequest);
    }
  };
  port.onMessage.addListener(messageHandler);


  // Manually disconnect listeners when tab closes
  port.onDisconnect.addListener((p) => {
    browser.tabs.onUpdated.removeListener(tabUpdateListener);
    port.onMessage.removeListener(messageHandler);
  });
};
browser.runtime.onConnect.addListener(pageListener);

