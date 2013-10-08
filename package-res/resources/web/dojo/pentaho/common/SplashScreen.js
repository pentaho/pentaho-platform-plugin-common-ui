/*!
* Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
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

dojo.provide('pentaho.common.SplashScreen');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('pentaho.common.button');
dojo.require('pentaho.common.Dialog');
dojo.declare(
     'pentaho.common.SplashScreen',
     [pentaho.common.Dialog],
     {
        buttons: ['ok'],
        
        imagePath: '',
        
        hasTitleBar: false,
        
        setTitle: function(title) {
            this.splashtitle.innerHTML = title;
        },

        setText: function(text) {
            this.splashmessage.innerHTML = text;
        },
    
        setButtonText: function(text) {
            this.buttons[0] = text;
            dojo.query("#button"+0, this.domNode).innerHTML = text;
        },
    
        templatePath: dojo.moduleUrl('pentaho.common', 'SplashScreen.html'),
      
       postCreate: function() {
           this.inherited(arguments);
       }
       
    }
);
