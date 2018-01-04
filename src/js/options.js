import optionsHelper from './helpers/optionsHelper';
import '../css/options.css';

async function setupOptions() {
  const options = await optionsHelper.getOptions();
  document.getElementById('overlay-enabled').checked = options.overlayEnabled;
  document.getElementById('git-hostname').value = options.gitHostname;
  document.getElementById('coveralls-url').value = options.coverallsUrl;
  document.getElementById('api-token').value = options.apiToken;
}

async function saveOptions() {
  const errors = document.getElementById('errors');
  const status = document.getElementById('status');

  errors.textContent = '';
  status.textContent = 'Saving...';

  const options = {
    gitHostname: document.getElementById('git-hostname').value,
    overlayEnabled: document.getElementById('overlay-enabled').checked,
    coverallsUrl: document.getElementById('coveralls-url').value,
    apiToken: document.getElementById('api-token').value,
  };

  if (!options.coverallsUrl.match(/^http:\/\/|^https:\/\//)) { // coveralls url should be a complete url
    options.coverallsUrl = `http://${options.coverallsUrl}`;
    document.getElementById('coveralls-url').value = options.coverallsUrl;
  }

  if (options.gitHostname.match(/^http:\/\/|^https:\/\//)) { // git hostname should be only the hostname
    errors.textContent = 'Error: Git hostname should be only a hostname not a full url';
  } else {
    await optionsHelper.saveOptions(options);

    status.textContent = 'Options saved.';
    setTimeout(() => { status.textContent = ''; }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupOptions();
  document.getElementById('save').addEventListener('click', () => saveOptions());
});
