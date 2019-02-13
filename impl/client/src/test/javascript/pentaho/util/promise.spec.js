/*!
 * Copyright 2010 - 2019 Hitachi Vantara.  All rights reserved.
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
  "pentaho/util/promise",
  "tests/pentaho/util/errorMatch"
], function(promiseUtil, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false, jasmine:false*/

  /* eslint dot-notation: 0 */

  describe("pentaho.util.promise", function() {

    describe("wrapCall(fun(, ctx))", function() {

      it("should throw if fun is not specified", function() {
        function expectIt(args) {
          expect(function() {

            promiseUtil.wrapCall.apply(promiseUtil, args);

          }).toThrow(errorMatch.argRequired("fun"));
        }

        expectIt([]);
        expectIt([null]);
        expectIt([undefined]);
        expectIt([null, {}]);
        expectIt([undefined, {}]);
      });

      it("should return a promise", function() {
        var result = promiseUtil.wrapCall(function() {});
        expect(result instanceof Promise).toBe(true);
      });

      it("should call fun synchronously", function() {
        var called = false;
        promiseUtil.wrapCall(function() { called = true; });
        expect(called).toBe(true);
      });

      it("should resolve with the function's return value", function(done) {
        var result = {};
        promiseUtil.wrapCall(function() { return result; })
            .then(function(value) {
              expect(value).toBe(result);
              done();
            }, done.fail);
      });

      it("should reject with the error thrown by the function (and not throw sync)", function(done) {
        var error = {};
        promiseUtil.wrapCall(function() { throw error; })
            .then(function() {
              done.fail();
            }, function(reason) {
              expect(reason).toBe(error);
              done();
            });
      });

      it("should call fun on the given ctx object", function() {
        var fun = jasmine.createSpy("promiseWrapCall");
        var ctx = {};
        promiseUtil.wrapCall(fun, ctx);
        expect(fun.calls.count()).toBe(1);
        expect(fun.calls.first().object).toBe(ctx);
      });
    });

    describe("finally(promise, fun(, ctx))", function() {

      var promise;

      beforeEach(function() {
        promise = Promise.resolve(1);
      });

      it("should throw if promise is not specified", function() {

        function expectIt(args) {
          expect(function() {

            promiseUtil["finally"].apply(promiseUtil, args);

          }).toThrow(errorMatch.argRequired("promise"));
        }

        expectIt([]);
        expectIt([null]);
        expectIt([undefined]);

        expectIt([null, function() {}]);
        expectIt([undefined, function() {}]);
      });

      it("should throw if fun is not specified", function() {

        function expectIt(args) {
          expect(function() {

            promiseUtil["finally"].apply(promiseUtil, args);

          }).toThrow(errorMatch.argRequired("fun"));
        }

        expectIt([promise]);
        expectIt([promise, null]);
        expectIt([promise, undefined]);
      });

      it("should return a new promise", function() {
        var result = promiseUtil["finally"](promise, function() {});
        expect(result).not.toBe(promise);
        expect(typeof result.then).toBe("function");
      });

      it("should call function when the promise gets fulfilled", function(done) {
        promiseUtil["finally"](Promise.resolve(1), function() {
          done();
        });
      });

      it("should call function when the promise gets rejected", function(done) {
        promiseUtil["finally"](Promise.reject(0), function() {
          done();
        });
      });

      it("should call fun on the given ctx object when fulfilled", function(done) {
        var ctx = {};
        var handler = function() {
          expect(this).toBe(ctx);
          done();
        };

        promiseUtil["finally"](Promise.resolve(1), handler, ctx);
      });

      it("should call fun on the given ctx object when rejected", function(done) {
        var ctx = {};
        var handler = function() {
          expect(this).toBe(ctx);
          done();
        };

        promiseUtil["finally"](Promise.reject(0), handler, ctx);
      });

      it("should return a promise that is fulfilled when the original promise is " +
         "fulfilled, with the same value, and fun did not throw", function(done) {

        var handler = function() {};
        var result = {};
        promiseUtil["finally"](Promise.resolve(result), handler)
            .then(function(value) {
              expect(value).toBe(result);
              done();
            }, done.fail);

      });

      it("should return a promise that is rejected when the original promise is " +
          "rejected, with the same error, and fun did not throw", function(done) {

        var handler = function() {};
        var error = {};
        promiseUtil["finally"](Promise.reject(error), handler)
            .then(function() {
              done.fail();
            }, function(reason) {
              expect(reason).toBe(error);
              done();
            });
      });

      it("should return a promise that is rejected with the second error, when the original promise is rejected and fun threw", function(done) {
        var error1 = {};
        var error2 = {};
        var handler = function() { throw error2; };

        promiseUtil["finally"](Promise.reject(error1), handler)
            .then(function() {
              done.fail();
            }, function(reason) {
              expect(reason).toBe(error2);
              done();
            });
      });

      it("should return a promise that is rejected when the original promise is fulfilled and fun threw", function(done) {
        var result = {};
        var error = {};
        var handler = function() { throw error; };

        promiseUtil["finally"](Promise.resolve(result), handler)
            .then(function() {
              done.fail();
            }, function(reason) {
              expect(reason).toBe(error);
              done();
            });
      });
    });
  });
});
