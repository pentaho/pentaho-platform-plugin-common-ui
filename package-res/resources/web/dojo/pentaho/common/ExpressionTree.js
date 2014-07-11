dojo.provide("pentaho.common.ExpressionTree");
dojo.require("dijit.form.Select");
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('pentaho.common.Messages');

dojo.declare("pentaho.common.ExpressionTree",
  [dijit._Widget, dijit._Templated],  {
      
    //getLocaleString: pentaho.common.Messages.getString,  
    templateString: dojo.cache("pentaho.common","ExpressionTree/ExpressionTree.html"),
    widgetsInTemplate: true,
    defaultOperator: null,
    operators: null,

    addBundleMessages: function() {
      pentaho.common.Messages.addUrlBundle('pentaho.common',CONTEXT_PATH+'i18n?plugin=common-ui&name=resources/web/dojo/pentaho/common/nls/messages');
    },

    // Function for retrieving localized strings
    getLocaleString: function(key) {
      var localizedMessage = key;
      if (key) {
        localizedMessage = pentaho.common.Messages.getString(key);
      }
      return localizedMessage;
    },

    constructor: function(defaultOp) {
      this.addBundleMessages();

      if(defaultOp && defaultOp.label && defaultOp.value){
        defaultOp.label = this.getLocaleString(defaultOp.label);
        this.defaultOperator = defaultOp;
      }
      else{
        this.defaultOperator = {
          label: this.getLocaleString('AND'),
          value: 'AND'
          //selected: true
        };  
      }

      this.operators = [
        { label: this.getLocaleString('AND'), value: 'AND' },
        { label: this.getLocaleString('OR'), value: 'OR' }
      ];
    },

    postCreate: function() {
      //console.log('postCreate...');
      this.set('operators', this.operators);
      this.operatorSelect.set('options', this.operators);
    },

    startUp: function() {
      //console.log('startup...');
    },

    addCondition: function(dom) {
      var div = dojo.create("div",{
        "class": "pentaho-condition"
      });
      dojo.place(dom, div);
      dojo.place(div, this.conditionsNode);
      this.resize();
    },

    resize: function() {
      //var height = dojo.getComputedStyle(this.conditionsNode).height;
      var height = dojo.position(this.conditionsNode).h + 'px'; // PIR-742
      this.bracketNode.style.height = height;
      this.operatorNode.style.height = height;

      // PIR-725  - IE9 does not like line-height set to auto
      height = (dojo.isIE && height == 'auto') ? 'inherit' : height;

      this.operatorNode.style.lineHeight = height;

      // center operator
      height = dojo.position(this.bracketNode).h;
      var selectContentHeight = dojo.position(this.operatorSelect.domNode).h;
      this.operatorSelectNode.style.marginTop = (height - selectContentHeight)/2 + 'px';
      this.operatorSelectNode.style.marginBottom = (height - selectContentHeight)/2 + 'px';
    },

    onOperatorChange: function(newValue){
      this.defaultOperator = {
        label: this.getLocaleString(newValue),
        value: newValue,
        selected: true
      };
    }
  }
);