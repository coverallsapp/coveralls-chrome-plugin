import * as axios from 'axios';
import browser from 'webextension-polyfill';
import optionsHelper from './optionsHelper';

export default class Coveralls {
  constructor(commitSha) {
    this.commitSha = commitSha;
    optionsHelper.getOptions().then((options) => {
      this.$http = axios.create({
        baseURL: `${options.coverallsUrl}/builds`,
        headers: { Authentication: `token ${options.apiToken}` },
      });

      this._getSavedBuild();
    });
  }

  async getFile(filepath) {
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
    this.commitObj = await browser.storage.local.get(this.commitSha);
    console.log(this.commitObj);

    if (!Object.keys(this.commitObj).length) {
      const result = await this.$http.get(`${this.commitSha}.json`);
      this.commitObj = result.data;
      this.commitObj.files = {};
      this.commitObj.paths = {};
      this._cacheCommitObj();
    }
  }

  async _cacheCommitObj() {
    const cacheObj = {};
    console.log(this.commitObj);
    cacheObj[this.commitSha] = this.commitObj;

    return browser.storage.local.set(cacheObj);
  }
}

