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
        spyOn(registry, "byId").and.returnValue(dijitElement);
        comp = new DojoDateTextBoxComponent();
      });

      it("should not clear if not exist dijitId", function() {
        comp.clear();

        expect(comp.dijitId).not.toBeDefined();
        expect(registry.byId).not.toHaveBeenCalled();
        expect(dijitElement.destroyRecursive).not.toHaveBeenCalled();
      });

      it("should destroy element", function() {
        var dijitId = "test_id";
        comp.dijitId = dijitId;

        comp.clear();

        expect(comp.dijitId).not.toBeDefined();
        expect(registry.byId).toHaveBeenCalledWith(dijitId);
        expect(dijitElement.destroyRecursive).toHaveBeenCalled();
      });

      it("should destroy element and remove change handler", function() {
        var dijitId = "test_id";
        comp.dijitId = dijitId;
        comp.onChangeHandle = changeHandler;

        comp.clear();

        expect(comp.dijitId).not.toBeDefined();
        expect(changeHandler.remove).toHaveBeenCalled();
        expect(registry.byId).toHaveBeenCalledWith(dijitId);
        expect(dijitElement.destroyRecursive).toHaveBeenCalled();
      });
    });

    describe("update", function() {
      var testId = "test_id";
      var testParam = "test_param";
      var testVal = "test_val";
      var parsedVal = "parsed_";
      var comp;
      var transportFormatter;
      var dashboard;

      beforeEach(function() {
        dashboard = jasmine.createSpyObj("dashboard", [ "getParameterValue" ]);
        dashboard.getParameterValue.and.returnValue(testVal);
        transportFormatter = jasmine.createSpyObj("transportFormatter", [ "parse" ]);
        transportFormatter.parse.and.callFake(function(val) {
          return parsedVal + val;
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
        spyOn($.fn, 'html');
        spyOn($.fn, 'attr');
        spyOn(comp, "_doAutoFocus");
      });

      it("should init date text box", function() {
        comp.update();

        expect(dashboard.getParameterValue).toHaveBeenCalledWith(testParam);
        expect(transportFormatter.parse).toHaveBeenCalledWith(testVal);
        expect(comp.dijitId).toBe(testId + '_input');
        expect($.fn.html).toHaveBeenCalled();
        expect($.fn.attr).toHaveBeenCalledWith('id', comp.dijitId);
        expect(comp.onChangeHandle).toBeDefined();
        expect(comp._doAutoFocus).toHaveBeenCalled();
      });
    });

    describe("getValue", function() {
      it("should return formatted value", function() {
        var testVal = "test_val";
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
      });
    });
  });
});
