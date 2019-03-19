(function() {

  var pkg = getPackageJsonSync();

  var config = {paths: {}, map: {"*": {}}};

  if(pkg.paths) {
    var keys = Object.keys(pkg.paths);
    var L = keys.length;
    var i = -1;
    while(++i < L) {
      var module = keys[i];
      var versionedModule = pkg.name + "@" + pkg.version + "/" + module;

      // E.g. "./"
      var path = "." + pkg.paths[keys[i]];

      config.paths[versionedModule] = path;

      // Allow referencing by the unversioned module id in the sandbox.
      config.map["*"][module] = versionedModule;
    }
  } else {
    config.paths[pkg.name] = ".";
  }

  if(pkg.dependencies) {
    for(var key in pkg.dependencies) {
      if(pkg.dependencies.hasOwnProperty(key)) {
        config.paths[key] = "./node_modules/" + key;
      }
    }
  }

  if(pkg.config) {
    config.config = pkg.config;
  }

  require.config(config);

  function getPackageJsonSync() {
    var xhr = new XMLHttpRequest();
    var isAsync = false;
    xhr.open("GET", "./package.json", isAsync);

    xhr.send();

    if(xhr.status !== 200) {
      return null;
    }

    return JSON.parse(xhr.responseText);
  }
})();
