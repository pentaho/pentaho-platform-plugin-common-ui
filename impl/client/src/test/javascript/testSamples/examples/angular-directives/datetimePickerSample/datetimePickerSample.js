require([
        'common-ui/angular',
        'common-ui/angular-ui-bootstrap',
        'common-ui/angular-directives/angular-directives'
    ],
    function (angular) {
        angular.module('datetimePickerSample', ['angular-dojo', 'dateTimePicker'])
            .controller('DatetimePickerSampleController',
            ["$scope", "$http", function ($scope, $http) {
                $scope.sample = {
                    selectedDate: new Date(),
                    min: new Date(),
                    max: new Date(2015, 1, 1)
                };
            }
            ]);
    }
);
