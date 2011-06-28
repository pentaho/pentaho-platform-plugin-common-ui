dojo.provide("pentaho.common.DateTextBox");

dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.Calendar");

dojo.declare("pentaho.common.DateTextBox",
	[dijit.form.DateTextBox],
	{

		templateString: dojo.cache("pentaho.common", "DropDownBox.html"),

		popupClass: "pentaho.common.Calendar"

    }
);

