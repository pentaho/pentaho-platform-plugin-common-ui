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

dojo.provide("pentaho.common.TabSet");
/**
 * Creates a list of fields from a 
 */
dojo.declare(
    "pentaho.common.TabSet",
    [dijit._Widget, dijit._Templated],
    {
        templateString: '<div dojoAttachPoint="tabSetDiv" style="margin-right: 0px"></div>',
        
        tabs: [],
        
        stackContainerId: null,
        
        setTabs: function( tabs ) {
          
            if(this.tabSetDiv.childNodes.length>0) {
                // we already have tabs
                return;
            }
                
            this.tabs = tabs;
            var html = "";
            dojo.addClass(this.tabSetDiv, 'pentaho-tabBar');
            for(var idx=0; idx<this.tabs.length; idx++) {
                var div = dojo.create('div', {}, this.tabSetDiv);
                dojo.attr( div, 'tabId', this.tabs[idx].id);
                this.tabs[idx].element = div;
                dojo.addClass(div, 'pentaho-tabWidget');
                if(idx == 0) {
                    dojo.addClass(div, 'pentaho-tabWidget-selected');
                }
                var span = dojo.create('span', {}, div);
                dojo.addClass(span, 'pentaho-tabWidgetLabel', div);
                dojo.attr( span, 'tabId', this.tabs[idx].id);
                span.innerHTML = this.tabs[idx].title;
                dojo.connect(div, 'onclick', this, this.tabClicked);
            }
        },

        tabClicked: function(event) {
            var tabId = dojo.attr( event.target, 'tabId');
            this.setSelectedTab(tabId);
        },

        setSelectedTab: function(tabId) {
            // find this tab
            for(var idx=0; idx<this.tabs.length; idx++) {
                if(this.tabs[idx].id == tabId) {
                    // set this tab using the index
                    this.setSeletedTabIdx(idx);
                }
            }
        },
        
        setSeletedTabIdx: function(tabIdx) {
            var panelId = this.tabs[tabIdx].id;
            for(var idx=0; idx<this.tabs.length; idx++) {
                if(tabIdx == idx) {
                    dojo.addClass(this.tabs[idx].element, 'pentaho-tabWidget-selected');
                } else {
                    dojo.removeClass(this.tabs[idx].element, 'pentaho-tabWidget-selected');
                }
            }
            if(this.tabs[tabIdx].beforeCallback) {
              this.tabs[tabIdx].beforeCallback(this.tabs[tabIdx]);
            }
            if(this.stackContainerId) {               
                dijit.byId(this.stackContainerId).selectChild(panelId, false);
            }
            if(this.tabs[tabIdx].afterCallback) {
              this.tabs[tabIdx].afterCallback(this.tabs[tabIdx]);
            }
        }
        
    }
);
