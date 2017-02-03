require([
        'common-ui/angular',
        'common-ui/angular-ui-bootstrap',
        'common-ui/angular-directives/angular-directives'
    ],
    function (angular) {
        angular.module('weeklyRecurrenceSample', ['angular-dojo', 'recurrence'])
            .controller('WeeklyRecurrenceSampleController',
            ["$scope", "$http", function ($scope, $http) {
                var newScheduleModel = {
                    "type": undefined,
                    "daysOfWeek": [],
                    "daysOfMonth": [],
                    "weeksOfMonth": [],
                    "monthsOfYear": [],
                    "years": [],
                    "startTime": null,
                    "endTime": null,
                    "uiPassParam": "",
                    "cronString": ""
                };

                $scope.sample = {
                    model: {
                        selectedModel: angular.copy(newScheduleModel)
                    }
                };
            }
            ]);
    }
);
