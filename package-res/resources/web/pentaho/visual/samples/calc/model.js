define([
  "pentaho/visual/base/model",
  "pentaho/i18n!model",
  "./theme/model"
], function(visualFactory, bundle) {

  "use strict";

  return function(context) {

    var Visual = context.get(visualFactory);

    /**
     * @name pentaho.visual.samples.calc.Model
     * @class
     * @extends pentaho.visual.base.Model
     * @amd {pentaho.type.Factory<pentaho.visual.samples.calc.Model>} pentaho/visual/samples/calc
     */
    return Visual.extend({
      type: {
        id:   "pentaho/visual/samples/calc",
        v2Id: "sample_calc",

        view: "View",

        styleClass: "pentaho-visual-samples-calculator",

        props: [
          {
            name: "levels",
            type: {
              base: "pentaho/visual/role/nominal",
              props: {attributes: {isRequired: true}}
            }
          },
          {
            name: "measure",
            type: {
              base: "pentaho/visual/role/quantitative",
              props: {attributes: {countMin: 1, countMax: 1}}
            }
          },
          {
            name: "operation",
            type: {
              base: "refinement",
              of:   "string",
              facets: ["DiscreteDomain"],
              domain: ["min", "max", "avg", "sum"]
            },
            value: "min"
          }
        ]
      }
    })
    .implement({type: bundle.structured});
  };
});
