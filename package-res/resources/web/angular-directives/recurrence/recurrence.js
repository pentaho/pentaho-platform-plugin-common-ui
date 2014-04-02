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


            $scope.sun = $locale.DATETIME_FORMATS.DAY[0];
            $scope.mon = $locale.DATETIME_FORMATS.DAY[1];
            $scope.tue = $locale.DATETIME_FORMATS.DAY[2];
            $scope.wed = $locale.DATETIME_FORMATS.DAY[3];
            $scope.thu = $locale.DATETIME_FORMATS.DAY[4];
            $scope.fri = $locale.DATETIME_FORMATS.DAY[5];
            $scope.sat = $locale.DATETIME_FORMATS.DAY[6];

            $scope.monday = false;
            $scope.tuesday = false;
            $scope.wednesday = false;
            $scope.thursday = false;
            $scope.friday = false;
            $scope.saturday = false;
            $scope.sunday = false;

            //Need to be able to inject this date into calendar picker
            $scope.startDate = new Date();

            $scope.endDateRadio = 'none';

            $scope.weeklyRecurrenceInfo={};

            $scope.populateDaysOfWeek = function () {
              var daysArray = [];

              if ($scope.sunday) {
                daysArray.push(0);
              }
              if ($scope.monday) {
                daysArray.push(1);
              }
              if ($scope.tuesday) {
                daysArray.push(2);
              }
              if ($scope.wednesday) {
                daysArray.push(3);
              }
              if ($scope.thursday) {
                daysArray.push(4);
              }
              if ($scope.friday) {
                daysArray.push(5);
              }
              if ($scope.saturday) {
                daysArray.push(6);
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

                if(scope.weeklyRecurrenceInfo){
                  console.log("================================defined");
                }

                scope.$watch('pen_cal_date', function () {
                  scope.weeklyRecurrenceInfo.endTime = (scope.endDateRadio == "dateSelected") ? scope.pen_cal_date : "";
                });

                scope.$watchCollection('[monday, tuesday, wednesday, thursday, friday, saturday, sunday, startDate, endDateRadio]', function () {

                  scope.weeklyRecurrenceInfo =
                  {
                    "daysOfWeek": scope.populateDaysOfWeek(),
                    "daysOfMonth": "",
                    "weeksOfMonth": "",
                    "monthsOfYear": "",
                    "years": "",
                    "startTime": scope.startDate,
                    "endTime": (scope.endDateRadio == "dateSelected") ? scope.pen_cal_date : "",
                    "uiPassParam": "WEEKLY",
                    "cronString": ""
                  }

                });
              }
            }
          });
    });