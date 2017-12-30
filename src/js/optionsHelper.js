import browser from 'webextension-polyfill';

const defaultOptions = {
  overlayEnabled: true,
  gitUrl: 'github.com',
  coverallsUrl: 'coveralls.io',
  apiToken: '',
};

const saveOptions = (options) => browser.storage.sync.set({ options });

const getOptions = async () => {
  const optionsReturned = await browser.storage.sync.get('options');
  const options = optionsReturned.options || {};
  let save = false;

  Object.keys(defaultOptions).forEach((key) => {
    if (options[key] === undefined) {
      save = true;
      options[key] = defaultOptions[key];
    }
  });

  if (save) saveOptions(options);

  return options;
};


export default {
  defaultOptions,
  getOptions,
  saveOptions,
};
