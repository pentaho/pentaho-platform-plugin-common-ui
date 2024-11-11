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

  describe("pentaho.theme.ThemeAnnotation", function() {

    var moduleId = "test/foo/bar";

    var localRequire;
    var ThemeAnnotation;
    var errorMatch;
    var moduleMetaService;

    beforeEach(function() {
      localRequire = require.new();

      return localRequire.promise([
        "pentaho/theme/ThemeAnnotation",
        "tests/pentaho/util/errorMatch",
        "pentaho/module/metaService"
      ])
      .then(function(deps) {
        ThemeAnnotation = deps[0];
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
          var annot = new ThemeAnnotation();
        }).toThrow(errorMatch.argRequired("forModule"));
      });

      it("should throw when called with no annotSpec.main", function() {
        expect(function() {
          var annot = new ThemeAnnotation(getModule());
        }).toThrow(errorMatch.argRequired("annotSpec.main"));
      });

      it("should not throw when called with a forModule and annotSpec.main", function() {
        var annotSpec = {main: "foo"};
        var annot = new ThemeAnnotation(getModule(), annotSpec);
      });

      it("should get the given module in the forModule property", function() {
        var module = getModule();
        var annotSpec = {main: "foo"};
        var annot = new ThemeAnnotation(module, annotSpec);
        expect(annot.forModule).toBe(module);
      });

      it("should get the given annotSpec.main in the main property", function() {
        var module = getModule();
        var annotSpec = {main: "foo"};
        var annot = new ThemeAnnotation(module, annotSpec);
        expect(annot.main.id).toBe(annotSpec.main);
      });

      it("should resolve the given annotSpec.main relative to forModule", function() {
        var module = getModule();
        var annotSpec = {main: "./dudu"};
        var annot = new ThemeAnnotation(module, annotSpec);
        expect(annot.main.id).toBe("test/foo/dudu");
      });

      it("should get the given annotSpec.extensions in the extensions property", function() {
        var module = getModule();
        var annotSpec = {main: "foo", extensions: ["a", "b"]};
        var annot = new ThemeAnnotation(module, annotSpec);
        expect(annot.extensions.map(function(m) { return m.id; })).toEqual(["a", "b"]);
      });

      it("should get the given annotSpec.extensions in the extensions property", function() {
        var module = getModule();
        var annotSpec = {main: "foo", extensions: ["a", "b"]};
        var annot = new ThemeAnnotation(module, annotSpec);
        expect(annot.extensions.map(function(m) { return m.id; })).toEqual(["a", "b"]);
      });

      it("should resolve the given annotSpec.extensions relative to forModule", function() {
        var module = getModule();
        var annotSpec = {main: "./foo", extensions: ["./a", "./b"]};
        var annot = new ThemeAnnotation(module, annotSpec);
        expect(annot.extensions.map(function(m) { return m.id; })).toEqual(["test/foo/a", "test/foo/b"]);
      });
    });

    describe("id", function() {
      it("should have the correct value", function() {
        expect(ThemeAnnotation.id).toBe("pentaho/theme/ThemeAnnotation");
      });
    });
  });
});
