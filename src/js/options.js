import browser from 'webextension-polyfill';
import optionsHelper from './helpers/optionsHelper';
import '../css/options.css';
import '../options.html';

async function setupOptions() {
  const options = await optionsHelper.getOptions();
  document.getElementById('git-hostname').value = options.gitHostname;
  document.getElementById('coveralls-url').value = options.coverallsUrl;
  document.getElementById('api-token').value = options.apiToken;
}

async function saveOptions() {
  const old = await optionsHelper.getOptions();

  const errors = document.getElementById('errors');
  const status = document.getElementById('status');

  errors.textContent = '';
  status.textContent = 'Saving...';

  const newOptions = {
    gitHostname: document.getElementById('git-hostname').value,
    coverallsUrl: document.getElementById('coveralls-url').value,
    apiToken: document.getElementById('api-token').value,
  };

  if (!newOptions.coverallsUrl.match(/^http:\/\/|^https:\/\//)) { // coveralls url should be a complete url
    newOptions.coverallsUrl = `http://${newOptions.coverallsUrl}`;
    document.getElementById('coveralls-url').value = newOptions.coverallsUrl;
  }

  if (newOptions.gitHostname.match(/^http:\/\/|^https:\/\//)) { // git hostname should be only the hostname
    status.textContent = '';
    errors.textContent = 'Error: Git hostname should be only a hostname not a full url';
  } else {
    browser.permissions.remove({ origins: [`*://${old.gitHostname}/*`] });

    // TODO: The polyfill is not returning a promise, look into committing a fix
    chrome.permissions.request({ origins: [`*://${newOptions.gitHostname}/*`] }, async (success) => {
      if (success) {
        await optionsHelper.saveOptions(newOptions);

        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 1000);
      } else {
        status.textContent = '';
        errors.textContent = `Error: Could not set permissions to access ${newOptions.gitHostname}`;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupOptions();
  document.getElementById('save').addEventListener('click', () => saveOptions());
});

