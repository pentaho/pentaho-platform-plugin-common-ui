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


define([ 'common-ui/prompting/parameters/Parameter' ], function(Parameter) {

  describe("Parameter", function() {
    var param;
    var testValue = {
      selected: true,
      value: "test-value"
    };

    beforeEach(function() {
      param = Parameter();
    });

    describe("getSelectedValuesValue", function() {

      it("should return empty array by default", function() {
        var selected = param.getSelectedValuesValue();
        expect(selected).toEqual([]);
      });

      it("should return an array with the values of the selected ParameterValue objects", function() {
        param.values.push(testValue);
        var selected = param.getSelectedValuesValue();
        expect(selected).toEqual([testValue.value]);
      });
    });

    describe("isSelectedValue", function() {

      it("should return false by default", function() {
        var selected = param.isSelectedValue("test-value");
        expect(selected).toEqual(false);
      });

      it("should return true if the value provided is selected in this parameter", function() {
        param.values.push(testValue);
        var selected = param.isSelectedValue("test-value");
        expect(selected).toEqual(true);
      });
    });

    describe("hasSelection", function() {

      it("should return false by default", function() {
        var selected = param.hasSelection();
        expect(selected).toEqual(false);
      });

      it("should return true if any of our values are selected", function() {
        param.values.push(testValue);
        var selected = param.hasSelection();
        expect(selected).toEqual(true);
      });
    });
  });
});
