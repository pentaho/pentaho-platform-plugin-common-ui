define(['cdf/lib/Base'], function (Base) {
  return function () {

    return {
      'autoSubmit': undefined, // boolean
      'autoSubmitUI': undefined, // boolean
      'ignoreBiServer5538': undefined, // boolean
      'layout': undefined, // string, [vertical, horizontal]
      'page': undefined, // integer
      'paginate': undefined, // boolean
      'parameterGroups': [],
      'promptNeeded': undefined, // boolean
      'totalPages': undefined, // integer
      'errors': {}, // hash of {paramName, [error1..n]}. "Global" errors are stored as {'null', [error1..n]}.

      getParameterGroup: function (name) {
        var group;
        $.each(this.parameterGroups, function (i, g) {
          if (g.name === name) {
            group = g;
            return false; // break
          }
        });
        return group;
      },

      allowAutoSubmit: function () {
        if (this.autoSubmit != undefined) {
          return this.autoSubmit;
        }
        return this.autoSubmitUI;
      },

      showParameterUI: function () {
        var showParameters;
        this.mapParameters(function (p) {
          if (p.name == 'showParameters') {
            showParameters = p;
            return false; // break
          }
        });

        return !showParameters || !showParameters.isSelectedValue('false');
      },

      getParameter: function (name) {
        var param;
        this.mapParameters(function (p) {
          if (p.name === name) {
            param = p;
            return false; // break
          }
        });
        return param;
      },

      mapParameters: function (f, x) {
        var d = this;
        var breaking = false;
        $.each(this.parameterGroups, function (i, g) {
          $.each(this.parameters, function (j, p) {
            if (f.call(x, p, g, d) === false) {
              breaking = true;
              return false; // break
            }
          });
          if (breaking) {
            return false;
          }
        });

        return !breaking;
      }
    };
  }
});
