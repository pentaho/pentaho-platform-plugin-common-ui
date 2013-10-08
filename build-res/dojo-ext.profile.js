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

dependencies = {
  layers:
      [
 // includes our custom Dojo artifacts
        {
          //place the file under dojoRootDir
          name: "dojo-ext.js",
          layerDependencies:
              [
              ],
          dependencies:
              [
                "dojo",
                "dojo.parser",
                "dojo.store",
                "dojo.store.Memory",
                "dojo.store.DataStore",
                "dojo.data",
                "dojo.data.ObjectStore",
                "dijit.dijit-all",
                "dojo.cldr",
                "dojo.dnd.Container",
                "dojo.dnd.Selectors",
                "dojo.dnd.Source",
                "dojo.dnd.move",
                "dojo.dnd.Avatar",
                "dojo.dnd.Manager",
                "dojox.html.entities",
                "dojox.parser",
                "dojox.fx.Shadow",
                "dojox.widget.ColorPicker",
                "dojox.storage",
                "dojox.xml.parser",
                "dojox.fx",
                "dojox.collections.Dictionary",
                "dojox.collections.Stack",
                "dojox.collections.ArrayList",
                "dojox.dnd",
                "dojox.encoding",
                "dojox.color",
                "dojox.css3",
                "dojox.form",
                "dojox.color",
                "dojox.gfx",
                "dojox.gfx.svg",
                "dojox.gfx3d",
                "dojox.grid",
                "dojox.highlight",
                "dojox.lang",
                "dojox.layout",
                "dojox.math",
                "dojox.storage",
                "dojox.widget",
                "dojox.xml",
                "dojox.layout.ResizeHandle",
                "dojox.layout.ContentPane",
                "dojox.layout.ScrollPane",
                "dojox.layout.RadioGroup",
                "dojox.layout.ExpandoPane",
                "dojox.testing.DocTest",
                "pentaho.common.state",
                "pentaho.common.button",
                "pentaho.common.Calendar",
                "pentaho.common.CheckedMenuItem",
                "pentaho.common.ComboColorPicker",
                "pentaho.common.ContextHelp",
                "pentaho.common.CustomColorPicker",
                "pentaho.common.datasourceselect",
                "pentaho.common.DateTextBox",
                "pentaho.common.Dialog",
                "pentaho.common.DisclosurePanel",
                "pentaho.common.DropDownBox",
                "pentaho.common.DropDownButton",
                "pentaho.common.FieldList",
                "pentaho.common.FilterDialog",
                "pentaho.common.FilterIndicator",
                "pentaho.common.GlassPane",
                "pentaho.common.ListBox",
                "pentaho.common.ListItem",
                "pentaho.common.Menu",
                "pentaho.common.MenuItem",
                "pentaho.common.MenuSeparator",
                "pentaho.common.MessageBox",
                "pentaho.common.Messages",
                "pentaho.common.Overrides",
                "pentaho.common.PopupMenuItem",
                "pentaho.common.SectionHeader",
                "pentaho.common.Select",
                "pentaho.common.SmallImageButton",
                "pentaho.common.SplashScreen",
                "pentaho.common.TabSet",
                "pentaho.common.TemplatePicker",
                "pentaho.common.TemplatePickerEmbed",
                "pentaho.common.ToggleButton",
                "pentaho.common.GroupToggleButton",
                "pentaho.common.propertiesPanel.Panel",
                "pentaho.common.propertiesPanel.Configuration",
                "pentaho.common.FieldsetPane",
                "pentaho.common.DisableablePanel"
              ]
        }
      ],

  prefixes: [
    ["dijit", "../dijit"],
    ["dojox", "../dojox"]
  ]

}
