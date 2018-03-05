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
  "pentaho/visual/role/strategies/impl/Mapper",
  "pentaho/data/Table"
], function(Context, Mapper, DataTable) {

  "use strict";

  /* globals describe, it, beforeEach, beforeAll, spyOn */

  xdescribe("pentaho.visual.role.strategies.impl.Mapper", function() {

    var propType;
    var dataTable;
    var mode;
    var strategy;

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(context) {
            return context.getAsync("pentaho/visual/base/model");
          })
          .then(function(VisualModel) {
            var CustomVisualModel = VisualModel.extend({
              $type: {
                props: [
                  {
                    name: "roleA",
                    base: "pentaho/visual/role/property"
                  }
                ]
              }
            });

            propType = CustomVisualModel.type.get("roleA");
            dataTable = new DataTable();
            mode = propType.modes.at(0);
            strategy = propType.strategies.at(0);
          })
          .then(done, done.fail);

    });

    it("should be possible to create an instance", function() {

      var mapper = new Mapper(strategy, propType, dataTable, mode);

      expect(mapper instanceof Mapper).toBe(true);
    });

    it("should respect and expose the specified `propType` argument in `_propType`", function() {

      var mapper = new Mapper(strategy, propType, dataTable, mode);

      expect(mapper._propType).toBe(propType);
    });

    it("should respect and expose the specified `inputData` argument in `inputData`", function() {

      var mapper = new Mapper(strategy, propType, dataTable, mode);

      expect(mapper.inputData).toBe(dataTable);
    });

    it("should respect and expose the specified `mode` argument in `mode`", function() {

      var mapper = new Mapper(strategy, propType, dataTable, mode);

      expect(mapper.mode).toBe(mode);
    });

    it("should respect and expose the specified `strategy` argument in `strategy`", function() {

      var mapper = new Mapper(strategy, propType, dataTable, mode);

      expect(mapper.strategy).toBe(strategy);
    });

    it("should have `kind` be null", function() {

      var mapper = new Mapper(strategy, propType, dataTable, mode);

      expect(mapper.kind).toBe(null);
    });

    it("should have `dataType` get the mode.dataType", function() {

      var mapper = new Mapper(strategy, propType, dataTable, mode);

      expect(mapper.dataType).toBe(mode.dataType);
    });

    it("should have `isContinuous` get the mode.isContinuous", function() {

      var mapper = new Mapper(strategy, propType, dataTable, mode);

      expect(mapper.isContinuous).toBe(mode.isContinuous);
    });
  });
});
