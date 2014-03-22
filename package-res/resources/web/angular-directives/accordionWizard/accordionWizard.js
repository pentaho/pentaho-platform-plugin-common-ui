/*!
 The MIT License

 Copyright (c) 2012-2014 the AngularUI Team, https://github.com/organizations/angular-ui/teams/291112

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

/* Based on https://github.com/angular-ui/bootstrap/tree/master/src/accordion */

define([
  'common-ui/angular'
],
    function (angular) {
      var templatePath = "";
      if( typeof(CONTEXT_PATH) != "undefined" ) {
        templatePath = CONTEXT_PATH + 'content/common-ui/resources/web/angular-directives/accordionWizard/';
      } else {
        templatePath = 'angular-directives/accordionWizard/';
      }
      angular.module('accordionWizard', ['ui.bootstrap.collapse'])

          .constant('accordionConfig', {
            closeOthers: true
          })

          .controller('AccordionWizardController', ['$scope', '$attrs', 'accordionConfig', function ($scope, $attrs, accordionConfig) {

            // This array keeps track of the accordion groups
            this.groups = [];

            // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
            this.closeOthers = function (openGroup) {
              var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
              if (closeOthers) {
                angular.forEach(this.groups, function (group) {
                  if (group !== openGroup) {
                    group.isOpen = false;
                  }
                });
              }
            };

            // This is called from the accordion-group directive to add itself to the accordion
            this.addGroup = function (groupScope) {
              var that = this;
              this.groups.push(groupScope);

              groupScope.$on('$destroy', function (event) {
                that.removeGroup(groupScope);
              });
            };

            // This is called from the accordion-group directive when to remove itself
            this.removeGroup = function (group) {
              var index = this.groups.indexOf(group);
              if (index !== -1) {
                this.groups.splice(index, 1);
              }
            };

          }])

        // The accordion directive simply sets up the directive controller
        // and adds an accordion CSS class to itself element.
          .directive('accordionWizard', function () {
            return {
              restrict: 'EA',
              controller: 'AccordionWizardController',
              transclude: true,
              replace: false,
              templateUrl: templatePath + 'accordionWizard.html'
            };
          })

        // The accordion-group directive indicates a block of html that will expand and collapse in an accordion
          .directive('accordionWizardGroup', function ($parse) {
            return {
              require: '^accordionWizard',         // We need this directive to be inside an accordion
              restrict: 'EA',
              transclude: true,              // It transcludes the contents of the directive into the template
              replace: true,                // The element containing the directive will be replaced with the template
              templateUrl: templatePath + 'accordionWizardGroup.html',
              scope: {
                heading: '@',               // Interpolate the heading attribute onto this scope
                isOpen: '=?',
                isDisabled: '=?',
                saveText: "@",
                cancelText: "@",
                editText: "@",
                summary: "@",
                _onSave: "&onSave",
                _onCancel: "&onCancel",
                canSave: "&canSave"
              },
              controller: function ($scope, $attrs) {
                this.setHeading = function (element) {
                  this.heading = element;
                };

                // set our labels from attributes or defaults if none provided
                $attrs.$observe( 'saveText', function( val ) {
                  $scope.saveText = angular.isDefined( val ) ? val : 'save';
                });
                $attrs.$observe( 'cancelText', function( val ) {
                  $scope.cancelText = angular.isDefined( val ) ? val : 'cancel';
                });
                $attrs.$observe( 'editText', function( val ) {
                  $scope.editText = angular.isDefined( val ) ? val : 'edit';
                });
                $attrs.$observe( 'summary', function( val ) {
                  $scope.summary = angular.isDefined( val ) ? val : '';
                });

              },
              link: function (scope, element, attrs, accordionCtrl) {
                accordionCtrl.addGroup(scope);

                scope.$watch('isOpen', function (value) {
                  if (value) {
                    accordionCtrl.closeOthers(scope);
                  }
                });

                scope.toggleOpen = function () {
                  if (!scope.isDisabled) {
                    scope.isOpen = !scope.isOpen;
                  }
                };

                scope.setSummary = function (summary) {
                  scope.summary = summary;
                };

                scope.saveSettings = function () {
                  var closeOnSave = true;
                  if (scope._onSave) {
                    var ret = scope._onSave();
                    if( typeof(ret) != 'undefined' ) {
                      closeOnSave = ret;
                    }
                  }
                  scope.isOpen = !closeOnSave;
                };
                scope.cancelSettings = function () {
                  var closeOnCancel = true;
                  if(scope._onCancel) {
                    var ret = scope._onCancel();
                    if( typeof(ret) != 'undefined' ) {
                      closeOnCancel = ret;
                    }
                  }
                  scope.isOpen = !closeOnCancel;
                };
              }
            };
          })

        // Use accordion-heading below an accordion-group to provide a heading containing HTML
        // <accordion-wizard-group>
        //   <accordion-wizard-heading>Heading containing HTML - <img src="..."></accordion-wizard-heading>
        // </accordion-wizard-group>
          .directive('accordionWizardHeading', function () {
            return {
              restrict: 'EA',
              transclude: true,   // Grab the contents to be used as the heading
              template: '',       // In effect remove this element!
              replace: true,
              require: '^accordionWizardGroup',


              compile: function(element, attr, transclude) {
                return function link(scope, element, attr, accordionGroupCtrl) {
                  // Pass the heading to the accordion-group controller
                  // so that it can be transcluded into the right place in the template
                  // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
                  accordionGroupCtrl.setHeading(transclude(scope, function () {
                  }));
                }
              }

            };
          })

        // Use in the accordion-group template to indicate where you want the heading to be transcluded
        // You must provide the property on the accordion-group controller that will hold the transcluded element
        // <div class="accordion-wizard-group">
        //   <div class="accordion-wizard-heading" ><a ... accordion-transclude="heading">...</a></div>
        //   ...
        // </div>
          .directive('accordionWizardTransclude', function () {
            return {
              require: '^accordionWizardGroup',
              link: function (scope, element, attr, controller) {
                scope.$watch(function () {
                  return controller[attr.accordionWizardTransclude];
                }, function (heading) {
                  if (heading) {
                    element.html('');
                    element.append(heading);
                  }
                });
              }
            };
          });

    }
);