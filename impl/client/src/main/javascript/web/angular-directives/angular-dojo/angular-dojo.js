/*The MIT License (MIT)

 Copyright (c) 2014 Andreas Drobisch and contributors

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

define([
  'common-ui/angular'
], function (angular) {

  if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
  }

  angular.module('angular-dojo', []).directive('dojoWidget', function ($timeout) {

    var parseProps = function (props, scope) {
      var result = {};
      if (props != undefined) {
        angular.forEach(props.split(";"), function (prop, index) {
          var propSplit = prop.split(":");
          if (scope.$parent[propSplit[1].trim()]) {
            result[propSplit[0].trim()] = scope.$parent[propSplit[1].trim()];
          } else {
            result[propSplit[0].trim()] = eval(propSplit[1].trim());
          }
        });
      }
      return result;
    };

    return {
      restrict: "A",
      replace: false,
      transclude: false,
      require: '?ngModel',
      scope: {
        'ngModel': '=?',
        'ngClick': '&',
        'ngChange': '&',
        'dojoStore': '&',
        'dojoProps': '@',
        'dojoDisplayValue': '=?',
        'dojoConstraints': '@'
      },
      link: function (scope, element, attrs, model) {
        require(["dojo/ready", attrs.dojoWidget, "dojo/on"], function (ready, DojoWidget, on) {

          ready(function () {
            scope.widget = new DojoWidget({}, element[0]);

            attrs.$observe('dojoProps', function (dojoProps) {
              scope.widget.set(parseProps(dojoProps, scope));
            });

            attrs.$observe('dojoConstraints', function (dojoConstraints) {
              var constraints = parseProps(dojoConstraints, scope);
              scope.widget.set({ "constraints": constraints });
            });

            attrs.$observe('dojoStore', function () {
              if (scope.dojoStore != undefined) {
                scope.widget.store = scope.dojoStore();
              }
            });

            attrs.$observe('ngModel', function () {
              if (scope.ngModel != undefined) {
                scope.widget.set('value', scope.ngModel);
                scope.widget.set('checked', scope.ngModel);
              }
            });

            scope.$watch('ngModel', function () {
              if (scope.ngModel != undefined) {
                scope.widget.set('value', scope.ngModel);
                scope.widget.set('checked', scope.ngModel);
              }
            });

            on(scope.widget, "blur", function () {
              if (scope.widget.displayedValue != undefined) {
                scope.dojoDisplayValue = scope.widget.displayedValue;
              }
            });

            on(scope.widget, "change", function (newValue) {
              scope.ngModel = newValue;
              $timeout(function () {
                scope.$apply();
                if (scope.ngChange != undefined) {
                  scope.ngChange();
                }
              });
            });

            on(scope.widget, 'click', function () {
              $timeout(function () {
                scope.$apply();
                if (scope.ngClick != undefined) {
                  scope.ngClick();
                }
              });
            });
          });
        });
      }
    };
  });
});

