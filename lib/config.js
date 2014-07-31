'use strict';

var path = require('path');
var fs = require('fs');
var pkg = require('../package.json');

var config = {
  usergrid: {
    version: pkg.usergrid.version,
    launcherUrl: pkg.usergrid.launcher
  },
  userHome: process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
}
config.tmpDir = path.join(config.userHome, '.a127');
mkDir(config.tmpDir);
config.usergrid.dir = tempDir('usergrid');


var launcherFileName = 'usergrid-launcher-' + config.usergrid.version + '.jar';
config.usergrid.launcherFile = path.join(config.usergrid.dir, launcherFileName);


module.exports = config;


function tempDir(relativePath) {
  if (!relativePath) { return config.tmpDir; }
  var dirPath = path.resolve(config.tmpDir, relativePath);
  mkDir(dirPath);
  return dirPath;
}

function mkDir(path) {
  try {
    fs.mkdirSync(path);
  } catch (err) {
    if (err.code !== 'EEXIST') { throw err; }
  }
}
