define([
  'common-ui/angular',
  'pentaho/common/DateTextBox',
  'dijit/registry'
],
    function (angular, dateTextBox, registry) {
      var templatePath = require.toUrl('common-ui/angular-directives/dateTimePicker')+"/";

      angular.module('dateTimePicker', [])

          .controller('DateTimeController', ['$scope', '$attrs', function ($scope, $attrs) {

            var tmpDate = new Date($scope.selectedDate);
            if (typeof $scope.dateInited === 'undefined') {
              var now = new Date();
              tmpDate.setHours(now.getHours());
              tmpDate.setMinutes(now.getMinutes());
              $scope.selectedDate = tmpDate.toJSON();
              $scope.dateInited = true;
            }
            $scope.hour = tmpDate.getHours() % 12;
            $scope.minute = tmpDate.getMinutes();
            if (tmpDate.getHours() > 12) {
              $scope.tod = 'PM'
            } else {
              $scope.tod = 'AM'
            }
            $scope.hidetime = false;
          }])

          .directive('datetime', ['$timeout', function ($timeout) {
            return {
              restrict: 'A',
              replace: true,
              transclude: true,
              controller: 'DateTimeController',
              templateUrl: templatePath + 'dateTimePicker.html',
              scope: {
                selectedDate: '=',
                isDisabled: '=',
                minDate: '=',
                maxDate: '='
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

                var toggleDisabled = function() {
                  var node = angular.element(elem);
                  var isDojoWidgetReady = node.find("input[type='text']").length > 0;
                  if(angular.isDefined(scope.isDisabled) && isDojoWidgetReady) {
                  // enable/disable the end date date picker
                  node.find("input[type='text']").attr("disabled", scope.isDisabled);

                    // enable/disable the calendar icon
                  if(scope.isDisabled) {
                    node.find(".pentaho-dropdownbutton-inner").addClass("disabled");
                  } else {
                    node.find(".pentaho-dropdownbutton-inner").removeClass("disabled");
                  }
                    // enable/disable the dijit widget itself
                  if(node.find(".pentaho-listbox")[0]) {
                    var listBoxWidget = registry.byNode(node.find(".pentaho-listbox")[0]);
                    listBoxWidget.disabled = scope.isDisabled;
                    if(!scope.isDisabled) {
                      listBoxWidget.validate();
                    }
                  }

                    // enable/disable the time-related elements
                    node.find("input[type='number']").attr("disabled", scope.isDisabled);
                    node.find("select").attr("disabled", scope.isDisabled);
                  }
                };
                var initializeDisabled = function() {
                  if(!angular.isDefined(scope.isDisabled)) {
                    console.log("Nothing on scope for isDefined");
                    scope.isDisabled = false;
                  }
                  toggleDisabled();
                };

                scope.$watch('isDisabled', toggleDisabled);
                scope.$watchCollection('[minDate, maxDate]', function() {
                  // set the dojo constraints
                  if(angular.element(elem).find(".pentaho-listbox")[0]) {
                    var listBoxWidget = registry.byNode(angular.element(elem).find(".pentaho-listbox")[0]);
                    if(scope.minDate) {
                      listBoxWidget.constraints.min = scope.minDate;
                    }
                    if(scope.maxDate) {
                      listBoxWidget.constraints.max = scope.maxDate;
                    }
                    listBoxWidget.validate();
                  }
                });

                // need to initialize the disabled state AFTER the link function is complete
                // using a timeout with a 0 delay accomplishaes that
                $timeout(function() {
                  initializeDisabled();
                }, 0);

              }
            };
          }]);
    }
);
