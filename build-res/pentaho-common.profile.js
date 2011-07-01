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
    name: "pentaho-common.js",
    layerDependencies:
    [
    ],
    dependencies:
    [
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
    "pentaho.common.PopupMenuItem",
    "pentaho.common.SectionHeader",
    "pentaho.common.Select",
    "pentaho.common.SmallImageButton",
    "pentaho.common.SplashScreen",
    "pentaho.common.TabSet",
    "pentaho.common.TemplatePicker",
    "pentaho.common.ToggleButton"

    ]
    }
    ],

    prefixes: [
    ["dijit", "../dijit"],
    ["dojox", "../dojox"]
    ]

    }