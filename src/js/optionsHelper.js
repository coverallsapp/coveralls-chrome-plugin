export default class OptionsHelper {
  constructor() {
    this.defaultOptions = {
      overlayEnabled: true,
      gitUrl: 'github.com',
      coverallsUrl: 'coveralls.io',
      apiToken: '',
    };
  }

  getOptions(callback) {
    chrome.storage.sync.get('options', (optionsReturned) => {
      const options = optionsReturned.options || {};
      let save = false;

      Object.keys(this.defaultOptions).forEach((key) => {
        if (options[key] === undefined) {
          save = true;
          options[key] = this.defaultOptions[key];
        }
      });

      callback(options);
      if (save) this.saveOptions(options);
    });
  }

  saveOptions(options, callback) {
    chrome.storage.sync.set({ options }, callback);
  }
};