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
  "pentaho/visual/AbstractModel",
  "pentaho/visual/role/AbstractMapping",
  "pentaho/data/Table"
], function(AbstractModel, Mapping, Table) {

  "use strict";

  describe("pentaho.visual.role.AbstractMapping", function() {

    var Model;

    beforeAll(function() {
      Model = AbstractModel.extend();
    });

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
              {name: "foo", base: "pentaho/visual/role/AbstractProperty"}
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
                base: "pentaho/visual/role/AbstractProperty",
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
                base: "pentaho/visual/role/AbstractProperty",
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
