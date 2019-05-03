/*!
 * Copyright 2019 Hitachi Vantara. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        var pkgDep = getPackageJsonSync(key);
        config.paths[key] = "./node_modules/" + key + "/" + getPackageMainScript(pkgDep);
      }
    }
  }

  if(pkg.config) {
    config.config = pkg.config;
  }

  require.config(config);

  function getPackageJsonSync(packageName) {
    var xhr = new XMLHttpRequest();
    var isAsync = false;
    var dir = packageName ? ("./node_modules/" + packageName + "/") : "./";
    xhr.open("GET", dir + "package.json", isAsync);

    xhr.send();

    if(xhr.status !== 200) {
      return null;
    }

    return JSON.parse(xhr.responseText);
  }

  function getPackageMainScript(pkgDep) {

    if(pkgDep.unpkg) {
      return pkgDep.unpkg.replace(/\.js$/, "");
    }

    return pkgDep.name;
  }
})();
