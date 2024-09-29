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
  "pentaho/data/Table",
  "../role/adaptationUtil"
], function(Table, adaptationUtil) {

  "use strict";

  var buildAdapter = adaptationUtil.buildAdapter;
  var ModelWithStringRole;
  var ElementIdentityStrategy;

  describe("pentaho.visual.role.ExternalMapping", function() {

    beforeAll(function() {

      var mocks = adaptationUtil.createMocks();

      ModelWithStringRole = mocks.ModelWithStringRole;
      ElementIdentityStrategy = mocks.ElementIdentityStrategy;
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

    describe("#strategy", function() {

      it("should get the current strategy if the mapping is valid", function() {

        var strategies = [ElementIdentityStrategy.type];

        var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
          {
            name: "roleA",
            strategies: strategies
          }
        ]);

        var model = new ModelWithStringRole();

        var modelAdapter = new DerivedModelAdapter({
          model: model,
          data: new Table(getDataSpec1()),
          roleA: {
            fields: ["country"]
          }
        });

        var strategy1 = modelAdapter.roleA.strategy;

        expect(strategy1).not.toBe(null);
      });

      it("should get null if the mapping is valid", function() {

        var strategies = [ElementIdentityStrategy.type];

        var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
          {
            name: "roleA",
            strategies: strategies
          }
        ]);

        var model = new ModelWithStringRole();

        var modelAdapter = new DerivedModelAdapter({
          model: model,
          data: new Table(getDataSpec1()),
          roleA: {
            fields: ["sales"]
          }
        });

        var strategy = modelAdapter.roleA.strategy;

        expect(strategy).toBe(null);
      });
    });

    describe("#mode", function() {

      it("should get the current mode if the mapping is valid", function() {

        var strategies = [ElementIdentityStrategy.type];

        var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
          {
            name: "roleA",
            strategies: strategies
          }
        ]);

        var model = new ModelWithStringRole();

        var modelAdapter = new DerivedModelAdapter({
          model: model,
          data: new Table(getDataSpec1()),
          roleA: {
            fields: ["country"]
          }
        });

        var mode = modelAdapter.roleA.mode;

        expect(mode).toBe(DerivedModelAdapter.type.get("roleA").modes.at(0));
      });

      it("should get null if the mapping is valid", function() {

        var strategies = [ElementIdentityStrategy.type];

        var DerivedModelAdapter = buildAdapter(ModelWithStringRole, [
          {
            name: "roleA",
            strategies: strategies
          }
        ]);

        var model = new ModelWithStringRole();

        var modelAdapter = new DerivedModelAdapter({
          model: model,
          data: new Table(getDataSpec1()),
          roleA: {
            fields: ["sales"]
          }
        });

        var mode = modelAdapter.roleA.mode;

        expect(mode).toBe(null);
      });
    });
  });
});
