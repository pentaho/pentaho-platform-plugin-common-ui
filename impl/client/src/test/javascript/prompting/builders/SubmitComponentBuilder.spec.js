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

define(['common-ui/prompting/builders/SubmitComponentBuilder'], function(SubmitComponentBuilder) {

  describe("SubmitComponentBuilder", function() {

    var args;

    var submitComponentBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { },
          getString: function() { }
        },
        param:  {
          values: { },
          attributes: { }
        }
      };
      submitComponentBuilder = new SubmitComponentBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(submitComponentBuilder.build).toThrow();
    });

    it("should return a SubmitPromptComponent", function() {
      var component = submitComponentBuilder.build(args);
      expect(component.type).toBe('SubmitPromptComponent');
    });

    it("should return default label values", function() {
      var component = submitComponentBuilder.build(args);
      expect(component.label).toEqual('submitButtonLabel');
      expect(component.autoSubmitLabel).toEqual('autoSubmitLabel');
    });

  });

});
