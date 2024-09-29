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

    describe(".createAsync", function() {

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
        DefaultViewAnnotation.createAsync(forModule).then(function(annotation) {
          expect(moduleMetaService.get.calls.first().args[0]).toBe(defaultViewModuleId);
          expect(annotation.module).toBe(defaultViewModule);
        });
      });

      it("should resolve module argument in the annotation spec", function() {
        DefaultViewAnnotation.createAsync(forModule, {
          module: viewModuleId
        }).then(function(annotation) {
          expect(moduleMetaService.get.calls.first().args[0]).toBe(viewModuleId);
          expect(annotation.module).toBe(viewModule);
        });
      });
    });
  });

});
