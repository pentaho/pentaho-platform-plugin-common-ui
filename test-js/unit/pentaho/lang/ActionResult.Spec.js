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
    var value = 123, result;

    it("should be defined.", function() {
      expect(typeof ActionResult).toBeDefined();
    });

    describe("when constructed with no error -", function() {

      beforeEach(function() {
        result = new ActionResult(value);
      });

      it("#value should be the same than received in the constructor", function() {
        expect(result.value).toBe(value);
      });

      it("#value should be read-only", function() {
        expect(function() {
          result.value = 456;
        }).toThrowError(TypeError);
      });

      it("#isCanceled should return false", function() {
        expect(result.isCanceled).toBe(false);
      });

      it("#isFailed should return false", function() {
        expect(result.isFailed).toBe(false);
      });

      it("ActionResult.fulfill outputs an ActionResult with a result", function() {
        var result = ActionResult.fulfill(value);
        expect(result.isFulfilled).toBe(true);
        expect(result.isRejected).toBe(false);
        expect(result.value).toBe(value);
      });
    });


    function expectErrorResult(){
      it("#value should be undefined", function() {
        expect(result.value).toBeUndefined();
      });

      it("#isFulfilled should return false", function() {
        expect(result.isFulfilled).toBe(false);
      });

      it("#isRejected should return true", function() {
        expect(result.isRejected).toBe(true);
      });
    }

    describe("when constructed with a user error -", function() {
      var error;

      beforeEach(function() {
        error = new UserError("Some error");
        result = new ActionResult(value, error);
      });

      it("#isCanceled should return true", function() {
        expect(result.isCanceled).toBe(true);
      });

      it("#isFailed should return false", function() {
        expect(result.isFailed).toBe(false);
      });

      expectErrorResult();

      it("#error should return the user error", function() {
        expect(result.error).toBe(error);
      });

      it("ActionResult.reject outputs an ActionResult with an error result", function() {
        var result = ActionResult.reject(error);
        expect(result.isRejected).toBe(true);
        expect(result.error).toBe(error);
      });

    });

    describe("when constructed with a string as error -", function() {
      beforeEach(function() {
        result = new ActionResult(value, "Some error");
      });

      expectErrorResult();

      it("#error should be pentaho.lang.UserError", function() {
        expect(result.error instanceof UserError).toBe(true);
      });

      it("#error should return the user error", function() {
        expect(result.error.message).toBe("Some error");
      });

      it("ActionResult.reject outputs an ActionResult with an error result", function() {
        var result = ActionResult.reject("Some error");
        expect(result.isRejected).toBe(true);
        expect(result.error.message).toBe("Some error");
      });
    });

    describe("when constructed with a non-user error -", function() {
      var error;

      beforeEach(function() {
        error = new TypeError();
        result = new ActionResult(value, error);
      });

      expectErrorResult();

      it("#isCanceled should return false", function() {
        expect(result.isCanceled).toBe(false);
      });

      it("#isFailed should return true", function() {
        expect(result.isFailed).toBe(true);
      });

      it("ActionResult.reject outputs an ActionResult with an error result", function() {
        var result = ActionResult.reject(error);
        expect(result.isRejected).toBe(true);
        expect(result.error).toBe(error);
      });

    });

  }); // #pentaho.lang.ActionResult
});
