define(["common-ui/jquery", "./console.js"], function($, Console) {
  this._baseURL = "";
  this._css=[];
  this._setBaseURL = function(baseURL) {
    this._baseURL = baseURL + (baseURL.charAt(baseURL.length-1) == "/" ? "" : "/");
  };
  this._createFullURL = function(url) {
    return this._baseURL + (url.charAt(0) == "/" ? url.slice(1) : url);
  }
  this._loadHTMLContent = function(url, callback) {
    var fullURL = this._createFullURL(url);
    $.ajax({
      url: fullURL,
      type: "GET",
      success: function(html, status) {
        if (status == "success") {
          callback(html);
        } else {
          alert("Error loading " + fullURL);
        }
      },
      error: function(msg) { alert(JSON.stringify(msg, null, 2)) },
      dataType: "html"
    });
  };
  this._loadCss = function(css) {
    var link = $("<link rel=\"stylesheet\" type=\"text/css\">");
    link.attr("href", this._createFullURL(css));
    $("head").append(link);

    this._css.push(link);
  };
  this._loadContent = function(config, success) {
    if (config.html) {
      this._loadHTMLContent(config.html, function(html) {
        success(html);
        
        if (config.success) {
          config.success();
        }
      });
    }

    if (config.css) {
      this._loadCss(config.css);
    }
  };
  this._getSpanSize = function(classStr) {
    return parseInt(classStr.match(/span\w+/)[0].replace("span", ""));
  };
  this._getLayout = function() {
    return {
      properties: {
        id: "#properties-container",
        span: this._getSpanSize($("#properties-container").attr("class"))
      },
      render: {
        id: "#render-area-container",
        span: this._getSpanSize($("#render-area-container").attr("class"))
      },
      documentation: {
        id: "#documentation-container",
        span: this._getSpanSize($("#documentation-container").attr("class"))
      }
    }
  };
  this._balanceLayout = function(layout) {
    var spanRemaining = 12;
    var visiblePanels = [];
    for (var name in layout) {
      var panel = layout[name];
      spanRemaining -= panel.span;
      
      // Toggle Panel
      if (panel.span == 0) {
        $(panel.id).hide();
      } else {
        $(panel.id).show();
        visiblePanels.push(name);
      }
    }

    if (visiblePanels.length == 0) {
      return;
    }

    if (spanRemaining < 0) {
      layout = this._defaultLayout;
    } else {
      var additionalSpan = spanRemaining / visiblePanels.length;
      for (var i in visiblePanels) {
        var panelName = visiblePanels[i];
        layout[panelName].span += additionalSpan;

        if (i == 0 && spanRemaining % 2 == 1) {
          layout[panelName].span += 1;
        }
      }
    }

    this._applyLayout(layout);
  };
  this._applyLayout = function(layout) {
    for (var name in  layout) {
      var panel = layout[name];

      var panelEle = $(panel.id);
      panelEle.removeClass(panelEle.attr("class").match(/span\w+/)[0]).addClass("span" + panel.span);
    }
  };
  this._defaultLayout = this._getLayout();
  this._fadeIn = 650;
  this._unload = function() {
    for (var i in this._css) {
      this._css[i].remove();
    }

    this._css = [];
    this._baseURL = "";
  };

  /**
   * Loads the properties panel with html content
   */
  this.loadPropertiesPanel = function(config) {
    this._loadContent(config, function(html) {
      $("#properties").html(html).hide().fadeIn(this._fadeIn);      
    });
  };

  /**
   * Loads the render area panel with html content
   */
  this.loadRenderArea = function(config) {
    this._loadContent(config, function(html) {
      $("#render-area").html(html).hide().fadeIn(this._fadeIn);
    });
  };

  /**
   * Loads the documentation panel with html content
   */
  this.loadDocumentation = function(config) {
    this._loadContent(config, function(html) {
      $("#documentation").html(html).hide().fadeIn(this._fadeIn);
    });
  };

  /**
   * Replaces the content inside of the documentation panel with direct html
   */
  this.replaceDocumentation = function(html) {
    $("#documentation").html(html).hide().fadeIn(this._fadeIn);
  }

  /**
   * Replaces the application header content
   */
  this.replaceHeader = function(header) {
    $("#app-header").text(header).hide().fadeIn(this._fadeIn);
  }

  /**
   * Shows/Hides the properties panel
   */
  this.showPropertiesPanel = function(show) {
    var layout = this._getLayout();
    if (show) {
      layout.properties.span = this._defaultLayout.properties.span;
    } else {
      layout.properties.span = 0;
    }

    this._balanceLayout(layout);
  };

  /**
   * Shows/Hides the render area
   */
  this.showRenderArea = function(show) {
    var layout = this._getLayout();
    if (show) {
      layout.render.span = this._defaultLayout.render.span;
    } else {
      layout.render.span = 0;
    }

    this._balanceLayout(layout);
  };

  /**
   * Shows/Hides the documentation panel
   */
  this.showDocumentation = function(show) {
    var layout = this._getLayout();
    if (show) {
      layout.documentation.span = this._defaultLayout.documentation.span;
    } else {
      layout.documentation.span = 0;
    }

    this._balanceLayout(layout);
  };

  this.showConsole = function(show) {
    if (show) {
      this.console.clear();
      $("#console-outer-container").fadeIn(this._fadeIn);
    } else {
      $("#console-outer-container").fadeOut(this.console.clear);
    }
  }

  /**
   * Returns the base URL of the currently loaded plugin
   */
  this.getPluginBaseURL = function() {
    return this._baseURL;
  }

  this.console = new Console();

  return this;
});