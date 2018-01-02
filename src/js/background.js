import browser from 'webextension-polyfill';

import optionsHelper from './optionsHelper';
import CoverallsCache from './coveralls';

const pageListener = async (port) => {
  let currentSha = null;
  let currentCache = null;

  port.postMessage('getCommitSha');

  // Functions used for handling messages requesting data from the content script
  const processInitialCommitLoad = (message) => {
    if (message.sha !== currentSha) {
      currentSha = message.sha;
      currentCache = new CoverallsCache(currentSha);
    }

    port.postMessage('sendFilesForLoading');
  };

  const processFileRequest = (file) => {
    currentCache.getFile(file).then((coverage) => {
      port.postMessage({ file, coverage });
    });
  };

  const processPathRequest = (path) => {
    currentCache.getPath(path).then((coverage) => {
      port.postMessage({ path, coverage });
    });
  };


  // Message handler, identify message type call correct function defined above
  const messageHandler = (message) => {
    console.log(message);
    if (message && message.sha) {
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
    p.onMessage.removeListener(messageHandler);
  });
};
browser.runtime.onConnect.addListener(pageListener);

