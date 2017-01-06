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

define([
    'common-ui/angular'
  ],
  function (angular) {
    angular.module('common.schedule', [])

      .directive('scheduleSelector', function ($compile) {

        var getDirective = function(selectedSchedule) {
          var template = '';
          selectedSchedule = angular.lowercase(selectedSchedule);
          switch(selectedSchedule) {
            case 'daily':
              template = '<div daily-schedule ng-model="model"></div>';
              break;
            case 'weekly':
              template = "<div weekly weekly-label=\"{{'SCHEDULE.LABEL.DaysOfWeek' | i18n}}\" " +
                  "start-label=\"{{'SCHEDULE.LABEL.Start' | i18n}}\" " +
                  "until-label=\"{{'SCHEDULE.LABEL.Until' | i18n}}\" " +
                  "no-end-label=\"{{'SCHEDULE.LABEL.NoEndDate' | i18n}}\" " +
                  "end-by-label=\"{{'SCHEDULE.LABEL.EndBy' | i18n}}\" " +
                  "at-label=\"{{'SCHEDULE.LABEL.At' | i18n}}\" " +
                  "weekly-recurrence-info='model'></div>";
              break;
            case 'monthly':
              template = '<div monthly-schedule ng-model="model"></div>';
              break;
            case 'yearly':
              template = '<div yearly-schedule ng-model="model"></div>';
              break;
            case 'never':
              template = '<div never-schedule model="model"></div>';
              break;
          }

          return template;
        }

        var linker = function(scope, element) {

          scope.isValid = false; // initialize to false when created

          scope.sessionModelMap = {}; // initialize session model holder

          scope.$watch('type',function(value) {

            var sessionModel = scope.sessionModelMap[value];
            if(sessionModel){
              // use session model if exists
              scope.model = angular.copy(sessionModel);
            }
            else{
              if(scope.saved && (scope.saved.type === value)){
                // use saved model if exists
                scope.model = angular.copy(scope.saved);
              }
            }

            // compile dynamic directive
            element.empty(); // remove existing contents
            element.html(getDirective(value)).show();
            $compile(element.contents())(scope);

            // inject type to model object when type is modified
            if(scope.model){
              scope.model.type = value;
            }
          });

          scope.$watch('model',function(newValue, oldValue) {
            if(scope.model){

              // inject type to model object when model is modified
              scope.model.type = scope.type;
              scope.model.uiPassParam = angular.uppercase(scope.type);

              if(!angular.equals(newValue, oldValue)){

                // update session model state
                scope.sessionModelMap[scope.type] = angular.copy(scope.model);

                // force validation on model change
                scope.validateSchedule();
              }
            }
          });

          // tell child directives (if listening) to trigger validation
          scope.validateSchedule = function(){
            var eventName = 'scheduleSelector:isValidRequest:' +  angular.lowercase(scope.type);
            scope.$broadcast (eventName);
          }

          // listen for validation response
          scope.$on('scheduleSelector:isValidResponse', function(e, data) {
            scope.isValid = data; // update bound model
          });

          // listen for save event
          scope.$on('scheduleSelector:onSave', function(e) {
            // re-initialize
            scope.sessionModelMap = {};
          });

          // listen for reset event
          scope.$on('scheduleSelector:onReset', function(e) {

            // re-initialize
            scope.sessionModelMap = {};
            if(scope.saved && (scope.saved.type === scope.type)){
              scope.model = angular.copy(scope.saved); // always use saved model if exists
            }

            // re-compile dynamic directive
            element.empty(); // remove existing contents
            element.html(getDirective(scope.type)).show();
            $compile(element.contents())(scope);
          });
        }

        return {
          restrict: "EA",
          replace: true,
          link: linker,
          scope: {
            model: '=',
            type: '=',
            saved: '=',
            isValid: '='
          }
        };
      })

      .directive('neverSchedule', function() {
        return {
          restrict: 'EA',
          replace: 'true',
          template: '<span>{{ "SCHEDULE.Never.Msg" | i18n }}</span>',
          scope: {
            model: '='
          },
          link: function(scope, element){

            // listen for validation requests from parent directive
            var eventName = 'scheduleSelector:isValidRequest:never';
            var unregister = scope.$on(eventName, function() {
              var isValid = scope.validateNever();
              scope.$emit('scheduleSelector:isValidResponse', isValid);
            });

            // clean up
            element.on('$destroy', function() {
              unregister(); // unregister above observer when directive is destroyed
            });

          },
          controller: ['$scope', function($scope) {
            $scope.model = {}; // clear model

            $scope.validateNever = function(){
              return true; // nothing to validate. always return true
            }
          }]
        };
      })

      .directive('dailySchedule', function() {
        return {
          restrict: 'EA',
          replace: 'true',
          template: '<div>{{model.type}}</div>',
          controller: ['$scope', function($scope) {
            $scope.model = {}; // clear model
          }]
        };
      })

      .directive('monthlySchedule', function() {
        return {
          restrict: 'EA',
          replace: 'true',
          template: '<div>{{type}}</div>',
          link: function(scope, element, attributes) {
          },
          controller: ['$scope', function($scope) {
            $scope.model = {}; // clear model
          }]
        };
      })

      .directive('yearlySchedule', function() {
        return {
          restrict: 'EA',
          replace: 'true',
          template: '<div>{{type}}</div>',
          link: function(scope, element, attributes) {
          },
          controller: ['$scope', function($scope) {
            $scope.model = {}; // clear model
          }]
        };
      });
  }
);
