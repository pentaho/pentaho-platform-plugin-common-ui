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
