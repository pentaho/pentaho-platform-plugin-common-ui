dojo.provide("pentaho.common.TextButtonCombo");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
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
      	this.submitButton.set('label', value);
      }
      else if(property == 'text' || property == 'value') {
        this.textInput.set('value', value);
      }
      else if(property == 'textPlaceHolder') {
        this.textInput.set('placeHolder', value);
      }
    },

    get: function(property){
      if(property == 'text' || property == 'value'){
        return this.textInput.get('value');
      }

      return null;
    },

    postCreate: function() {
      this.set('buttonLabel', this.buttonLabel);
      this.set('textPlaceHolder', this.textPlaceHolder);
    },

    _onSubmitButtonClick: function() {
      this.onClickCallback(this.textInput.get('value')); // pass the value of the textbox
    },

    onClickCallback: function(value) {
      console.log("onClickCallback..."); // should override this
    },

    _onTextInputChange: function() {
      this.onChangeCallback(this.textInput.get('value')); // pass the value of the textbox
    },

    onChangeCallback: function(value) {
      console.log("onChangeCallback..."); // should override this
    }
  }
);