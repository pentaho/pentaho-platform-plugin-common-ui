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
    "pentaho.common.Dialog",
    "pentaho.common.ContextHelp",
    "pentaho.common.MessageBox",
    "pentaho.common.datasourceselect",
    "pentaho.common.SplashScreen",
    "pentaho.common.FieldList",
    "pentaho.common.FilterDialog",
    "pentaho.common.FilterIndicator",
    "pentaho.common.TemplatePicker"
    ]
    }
    ],

    prefixes: [
    ["dijit", "../dijit"],
    ["dojox", "../dojox"]
    ]

    }