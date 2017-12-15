import optionsHelper from './optionsHelper';
import * as $ from 'jquery';

function shouldLoadOverlay(options) {
  if (options.overlayEnabled && document.location.hostname === options.gitUrl) {
    return true;
  } else {
    return false;
  }
}

function loadOverlay() {
  console.log('here');
}

$(() => {
  optionsHelper.getOptions((options) => {
    if (shouldLoadOverlay(options)) {
      loadOverlay();
    }
  });
});
