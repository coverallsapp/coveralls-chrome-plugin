import * as axios from 'axios';
import browser from 'webextension-polyfill';
import optionsHelper from '../helpers/optionsHelper';

export default class CoverallsCache {
  constructor(commitSha) {
    this.commitSha = commitSha;
    optionsHelper.getOptions().then((options) => {
      this.$http = axios.create({
        baseURL: `${options.coverallsUrl}/builds`,
        headers: { Authentication: `token ${options.apiToken}` },
      });
    });
  }

  async getFile(filepath) {
    if (!this.commitObj) {
      await this._getSavedBuild();
    }

    if (!this.commitObj.files[filepath]) {
      const result = await this.$http.get(`${this.commitSha}/source.json`, {
        params: { filename: filepath },
      });
      this.commitObj.files[filepath] = result.data;
      this._cacheCommitObj();
    }

    return this.commitObj.files[filepath];
  }

  async getPath(path) {
    if (!this.commitObj) {
      await this._getSavedBuild();
    }

    if (!this.commitObj.paths[path]) {
      const result =  await this.$http.get(`${this.commitSha}.json`, {
        params: { paths: path },
      });
      this.commitObj.paths[path] = result.data;
      this._cacheCommitObj();
    }

    return this.commitObj.paths[path];
  }

  async _getSavedBuild() {
    this.commitObj = await browser.storage.local.get(this.commitSha)[this.commitSha];

    if (!(this.commitObj && Object.keys(this.commitObj).length)) {
      const result = await this.$http.get(`${this.commitSha}.json`);
      this.commitObj = result.data;
      this.commitObj.files = {};
      this.commitObj.paths = {};
      this._cacheCommitObj();
    }

    return this.commitObj;
  }

  async _cacheCommitObj() {
    const cacheObj = {};
    console.log(this.commitObj);
    cacheObj[this.commitSha] = this.commitObj;

    return browser.storage.local.set(cacheObj);
  }
}

