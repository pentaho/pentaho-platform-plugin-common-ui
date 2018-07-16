(function() {

  var pkg = getPackageJsonSync();

  var config = {paths: {}};

  config.paths[pkg.name] = ".";

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
