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
        "tests/pentaho/util/errorMatch"
      ]).then(function(deps) {
        visualUtil = deps[0];
        moduleMetaService = deps[1];
        errorMatch = deps[2];
      })
    });

    afterEach(function() {
      localRequire.dispose();
    });

    it("should be defined", function() {
      expect(visualUtil instanceof Object).toBe(true);
    });

    describe("getDefaultViewModule(vizTypeId)", function() {

      it("should throw if `vizTypeId` is not specified", function() {
        expect(function() {
          visualUtil.getDefaultViewModule()
        }).toThrow(errorMatch.argRequired("vizTypeId"));
      });

      it("should get the model's default view module", function() {
        var result = visualUtil.getDefaultViewModule("test/foo/Model");

        expect(result).toBe(moduleMetaService.get("test/foo/View"));
      });

    });

    describe("getModelAndDefaultViewModules(vizTypeId)", function() {

      it("should throw if `vizTypeId` is not specified", function() {
        expect(function() {
          visualUtil.getDefaultViewModule()
        }).toThrow(errorMatch.argRequired("vizTypeId"));
      });

      it("should reject if the model has no defined default view class", function() {
        return visualUtil.getModelAndDefaultViewClassesAsync("test/foo/Model2")
          .then(function() {
            return Promise.reject("Should have been rejected.");
          }, function(error) {
            expect(error).toEqual(jasmine.any(Error));
          });
      });

      it("should reject if the model refers to an undefined default view class", function() {
        return visualUtil.getModelAndDefaultViewClassesAsync("test/foo/ModelUndefDefaultView")
          .then(function() {
            return Promise.reject("Should have been rejected.");
          }, function(error) {
            expect(error).toEqual(jasmine.any(Error));
          });
      });

      it("should get the model module and its default view module", function() {
        var result = visualUtil.getModelAndDefaultViewModules("test/foo/Model");

        expect(result.model).toEqual(moduleMetaService.get("test/foo/Model"));
        expect(result.view).toEqual(moduleMetaService.get("test/foo/View"));
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
  });
});
