dojo.provide("pentaho.common.Calendar");

dojo.require("pentaho.common.SmallImageButton");
dojo.require("pentaho.common.DropDownButton");
dojo.require("dijit.Calendar");

dojo.declare("pentaho.common.Calendar",
	[dijit.Calendar],
	{

		templateString: dojo.cache("pentaho.common", "Calendar.html"),

		buildRendering: function(){
			this.inherited(arguments);
            // hookup the previous/next year buttons
            this.previousYearBtn.callback = dojo.hitch(this, this._prevYearClick);
            this.nextYearBtn.callback = dojo.hitch(this, this._nextYearClick);

            // replace the month drop down with a customized one
            this.monthDropDownButton.dropDown.destroy();
			this.monthDropDownButton.dropDown = new pentho.common.Calendar._MonthDropDown({
				id: this.id + "_mdd",
				onChange: dojo.hitch(this, "_onMonthSelect")
			});

        },
        
        _prevYearClick: function() {
            this._adjustDisplay("year", -1);
        },
        
        _nextYearClick: function() {
            this._adjustDisplay("year", 1);
        },
        
        _populateGrid: function() {
			this.inherited(arguments);
            
            // add theme styles to the cells containing the days
            dojo.query(".dijitCalendarDateLabel", this.domNode).forEach(function(cell){
                dojo.addClass(cell, 'label');
            }, this);
            dojo.query(".dijitCalendarPreviousMonth", this.domNode).forEach(function(cell){
                dojo.addClass(cell, 'pentaho-light-text');
            }, this);
            dojo.query(".dijitCalendarNextMonth", this.domNode).forEach(function(cell){
                dojo.addClass(cell, 'pentaho-light-text');
            }, this);
            dojo.query(".dijitCalendarCurrentMonth", this.domNode).forEach(function(cell){
                dojo.addClass(cell, 'pentaho-listitem');
            }, this);
            dojo.query(".dijitCalendarCurrentDate", this.domNode).forEach(function(cell){
                dojo.removeClass(cell, 'pentaho-listitem');
                dojo.addClass(cell, 'panel-content');
            }, this);
            dojo.query(".dijitCalendarSelectedDate", this.domNode).forEach(function(cell){
                dojo.addClass(cell, 'pentaho-listitem-selected');
            }, this);
        },

		_onDayMouseOver: function(/*Event*/ evt){
			var node =
				dojo.hasClass(evt.target, "dijitCalendarDateLabel") ?
				evt.target.parentNode :
				evt.target;

			if(node && (node.dijitDateValue || node == this.previousYearLabelNode || node == this.nextYearLabelNode) ){
				dojo.addClass(node, "pentaho-listitem-hover");
				this._currentNode = node;
			}
		},
        
		_onDayMouseOut: function(/*Event*/ evt){
			// summary:
			//      Handler for mouse out events on days, clears hovered style
			// tags:
			//      protected
	
			if(!this._currentNode){ return; }
			
			// if mouse out occurs moving from <td> to <span> inside <td>, ignore it
			if(evt.relatedTarget && evt.relatedTarget.parentNode == this._currentNode){ return; }
			var cls = "pentaho-listitem-hover";
			if(dojo.hasClass(this._currentNode, "dijitCalendarActiveDate")) {
				cls += " pentaho-listitem-hover";
			}
			dojo.removeClass(this._currentNode, cls);
			this._currentNode = null;
		},
        
		_onDayMouseUp: function(/*Event*/ evt){
			this.inherited(arguments);
			var node = evt.target.parentNode;
			if(node && node.dijitDateValue){
				dojo.addClass(node, "pentaho-listitem-selected");
			}
		}, 
        
        _onDayClick: function(/*Event*/ evt){
			this.inherited(arguments);
			// summary:
			//      Handler for day clicks, selects the date if appropriate
			// tags:
			//      protected
			dojo.stopEvent(evt);
			for(var node = evt.target; node && !node.dijitDateValue; node = node.parentNode);
			if(node && !dojo.hasClass(node, "dijitCalendarDisabledDate")){
				dojo.addClass(node, "pentaho-listitem-selected");
			}
		}

        
    }
);

dojo.declare("pentho.common.Calendar._MonthDropDown", [dijit._Widget, dijit._Templated], {
	// summary:
	//		The month drop down

	// months: String[]
	//		List of names of months, possibly w/some undefined entries for Hebrew leap months
	//		(ex: ["January", "February", undefined, "April", ...])
	months: [],

	templateString: "<div class='pentaho-listbox' " +
		"dojoAttachEvent='onclick:_onClick,onmouseover:_onMenuHover,onmouseout:_onMenuHover'></div>",

	_setMonthsAttr: function(/*String[]*/ months){
		this.domNode.innerHTML = dojo.map(months, function(month, idx){
				return month ? "<div class='pentaho-listitem' month='" + idx +"'>" + month + "</div>" : "";
			}).join("");
	},

	_onClick: function(/*Event*/ evt){
		this.onChange(dojo.attr(evt.target, "month"));
	},

	onChange: function(/*Number*/ month){
		// summary:
		//		Callback when month is selected from drop down
	},

	_onMenuHover: function(evt){
		dojo.toggleClass(evt.target, "pentaho-listitem-hover", evt.type == "mouseover");
	}
});