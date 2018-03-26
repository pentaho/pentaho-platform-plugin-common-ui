define(function() {
  return ["string", function(PentahoString) {
    return PentahoString.extend({
      $type: {
        mixins: ["enum"],
        domain: [
          "year",
          "month",
          "day"
        ]
      }
    });
  }];
});
