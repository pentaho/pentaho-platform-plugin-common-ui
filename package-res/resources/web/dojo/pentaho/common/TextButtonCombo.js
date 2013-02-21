dojo.require("dijit.form.TextBox");
dojo.require("pentaho.common.button");
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare("pentaho.common.TextButtonCombo",
  [dijit._Widget, dijit._Templated],  {

  	templateString: dojo.cache("pentaho.common","TextButtonCombo.html"),
    widgetsInTemplate: true,

    buttonLabel: 'Submit',
    textPlaceHolder: 'Enter Text',

    set: function(property, value) {
      if(property == 'buttonLabel') {
      	this.submitButton.set('buttonLabel', value);
      }
      else if(property == 'textPlaceHolder') {
        this.textInput.set('textPlaceHolder', value);
      }
    },

    postCreate: function() {
      console.log('postCreate...');
    },

    _onSubmitButtonClick: function() {
    	if(callback){
    		callback();
    	}
    	else{
    		console.log('callback is not defined');
    	}
    },

    callback: null
  }
);