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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dojo/dom-class", "dijit/registry", "dojo/dom-construct",
"dojo/_base/lang"],
    function(declare, _WidgetBase, _Templated, on, query, domClass, registry, construct, lang){
      return declare("pentaho.common.TabSet",
    [_WidgetBase, _Templated],
    {
        templateString: '<div data-dojo-attach-point="tabSetDiv" style="margin-right: 0px"></div>',
        
        tabs: [],
        
        stackContainerId: null,
        
        setTabs: function( tabs ) {
          
            if(this.tabSetDiv.childNodes.length>0) {
                // we already have tabs
                return;
            }
                
            this.tabs = tabs;
            var html = "";
            domClass.add(this.tabSetDiv, 'pentaho-tabBar');
            for(var idx=0; idx<this.tabs.length; idx++) {
                var div = construct.create('div', {}, this.tabSetDiv);
                div.setAttribute( 'tabId', this.tabs[idx].id);
                this.tabs[idx].element = div;
                domClass.add(div, 'pentaho-tabWidget');
                if(idx == 0) {
                    domClass.add(div, 'pentaho-tabWidget-selected');
                }
                var span = construct.create('span', {}, div);
                domClass.add(span, 'pentaho-tabWidgetLabel', div);
                span.setAttribute( 'tabId', this.tabs[idx].id);
                span.innerHTML = this.tabs[idx].title;
                on(div, 'click', lang.hitch(this, this.tabClicked));
            }
        },

        tabClicked: function(event) {
            var tabId = event.target.getAttribute( 'tabId');
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
                    domClass.add(this.tabs[idx].element, 'pentaho-tabWidget-selected');
                } else {
                    domClass.remove(this.tabs[idx].element, 'pentaho-tabWidget-selected');
                }
            }
            if(this.tabs[tabIdx].beforeCallback) {
              this.tabs[tabIdx].beforeCallback(this.tabs[tabIdx]);
            }
            if(this.stackContainerId) {               
                registry.byId(this.stackContainerId).selectChild(panelId, false);
            }
            if(this.tabs[tabIdx].afterCallback) {
              this.tabs[tabIdx].afterCallback(this.tabs[tabIdx]);
            }
        }
        
    });
    });
