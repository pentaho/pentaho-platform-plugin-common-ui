define([
        'common-ui/angular'
    ],
    function (angular) {
        var templatePath = "";
        if (typeof(CONTEXT_PATH) != "undefined") {
            templatePath = CONTEXT_PATH + 'content/common-ui/resources/web/angular-directives/recurrence/';
        } else {
            templatePath = 'angular-directives/recurrence/';
        }

        angular.module('recurrence', [])

            .controller('WeeklyRecurrenceController', ['$scope', '$attrs', '$locale', function ($scope, $attrs, $locale) {


                var sun = $locale.DATETIME_FORMATS.DAY[0];
                var mon = $locale.DATETIME_FORMATS.DAY[1];
                var tue = $locale.DATETIME_FORMATS.DAY[2];
                var wed = $locale.DATETIME_FORMATS.DAY[3];
                var thu = $locale.DATETIME_FORMATS.DAY[4];
                var fri = $locale.DATETIME_FORMATS.DAY[5];
                var sat = $locale.DATETIME_FORMATS.DAY[6];

                $scope.weeklyRecurrenceInfo = {};


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
                    selectedDays: { }
                }

                $scope.startDate = new Date();
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
                        weeklyRecurrenceInfo: '='
                    },
                    link: function (scope, elem, attrs) {

                        if (scope.weeklyRecurrenceInfo) {
                            console.log("================================defined");
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
                                "endTime": (scope.endDateRadio == "dateSelected") ? scope.endDate : "",
                                "uiPassParam": "WEEKLY",
                                "cronString": ""
                            }
                        }

                        scope.$watch('data', onChangeEvent, true);
                        scope.$watchCollection('[startDate,endDate,endDateRadio]', onChangeEvent, true);
                    }
                }
            });
    });