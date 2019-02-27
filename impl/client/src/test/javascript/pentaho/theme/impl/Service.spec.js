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

define(function() {

  "use strict";

  describe("pentaho.theme.impl.Service", function() {

    var ThemeService;
    var localRequire;

    describe("#loadModuleThemeAsync(moduleOrIdOrArrayOf)", function() {

      var ThemeAnnotation;
      var moduleMetaService;
      var errorMatch;

      beforeEach(function() {

        localRequire = require.new();

        moduleMetaService = createModuleMetaServiceMock();

        localRequire.define("pentaho/module/metaService", function() {
          return moduleMetaService;
        });

        return localRequire.promise([
          "pentaho/theme/impl/Service",
          "pentaho/theme/ThemeAnnotation",
          "tests/pentaho/util/errorMatch"
        ])
          .then(function(deps) {
            ThemeService = deps[0];
            ThemeAnnotation = deps[1];
            errorMatch = deps[2];
          });
      });

      afterEach(function() {
        localRequire.dispose();
      });

      // region helpers
      function createModuleMetaServiceMock() {

        var moduleMetaService = jasmine.createSpyObj("moduleMetaService", [
          "get"
        ]);

        moduleMetaService.get.and.callFake(function(id) {
          return null;
        });

        return moduleMetaService;
      }
      // endregion

      it("should throw if given nully", function() {

        var themeService = new ThemeService();

        expect(function() {
          themeService.loadModuleThemeAsync();
        }).toThrow(errorMatch.argRequired("moduleOrIdOrArrayOf"));

        expect(function() {
          themeService.loadModuleThemeAsync(null);
        }).toThrow(errorMatch.argRequired("moduleOrIdOrArrayOf"));
      });

      it("should quietly load a theme for an undeclared module", function() {

        var themeService = new ThemeService();

        return themeService.loadModuleThemeAsync("test/undefined");
      });

      it("should quietly load the themes for two undeclared modules", function() {

        var themeService = new ThemeService();

        return themeService.loadModuleThemeAsync(["test/undefinedA", "test/undefinedB"]);
      });

      it("should call moduleMetaService.get with each given module id", function() {

        var themeService = new ThemeService();

        return themeService.loadModuleThemeAsync(["test/undefinedA", "test/undefinedB"]).then(function() {
          expect(moduleMetaService.get).toHaveBeenCalledWith("test/undefinedA");
          expect(moduleMetaService.get).toHaveBeenCalledWith("test/undefinedB");
        });
      });

      it("should call module.getAnnotation for each given module", function() {

        var aMeta = {
          kind: "type",
          ancestor: null,
          getAnnotation: jasmine.createSpy("getAnnotation").and.returnValue(null)
        };

        var bMeta = {
          kind: "type",
          ancestor: null,
          getAnnotation: jasmine.createSpy("getAnnotation").and.returnValue(null)
        };

        moduleMetaService.get.and.callFake(function(id) {
          if(id === "a") {
            return aMeta;
          }

          if(id === "b") {
            return bMeta;
          }

          return null;
        });

        var themeService = new ThemeService();

        return themeService.loadModuleThemeAsync(["a", "b"]).then(function() {
          expect(aMeta.getAnnotation).toHaveBeenCalledWith(ThemeAnnotation);
          expect(bMeta.getAnnotation).toHaveBeenCalledWith(ThemeAnnotation);
        });
      });

      it("should load the ThemeAnnotation's main module, for each given module", function() {

        var annotationA = {
          main: {
            loadAsync: jasmine.createSpy("loadAsync").and.returnValue(Promise.resolve())
          },
          extensions: null
        };

        var aMeta = {
          kind: "type",
          ancestor: null,
          getAnnotation: jasmine.createSpy("getAnnotation").and.returnValue(annotationA)
        };

        moduleMetaService.get.and.callFake(function(id) {
          if(id === "a") {
            return aMeta;
          }

          return null;
        });

        var themeService = new ThemeService();

        return themeService.loadModuleThemeAsync("a").then(function() {
          expect(annotationA.main.loadAsync).toHaveBeenCalledTimes(1);
        });
      });

      it("should load the ThemeAnnotation's extensions' modules, for each given module", function() {

        var annotationA = {
          main: {
            loadAsync: jasmine.createSpy("loadAsync").and.returnValue(Promise.resolve())
          },
          extensions: [
            {
              loadAsync: jasmine.createSpy("loadAsync").and.returnValue(Promise.resolve())
            },
            {
              loadAsync: jasmine.createSpy("loadAsync").and.returnValue(Promise.resolve())
            }
          ]
        };

        var aMeta = {
          kind: "type",
          ancestor: null,
          getAnnotation: jasmine.createSpy("getAnnotation").and.returnValue(annotationA)
        };

        moduleMetaService.get.and.callFake(function(id) {
          if(id === "a") {
            return aMeta;
          }

          return null;
        });

        var themeService = new ThemeService();

        return themeService.loadModuleThemeAsync("a").then(function() {
          expect(annotationA.extensions[0].loadAsync).toHaveBeenCalledTimes(1);
          expect(annotationA.extensions[1].loadAsync).toHaveBeenCalledTimes(1);
        });
      });

      it("should load the ThemeAnnotation's extension modules after the main module", function() {
        var index = 0;
        var mainIndex = -1;
        var extensionIndex = -1;

        var annotationA = {
          main: {
            loadAsync: jasmine.createSpy("loadAsync").and.callFake(function() {
              mainIndex = ++index;
              return Promise.resolve();
            })
          },
          extensions: [
            {
              loadAsync: jasmine.createSpy("loadAsync").and.callFake(function() {
                extensionIndex = ++index;
                return Promise.resolve();
              })
            }
          ]
        };

        var aMeta = {
          kind: "type",
          ancestor: null,
          getAnnotation: jasmine.createSpy("getAnnotation").and.returnValue(annotationA)
        };

        moduleMetaService.get.and.callFake(function(id) {
          if(id === "a") {
            return aMeta;
          }

          return null;
        });

        var themeService = new ThemeService();

        return themeService.loadModuleThemeAsync("a").then(function() {
          expect(mainIndex).toBeLessThan(extensionIndex);
        });
      });

      it("should load the ancestor modules' before the given module", function() {
        var index = 0;
        var mainAIndex = -1;
        var extensionAIndex = -1;

        var mainBIndex = -1;
        var extensionBIndex = -1;

        var annotationA = {
          main: {
            loadAsync: jasmine.createSpy("loadAsync").and.callFake(function() {
              mainAIndex = ++index;
              return Promise.resolve();
            })
          },
          extensions: [
            {
              loadAsync: jasmine.createSpy("loadAsync").and.callFake(function() {
                extensionAIndex = ++index;
                return Promise.resolve();
              })
            }
          ]
        };

        var annotationB = {
          main: {
            loadAsync: jasmine.createSpy("loadAsync").and.callFake(function() {
              mainBIndex = ++index;
              return Promise.resolve();
            })
          },
          extensions: [
            {
              loadAsync: jasmine.createSpy("loadAsync").and.callFake(function() {
                extensionBIndex = ++index;
                return Promise.resolve();
              })
            }
          ]
        };

        var aMeta = {
          kind: "type",
          ancestor: null,
          getAnnotation: jasmine.createSpy("getAnnotation").and.returnValue(annotationA)
        };

        var bMeta = {
          kind: "type",
          ancestor: aMeta,
          getAnnotation: jasmine.createSpy("getAnnotation").and.returnValue(annotationB)
        };

        moduleMetaService.get.and.callFake(function(id) {
          if(id === "b") {
            return bMeta;
          }

          return null;
        });

        var themeService = new ThemeService();

        return themeService.loadModuleThemeAsync("b").then(function() {
          expect(mainAIndex).toBeLessThan(extensionAIndex);
          expect(extensionAIndex).toBeLessThan(mainBIndex);
          expect(mainBIndex).toBeLessThan(extensionBIndex);
        });
      });
    });

    describe("#getModuleNameCssSelector(moduleOrId)", function() {

      var themeService;

      beforeAll(function() {

        localRequire = require.new();

        return localRequire.promise(["pentaho/theme/impl/Service"])
          .then(function(deps) {
            ThemeService = deps[0];

            themeService = new ThemeService();
          });
      });

      afterAll(function() {
        localRequire.dispose();
      });

      it("should support being given a module", function() {
        var module = {id: "abc"};

        var result = themeService.getModuleNameCssSelector(module);

        expect(result).toBe(".abc");
      });

      it("should support being given a string", function() {
        var module = "abc";

        var result = themeService.getModuleNameCssSelector(module);

        expect(result).toBe(".abc");
      });

      it("should support being given a camelCase string", function() {

        var module = "andDoThat";

        var result = themeService.getModuleNameCssSelector(module);

        expect(result).toBe(".and-Do-That");
      });

      it("should extract the module name when given a string with the package id", function() {

        var module = "@scope/package@2.1.1/andDoThat";

        var result = themeService.getModuleNameCssSelector(module);

        expect(result).toBe(".and-Do-That");
      });
    });

    describe("#getModuleUniqueCssSelector(moduleOrId)", function() {

      var themeService;

      beforeAll(function() {

        localRequire = require.new();

        return localRequire.promise(["pentaho/theme/impl/Service"])
          .then(function(deps) {
            ThemeService = deps[0];

            themeService = new ThemeService();
          });
      });

      afterAll(function() {
        localRequire.dispose();
      });

      it("should support being given a module", function() {
        var module = {id: "abc"};

        var result = themeService.getModuleUniqueCssSelector(module);

        expect(result).toBe(".abc");
      });

      it("should support being given a string", function() {
        var module = "abc";

        var result = themeService.getModuleUniqueCssSelector(module);

        expect(result).toBe(".abc");
      });

      it("should support being given a camelCase string", function() {

        var module = "andDoThat";

        var result = themeService.getModuleUniqueCssSelector(module);

        expect(result).toBe(".and-Do-That");
      });

      it("should support being given a string with the package id", function() {

        var module = "@scope/package@2.1.1/andDoThat";

        var result = themeService.getModuleUniqueCssSelector(module);

        expect(result).toBe("._scope-package-2-1-1-and-Do-That");
      });
    });

    describe("#classifyDomAsModule(domElement, moduleOrId)", function() {

      var themeService;
      var domElement;

      beforeAll(function() {

        localRequire = require.new();

        return localRequire.promise(["pentaho/theme/impl/Service"])
          .then(function(deps) {
            ThemeService = deps[0];

            themeService = new ThemeService();
          });
      });

      beforeEach(function() {
        domElement = {
          classList: {
            add: jasmine.createSpy("classList.add")
          }
        };
      });

      afterAll(function() {
        localRequire.dispose();
      });

      it("should support being given a module", function() {
        var module = {id: "package@2.1.1/abc"};

        themeService.classifyDomAsModule(domElement, module);

        expect(domElement.classList.add).toHaveBeenCalledTimes(2);
        expect(domElement.classList.add).toHaveBeenCalledWith("abc");
        expect(domElement.classList.add).toHaveBeenCalledWith("package-2-1-1-abc");
      });

      it("should support being given a string", function() {

        var module = "package@2.1.1/abc";

        themeService.classifyDomAsModule(domElement, module);

        expect(domElement.classList.add).toHaveBeenCalledTimes(2);
        expect(domElement.classList.add).toHaveBeenCalledWith("abc");
        expect(domElement.classList.add).toHaveBeenCalledWith("package-2-1-1-abc");
      });

      it("should support being given a DOM Element with no classList", function() {

        var module = "package@2.1.1/abc";

        themeService.classifyDomAsModule({}, module);
      });
    });
  });
});
