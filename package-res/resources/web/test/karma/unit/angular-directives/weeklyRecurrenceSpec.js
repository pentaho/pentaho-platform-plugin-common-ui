var deps = [
    'common-ui/angular',
    'test/karma/unit/angular-directives/templateUtil',
    'common-ui/angular-ui-bootstrap',
    'angular-mocks',
    'common-ui/angular-directives/recurrence/recurrence'
];

define(deps, function (angular, templateUtil) {

    describe('weeklyRecurrence', function () {
        var $scope, httpBackend, templateCache, datetimeScope;

        beforeEach(module('recurrence', 'dateTimePicker'));

        beforeEach(inject(function ($rootScope, $httpBackend, $templateCache) {
            $scope = $rootScope;
//            datetimeScope = $rootScope.$new();
//            datetimeScope.startDate = new Date("2014-04-01 11:15:00 PM");
            httpBackend = $httpBackend;
            templateCache = $templateCache;

            templateUtil.addTemplate("common-ui/angular-directives/recurrence/weekly.html", httpBackend, templateCache);
            templateUtil.addTemplate("common-ui/angular-directives/dateTimePicker/dateTimePicker.html", httpBackend, templateCache);

        }));

        describe('weekly', function () {

            var scope, $compile;
            var element, datetimeElement;

            beforeEach(inject(function (_$rootScope_, _$compile_) {
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
                    scope.model.startTime = new Date();
                    scope.model.endTime = new Date();
                    scope.model.daysOfWeek = [0, 6];
                    scope.$apply();

                });
                afterEach(function () {
                    element.remove();
                });

                it('rehydrated model should reflect initial changes', function () {

                    expect(scope.model.daysOfWeek.length).toEqual(2);
                    expect(scope.model.endTime).toBeDefined();
                    expect(scope.model.startTime).toBeDefined();

                    //Grab first checkbox and un-check it
                    element.find('input.SUN').click();
                    //ensure that the first checkbox is unchecked
                    expect(scope.model.daysOfWeek.length).toBe(1);

                    //Grab last checkbox and un-check it
                    element.find('input.SAT').click();
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
                    element.find('input.MON').click();
                    //ensure that the second checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(3);
                    //Grab checkbox and check it
                    element.find('input.TUES').click();
                    //ensure that the third checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(4);
                    //Grab checkbox and check it
                    element.find('input.WED').click();
                    //ensure that the fourth checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(5);
                    //Grab checkbox and check it
                    element.find('input.THURS').click();
                    //ensure that the fifth checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(6);
                    //Grab checkbox and check it
                    element.find('input.FRI').click();
                    //ensure that the sixth checkbox is checked
                    expect(scope.model.daysOfWeek.length).toBe(7);

                    //Click checkbox again to deselect it
                    element.find('input.WED').click();
                    //ensure that the seventh checkbox is deselected
                    expect(scope.model.daysOfWeek.length).toBe(6);

                });

                it('clicking radio button should update something', function () {

                });

                describe("start datetime directive initialization from scope", function () {
                    var startDatetime, isolateScope;
                    beforeEach(function () {
                        startDatetime = angular.element(element.find('div')[1]);
                        isolateScope = startDatetime.scope();
                    });

                    it('should update model on the scope', function () {
                        //Change the start hour to 10 AM
                        isolateScope.hour = 10;
                        isolateScope.tod = "AM";

                        //Change the start minute to :00
                        isolateScope.minute = 59;

                        scope.$apply();

                        expect(scope.model.startTime.getHours()).toBe(10);
                        expect(scope.model.startTime.getMinutes()).toBe(59);

                        isolateScope.selectedDate = new Date("2014-04-01 11:15:00 PM");

                        scope.$apply();

                        expect(scope.model.startTime.toString()).toBe( new Date("2014-04-01 11:15:00 PM").toString());
                    });
                });
            });

            describe("Weekly validation tests", function () {
                var $myscope, isolateScope;

                beforeEach(inject(function ($rootScope, $compile) {
                    var tpl = "<div weekly weekly-label='Run every week on' start-label='Start' until-label='Until' no-end-label='No end date' end-by-label='End by' weekly-recurrence-info='model'></div>";

                    $myscope = $rootScope.$new();
                    element = angular.element(tpl);
                    $compile(element)($myscope);
                    $myscope.$digest();

                    // get the isolate scope from the element
                    isolateScope = element.scope();
                    $myscope.model = {};
                    $myscope.$apply();
                }));

                afterEach(function () {
                    element.remove();
                });

                it("should not be valid by default", function () {
                    var v = isolateScope.isValid();
                    expect(v).toBeFalsy();
                });

                it("should have at least one day selected considered valid", function () {
                    expect(isolateScope.isValid()).toBeFalsy();

                    // this should be defaulted to the current date/time
                    expect(isolateScope.startDate).toBeDefined();
                    expect(isolateScope.startDate).toBeLessThan(new Date());

                    element.find("input.SUN").click();
                    expect(isolateScope.isValid()).toBeTruthy();

                    element.find("input.SUN").click();
                    expect(isolateScope.isValid()).toBeFalsy();

                    element.find("input.SUN").click();      // turn it back on
                    expect(isolateScope.isValid()).toBeTruthy();

                });

                it("should have an end date after the start date to be valid", function () {
                    expect(isolateScope.isValid()).toBeFalsy();

                    element.find("input.SUN").click();
                    isolateScope.data.endDateDisabled = false;   // select the end date radio
                    isolateScope.endDate = new Date();

                    expect(isolateScope.isValid()).toBeTruthy();

                    isolateScope.endDate = "2014-04-01";  // before now and a string version of the date
                    expect(isolateScope.isValid()).toBeFalsy();

                });

                it("should hydrate from strings for start and end time", function () {
                    $myscope.model = { startTime: "2014-04-01", endTime: "2014-04-02" };
                    $myscope.$apply();

                    element.find("input.SUN").click();
                    isolateScope.data.endDateDisabled = false;   // select the end date radio
                    expect(isolateScope.isValid()).toBeTruthy();

                });
            });
        });
    });
});