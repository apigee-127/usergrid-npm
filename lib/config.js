'use strict';

var path = require('path');
var os = require('os');
var pkg = require('../package.json');

var config = {
  usergrid: {
    version: pkg.usergrid.version,
    launcherUrl: pkg.usergrid.launcher
  }
}
config.tmpDir = os.tmpdir();
config.usergrid.dir = os.tmpdir();

var launcherFileName = 'usergrid-launcher-' + config.usergrid.version + '.jar';
config.usergrid.launcherFile = path.join(config.usergrid.dir, launcherFileName);

module.exports = config;
