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

define(['common-ui/prompting/builders/ValueBasedParameterWidgetBuilder'], function(ValueBasedParameterWidgetBuilder) {

  describe("ValueBasedParameterWidgetBuilder", function() {

    var args;

    var valueBasedParameterWidgetBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { }
        },
        param:  {
          values: []
        }
      };

      valueBasedParameterWidgetBuilder = new ValueBasedParameterWidgetBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(valueBasedParameterWidgetBuilder.build).toThrow();
    });

    it("should return build successfully", function() {
      var component = valueBasedParameterWidgetBuilder.build(args);
      expect(component.valuesArray.length == 0).toBeTruthy();
    });

    it("should return build successfully and have a values array", function() {
      args.param.values = [
        { label: 'test 1', value: 'value test 1' },
        { label: 'test 2', value: 'value test 2' }
      ];
      var component = valueBasedParameterWidgetBuilder.build(args);
      expect(component.valuesArray.length).toBe(2);
    });

  });

});
