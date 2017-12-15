import * as $ from 'jquery';
import optionsHelper from './optionsHelper';
import coverageHelper from './coverageHelper';

function shouldLoadOverlay(options) {
  if (options.overlayEnabled && document.location.hostname === options.gitUrl) {
    return true;
  }

  return false;
}

function loadOverlay(options) {
  coverageHelper.apiCoverageGrab(options);
}

$(() => {
  optionsHelper.getOptions().then((options) => {
    if (shouldLoadOverlay(options)) {
      loadOverlay(options);
    }
  });
});
