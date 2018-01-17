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


optionsHelper.getOptions().then((options) => {
  function processPage() {
    if (window.location.hostname === options.gitHostname) {
      const connection = browser.runtime.connect();
      const overlay = gitClientOverlay(options.gitClient, (sha) => {
        if (options.overlayEnabled) {
          connection.postMessage({ sha });
        }
      });

      connection.onMessage.addListener((message) => {
        if (message === 'sendFilesForLoading') {
          connection.postMessage(overlay.filesAndPathsForLoading());
        } else if (message === 'disableOverlay') {
          overlay.resetOverlay();
        } else if (message === 'enableOverlay') {
          connection.postMessage({ sha: overlay.sha });
        } else if (message.file) {
          overlay.loadedFileCoverage(message.file, message.coverage);
        } else if (message.path && _.has(message.coverage, 'paths_covered_percent')) {
          overlay.loadedPathCoverage(message.path, message.coverage);
        }
      });
    }
  }

  processPage();
  document.addEventListener('pjax:complete', processPage);
});

