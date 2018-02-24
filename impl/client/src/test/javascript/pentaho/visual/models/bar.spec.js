/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.visual.ccc.bar.Model", function() {

    var AbstractModel;
    var BarModel;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(context) {

            return context.getDependencyApplyAsync([
              "pentaho/visual/models/abstract",
              "pentaho/visual/models/bar"
            ], function(_AbstractModel, _BarModel) {
              AbstractModel = _AbstractModel;
              BarModel = _BarModel;
            });
          })
          .then(done, done.fail);

    });

    it("should be a function", function() {
      expect(typeof BarModel).toBe("function");
    });

    it("should be a sub-class of `Value`", function() {
      expect(BarModel.prototype instanceof AbstractModel).toBe(true);
    });

    it("should be possible to create a instance with no arguments", function() {
      new BarModel();
    });

    it("should create a valid instance", function() {

      var dataTable = new Table({
        model: [
          {name: "foo", type: "number"}
        ]
      });

      var model = new BarModel({
        data:     {v: dataTable},
        measures: {fields: [{name: "foo"}]}
      });

      expect(model.validate()).toBe(null);
    });

    it("should have a default view", function() {

      expect(!!BarModel.type.defaultView).toBe(true);
    });
  });
});
