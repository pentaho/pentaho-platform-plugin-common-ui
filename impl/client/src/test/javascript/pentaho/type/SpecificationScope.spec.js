/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "pentaho/type/SpecificationScope",
  "pentaho/type/SpecificationContext"
], function(SpecificationScope, SpecificationContext) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false, jasmine:false*/

  describe("pentaho.type.SpecificationScope", function() {

    beforeEach(function() {
      // J.I.C.
      SpecificationContext.current = null;
    });

    afterEach(function() {
      // J.I.C.
      SpecificationContext.current = null;
    });

    describe("new SpecificationScope(context)", function() {

      describe("when context is specified", function() {

        it("should be set as the ambient context", function() {
          var context = new SpecificationContext();

          var scope = new SpecificationScope(context);

          expect(SpecificationContext.current).toBe(context);

          scope.dispose();
        });

        it("should become the value of #specContext", function() {
          var context = new SpecificationContext();

          var scope = new SpecificationScope(context);

          expect(scope.specContext).toBe(context);

          scope.dispose();
        });

        it("should not dispose context when the scope is disposed", function() {
          var context = new SpecificationContext();

          spyOn(context, "dispose");

          var scope = new SpecificationScope(context);

          scope.dispose();

          expect(context.dispose).not.toHaveBeenCalled();
        });

        it("should restore previous ambient context when the scope is disposed", function() {
          var previous = new SpecificationContext();
          SpecificationContext.current = previous;

          var context = new SpecificationContext();
          var scope = new SpecificationScope(context);

          scope.dispose();

          expect(SpecificationContext.current).toBe(previous);
        });
      });

      describe("when context is not specified but an ambient context exists", function() {

        it("should not change the ambient context", function() {
          var context = new SpecificationContext();

          SpecificationContext.current = context;

          var scope = new SpecificationScope();

          expect(SpecificationContext.current).toBe(context);

          scope.dispose();
        });

        it("should become the value of #specContext", function() {
          var context = new SpecificationContext();

          SpecificationContext.current = context;

          var scope = new SpecificationScope();

          expect(scope.specContext).toBe(context);

          scope.dispose();
        });

        it("should not dispose context when the scope is disposed", function() {
          var context = new SpecificationContext();

          SpecificationContext.current = context;

          spyOn(context, "dispose");

          var scope = new SpecificationScope();

          scope.dispose();

          expect(context.dispose).not.toHaveBeenCalled();
        });

        it("should preserve ambient context when the scope is disposed", function() {
          var context = new SpecificationContext();

          SpecificationContext.current = context;

          var scope = new SpecificationScope();

          scope.dispose();

          expect(SpecificationContext.current).toBe(context);
        });
      });

      describe("when context is not specified and there's no ambient context", function() {

        it("should set the ambient context with a new context each time", function() {

          var scope = new SpecificationScope();
          var ctx1 = SpecificationContext.current;
          expect(ctx1 instanceof SpecificationContext).toBe(true);
          scope.dispose();

          SpecificationContext.current = null;

          scope = new SpecificationScope();
          var ctx2 = SpecificationContext.current;
          expect(ctx2 instanceof SpecificationContext).toBe(true);
          scope.dispose();

          expect(ctx2).not.toBe(ctx1);
        });

        it("should set the value of #specContext to a new context each time", function() {
          var scope = new SpecificationScope();
          var ctx1 = scope.specContext;
          expect(ctx1 instanceof SpecificationContext).toBe(true);
          scope.dispose();

          SpecificationContext.current = null;

          scope = new SpecificationScope();
          var ctx2 = scope.specContext;
          expect(ctx2 instanceof SpecificationContext).toBe(true);
          scope.dispose();

          expect(ctx2).not.toBe(ctx1);
        });

        it("should set the value of #specContext and ambient context to the same context", function() {
          var scope = new SpecificationScope();
          expect(scope.specContext).toBe(SpecificationContext.current);
          scope.dispose();
        });

        it("should dispose context when the scope is disposed", function() {

          var scope = new SpecificationScope();

          var context = scope.specContext;
          spyOn(context, "dispose");

          scope.dispose();

          expect(context.dispose.calls.count()).toBe(1);
        });

        it("should have no ambient context after the scope is disposed", function() {
          var scope = new SpecificationScope();
          scope.dispose();

          expect(SpecificationContext.current).toBe(null);
        });
      });
    });
  });
});