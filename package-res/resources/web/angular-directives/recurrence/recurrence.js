define([
        'common-ui/angular'
    ],
    function (angular) {
        var templatePath = require.toUrl('common-ui/angular-directives/recurrence') + "/";

        angular.module('recurrence', [])

            .controller('WeeklyRecurrenceController', ['$scope', '$attrs', '$locale', function ($scope, $attrs, $locale) {


                var sun = $locale.DATETIME_FORMATS.DAY[0];
                var mon = $locale.DATETIME_FORMATS.DAY[1];
                var tue = $locale.DATETIME_FORMATS.DAY[2];
                var wed = $locale.DATETIME_FORMATS.DAY[3];
                var thu = $locale.DATETIME_FORMATS.DAY[4];
                var fri = $locale.DATETIME_FORMATS.DAY[5];
                var sat = $locale.DATETIME_FORMATS.DAY[6];

                if (!$scope.weeklyRecurrenceInfo) {
                    $scope.weeklyRecurrenceInfo = {};
                }


                $scope.data = {
                    daysOfWeek: [
                        {day: sun, key: "SUN"},
                        {day: mon, key: "MON"},
                        {day: tue, key: "TUES"},
                        {day: wed, key: "WED"},
                        {day: thu, key: "THURS"},
                        {day: fri, key: "FRI"},
                        {day: sat, key: "SAT"}
                    ],
                    selectedDays: { },
                    endDateDisabled: true
                }

                $scope.startDate = new Date();
                $scope.minStartDate = new Date();
                $scope.endDateRadio = 'none';


                $scope.populateDaysOfWeek = function () {
                    var daysArray = [];
                    for (var obj in $scope.data.selectedDays) {
                        for (var index = 0; index < $scope.data.daysOfWeek.length; index++) {
                            if ($scope.data.selectedDays[obj] == true && $scope.data.daysOfWeek[index].key == obj) {
                                daysArray.push(index);
                            }
                        }


                    }
                    return daysArray;
                };

                $scope.dayOfWeekIsValid = function() {
                  return $scope.data.selectedDays.SUN ||
                         $scope.data.selectedDays.MON ||
                         $scope.data.selectedDays.TUES ||
                         $scope.data.selectedDays.WED ||
                         $scope.data.selectedDays.THURS ||
                         $scope.data.selectedDays.FRI ||
                         $scope.data.selectedDays.SAT;
                };
                $scope.hasValidDates = function() {
                  var isValid = false;
                  if(angular.isDate($scope.startDate)) {
                    isValid = true;
                    if(!$scope.data.endDateDisabled) {
                      if(angular.isDate($scope.endDate)) {
                        isValid = $scope.startDate < $scope.endDate;
                      } else {
                        isValid = $scope.startDate < new Date($scope.endDate);
                      }
                    }
                  }
                  return isValid;
                };

                $scope.isValid = function() {
                  var formname = "weeklyScheduleForm",
                      el = angular.element("form[name='" + formname + "']"),
                      daysOfWeek_valid = false,
                      dateTime_valid = false;
                  if(el && el.scope && el.scope() && el.scope()[formname]) {
                    // make sure that at least one day checkbox is selected
                    daysOfWeek_valid = el.scope()[formname].$valid;
                    // make sure we have a start date & time
                    dateTime_valid = $scope.hasValidDates();

                    return daysOfWeek_valid && dateTime_valid;
                  } else {
                    return false;
                  }
                };
            }])

            .directive('weekly', function () {
                return {
                    restrict: 'A',
                    replace: true,
                    transclude: true,
                    controller: 'WeeklyRecurrenceController',
                    templateUrl: templatePath + 'weekly.html',
                    scope: {
                        weeklyLabel: '@',
                        startLabel: '@',
                        untilLabel: '@',
                        noEndLabel: '@',
                        endByLabel: '@',
                        weeklyRecurrenceInfo: '=',
                        valid: '='
                    },
                    link: function (scope, elem, attrs) {

                        function rehydrate() {
                            if (scope.weeklyRecurrenceInfo) {

                                //hydrate days of week checkboxes
                                if (angular.isArray(scope.weeklyRecurrenceInfo.daysOfWeek)
                                    && scope.weeklyRecurrenceInfo.daysOfWeek.length > 0) {
                                    for (var i = 0; i < scope.weeklyRecurrenceInfo.daysOfWeek.length; i++) {
                                        //select each day in the array
                                        scope.data.selectedDays[scope.data.daysOfWeek[scope.weeklyRecurrenceInfo.daysOfWeek[i]].key] = true;
                                    }
                                }
                                if (scope.weeklyRecurrenceInfo.startTime) {
                                    scope.startDate = scope.weeklyRecurrenceInfo.startTime;
                                }
                                if (scope.weeklyRecurrenceInfo.endTime) {
                                    scope.endDate = scope.weeklyRecurrenceInfo.endTime;
                                    scope.endDateRadio = "dateSelected";
                                }
                            }
                            if(scope.weeklyRecurrenceInfo.startTime){
                                scope.startDate=scope.weeklyRecurrenceInfo.startTime;
                            }
                            if(scope.weeklyRecurrenceInfo.endTime){
                                scope.endDate=scope.weeklyRecurrenceInfo.endTime;
                                scope.endDateRadio="dateSelected";
                            }

                        }

                        function onChangeEvent() {
                            scope.weeklyRecurrenceInfo =
                            {
                                "daysOfWeek": scope.populateDaysOfWeek(),
                                "daysOfMonth": "",
                                "weeksOfMonth": "",
                                "monthsOfYear": "",
                                "years": "",
                                "startTime": scope.startDate,
                                "endTime": (scope.endDateRadio == "dateSelected") ? scope.endDate : undefined,
                                "uiPassParam": "WEEKLY",
                                "cronString": ""
                            };
                            scope.data.endDateDisabled = scope.endDateRadio !== "dateSelected";
                            // be sure to set a min start date of today
                            scope.minStartDate = new Date();
                        }

                        scope.$watch('data', onChangeEvent, true);
                        scope.$watch('weeklyRecurrenceInfo', rehydrate, true);
                        scope.$watchCollection('[startDate,endDate,endDateRadio]', onChangeEvent);

                        //initial rehydrate from server
                        rehydrate();

                      // listen for the isValidRequest broadcast, respond appropriately
                      var unregister = scope.$on('scheduleSelector:isValidRequest', function() {
                        var isValid = scope.isValid();
                        scope.$emit('scheduleSelector:isValidResponse', isValid);
                      });

                      // clean up
                      elem.on('$destroy', function() {
                        unregister(); // unregister above observer when directive is destroyed
                      });
                    }
                };
            });
    });