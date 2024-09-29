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

define(['common-ui/prompting/builders/ParameterGroupPanelBuilder'], function(ParameterGroupPanelBuilder) {

  describe("ParameterGroupPanelBuilder", function() {

    var args;
    var parameterPanelBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { },
          paramDefn: {
            layout: ''
          }
        },
        param:  {
          values: { },
          attributes: { },
        },
        paramGroup: {
          name: ''
        }
      };
      parameterPanelBuilder = new ParameterGroupPanelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(parameterPanelBuilder.build).toThrow();
    });

    it("should return a HorizontalTableBasedPromptLayoutComponent when layout is 'horizontal'", function() {
      args.promptPanel.paramDefn.layout = 'horizontal';
      var component = parameterPanelBuilder.build(args);
      expect(component.type).toBe('HorizontalTableBasedPromptLayoutComponent');
    });

    it("should return a FlowPromptLayoutComponent when layout is 'flow'", function() {
      args.promptPanel.paramDefn.layout = 'flow';
      var component = parameterPanelBuilder.build(args);
      expect(component.type).toBe('FlowPromptLayoutComponent');
    });

    it("should return a VerticalTableBasedPromptLayoutComponent when layout is 'vertical'", function() {
      args.promptPanel.paramDefn.layout = 'vertical';
      var component = parameterPanelBuilder.build(args);
      expect(component.type).toBe('VerticalTableBasedPromptLayoutComponent');
    });

  });

});
