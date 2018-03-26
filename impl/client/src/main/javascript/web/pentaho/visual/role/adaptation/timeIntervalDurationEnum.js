define(function() {
  return ["string", function(PentahoString) {
    return PentahoString.extend({
      $type: {
        mixins: ["enum"],
        domain: [
          "YEAR",
          "HALFYEAR",
          "QUARTER",
          "MONTH",
          "WEEK",
          "DAY",
          "HOUR",
          "MINUTE",
          "SECOND",
          "MILLISECOND"
        ]
      }
    });
  }];
});
