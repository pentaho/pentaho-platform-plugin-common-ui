define([
  "pentaho/visual/base/model",
  "pentaho/i18n!model",
  "./theme/model"
], function(visualFactory, bundle) {

  "use strict";

  /**
   * Creates the `Calc` type of a given context.
   *
   * @name calcFactory
   * @memberOf pentaho.visual.samples
   * @type pentaho.type.Factory
   * @amd pentaho/visual/samples/calc
   */
  return function(context) {

    var Visual = context.get(visualFactory);

    return Visual.extend({
      type: {
        id: "pentaho/visual/samples/calc",
        v2Id: "sample_calc",

        view: "View", // relative to declaring type's `id` unless prefixed with '/'. When type is anonymous, it's global?
        styleClass: "pentaho-visual-samples-calculator",
        props: [
          {
            name: "levels",
            type: ["string"],
            isRequired: true,
            isVisualRole: true
          },
          {
            name: "measure",
            isRequired: true,
            isVisualRole: true
          },
          {
            name: "operation",
            type: {
              base: "refinement",
              of:   "string",
              facets: "DiscreteDomain",
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
