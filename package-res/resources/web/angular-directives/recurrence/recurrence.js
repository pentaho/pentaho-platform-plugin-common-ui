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
            $scope.endDate = 'none';

            $scope.weeklyRecurrenceInfo = {
              monday: $scope.monday,
              tuesday: $scope.tuesday,
              wednesday: $scope.wednesday,
              thursday: $scope.thursday,
              friday: $scope.friday,
              saturday: $scope.saturday,
              sunday: $scope.sunday,
              startDate: $scope.startDate,
              endDate: $scope.endDate
            }
          }])

          .directive('weekly', function () {
            return {
              restrict: 'A',
              replace: true,
              transclude: true,
              controller: 'WeeklyRecurrenceController',
              templateUrl: templatePath + 'weekly.html',
              scope: {
                weeklyLabel:'@',
                startLabel: '@',
                untilLabel: '@',
                noEndLabel: '@',
                endByLabel: '@',
                weeklyRecurrenceInfo: '='
              },
              link: function (scope, elem, attrs) {

                scope.$watchCollection('[monday, tuesday, wednesday, thursday, friday, saturday, sunday, startDate, endDate]', function () {

                  scope.weeklyRecurrenceInfo = {
                    monday: scope.monday,
                    tuesday: scope.tuesday,
                    wednesday: scope.wednesday,
                    thursday: scope.thursday,
                    friday: scope.friday,
                    saturday: scope.saturday,
                    sunday: scope.sunday,
                    startDate: scope.startDate,
                    endDate: scope.endDate
                  }
                });
              }
            }
          });
    });