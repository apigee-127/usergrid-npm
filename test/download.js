var download = require('../lib/download');
var config = require('../lib/config');
var path = require('path');
var should = require('should');
var fs = require('fs');

describe('downloader', function() {

  var testFile = path.join(config.tmpDir, 'download.test');

  it('should be able to download a small test file', function(done) {

    after(function(done) {
      fs.unlink(testFile, function() { done(); });
    });

    var testUrl = 'https://avatars3.githubusercontent.com/u/772731?v=1&s=460';

    download._download(testUrl, testFile, function(err, size) {
      should.not.exist(err);

      fs.stat(testFile, function(err, stats) {
        should.not.exist(err);

        stats.isFile().should.be.true;
        stats.size.should.be.greaterThan(0);
        stats.size.should.equal(size);

        done();
      });
    });
  });

  describe('launcher', function() {

    it('should not download when not requested', function(done) {

      download.launcherFile(false, function(err, fileName) {
        should.not.exist(err);
        should.not.exist(fileName);
        done();
      });
    });

    it('should download when requested', function(done) {

      this.timeout(45000);

      var originalLauncherFile = config.usergrid.launcherFile;
      var launcherFileName = 'usergrid-launcher-' + config.usergrid.version + '.jar';
      config.usergrid.launcherFile = path.join(config.tmpDir, launcherFileName);

      after(function(done) {
        fs.unlink(config.usergrid.launcherFile, function() {
          config.usergrid.launcherFile = originalLauncherFile;
          done();
        });
      });

      download.launcherFile(true, function(err, fileName) {
        should.not.exist(err);
        fileName.should.equal(config.usergrid.launcherFile);
        done();
      });
    });

  });
});
