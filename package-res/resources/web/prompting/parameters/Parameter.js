define(['cdf/lib/Base'], function (Base) {
  return function () {
    return {
      'name': undefined, // string
      'type': undefined, // string, java class name
      'list': undefined, // boolean
      'mandatory': undefined, // boolean
      'multiSelect': undefined, // boolean
      'strict': undefined, // boolean
      'timezoneHint': undefined, // string
      'attributes': {}, // hash of strings
      'values': [],

      /**
       * Checks if the value provided is selected in this parameter
       * @param value Value to search for
       * @return boolean if this parameter contains a selection whose value = {value}
       */
      isSelectedValue: function (value) {
        var selected = false;
        $.each(this.values, function (i, v) {
          if (v.selected) {
            if (value === v.value) {
              selected = true;
              return false; // break
            }
          }
        });
        return selected;
      },

      /**
       * Determine if any of our values are selected (selected = true)
       */
      hasSelection: function () {
        var s = false;
        $.each(this.values, function (i, v) {
          if (v.selected) {
            s = true;
            return false; // break
          }
        });
        return s;
      },

      /**
       * Obtains an array with the selected ParameterValue objects.
       */
      getSelectedValues: function () {
        var selected = [];
        $.each(this.values, function (i, val) {
          if (val.selected) {
            selected.push(val);
          }
        });
        return selected;
      },

      /**
       * Obtains an array with the values of the selected ParameterValue objects.
       */
      getSelectedValuesValue: function () {
        var selected = [];
        $.each(this.values, function (i, val) {
          if (val.selected) {
            selected.push(val.value);
          }
        });
        return selected;
      }
    };
  }
});
