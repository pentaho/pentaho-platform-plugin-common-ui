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
define(['common-ui/prompting/builders/ListBuilder'], function(ListBuilder) {

  describe("ListBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { }
      }, 
      param:  {
        values: { },
        attributes: { },
        multiSelect: false
      }
    };

    var listBuilder;

    beforeEach(function() {
      listBuilder = new ListBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(listBuilder.build).toThrow();
    });

    it("should return a SelectComponent if multiSelect is set to false", function() {
      var component = listBuilder.build(args);
      expect(component.type).toBe('SelectComponent');
      expect(component.preExecution).toBeDefined();
    });

    it("should return a MultiSelectComponent if multiSelect is set to true", function() {
      args.param.multiSelect = true;
      var component = listBuilder.build(args);
      expect(component.type).toBe('SelectMultiComponent');
      expect(component.preExecution).toBeDefined();
    });

    it("should return a component with the specified number of items", function() {
      args.param.attributes['parameter-visible-items'] = 3;
      var component = listBuilder.build(args);
      expect(component.size).toEqual(args.param.attributes['parameter-visible-items']);
      expect(component.preExecution).toBeDefined();
    });

    it("should return a component with the changeMode set to 'immediate' when multiSelect is set to false", function() {
      args.param.multiSelect = false;
      var component = listBuilder.build(args);
      expect(component.changeMode).toEqual('immediate');
      expect(component.preExecution).toBeDefined();
    });

    it("should return a component with the changeMode set to 'timeout-focus' when multiSelect is set to true", function() {
      args.param.multiSelect = true;
      var component = listBuilder.build(args);
      expect(component.changeMode).toEqual('timeout-focus');
      expect(component.preExecution).toBeDefined();
    });

    it("should set defaultIfEmpty to false on preExecution for non-multi selects", function() {
      var component = listBuilder.build(args);
      spyOn(component, 'preExecution').and.callThrough();
      
      component.preExecution();
      expect(component.preExecution).toHaveBeenCalled();
      expect(component.defaultIfEmpty).toBeFalsy();
    });

  });

});