/**
 * Utility methods designed for general use
 */
pen.define('common-ui/util/util', function() {
  return {
    /**
     * Parse the parameters from the current URL.
     *
     * @return Map of decoded parameter names and values
     */
    getUrlParameters: function() {
      var urlParams = {};
      var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        reg = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        query = window.location.search.substring(1);

      while (e = reg.exec(query)) {
        var paramName = decode(e[1]);
        var paramVal = decode(e[2]);

        if (urlParams[paramName] !== undefined) {
          paramVal = $.isArray(urlParams[paramName])
            ? urlParams[paramName].concat([paramVal])
            : [urlParams[paramName], paramVal];
        }
        urlParams[paramName] = paramVal;
      }
      return urlParams;
    },

    /**
     * Parses the language portion of a locale URL parameter, if defined.
     *
     * @return language portion of the URL parameter "locale". If it is not defined, undefined is returned.
     */
    getLocale: function() {
      var locale = this.getUrlParameters().locale;
      if (locale && locale.length > 2) {
        locale = locale.substring(0, 2);
      }
      return locale;
    }
  }
});