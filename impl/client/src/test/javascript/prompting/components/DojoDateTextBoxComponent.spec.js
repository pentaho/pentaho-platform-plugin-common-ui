/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/


define([ 'cdf/lib/jquery', 'dijit/registry', 'common-ui/prompting/components/DojoDateTextBoxComponent' ], function($,
  registry, DojoDateTextBoxComponent) {

  describe("DojoDateTextBoxComponent", function() {

    describe("clear", function() {
      var comp;
      var dijitElement;
      var changeHandler;

      beforeEach(function() {
        comp = new DojoDateTextBoxComponent();
        dijitElement = jasmine.createSpyObj("dijitElement", ["destroyRecursive"]);
        changeHandler = jasmine.createSpyObj("changeHandler", ["remove"]);
      });

      it("should not clear if not exist dijitId", function() {

        comp.clear();

        expect(comp.dijitId).not.toBeDefined();
        expect(dijitElement.destroyRecursive).not.toHaveBeenCalled();
      });

      it("should destroy element", function() {
        spyOn(registry, "byId").and.returnValue(dijitElement);
        var dijitId = "test_id";
        comp.dijitId = dijitId;

        comp.clear();

        expect(comp.dijitId).toBeDefined();
        expect(registry.byId).toHaveBeenCalledWith(dijitId);
        expect(dijitElement.destroyRecursive).toHaveBeenCalled();
      });

      it("should destroy element and remove change handler", function() {
        spyOn(registry, "byId").and.returnValue(dijitElement);
        var dijitId = "test_id";
        comp.dijitId = dijitId;
        comp.onChangeHandle = changeHandler;

        comp.clear();

        expect(changeHandler.remove).toHaveBeenCalled();
        expect(registry.byId).toHaveBeenCalledWith(dijitId);
        expect(dijitElement.destroyRecursive).toHaveBeenCalled();
      });
    });

    describe("update", function() {
      var testId = "test_id";
      var testParam = "test_param";
      var testVal = "2011-11-11";
      var parsedVal = "parsed_";
      var formattedVal = "formatted_";
      var comp;
      var transportFormatter, localeFormatter;
      var dashboard;

      beforeEach(function() {
        dashboard = jasmine.createSpyObj("dashboard", [ "getParameterValue", "processChange" ]);
        dashboard.getParameterValue.and.returnValue(testVal);
        dashboard.getParameterValue.and.callFake(function(){});
        transportFormatter = jasmine.createSpyObj("transportFormatter", [ "parse" ]);
        transportFormatter.parse.and.callFake(function(val) {
          return parsedVal + val;
        });
        localeFormatter = jasmine.createSpyObj("localeFormatter", [ "parse", "format" ]);
        localeFormatter.parse.and.callFake(function(val) {
          return new Date("2001-04-14");
        });
        localeFormatter.format.and.callFake(function(val) {
          return "2001-04-14";
        });
        comp = new DojoDateTextBoxComponent();
        comp.htmlObject = testId;
        comp.parameter = testParam;
        comp.dashboard = dashboard;
        comp.transportFormatter = transportFormatter;
        comp.param = {
          attributes : {
            'data-format' : "dd.MM.yyyy"
          }
        };
        spyOn(comp, '_getFormattedDate').and.callFake(function(val) {
          return formattedVal + val;
        });
        spyOn($.fn, 'html');
        spyOn($.fn, 'attr');
        spyOn(comp, "_doAutoFocus");
      });

      it("should init date text box with undefined param", function() {
        var $container = $('<div>');
        spyOn($.fn, 'empty').and.returnValue($container);
        spyOn($.fn, 'append').and.returnValue($container);
        spyOn($, 'isArray').and.returnValue(false);

        comp.parameter = testParam;
        comp.dashboard = dashboard;
        comp.htmlObject = testId;
        comp.update();

        expect(dashboard.getParameterValue).toHaveBeenCalledWith(testParam);
        expect(transportFormatter.parse).not.toHaveBeenCalled();
        expect(comp.dijitId).toBe(testId + '_input');
        expect($.fn.empty).toHaveBeenCalled();
        expect($.fn.append).toHaveBeenCalled();
        expect(comp._doAutoFocus).toHaveBeenCalled();
      });

      it("should init date text box with array param", function() {
        var $container = $('<div>');
        spyOn($.fn, 'empty').and.returnValue($container);
        spyOn($.fn, 'append').and.returnValue($container);
        spyOn($, 'isArray').and.returnValue(true);

        dashboard.getParameterValue.and.returnValue([testVal]);
        transportFormatter.parse.and.callFake(function(val) {
          return new Date(val);
        });

        comp.update();

        expect(dashboard.getParameterValue).toHaveBeenCalledWith(testParam);
        expect(transportFormatter.parse).toHaveBeenCalledWith(testVal);
        expect(comp.dijitId).toBe(testId + '_input');
        expect($.fn.empty).toHaveBeenCalled();
        expect($.fn.append).toHaveBeenCalled();
        expect(comp._doAutoFocus).toHaveBeenCalled();
      });

      it("should init date text box with legacy date", function() {
        dashboard.getParameterValue.and.returnValue(testVal);
        comp.transportFormatter = undefined;
        comp.dateFormat = "yy-mm-oo";
        comp.localeFormatter = localeFormatter;
        spyOn(comp, "_isLegacyDateFormat").and.callFake(function() { return true; });
        spyOn(comp, "_convertFormat").and.callThrough();
        comp._getFormattedDate.and.callThrough();

        comp.update();
        expect(comp._isLegacyDateFormat).toHaveBeenCalled();
        expect(comp._convertFormat).toHaveBeenCalled();
      });

      it("inits min constrainst properly from TODAY", function() {
        dashboard.getParameterValue.and.returnValue(testVal);
        comp.transportFormatter = undefined;
        comp.startDate = "TODAY";
        comp.localeFormatter = localeFormatter;

        comp.update();
        expect(comp.localeFormatter.parse.calls.count()).toEqual(1);
      });

      it("inits min constrainst properly from date", function() {
        dashboard.getParameterValue.and.returnValue(testVal);
        comp.transportFormatter = undefined;
        comp.startDate = "2001-01-01";
        comp.localeFormatter = localeFormatter;

        comp.update();
        expect(comp.localeFormatter.parse.calls.count()).toEqual(2);
      });

      it("inits max constrainst properly from TODAY", function() {
        dashboard.getParameterValue.and.returnValue(testVal);
        comp.transportFormatter = undefined;
        comp.endDate = "TODAY";
        comp.localeFormatter = localeFormatter;

        comp.update();
        expect(comp.localeFormatter.parse.calls.count()).toEqual(1);
      });

      it("inits max constrainst properly from date", function() {
        dashboard.getParameterValue.and.returnValue(testVal);
        comp.transportFormatter = undefined;
        comp.endDate = "2001-01-01";
        comp.localeFormatter = localeFormatter;

        comp.update();
        expect(comp.localeFormatter.parse.calls.count()).toEqual(2);
      });
    });

    describe("getValue", function() {
      it("should return formatted value", function() {
        var testVal = "2011-11-11";
        var testFormattedVal = "formatted_";
        var dijitId = "test_id";
        var comp = new DojoDateTextBoxComponent();
        comp.dijitId = dijitId;
        var dijitElement = jasmine.createSpyObj("dijitElement", [ "get" ]);
        dijitElement.get.and.returnValue(testVal);
        spyOn(registry, "byId").and.returnValue(dijitElement);
        var transportFormatter = jasmine.createSpyObj("transportFormatter", [ "format" ]);
        transportFormatter.format.and.callFake(function(val) {
          return testFormattedVal + val;
        });
        comp.transportFormatter = transportFormatter;

        var value = comp.getValue();

        expect(value).toBe(testFormattedVal + testVal);
        expect(registry.byId).toHaveBeenCalledWith(dijitId);
        expect(dijitElement.get).toHaveBeenCalledWith('value');
        expect(transportFormatter.format).toHaveBeenCalledWith(testVal);

        comp.transportFormatter = undefined;
        comp.dateFormat = "y-mm-dd";
        dijitElement.get.and.returnValue("01-04-14");

        var localeFormatter = jasmine.createSpyObj("localeFormatter", [ "format" ]);
        localeFormatter.format.and.callFake(function(val) {
          return "01-04-14";
        });
        comp.localeFormatter = localeFormatter;
        spyOn(comp, "_isLegacyDateFormat").and.callThrough();
        spyOn(comp, "_convertFormat").and.callThrough();
        value = comp.getValue();
        expect(comp._isLegacyDateFormat).not.toHaveBeenCalled();
        expect(comp._convertFormat).not.toHaveBeenCalled();
      });
    });

    describe("_convertFormat", function(){
      var comp;
      beforeEach(function(){
        comp = new DojoDateTextBoxComponent();
      });

      it("converts the jquery format to dojo properly", function(){
        var testFormat = function(initialFormat, newFormat){
          comp.dateFormat = initialFormat;
          comp._convertFormat();
          expect(comp.dateFormat).toEqual(newFormat);
        };

        testFormat("MMo", "MMMMD");
        testFormat("MMoo", "MMMMDD");
        testFormat("MM ooo", "MMMM DDD");
        testFormat("MM D ooo", "MMMM EEE DDD");
        testFormat("DD ooo", "EEEE DDD");
      });
    });

    describe("_isLegacyDateFormat", function(){
      beforeEach(function(){
        comp = new DojoDateTextBoxComponent();
      });

      it("properly identifies legacy formats", function(){
        var testLegacy = function(format, legacy){
          comp.dateFormat = format;
          expect(comp._isLegacyDateFormat()).toEqual(legacy);
        };

        testLegacy("yy-mm-dd", false);
        testLegacy("yyyy/mm MM/dd", false);
        testLegacy("yMMdd", false);
        testLegacy("MMyydd", false);
        testLegacy("MMo", true);
        testLegacy("MMoo", true);
        testLegacy("MM ooo", true);
        testLegacy("M D", false);
        testLegacy("MM D ooo", true);
        testLegacy("DD ooo", true);
      });
    });

    describe("_updateTimeAndNotify", function() {
      var comp;
      var testId = "test_id";
      var testDate;
      var dashboard;
      var dijitDate, dijitHour, dijitMinute, dijitSecond;

      beforeEach(function() {
        comp = new DojoDateTextBoxComponent();
        comp.name = "test_name";
        comp.dijitId = testId;
        
        // Create test date object
        testDate = new Date(2025, 7, 18, 10, 30, 45);
        
        // Mock dijit widgets
        dijitDate = jasmine.createSpyObj("dijitDate", ["get"]);
        dijitDate.get.and.returnValue(testDate);
        
        dijitHour = jasmine.createSpyObj("dijitHour", ["get"]);
        dijitHour.get.and.returnValue("10");
        
        dijitMinute = jasmine.createSpyObj("dijitMinute", ["get"]);
        dijitMinute.get.and.returnValue("30");
        
        dijitSecond = jasmine.createSpyObj("dijitSecond", ["get"]);
        dijitSecond.get.and.returnValue("45");
        
        // Mock registry.byId
        spyOn(registry, "byId").and.callFake(function(id) {
          if (id === testId) return dijitDate;
          if (id === testId + '_hour') return dijitHour;
          if (id === testId + '_minute') return dijitMinute;
          if (id === testId + '_second') return dijitSecond;
          return null;
        });
        
        // Mock jQuery val function for AM/PM selector
        spyOn($.fn, "val").and.returnValue("AM");
        
        // Create dashboard mock
        dashboard = jasmine.createSpyObj("dashboard", ["processChange"]);
        comp.dashboard = dashboard;
        
        // Mock _getFormattedDate
        spyOn(comp, "_getFormattedDate").and.returnValue("2025-08-18 10:30:45");
      });

      it("should update hour and call processChange", function() {
        comp._updateTimeAndNotify(11, "hour");
        
        expect(testDate.getHours()).toBe(11);
        expect(testDate.getMinutes()).toBe(30);
        expect(testDate.getSeconds()).toBe(45);
        expect(comp.dashboard.processChange).toHaveBeenCalledWith("test_name", "2025-08-18 10:30:45");
      });

      it("should update minute and call processChange", function() {
        comp._updateTimeAndNotify(45, "minute");
        
        expect(testDate.getHours()).toBe(10);
        expect(testDate.getMinutes()).toBe(45);
        expect(testDate.getSeconds()).toBe(45);
        expect(comp.dashboard.processChange).toHaveBeenCalledWith("test_name", "2025-08-18 10:30:45");
      });

      it("should update second and call processChange", function() {
        comp._updateTimeAndNotify(15, "second");
        
        expect(testDate.getHours()).toBe(10);
        expect(testDate.getMinutes()).toBe(30);
        expect(testDate.getSeconds()).toBe(15);
        expect(comp.dashboard.processChange).toHaveBeenCalledWith("test_name", "2025-08-18 10:30:45");
      });

      it("should convert 12-hour AM/PM to 24-hour format", function() {
        // Test PM conversion (add 12 to hours < 12)
        $.fn.val.and.returnValue("PM");
        
        comp._updateTimeAndNotify("PM", "ampm");
        
        expect(testDate.getHours()).toBe(22); // 10 PM = 22:00
        expect(comp.dashboard.processChange).toHaveBeenCalledWith("test_name", "2025-08-18 10:30:45");
        
        // Test 12 AM special case (should be 0 in 24-hour format)
        dijitHour.get.and.returnValue("12");
        $.fn.val.and.returnValue("AM");
        
        comp._updateTimeAndNotify("AM", "ampm");
        
        expect(testDate.getHours()).toBe(0); // 12 AM = 00:00
        expect(comp.dashboard.processChange).toHaveBeenCalledWith("test_name", "2025-08-18 10:30:45");
        
        // Test 12 PM special case (should remain 12 in 24-hour format)
        dijitHour.get.and.returnValue("12");
        $.fn.val.and.returnValue("PM");
        
        comp._updateTimeAndNotify("PM", "ampm");
        
        expect(testDate.getHours()).toBe(12); // 12 PM = 12:00
        expect(comp.dashboard.processChange).toHaveBeenCalledWith("test_name", "2025-08-18 10:30:45");
      });

      it("should not update if values are missing", function() {
         dijitHour.get.and.returnValue(null);
         dijitMinute.get.and.returnValue(null);
         dijitSecond.get.and.returnValue(null);
         $.fn.val.and.returnValue(null);
         comp._updateTimeAndNotify(null, "hour");
         expect(testDate.getHours()).toBe(10); // Should not change
         expect(testDate.getMinutes()).toBe(30);
         expect(testDate.getSeconds()).toBe(45);
         expect(comp.dashboard.processChange).not.toHaveBeenCalled();
     });
    });
  });
});
