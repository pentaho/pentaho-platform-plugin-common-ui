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

define([ "common-ui/prompting/components/StaticAutocompleteBoxComponent", "dojo/number", "cdf/lib/jquery" ], function(
  StaticAutocompleteBoxComponent, dojoNumber, $) {

  var testValue = "123456";
  createCommonParameters = function(parameter, values) {
    return {
      parameter : parameter,
      param : {
        values : [ values ]
      },
      name : "staticAutocompleteBoxComponent",
      type : "StaticAutocompleteBoxComponent",
      htmlObject : "",
      valuesArray : []
    };
  };

  describe("StaticAutocompleteBoxComponent.update()", function() {

    it("should not try to parse a string", function() {
      spyOn(dojoNumber, "format");

      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234String", {
        type : "java.lang.String",
        label : testValue,
        value : testValue
      }));

      comp.update();

      expect(dojoNumber.format).not.toHaveBeenCalled();
      expect(comp.param.values[0].label).toBe(testValue);
      expect(comp.param.values[0].value).toBe(testValue);
    });

    it("should try to parse a number", function() {
      spyOn(dojoNumber, "format").and.callFake(function(p) {
        // just make a returned value different from the parameter
        return '_' + p;
      });

      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234Integer", {
        type : "java.lang.Integer",
        label : testValue,
        value : testValue,
        selected : true
      }));

      comp.update();

      expect(dojoNumber.format).toHaveBeenCalled();
      expect(comp.param.values[0].label).not.toBe(testValue);
      expect(comp.param.values[0].value).not.toBe('123456');
    });

    it("should keep string if failed to to parse a number", function() {
      spyOn(dojoNumber, 'format').and.throwError();

      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234Integer", {
        type : "java.lang.Integer",
        label : "12qw",
        value : "12qw",
        selected : true
      }));

      comp.update();

      expect(comp.param.values[0].label).toBe("12qw");
      expect(comp.param.values[0].label).toBe("12qw");
    });
  });

  describe("getValue", function() {
    var comp;
    beforeEach(function() {
      comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234String", {
        type : "java.lang.String",
        label : testValue,
        value : testValue
      }));
      spyOn($.fn, 'val').and.returnValue(testValue);
    });

    it("should return value from object", function() {
      var value = comp.getValue();
      expect(value).toBe(testValue);
    });

    it("should return value if not key", function() {
      comp.param.list = true;
      comp.update();
      var value = comp.getValue();
      expect(value).toBe(testValue);
    });

    it("should return key for value", function() {
      var testV = "test-v";
      comp.param.list = true;
      comp.valuesArray = [ {
        label : testValue,
        value : testV
      } ];
      comp.update();
      var value = comp.getValue();
      expect(value).toBe(testV);
    });

    it("should return formatted value", function() {
      var formattedV = "fomatted_";
      var parsedV = "parsed_";
      var transportFormatter = jasmine.createSpyObj("transportFormatter", [ "format" ]);
      transportFormatter.format.and.callFake(function(val) {
        return formattedV + val;
      });
      var formatter = jasmine.createSpyObj("formatter", [ "parse" ]);
      formatter.parse.and.callFake(function(val) {
        return parsedV + val;
      });
      comp.param.list = false;
      comp.transportFormatter = transportFormatter;
      comp.formatter = formatter;
      comp.update();
      var value = comp.getValue();
      expect(value).toBe(formattedV + parsedV + testValue);
    });
  });
});
