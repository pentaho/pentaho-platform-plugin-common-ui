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

define(['common-ui/prompting/builders/LabelBuilder'], function(LabelBuilder) {

  describe("LabelBuilder", function() {

    var args;
    var labelBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { }
        },
        param:  {
          values: { },
          attributes: { },
          name: 'label-test'
        }
      };
      labelBuilder = new LabelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(labelBuilder.build).toThrow();
    });

    it("should return a TextComponent", function() {
      var component = labelBuilder.build(args);
      expect(component.type).toBe('TextComponent');
      expect(component.expression()).toEqual(args.param.name);
    });

  });

});
