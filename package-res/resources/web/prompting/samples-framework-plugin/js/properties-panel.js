define(["common-ui/jquery", "common-ui/prompting/api/PromptingAPI", "./doc-panel.js"], function($, PromptingAPI, DocPanel) {

  var PropertiesPanel = function(framework) {
    this.api = new PromptingAPI();
    this.docPanel = new DocPanel(framework);
    this.framework = framework;

    this._getParameterXML = function(callback) {
      var fullURL = this.framework._createFullURL("resources/params.xml");

      $.ajax({
        url: fullURL,
        type: "GET",
        success: function(data, status) {
          if (status == "success") {
            callback(data);
          } else {
            alert("Error loading " + fullURL);
          }
        },
        error: function(msg) { alert(JSON.stringify(msg, null, 2)); },
        dataType: "text"
      });
    }

    this._createPromptPanel = function() {
      this.framework.console.addLine("api.operation.render('prompt-panel-render-area', getParameterXMLCallback);", "'prompt-panel-render-area' is the id of the HTML container.");
      this._getParameterXML(function(xml) {
        this.api.operation.render("prompt-panel-render-area", function() {
          return xml;
        });

        $("#prompt-panel-render-area").show();
        this.framework.console.addLine("api.operation.init();", "The 'render' call above does not actually create the prompt. 'init' needs to be called after.");
        this.api.operation.init();
      }.bind(this));
    };

    this._populateMethods = function(clazz) {
      this.docPanel.getMethods(clazz, function(methods) {
        var methodsEle = $("#methods").empty();
        methodsEle.append("<option></option>");
        for (var i = 1; i < methods.length; i++) {
          var method = methods[i];
          var option = $("<option></option>").val(method).text(method);
          methodsEle.append(option);
        }          
      });
    };

    this.init = function() {
      $("#create-prompt-btn").on("click", function() {
        this._createPromptPanel();
      }.bind(this));

      var classesEle = $("#classes").on("change", function(e) {
        this._populateMethods($(e.currentTarget).val());
      }.bind(this));

      this.docPanel.getClasses(function(classes) {
        for (var i = 0; i < 2; i++) {
          var clazz = classes[i];
          var option = $("<option></option>").val(clazz).text("api." + clazz + ".*");
          classesEle.append(option);
        }

        this._populateMethods(classes[0]);
      }.bind(this));

      var methodsEle = $("#methods").on("change", function(e) {
        var ele = $(e.currentTarget);
        this.docPanel.populateDoc(classesEle.val(), ele.val());
      }.bind(this));

      $("#apply-btn").on("click", function() {
        alert("test");
      });
    }
  }

  return PropertiesPanel;
});