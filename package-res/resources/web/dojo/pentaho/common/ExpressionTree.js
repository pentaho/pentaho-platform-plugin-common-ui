dojo.provide("pentaho.common.ExpressionTree");
dojo.require("dijit.form.Select");
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare("pentaho.common.ExpressionTree",
  [dijit._Widget, dijit._Templated],  {
      
    //getLocaleString: pentaho.common.Messages.getString,  
    templateString: dojo.cache("pentaho.common","ExpressionTree/ExpressionTree.html"),
    widgetsInTemplate: true,
    defaultOperator: null,
    operators: null,

    constructor: function(defaultOp) {
      if(defaultOp && defaultOp.label && defaultOp.value){
        this.defaultOperator = defaultOp;
      }
      else{
        this.defaultOperator = {
          label: 'AND',
          value: 'AND'
          //selected: true
        };  
      }

      this.operators = [
        { label: 'AND', value: 'AND' },
        { label: 'OR', value: 'OR' }
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
        label: newValue,
        value: newValue,
        selected: true
      };
    }
  }
);