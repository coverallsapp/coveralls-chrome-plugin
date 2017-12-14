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
    chrome.storage.sync.get('options', (options) => {
      this.options = options;
      let save = false;

      Object.keys(this.defaultOptions).forEach((key) => {
        if (this.optionsKey === undefined) {
          save = true;
          this.options[key] = this.defaultOptions[key];
        }
      });

      callback(options);
      if (save) this.saveOptions(this.options);
    });
  }

  saveOptions(options, callback) {
    this.options = options;

    chrome.storage.sync.set({ options }, callback);
  }
};