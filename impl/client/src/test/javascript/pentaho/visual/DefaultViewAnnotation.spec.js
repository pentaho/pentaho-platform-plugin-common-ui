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
define([], function() {

  "use strict";

  describe("pentaho.visual.DefaultViewAnnotation", function() {

    var DefaultViewAnnotation;

    var localRequire;
    var moduleMetaService;
    var errorMatch;

    var viewModuleId;

    var forModule;
    var viewModule;

    beforeEach(function() {
      localRequire = require.new();

      forModule = {
        kind: "type",
        resolveId: jasmine.createSpy("resolveId").and.callFake(function(id) { return id; })
      };

      viewModuleId = "test/module/View";
      viewModule = {
        id: viewModuleId,
        kind: "type"
      };

      moduleMetaService = createModuleMetaServiceMock();

      localRequire.define("pentaho/module/metaService", function() {
        return moduleMetaService;
      });

      return localRequire.promise([
        "pentaho/visual/DefaultViewAnnotation",
        "tests/pentaho/util/errorMatch"
      ]).then(function(deps) {
        DefaultViewAnnotation = deps[0];
        errorMatch = deps[1];
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

    describe("new DefaultViewAnnotation(forModule, module)", function() {

      it("should throw if given nully forModule argument", function() {
        expect(function() {
          new DefaultViewAnnotation()
        }).toThrow(errorMatch.argRequired("forModule"));
      });

      it("should have #module be the specified module argument", function() {
        var annotation = new DefaultViewAnnotation(forModule, viewModule);

        expect(annotation.module).toBe(viewModule);
      });

    });

    describe(".create", function() {

      var defaultViewModuleId;
      var defaultViewModule;

      beforeEach(function() {
        defaultViewModuleId = "./View";
        defaultViewModule = {
          id: defaultViewModuleId,
          kind: "type"
        };

        moduleMetaService.get.and.callFake(function(id) {
          if(id === viewModuleId) {
            return viewModule;
          }

          if (id === defaultViewModuleId) {
            return defaultViewModule;
          }

          return null;
        });
      });

      it("should default to './View' when the annotation spec is 'undefined'", function() {
        var annotation = DefaultViewAnnotation.create(forModule);

        expect(moduleMetaService.get.calls.first().args[0]).toBe(defaultViewModuleId);
        expect(annotation.module).toBe(defaultViewModule);
      });

      it("should resolve module argument in the annotation spec", function() {
        var annotation = DefaultViewAnnotation.create(forModule, {
          module: viewModuleId
        });

        expect(moduleMetaService.get.calls.first().args[0]).toBe(viewModuleId);
        expect(annotation.module).toBe(viewModule);
      });
    });
  });

});
