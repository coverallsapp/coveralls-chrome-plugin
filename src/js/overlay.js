import browser from 'webextension-polyfill';
import * as $ from 'jquery';
import * as _ from 'lodash';

import optionsHelper from './optionsHelper';
import '../css/badges.css';

function getSha() {
  let sha = null;
  if ($('.commit-tease-sha').length) {
    sha = $('.commit-tease-sha').attr('href').split('/').pop();
  } else if ($('.sha.user-select-contain')) {
    sha = $('.sha.user-select-contain')[0].innerText;
  }

  return sha;
}

function loadFileCoverage(filepath, coverage) {
  const path = window.location.pathname.split('/');

  if (['commit', 'pull'].includes(path[3])) { // View has contents of multiple files
    console.log(filepath);
    $(`.diff-view:contains(${filepath})`).each(function addCoverageInfoToFileInMultifile() {
      if ($(this).find('.file-info .link-gray-dark')[0].innerText === filepath) {
        const startLine = $(this).find('.blob-code-hunk')[0].innerText.replace('@@ -', '').split(',')[0];
        const diffAnchor = $(this).find('.js-file-header')[0].dataset.anchor;

        for (let i = startLine - 1; i < coverage.length; i++) {
          const value = coverage[i];
          const line = $(`tr:has(#${diffAnchor}R${i + 1})`).find('.blob-code-inner:last');

          if (value > 0) {
            line.append(`<span class="coveralls-text-badge coveralls-cov-darker" data-badge-text="${value}X"></span>`);
          } else if (value === 0) {
            line.append('<span class="coveralls-text-badge coveralls-uncov-darker" data-badge-text="uncov"></span>');
          }
        }

      }
    });
  } else if (['blob', 'blame'].includes(path[3])) { // View has contents of a full file
    coverage.forEach((value, index) => {
      const line = $(`#LC${index + 1}`);
      const lineNum = $(`#L${index + 1}`);
      if (value > 0) {
        line.addClass('coveralls-cov');
        lineNum.addClass('coveralls-cov');
        line.append(`<span class="coveralls-text-badge coveralls-cov-darker" data-badge-text="${value}X"></span>`);
      } else if (value === 0) {
        line.addClass('coveralls-uncov');
        lineNum.addClass('coveralls-uncov');
        line.append('<span class="coveralls-text-badge coveralls-uncov-darker" data-badge-text="uncov"></span>');
      }
    });
  }
}

function loadPathCoverage(path, coverage) {
  const urlPath = window.location.pathname.split('/');
  const directory = urlPath.length === 2 ? '' : $('.breadcrumb')[0].innerText.split('/').splice(1).join('/');
  const textForRow = path.replace('/*', '').replace(directory, '');

  if (textForRow === '*') {
    $('.commit-tease .message').append(`<img class="coveralls-percent-badge" 
                                             style="position: absolute" 
                                             src="${coverage.badge_url}">`);
  } else {
    $(`tr.js-navigation-item:contains(${textForRow})`).each(function addCoverageInformation() {
      $(this).find('td:last').prepend(`<img class="coveralls-percent-badge" src="${coverage.badge_url}">`);
    });
  }
}

function filesAndPathsForLoading() {
  const path = window.location.pathname.split('/');

  if (path.length === 3 || path[3] === 'tree') { // Showing a folder view
    const directory = path.length === 2 ? '' : $('.breadcrumb')[0].innerText.split('/').splice(1).join('/');
    const paths = [`${directory}*`];

    $('tr.js-navigation-item').each(function addToFilenames() {
      if ($(this).find('.icon .octicon-file-directory').length) {
        paths.push(`${directory}${$(this).find('.content .js-navigation-open')[0].outerText}/*`);
      } else if ($(this).find('.icon .octicon-file-text').length) {
        paths.push(`${directory}${$(this).find('.content .js-navigation-open')[0].outerText}`);
      }
    });

    return {
      paths,
    };
  } else if (['commit', 'pull'].includes(path[3])) { // View has contents of multiple files
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
          loadFileCoverage(message.file, message.coverage);
        } else if (message.path && _.get(message.coverage, 'paths_covered_percent')) {
          loadPathCoverage(message.path, message.coverage);
        }
      });
    }
  }

  processPage();
  document.addEventListener('pjax:success', processPage);
});

