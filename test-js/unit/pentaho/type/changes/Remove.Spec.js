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
  "pentaho/type/changes/Remove"
], function(Context, Remove) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.changes.Remove", function() {

    var context, List, NumberList, DerivedComplex, ComplexList;

    beforeEach(function() {
      context = new Context();

      List = context.get(["element"]);

      NumberList = context.get(["number"]);

      DerivedComplex = context.get({
        props: [
          {name: "foo", type: "number"}
        ]
      });
      ComplexList = context.get([DerivedComplex]);
    });

    it("should be defined", function () {
      expect(typeof Remove).toBeDefined();
    });

    describe("#type", function() {

      it("should return a string with the value `remove`", function() {
        expect(Remove.prototype.type).toBe("remove");
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

      it("should remove an element and not be there, as an ambient value", function() {

        var list = new NumberList([1]);
        var elem = list.at(0);

        expect(list.count).toBe(1);

        // ---

        list.remove(elem);

        // ---

        expect(list.count).toBe(0);
      });

      it("should remove an element and not be there when txn is committed", function() {

        var list = new NumberList([1]);
        var elem = list.at(0);

        // ---

        list.remove(elem);

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(0);
      });

      it("should remove an element but still be there if txn is rejected", function() {

        var list = new NumberList([1]);
        var elem = list.at(0);

        // ---

        list.remove(elem);

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(list.count).toBe(1);
        expect(list.at(0)).toBe(elem);
      });

      it("should remove an element but still be there if txn is exited", function() {

        var list = new NumberList([1]);
        var elem = list.at(0);

        // ---

        list.remove(elem);

        // ---

        scope.exit();

        // ---

        expect(list.count).toBe(1);
      });

      it("should remove an element but still be there as an ambient value if changes are cleared", function() {

        var list = new NumberList([1]);
        var elem = list.at(0);

        // ---

        list.remove(elem);

        // ---

        list.changeset.clearChanges();

        // ---

        expect(list.count).toBe(1);
        expect(list.at(0)).toBe(elem);
      });

      it("should remove an element but still be there if changes are cleared and the txn committed", function() {

        var list = new NumberList([1]);
        var elem = list.at(0);

        // ---

        list.remove(elem);

        // ---

        list.changeset.clearChanges();

        scope.accept();

        // ---

        expect(list.count).toBe(1);
        expect(list.at(0)).toBe(elem);
      });

      it("should remove an element and, if added again, it should be there again as an ambient value", function() {

        var list = new NumberList([1]);
        var elem = list.at(0);

        // ---

        list.remove(elem);
        list.add(elem);

        // ---

        expect(list.count).toBe(1);
        expect(list.at(0)).toBe(elem);
      });

      it("should remove an element and, if added again, it should still be there when committed", function() {

        var list = new NumberList([1]);
        var elem = list.at(0);

        // ---

        list.remove(elem);
        list.add(elem);

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(1);
        expect(list.at(0)).toBe(elem);
      });

      it("should remove an element and, if added again, it should still be there when rejected", function() {

        var list = new NumberList([1]);
        var elem = list.at(0);

        // ---

        list.remove(elem);
        list.add(elem);

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(list.count).toBe(1);
        expect(list.at(0)).toBe(elem);
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

          it("should not try to remove a reference", function() {

            var list = new List([1]);
            var elem = list.at(0);

            // ---

            list.remove(elem);
          });

          it("should not try to cancel a removed reference when changes are cleared", function() {

            var list = new List([1]);
            var elem = list.at(0);

            // ---

            list.remove(elem);

            // ---

            list.changeset.clearChanges();
          });
        });

        it("should not try to remove a reference", function() {

          var list = new NumberList([1]);
          var elem = list.at(0);

          // ---

          list.remove(elem);
        });

        it("should not try to cancel a removed reference when changes are cleared", function() {

          var list = new NumberList([1]);
          var elem = list.at(0);

          // ---

          list.remove(elem);

          // ---

          list.changeset.clearChanges();
        });
      });

      describe("when element is complex", function() {

        it("should remove a reference as soon as the change is made", function() {

          var list = new ComplexList([{foo: 123}]);
          var elem = list.at(0);

          expectSingleRefTo(elem, list);

          // ---

          list.remove(elem);

          // ---

          expectNoRefs(elem);
        });

        it("should remove a reference but should have no effect if rejected", function() {

          var list = new ComplexList([{foo: 123}]);
          var elem = list.at(0);

          // ---

          list.remove(elem);

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem, list);
        });

        it("should remove a reference but should have no effect if exited from", function() {

          var list = new ComplexList([{foo: 123}]);
          var elem = list.at(0);

          // ---

          list.remove(elem);

          // ---

          scope.exit();

          // ---

          expectSingleRefTo(elem, list);
        });

        it("should really remove a reference if committed", function() {

          var list = new ComplexList([{foo: 123}]);
          var elem = list.at(0);

          // ---

          list.remove(elem);

          // ---

          scope.accept();

          // ---

          expectNoRefs(elem);
        });

        it("should cancel a removed reference when changes are cleared, in ambient values", function() {

          var list = new ComplexList([{foo: 123}]);
          var elem = list.at(0);

          // ---

          list.remove(elem);

          // ---

          list.changeset.clearChanges();

          // ---

          expectSingleRefTo(elem, list);
        });

        it("should cancel a removed reference when changes are cleared, and committed", function() {

          var list = new ComplexList([{foo: 123}]);
          var elem = list.at(0);

          // ---

          list.remove(elem);

          // ---

          list.changeset.clearChanges();

          scope.accept();

          // ---

          expectSingleRefTo(elem, list);
        });

        it("should remove a reference, but if the element is added again, it should re-add the removed reference " +
            "and become visible again as ambient values", function() {

          var list = new ComplexList([{foo: 123}]);
          var elem = list.at(0);

          // ---

          list.remove(elem);
          list.add(elem);

          // ---

          expectSingleRefTo(elem, list);
        });

        it("should remove a reference, but if the element is added again, it should re-add the removed reference " +
            "and still be there when committed", function() {

          var list = new ComplexList([{foo: 123}]);
          var elem = list.at(0);

          // ---

          list.remove(elem);
          list.add(elem);

          // ---

          scope.accept();

          // ---

          expectSingleRefTo(elem, list);
        });

        it("should remove a reference, but if the element is added again, it should re-add the removed reference " +
            "and still be there when rejected", function() {

          var list = new ComplexList([{foo: 123}]);
          var elem = list.at(0);

          // ---

          list.remove(elem);
          list.add(elem);

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectSingleRefTo(elem, list);
        });
      });
    });
  });
});