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
  "pentaho/type/Complex",
  "pentaho/type/List",
  "pentaho/type/Number",
  "pentaho/type/action/Transaction",
  "pentaho/type/action/Sort",
  "pentaho/util/fun"
], function(Complex, List, PentahoNumber, Transaction, Sort, fun) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.action.Sort -", function() {

    var NumberList;
    var DerivedComplex;
    var ComplexList;

    beforeAll(function() {

      NumberList = List.extend({
        $type: {of: PentahoNumber}
      });

      DerivedComplex = Complex.extend({
        $type: {
          props: [
            {name: "foo", valueType: PentahoNumber}
          ]
        }
      });

      ComplexList = List.extend({
        $type: {of: DerivedComplex}
      });
    });

    it("should be defined", function() {
      expect(typeof Sort).toBeDefined();
    });

    describe("#type -", function() {

      it("should return a string with the value `sort`", function() {
        expect(Sort.prototype.type).toBe("sort");
      });
    });

    describe("#_apply -", function() {

      var scope;

      beforeEach(function() {
        scope = Transaction.enter();
      });

      afterEach(function() {
        scope.dispose();
      });

      it("should sort the list values and be visible as ambient values", function() {
        var list = new NumberList([2, 1]);

        // ---

        list.sort(fun.compare);

        // ---

        expect(list.count).toBe(2);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
      });

      it("should sort the list values and be visible when committed", function() {
        var list = new NumberList([2, 1]);

        // ---

        list.sort(fun.compare);

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(2);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
      });

      it("should sort the list values but still be unsorted when rejected", function() {
        var list = new NumberList([2, 1]);

        // ---

        list.sort(fun.compare);

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(list.count).toBe(2);
        expect(list.at(0).value).toBe(2);
        expect(list.at(1).value).toBe(1);
      });

      it("should sort the list values but still be unsorted when exited", function() {
        var list = new NumberList([2, 1]);

        // ---

        list.sort(fun.compare);

        // ---

        scope.exit();

        // ---

        expect(list.count).toBe(2);
        expect(list.at(0).value).toBe(2);
        expect(list.at(1).value).toBe(1);
      });

      it("should sort the list values but still be unsorted if changes are cleared, as ambient values", function() {
        var list = new NumberList([2, 1]);

        // ---

        list.sort(fun.compare);

        list.$changeset.clearChanges();

        // ---

        expect(list.count).toBe(2);
        expect(list.at(0).value).toBe(2);
        expect(list.at(1).value).toBe(1);
      });

      it("should sort the list values but still be unsorted if changes are cleared and committed", function() {
        var list = new NumberList([2, 1]);

        // ---

        list.sort(fun.compare);

        list.$changeset.clearChanges();

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(2);
        expect(list.at(0).value).toBe(2);
        expect(list.at(1).value).toBe(1);
      });
    });

    describe("references", function() {

      function expectSingleRefTo(elem, to) {
        var refs = elem.$references;

        expect(refs.length).toBe(1);
        expect(refs[0].container).toBe(to);
        expect(refs[0].property).toBe(null);
      }

      var scope;

      beforeEach(function() {
        scope = Transaction.enter();
      });

      afterEach(function() {
        scope.dispose();
      });

      describe("when element is complex", function() {

        it("should not add or remove references when the change is made", function() {

          var list = new ComplexList([{foo: 234}, {foo: 123}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);

          // ---

          list.sort(function(a, b) { return a.foo - b.foo; });

          // ---

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);
        });

        it("should not add or remove references when the change is made and committed", function() {

          var list = new ComplexList([{foo: 234}, {foo: 123}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);

          // ---

          list.sort(function(a, b) { return a.foo - b.foo; });

          // ---

          scope.accept();

          // ---

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);
        });
      });
    });
  });
});
