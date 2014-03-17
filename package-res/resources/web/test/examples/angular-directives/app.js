
pen.require([
  'common-ui/angular',
  './accordionWizardSample/accordionWizardSample',
  './folderBrowserSample/folderBrowserSample'
  ],
  function(angular) {
    var app = angular.module('example', ['accordionWizardSample', 'folderBrowserSample']);

    app.controller('MainCtrl', ["$scope", "$http", function($scope, $http) {

      $scope.accordionWizard = {
        options: [
          {name: 'heading', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Heading/title of the group panel.' },
          {name: 'save-text', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Text to be used on the Save button' },
          {name: 'cancel-text', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Text to be used on the Cancel button' },
          {name: 'summary-text', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Text to be used in the summary label when the panel is closed' },
          {name: 'can-save', type: '&', typeOptions: 'scopeFunctionCall() OR true|false', description: 'Boolean value/function bound to the validation of the panel used to determine if the Save button is enabled' },
          {name: 'on-save', type: '&', typeOptions: 'scopeFunctionCall()', description: 'Called when the Save button is pressed' },
          {name: 'on-cancel', type: '&', typeOptions: 'scopeFunctionCall()', description: 'Called when the Cancel button is pressed' },
          {name: 'is-open', type: '=?', typeOptions: 'scopeProperty', description: 'Boolean property on bound to the toggled open/close state of the group' },
          {name: 'is-cancel', type: '=?', typeOptions: 'scopeProperty', description: 'Boolean property on bound to the disabled/enabled state of the group' }
        ],
        html: "",
        json: "",
        showCode: function(codeType) {
          if(codeType == 'html') {
            $scope.accordionWizard.showHtml = true;
            $scope.accordionWizard.showJs = false;
          } else if(codeType == 'javascript') {
            $scope.accordionWizard.showHtml = false;
            $scope.accordionWizard.showJs = true;
          } else {
            // hide them both
            $scope.accordionWizard.showHtml = false;
            $scope.accordionWizard.showJs = false;            
          }
        },
        showHtml: false,
        showJs: false
      };

      $scope.folderBrowser = {
        options: [
          {name: 'tree-model', type: '=', typeOptions: 'scopeProperty', description: 'Property containing the model to bind to the tree for content' },
          {name: 'add-folder', type: '=', typeOptions: 'scopeProperty', description: 'Property bound from scope to be used to add a folder to the tree' },
          {name: 'ext-select', type: '=', typeOptions: 'scopeProperty', description: 'Property used to externally set the selected node. Should be in the form: { attr: attribute, val: value }. attribute can be path, id, ...' },
          {name: 'selected-node', type: '=', typeOptions: 'scopeProperty', description: 'Property bound to the currently selected node' },
          {name: 'on-selection', type: '&', typeOptions: 'scopeFunctionCall()', description: 'Called when the selected node changes' },
          {name: 'node-children', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute containing child nodes in the tree model' },
          {name: "loading", type: '=?', typeOptions: 'Optional scopeProperty', description: 'Boolean property that controls showing of the spinner or the tree'}
        ],
        html: "",
        json: "",
        treeModel: {},
        showCode: function(codeType) {
          if(codeType == 'html') {
            $scope.folderBrowser.showHtml = true;
            $scope.folderBrowser.showJs = false;
          } else if(codeType == 'javascript') {
            $scope.folderBrowser.showHtml = false;
            $scope.folderBrowser.showJs = true;
          } else {
            // hide them both
            $scope.folderBrowser.showHtml = false;
            $scope.folderBrowser.showJs = false;
          }
        },
        showHtml: false,
        showJs: false
      };


      $scope.init = function() {
        $http.get('accordionWizardSample/accordionWizardSample.html').then(function(response) {
          $scope.accordionWizard.html = response.data;
          // run the pretty-printer now to make the code we just got look nice
          makePretty();
        });
        $http.get('accordionWizardSample/accordionWizardSample.js', { responseType: 'text' }).then(function(response) {
          $scope.accordionWizard.json = response.data;
          // run the pretty-printer now to make the code we just got look nice
          makePretty();
        });

        $http.get('folderBrowserSample/folderBrowserSample.html').then(function(response) {
          $scope.folderBrowser.html = response.data;
          // run the pretty-printer now to make the code we just got look nice
          makePretty();
        });
        $http.get('folderBrowserSample/folderBrowserSample.js', { responseType: 'text' }).then(function(response) {
          $scope.folderBrowser.json = response.data;
          // run the pretty-printer now to make the code we just got look nice
          makePretty();
        });

      };

      $scope.init();

    }]);
  }
);
