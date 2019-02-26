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
  "pentaho/module/SyncAnnotation",
  "pentaho/module/Annotation",
  "tests/pentaho/util/errorMatch"
], function(SyncAnnotation, Annotation, errorMatch) {

  "use strict";

  describe("pentaho.module.Annotation", function() {

    describe("new SyncAnnotation(forModule)", function() {

      it("should throw when called with no forModule", function() {
        expect(function() {
          var annot = new SyncAnnotation();
        }).toThrow(errorMatch.argRequired("forModule"));
      });
    });

    it("should inherit from Annotation", function() {
      expect(SyncAnnotation.prototype instanceof Annotation).toBe(true);
    });

    describe("id", function() {
      it("should have the correct value", function() {
        expect(SyncAnnotation.id).toBe("pentaho/module/SyncAnnotation");
      });
    });

    describe("isSync", function() {
      it("should be false", function() {
        expect(SyncAnnotation.isSync).toBe(true);
      });
    });
  });
});
