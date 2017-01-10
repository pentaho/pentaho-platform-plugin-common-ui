define([
  'angular-mocks',
  'common-ui/angular',
  './templateUtil.js',
  'common-ui/angular-ui-bootstrap',
  'common-ui/angular-directives/accordionWizard/accordionWizard'
], function (angular, templateUtil) {

  xdescribe('accordionWizard', function () {
    var $scope, httpBackend, templateCache;

    var DEFAULTS = {
      EDIT_LINK_TEXT: "edit",
      SAVE_BUTTON_TEXT: "save",
      CANCEL_BUTTON_TEXT: "cancel",
      SUMMARY_TEXT: ""
    }

    beforeEach(module('accordionWizard'));

    beforeEach(inject(function ($rootScope, $httpBackend, $templateCache) {
      $scope = $rootScope;
      httpBackend = $httpBackend;
      templateCache = $templateCache;

      templateUtil.addTemplate("common-ui/angular-directives/accordionWizard/accordionWizard.html", httpBackend, templateCache);
      templateUtil.addTemplate("common-ui/angular-directives/accordionWizard/accordionWizardGroup.html", httpBackend, templateCache);

    }));

    describe('controller', function () {

      var ctrl, $element, $attrs;
      beforeEach(inject(function ($controller) {
        $attrs = {};
        $element = {};
        ctrl = $controller('AccordionWizardController', {$scope: $scope, $element: $element, $attrs: $attrs});
      }));

      describe('addGroup', function () {
        it('adds a the specified panel to the collection', function () {
          var group1, group2;
          ctrl.addGroup(group1 = $scope.$new());
          ctrl.addGroup(group2 = $scope.$new());
          expect(ctrl.groups.length).toBe(2);
          expect(ctrl.groups[0]).toBe(group1);
          expect(ctrl.groups[1]).toBe(group2);
        });
      });

      describe('closeOthers', function () {
        var group1, group2, group3;
        beforeEach(function () {
          ctrl.addGroup(group1 = {isOpen: true, $on: angular.noop});
          ctrl.addGroup(group2 = {isOpen: true, $on: angular.noop});
          ctrl.addGroup(group3 = {isOpen: true, $on: angular.noop});
        });
        it('should close other panels if close-others attribute is not defined', function () {
          delete $attrs.closeOthers;
          ctrl.closeOthers(group2);
          expect(group1.isOpen).toBe(false);
          expect(group2.isOpen).toBe(true);
          expect(group3.isOpen).toBe(false);
        });

        it('should close other panels if close-others attribute is true', function () {
          $attrs.closeOthers = 'true';
          ctrl.closeOthers(group3);
          expect(group1.isOpen).toBe(false);
          expect(group2.isOpen).toBe(false);
          expect(group3.isOpen).toBe(true);
        });

        it('should not close other panels if close-others attribute is false', function () {
          $attrs.closeOthers = 'false';
          ctrl.closeOthers(group2);
          expect(group1.isOpen).toBe(true);
          expect(group2.isOpen).toBe(true);
          expect(group3.isOpen).toBe(true);
        });

        describe('setting accordionConfig', function () {
          var originalCloseOthers;
          beforeEach(inject(function (accordionConfig) {
            originalCloseOthers = accordionConfig.closeOthers;
            accordionConfig.closeOthers = false;
          }));
          afterEach(inject(function (accordionConfig) {
            // return it to the original value
            accordionConfig.closeOthers = originalCloseOthers;
          }));

          it('should not close other panels if accordionConfig.closeOthers is false', function () {
            ctrl.closeOthers(group2);
            expect(group1.isOpen).toBe(true);
            expect(group2.isOpen).toBe(true);
            expect(group3.isOpen).toBe(true);
          });
        });
      });

      describe('removeGroup', function () {
        it('should remove the specified panel', function () {
          var group1, group2, group3;
          ctrl.addGroup(group1 = $scope.$new());
          ctrl.addGroup(group2 = $scope.$new());
          ctrl.addGroup(group3 = $scope.$new());
          ctrl.removeGroup(group2);
          expect(ctrl.groups.length).toBe(2);
          expect(ctrl.groups[0]).toBe(group1);
          expect(ctrl.groups[1]).toBe(group3);
        });
        it('should ignore remove of non-existing panel', function () {
          var group1, group2;
          ctrl.addGroup(group1 = $scope.$new());
          ctrl.addGroup(group2 = $scope.$new());
          expect(ctrl.groups.length).toBe(2);
          ctrl.removeGroup({});
          expect(ctrl.groups.length).toBe(2);
        });
      });
    });

    describe('accordion-group', function () {

      var scope, $compile;
      var element, groups;
      var findGroupLink = function (index) {
        return groups.eq(index).find('.accordion-toggle-text').eq(0);
      };
      var findGroupBody = function (index) {
        return groups.eq(index).find('.accordion-collapse').eq(0);
      };
      var findGroupBodyInner = function (index) {
        return groups.eq(index).find('.accordion-collapse .accordion-inner').eq(0);
      };
      var findGroupHeadingContent = function (index) {
        return groups.eq(index).find('.accordion-heading-content').eq(0);
      };
      var findGroupSaveButton = function (index) {
        return groups.eq(index).find('.accordion-save-button').eq(0);
      };
      var findGroupCancelButton = function (index) {
        return groups.eq(index).find('.accordion-cancel-button').eq(0);
      };
      var findGroupSummary = function (index) {
        return groups.eq(index).find('.summary-label').eq(0);
      };


      beforeEach(inject(function (_$rootScope_, _$compile_) {
        scope = _$rootScope_;
        $compile = _$compile_;
      }));

      afterEach(function () {
        element = groups = scope = $compile = undefined;
      });

      describe('with static panels', function () {
        beforeEach(function () {
          var tpl =
              '<accordion-wizard>' +
              '<accordion-wizard-group heading="title 1">Content 1</accordion-wizard-group>' +
              '<accordion-wizard-group heading="title 2">Content 2</accordion-wizard-group>' +
              '</accordion-wizard>'

          element = angular.element(tpl);
          $compile(element)(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
        });
        afterEach(function () {
          element.remove();
        });

        it('should create accordion panels with content', function () {
          expect(groups.length).toEqual(2);
          expect(findGroupHeadingContent(0).text()).toEqual('title 1');
          expect(findGroupLink(0).text()).toEqual(DEFAULTS.EDIT_LINK_TEXT);
          expect(findGroupBodyInner(0).text().trim()).toEqual('Content 1');
          expect(findGroupSaveButton(0).text().trim()).toEqual(DEFAULTS.SAVE_BUTTON_TEXT);
          expect(findGroupCancelButton(0).text().trim()).toEqual(DEFAULTS.CANCEL_BUTTON_TEXT);
          expect(findGroupSummary(0).text().trim()).toEqual(DEFAULTS.SUMMARY_TEXT);

          expect(findGroupHeadingContent(1).text()).toEqual('title 2');
          expect(findGroupLink(1).text()).toEqual(DEFAULTS.EDIT_LINK_TEXT);
          expect(findGroupBodyInner(1).text().trim()).toEqual('Content 2');
          expect(findGroupSaveButton(1).text().trim()).toEqual(DEFAULTS.SAVE_BUTTON_TEXT);
          expect(findGroupCancelButton(1).text().trim()).toEqual(DEFAULTS.CANCEL_BUTTON_TEXT);
          expect(findGroupSummary(0).text().trim()).toEqual(DEFAULTS.SUMMARY_TEXT);
        });

        it('should change selected element on click', function () {
          findGroupLink(0).click();
          scope.$digest();
          expect(findGroupBody(0).scope().isOpen).toBe(true);

          findGroupLink(1).click();
          scope.$digest();
          expect(findGroupBody(0).scope().isOpen).toBe(false);
          expect(findGroupBody(1).scope().isOpen).toBe(true);
        });

        it('should toggle element on click', function () {
          findGroupLink(0).click();
          scope.$digest();
          expect(findGroupBody(0).scope().isOpen).toBe(true);
          findGroupLink(0).click();
          scope.$digest();
          expect(findGroupBody(0).scope().isOpen).toBe(false);
        });
      });

      describe('with dynamic panels', function () {
        var model;
        beforeEach(function () {
          var tpl =
              '<accordion-wizard>' +
              '<accordion-wizard-group ng-repeat="group in groups" heading="{{group.name}}">{{group.content}}</accordion-wizard-group>' +
              '</accordion-wizard>';
          element = angular.element(tpl);
          model = [
            {name: 'title 1', content: 'Content 1'},
            {name: 'title 2', content: 'Content 2'}
          ];

          $compile(element)(scope);
          scope.$digest();
        });

        it('should have no panels initially', function () {
          groups = element.find('.accordion-group');
          expect(groups.length).toEqual(0);
        });

        it('should have a panel for each model item', function () {
          scope.groups = model;
          scope.$digest();
          groups = element.find('.accordion-group');
          expect(groups.length).toEqual(2);
          expect(findGroupHeadingContent(0).text()).toEqual('title 1');
          expect(findGroupBodyInner(0).text().trim()).toEqual('Content 1');
          expect(findGroupHeadingContent(1).text()).toEqual('title 2');
          expect(findGroupBodyInner(1).text().trim()).toEqual('Content 2');
        });

        it('should react properly on removing items from the model', function () {
          scope.groups = model;
          scope.$digest();
          groups = element.find('.accordion-group');
          expect(groups.length).toEqual(2);

          scope.groups.splice(0, 1);
          scope.$digest();
          groups = element.find('.accordion-group');
          expect(groups.length).toEqual(1);
        });
      });

      describe('is-open attribute', function () {
        beforeEach(function () {
          var tpl =
              '<accordion-wizard>' +
              '<accordion-wizard-group heading="title 1" is-open="open.first">Content 1</accordion-wizard-group>' +
              '<accordion-wizard-group heading="title 2" is-open="open.second">Content 2</accordion-wizard-group>' +
              '</accordion-wizard>';
          element = angular.element(tpl);
          scope.open = {first: false, second: true};
          $compile(element)(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
        });

        it('should open the panel with isOpen set to true', function () {
          expect(findGroupBody(0).scope().isOpen).toBe(false);
          expect(findGroupBody(1).scope().isOpen).toBe(true);
        });

        it('should toggle variable on element click', function () {
          findGroupLink(0).click();
          scope.$digest();
          expect(scope.open.first).toBe(true);

          findGroupLink(0).click();
          scope.$digest();
          expect(scope.open.second).toBe(false);
        });
      });

      describe('is-open attribute with dynamic content', function () {
        beforeEach(function () {
          var tpl =
              '<accordion-wizard>' +
              '<accordion-wizard-group heading="title 1" is-open="open1"><div ng-repeat="item in items">{{item}}</div></accordion-wizard-group>' +
              '<accordion-wizard-group heading="title 2" is-open="open2">Static content</accordion-wizard-group>' +
              '</accordion-wizard>';
          element = angular.element(tpl);
          scope.items = ['Item 1', 'Item 2', 'Item 3'];
          scope.open1 = true;
          scope.open2 = false;
          angular.element(document.body).append(element);
          $compile(element)(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
        });

        afterEach(function () {
          element.remove();
        });

        it('should have visible panel body when the group with isOpen set to true', function () {
          expect(findGroupBody(0)[0].clientHeight).not.toBe(0);
          expect(findGroupBody(1)[0].clientHeight).toBe(0);
        });
      });

      describe('is-open attribute with dynamic groups', function () {
        beforeEach(function () {
          var tpl =
              '<accordion-wizard>' +
              '<accordion-wizard-group ng-repeat="group in groups" heading="{{group.name}}" is-open="group.open">{{group.content}}</accordion-wizard-group>' +
              '</accordion-wizard>';
          element = angular.element(tpl);
          scope.groups = [
            {name: 'title 1', content: 'Content 1', open: false},
            {name: 'title 2', content: 'Content 2', open: true}
          ];
          $compile(element)(scope);
          scope.$digest();

          groups = element.find('.accordion-group');
        });

        it('should have visible group body when the group with isOpen set to true', function () {
          expect(findGroupBody(0).scope().isOpen).toBe(false);
          expect(findGroupBody(1).scope().isOpen).toBe(true);
        });

        it('should toggle element on click', function () {
          findGroupLink(0).click();
          scope.$digest();
          expect(findGroupBody(0).scope().isOpen).toBe(true);
          expect(scope.groups[0].open).toBe(true);

          findGroupLink(0).click();
          scope.$digest();
          expect(findGroupBody(0).scope().isOpen).toBe(false);
          expect(scope.groups[0].open).toBe(false);
        });
      });

      describe('`is-disabled` attribute', function () {
        var groupBody;
        beforeEach(function () {
          var tpl =
              '<accordion-wizard>' +
              '<accordion-wizard-group heading="title 1" is-disabled="disabled">Content 1</accordion-wizard-group>' +
              '</accordion-wizard>';
          element = angular.element(tpl);
          scope.disabled = true;
          $compile(element)(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
          groupBody = findGroupBody(0);
        });

        it('should open the panel with isOpen set to true', function () {
          expect(groupBody.scope().isOpen).toBeFalsy();
        });

        it('should not toggle if disabled', function () {
          findGroupLink(0).click();
          scope.$digest();
          expect(groupBody.scope().isOpen).toBeFalsy();
        });

        it('should toggle after enabling', function () {
          scope.disabled = false;
          scope.$digest();
          expect(groupBody.scope().isOpen).toBeFalsy();

          findGroupLink(0).click();
          scope.$digest();
          expect(groupBody.scope().isOpen).toBeTruthy();
        });
      });

      describe('accordion-heading element', function () {
        beforeEach(function () {
          var tpl =
              '<accordion-wizard ng-init="a = [1,2,3]">' +
              '<accordion-wizard-group heading="I get overridden">' +
              '<accordion-wizard-heading>Heading Element <span ng-repeat="x in a">{{x}}</span> </accordion-wizard-heading>' +
              'Body' +
              '</accordion-wizard-group>' +
              '</accordion-wizard>';
          element = $compile(tpl)(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
        });
        it('transcludes the <accordion-wizard-heading> content into the heading link', function () {
          expect(findGroupHeadingContent(0).text()).toBe('Heading Element 123 ');
        });
        it('attaches the same scope to the transcluded heading and body', function () {
          expect(findGroupHeadingContent(0).find('span').scope().$id).toBe(findGroupBody(0).find('span').scope().$id);
        });

      });

      describe('accordion-heading attribute', function () {
        beforeEach(function () {
          var tpl =
              '<accordion-wizard ng-init="a = [1,2,3]">' +
              '<accordion-wizard-group heading="I get overridden">' +
              '<div accordion-wizard-heading>Heading Element <span ng-repeat="x in a">{{x}}</span> </div>' +
              'Body' +
              '</accordion-wizard-group>' +
              '</accordion-wizard>';
          element = $compile(tpl)(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
        });
        it('transcludes the <accordion-wizard-heading> content into the heading link', function () {
          expect(findGroupHeadingContent(0).text()).toBe('Heading Element 123 ');
        });
        it('attaches the same scope to the transcluded heading and body', function () {
          expect(findGroupHeadingContent(0).find('span').scope().$id).toBe(findGroupBody(0).find('span').scope().$id);
        });

      });

      describe('accordion-heading, with repeating accordion-groups', function () {
        it('should clone the accordion-heading for each group', function () {
          element = $compile('<accordion-wizard><accordion-wizard-group ng-repeat="x in [1,2,3]"><accordion-wizard-heading>{{x}}</accordion-wizard-heading></accordion-wizard-group></accordion-wizard>')(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
          expect(groups.length).toBe(3);
          expect(findGroupHeadingContent(0).text()).toBe('1');
          expect(findGroupHeadingContent(1).text()).toBe('2');
          expect(findGroupHeadingContent(2).text()).toBe('3');
        });
      });

      describe('accordion-heading attribute, with repeating accordion-groups', function () {
        it('should clone the accordion-heading for each group', function () {
          element = $compile('<accordion-wizard><accordion-wizard-group ng-repeat="x in [1,2,3]"><div accordion-wizard-heading>{{x}}</div></accordion-wizard-group></accordion-wizard>')(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
          expect(groups.length).toBe(3);
          expect(findGroupHeadingContent(0).text()).toBe('1');
          expect(findGroupHeadingContent(1).text()).toBe('2');
          expect(findGroupHeadingContent(2).text()).toBe('3');
        });
      });

      describe('text attributes', function () {
        beforeEach(function () {
          var tpl =
              '<accordion-wizard>' +
              '<accordion-wizard-group heading="title 1" save-text="{{first.Save}}" cancel-text="{{first.Cancel}}" edit-text="{{first.Edit}}" summary="{{first.Summary}}">Content 1</accordion-wizard-group>' +
              '<accordion-wizard-group heading="title 2" save-text="SaveMe" cancel-text="CancelMe" edit-text="EditMe" summary="SummaryText">Content 2</accordion-wizard-group>' +
              '</accordion-wizard>';
          element = angular.element(tpl);
          scope.first = {Save: "SaveMe", Edit: "EditMe", Cancel: "CancelMe", Summary: "SummaryText"};
          $compile(element)(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
        });

        it('should set the text from scope variables', function () {
          expect(findGroupLink(0).text()).toEqual("EditMe");
          expect(findGroupBodyInner(0).text().trim()).toEqual('Content 1');
          expect(findGroupSaveButton(0).text().trim()).toEqual("SaveMe");
          expect(findGroupCancelButton(0).text().trim()).toEqual("CancelMe");
          expect(findGroupSummary(0).text()).toEqual("SummaryText");
        });

        it('should set the text', function () {
          expect(findGroupLink(1).text()).toEqual("EditMe");
          expect(findGroupBodyInner(1).text().trim()).toEqual('Content 2');
          expect(findGroupSaveButton(1).text().trim()).toEqual("SaveMe");
          expect(findGroupCancelButton(1).text().trim()).toEqual("CancelMe");
          expect(findGroupSummary(1).text()).toEqual("SummaryText");
        });
      });

      // buildSummary
      describe('onSave & onCancel', function () {
        beforeEach(function () {
          var tpl =
              '<accordion-wizard>' +
              '<accordion-wizard-group heading="title 1" can-save="panel1.canSave()" summary="{{panel1.summary}}" on-save="panel1.onSave()" on-cancel="panel1.onCancel()">Content 1</accordion-wizard-group>' +
              '<accordion-wizard-group heading="title 2" >Content 2</accordion-wizard-group>' +
              '</accordion-wizard>'

          element = angular.element(tpl);
          scope.panel1 = {
            canSave: function () {
              return true;
            },
            onSave: function () {
              scope.panel1.summary = "Saved";
            },
            onCancel: function () {
              scope.panel1.summary = "Canceled";
            },
            summary: "Nothing yet"
          };

          $compile(element)(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
        });
        afterEach(function () {
          element.remove();
        });

        it('should set call onSave when Save button clicked', function () {
          expect(findGroupSaveButton(0).attr('disabled')).toBeUndefined();
          expect(findGroupSummary(0).text()).toBe("Nothing yet");
          findGroupSaveButton(0).click();
          expect(findGroupSummary(0).text()).toBe("Saved");
        });

        it('should set call onCancel when Cancel button clicked', function () {
          expect(findGroupCancelButton(0).attr('disabled')).toBeUndefined();
          expect(findGroupSummary(0).text()).toBe("Nothing yet");
          findGroupCancelButton(0).click();
          expect(findGroupSummary(0).text()).toBe("Canceled");
        });
      });

      // canSave
      describe('canSave', function () {
        beforeEach(function () {
          var tpl =
              '<accordion-wizard>' +
              '<accordion-wizard-group heading="title 1" can-save="panel1.canSave()">Content 1</accordion-wizard-group>' +
              '<accordion-wizard-group heading="title 2" can-save="panel2.canSave()">Content 2</accordion-wizard-group>' +
              '<accordion-wizard-group heading="title 3" >Content 3</accordion-wizard-group>' +
              '</accordion-wizard>'

          element = angular.element(tpl);
          scope.test = true;
          scope.panel1 = {
            canSave: function () {
              return scope.test;
            }
          };

          scope.panel2 = {
            canSave: function () {
              return false;
            }
          }

          $compile(element)(scope);
          scope.$digest();
          groups = element.find('.accordion-group');
        });
        afterEach(function () {
          element.remove();
        });

        it('should toggle the save button based on the canSave binding', function () {
          expect(findGroupSaveButton(0).attr('disabled')).toBeUndefined();
          expect(findGroupSaveButton(1).attr('disabled')).toBe('disabled');
          expect(findGroupSaveButton(2).attr('disabled')).toBe('disabled');

          // make sure it responds to scope modifications
          scope.test = false;
          scope.$apply();
          expect(findGroupSaveButton(0).attr('disabled')).toBe('disabled');

        });

      });

    });
  });
});
