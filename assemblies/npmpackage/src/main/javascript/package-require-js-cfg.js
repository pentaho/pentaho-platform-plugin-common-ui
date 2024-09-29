/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


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

      config.paths[versionedModule] = removeTrailingSlash(path);

      // Allow referencing by the unversioned module id in the sandbox.
      config.map["*"][module] = versionedModule;
    }
  } else {
    config.paths[pkg.name] = ".";
  }

  if(pkg.dependencies) {
    for(var depName in pkg.dependencies) {
      if(pkg.dependencies.hasOwnProperty(depName)) {

        var depPkg = getPackageJsonSync(depName);

        configureDependency(config, depName, depPkg);
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

  function configureDependency(config, depName, depPkg) {
    processPackageMain(config, depName, depPkg);
  }

  function processPackageMain(config, depName, pkgDep) {
    // In sync with:
    // https://github.com/pentaho/pentaho-osgi-bundles/blob/master/pentaho-webpackage/listeners/requirejs/
    //   src/main/java/org/pentaho/webpackage/extender/requirejs/impl/RequireJsPackageImpl.java#L227

    if(pkgDep.main) {
      // Npm: https://docs.npmjs.com/files/package.json#main
      if(Array.isArray(pkgDep.main)) {
        var mains = pkgDep.main;
        var L = mains.length;
        var i = -1;
        while(++i < L) {
          if(processMainField(config, depName, mains[i])) {
            break;
          }
        }
      } else {
        processMainField(config, depName, pkgDep.main);
      }

      // Process other fields as well, possibly overriding this, if anything was done!
    }

    // All these alternate main file fields are due to D3 (see https://github.com/d3/d3/issues/3138)
    // and possibly other libraries.
    // "module" (https://github.com/rollup/rollup/wiki/pkg.module) and
    // "jsnext:main" (https://github.com/jsforum/jsforum/issues/5)
    // are only for ES2015 modules, unsupported for now
    if(pkgDep.unpkg) {
      processMainField(config, depName, pkgDep.unpkg);

    } else if(pkgDep.jsdelivr) {
      // "jsdelivr" field for package.json:
      // https://github.com/jsdelivr/jsdelivr#configuring-a-default-file-in-packagejson
      processMainField(config, depName, pkgDep.jsdelivr);

    } else if(pkgDep.browser) {
      // "browser" field for package.json: https://github.com/defunctzombie/package-browser-field-spec
      if(typeof pkgDep.browser === "string") {
        // Alternate main - basic
        processMainField(config, depName, pkgDep.browser);
      } else {
        // Replace specific files - advanced
        processBrowserMainMap(config, depName, pkgDep.browser);
      }
    } else {
      addDependencyPath(config, depName, "", pkgDep.name);
    }
  }

  function processMainField(config, depName, main) {

    if(isRelativePath(main)) {
      main = stripRelativePath(main);
    } else if(isAbsolutePath(main)) {
      main = stripAbsolutePath(main);
    }

    if(isJSPath(main)) {
      addDependencyPath(config, depName, "", removeJsExtension(main));
      return true;
    }

    return false;
  }

  function processBrowserMainMap(config, depName, browserMap) {

    Object.keys(browserMap).forEach(function(importPath) {
      var replacePath = browserMap[importPath];
      if(replacePath) {
        if(isRelativePath(importPath)) {
          // Replacing an internal file, create a path definition for it.

          if(isRelativePath(replacePath)) {
            replacePath = stripRelativePath(replacePath);
          }

          addDependencyPath(
            config,
            depName,
            removeJsExtension(stripRelativePath(importPath)),
            removeJsExtension(replacePath));
        } else {
          // Replacing an external module, create a map definition for it.
          var replaceModule;
          if(isRelativePath(replacePath)) {
            replaceModule = depName + "/" + removeJsExtension(stripRelativePath(replacePath));
          } else {
            replaceModule = removeJsExtension(replacePath);
          }

          addDependencyMap(config, depName, removeJsExtension(importPath), replaceModule);
        }
      } else {
        // Ignore importPath.
        // Map to nothing.
        var ignoreModule;
        if(isRelativePath(importPath)) {
          ignoreModule = depName + "/" + removeJsExtension(stripRelativePath(importPath));
        } else {
          ignoreModule = removeJsExtension(importPath);
        }

        addDependencyMap(config, depName, ignoreModule, "no-where-to-be-found");
      }
    });
  }

  function addDependencyPath(config, depName, depImport, path) {

    depImport = depImport ? (depName + "/" + depImport) : depName;

    config.paths[depImport] = "./node_modules/" + depName + "/" + path;
  }

  function addDependencyMap(config, depName, fromModule, toModule) {

    var depMap = config.map[depName] || (config.map[depName] = {});

    depMap[fromModule] = toModule;
  }

  function removeJsExtension(main) {
    return main.replace(/\.js$/, "");
  }

  function removeTrailingSlash(path) {
    return path.replace(/\/$/, "");
  }

  function isRelativePath(path) {
    // StartsWith ./
    return /^\.\//.test(path);
  }

  function stripRelativePath(path) {
    return path.substr(2);
  }

  function isAbsolutePath(path) {
    // StartsWith /
    return path.charAt(0) === "/";
  }

  function stripAbsolutePath(path) {
    return path.substr(1);
  }

  function isJSPath(path) {
    // EndsWith .js
    return /\.js$/.test(path);
  }
})();
