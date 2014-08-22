'use strict';

var path = require('path');
var fs = require('fs');
var pkg = require('../package.json');

var config = {
  usergrid: {
    version: pkg.usergrid.version,
    launcherUrl: pkg.usergrid.launcher
  },
  portal: {
    version: pkg.portal.version,
    portalUrl: pkg.portal.gzip
  },
  userHome: process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
}
config.tmpDir = path.join(config.userHome, '.a127');
mkDir(config.tmpDir);
config.usergrid.dir = tempDir('usergrid');

var launcherFileName = 'usergrid-launcher-' + config.usergrid.version + '.jar';
config.usergrid.launcherFile = path.join(config.usergrid.dir, launcherFileName);

var portalGzipName = 'usergrid-portal-' + config.portal.version + '.tar.gz';
config.portal.gzip = path.join(config.usergrid.dir, portalGzipName);
var portalDirName = 'usergrid-portal-' + config.portal.version;
config.portal.dir = path.join(config.usergrid.dir, portalDirName);

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
