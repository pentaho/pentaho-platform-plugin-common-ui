/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/type/changes/Sort",
  "pentaho/util/fun"
], function(Context, Sort, fun) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.changes.Sort -", function() {

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
        scope = context.enterChange();
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
        scope = context.enterChange();
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

          list.sort(function(a, b) { return a.foo - b.foo});

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

          list.sort(function(a, b) { return a.foo - b.foo});

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
