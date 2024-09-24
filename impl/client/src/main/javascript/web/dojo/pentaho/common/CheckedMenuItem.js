/*!
* Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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


define(["dojo/_base/declare", "dijit/CheckedMenuItem","dojo/text!pentaho/common/CheckedMenuItem.html","dojo/dom-class"],
  function(declare, CheckedMenuItem, templateStr, domClass){
    return declare("pentaho.common.CheckedMenuItem",[CheckedMenuItem],
      {

        templateString: templateStr,

        _setCheckedAttr: function(/*Boolean*/ checked){
          // summary:
          //		Hook so attr('checked', bool) works.
          //		Sets the class and state for the check box.
          domClass.toggle(this.iconNode, "menuitem-checked", checked);
          this.domNode.setAttribute("checked", checked);
          this._set("checked", checked);
        },

        _setSelected: function(selected){
            if(!this.disabled) {
                domClass.toggle(this.domNode, "pentaho-menuitem-hover", selected);
            }
        }

      }
    );
  });
