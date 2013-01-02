dojo.provide("pentaho.common.ToggleButton");
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare("pentaho.common.ToggleButton",
    [dijit._Widget, dijit._Templated],	{
        
        title: '',
        
        label: 'button',
        
        width: '80px',
        
        templateString: dojo.cache("pentaho.common", "ToggleButton.html"),

        checked: false,
        
        hover: false,
        
        disabled: false,

        // override this to get the onchange event
        onChange: null,
        
        set: function(property, value) {
            if(property == 'label') {
                this.innerNode.innerHTML = value;
            }
            else if(property == 'checked') {
                this._setChecked(value);
            }
            else if(property == 'disabled') {
                this._setDisabled(value);
            }
        },
        
        _setChecked: function(checked) {
            this.checked = checked;
            if(this.hover) {
                this._onHover();
            }
        },
        
        _setDisabled: function(disabled) {
            this.disabled = disabled;
            if(this.disabled) {
                if(this.checked) {
                    this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-down pentaho-toggle-button-down-disabled'
                } else {
                    this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-up pentaho-toggle-button-up-disabled'
                }
            } else {
                if(this.hover) {
                    this._onHover();
                } else {
                    this._onUnhover();
                }
            }
        },
        
        _onHover: function() {
            this.hover = true;
            if(this.disabled) {
                return;
            }
            if(this.checked) {
                this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-down pentaho-toggle-button-down-hovering'
            } else {
                this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-up pentaho-toggle-button-up-hovering'
            }
        },
        
        _onUnhover: function() {
            this.hover = false;
            if(this.disabled) {
                return;
            }
            if(this.checked) {
                this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-down';
            } else {
                this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-up';
            }
        },
        
        _onClick: function() {
            if(this.disabled) {
              return;
            }
            this._setChecked(!this.checked);
            if(this.onChange) {
                this.onChange(this.checked);
            }
        }
        
    }
);

