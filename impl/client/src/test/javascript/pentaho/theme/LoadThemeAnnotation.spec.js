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
