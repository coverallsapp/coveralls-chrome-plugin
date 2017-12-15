import * as axios from 'axios';
import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener((request) => {
  if (request.requestUrl) {
    return axios.get(request.requestUrl, {
      headers: { Authentication: `token ${request.token}` },
    });
  }

  return false;
});
