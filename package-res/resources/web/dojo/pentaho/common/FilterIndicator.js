dojo.provide("pentaho.common.FilterIndicator");

/**
 * Shows a filter indicator over an anchor element to indicator the number of
 * filters currently active.
 */
dojo.declare(
    "pentaho.common.FilterIndicator",
    [dijit._Widget, dijit._Templated],
{
  templateString: '<div dojoAttachPoint="containerNode" class="hidden cursorPointer filterToolbarIndicator"></div>',
  backgroundClassPrefix: 'filterIndicatorBackground_',
  backgroundClassOverflow: '9_plus',
  min: 1,
  max: 9,

  currentBackgroundClass: undefined,

  toolbarButton: undefined,
  anchorElement: undefined,

  defaultOffsets: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },

  offsets: this.defaultOffsets,
  
  /**
   * @param toolbarButton Toolbar button for Filters so we can fake mouse interaction for it when we're interacted with
   * @param offsets
   *          {@see setOffsets()}
   */
  configure: function(toolbarButton, offsets) {
    this.setToolbarButton(toolbarButton);
    this.setAnchorElement(toolbarButton.domNode);
    this.setOffsets(offsets);
    
    this._connectToToolbarButton();
    this._updatePosition();
  },

  setToolbarButton: function(toolbarButton) {
    this.toolbarButton = toolbarButton;
  },
  
  /**
   * @param offsets
   *          Offset (padding) to position the indicator relative to the
   *          anchorElement in pixels, e.g. {top: 2, right: 0, bottom: 0,left: 2} (Currently only left and top are used)
   */
  setOffsets: function(offsets) {
    this.offsets = offsets ? offsets : defaultOffsets;
  },
  
  setAnchorElement: function(e) {
    this.anchorElement = e;
  },

  _connectToToolbarButton: function() {
    dojo.connect(this.containerNode, 'onclick', this, function(event) {
      this.toolbarButton._onButtonClick(event);
      dojo.stopEvent(event);
    });
    dojo.connect(this.containerNode, 'onmouseover', this, function() {
      this.toolbarButton._set("hovering", true);
    });
    dojo.connect(this.containerNode, 'onmouseout', this, function() {
      this.toolbarButton._set("hovering", false);
      this.toolbarButton._set("active", false);
    });
    dojo.connect(this.containerNode, 'onmousedown', this, function() {
      this.toolbarButton._set("hovering", true);
      this.toolbarButton._set("active", true);
    });
    dojo.connect(this.containerNode, 'onmouseup', this, function() {
      this.toolbarButton._set("hovering", true);
      this.toolbarButton._set("active", false);
    });
  },
  
  /**
   * Update the filter indicator's position relative to the anchor element and
   * offsets.
   */
  _updatePosition: function() {
    if (!this.anchorElement) {
      this.hide();
      return;
    }
    var c = dojo.coords(this.anchorElement);
    var left = c.x + this.offsets.left;
    var top = c.y + this.offsets.top;
    dojo.style(this.containerNode, "left", left + "px");
    dojo.style(this.containerNode, "top", top + "px");
  },
  
  /**
   * Update the filter indicator to reflect the number of filters provided.
   * 
   * @param numFilters
   *          Number of filters currently active.
   */
  update: function(numFilters) {
    if (!numFilters || numFilters < this.min) {
      this.hide();
    } else if (numFilters <= this.max) {
      this.changeBackground(this.backgroundClassPrefix + numFilters);
    } else {
      this.changeBackground(this.backgroundClassPrefix + this.backgroundClassOverflow);
    }
    this._updatePosition();
  },

  show: function() {
    dojo.removeClass(this.containerNode, "hidden");
  },

  hide: function() {
   dojo.addClass(this.containerNode, "hidden");
  },

  /**
   * Swap the background CSS class for the container node to the one provided. This will remove the existing background class.
   */
  changeBackground: function(className) {
    if (this.currentBackgroundClass !== className) {
      dojo.addClass(this.containerNode, className);
      if (this.currentBackgroundClass) {
        dojo.removeClass(this.containerNode, this.currentBackgroundClass);
      }
      this.currentBackgroundClass = className;
    }
    this.show();
  }
});