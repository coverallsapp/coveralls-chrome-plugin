import optionsHelper from './optionsHelper';

async function setupOptions() {
  const options = await optionsHelper.getOptions();
  document.getElementById('overlay-enabled').checked = options.overlayEnabled;
  document.getElementById('git-url').value = options.gitUrl;
  document.getElementById('coveralls-url').value = options.coverallsUrl;
  document.getElementById('api-token').value = options.apiToken;
}

async function saveOptions() {
  const options = {
    gitUrl: document.getElementById('git-url').value,
    overlayEnabled: document.getElementById('overlay-enabled').checked,
    coverallsUrl: document.getElementById('coveralls-url').value,
    apiToken: document.getElementById('api-token').value,
  };

  await optionsHelper.saveOptions(options);
  const status = document.getElementById('status');
  status.textContent = 'Options saved.';

  setTimeout(() => { status.textContent = ''; }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  setupOptions();
  document.getElementById('save').addEventListener('click', () => saveOptions());
});
