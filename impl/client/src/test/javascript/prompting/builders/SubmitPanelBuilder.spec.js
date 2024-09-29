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

define(['common-ui/prompting/builders/SubmitPanelBuilder'], function(SubmitPanelBuilder) {

  describe("SubmitPanelBuilder", function() {

    var args;

    var submitPanelBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { },
          getString: function() { },
          createWidgetForSubmitComponent: function() { }
        },
        param:  {
          values: { },
          attributes: { }
        }
      };
      submitPanelBuilder = new SubmitPanelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      var component;
      try {
        component = submitPanelBuilder.build();
      }
      catch(ex) {
      }
      expect(component).toBe(undefined);
    });

    it("should return a FlowPromptLayoutComponent", function() {
      var component = submitPanelBuilder.build(args);
      expect(component.type).toBe('FlowPromptLayoutComponent');
    });

  });

});
