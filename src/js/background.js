import browser from 'webextension-polyfill';

import '../images/icon-16.png';
import '../images/icon-32.png';
import '../images/icon-48.png';
import '../images/icon-128.png';
import '../images/icon-16-deactivated.png';
import '../images/icon-32-deactivated.png';
import '../images/icon-48-deactivated.png';
import '../images/icon-128-deactivated.png';

import optionsHelper from './helpers/optionsHelper';
import CoverallsCache from './services/CoverallsCache';

let openPort = false;

const pageListener = async (port) => {
  let currentSha = null;
  let currentCache = null;
  openPort = port;

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
    openPort = false;
  });
};
browser.runtime.onConnect.addListener(pageListener);


const onBrowserAction = async () => {
  const options = await optionsHelper.getOptions();
  const deactivatedIcons = {
    path: {
      16: 'icon-16-deactivated.png',
      32: 'icon-32-deactivated.png',
      48: 'icon-48-deactivated.png',
      128: 'icon-128-deactivated.png',
    },
  };
  const activatedIcons = {
    path: {
      16: 'icon-16.png',
      32: 'icon-32.png',
      48: 'icon-48.png',
      128: 'icon-128.png',
    },
  };

  options.overlayEnabled = !options.overlayEnabled;
  browser.browserAction.setIcon(options.overlayEnabled ? activatedIcons : deactivatedIcons);
  optionsHelper.saveOptions(options);

  if (openPort) {
    openPort.postMessage(options.overlayEnabled ? 'enableOverlay' : 'disableOverlay');
  }
};
browser.browserAction.onClicked.addListener(onBrowserAction);


