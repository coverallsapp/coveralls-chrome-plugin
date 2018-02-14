// This file exists only on production branch.
//
// If you see this as a change, you are merging production code into master. DO NOT CONTINUE.

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const args = require('minimist')(process.argv.slice(2));
const env = require('node-env-file');
const webstoreUploader = require('chrome-webstore-upload');

// Import and use environment variables set in local deploy.env file.
env('./deploy.env');

/* eslint no-console: 0 */
if (process.env.EXTENSION_ID &&
  process.env.CLIENT_ID &&
  process.env.CLIENT_SECRET &&
  process.env.REFRESH_TOKEN) {
  const webstore = webstoreUploader({
    extensionId: process.env.EXTENSION_ID,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  });

  const createZip = async (folderDir, zipFolderDir) => {
    return exec(`zip -r ${zipFolderDir} ${folderDir}`);
  };

  const updateWebstore = async (folderDir, zipFolderDir) => {
    await createZip(folderDir, zipFolderDir);
    const zipFile = fs.createReadStream(zipFolderDir);

    webstore.fetchToken().then((token) => {
      webstore.uploadExisting(zipFile, token).then((response) => {
        if (response.uploadState === 'SUCCESS') {
          console.log(`\n\tUpload successful, to finish publishing go to:\n\thttps://chrome.google.com/webstore/developer/edit/${process.env.EXTENSION_ID}`);
        } else {
          console.error('\n\tUpload unsuccessful');
        }
      });
    });
  };

  updateWebstore(args.f, args.z);
} else {
  console.log(`
    EXTENSION_ID, CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN must be set via deploy.env file.

    Go this site for information on how to get these credentials:
      https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md`);
}
