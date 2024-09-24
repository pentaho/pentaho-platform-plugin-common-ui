/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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
