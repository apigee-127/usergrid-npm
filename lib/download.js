'use strict';

// todo: should do an MD5 test of downloaded file

var http = require('http');
var https = require('https');
var fs = require('fs');
var config = require('./config');
var debug = require('debug')('usergrid');

module.exports = {
  launcherFile: launcherFile,

  // for testing
  _download: download
}

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

function downloadLauncher(cb) {
  var url = config.usergrid.launcherUrl;
  var destFile = config.usergrid.launcherFile;
  download(url, destFile, cb);
}

// returns final file size if successful (or -1 if unknown)
function download(url, destFile, cb) {

  var proto = url.substr(0, url.indexOf(':')) == 'https' ? https : http;

  var error = function(err) {
    debug(err);
    debug('error: removing downloaded file');
    fs.unlink(destFile);
    cb(err);
  }

  var file = fs.createWriteStream(destFile);
  file.on('error', error);

  proto.get(url, function(res) {

    var size = 0;

    res.on('data', function(chunk) {
      file.write(chunk);
      size += chunk.length;
      process.stdout.write('.');
      if (debug.enabled) { debug('downloaded ' + size + ' bytes'); }
    })
    .on('end', function() {
      debug('closing file');
      file.close(function(err) {
        if (err) { return error(err); }
        cb(null, size);
      });
    })
    .on('error', error);
  })
};
