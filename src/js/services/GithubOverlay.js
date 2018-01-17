// @flow
import * as $ from 'jquery';
import type { IOverlay } from './OverlayInterface';
import overlayHelper from '../helpers/overlayHelper';

export default class GitHubOverlay implements IOverlay {
  sha: ?string
  filesAndPaths: Object
  shaChangeCallback: (string) => void
  constructor(shaChangeCallback: (string) => void) {
    this.shaChangeCallback = shaChangeCallback;
    this._watchForSha();
    this._resetFilesAndPaths();
  }

  filesAndPathsForLoading() {
    this._resetFilesAndPaths();

    const path = window.location.pathname.split('/');
    const self = this;

    if (path.length === 3 || path[3] === 'tree') { // Showing a folder view
      const directory = path.length === 2 ? '' : $('.breadcrumb')[0].innerText.split('/').splice(1).join('/');
      this.filesAndPaths.loading.paths = [`${directory}*`];

      $('tr.js-navigation-item').each(function addToFilenames() {
        if ($(this).find('.icon .octicon-file-directory').length) {
          self.filesAndPaths.loading.paths.push(`${directory}${$(this).find('.content .js-navigation-open')[0].outerText}/*`);
        } else if ($(this).find('.icon .octicon-file').length) {
          self.filesAndPaths.loading.paths.push(`${directory}${$(this).find('.content .js-navigation-open')[0].outerText}`);
        }

        $(this).find('td:last').before('<td class="coveralls coveralls-table-column"></td>');
      });

      $(overlayHelper.coverallsBadge()).hide().prependTo('.commit-tease .float-right').fadeIn('slow');
    } else if (['commit', 'pull'].includes(path[3])) { // View has contents of multiple files
      this.filesAndPaths.loading.files = [];

      $('.file-info .link-gray-dark').each(function addToFileNames() {
        self.filesAndPaths.loading.files.push(this.innerText);
      });
    } else if (['blob', 'blame'].includes(path[3])) { // View has contents of a full file
      this.filesAndPaths.loading.files = [$('.breadcrumb')[0].innerText.split('/').splice(1).join('/')];
    }

    return this.filesAndPaths.loading;
  }

  loadedFileCoverage(filepath: string, coverage: Array<number>) {
    const loadingIndex = this.filesAndPaths.loading.files.indexOf(filepath);
    if (loadingIndex !== -1) {
      this.filesAndPaths.loaded.files.push({ filepath, coverage });
      this.filesAndPaths.loading.files.splice(loadingIndex, 1);
    }

    if (this._allCoverageGathered()) {
      this._applyCoverageVisuals();
    }
  }

  loadedPathCoverage(path: string, coverage: Object) {
    const loadingIndex = this.filesAndPaths.loading.paths.indexOf(path);
    if (loadingIndex !== -1) {
      this.filesAndPaths.loaded.paths.push({ path, coverage });
      this.filesAndPaths.loading.paths.splice(loadingIndex, 1);
    }

    if (this._allCoverageGathered()) {
      this._applyCoverageVisuals();
    }
  }

  _applyCoverageVisuals() {
    this.filesAndPaths.loaded.files.forEach((file) => {
      this._applyFileCoverage(file.filepath, file.coverage);
    });
    this.filesAndPaths.loaded.paths.forEach((path) => {
      this._applyPathCoverage(path.path, path.coverage);
    });

    this._resetFilesAndPaths();
  }

  _applyFileCoverage(filepath: string, coverage: Array<number>) {
    const path = window.location.pathname.split('/');

    if (['commit', 'pull'].includes(path[3])) { // View has contents of multiple files
      $(`.diff-view:contains(${filepath})`).each(function addCoverageInfoToFileInMultifile() {
        if ($(this).find('.file-info .link-gray-dark')[0].innerText === filepath) {
          const startLine = $(this).find('.blob-code-hunk')[0].innerText.replace('@@ -', '').split(',')[0];
          const diffAnchor = $(this).find('.js-file-header')[0].dataset.anchor;

          for (let i = startLine - 1; i < coverage.length; i++) {
            const value = coverage[i];
            const line = $(`tr:has(#${diffAnchor}R${i + 1})`).find('.blob-code-inner:last');

            if (value > 0) {
              const html = `<span class="coveralls coveralls-text-badge coveralls-cov-darker" data-badge-text="${value}X"></span>`;
              $(html).hide().appendTo(line).fadeIn('slow');
            } else if (value === 0) {
              const html = '<span class="coveralls coveralls-text-badge coveralls-uncov-darker" data-badge-text="uncov"></span>';
              $(html).hide().appendTo(line).fadeIn('slow');
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

          const html = `<span class="coveralls coveralls-text-badge coveralls-cov-darker" data-badge-text="${value}X"></span>`;
          $(html).hide().appendTo(line).fadeIn('slow');
        } else if (value === 0) {
          line.addClass('coveralls-uncov');
          lineNum.addClass('coveralls-uncov');

          const html = '<span class="coveralls coveralls-text-badge coveralls-uncov-darker" data-badge-text="uncov"></span>';
          $(html).hide().appendTo(line).fadeIn('slow');
        }
      });
    }
  }

  _applyPathCoverage(path: string, coverage: Object) {
    if (coverage.paths_covered_percent !== undefined) {
      const urlPath = window.location.pathname.split('/');
      const directory = urlPath.length === 2 ? '' : $('.breadcrumb')[0].innerText.split('/').splice(1).join('/');
      const textForRow = path.replace(directory, '').replace('/*', '');

      if (textForRow === '*') {
        const commitTease = $('.commit-tease .float-right .coveralls');
        commitTease.fadeOut('slow', function setFullCoverage() {
          $(this).html(`${overlayHelper.coverallsBadge(coverage.paths_covered_percent)}`);
        }).fadeIn('slow');
      } else if (coverage.paths_covered_percent != null) {
        $(`tr.js-navigation-item:contains(${textForRow})`).each(function addCoverageInformation() {
          if ($(this).find('.content .js-navigation-open')[0].innerText === textForRow) {
            $(this).find('td.coveralls').fadeOut('slow', function setPathCoverage() {
              $(this).html(`${overlayHelper.coverallsBadge(coverage.paths_covered_percent)}`);
            }).fadeIn('slow');
          }
        });
      }
    }
  }

  resetOverlay() {
    $('.coveralls').remove();
    $('.coveralls-uncov').removeClass('coveralls-uncov');
    $('.coveralls-cov').removeClass('coveralls-cov');
  }

  _watchForSha() {
    if ($('.commit-tease-sha').length) {
      this.sha = $('.commit-tease-sha').attr('href').split('/').pop();
    } else if ($('.sha.user-select-contain').length) {
      this.sha = $('.sha.user-select-contain')[0].innerText;
    }

    if (this.sha) {
      this.shaChangeCallback(this.sha);
    } else {
      setTimeout(() => { this._watchForSha(); }, 500);
    }
  }

  _resetFilesAndPaths() {
    this.filesAndPaths = {
      loading: {
        files: [],
        paths: [],
      },
      loaded: {
        files: [],
        paths: [],
      },
    };
  }

  _allCoverageGathered() {
    return (this.filesAndPaths.loading.files.length === 0 && this.filesAndPaths.loading.paths.length === 0);
  }
}
