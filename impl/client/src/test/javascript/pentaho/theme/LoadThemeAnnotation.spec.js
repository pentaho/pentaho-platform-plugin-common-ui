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

define([

], function() {

  "use strict";

  describe("pentaho.theme.LoadThemeAnnotation", function() {

    var moduleId = "test/foo/bar";

    var localRequire;
    var LoadThemeAnnotation;
    var errorMatch;
    var moduleMetaService;
    var themeService;

    beforeEach(function() {
      localRequire = require.new();

      localRequire.define("pentaho/theme/service", function() {

        themeService = jasmine.createSpyObj("theme service", ["loadModuleThemeAsync"]);

        themeService.loadModuleThemeAsync.and.returnValue(Promise.resolve());

        return themeService;
      });

      return localRequire.promise([
        "pentaho/theme/LoadThemeAnnotation",
        "tests/pentaho/util/errorMatch",
        "pentaho/module/metaService"
      ])
      .then(function(deps) {
        LoadThemeAnnotation = deps[0];
        errorMatch = deps[1];
        moduleMetaService = deps[2];
      });
    });

    afterEach(function() {
      localRequire.dispose();
    });

    function getModule() {
      return moduleMetaService.get(moduleId, {createIfUndefined: true});
    }

    describe("new(forModule, annotSpec={main, extensions})", function() {

      it("should throw when called with no forModule", function() {
        expect(function() {
          var annot = new LoadThemeAnnotation();
        }).toThrow(errorMatch.argRequired("forModule"));
      });

      it("should not throw when called with a forModule", function() {
        var annot = new LoadThemeAnnotation(getModule());
      });
    });

    describe("#id", function() {
      it("should have the correct value", function() {
        expect(LoadThemeAnnotation.id).toBe("pentaho/theme/LoadThemeAnnotation");
      });
    });

    describe("createAsync(forModule)", function() {

      it("should call the theme service's loadModuleThemeAsync for the annotation's forModule", function() {
        var module = getModule();
        return LoadThemeAnnotation.createAsync(module).then(function() {
          expect(themeService.loadModuleThemeAsync).toHaveBeenCalledTimes(1);
          expect(themeService.loadModuleThemeAsync).toHaveBeenCalledWith(module.id);
        });
      });

      it("should return a LoadThemeAnnotation of the given module", function() {
        var module = getModule();

        return LoadThemeAnnotation.createAsync(module).then(function(annotation) {
          expect(annotation instanceof LoadThemeAnnotation).toBe(true);
          expect(annotation.forModule).toBe(module);
        });
      });
    });
  });
});
