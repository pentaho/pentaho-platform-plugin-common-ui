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


define("common-ui/prompting/components/ParameterPanelComponent", ['./PanelComponent'], function(PanelComponent){
  return PanelComponent.extend({
    getClassFor: function (component) {
      if (component.promptType === 'label') {
        return 'parameter-label';
      }
    },

    removeErrorClass: function(){
      var $htmlObject = this.placeholder();
      $htmlObject.removeClass('error');
    },

    addErrorClass: function(){
      var $htmlObject = this.placeholder();
      $htmlObject.addClass('error');
    },

    addErrorLabel: function(errComponent){
      var $htmlObject = this.placeholder();
      if(!errComponent)
        return;

      var errorLabelHtml = '<div id="' + errComponent.htmlObject + '" class="parameter-label"></div>';

      if($("#" + this.htmlObject + " > div").length > 1)
        $("#" + this.htmlObject + " > div:nth-child(1)").after(errorLabelHtml);
    }
  });
});
