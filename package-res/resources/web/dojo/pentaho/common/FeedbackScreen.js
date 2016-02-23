/*!
* Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query",
"pentaho/common/button", "pentaho/common/Dialog", "dojo/text!pentaho/common/FeedbackScreen.html"],
    function(declare, _WidgetBase, _Templated, on, query, button, Dialog, templateStr){
      return declare("pentaho.common.FeedbackScreen", [Dialog],
     {
        buttons: ['ok'],

        imagePath: '',

        hasTitleBar: false,

        setTitle: function(title) {
            this.feedbacktitle.innerHTML = title;
        },

        setText: function(text) {
            this.feedbackmessage.innerHTML = text;
        },

        setText2: function(text) {
            this.feedbackmessage2.innerHTML = text;
        },

        setText3: function(text) {
            this.feedbackmessage3.innerHTML = text;
        },

        setButtonText: function(text) {
            this.buttons[0] = text;
            query("#button"+0, this.domNode).innerHTML = text;
        },
    
        templateString: templateStr,

       postCreate: function() {
           this.inherited(arguments);
       }

    }
);
    });
