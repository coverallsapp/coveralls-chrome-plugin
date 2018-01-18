## Chrome Extension

This project uses yarn and webpack to build a chrome extension. In order to setup your development environment, follow
below steps:

1. Clone project to your system
2. Install yarn on your system (brew install yarn on a mac with homebrew)
3. Run `yarn install` inside of directory.
4. Run `yarn build` to build the extension using webpack
5. Load the `dist` directory as an unpacked extension in chrome (you may need to make sure development features are enabled in your browser)

Each time you update the extension you will need to rebuild it and reload it in chrome.
