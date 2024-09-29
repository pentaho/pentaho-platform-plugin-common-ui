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
  "pentaho/data/filter/Abstract",
  "pentaho/data/filter/IsEqual",
  "pentaho/visual/action/Base",
  "pentaho/visual/action/mixins/Data"
], function(AbstractFilter, IsEqualFilter, BaseAction, DataActionMixin) {

  "use strict";

  var CustomDataAction;

  beforeAll(function() {
    // Non-abstract, empty action, mixed-in with data mixin.
    CustomDataAction = BaseAction.extend().mix(DataActionMixin);
  });

  describe("pentaho.visual.action.mixins.Data", function() {

    it("should be defined", function() {

      expect(typeof DataActionMixin).toBe("function");
    });

    it("should pre-load all registered data filter types", function() {

      function defineCustomFilter(localRequire) {

        localRequire.define("tests/filter/Custom", ["pentaho/data/filter/Abstract"], function(AbstractFilter) {

          return AbstractFilter.extend({
            $type: {
              id: "tests/filter/Custom"
            }
          });
        });

        localRequire.config({
          config: {
            "pentaho/modules": {
              "tests/filter/Custom": {base: "pentaho/data/filter/Abstract"}
            }
          }
        });
      }

      return require.using(
        ["require", "pentaho/visual/action/mixins/Data"],
        defineCustomFilter,
        function(localRequire) {
          var CustomFilter = localRequire("tests/filter/Custom");
          expect(typeof CustomFilter).toBe("function");
        });
    });

    describe("#_init({dataFilter})", function() {

      it("should accept spec.dataFilter given a data filter instance", function() {

        var filter = new IsEqualFilter({property: "a", value: "1"});

        // ---

        var action = new CustomDataAction({dataFilter: filter});

        // ---

        expect(action.dataFilter).toBe(filter);
      });

      it("should accept spec.dataFilter given a data filter specification", function() {

        var action = new CustomDataAction({dataFilter: {_: "=", property: "a", value: "1"}});

        // ---

        expect(action.dataFilter instanceof IsEqualFilter).toBe(true);
        expect(action.dataFilter.property).toBe("a");
        expect(action.dataFilter.value.valueOf()).toBe("1");
      });

      it("should default to null", function() {

        var action = new CustomDataAction();

        // ---

        expect(action.dataFilter).toBe(null);
      });
    });

    describe("#dataFilter", function() {

      it("should respect a filter given as an data filter instance", function() {

        var filter = new IsEqualFilter({property: "a", value: "1"});

        // ---

        var action = new CustomDataAction();
        action.dataFilter = filter;

        // ---

        expect(action.dataFilter).toBe(filter);
      });

      it("should respect a filter given as a specification", function() {

        var action = new CustomDataAction();

        // ---

        action.dataFilter = {_: "=", property: "a", value: "1"};

        // ---

        expect(action.dataFilter instanceof IsEqualFilter).toBe(true);
        expect(action.dataFilter.property).toBe("a");
        expect(action.dataFilter.value.valueOf()).toBe("1");
      });

      it("should allow setting to nully", function() {

        var filter = new IsEqualFilter({property: "a", value: "1"});

        var action = new CustomDataAction();

        action.dataFilter = filter;

        // ---

        action.dataFilter = null;

        // ---

        expect(action.dataFilter).toBe(null);

        // ---
        // ---

        action.dataFilter = filter;

        // ---

        action.dataFilter = undefined;

        // ---

        expect(action.dataFilter).toBe(null);
      });

    });
  });
});
