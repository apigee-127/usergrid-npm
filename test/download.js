var download = require('../lib/download');
var config = require('../lib/config');
var path = require('path');
var should = require('should');
var fs = require('fs');
var os = require('os');

describe('downloader', function() {

  var tmpDir = os.tmpdir();
  var testFile = path.join(tmpDir, 'download.test');

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

    var originalLauncherFile = config.usergrid.launcherFile;

    before(function(done) {
      var launcherFileName = 'usergrid-launcher-' + config.usergrid.version + '.jar';
      config.usergrid.launcherFile = path.join(tmpDir, launcherFileName);
      done();
    });

    after(function(done) {
      fs.unlink(config.usergrid.launcherFile, function() {
        config.usergrid.launcherFile = originalLauncherFile;
        done();
      });
    });

    it('should not download when not requested', function(done) {

      download.launcherFile(false, function(err, fileName) {
        should.not.exist(err);
        should.not.exist(fileName);
        done();
      });
    });

    it('should download when requested', function(done) {

      this.timeout(60000);

      download.launcherFile(true, function(err, fileName) {
        should.not.exist(err);
        fileName.should.equal(config.usergrid.launcherFile);
        done();
      });
    });

  });

  describe('portal', function() {

    var originalPortalFile = config.portal.gzip;
    var originalPortalDir = config.portal.dir;

    before(function(done) {
      var portalGzipName = 'usergrid-portal-' + config.portal.version + '.tar.gz';
      config.portal.gzip = path.join(tmpDir, portalGzipName);
      var portalDirName = 'usergrid-portal-' + config.portal.version;
      config.portal.dir = path.join(tmpDir, portalDirName);
      done();
    });

    after(function(done) {
      fs.unlink(config.portal.gzip, function() {
        download._rmDir(config.portal.dir);
        config.portal.dir = originalPortalDir;
        config.portal.gzip = originalPortalFile;
        done();
      });
    });

    it('should not download when not requested', function(done) {

      download.portalFile(false, function(err, fileName) {
        should.not.exist(err);
        should.not.exist(fileName);
        done();
      });
    });

    it('should download and inflate when requested', function(done) {

      this.timeout(60000);

      download.portalFile(true, function(err, file) {
        should.not.exist(err);
        var expectedFile = path.resolve(config.portal.dir, 'usergrid-portal/index.html');
        file.should.equal(expectedFile);

        fs.existsSync(file).should.be.true;
        done();
      });
    });
  });
});
