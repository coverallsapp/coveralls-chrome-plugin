import * as axios from 'axios';
import browser from 'webextension-polyfill';
import optionsHelper from './optionsHelper';

export default class Coveralls {
  constructor(commitSha) {
    this.commitSha = commitSha;
    optionsHelper.getOptions().then((options) => {
      this.$http = axios.create({
        baseURL: `${options.coverallsUrl}/builds/${this.commitSha}`,
        headers: { Authentication: `token ${options.apiToken}` },
      });

      this._getSavedBuild();
    });
  }

  async getFile(filepath) {
    if (!this.commitObj.files[filepath]) {
      this.commitObj.files[filepath] = await this.$http.get('/source.json', {
        params: { filename: filepath },
      });
      this._cacheCommitObj();
    }

    return this.commitObj.files[filepath];
  }

  async getPath(path) {
    if (!this.commitObj.paths[path]) {
      this.commitObj.paths[path] = await this.$http.get('.json', {
        params: { paths: path },
      });
      this._cacheCommitObj();
    }

    return this.commitObj.paths[path];
  }

  async _getSavedBuild() {
    this.commitObj = await browser.storage.local.get(this.commitSha);

    if (!this.commitObj) {
      this.commitObj = await this.$http.get('.json');
      this.commitObj.files = {};
      this.commitObj.paths = {};
      this._cacheCommitObj();
    }
  }

  async _cacheCommitObj() {
    const cacheObj = {};
    cacheObj[this.commitSha] = this.commitObj;

    return browser.storage.local.set(cacheObj);
  }
}

