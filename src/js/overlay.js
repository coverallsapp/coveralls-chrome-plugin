import browser from 'webextension-polyfill';
import * as _ from 'lodash';

import optionsHelper from './helpers/optionsHelper';
import GithubOverlay from './services/GithubOverlay';
import '../css/badges.css';

function gitClientOverlay(gitClient) {
  if (gitClient === 'github') {
    return new GithubOverlay();
  }

  return null;
}


optionsHelper.getOptions().then((options) => {
  function processPage() {
    if (options.overlayEnabled && window.location.hostname === options.gitHostname) {
      const connection = browser.runtime.connect();
      const overlay = gitClientOverlay(options.gitClient);

      connection.onMessage.addListener((message) => {
        if (message === 'getCommitSha') {
          connection.postMessage({ sha: overlay.sha });
        } else if (message === 'sendFilesForLoading') {
          connection.postMessage(overlay.filesAndPathsForLoading());
        } else if (message.file) {
          overlay.applyFileCoverage(message.file, message.coverage);
        } else if (message.path && _.get(message.coverage, 'paths_covered_percent')) {
          overlay.applyPathCoverage(message.path, message.coverage);
        }
      });
    }
  }

  processPage();
  document.addEventListener('pjax:success', processPage);
});

