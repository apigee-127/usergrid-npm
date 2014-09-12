'use strict';

// todo: should do an MD5 test of downloaded files
// todo: cleanup old versions

var http = require('http');
var https = require('https');
var fs = require('fs');
var config = require('./config');
var debug = require('debug')('usergrid');
var tar = require('tar');
var zlib = require('zlib');
var path = require('path');

module.exports = {
  launcherFile: launcherFile,
  portalFile: portalFile,

  // for testing
  _download: download,
  _inflate: inflate,
  _rmDir: rmDir
};

// returns the current Usergrid launcher file name (or null if missing and download is false)
// set download to true to auto-download launcher if missing
function launcherFile(download, cb) {

  var destFile = config.usergrid.launcherFile;
  fs.exists(destFile, function(exists) {
    if (exists) { return cb(null, destFile); }
    if (!download) { return cb(null); }

    downloadLauncher(function(err, size) {
      if (err) { return cb(err); }
      cb(null, destFile);
    });
  });
}

// returns the current Usergrid portal index file (or null if missing and download is false)
// set download to true to auto-download portal if missing
function portalFile(download, cb) {

  var destDir = config.portal.dir;
  fs.exists(destDir, function(exists) {
    var indexFile = portalIndexFile();
    if (exists) { return cb(null, indexFile); }
    if (!download) { return cb(); }

    downloadPortal(function(err) {
      if (err) { return cb(err); }
      cb(null, indexFile);
    });
  });
}

// returns jar path to callback
function downloadLauncher(cb) {
  var url = config.usergrid.launcherUrl;
  var destFile = config.usergrid.launcherFile;
  download(url, destFile, cb);
}

var PORTAL_CONFIG_OVERRIDES =
  "\nUsergrid.showNotifcations = false;\nUsergrid.overrideUrl = 'http://localhost:8080/';\n";

// returns directory path to callback
function downloadPortal(cb) {
  var url = config.portal.portalUrl;
  var destFile = config.portal.gzip;
  var destDir = config.portal.dir;

  download(url, destFile, function(err, size) {
    if (err) { return cb(err); }

    inflate(destFile, destDir, function(err) {
      if (err) { return cb(err); }

      // fix up config file with local settings
      var configFile = path.resolve(destDir, 'usergrid-portal/config.js');
      fs.appendFile(configFile, PORTAL_CONFIG_OVERRIDES, cb);
    });
  });
}

function portalIndexFile() {
  var destDir = config.portal.dir;
  var directory = path.resolve(destDir, 'usergrid-portal');
  return path.resolve(directory, 'index.html');
}

// returns final file size if successful (or -1 if unknown)
function download(url, destFile, cb) {

  var proto = url.substr(0, url.indexOf(':')) == 'https' ? https : http;
  var tmpFile = destFile + '.tmp';

  var error = function(err) {
    debug(err);
    debug('error: removing downloaded file');
    fs.unlink(tmpFile);
    cb(err);
  };

  var file = fs.createWriteStream(tmpFile);
  file.on('error', error);

  proto.get(url, function(res) {

    var size = 0;
    var count = 0;

    res.on('data', function(chunk) {
      file.write(chunk);
      size += chunk.length;
      if (++count % 70 === 0) { process.stdout.write('.'); }
      if (debug.enabled) { debug('downloaded ' + size + ' bytes'); }
    })
      .on('end', function() {
        fs.rename(tmpFile, destFile, function(err) {
          if (err) { return error(err); }
          cb(null, size);
        });
      })
      .on('error', error);
  })
}

function inflate(file, directory, cb) {
  fs.createReadStream(file)
    .pipe(zlib.createGunzip())
    .pipe(tar.Extract({ path: directory }))
    .on('error', function (err) {
      debug('error: %s', err.message);
      cb(err);
    })
    .on('end', function () {
      cb(null, directory);
    });
}

function rmDir(dirPath) {
  try {
    var files = fs.readdirSync(dirPath);
  } catch(e) { return; }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
        rmDir(filePath);
      }
    }
  fs.rmdirSync(dirPath);
}
