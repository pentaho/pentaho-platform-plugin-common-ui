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

dojo.provide('pentaho.common.SmallImageButton');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare(
    'pentaho.common.SmallImageButton',
    [dijit._Widget, dijit._Templated],
    {
        title : '',
          
        baseClass: '',
          
        callback: function() {},
        
        disabled: false,
        
        _imageSrc: dojo.moduleUrl("pentaho.common","images/spacer.gif"),
          
        onClick: function(event) {
        
            if(this.callback && !this.get('disabled')) {
                this.callback( event );
            }
        },
        
        templatePath: dojo.moduleUrl('pentaho.common', 'SmallImageButton.html'),
        
        mouseOver: function() {
            if(!this.disabled) {
                dojo.addClass(this.buttonImg, 'pentaho-imagebutton-hover');
            }
        },
        
        mouseOut: function() {
            if(!this.disabled) {
                dojo.removeClass(this.buttonImg, 'pentaho-imagebutton-hover');
            }
        },
        
        set: function( attr, value ) {
            this.inherited(arguments);
            if(attr == 'disabled') {
                this.disabled = value;
                dojo.toggleClass(this.buttonImg, 'pentaho-imagebutton-disabled', this.disabled);
                if( this.disabled ) {
                    this.buttonImg.title = '';
                } else {
                    this.buttonImg.title = this.title;
                }
            }
        },
        
        postMixInProperties: function() {
            this.inherited(arguments);
        },
        
        postCreate: function() {
            this.inherited(arguments);
            this.buttonImg.className = this.baseClass;
            dojo.toggleClass(this.buttonImg, 'pentaho-imagebutton-disabled', this.disabled);
            dojo.connect(this.buttonImg, "onclick", this, this.onClick);
            dojo.connect(this.buttonImg, "onmouseover", this, this.mouseOver);
            dojo.connect(this.buttonImg, "onmouseout", this, this.mouseOut);
        }
      }
);
