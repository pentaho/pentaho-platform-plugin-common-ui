define(function() {
  return ["string", function(PentahoString) {
    /**
     * @name pentaho.visual.role.adaptation.TimeIntervalDuration
     * @class
     * @extends pentaho.type.String
     *
     * @amd {pentaho.type.Factory<pentaho.visual.role.adaptation.TimeIntervalDuration>}
     *   pentaho/visual/role/adaptation/timeIntervalDuration
     *
     * @private
     */
    return PentahoString.extend(
      {
        $type: /** @lends pentaho.visual.role.adaptation.TimeIntervalDuration.Type# */ {
          mixins: ["enum"],
          domain: [
            "year",
            "halfYear",
            "quarter",
            "month",
            "week",
            "day",
            "hour",
            "minute",
            "second",
            "millisecond"
          ]
        }
      }
    );
  }];
});
