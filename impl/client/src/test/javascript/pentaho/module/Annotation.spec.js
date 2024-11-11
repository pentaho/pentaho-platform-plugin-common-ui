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
  "pentaho/module/Annotation",
  "tests/pentaho/util/errorMatch"
], function(Annotation, errorMatch) {

  "use strict";

  describe("pentaho.module.Annotation", function() {

    describe("new Annotation(forModule)", function() {

      it("should throw when called with no forModule", function() {
        expect(function() {
          var annot = new Annotation();
        }).toThrow(errorMatch.argRequired("forModule"));
      });

      it("should not throw when called with a forModule", function() {
        var module = {};
        var annot = new Annotation(module);
      });

      it("should get the given module in the forModule property", function() {
        var module = {};
        var annot = new Annotation(module);
        expect(annot.forModule).toBe(module);
      });
    });

    describe("id", function() {
      it("should have the correct value", function() {
        expect(Annotation.id).toBe("pentaho/module/Annotation");
      });
    });

    describe("toFullId(annotationId)", function() {
      it("should append Annotation if not already there", function() {
        expect(Annotation.toFullId("Foo")).toBe("FooAnnotation");
      });

      it("should not append Annotation if already there", function() {
        expect(Annotation.toFullId("FooAnnotation")).toBe("FooAnnotation");
      });
    });
  });
});
