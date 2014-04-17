var deps = [
    "common-ui/angular",
    "test/karma/unit/angular-directives/templateUtil",
    "common-ui/angular-ui-bootstrap",
    "angular-mocks",
    "common-ui/angular-directives/dateTimePicker/dateTimePicker"
];

define(deps, function(angular, templateUtil) {

    describe("dateTimePicker", function () {
        var scope, isolateScope, element, httpBackend, templateCache;

        beforeEach(module("dateTimePicker"));

        beforeEach(inject(function ($rootScope, $httpBackend, $templateCache) {
            scope = $rootScope.$new();
            scope.startDate = new Date(2014,4,1,23,15,0);
            httpBackend = $httpBackend;
            templateCache = $templateCache;

            templateUtil.addTemplate("common-ui/angular-directives/dateTimePicker/dateTimePicker.html", httpBackend, templateCache);

        }));

        describe("controller", function () {
            var ctrl, $attrs;

            beforeEach(inject(function ($controller) {
                $attrs = {};
                ctrl = $controller("DateTimeController", { $scope: scope, $attrs: $attrs });
            }));

            it("initializes the format and increment of the default date", function () {
                expect(scope.hour).toBeNaN();
                expect(scope.hourvalues.length).toBe(12);
                expect(scope.minute).toBeNaN();
                expect(scope.minutevalues.length).toBe(60);
                expect(scope.tod).toBe("AM");
            });
        });

        function compileDirective() {
            var tpl = '<div datetime selected-date="startDate" minutes-increment="15"></div>';

            inject(function ($compile) {
                element = angular.element(tpl);
                $compile(element)(scope);
            });

            scope.$digest();
        }

        describe("datetime directive initialization from scope", function () {

            beforeEach(function() {
                compileDirective();
            });

            it("should produce 1 div and 3 selects with defaults", function() {
                //There should be 3 selects
                expect(element.find("select").length).toEqual(3);
                //One for the hours with length 12
                expect(element.find("select")[0].length).toEqual(12);
                //One for the minutes with 15 minute increments <=> select with length 4
                //If the minutes-increment on the tpl changes then this length will change
                expect(element.find("select")[1].length).toEqual(4);
                //And one for AM/PM with length 2
                expect(element.find("select")[2].length).toEqual(2);


                //Since we told the datetime directive to use the scope.startDate
                //we need to verify the selected hours, minutes, and tod match
                expect(element.find("select")[0].value).toEqual("10");
                expect(element.find("select")[1].value).toEqual("1");
                expect(element.find("select")[2].value).toEqual("1");
            });
        });
    });
});