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
  "pentaho/module!_",
  "pentaho/visual/Model",
  "pentaho/i18n!model"
], function(module, BaseModel, bundle) {

  "use strict";

  var operDomain = bundle.structured.operation.domain;

  /**
   * @name pentaho.visual.samples.calc.Model
   * @class
   * @extends pentaho.visual.Model
   * @amd pentaho/visual/samples/calc/Model
   */
  return BaseModel.extend({
    $type: {
      id: module.id,
      v2Id: "sample_calc",

      props: [
        {
          name: "levels",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "list"}],
          fields: {isRequired: true}
        },
        {
          name: "measure",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: true}
        },
        {
          name: "operation",
          valueType: "string",
          domain: [
            {v: "min", f: operDomain.min.f},
            {v: "max", f: operDomain.max.f},
            {v: "avg", f: operDomain.avg.f},
            {v: "sum", f: operDomain.sum.f}
          ],
          defaultValue: "min"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.type})
  .configure();
});
