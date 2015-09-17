define(["common-ui/jquery"], function($) {
  var DocPanel = function(framework) {
    this.framework = framework;

    this._map = {
      "operation" : {name: "OperationAPI.html", html: ""},
      "event" : {name: "EventAPI.html", html: ""}
    }

    this.getClasses = function(callback) {
      var url = this.framework._createFullURL("resources/PromptingAPI.html");
      $.ajax({
        url: url,
        type: "GET",
        success: function(data, status) {
          if (status == "success") {
            var html = $(data);

            var classes = [];
            html.find(".props .name").each(function(i, ele) {
              classes.push($(ele).text());
            });

            callback(classes);
          } else {
            alert("Error loading " + url);
          }
        },
        error: function(msg) { alert(JSON.stringify(msg, null, 2)); },
        dataType: "html"
      });
    }

    this.getMethods = function(clazz, callback) {
      var url = this.framework._createFullURL("resources/" + this._map[clazz].name);

      $.ajax({
        url: url,
        type: "GET",
        success: function(data, status) {
          if (status == "success") {
            var html = $(data);
            this._map[clazz].html = html;

            var methods = [];
            html.find("h4.name").each(function(i, ele) {
              methods.push($(ele).attr("id"));
            });

            callback(methods);
          } else {
            alert("Error loading " + url);
          }
        }.bind(this),
        error: function(msg) { alert(JSON.stringify(msg, null, 2)); },
        dataType: "html"
      });
    }

    this.populateDoc = function(clazz, method) {
      var docContainer = $("#doc-container").empty();

      if (method) {
        var html = this._map[clazz].html;
        var methodHtml = html.find("#" + method);
        var descriptors = methodHtml.nextUntil("h4.name");

        docContainer.append(methodHtml).append(descriptors);
        docContainer.find(".details").remove();
      }
    }
  };

  return DocPanel;
});