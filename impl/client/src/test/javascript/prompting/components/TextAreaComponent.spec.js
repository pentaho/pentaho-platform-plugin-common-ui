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


define([ 'common-ui/prompting/components/TextAreaComponent', 'cdf/dashboard/Utils', 'common-ui/jquery-clean' ],
  function(TextAreaComponent, Utils, $) {

    describe("TextAreaComponent", function() {
      var id = "test_id";
      var escapedValue = "escaped_";
      var comp;
      var dashboard;
      beforeEach(function() {
        dashboard = jasmine.createSpyObj("dashboard", [ "getParameterValue" ]);
        comp = new TextAreaComponent();
        comp.htmlObject = id;
        comp.dashboard = dashboard;
        spyOn(Utils, "escapeHtml").and.callFake(function(param) {
          return escapedValue + param;
        });
        spyOn(comp, "_doAutoFocus");
        spyOn($.fn, "html");
        spyOn($.fn, "change");
        spyOn($.fn, "keypress");
        spyOn($.fn, "focusout");
      });

      describe("update", function() {
        it("should update without value'", function() {
          comp.update();
          expect($.fn.html).toHaveBeenCalledWith('<textarea id="' + id + '-input"></textarea>');
          expect(Utils.escapeHtml).not.toHaveBeenCalled();
        });

        it("should update with value'", function() {
          var testValue = "test value";
          dashboard.getParameterValue.and.returnValue(testValue);
          comp.update();
          expect($.fn.html).toHaveBeenCalledWith(
            '<textarea id="' + id + '-input">' + escapedValue + testValue + '</textarea>');
          expect(Utils.escapeHtml).toHaveBeenCalledWith(testValue);

        });

        afterEach(function() {
          expect(dashboard.getParameterValue).toHaveBeenCalled();
          expect($.fn.change).toHaveBeenCalled();
          expect($.fn.keypress).toHaveBeenCalled();
          expect($.fn.focusout).toHaveBeenCalled();
          expect(comp._doAutoFocus).toHaveBeenCalled();
        });
      });

      describe("getValue", function() {
        var testValue = "test value";
        var formattedValue = "formatted ";
        var parsedValue = "parsed ";
        var formatter;
        var transportFormatter;
        beforeEach(function() {
          formatter = jasmine.createSpyObj("formatter", [ "parse" ]);
          formatter.parse.and.callFake(function(param) {
            return parsedValue + param;
          });
          transportFormatter = jasmine.createSpyObj("transportFormatter", [ "format" ]);
          transportFormatter.format.and.callFake(function(param) {
            return formattedValue + param;
          });
          comp.transportFormatter = transportFormatter;
          spyOn($.fn, "val").and.returnValue(testValue);
        });

        it("should return formatted value'", function() {
          comp.formatter = formatter;
          var value = comp.getValue();
          expect(value).toBe(formattedValue + parsedValue + testValue);
        });

        it("should return not formatted value'", function() {
          var value = comp.getValue();
          expect(value).toBe(testValue);
        });

        afterEach(function() {
          expect($.fn.val).toHaveBeenCalled();
        });
      });
    });
  });