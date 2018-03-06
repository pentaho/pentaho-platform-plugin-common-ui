/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/data/Table"
], function(Context, Table) {

  "use strict";

  /* globals describe, it, beforeEach, afterEach, beforeAll, spyOn */

  describe("pentaho.visual.role.AbstractMapping", function() {

    var context;
    var Mapping;
    var Model;

    function getDataSpec1() {
      return {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "product", type: "string", label: "Product"},
          {name: "sales", type: "number", label: "Sales"},
          {name: "date", type: "date", label: "Date"}
        ],
        rows: [
          {c: ["Portugal", "fish", 100, "2016-01-01"]},
          {c: ["Ireland", "beer", 200, "2016-01-02"]}
        ]
      };
    }

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(_context) {

            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/visual/base/abstractModel",
              "pentaho/visual/role/abstractMapping"
            ], function(_AbstractModel, _Mapping) {
              Model = _AbstractModel.extend();
              Mapping = _Mapping;
            });
          })
          .then(done, done.fail);

    });

    describe("#hasFields", function() {

      it("should be false when it has zero fields", function() {

        var mapping = new Mapping();
        expect(mapping.hasFields).toBe(false);
      });

      it("should be true when it has one field", function() {

        var mapping = new Mapping({fields: ["foo"]});
        expect(mapping.hasFields).toBe(true);
      });

      it("should be true when it has two fields", function() {

        var mapping = new Mapping({fields: ["foo", "bar"]});
        expect(mapping.hasFields).toBe(true);
      });
    });

    describe("#_modelReference", function() {

      it("should return null when there is no container", function() {

        var mapping = new Mapping();
        expect(mapping._modelReference).toBe(null);
      });

      it("should return the reference to the container abstract model", function() {

        var Derived = Model.extend({
          $type: {
            props: [
              {name: "foo", base: "pentaho/visual/role/abstractProperty"}
            ]
          }
        });

        var derived = new Derived();
        var mapping = derived.foo;

        expect(mapping._modelReference).not.toBe(null);
        expect(mapping._modelReference.container).toBe(derived);
        expect(mapping._modelReference.property).toBe(Derived.type.get("foo"));
      });
    });

    describe("#fieldIndexes", function() {

      it("should return null when there is no container", function() {

        var mapping = new Mapping();
        expect(mapping.fieldIndexes).toBe(null);
      });

      it("should return null if any field is not defined", function() {

        var Derived = Model.extend({
          $type: {
            props: [
              {
                name: "propRole",
                base: "pentaho/visual/role/abstractProperty",
                modes: ["list"]
              }
            ]
          }
        });

        var derived = new Derived({
          data: new Table(getDataSpec1()),
          propRole: {fields: ["sales", "foo"]}
        });
        var mapping = derived.propRole;
        var result = mapping.fieldIndexes;

        expect(result).toBe(null);
      });

      it("should return an array with the correct indexes", function() {

        var Derived = Model.extend({
          $type: {
            props: [
              {
                name: "propRole",
                base: "pentaho/visual/role/abstractProperty",
                modes: ["list"]
              }
            ]
          }
        });

        var derived = new Derived({
          data: new Table(getDataSpec1()),
          propRole: {fields: ["sales", "country"]}
        });
        var mapping = derived.propRole;
        var result = mapping.fieldIndexes;

        expect(result).toEqual([2, 0]);
      });
    });
  });
});
