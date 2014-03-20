require([
  'common-ui/angular',
  'common-ui/angular-ui-bootstrap',
  'common-ui/angular-directives/angular-directives'
  ],
  function(angular) {
    angular.module('accordionWizardSample', ['accordionWizard'])
      .controller('AccordionWizardSampleController', 
        ["$scope", "$http", function($scope, $http) {
          $scope.sample = {
            data: {
              saveText: "Save Me"
            },
            custom: {
              onSave: function() {          
                this.summary = "Hello, " + this.name;
              },
              summary: "Introduce yourself",
              name: "",
              isSaveable: function() {
                return !this.form.$invalid;
              }
            },
            disabledGroup: {
              isDisabled: true
            },
            enableIt: {
              toggleDisabledGroup: function() {
                $scope.sample.disabledGroup.isDisabled = !$scope.sample.disabledGroup.isDisabled;
              }
            }
          };
        }
      ]);
  }
);
