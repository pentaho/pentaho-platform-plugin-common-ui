define([
  //'angular-mocks',
  "common-ui/angular",
  "./templateUtil",
  "dojo/parser",
  "dojo/ready",
  "dijit/registry",
  "common-ui/angular-ui-bootstrap",
  "common-ui/angular-directives/dateTimePicker/dateTimePicker",
  "common-ui/angular-directives/angular-dojo/angular-dojo"
], function (angular, templateUtil, dojoParser, ready, registry) {

  xdescribe("dateTimePicker", function () {
    var scope, isolateScope, element, httpBackend, templateCache, timeout;

    beforeEach(module("angular-dojo"));
    beforeEach(module("dateTimePicker"));

    beforeEach(inject(function ($rootScope, $httpBackend, $templateCache, $timeout) {
      scope = $rootScope.$new();
      scope.startDate = new Date(2014, 4, 1, 23, 15, 0);
      httpBackend = $httpBackend;
      templateCache = $templateCache;
      timeout = $timeout;
      templateUtil.addTemplate("common-ui/angular-directives/dateTimePicker/dateTimePicker.html", httpBackend, templateCache);
    }));

    afterEach(function () {
      scope = isolateScope = element = httpBackend = templateCache = timeout = undefined;
    });

    describe("controller", function () {
      var ctrl, $attrs;

      beforeEach(inject(function ($controller) {
        $attrs = {};
        ctrl = $controller("DateTimeController", {$scope: scope, $attrs: $attrs});
      }));

      it("initializes the format and increment of the default date", function () {
        expect(scope.hour).toBeNaN();
        expect(scope.hourvalues.length).toBe(12);
        expect(scope.minute).toBeNaN();
        expect(scope.minutevalues.length).toBe(60);
        expect(scope.tod).toBe("AM");
      });
    });

    function compileDirective(template) {
      var compiled;
      inject(function (_$compile_) {
        element = angular.element(template);
        compiled = _$compile_(element)(scope);
      });

      scope.$digest();

      waitForDojo(compiled);
    }

    function waitForDojo(compiled) {
      ready(function () {
        dojoParser.parse(compiled).then(function (instances) {
          // have to do SOMETHING to give enough time for the dojo parse to complete AND get injected into the directive's dom
          for (var i = 0; i < 8000; i++) {
            // digest takes enough time, so does console.log("some string") but clutters up the output
            scope.$digest();
          }
        });
      });
    }

    // TODO: this test is always failing since upgrade to jasmine 2
    xdescribe("datetime directive initialization from scope", function () {

      beforeEach(function () {
        scope.min = new Date(2014, 1, 1);
        compileDirective('<div datetime selected-date="startDate" min-date="min" minutes-increment="15"></div>');
      });
      afterEach(function () {
        element.remove();
      });

      it("should produce 1 div and 3 selects with defaults", function () {

        timeout.flush();
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
        expect(element.find("select")[1].value).toEqual("2");
        expect(element.find("select")[2].value).toEqual("1");

        // the time elements should not be hidden by default
        expect(element.find("span[ng-hide='hideTime']").length).toEqual(1);

        console.log(element.find(".pentaho-listbox")[0]);
        expect(element.find(".pentaho-listbox")[0]).toBeDefined();
      });
    });

    // TODO: these 2 tests are always failing since upgrade to jasmine 2
    xdescribe("date only and disabled", function () {
      beforeEach(function () {
        scope.isDisabled = true;
        scope.min = new Date(2014, 1, 1);
        scope.max = new Date();
        compileDirective('<div datetime selected-date="startDate" min-date="min" max-date="max" minutes-increment="15" hide-time="true" is-disabled="isDisabled"></div>');
      });

      afterEach(function () {
        element.remove();
      });

      it("should not display not the time selection dropdowns if hide-time is true", function () {

        timeout.flush();

        isolateScope = angular.element(element).isolateScope();

        expect(isolateScope.hideTime).toBeTruthy();
        expect(element.find("span[ng-hide='hideTime'].ng-hide").length).toEqual(1);

        expect(angular.element(element).find(".pentaho-listbox")[0]).toBeDefined();

      });

      it("should not disabled the widgets if is-disabled is set to true", function () {

        timeout.flush();

        var datePickerListBox = angular.element(element).find(".pentaho-listbox")[0];
        expect(datePickerListBox).toBeDefined();

        var disabledDatePickerTextBox = angular.element(element).find(".pentaho-listbox input[type='text'][disabled]")[0];
        expect(disabledDatePickerTextBox).toBeDefined();

        var dijitCalendarWidget = registry.byNode(datePickerListBox);
        expect(dijitCalendarWidget).toBeDefined();
        expect(dijitCalendarWidget.disabled).toBeTruthy();

        expect(angular.element(element).find(".pentaho-dropdownbutton-inner.disabled")[0]).toBeDefined();

      });
    });

  });
});
