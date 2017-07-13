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
  "pentaho/type/changes/Add"
], function(Context, Add) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.changes.Add", function() {

    var context, NumberList, DerivedComplex, ComplexList;

    beforeEach(function() {
      context = new Context();

      NumberList = context.get(["number"]);

      DerivedComplex = context.get({
        props: [
          {name: "foo", valueType: "number"}
        ]
      });
      ComplexList = context.get([DerivedComplex]);
    });

    it("should be defined", function() {
      expect(typeof Add).toBeDefined();
    });

    describe("#type", function() {

      it("should return a string with the value `add`", function() {
        expect(Add.prototype.type).toBe("add");
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

      it("should add an element and be visible as an ambient value", function() {

        var list = new NumberList();
        var elem = list.$type.of.to(0);

        // ---

        list.add(elem);

        // ---

        expect(list.count).toBe(1);
        expect(list.at(0)).toBe(elem);
      });

      it("should add an element and be visible if txn is committed", function() {

        var list = new NumberList();
        var elem = list.$type.of.to(0);

        // ---

        list.add(elem);

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(1);
        expect(list.at(0)).toBe(elem);
      });

      it("should add an element and cancel it if txn is rejected", function() {

        var list = new NumberList();
        var elem = list.$type.of.to(0);

        // ---

        list.add(elem);

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(list.count).toBe(0);
      });

      it("should add an element and not be there as an ambient value if changes are cleared", function() {

        var list = new NumberList();
        var elem = list.$type.of.to(0);

        // ---

        list.add(elem);

        // ---

        list.$changeset.clearChanges();

        // ---

        expect(list.count).toBe(0);
      });

      it("should add an element and not be there if changes are cleared and the txn committed", function() {

        var list = new NumberList();
        var elem = list.$type.of.to(0);

        // ---

        list.add(elem);

        // ---

        list.$changeset.clearChanges();

        scope.accept();

        // ---

        expect(list.count).toBe(0);
      });

      it("should add an element and, if removed again, it should stop being there as an ambient value", function() {

        var list = new NumberList();
        var elem = list.$type.of.to(0);

        // ---

        list.add(elem);
        list.remove(elem);

        // ---

        expect(list.count).toBe(0);
      });

      it("should add an element and, if removed again, it should stop being there when committed", function() {

        var list = new NumberList();
        var elem = list.$type.of.to(0);

        // ---

        list.add(elem);
        list.remove(elem);

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(0);
      });

      it("should add an element and, if removed again, it should stop being there when txn is rejected", function() {

        var list = new NumberList();
        var elem = list.$type.of.to(0);

        // ---

        list.add(elem);
        list.remove(elem);

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(list.count).toBe(0);
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

        it("should not add a reference", function() {

          var list = new NumberList();

          // ---

          list.add(0);

          // ---

          // There's no other public way...
          expect(scope.transaction.__crefs.length).toBe(0);
        });

        it("should not try to cancel an added reference when changes are cleared", function() {
          var list = new NumberList();

          // ---

          list.add(0);

          // ---

          list.$changeset.clearChanges();
        });
      });

      describe("when element is complex", function() {

        it("should add a reference as soon as the change is made", function() {

          var list = new ComplexList();
          var elem = new DerivedComplex({foo: 123});

          expectNoRefs(elem);

          // ---

          list.add(elem);

          // ---

          expectSingleRefTo(elem, list);
        });

        it("should add a reference but should have no effect if txn is rejected", function() {

          var list = new ComplexList();
          var elem = new DerivedComplex({foo: 123});

          // ---

          list.add(elem);

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          expectNoRefs(elem);
        });

        it("should add a reference but should have no effect if txn is exited from", function() {

          var list = new ComplexList();
          var elem = new DerivedComplex({foo: 123});

          // ---

          list.add(elem);

          // ---

          scope.exit();

          // ---

          expectNoRefs(elem);
        });

        it("should preserve an added reference if txn is committed", function() {

          var list = new ComplexList();
          var elem = new DerivedComplex({foo: 123});

          // ---

          list.add(elem);

          // ---

          scope.accept();

          // ---

          expectSingleRefTo(elem, list);
        });

        it("should cancel an added reference when changes are cleared, in ambient values", function() {

          var list = new ComplexList();
          var elem = new DerivedComplex({foo: 123});

          // ---

          list.add(elem);

          // ---

          var refs = elem.$references;

          expect(refs.length).toBe(1);

          // ---

          list.$changeset.clearChanges();

          // ---

          expectNoRefs(elem);
        });

        it("should cancel an added reference when changes are cleared, and committed", function() {

          var list = new ComplexList();
          var elem = new DerivedComplex({foo: 123});

          // ---

          list.add(elem);

          // ---

          var refs = elem.$references;

          expect(refs.length).toBe(1);

          // ---

          list.$changeset.clearChanges();

          scope.accept();

          // ---

          expectNoRefs(elem);
        });

        it("should add a reference, but if the element is removed again, it should remove the added reference and " +
           "and not be visible anymore as ambient values", function() {

          var list = new ComplexList();
          var elem = new DerivedComplex({foo: 123});

          // ---

          list.add(elem);
          list.remove(elem);

          // ---

          expectNoRefs(elem);
        });

        it("should add a reference, but if the element is removed again, it should remove the added reference and " +
           "not be there when committed", function() {

          var list = new ComplexList();
          var elem = new DerivedComplex({foo: 123});

          // ---

          list.add(elem);
          list.remove(elem);

          // ---

          scope.accept();

          // ---

          expectNoRefs(elem);
        });

        it("should add a reference, but if the element is removed again, it should remove the added reference and " +
            "not be there when rejected", function() {

          var list = new ComplexList();
          var elem = new DerivedComplex({foo: 123});

          // ---

          list.add(elem);
          list.remove(elem);

          // ---

          try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

          // ---

          expectNoRefs(elem);
        });
      });
    });
  });
});
