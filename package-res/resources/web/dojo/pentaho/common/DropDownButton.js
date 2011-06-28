dojo.provide("pentaho.common.DropDownButton");

dojo.require("dijit.form.DropDownButton");

dojo.declare("pentaho.common.DropDownButton",
	dijit.form.DropDownButton,
	{

	baseClass : "dijitDropDownButton",

	templateString: dojo.cache("pentaho.common" , "DropDownButton.html")

    }
);

