import browser from 'webextension-polyfill';
import * as _ from 'lodash';

import optionsHelper from './helpers/optionsHelper';
import GithubOverlay from './services/GithubOverlay';
import '../css/badges.css';

function gitClientOverlay(gitClient, shaCallback) {
  if (gitClient === 'github') {
    return new GithubOverlay(shaCallback);
  }

  return null;
}

function processPage(options, connection) {
  const overlay = gitClientOverlay(options.gitClient);
  const initialUrl = window.location.href;

  const observer = new MutationObserver((mutations, self) => {
    if (initialUrl !== window.location.href) {
      self.disconnect();
    }

    if (overlay.checkSha()) {
      connection.postMessage({ sha: overlay.sha });
      self.disconnect();
    }
  });

  if (overlay.checkSha()) {
    connection.postMessage({ sha: overlay.sha });
  } else {
    observer.observe(document, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  connection.onMessage.addListener((message) => {
    if (message === 'sendFilesForLoading') {
      connection.postMessage(overlay.filesAndPathsForLoading());
    } else if (message === 'disableOverlay') {
      overlay.resetOverlay();
    } else if (message === 'enableOverlay') {
      connection.postMessage({ sha: overlay.sha });
    } else if (message.file) {
      overlay.loadedFileCoverage(message.file, message.coverage);
    } else if (message.path) {
      overlay.loadedPathCoverage(message.path, message.coverage);
    }
  });
}

function startPageProcessing(options, connection) {
  processPage(options, connection);
  document.addEventListener('pjax:complete', () => { processPage(options, connection); });
}

optionsHelper.getOptions().then((options) => {
  if (window.location.hostname === options.gitHostname) {
    const connection = browser.runtime.connect();

    if (options.overlayEnabled) {
      startPageProcessing(options, connection);
    } else {
      connection.onMessage.addListener((message) => {
        if (message === 'enableOverlay') {
          startPageProcessing(options, connection);
        }
      });
    }
  }
});

