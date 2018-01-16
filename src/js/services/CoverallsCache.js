import * as axios from 'axios';
import browser from 'webextension-polyfill';
import optionsHelper from '../helpers/optionsHelper';

export default class CoverallsCache {
  constructor(commitSha) {
    this.commitSha = commitSha;
    this._clearExpiredCache();
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
      try {
        const result = await this.$http.get(`${this.commitSha}/source.json`, {
          params: { filename: filepath },
        });
        this.commitObj.files[filepath] = result.data;
      } catch (error) {
        this.commitObj.files[filepath] = {};
      }

      this._cacheCommitObj();
    }

    return this.commitObj.files[filepath];
  }

  async getPath(path) {
    if (!this.commitObj) {
      await this._getSavedBuild();
    }

    if (!this.commitObj.paths[path]) {
      try {
        const result = await this.$http.get(`${this.commitSha}.json`, {
          params: { paths: path },
        });
        this.commitObj.paths[path] = result.data;
      } catch (error) {
        this.commitObj.paths[path] = {};
      }

      this._cacheCommitObj();
    }

    return this.commitObj.paths[path];
  }

  async _getSavedBuild() {
    this.commitObj = (await browser.storage.local.get(this.commitSha))[this.commitSha];

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
    const date = new Date();
    const cacheObj = {};
    this.commitObj.expirationDate = date.setDate(date.getDate() + 7);
    cacheObj[this.commitSha] = this.commitObj;

    return browser.storage.local.set(cacheObj);
  }

  async _clearExpiredCache() {
    const allCached = await browser.storage.local.get();
    const date = new Date();
    Object.keys(allCached).forEach(async (cacheKey) => {
      if (allCached[cacheKey] && allCached[cacheKey].expirationDate < date) {
        console.log('here');
        const reset = {};
        reset[cacheKey] = null;
        await browser.storage.local.set(reset);
      }
    });
  }
}

