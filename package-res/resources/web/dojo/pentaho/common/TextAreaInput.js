dojo.provide("pentaho.common.TextAreaInput");
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
//dojo.require('dijit.form.Textarea');
//dojo.require("pentaho.common.button");

dojo.declare("pentaho.common.TextAreaInput",
  [dijit._Widget, dijit._Templated],  {
      
    getLocaleString: pentaho.common.Messages.getString,  
    templateString: dojo.cache("pentaho.common", "TextAreaInput.html"),
    //widgetsInTemplate: true,

    // widget properties
    width: null,
    height: null,
    okButtonLabel: null,
    cancelButtonLabel: null,
    text: null,
    titleText: null,
    model: null, // placeholder for a stateful model

    attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
      width : {
        node : 'textArea',
        type : 'attribute',
        attribute : 'width'
      },
      height : {
        node : 'textArea',
        type : 'attribute',
        attribute : 'height'
      },
      okButtonLabel: {
        node: 'okayButton',
        type: 'innerHTML'
      },
      cancelButtonLabel: {
        node: 'cancelButton',
        type: 'innerHTML'
      },
      titleText: {
        node: 'titleNode',
        type: 'innerHTML'
      },
      text: {
        node: 'textArea',
        type : 'attribute',
        attribute: 'value'
      }
    }),

    constructor: function() {
      this.inherited(arguments);
      this.okButtonLabel = this.getLocaleString('Ok');
      this.cancelButtonLabel = this.getLocaleString('Cancel');
    },
    
    postCreate: function() {
      this.container.titleNode = '';
    },

    _setWidthAttr : function(newWidth) {
      this.width = newWidth;
      this.container.style.width = newWidth;
      this.textArea.style.width = newWidth;
    },

    _setHeightAttr : function(newHeight) {
      this.height = newHeight;
      this.textArea.style.height = newHeight;
    },

    _getTextAttr : function() {
      this.text = this.textArea.value;
      return this.text;
    },

    onCancel: function() {
      // override hook
    },

    onSubmit: function() {
      // override hook
    }
  }
);
