define([
  'common-ui/angular',
  'pentaho/common/DateTextBox',
  'dijit/registry'
],
    function (angular, dateTextBox, registry) {
      var templatePath = require.toUrl('common-ui/angular-directives/dateTimePicker')+"/";

      angular.module('dateTimePicker', [])

          .controller('DateTimeController', ['$scope', '$attrs', function ($scope, $attrs) {
            $scope.init = function() {
              var formattedValues = function(first, last, step) {
                var values = [];
                for (var i=0; i<=(last-first)/step; i++) {
                  values[i] = {};
                  values[i].id = (i*step)+first;
                  values[i].title = (i*step)+first < 10 ? '0' + ((i*step)+first) : (i*step)+first;
                }
                return values;
              };

              var defaultDate;
              if(angular.isDate($scope.selectedDate)) {
                defaultDate = $scope.selectedDate;
              } else {
                defaultDate = new Date($scope.selectedDate);
              }

              var increment = $scope.minutesIncrement ? $scope.minutesIncrement : 1;
              $scope.minutevalues = formattedValues(0, 59, increment);
              $scope.hourvalues = formattedValues(1, 12, 1);


              if (defaultDate) {
                $scope.hour = defaultDate.getHours() % 12;
                $scope.minute = defaultDate.getMinutes() - (defaultDate.getMinutes() % increment);
                if (defaultDate.getHours() > 12) {
                  $scope.tod = 'PM';
                } else {
                  $scope.tod = 'AM';
                }
              }
            };

            $scope.init();

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
                isDisabled: '=?',
                minDate: '=?',
                maxDate: '=?',
                hideTime: '@',
                minutesIncrement: '@'
              },
              link: function (scope, elem, attrs) {
                scope.$watch('hour', function(newValue, oldValue) {
                  updateTime(newValue, oldValue, scope.selectedDate.getMinutes(), scope.selectedDate.getMinutes(), scope.tod, scope.tod);
                });
                scope.$watch('minute', function(newValue, oldValue) {
                  updateTime(scope.selectedDate.getHours(), scope.selectedDate.getHours(), newValue, oldValue, scope.tod, scope.tod);
                });
                scope.$watch('tod', function(newValue, oldValue) {
                  updateTime(scope.selectedDate.getHours(), scope.selectedDate.getHours(), scope.selectedDate.getMinutes(), scope.selectedDate.getMinutes(), newValue, oldValue);
                });

                var updateTime = function(hours, oldHours, minutes, oldMinutes, tod, oldTod) {
                  // handle minutes
                  if (minutes != oldMinutes) { // No massaging of minutes is needed
                    scope.selectedDate.setMinutes(minutes);
                  }
                  // handle hours and tod
                  if (hours != oldHours || tod != oldTod) { // This is where we massage hours based on tod
                    if (tod === "AM") {  
                      if (hours == 12) {  //  12am is midnight so we set the hours to 0
                        scope.selectedDate.setHours(0);
                      } else { // use what ever the user selecte (1-11)
                        scope.selectedDate.setHours(hours);
                      }
                    } else { // This is PM we add 12 to everything except 12
                      if (hours == 12) { // this is noon and shouldn't be changed
                        scope.selectedDate.setHours(hours);
                      } else { // any other pm should have 12 added to it
                        scope.selectedDate.setHours(hours + 12)
                      }
                    }
                  }
                }

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
                    node.find("select").attr("disabled", scope.isDisabled);
                  }
                };
                var initializeDisabled = function() {
                  if(!angular.isDefined(scope.isDisabled)) {
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
                  $timeout(function() {
                    initializeDisabled();
                  }, 0);
                }, 0);

              }
            };
          }]);
    }
);
