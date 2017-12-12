/*!
 * Copyright 2017 Hitachi Vantara.  All rights reserved.
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
  "tests/test-utils"
], function(Context, testUtils) {

  "use strict";

  // Use alternate, promise-aware version of `it`.
  var it = testUtils.itAsync;

  var context;
  var BaseAction;
  var DataActionMixin;
  var CustomDataAction;

  beforeAll(function(done) {

    Context.createAsync()
        .then(function(_context) {

          context = _context;

          return context.getDependencyAsync({
            BaseAction: "pentaho/visual/action/base",
            DataActionMixin: "pentaho/visual/action/mixins/data"
          });
        })
        .then(function(types) {
          BaseAction = types.BaseAction;
          DataActionMixin = types.DataActionMixin;

          // Non-abstract, empty action, mixed-in with data mixin.
          CustomDataAction = BaseAction.extend({
            $type: {
              mixins: [DataActionMixin]
            }
          });
        })
        .then(done, done.fail);
  });

  describe("pentaho.visual.action.mixins.Data", function() {

    it("should be defined", function() {

      expect(typeof DataActionMixin).toBe("function");
    });

    it("should pre-load all registered data filter types", function() {

      var AbstractFilter = context.get("pentaho/data/filter/abstract");

      expect(typeof AbstractFilter).toBe("function");

      // ---

      function defineCustomFilter(localRequire) {

        localRequire.define("tests/filter/custom", [], function() {

          return ["pentaho/data/filter/abstract", function(AbstractFilter) {

            return AbstractFilter.extend({
              $type: {
                id: "tests/filter/custom"
              }
            });
          }];
        });

        localRequire.config({
          config: {
            "pentaho/typeInfo": {
              "tests/filter/custom": {base: "pentaho/data/filter/abstract"}
            }
          }
        });
      }

      return require.using(["pentaho/type/Context"], defineCustomFilter, function(Context) {

        return Context.createAsync()
            .then(function(context) {
              return context.getAsync("pentaho/visual/action/mixins/data");
            })
            .then(function(DataActionMixin) {
              var CustomFilter = DataActionMixin.type.context.get("tests/filter/custom");
              expect(typeof CustomFilter).toBe("function");
            });
      });
    });

    describe("#_init({dataFilter})", function() {

      it("should accept spec.dataFilter given a data filter instance", function() {

        var IsEqualFilter = context.get("=");

        var filter = new IsEqualFilter({property: "a", value: "1"});

        // ---

        var action = new CustomDataAction({dataFilter: filter});

        // ---

        expect(action.dataFilter).toBe(filter);
      });

      it("should accept spec.dataFilter given a data filter specification", function() {

        var action = new CustomDataAction({dataFilter: {_: "=", property: "a", value: "1"}});

        // ---

        var IsEqualFilter = context.get("=");

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

        var IsEqualFilter = context.get("=");

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

        var IsEqualFilter = context.get("=");

        expect(action.dataFilter instanceof IsEqualFilter).toBe(true);
        expect(action.dataFilter.property).toBe("a");
        expect(action.dataFilter.value.valueOf()).toBe("1");
      });

      it("should allow setting to nully", function() {

        var IsEqualFilter = context.get("=");

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

      describe("#toSpecInContext()", function() {

        it("should not serialize a null dataFilter", function() {

          var action = new CustomDataAction();

          // ---

          var spec = action.toSpec();

          // ---

          expect("dataFilter" in spec).toBe(false);
        });

        it("should serialize a non-null dataFilter", function() {

          var IsEqualFilter = context.get("=");
          var filter = new IsEqualFilter({property: "a", value: "1"});
          var action = new CustomDataAction({dataFilter: filter});

          // ---

          var spec = action.toSpec();

          // ---

          expect(spec.dataFilter).toEqual({
            _: "=",
            p: "a",
            v: "1"
          });
        });
      });
    });
  });
});
