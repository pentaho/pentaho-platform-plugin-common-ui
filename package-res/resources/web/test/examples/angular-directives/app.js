require([
        'common-ui/angular',
        './accordionWizardSample/accordionWizardSample',
        './folderBrowserSample/folderBrowserSample',
        './datetimePickerSample/datetimePickerSample',
        './recurrenceSample/weeklyRecurrenceSample'
    ],
    function (angular) {
        var app = angular.module('example', ['accordionWizardSample', 'folderBrowserSample', 'datetimePickerSample', 'weeklyRecurrenceSample']);

        app.controller('MainCtrl', ["$scope", "$http", function ($scope, $http) {

            $scope.accordionWizard = {
                options: [
                    {name: 'heading', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Heading/title of the group panel.' },
                    {name: 'save-text', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Text to be used on the Save button' },
                    {name: 'cancel-text', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Text to be used on the Cancel button' },
                    {name: 'summary-text', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Text to be used in the summary label when the panel is closed' },
                    {name: 'can-save', type: '&', typeOptions: 'scopeFunctionCall() OR true|false', description: 'Boolean value/function bound to the validation of the panel used to determine if the Save button is enabled' },
                    {name: 'on-save', type: '&', typeOptions: 'scopeFunctionCall()', description: 'Called when the Save button is pressed' },
                    {name: 'on-cancel', type: '&', typeOptions: 'scopeFunctionCall()', description: 'Called when the Cancel button is pressed' },
                    {name: 'is-open', type: '=?', typeOptions: 'scopeProperty', description: 'Boolean property on bound to the toggled open/close state of the group' },
                    {name: 'is-cancel', type: '=?', typeOptions: 'scopeProperty', description: 'Boolean property on bound to the disabled/enabled state of the group' }
                ],
                html: "",
                json: "",
                showCode: function (codeType) {
                    if (codeType == 'html') {
                        $scope.accordionWizard.showHtml = true;
                        $scope.accordionWizard.showJs = false;
                    } else if (codeType == 'javascript') {
                        $scope.accordionWizard.showHtml = false;
                        $scope.accordionWizard.showJs = true;
                    } else {
                        // hide them both
                        $scope.accordionWizard.showHtml = false;
                        $scope.accordionWizard.showJs = false;
                    }
                },
                showHtml: false,
                showJs: false
            };

            $scope.folderBrowser = {
                options: [
                    {name: 'tree-model', type: '=', typeOptions: 'scopeProperty', description: 'Property containing the model to bind to the tree for content' },
                    {name: 'add-folder', type: '=', typeOptions: 'scopeProperty', description: 'Property bound from scope to be used to add a folder to the tree' },
                    {name: 'ext-select', type: '=', typeOptions: 'scopeProperty', description: 'Property used to externally set the selected node. Should be in the form: { attr: attribute, val: value }. attribute can be path, id, ...' },
                    {name: 'selected-node', type: '=', typeOptions: 'scopeProperty', description: 'Property bound to the currently selected node' },
                    {name: 'on-selection', type: '&', typeOptions: 'scopeFunctionCall()', description: 'Called when the selected node changes' },
                    {name: 'node-children', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute containing child nodes in the tree model' },
                    {name: "loading", type: '=?', typeOptions: 'Optional scopeProperty', description: 'Boolean property that controls showing of the spinner or the tree'}
                ],
                html: "",
                json: "",
                treeModel: {},
                showCode: function (codeType) {
                    if (codeType == 'html') {
                        $scope.folderBrowser.showHtml = true;
                        $scope.folderBrowser.showJs = false;
                    } else if (codeType == 'javascript') {
                        $scope.folderBrowser.showHtml = false;
                        $scope.folderBrowser.showJs = true;
                    } else {
                        // hide them both
                        $scope.folderBrowser.showHtml = false;
                        $scope.folderBrowser.showJs = false;
                    }
                },
                showHtml: false,
                showJs: false
            };

            $scope.datetimePicker = {
                options: [
                    {name: 'selectedDate', type: '=', typeOptions: 'scopeProperty', description: 'Property containing the model to bind to the datetime for content' },
                    {name: 'isDisabled', type: '=?', typeOptions: 'Optional scopeProperty', description: 'Boolean property that controls enabling/disabling the end date calendar widget' },
                    {name: 'minDate', type: '=?', typeOptions: 'Optional scopeProperty', description: 'Date property bound to the start date input defining the minimum start date that can be selected' },
                    {name: 'maxDate', type: '=?', typeOptions: 'Optional scopeProperty', description: 'Date property bound to the end date input defining the maximum end date that can be selected' },
                    {name: 'hideTime', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Boolean ame mapping for the attribute to show or hide the start time inputs' },
                    {name: "minutesIncrement", type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute to determine the increment of the minute input'},
                    {name: "atLabel", type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute to insert this string between the data and time inputs '}
                ],
                html: "",
                json: "",
                showCode: function (codeType) {
                    if (codeType == 'html') {
                        $scope.datetimePicker.showHtml = true;
                        $scope.datetimePicker.showJs = false;
                    } else if (codeType == 'javascript') {
                        $scope.datetimePicker.showHtml = false;
                        $scope.datetimePicker.showJs = true;
                    } else {
                        // hide them both
                        $scope.datetimePicker.showHtml = false;
                        $scope.datetimePicker.showJs = false;
                    }
                },
                showHtml: false,
                showJs: false
            };

            $scope.weeklyRecurrence = {
                options: [
                    {name: 'weeklyLabel', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute for the week day radio buttons'},
                    {name: 'startLabel', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute for the start date input section'},
                    {name: 'untilLabel', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute for the end date input section'},
                    {name: 'noEndLabel', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute the \'No end date\' radio button in the end date input section'},
                    {name: 'endByLabel', type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute for the \'End by\' radio button in the end date input section'},
                    {name: "atLabel", type: '@', typeOptions: '{{scopeVariable}} or "Text"', description: 'Name mapping for the attribute for the week day radio buttons'},
                    {name: "weeklyRecurrenceInfo", type: '=', typeOptions: 'scopeProperty', description: 'Property containing the model to bind to the weekly for content' }
                ],
                html: "",
                json: "",
                showCode: function (codeType) {
                    if (codeType == 'html') {
                        $scope.datetimePicker.showHtml = true;
                        $scope.datetimePicker.showJs = false;
                    } else if (codeType == 'javascript') {
                        $scope.datetimePicker.showHtml = false;
                        $scope.datetimePicker.showJs = true;
                    } else {
                        // hide them both
                        $scope.datetimePicker.showHtml = false;
                        $scope.datetimePicker.showJs = false;
                    }
                },
                showHtml: false,
                showJs: false
            };


            $scope.init = function () {
                $http.get('accordionWizardSample/accordionWizardSample.html').then(function (response) {
                    $scope.accordionWizard.html = response.data;
                    // run the pretty-printer now to make the code we just got look nice
                    makePretty();
                });
                $http.get('accordionWizardSample/accordionWizardSample.js', { responseType: 'text' }).then(function (response) {
                    $scope.accordionWizard.json = response.data;
                    // run the pretty-printer now to make the code we just got look nice
                    makePretty();
                });

                $http.get('folderBrowserSample/folderBrowserSample.html').then(function (response) {
                    $scope.folderBrowser.html = response.data;
                    // run the pretty-printer now to make the code we just got look nice
                    makePretty();
                });
                $http.get('folderBrowserSample/folderBrowserSample.js', { responseType: 'text' }).then(function (response) {
                    $scope.folderBrowser.json = response.data;
                    // run the pretty-printer now to make the code we just got look nice
                    makePretty();
                });

                $http.get('datetimePickerSample/datetimePickerSample.html').then(function (response) {
                    $scope.datetimePicker.html = response.data;
                    // run the pretty-printer now to make the code we just got look nice
                    makePretty();
                });
                $http.get('datetimePickerSample/datetimePickerSample.js', { responseType: 'text' }).then(function (response) {
                    $scope.datetimePicker.json = response.data;
                    // run the pretty-printer now to make the code we just got look nice
                    makePretty();
                });

                $http.get('recurrenceSample/weeklyRecurrenceSample.html').then(function (response) {
                    $scope.weeklyRecurrence.html = response.data;
                    // run the pretty-printer now to make the code we just got look nice
                    makePretty();
                });
                $http.get('recurrenceSample/weeklyRecurrenceSample.js', { responseType: 'text' }).then(function (response) {
                    $scope.weeklyRecurrence.json = response.data;
                    // run the pretty-printer now to make the code we just got look nice
                    makePretty();
                });

            };

            $scope.init();

        }]);
    }
);
