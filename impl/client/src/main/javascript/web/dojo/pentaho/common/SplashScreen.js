/*!
* Copyright 2010 - 2024 Hitachi Vantara.  All rights reserved.
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
define([
  "dojo/_base/declare",
  "dijit/_WidgetBase",
  "dijit/_Templated",
  "dojo/on",
  "dojo/query",
  "pentaho/common/button",
  "pentaho/common/Dialog",
  "dojo/text!pentaho/common/SplashScreen.html",
  "common-ui/util/xss"
], function(declare, _WidgetBase, _Templated, on, query, button, Dialog, templateStr, xssUtil) {
  return declare("pentaho.common.SplashScreen", [Dialog], {
    buttons: ['ok'],
    imagePath: '',
    hasTitleBar: false,
    responsive: true, // Not intended to be set to false.
    responsiveClasses: "dw-sm",

    setTitle: function(title) {
      this.splashtitle.innerHTML = title;
    },

    setText: function(text) {
      xssUtil.setHtml(this.splashmessage, text);
    },

    setButtonText: function(text) {
      this.buttons[0] = text;
      xssUtil.setHtml(query("#button"+0, this.domNode), text);
    },

    templateString: templateStr,

    postCreate: function() {
      this.inherited(arguments);
    }
  });
});
