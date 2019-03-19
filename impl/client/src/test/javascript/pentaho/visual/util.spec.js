/*!
 * Copyright 2019 Hitachi Vantara.  All rights reserved.
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
define([], function() {

  describe("pentaho.visual.util", function() {
    var localRequire;

    var moduleMetaService;
    var themeService;
    var visualUtil;
    var errorMatch;

    function configRequireJs(localRequire) {

      localRequire.define("test/foo/View", ["pentaho/visual/impl/View"], function(BaseView) {
        return BaseView.extend({
        });
      });

      localRequire.define("test/foo/Model", ["pentaho/visual/Model"], function(BaseModel) {
        return BaseModel.extend({
          $type: {
            id: "test/foo/Model"
          }
        });
      });

      localRequire.define("test/foo/ModelNoDefaultView", ["pentaho/visual/Model"], function(BaseModel) {
        return BaseModel.extend({
          $type: {
            id: "test/foo/ModelNoDefaultView"
          }
        });
      });

      localRequire.define("test/foo/ModelUndefDefaultView", ["pentaho/visual/Model"], function(BaseModel) {
        return BaseModel.extend({
          $type: {
            id: "test/foo/ModelUndefDefaultView"
          }
        });
      });

      localRequire.config({
        config: {
          "pentaho/modules": {
            "test/foo/Model": {
              "annotations": {
                "pentaho/visual/DefaultView": {module: "test/foo/View"}
              }
            },
            "test/foo/ModelUndefDefaultView": {
              "annotations": {
                "pentaho/visual/DefaultView": {module: "test/foo/UndefinedDefaultView"}
              }
            },
            "test/foo/ModelNoDefaultView": {
            }
          }
        }
      });
    }

    beforeEach(function() {
      localRequire = require.new();

      configRequireJs(localRequire);

      return localRequire.promise([
        "pentaho/visual/util",
        "pentaho/module/metaService",
        "pentaho/theme/service",
        "tests/pentaho/util/errorMatch"
      ]).then(function(deps) {
        visualUtil = deps[0];
        moduleMetaService = deps[1];
        themeService = deps[2];
        errorMatch = deps[3];
      });
    });

    afterEach(function() {
      localRequire.dispose();
    });

    it("should be defined", function() {
      expect(visualUtil instanceof Object).toBe(true);
    });

    describe("getDefaultViewModule(vizTypeId, {assertResult, inherit})", function() {

      it("should throw if `vizTypeId` is not specified", function() {
        expect(function() {
          visualUtil.getDefaultViewModule();
        }).toThrow(errorMatch.argRequired("vizTypeId"));
      });

      describe("when the vizTypeId module is not yet prepared", function() {
        it("should throw if `assertResult` is not specified", function() {
          expect(function() {
            visualUtil.getDefaultViewModule("test/foo/Model");
          }).toThrow(errorMatch.operInvalid());
        });

        it("should throw if `assertResult` is specified as true", function() {
          expect(function() {
            visualUtil.getDefaultViewModule("test/foo/Model", {assertResult: true});
          }).toThrow(errorMatch.operInvalid());
        });

        it("should return null if `assertResult` is specified as false", function() {
          var result = visualUtil.getDefaultViewModule("test/foo/Model", {assertResult: false});
          expect(result).toBe(null);
        });
      });

      describe("when the vizTypeId module is prepared", function() {

        beforeEach(function() {
          return Promise.all([
            moduleMetaService.get("test/foo/Model").prepareAsync(),
            moduleMetaService.get("test/foo/ModelNoDefaultView").prepareAsync()
          ]);
        });

        it("should return the view module when the annotation exists", function() {
          var result = visualUtil.getDefaultViewModule("test/foo/Model");

          expect(result).toBe(moduleMetaService.get("test/foo/View"));
        });

        it("should return null when the annotation does not exist and assertResult is false", function() {
          var result = visualUtil.getDefaultViewModule("test/foo/ModelNoDefaultView", {assertResult: false});

          expect(result).toBe(null);
        });

        it("should throw when the annotation does not exist and assertResult is true", function() {
          expect(function() {
            visualUtil.getDefaultViewModule("test/foo/ModelNoDefaultView", {assertResult: true});
          }).toThrow(errorMatch.operInvalid());
        });

        it("should throw when the annotation does not exist and assertResult is not specified", function() {
          expect(function() {
            visualUtil.getDefaultViewModule("test/foo/ModelNoDefaultView");
          }).toThrow(errorMatch.operInvalid());
        });
      });
    });

    describe("getModelAndDefaultViewClassesAsync(vizTypeId)", function() {

      it("should reject if `vizTypeId` is not specified", function() {
        return visualUtil.getModelAndDefaultViewClassesAsync()
          .then(function() {
            return Promise.reject("Should have been rejected.");
          }, function(error) {
            expect(error).toEqual(errorMatch.argRequired("vizTypeId"));
          });
      });

      it("should load the model and its default view class", function() {
        return visualUtil.getModelAndDefaultViewClassesAsync("test/foo/Model")
          .then(function(result) {

            expect(result).toEqual({
              Model: localRequire("test/foo/Model"),
              View:  localRequire("test/foo/View"),
              viewTypeId: "test/foo/View"
            });
          });
      });

      it("should reject if the vizTypeId refers is not defined", function() {
        return require.using(["pentaho/visual/util"], configRequireJs, function(visualUtil) {

          return visualUtil.getModelAndDefaultViewClassesAsync("test/foo/ModelUndefined")
            .then(function() {
              return Promise.reject("Should have been rejected.");
            }, function(error) {
              expect(error).toEqual(jasmine.any(Error));
            });
        });
      });
    });

    describe("#classifyDom(domElement, vizTypeId, viewTypeId)", function() {
      var domElement;

      beforeEach(function() {
        domElement = {
          classList: {
            add: jasmine.createSpy("classList.add")
          }
        };
      });

      it("should do nothing if `vizTypeId` and `viewTypeId` are 'undefined'", function() {
        visualUtil.classifyDom(domElement);

        expect(domElement.classList.add).toHaveBeenCalledTimes(0);
      });

      it("should classify `domElement` with `vizTypeId` css classes", function() {
        var vizTypeId = "package@2.1.1/Model";

        visualUtil.classifyDom(domElement, vizTypeId);

        expect(domElement.classList.add).toHaveBeenCalledTimes(2);
        expect(domElement.classList.add).toHaveBeenCalledWith("package-Model");
        expect(domElement.classList.add).toHaveBeenCalledWith("package-2-1-1-Model");
      });

      it("should classify `domElement` with `vizTypeId` and `viewTypeId` css classes", function() {
        var vizTypeId = "package@2.1.1/Model";
        var viewTypeId = "package@2.1.1/View";

        visualUtil.classifyDom(domElement, vizTypeId, viewTypeId);

        expect(domElement.classList.add).toHaveBeenCalledTimes(4);
        expect(domElement.classList.add).toHaveBeenCalledWith("package-Model");
        expect(domElement.classList.add).toHaveBeenCalledWith("package-2-1-1-Model");
        expect(domElement.classList.add).toHaveBeenCalledWith("package-View");
        expect(domElement.classList.add).toHaveBeenCalledWith("package-2-1-1-View");
      });
    });

    describe("#getCssClasses(vizTypeId, viewTypeId)", function() {
      it("should return an empty string if no argument is given", function() {
        var cssClasses = visualUtil.getCssClasses();

        expect(cssClasses).toBe("");
      });

      it("should return the css classes for `vizTypeId`", function() {
        var vizTypeId = "package@2.1.1/Model";

        var cssClasses = visualUtil.getCssClasses(vizTypeId);

        expect(cssClasses).toBe("package-Model package-2-1-1-Model");
      });

      it("should return the css classes for both `vizTypeId` and `viewTypeId`", function() {
        var vizTypeId = "package@2.1.1/Model";
        var viewTypeId = "package@2.1.1/View";

        var cssClasses = visualUtil.getCssClasses(vizTypeId, viewTypeId);

        expect(cssClasses).toEqual("package-Model package-2-1-1-Model package-View package-2-1-1-View");
      });
    });
  });
});
