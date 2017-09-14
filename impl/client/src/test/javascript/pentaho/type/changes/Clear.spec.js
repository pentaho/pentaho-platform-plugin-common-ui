/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/type/changes/Clear"
], function(Context, Clear) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.changes.Clear -", function() {
    var context, List, NumberList, DerivedComplex, ComplexList;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            List = context.get(["element"]);
            NumberList = context.get(["number"]);

            DerivedComplex = context.get({
              props: [
                {name: "foo", valueType: "number"}
              ]
            });
            ComplexList = context.get([DerivedComplex]);
          })
          .then(done, done.fail);
    });

    it("should be defined", function() {
      expect(typeof Clear).toBeDefined();
    });

    describe("#type -", function() {
      it("should return a string with the value `clear`", function() {
        expect(Clear.prototype.type).toBe("clear");
      });
    });

    describe("#_apply", function() {

      var scope;

      beforeEach(function() {
        scope = context.enterChange();
      });

      afterEach(function() {
        scope.dispose();
      });

      it("should remove all elements and not be there, as ambient values", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        expect(list.count).toBe(3);

        // ---

        list.clear();

        // ---

        expect(list.count).toBe(0);
      });

      it("should remove all elements and not be there when txn is committed", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        expect(list.count).toBe(3);

        // ---

        list.clear();

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(0);
      });

      it("should remove all elements but sill be there if txn is rejected", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        expect(list.count).toBe(3);

        // ---

        list.clear();

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(list.count).toBe(3);
      });

      it("should remove all elements but still be there if txn is exited", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        list.clear();

        // ---

        scope.exit();

        // ---

        expect(list.count).toBe(3);
      });

      it("should remove all elements but still be there as an ambient value if changes are cleared", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        list.clear();

        // ---

        list.$changeset.clearChanges();

        // ---

        expect(list.count).toBe(3);
      });

      it("should remove all elements and still be there if changes are cleared and the txn committed", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        list.clear();

        // ---

        list.$changeset.clearChanges();

        scope.accept();

        // ---

        expect(list.count).toBe(3);
      });

      it("should remove all elements and, if added again in different order, " +
         "these should be there again in the new order, as ambient values", function() {

        var list = new NumberList([1, 2, 3]);
        var elem1 = list.at(0);
        var elem2 = list.at(1);
        var elem3 = list.at(2);

        // ---

        list.clear();
        list.add(elem2);
        list.add(elem1);
        list.add(elem3);

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0)).toBe(elem2);
        expect(list.at(1)).toBe(elem1);
        expect(list.at(2)).toBe(elem3);
      });

      it("should remove all elements and, if added again in different order, " +
          "these should be there again in the new order, when committed", function() {

        var list = new NumberList([1, 2, 3]);
        var elem1 = list.at(0);
        var elem2 = list.at(1);
        var elem3 = list.at(2);

        // ---

        list.clear();
        list.add(elem2);
        list.add(elem1);
        list.add(elem3);

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0)).toBe(elem2);
        expect(list.at(1)).toBe(elem1);
        expect(list.at(2)).toBe(elem3);
      });

      it("should remove all elements and, if added again, these should still be there when rejected", function() {

        var list = new NumberList([1, 2, 3]);
        var elem1 = list.at(0);
        var elem2 = list.at(1);
        var elem3 = list.at(2);

        // ---

        list.clear();
        list.add(elem2);
        list.add(elem1);
        list.add(elem3);

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0)).toBe(elem1);
        expect(list.at(1)).toBe(elem2);
        expect(list.at(2)).toBe(elem3);
      });
    });

    describe("references", function() {
      function expectSingleRefTo(elem, to) {
        var refs = elem.$references;

        expect(refs.length).toBe(1);
        expect(refs[0].container).toBe(to);
        expect(refs[0].property).toBe(null);
      }

      function expectNoRefs(elem) {
        var refs = elem.$references;

        expect(!refs || !refs.length).toBe(true);
      }

      var scope;

      beforeEach(function() {
        scope = context.enterChange();
      });

      afterEach(function() {
        scope.dispose();
      });

      // coverage
      describe("when element is simple", function() {

        describe("when list is of non-simple type", function() {
          it("should not try to remove references", function() {

            var list = new List([1, 2, 3]);

            // ---

            list.clear();
          });

          it("should not try to cancel removed references when changes are cleared", function() {

            var list = new List([1, 2, 3]);

            // ---

            list.clear();

            // ---

            list.$changeset.clearChanges();
          });
        });

        it("should not try to remove references", function() {

          var list = new NumberList([1, 2, 3]);

          // ---

          list.clear();
        });

        it("should not try to cancel removed references when changes are cleared", function() {

          var list = new NumberList([1, 2, 3]);

          // ---

          list.clear();

          // ---

          list.$changeset.clearChanges();
        });
      });

      describe("when element is complex", function() {

        it("should remove references as soon as the change is made", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);

          // ---

          list.clear();

          // ---

          expectNoRefs(elem1);
          expectNoRefs(elem2);
          expectNoRefs(elem3);
        });

        it("should remove references but should have no effect if rejected", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          // ---

          list.clear();

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);
        });

        it("should remove references but should have no effect if exited from", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          // ---

          list.clear();

          // ---

          scope.exit();

          // ---

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);
        });

        it("should really remove references if committed", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          // ---

          list.clear();

          // ---

          scope.accept();

          // ---

          expectNoRefs(elem1);
          expectNoRefs(elem2);
          expectNoRefs(elem3);
        });

        it("should cancel removed references when changes are cleared, in ambient values", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          // ---

          list.clear();

          // ---

          list.$changeset.clearChanges();

          // ---

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);
        });

        it("should cancel removed references when changes are cleared, and committed", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          // ---

          list.clear();

          // ---

          list.$changeset.clearChanges();

          scope.accept();

          // ---

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);
        });

        it("should remove references, but if the elements are added again, it should re-add the removed references " +
           "and become visible again as ambient values", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          // ---

          list.clear();
          list.add(elem1);
          list.add(elem2);
          list.add(elem3);

          // ---

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);
        });

        it("should remove references, but if the elements are added again, it should re-add the removed references " +
            "and still be there when committed", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          // ---

          list.clear();
          list.add(elem1);
          list.add(elem2);
          list.add(elem3);

          // ---

          scope.accept();

          // ---

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);
        });

        it("should remove references, but if the elements are added again, it should re-add the removed references " +
            "and still be there when rejected", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);
          var elem2 = list.at(1);
          var elem3 = list.at(2);

          // ---

          list.clear();
          list.add(elem1);
          list.add(elem2);
          list.add(elem3);

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem1, list);
          expectSingleRefTo(elem2, list);
          expectSingleRefTo(elem3, list);
        });
      });
    });
  });
});
