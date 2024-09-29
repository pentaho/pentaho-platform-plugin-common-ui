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
  "pentaho/visual/util",
  "pentaho/visual/models/Abstract",
  "pentaho/visual/models/Bar",
  "pentaho/data/Table"
], function(visualUtil, AbstractModel, BarModel, Table) {

  "use strict";

  describe("pentaho.visual.ccc.bar.Model", function() {

    it("should be a function", function() {
      expect(typeof BarModel).toBe("function");
    });

    it("should be a sub-class of `AbstractModel`", function() {
      expect(BarModel.prototype instanceof AbstractModel).toBe(true);
    });

    it("should be possible to create a instance with no arguments", function() {
      // eslint-disable-next-line no-new
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
      var vizTypeId = BarModel.type.id;

      var defaultView = visualUtil.getDefaultViewModule(vizTypeId);
      expect(!!defaultView).toBe(true);
    });
  });
});
