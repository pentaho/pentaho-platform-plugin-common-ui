/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/lang/ActionResult",
  "pentaho/lang/UserError"
], function(ActionResult, UserError) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.lang.ActionResult -", function() {
    var value = 123;

    it("should be defined.", function() {
      expect(typeof ActionResult).toBeDefined();
    });

    describe("no error -", function() {
      var result;

      beforeEach(function() {
        result = new ActionResult(value);
      });

      it("value property should be the same than received in the constructor", function() {
        expect(result.value).toBe(value);
      });

      it("value property should be read-only", function() {
        expect(function() {
          result.value = 456;
        }).toThrowError(TypeError);
      });

      it("isCanceled should return false", function() {
        expect(result.isCanceled).toBe(false);
      });

      it("isFailed should return false", function() {
        expect(result.isFailed).toBe(false);
      });
    });

    describe("with user error -", function() {
      var result;

      beforeEach(function() {
        result = new ActionResult(value, new UserError());
      });

      it("value property should be the same than received in the constructor", function() {
        expect(result.value).toBe(value);
      });

      it("isCanceled should return true", function() {
        expect(result.isCanceled).toBe(true);
      });

      it("isFailed should return false", function() {
        expect(result.isFailed).toBe(false);
      });
    });

    describe("with non-user error -", function() {
      var result;

      beforeEach(function() {
        result = new ActionResult(value, new TypeError());
      });

      it("value property should be the same than received in the constructor", function() {
        expect(result.value).toBe(value);
      });

      it("isCanceled should return false", function() {
        expect(result.isCanceled).toBe(false);
      });

      it("isFailed should return true", function() {
        expect(result.isFailed).toBe(true);
      });
    });

  }); // #pentaho.lang.ActionResult
});
