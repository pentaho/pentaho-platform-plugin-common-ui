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
  "pentaho/module/AsyncAnnotation",
  "pentaho/module/Annotation",
  "tests/pentaho/util/errorMatch"
], function(AsyncAnnotation, Annotation, errorMatch) {

  "use strict";

  describe("pentaho.module.Annotation", function() {

    describe("new AsyncAnnotation(forModule)", function() {

      it("should throw when called with no forModule", function() {
        expect(function() {
          var annot = new AsyncAnnotation();
        }).toThrow(errorMatch.argRequired("forModule"));
      });
    });

    it("should inherit from Annotation", function() {
      expect(AsyncAnnotation.prototype instanceof Annotation).toBe(true);
    });

    describe("id", function() {
      it("should have the correct value", function() {
        expect(AsyncAnnotation.id).toBe("pentaho/module/AsyncAnnotation");
      });
    });

    describe("isSync", function() {
      it("should be false", function() {
        expect(AsyncAnnotation.isSync).toBe(false);
      });
    });
  });
});
