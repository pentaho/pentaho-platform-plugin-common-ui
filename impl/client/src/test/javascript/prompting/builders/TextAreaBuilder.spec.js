/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
define(['common-ui/prompting/builders/TextAreaBuilder', 'common-ui/jquery-clean'], function(TextAreaBuilder, $) {

  describe("TextAreaBuilder", function() {

    var args;

    var textAreaBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { return "12345" },
          getParameterName: function() { }
        },
        param:  {
          values: { },
          attributes: { }
        }
      };

      textAreaBuilder = new TextAreaBuilder();
      spyOn(textAreaBuilder, '_createFormatter').and.returnValue(null);
      spyOn(textAreaBuilder, '_createDataTransportFormatter').and.returnValue(null);
    });

    it("should throw an error building component with no parameters", function() {
      expect(textAreaBuilder.build).toThrow();
    });

    it("should return a TextAreaComponent", function() {
      var component = textAreaBuilder.build(args);
      expect(component.type).toBe('TextareaInputComponent');
    });

    //check if it needs to go to CDF
    it("should fire a change in the dashboard on enter keypress", function() {
      var component = textAreaBuilder.build(args);
      component.dashboard = {
        processChange: function() { },
        getParameterValue: function() { return 'test' }
      };

      var ph = $('<div>').attr('id', component.htmlObject);
      $('body').append(ph);

      component.update();
      component.postExecution();

      spyOn(component.dashboard, 'processChange');
      $('textarea', component.ph).trigger($.Event( 'keypress', { which: 13 } ));

      expect(component.dashboard.processChange).toHaveBeenCalled();

      ph.remove();
    });

    //check if it needs to go to CDF
    it("should fire a change in the dashboard on focusout", function() {
      var component = textAreaBuilder.build(args);
      component.dashboard = {
        processChange: function() { },
        getParameterValue: function() { return 'test' }
      };

      var ph = $('<div>').attr('id', component.htmlObject);
      $('body').append(ph);

      component.update();
      component.postExecution();

      spyOn(component, 'getValue');
      $('textarea', component.ph).trigger($.Event( 'focusout', { } ));

      expect(component.getValue).toHaveBeenCalled();

      ph.remove();
    });

    it("should get value of component with no formatter present", function() {
      var component = textAreaBuilder.build(args);
      var parameterValue = 'test';
      component.dashboard = {
        processChange: function() { },
        getParameterValue: function() { return parameterValue }
      };

      var ph = $('<div>').attr('id', component.htmlObject);
      $('body').append(ph);

      component.update();
      component.postExecution();

      expect(component.getValue()).toBe(parameterValue);

      ph.remove();
    });

    it("should get value of component with formatter present", function() {
      var component = textAreaBuilder.build(args);
      var parameterValue = 'test';
      component.dashboard = {
        processChange: function() { },
        getParameterValue: function() { return parameterValue; }
      };
      component.formatter = {
        parse: function() { return parameterValue; }
      };
      component.transportFormatter = {
        format: function(arg) { return arg; }
      }

      var ph = $('<div>').attr('id', component.htmlObject);
      $('body').append(ph);

      component.update();
      component.postExecution();

      expect(component.getValue()).toBe(parameterValue);

      ph.remove();
    });

  });

});
