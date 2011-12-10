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
                  "dojox.layout.RadioGroup"
              ]
        }
      ],

  prefixes: [
    ["dijit", "../dijit"],
    ["dojox", "../dojox"]
  ]

}