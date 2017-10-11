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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/_base/lang", "dojo/text!pentaho/common/button.html", "dojo/on"],
  function(declare, _WidgetBase, _Templated, lang, templateStr, on){
    return declare("pentaho.common.button",
      [_WidgetBase, _Templated],
      {
          label : 'a button',

          onClick: function() {
              this.callback();
          },

          callback: null,

          templateString: templateStr,

          postMixInProperties: function() {
              this.inherited(arguments);
          },

          postCreate: function() {
              this.inherited(arguments);
              on(this.button, "click", lang.hitch( this,  this.onClick));
          }
        }
    );
});
