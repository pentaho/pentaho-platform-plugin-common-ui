define(["common-ui/jquery"], function($) {
  var Console = function() {
    this.console = $("#console");
    this.editConsoleTitle = $("#edit-console-title");
    this.editConsole = $("#edit-console").on("keypress", function(e) {
      var keyCode = e.keyCode || e.which;

      if (keyCode == 9) {
        e.preventDefault();
      }
    }.bind(this));

    // Show edit console
    $("#edit-console-btn").on("click", function() {
      $("#edit-console-btn").attr("disabled", true);
      this.showEditConsole(true);
    }.bind(this));

    // Hide edit console
    $("#edit-console-submit").on("click", function() {
      this.showEditConsole(false, true);
    }.bind(this));

    $("#edit-console-cancel").on("click", function() {
      this.showEditConsole(false);
    }.bind(this));

    /**
     * Adds a console line
     */
    this.addLine = function(line, alt, onclick) {
      // Regex encoding of spaces and newlines for html
      line = line.replace(/ /g, "&nbsp;");
      line = line.replace(/\n/g, "<br/>");
      line = line.replace(/\\n/g, "<br/>");

      var line = $("<div>" + (alt ? " * " : "") + line + "</div>").addClass("console-line");
      if (alt) {
        line.attr("title", alt);
      }

      if (onclick) {
        line.addClass("clickable");
        line.on("click", function(e) {
          $(".console .console-line").removeClass("selected");
          $(this).addClass("selected");

          onclick(e);
        });
      }

      this.console.append(line);

      return line;
    };

    this.reset = function(keepEditConsole) {
      this.clear(keepEditConsole);
      $("#edit-console-container").hide();
      $("#edit-console-btn").attr("disabled", false);
    }.bind(this);

    this.clear = function(keepEditConsole) {
      this.console.empty();

      if (!keepEditConsole) {
        this.editConsole.text("");
        this.editConsoleTitle.text("");
      }
    }.bind(this);

    this.showEditConsoleButton = function(show) {
      if(show) {
        $("#edit-console-btn").show();
      } else {
        $("#edit-console-btn").hide();
      }
    }

    this.showEditConsole = function(show, execute) {
      var editConsoleContainer = $("#edit-console-container");
      if(show) {
        editConsoleContainer.fadeIn();
        if (this.editConsole.text() === "" && this.getEditContent) {
          var code = this.getEditContent();
          var title = "";
          if (typeof code == "object") {
            title = code.title;
            code = code.code;
          }

          if (title) {
            this.editConsoleTitle.show();
            this.editConsoleTitle.text(title);
            this.editConsole.css("padding-top", 35);
          } else {
            this.editConsoleTitle.hide();
            this.editConsole.css("padding-top", 0);
          }

          var formattedCode = this._formatCode(code);
          this.editConsole.html(formattedCode);
        }
      } else {
        $("#edit-console-btn").attr("disabled", false);
        editConsoleContainer.hide();
        if (execute && this.onSubmit) {
          this.onSubmit(this._processCode());
        }
      }
    }

    this._formatCode = function(str) {
      var formatted = str.replace(/(.+(|\n))/g, function(match, m1) {
        return "<div>" + m1 + "</div>";
      })
        .replace(/(    )(.+)/g, function(g0, g1, g2) {
          return g2;
        })
        .replace(/( +)(.+)/g, function(g0, g1, g2) {
          g1 = g1.replace(/ /g, "&nbsp;");
          return g1 + g2;
        })
        .replace(/\n\n/g, "\n<div><br></div>");

      return this._syntaxHighlight(formatted);
    }

    this._syntaxHighlight = function(str) {
      return str
        .replace(/'.*?'|".*?"/g, function(g0) {
          return "<span class=\"string\">" + g0 + "</span>"
        })
        .replace(/function.*?\((.+)\)/g, function(g0, g1) {
          var params = g1.split(",");
          var paramsStr = "";
          for (var i in params) {
            paramsStr += "<span class=\"param\">" + params[i] + "</span>" + (i < params.length - 1 ? "," : "");
          }

          return g0.replace(g1, paramsStr);
        })
        .replace(/(function\(|function \(|function\&nbsp\;\()/g, "<span class=\"function\">function</span> (")
        .replace(/var /g, "<span class=\"var\">var</span> ")
        .replace(/\/\/.+?\n/g, function(g0) {
          return "<span class='comment'>" + g0 + "</span>";
        });
    }

    this._processCode = function() {
      return this.editConsole.text()
        .replace(/<div.*?>/g, "")
        .replace(/<\/div>/g, "")
        .replace(/<span.*?>/g, "")
        .replace(/<\/span>/g, "")
        .replace(/<br>/g, "↵↵");
    }

    this.getEditContent = null; // Override to input default content into edit console
    this.onSubmit = null; // Override to receive console lines from edit console textarea
  };

  return Console;
});