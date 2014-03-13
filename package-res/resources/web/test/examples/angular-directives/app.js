
pen.require([
  'common-ui/angular',
  './accordionWizardSample/accordionWizardSample'
  ],
  function(angular) {
    var app = angular.module('example', ['accordionWizardSample']);

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
      };

      $scope.init();

    }]);
  }
);
