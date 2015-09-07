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

define([ 'cdf/lib/jquery', 'dijit/registry', 'common-ui/prompting/components/DojoDateTextBoxComponent' ], function($,
  registry, DojoDateTextBoxComponent) {

  describe("DojoDateTextBoxComponent", function() {

    describe("clear", function() {
      var comp;
      var dijitElement = jasmine.createSpyObj("dijitElement", [ "destroyRecursive" ]);
      var changeHandler = jasmine.createSpyObj("changeHandler", [ "remove" ]);
      beforeEach(function() {
        comp = new DojoDateTextBoxComponent();
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
        comp.update();
        
        expect(dashboard.getParameterValue).toHaveBeenCalledWith(testParam);
        expect(transportFormatter.parse).not.toHaveBeenCalled();
        expect(comp.dijitId).toBe(testId + '_input');
        expect($.fn.html).toHaveBeenCalled();
        expect($.fn.attr).toHaveBeenCalledWith('id', comp.dijitId);
        expect(comp._doAutoFocus).toHaveBeenCalled();
      });

      it("should init date text box with array param", function() {
        dashboard.getParameterValue.and.returnValue([testVal]);
        comp.update();

        expect(dashboard.getParameterValue).toHaveBeenCalledWith(testParam);
        expect(transportFormatter.parse).toHaveBeenCalledWith(testVal);
        expect(comp.dijitId).toBe(testId + '_input');
        expect($.fn.html).toHaveBeenCalled();
        expect($.fn.attr).toHaveBeenCalledWith('id', comp.dijitId);
        expect(comp._doAutoFocus).toHaveBeenCalled();
      });

      it("should init date text box with legacy date", function() {
        dashboard.getParameterValue.and.returnValue(testVal);
        comp.transportFormatter = undefined;
        comp.dateFormat = "yy-mm-dd";
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
      beforeEach(function(){
        comp = new DojoDateTextBoxComponent();
      });

      it("converts the jquery format to dojo properly", function(){
        var testFormat = function(initialFormat, newFormat){
          comp.dateFormat = initialFormat;
          comp._convertFormat();
          expect(comp.dateFormat).toEqual(newFormat);
        };

        testFormat("yy-mm-dd", "yyyy-MM-dd");
        testFormat("yyyy/mm MM/dd", "yyyy/MM MMMM/dd");
        testFormat("yMMdd", "yyMMMMdd");
        testFormat("MMyydd", "MMMMyyyydd");
        testFormat("MMo", "MMMMD");
        testFormat("MMoo", "MMMMDD");
        testFormat("MM ooo", "MMMM DDD");
        testFormat("M D", "MMM EEE");
        testFormat("MM D ooo", "MMMM EEE DDD");
        testFormat("DD ooo", "EEEE DDD");
      });
    });
  });
});
