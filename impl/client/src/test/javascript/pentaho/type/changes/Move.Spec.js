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
  "pentaho/type/changes/Move"
], function(Context, Move) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.changes.Move", function() {

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
      expect(typeof Move).toBeDefined();
    });

    describe("#type -", function() {
      it("should return a string with the value `move`", function() {
        expect(Move.prototype.type).toBe("move");
      });
    });

    describe("#_apply -", function() {

      var scope;

      beforeEach(function() {
        scope = context.enterChange();
      });

      afterEach(function() {
        scope.dispose();
      });

      it("should move an element from the original position to the destination, as an ambient value", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        expect(list.count).toBe(3);

        // ---

        list.move(/*elemSpec:*/3, /*indexNew:*/0);

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(3);
        expect(list.at(1).value).toBe(1);
        expect(list.at(2).value).toBe(2);
      });

      it("should move an element and be at the new position when committed", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        expect(list.count).toBe(3);

        // ---

        list.move(/*elemSpec:*/3, /*indexNew:*/0);

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(3);
        expect(list.at(1).value).toBe(1);
        expect(list.at(2).value).toBe(2);
      });

      it("should move an element but still be at the old position when rejected", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        expect(list.count).toBe(3);

        // ---

        list.move(/*elemSpec:*/3, /*indexNew:*/0);

        // ---

        try { scope.reject(); } catch(ex) { /* swallow thrown rejection */ }

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
      });

      it("should move an element but still be at the old position when exited", function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        expect(list.count).toBe(3);

        // ---

        list.move(/*elemSpec:*/3, /*indexNew:*/0);

        // ---

        scope.exit();

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
      });

      it("should move an element but still be at the old position when changes are cleared, as ambient values",
      function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        expect(list.count).toBe(3);

        // ---

        list.move(/*elemSpec:*/3, /*indexNew:*/0);
        list.$changeset.clearChanges();

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
      });

      it("should move an element but still be at the old position when changes are cleared, and committed",
      function() {

        var list = new NumberList([1, 2, 3]);

        // ---

        expect(list.count).toBe(3);

        // ---

        list.move(/*elemSpec:*/3, /*indexNew:*/0);
        list.$changeset.clearChanges();

        // ---

        scope.accept();

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
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
        scope = context.enterChange();
      });

      afterEach(function() {
        scope.dispose();
      });

      describe("when element is complex", function() {

        it("should not add or remove references when the change is made", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);

          expectSingleRefTo(elem1, list);

          // ---

          list.move(elem1, 2);

          // ---

          expectSingleRefTo(elem1, list);
        });

        it("should not add or remove references when the change is made and committed", function() {

          var list = new ComplexList([{foo: 123}, {foo: 234}, {foo: 345}]);
          var elem1 = list.at(0);

          expectSingleRefTo(elem1, list);

          // ---

          list.move(elem1, 2);

          // ---

          scope.accept();

          // ---

          expectSingleRefTo(elem1, list);
        });
      });
    });
  });
});
