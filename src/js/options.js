import OptionsHelper from './optionsHelper';

function setupOptions(optionsHelper) {
  optionsHelper.getOptions((options) => {
    document.getElementById('overlay-enabled').checked = options.overlayEnabled;
    document.getElementById('git-url').value = options.gitUrl;
    document.getElementById('coveralls-url').value = options.coverallsUrl;
    document.getElementById('api-token').value = options.apiToken;
  });
}

function saveOptions(optionsHelper) {
  const options = {
    gitUrl: document.getElementById('git-url').value,
    overlayEnabled: document.getElementById('overlay-enabled').checked,
    coverallsUrl: document.getElementById('coveralls-url').value,
    apiToken: document.getElementById('api-token').value,
  };

  optionsHelper.saveOptions(options, () => {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';

    setTimeout(() => { status.textContent = ''; }, 1000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const optionsHelper = new OptionsHelper();

  setupOptions(optionsHelper);
  document.getElementById('save').addEventListener('click', () => saveOptions(optionsHelper));
});