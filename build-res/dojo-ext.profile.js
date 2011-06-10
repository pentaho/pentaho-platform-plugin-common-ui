    dependencies = {
    layers:
    [
    //This layer is used to discard modules
    //from the dojo package.



    //This layer is used to discard modules
    //from the dijit package.

    //Custom layer mydojo.js which
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
	"dojo.cldr",
    "dojox.storage",
    "dojox.html.entities",
	"dojox.fx.Shadow",
    "dijit._Widget",
    "dijit._Templated",
    "dijit.common",
    "dijit.Dialog",
    "dijit.layout.TabContainer",
    "dijit.layout.ContentPane",
    "dijit.layout.BorderContainer",
    "dijit.form.Button",
    "dijit.form.CheckBox",
    "dijit.form.DateTextBox",
    "dijit.form.NumberTextBox",
    "dijit.form.TextBox",
    "dijit.form.Select",
    "dijit.form.MultiSelect",
    "dijit.Toolbar",
    "dijit.Editor",
    "dijit.ColorPalette",
    "dijit.ProgressBar",
    "dijit.Tooltip",
    "dijit.layout.TabContainer",
    "dojo.dnd.Container",
    "dojo.dnd.Selectors",
	"dojo.dnd.Source",
	"dojo.dnd.move",
    "dojo.dnd.Avatar",
    "dojo.dnd.Manager",
    "dojox.widget.ColorPicker"
    ]
    }
    ],

    prefixes: [
    ["dijit", "../dijit"],
    ["dojox", "../dojox"]
    ]

    }