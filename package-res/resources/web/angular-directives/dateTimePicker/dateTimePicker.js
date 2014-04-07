define([
  'common-ui/angular',
  'pentaho/common/DateTextBox'
],
    function (angular, dateTextBox) {
  
      var templatePath = "";
      if (typeof(CONTEXT_PATH) != "undefined") {
        templatePath = CONTEXT_PATH + 'content/common-ui/resources/web/angular-directives/dateTimePicker/';
      } else {
        templatePath = 'angular-directives/dateTimePicker/';
      }

      angular.module('dateTimePicker', [])

          .controller('DateTimeController', ['$scope', '$attrs', function ($scope, $attrs) {

            var tmpDate = new Date($scope.selectedDate);
            $scope.hour = tmpDate.getHours() % 12;
            $scope.minute = tmpDate.getMinutes();
            if (tmpDate.getHours() > 12) {
              $scope.tod = 'AM'
            } else {
              $scope.tod = 'PM'
            }
          }])

          .directive('datetime', function () {
            return {
              restrict: 'A',
              replace: true,
              transclude: true,
              controller: 'DateTimeController',
              templateUrl: templatePath + 'dateTimePicker.html',
              scope: {
                selectedDate: '='
              },
              link: function (scope, elem, attrs) {
                scope.$watch('hour', function(newValue, oldValue) {
                   var tempDate = new Date(scope.selectedDate);
                   if (scope.tod == 'PM') {
                      newValue += 12;
                   }
                   tempDate.setHours(newValue);
                   scope.selectedDate = tempDate.toJSON();
                });
                scope.$watch('minute', function(newValue, oldValue) {
                  var tempDate = new Date(scope.selectedDate);
                  tempDate.setMinutes(newValue);
                  scope.selectedDate = tempDate.toJSON();
                });
                scope.$watch('tod', function(newValue, oldValue) {
                  var tempDate = new Date(scope.selectedDate);

                  if (tempDate.getHours() < 12) { // hours less 12
                    if (newValue == "PM") {
                      tempDate.setHours(tempDate.getHours() + 12);
                    }
                  } else { // hourse more than 12
                    if (newValue == "AM") {
                      tempDate.setHours(tempDate.getHours() - 12);
                    }
                  }
                  scope.selectedDate = tempDate.toJSON();
                });
              }
            };
          });
    });