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


define([
  "common-ui/prompting/components/StaticAutocompleteBoxComponent",
  "cdf/lib/jquery"
], function(StaticAutocompleteBoxComponent, $) {

  var testInteger;
  var testStringWithNumber;
  var createCommonParameters;

  beforeEach(function () {
    testInteger = "123456";
    testStringWithNumber = "123456 String";

    createCommonParameters = function(parameter, values) {
      return {
        parameter : parameter,
        param : {
          values : [values]
        },
        name : "staticAutocompleteBoxComponent",
        type : "StaticAutocompleteBoxComponent",
        htmlObject : "test",
        valuesArray : []
      };
    };
  });

  afterEach(function () {
    testInteger = testStringWithNumber = createCommonParameters = null;
  });

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

    it("should not call autocomplete search", function() {
      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("StringParameter", {
        type : "java.lang.String",
        label : testInteger,
        value : testInteger
      }));

      spyOn(comp, "_finalizeSource" ).and.callFake(function() {});

      expect(comp.needsUpdateOnNextRefresh).toBe(false);
      comp.update();
      expect(comp.needsUpdateOnNextRefresh).toBe(false);
      expect(comp._finalizeSource).not.toHaveBeenCalled();
    });

    it("should call autocomplete search", function() {
      var comp = new StaticAutocompleteBoxComponent();
      $.extend(comp, createCommonParameters("StringParameter", {
        type : "java.lang.String",
        label : testInteger,
        value : testInteger
      }));

      spyOn(comp, "_finalizeSource" ).and.callFake(function() {});

      expect(comp.needsUpdateOnNextRefresh).toBe(false);
      comp.needsUpdateOnNextRefresh = true;
      comp.update();
      expect(comp.needsUpdateOnNextRefresh).toBe(false);
      expect(comp._finalizeSource).toHaveBeenCalled();
    });

    it("should set needsUpdateOnNextRefresh", function () {
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
      $('input', comp.ph).text("Test");
      $('input', comp.ph).autocomplete( 'search');
      expect(comp.dashboard.processChange).toHaveBeenCalled();
      expect(comp.needsUpdateOnNextRefresh).toBe(true);
      ph.remove();
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

    it("should fire a change in the dashboard when input changes", function() {
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
      $('input', comp.ph).text("Test");
      $('input', comp.ph).autocomplete( 'search');
      expect(comp.dashboard.processChange).toHaveBeenCalled();

      ph.remove();
    });

    it("should fire a change in the dashboard on focusout", function() {
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
