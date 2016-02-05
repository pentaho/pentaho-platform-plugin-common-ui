/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
