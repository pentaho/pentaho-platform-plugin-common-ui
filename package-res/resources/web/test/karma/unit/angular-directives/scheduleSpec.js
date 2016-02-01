/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2014 Pentaho Corporation.  All rights reserved.
 */

var deps = [
  'angular-mocks',
  'common-ui/angular',
  'common-ui/angular-directives/schedule/scheduleSelector',
  'test/karma/unit/angular-directives/commonFiltersMock'
];

define(deps, function (angular) {

  xdescribe("Schedule Directives", function () {

    beforeEach(module('common.schedule'));
    beforeEach(module('common.filters.mock')); // this is a mock of the i18n filter in common.filters

    var compile, scope, scheduleSelectorElement;

    beforeEach(inject(function ($rootScope, $compile) {

      scope = $rootScope;
      compile = $compile;

      scheduleSelectorElement = angular.element('<div schedule-selector type="selectedType" model="selectedModel" is-valid="isValid" />');

      // initialize
      scope.selectedType = 'Never';
      scope.selectedModel = {};
      scope.isValid = false;

      $compile(scheduleSelectorElement)(scope);
      scope.$digest();
    }));


    it('should verify selected schedule is Never', function () {
      var directiveScope = scheduleSelectorElement.isolateScope();
      expect(scheduleSelectorElement.find("[never-schedule='']").length).toBe(1);
      expect(directiveScope.model.type).toBe('Never');

      scope.selectedModel = "{}"; // update model to trigger broadcast
      scope.$digest();
      expect(scope.isValid).toBe(true); // check valid model
    });

    it('should verify selected schedule is Daily', function () {

      scope.selectedType = "Daily";
      scope.$digest();

      var directiveScope = scheduleSelectorElement.isolateScope();
      expect(scheduleSelectorElement.find("[daily-schedule='']").length).toBe(1);
      expect(directiveScope.model.type).toBe('Daily');
    });

    it('should verify selected schedule is Weekly', function () {

      scope.selectedType = "Weekly";
      scope.$digest();

      var directiveScope = scheduleSelectorElement.isolateScope();
      expect(scheduleSelectorElement.find("[weekly='']").length).toBe(1);
      expect(directiveScope.model.type).toBe('Weekly');
    });

    it('should verify selected schedule is Monthly', function () {

      scope.selectedType = "Monthly";
      scope.$digest();

      var directiveScope = scheduleSelectorElement.isolateScope();
      expect(scheduleSelectorElement.find("[monthly-schedule='']").length).toBe(1);
      expect(directiveScope.model.type).toBe('Monthly');
    });

    it('should verify selected schedule is Yearly', function () {

      scope.selectedType = "Yearly";
      scope.$digest();

      var directiveScope = scheduleSelectorElement.isolateScope();
      expect(scheduleSelectorElement.find("[yearly-schedule='']").length).toBe(1);
      expect(directiveScope.model.type).toBe('Yearly');
    });

    it('should verify session model map is cleared on save', function () {

      scope.selectedType = "Weekly";
      scope.$digest();

      var directiveScope = scheduleSelectorElement.isolateScope();
      expect(directiveScope.type).toBe('Weekly');

      directiveScope.sessionModelMap = {data: 'test'};
      directiveScope.$broadcast('scheduleSelector:onSave');
      expect(angular.toJson(directiveScope.sessionModelMap)).toBe('{}');
    });

    it('should verify session model map is cleared on reset', function () {

      scope.selectedType = "Weekly";
      scope.$digest();

      var directiveScope = scheduleSelectorElement.isolateScope();
      expect(directiveScope.type).toBe('Weekly');

      directiveScope.sessionModelMap = {data: 'test'};
      directiveScope.$broadcast('scheduleSelector:onReset');
      expect(angular.toJson(directiveScope.sessionModelMap)).toBe('{}');
    });

    it('should verify model does not change on reset', function () {

      scope.selectedType = "Weekly";
      scope.$digest();

      var directiveScope = scheduleSelectorElement.isolateScope();
      expect(directiveScope.type).toBe('Weekly');

      directiveScope.model = {data: 'testWeekly', type: 'Weekly'}
      directiveScope.saved = {data: 'testNever', type: 'Never'};
      directiveScope.$broadcast('scheduleSelector:onReset');

      // directiveScope.model shouldn't have changed because the saved type isn't the same
      expect(angular.equals(directiveScope.model, {data: 'testWeekly', type: 'Weekly'})).toBe(true);
    });

    it('should verify saved model is copied to selected model on reset', function () {

      scope.selectedType = "Weekly";
      scope.$digest();

      var directiveScope = scheduleSelectorElement.isolateScope();
      expect(directiveScope.type).toBe('Weekly');

      directiveScope.model = {data: 'A', type: 'Weekly'}
      directiveScope.saved = {data: 'B', type: 'Weekly'};
      directiveScope.$broadcast('scheduleSelector:onReset');

      // verify that the model and saved are the same
      expect(angular.equals(directiveScope.model, directiveScope.saved)).toBe(true);

      // verify that model.data has the new value
      expect(directiveScope.model.data).toBe('B');
    });

  })

});
