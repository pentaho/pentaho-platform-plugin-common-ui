dojo.provide("pentaho.common.Menu");

dojo.declare("pentaho.common.Menu",
	dijit.Menu,
	{
        baseClass: "pentaho-menu",

		templateString: dojo.cache("pentaho.common", "Menu.html")
    }
);

