# usergrid-npm

This module is designed to download a the version of Usergrid assigned in the package.json usergrid section. It was
designed to allow the "embedding" of Usergrid within Apigee-127, but could potentially be used by other apps.

To use:

    var usergrid = require('usergrid-installer');
    usergrid.launcherFile(true, function(err, fileName) {
      // use fileName here (it is an executable jar file)...
    });
    
The first parameter to usergrid.launcherFile() is a boolean indicating whether to automatically download the file if it
isn't already present. The second parameter is a callback that will return the fileName if the file exists - or null if 
not and the first parameter is false.

The file will be deposited in the ~/.a127/usergrid directory.

## For maintainers

You must keep the following package.json field in sync:

1. version
2. usergrid.version  (used to identify the downloaded file name)
3. usergrid.launcher (the URL of the jar matching the version)

Please adhere to [Semantic Versioning](http://semver.org) for both version numbers such that modules relying on the 
Semantic Versioning of the npm version can have similar assumptions about the Usergrid version.
