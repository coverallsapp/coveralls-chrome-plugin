import browser from 'webextension-polyfill';
import * as $ from 'jquery';

import optionsHelper from './optionsHelper';
import '../css/badges.css';

function getSha() {
  return $('.commit-tease-sha') ? $('.commit-tease-sha').attr('href').split('/').pop() : null;
}

function loadFileCoverage(filepath, coverage) {
  const path = window.location.pathname.split('/');

  if (path.length === 2) { // master branch file list
  } else if (path[3] === 'tree') { // Showing a folder view
  } else if (['commit', 'pull'].includes(path[3])) { // View has contents of multiple files
  } else if (['blob', 'blame'].includes(path[3])) { // View has contents of a full file
    coverage.forEach((value, index) => {
      const line = $(`#LC${index + 1}`);
      if (value > 0) {
        line.css('background-color', 'rgba(208, 233, 153, 0.2)');
      } else if (value === 0) {
        line.css('background-color', 'rgba(216, 134, 123, 0.2)');
        line.append('<span class="coveralls-uncov-badge"></span>"');
      }
    });
  }
}

function filesAndPathsForLoading() {
  const path = window.location.pathname.split('/');
  console.log(path);

  if (path.length === 2) { // master branch file list
    return { paths: ['/*'] };
  } else if (path[3] === 'tree') { // Showing a folder view
    const filenames = [];
    const directory = $('.breadcrumb')[0].innerText.split('/').splice(1).join('/');
    $('.content .js-navigation-open').each(function addToFilenames() {
      filenames.push(`${directory}${this.outerText}`);
    });

    return {
      paths: [`${directory}*`],
      files: filenames,
    };
  } else if (['commit', 'pull'].includes(path[3])) { // View has contents of multiple files
    debugger;
    const filenames = [];
    $('.file-info .link-gray-dark').each(function addToFileNames() {
      filenames.push(this.innerText);
    });

    return {
      files: filenames,
    };
  } else if (['blob', 'blame'].includes(path[3])) { // View has contents of a full file
    return {
      files: [$('.breadcrumb')[0].innerText.split('/').splice(1).join('/')],
    };
  }

  return {};
}

optionsHelper.getOptions().then((options) => {
  function processPage() {
    if (options.overlayEnabled && window.location.hostname === options.gitUrl) {
      const connection = browser.runtime.connect();

      connection.onMessage.addListener((message) => {
        console.log(message);
        if (message === 'getCommitSha') {
          connection.postMessage({ sha: getSha() });
        } else if (message === 'sendFilesForLoading') {
          connection.postMessage(filesAndPathsForLoading());
        } else if (message.file) {
          loadFileCoverage(message.file, message.coverage)
        }
      });
    }
  }

  processPage();
  document.addEventListener('pjax:success', processPage);
});

