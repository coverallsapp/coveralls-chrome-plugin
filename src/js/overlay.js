import browser from 'webextension-polyfill';
import * as $ from 'jquery';

import optionsHelper from './optionsHelper';

function getSha() {
  return $('.commit-tease-sha') ? $('.commit-tease-sha').attr('href').split('/').pop() : null;
}

function filesAndPathsForLoading() {

}

optionsHelper.getOptions().then((options) => {
  if (options.overlayEnabled && window.location.hostname === options.gitUrl) {
    const connection = browser.runtime.connect();

    connection.onMessage.addListener((message) => {
      switch (message) {
        case 'getCommitSha':
          connection.postMessage({ sha: getSha() });
          break;
        case 'sendFilesForLoading':
          connection.postMessage(filesAndPathsForLoading());
        default:
          break;
      }
    });
  }

});

