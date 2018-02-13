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
    webstore.uploadExisting(zipFile, token);
  });
};

updateWebstore(args.f, args.z);

