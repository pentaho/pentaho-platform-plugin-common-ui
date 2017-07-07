/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "pentaho/type/Context",
  "pentaho/type/changes/AbstractTransactionScope",
  "pentaho/type/changes/Transaction",
  "tests/pentaho/util/errorMatch",
  "tests/test-utils"
], function(Context, AbstractTransactionScope, Transaction, errorMatch, testUtils) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, jasmine:false */

  describe("pentaho.type.changes.AbstractTransactionScope", function() {

    function mockLogger(localRequire) {

      localRequire.define("pentaho/util/logger", function() {
        return {
          warn: jasmine.createSpy("logger.warn")
        };
      });
    }

    describe("new(context, transaction)", function() {
      var context, scope, txn;

      beforeEach(function() {
        context = new Context();
        txn = new Transaction(context);
      });

      afterEach(function() {
        if(scope) {
          scope.exit();
          scope = null;
        }
        txn = null;
        context = null;
      });

      it("should be defined", function () {
        expect(typeof AbstractTransactionScope).toBeDefined();
      });

      it("should throw an error when a context isn't specified", function() {
        expect(function() {
          scope = new AbstractTransactionScope(null, txn);
        }).toThrow(errorMatch.argRequired("context"));
      });

      it("should have the specified context as #context", function() {
        scope = new AbstractTransactionScope(context, txn);

        expect(scope.context).toBe(context);
      });

      it("should allow transaction to be null", function() {
        scope = new AbstractTransactionScope(context, null);

        expect(scope.transaction).toBe(null);
      });

      it("should have the specified transaction as #transaction", function() {
        scope = new AbstractTransactionScope(context, txn);

        expect(scope.transaction).toBe(txn);
      });

      it("should set isRoot = true if the specified transaction has no other scopes", function() {
        scope = new AbstractTransactionScope(context, txn);

        expect(scope.isRoot).toBe(true);
      });

      it("should set isRoot = false if the specified transaction has other scopes", function() {
        var scope1 = new AbstractTransactionScope(context, txn);
        var scope2 = new AbstractTransactionScope(context, txn);

        expect(scope2.isRoot).toBe(false);

        scope2.exit();
        scope1.exit();
      });

      it("should have isInside = true", function() {
        scope = new AbstractTransactionScope(context, txn);

        expect(scope.isInside).toBe(true);
      });

      it("should call transaction#__scopeEnter", function() {
        spyOn(txn, "__scopeEnter").and.callThrough();

        scope = new AbstractTransactionScope(context, txn);

        expect(txn.__scopeEnter).toHaveBeenCalled();
      });

      it("should call context#__scopeEnter", function() {
        spyOn(context, "__scopeEnter").and.callThrough();

        scope = new AbstractTransactionScope(context, txn);

        expect(context.__scopeEnter).toHaveBeenCalled();
        expect(context.__scopeEnter).toHaveBeenCalledWith(scope);
      });

      it("should have isCurrent = true", function() {
        scope = new AbstractTransactionScope(context, txn);

        expect(scope.isCurrent).toBe(true);
      });
    });

    describe("#exit({sloppy})", function() {

      it("should set isInside to false after being called", function() {

        var context = new Context();
        var txn = new Transaction(context);
        var scope = new AbstractTransactionScope(context, txn);

        expect(scope.isInside).toBe(true);

        scope.exit();

        expect(scope.isInside).toBe(false);
      });

      testUtils.itAsync("should log a warning when called and already exited from", function() {

        return require.using([
          "pentaho/type/Context",
          "pentaho/type/changes/Transaction",
          "pentaho/type/changes/AbstractTransactionScope",
          "pentaho/util/logger"
        ], mockLogger, function(Context, Transaction, AbstractTransactionScope, logger) {

          var context = new Context();
          var txn     = new Transaction(context);
          var scope   = new AbstractTransactionScope(context, txn);

          // This call is legal and should not log.
          scope.exit();
          expect(scope.isInside).toBe(false);

          // ----

          // This call should log a warning.
          scope.exit();

          // ---

          expect(logger.warn).toHaveBeenCalled();
        });
      });

      testUtils.itAsync("should not log a warning when called and already exited from, if keyArgs.sloppy is true",
      function() {

        return require.using([
          "pentaho/type/Context",
          "pentaho/type/changes/Transaction",
          "pentaho/type/changes/AbstractTransactionScope",
          "pentaho/util/logger"
        ], mockLogger, function(Context, Transaction, AbstractTransactionScope, logger) {

          var context = new Context();
          var txn     = new Transaction(context);
          var scope   = new AbstractTransactionScope(context, txn);

          // This call is legal and should not log.
          scope.exit();
          expect(scope.isInside).toBe(false);

          // ----

          // This call would log a warning.
          scope.exit({sloppy: true});

          // ---

          expect(logger.warn).not.toHaveBeenCalled();
        });
      });

      testUtils.itAsync("should log a warning when called and not current", function() {

        return require.using([
          "pentaho/type/Context",
          "pentaho/type/changes/Transaction",
          "pentaho/type/changes/AbstractTransactionScope",
          "pentaho/util/logger"
        ], mockLogger, function(Context, Transaction, AbstractTransactionScope, logger) {

          var context = new Context();
          var txn     = new Transaction(context);
          var scope1  = new AbstractTransactionScope(context, txn);
          var scope2  = new AbstractTransactionScope(context, txn);

          expect(scope1.isInside ).toBe(true);
          expect(scope1.isCurrent).toBe(false);

          expect(scope2.isCurrent).toBe(true);

          // This call is not legal and should log a warning.
          scope1.exit();

          // ---

          expect(logger.warn).toHaveBeenCalled();

          scope2.exit();
        });
      });

      testUtils.itAsync("should not log a warning when called and not current, if keyArgs.sloppy is true", function() {

        return require.using([
          "pentaho/type/Context",
          "pentaho/type/changes/Transaction",
          "pentaho/type/changes/AbstractTransactionScope",
          "pentaho/util/logger"
        ], mockLogger, function(Context, Transaction, AbstractTransactionScope, logger) {

          var context = new Context();
          var txn     = new Transaction(context);
          var scope1  = new AbstractTransactionScope(context, txn);
          var scope2  = new AbstractTransactionScope(context, txn);

          expect(scope1.isInside ).toBe(true);
          expect(scope1.isCurrent).toBe(false);

          expect(scope2.isCurrent).toBe(true);

          // This call is not legal and should log a warning.
          scope1.exit({sloppy: true});

          // ---

          expect(logger.warn).not.toHaveBeenCalled();

          scope2.exit();
        });
      });
    });

    describe("#dispose()", function() {

      it("should call exit with keyArgs.sloppy = true", function() {

        var context = new Context();
        var txn = new Transaction(context);
        var scope = new AbstractTransactionScope(context, txn);

        spyOn(scope, "exit").and.callThrough();

        scope.dispose();

        expect(scope.exit).toHaveBeenCalled();

        expect(scope.exit.calls.count()).toBe(1);

        var call = scope.exit.calls.first();
        expect(call.args).toEqual([{sloppy: true}]);
      });
    });

    describe("#using(fun, ctx)", function() {
      var context, txn, scope;

      beforeEach(function() {
        context = new Context();
        txn = new Transaction(context);
        scope = new AbstractTransactionScope(context, txn);
      });

      afterEach(function() {
        if(scope) {
          scope.exit();
          scope = null;
        }
        txn = null;
        context = null;
      });

      it("should call the specified function", function() {
        var fun = jasmine.createSpy("using-fun");
        scope.using(fun);

        scope = null;

        expect(fun).toHaveBeenCalled();
      });

      it("should call the specified function with the specified JS context", function() {
        var fun = jasmine.createSpy("using-fun");
        var jsCtx = {};
        scope.using(fun, jsCtx);

        scope = null;

        expect(fun.calls.first().object).toBe(jsCtx);
      });

      it("should call the specified function with the scope as argument", function() {
        var fun = jasmine.createSpy("using-fun");
        scope.using(fun);

        expect(fun.calls.first().args[0]).toBe(scope);

        scope = null;
      });

      it("should call scope.exit when the specified function returns without error", function() {
        var fun = function() {};
        spyOn(scope, "exit").and.callThrough();
        scope.using(fun);

        expect(scope.exit).toHaveBeenCalled();

        scope = null;
      });

      it("should call scope.exit when the specified function throws an error", function() {
        var ex  = new Error();
        var fun = function() { throw ex; };
        spyOn(scope, "exit").and.callThrough();

        try {
          scope.using(fun);
        } catch(e) {
          if(e !== ex) throw e;
          /* else swallow thrown error */
        }

        expect(scope.exit).toHaveBeenCalled();

        scope = null;
      });

      it("should throw back the error thrown by the specified function", function() {
        var ex  = new Error();
        var fun = function() { throw ex; };

        expect(function() {
          scope.using(fun);
        }).toThrow(ex);

        scope = null;
      });

      it("should return the value returned by the specified function", function() {
        var result = {};
        var fun = function() { return result; };

        var result2 = scope.using(fun);

        expect(result2).toBe(result);

        scope = null;
      });
    });

    describe("#_assertInsideAndCurrent()", function() {

      it("should not throw when inside and current", function() {
        var context = new Context();
        var txn = new Transaction(context);
        var scope = new AbstractTransactionScope(context, txn);

        expect(function() {
          scope._assertInsideAndCurrent();
        }).not.toThrow();

        scope.exit();
      });

      it("should throw when inside but not current", function() {
        var context = new Context();
        var txn = new Transaction(context);
        var scope1 = new AbstractTransactionScope(context, txn);
        var scope2 = new AbstractTransactionScope(context, txn);

        expect(function() {
          scope1._assertInsideAndCurrent();
        }).toThrow(errorMatch.operInvalid());

        scope2.exit();
        scope1.exit();
      });

      it("should throw when not inside", function() {
        var context = new Context();
        var txn = new Transaction(context);
        var scope = new AbstractTransactionScope(context, txn);

        scope.exit();

        expect(function() {
          scope._assertInsideAndCurrent();
        }).toThrow(errorMatch.operInvalid());
      });
    });
  });
});
