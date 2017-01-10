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

define([ "common-ui/prompting/components/StaticAutocompleteBoxComponent", "cdf/lib/jquery" ], function(
  StaticAutocompleteBoxComponent, $) {

  var testInteger = "123456";
  var testStringWithNumber = "123456 String";
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
      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("StringParameter", {
        type : "java.lang.String",
        label : testInteger,
        value : testInteger
      }));

      comp.update();

      expect(comp.param.values[0].label).toBe(testInteger);
      expect(comp.param.values[0].value).toBe(testInteger);
    });

    it("should not try to parse a number", function() {
      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("IntegerParameter", {
        type : "java.lang.Integer",
        label : testInteger,
        value : testInteger,
        selected : true
      }));

      comp.update();

      expect(comp.param.values[0].label).toBe(testInteger);
      expect(comp.param.values[0].value).toBe(testInteger);
    });

    it("should keep string if failed to to parse a number", function() {
      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234Integer", {
        type : "java.lang.Integer",
        label : testStringWithNumber,
        value : testStringWithNumber,
        selected : true
      }));

      comp.update();

      expect(comp.param.values[0].label).toBe(testStringWithNumber);
      expect(comp.param.values[0].value).toBe(testStringWithNumber);
    });

    it("should fire a change in the dashboard on enter keypress", function() {
      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("IntegerParameter", {
        type : "java.lang.Integer",
        label : testStringWithNumber,
        value : testStringWithNumber,
        selected : true
      }));

      comp.dashboard = { 
        processChange: function() { }
      };
      comp.htmlObject = 'test';

      var ph = $('<div>').attr('id', comp.htmlObject);
      $('body').append(ph);

      comp.update();  

      spyOn(comp.dashboard, 'processChange');      
       $('input', comp.ph).trigger($.Event( 'keypress', { which: $.ui.keyCode.ENTER } ));

      expect(comp.dashboard.processChange).toHaveBeenCalled();  
      
      ph.remove();
    });

    it("should not fire a change in the dashboard on any keypress other than enter", function() {
      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("IntegerParameter", {
        type : "java.lang.Integer",
        label : testStringWithNumber,
        value : testStringWithNumber,
        selected : true
      }));

      comp.dashboard = { 
        processChange: function() { }
      };
      comp.htmlObject = 'test';

      var ph = $('<div>').attr('id', comp.htmlObject);
      $('body').append(ph);

      comp.update();
      
      spyOn(comp.dashboard, 'processChange');      
      $('input', comp.ph).trigger($.Event( 'keypress', { which: $.ui.keyCode.ESCAPE } ));

      expect(comp.dashboard.processChange).not.toHaveBeenCalled();  
      
      ph.remove();
    });

    it("shoud fire a change in the dashboard on focusout", function() {
      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("IntegerParameter", {
        type : "java.lang.Integer",
        label : testStringWithNumber,
        value : testStringWithNumber,
        selected : true
      }));

      comp.dashboard = { 
        processChange: function() { }
      };
      comp.htmlObject = 'test';

      var ph = $('<div>').attr('id', comp.htmlObject);
      $('body').append(ph);

      comp.update();
      
      spyOn(comp.dashboard, 'processChange');      
      $('input', comp.ph).trigger('focusout');

      expect(comp.dashboard.processChange).toHaveBeenCalled();  
      
      ph.remove();
    });
  });

  describe("getValue", function() {
    var comp;
    beforeEach(function() {
      comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("1234String", {
        type : "java.lang.String",
        label : testInteger,
        value : testInteger
      }));
      spyOn($.fn, 'val').and.returnValue(testInteger);
    });

    it("should return value from object", function() {
      var value = comp.getValue();
      expect(value).toBe(testInteger);
    });

    it("should return value if not key", function() {
      comp.param.list = true;
      comp.update();
      var value = comp.getValue();
      expect(value).toBe(testInteger);
    });

    it("should return key for value", function() {
      comp.param.list = true;
      comp.valuesArray = [ {
        label : testStringWithNumber,
        value : testInteger
      } ];
      comp.update();
      var value = comp.getValue();
      expect(value).toBe(testInteger);
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
      expect(value).toBe(formattedV + parsedV + testInteger);
    });
  });
});