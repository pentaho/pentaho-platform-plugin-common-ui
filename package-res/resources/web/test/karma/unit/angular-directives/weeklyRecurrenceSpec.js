var deps = [
    'common-ui/angular',
    'test/karma/unit/angular-directives/templateUtil',
    'common-ui/angular-ui-bootstrap',
    'angular-mocks',
    'common-ui/angular-directives/recurrence/recurrence'
];

define(deps, function(angular, templateUtil) {

    describe('weeklyRecurrence', function () {
        var $scope, httpBackend, templateCache;

        beforeEach(module('recurrence'));

        beforeEach(inject(function ($rootScope, $httpBackend, $templateCache) {
            $scope = $rootScope;
            httpBackend = $httpBackend;
            templateCache = $templateCache;

            templateUtil.addTemplate("common-ui/angular-directives/recurrence/weekly.html", httpBackend, templateCache);

        }));

        describe('weekly', function () {

            var scope, $compile;
            var element;

            beforeEach(inject(function(_$rootScope_, _$compile_) {
                scope = _$rootScope_;
                $compile = _$compile_;
            }));

            afterEach(function () {
                element = scope = $compile = undefined;
            });

            describe('with static panels', function () {
                beforeEach(function () {
                    var tpl = "<div weekly weekly-label='Run every week on' start-label='Start' until-label='Until' no-end-label='No end date' end-by-label='End by' weekly-recurrence-info='model'></div>";

                    element = angular.element(tpl);
                    $compile(element)(scope);
                    scope.$digest();

                    //Set model to initially have 2 days check along with dates set
                    scope.model.startTime=new Date();
                    scope.model.endTime=new Date();
                    scope.model.daysOfWeek=[0,6];
                    scope.$apply();

                });
                afterEach(function() {
                    element.remove();
                });

                it('rehydrated model should reflect initial changes', function () {

                    expect(scope.model.daysOfWeek.length).toEqual(2);
                    expect(scope.model.endTime).toBeDefined();
                    expect(scope.model.startTime).toBeDefined();

                    //Grab first checkbox and un-check it
                    element.find('[type="checkbox"]:eq(0)').click();
                    //ensure that the first checkbox is unchecked
                    expect(scope.model.daysOfWeek.length).toBe(1);

                    //Grab last checkbox and un-check it
                    element.find('[type="checkbox"]:eq(6)').click();
                    //ensure that the last checkbox is unchecked
                    expect(scope.model.daysOfWeek.length).toBe(0);

                });

                it('should create weekly panel with content', function () {
                    expect(element.attr('weekly')).toBeDefined();
                    expect(element.attr('weekly-label')).toEqual("Run every week on");
                    expect(element.attr('start-label')).toEqual("Start");
                    expect(element.attr('until-label')).toEqual("Until");
                    expect(element.attr('no-end-label')).toEqual("No end date");
                    expect(element.attr('end-by-label')).toEqual("End by");
                });

                it('clicking checkbox set model on the scope', function () {

                    //Grab checkbox and check it
                    element.find('[type="checkbox"]:eq(1)').click();
                    //ensure that the second checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(3);
                    //Grab checkbox and check it
                    element.find('[type="checkbox"]:eq(2)').click();
                    //ensure that the third checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(4);
                    //Grab checkbox and check it
                    element.find('[type="checkbox"]:eq(3)').click();
                    //ensure that the fourth checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(5);
                    //Grab checkbox and check it
                    element.find('[type="checkbox"]:eq(4)').click();
                    //ensure that the fifth checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(6);
                    //Grab checkbox and check it
                    element.find('[type="checkbox"]:eq(5)').click();
                    //ensure that the sixth checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(7);

                    //Click checkbox again to deselect it
                    element.find('[type="checkbox"]:eq(3)').click();
                    //ensure that the seventh checkbox is deselected
                    expect(scope.model.daysOfWeek.length).toBe(6);

                });

                it('clicking radio button should update something', function () {

                });
            });
        });
    });
});