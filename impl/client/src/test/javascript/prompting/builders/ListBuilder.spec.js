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

define(['common-ui/prompting/builders/ListBuilder'], function(ListBuilder) {

  describe("ListBuilder", function() {

    var args;
    var listBuilder;

    beforeEach(function() {
      args = {
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
