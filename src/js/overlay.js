import browser from 'webextension-polyfill';

import optionsHelper from './helpers/optionsHelper';
import GithubOverlay from './services/GithubOverlay';
import '../css/badges.css';

function gitClientOverlay(gitClient, shaCallback) {
  if (gitClient === 'github') {
    return new GithubOverlay(shaCallback);
  }

  return null;
}

async function processPage() {
  const options = await optionsHelper.getOptions();
  const connection = browser.runtime.connect();

  if (options.overlayEnabled) {
    const overlay = gitClientOverlay(options.gitClient);
    const initialUrl = window.location.href;

    const observer = new MutationObserver((mutations, self) => {
      if (initialUrl !== window.location.href) {
        self.disconnect();
      } else if (overlay.checkSha()) {
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
        connection.disconnect();
        observer.disconnect();
        overlay.resetOverlay();

        processPage();
      } else if (message === 'enableOverlay') {
        connection.disconnect();
        observer.disconnect();

        processPage();
      } else if (message.file) {
        overlay.loadedFileCoverage(message.file, message.coverage);
      } else if (message.path) {
        overlay.loadedPathCoverage(message.path, message.coverage);
      }
    });
  } else {
    connection.onMessage.addListener((message) => {
      if (message === 'enableOverlay') {
        connection.disconnect();
        processPage();
      }
    });
  }
}

optionsHelper.getOptions().then((options) => {
  if (window.location.hostname === options.gitHostname) {
    processPage();
    document.addEventListener('pjax:complete', processPage);
  }
});

