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
  'common-ui/angular',
  'common-ui/angular-directives/folderBrowser/folderBrowser',
  'common-ui/jquery'
];

define(deps, function (angular, folderBrowser) {

  xdescribe('unit testing angular tree control directive', function () {
    var $compile, $rootScope, element, sampleData;

    beforeEach(function () {
      module('folderBrowser');
      inject(function ($injector) {
        $compile = $injector.get('$compile');
        $rootScope = $injector.get('$rootScope');
        sampleData = {
          "id": "1",
          "name": "",
          "localizedName": "",
          "isFolder": "true",
          "path": "/",
          "children": [
            {
              "id": "2",
              "name": "home",
              "localizedName": "Home",
              "isFolder": "true",
              "path": "/home",
              "children": [
                {
                  "id": "3",
                  "name": "suzy",
                  "localizedName": "suzy",
                  "isFolder": "true",
                  "path": "/home/suzy",
                  "children": [],
                  "permissions": {
                    "read": "true",
                    "write": "true",
                    "execute": "true"
                  }
                }
              ],
              "permissions": {
                "read": "true",
                "write": "false",
                "execute": "false"
              }
            },
            {
              "id": "4",
              "name": "public",
              "localizedName": "Public",
              "isFolder": "true",
              "path": "/public",
              "children": [],
              "permissions": {
                "read": "true",
                "write": "false",
                "execute": "false"
              }
            }
          ]
        };
      });
    });


    describe('testing that tree is rendered correctly', function () {
      beforeEach(function () {
        $rootScope.$new();
        $rootScope.treedata = sampleData;
        element = $compile('<div  treecontrol selected-node="selectednode" node-children="children" ext-select="extselect" add-folder="addfolder" tree-model="treedata">{{node.name}}</div>')($rootScope);
        $rootScope.$digest();
      });
      afterEach(function () {
        element.remove();
      });

      it('should render only first level of the tree thanks to ng-if', function () {
        expect(element.find('ul').length).toBe(1);
      });

      it('should render all the children of the first level', function () {
        expect(element.find('li').length).toBe(2);
      });

      it('should display first level parents as collapsed', function () {
        expect(element.find('li.tree-collapsed').length).toBe(2);
      });

      it('should display elements with 0 children as leafs', function () {
        expect(element.find('li.tree-leaf').length).toBe(0);
      });

      it('should render sub tree once an item is expanded with double click thanks to ng-if', function () {
        element.find('li:eq(0) .tree-label').dblclick();
        expect(element.find('li:eq(0) li').length).toBe(1);
      });

      it('should display expanded items as expanded when arrow clicked', function () {
        element.find('li:eq(0) .arrow-collapsed').click();
        expect(element.find('li:eq(0)').hasClass('tree-expanded')).toBeTruthy();
      });

      it('should not have any nodes selected initially', function () {
        expect(element.find('.tree-selected').length).toBe(0);
      });

      it('should select node when clicked', function () {
        element.find('li:eq(0) div').click();
        expect(element.find('li:eq(0) div').hasClass('tree-selected')).toBeTruthy();
      });

      it('should transclude tree labels', function () {
        expect(element.find('li:eq(0) span').text()).toBe('home');
        expect(element.find('li:eq(1) span').text()).toBe('public');
      });

      it('should update tree rendering once model changes', function () {
        $rootScope.treedata.children = [
          []
        ];
        $rootScope.$digest();
        expect(element.find('li.tree-leaf').length).toBe(0);
      });
    });

    describe('testing that all options are handled correctly', function () {
      beforeEach(function () {
        $rootScope.$new();
        $rootScope.treedata = sampleData;
        element = $compile('<div  treecontrol selected-node="selectednode" node-children="children" ext-select="extselect" add-folder="addfolder" tree-model="treedata">{{node.name}}</div>')($rootScope);
        $rootScope.$digest();
      });
      afterEach(function () {
        element.remove();
      });

      it('should publish the currently selected node on scope', function () {
        element.find('li:eq(0) div').click();
        expect($rootScope.selectednode.name).toBe('home');
      });

      it('should be able to accept alternative children variable name', function () {
        //TODO
      });

      it('should select element when extSelect binding is set', function () {
        $rootScope.extselect = {attr: "path", val: '/home'};
        $rootScope.$apply();
        expect($rootScope.selectednode.name).toBe('home');

      });

      it('should be add a folder when add folder binding is set', function () {
        //Select public folder
        $rootScope.extselect = {attr: "path", val: '/public'};
        $rootScope.$apply();
        expect($rootScope.selectednode.children.length = 0);

        //Create a folder under public
        $rootScope.addfolder = {
          id: 6,
          name: "test",
          permissions: {write: 'true'},
          localizedName: "Test",
          children: []
        };
        $rootScope.$apply();
        expect($rootScope.selectednode.children.length > 0);
      });



      it('should initialize spinner when loading binding is set', function () {
        expect(element.find('li:eq(0) .treeControlLoading div').children.length = 0);
        $rootScope.loading = true;
        $rootScope.$apply();
        expect(element.find('li:eq(0) .treeControlLoading div').children.length > 0);
      });


      it('should retain expansions after full model refresh', function () {
        var testTree = sampleData;
        $rootScope.treedata = angular.copy(testTree);
        var tpl = '<div  treecontrol selected-node="selectednode" options="treeOptions" node-children="children" ext-select="extselect" add-folder="addfolder" tree-model="treedata">{{node.name}}</div>'
        element = angular.element(tpl);
        $compile(element)($rootScope);
        $rootScope.$digest();

        element.find('li:eq(0) .arrow-collapsed').click();
        expect(element.find('li:eq(0)').hasClass('tree-expanded')).toBeTruthy();

        element.find('li:eq(0) .arrow-collapsed').click();
        expect(element.find('li:eq(0)').hasClass('tree-expanded')).toBeTruthy();

        $rootScope.treedata = angular.copy(testTree);
        $rootScope.$digest();
        expect(element.find('li:eq(0)').hasClass('tree-expanded')).toBeTruthy();
      });

      it('should retain selection after full model refresh', function () {
        var testTree = sampleData;
        $rootScope.treedata = angular.copy(testTree);
        var tpl = '<div  treecontrol selected-node="selectednode" options="treeOptions" node-children="children" ext-select="extselect" add-folder="addfolder" tree-model="treedata">{{node.name}}</div>'
        element = angular.element(tpl);
        $compile(element)($rootScope);
        $rootScope.$digest();

        element.find('li:eq(0) div').click();
        expect(element.find('.tree-selected').length).toBe(1);

        $rootScope.treedata = angular.copy(testTree);
        $rootScope.$digest();
        expect(element.find('.tree-selected').length).toBe(1);
      });
    });
  });
});
