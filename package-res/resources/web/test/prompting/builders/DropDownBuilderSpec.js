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
define(['common-ui/prompting/builders/DropDownBuilder'], function(DropDownBuilder) {

  describe("DropDownBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { },
        paramDefn: {
          ignoreBiServer5538: true
        }
      }, 
      param:  {
        values: { },
        attributes: { },
        hasSelection: function() { return true; }
      }
    };

    var dropDownBuilder;

    beforeEach(function() {
      dropDownBuilder = new DropDownBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(dropDownBuilder.build).toThrow();
    });

    it("should return a SelectComponent", function() {
      var component = dropDownBuilder.build(args);
      expect(component.type).toBe('SelectComponent');
      expect(component.preExecution).toBeDefined();
    });

    it("should create an empty selection if no value is selected", function() {
      spyOn(args.param, 'hasSelection').and.returnValue(false);

      var component = dropDownBuilder.build(args);
      expect(args.param.hasSelection).toHaveBeenCalled();
      expect(component.valuesArray.length > 0).toBeTruthy();
      expect(component.valuesArray[0][0]).toEqual("");
      expect(component.valuesArray[0][1]).toEqual("");
    });

    it("should create an empty selection at the end if no value is selected", function() {
      spyOn(args.param, 'hasSelection').and.returnValue(false);

      args.param.values = [
        { label: "banana", value: "banana" }
      ];

      var component = dropDownBuilder.build(args);
      expect(args.param.hasSelection).toHaveBeenCalled();
      expect(component.valuesArray.length > 0).toBeTruthy();
      expect(component.valuesArray[1][0]).toEqual("");
      expect(component.valuesArray[1][1]).toEqual("");
    });

    it ("should set defaultIfEmpty to true for non-multi select on preExecution", function() {
      var component = dropDownBuilder.build(args);

      spyOn(component, 'preExecution').and.callThrough();     
      component.preExecution();
      expect(component.preExecution).toHaveBeenCalled();
      expect(component.defaultIfEmpty).toBeFalsy();
    });

  });

});
