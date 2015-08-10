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
define(['common-ui/prompting/builders/TextAreaBuilder'], function(TextAreaBuilder) {

  describe("TextAreaBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { }
      }, 
      param:  {
        values: { },
        attributes: { }
      }
    };

    var textAreaBuilder;

    beforeEach(function() {
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
    xit("should fire a change in the dashboard on enter keypress", function() {
      var component = textAreaBuilder.build(args);
      component.dashboard = { 
        processChange: function() { },
        getParameterValue: function() { return 'test' }
      };
      component.htmlObject = 'test';
      var ph = $('<div>').attr('id', component.htmlObject);
      $('body').append(ph);

      component.update();  

      spyOn(component.dashboard, 'processChange');
      $('textarea', component.ph).trigger(jQuery.Event( 'keypress', { which: 13 } ));

      expect(component.dashboard.processChange).toHaveBeenCalled();
      
      ph.remove();
    });

    //check if it needs to go to CDF
    xit("should fire a change in the dashboard on focusout", function() {
      var component = textAreaBuilder.build(args);
      component.dashboard = { 
        processChange: function() { },
        getParameterValue: function() { return 'test' }
      };
      component.htmlObject = 'test';
      var ph = $('<div>').attr('id', component.htmlObject);
      $('body').append(ph);

      component.update();  

      spyOn(component.dashboard, 'processChange');
      $('textarea', component.ph).trigger(jQuery.Event( 'focusout', { } ));

      expect(component.dashboard.processChange).toHaveBeenCalled();
      
      ph.remove();
    });
  
  });

});
