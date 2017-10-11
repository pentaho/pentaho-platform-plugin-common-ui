/*!
* Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

 /*
 	<!-- HTML CONTENT -->

	 <ul class="nav nav-tabs" id="myTab">
	  <li><a href="#tab1">Home</a></li>
	  <li><a href="#tab2">Profile</a></li>
	  <li><a href="#tab3">Messages</a></li>
	  <li><a href="#tab4">Settings</a></li>
	</ul>
	 
	<div class="tab-content">
	  <div class="tab-pane active" id="tab1">...</div>
	  <div class="tab-pane" id="tab2" >...</div>
	  <div class="tab-pane" id="tab3">...</div>
	  <div class="tab-pane" id="tab4">...</div>
	</div>
 */

 /*
	var demoConfig = {
		parentSelector: "#some-id",
		tabContentPattern : "folder1/folder2/this_is_content{{contentNumber}}.html",
		defaultTabSelector : "tabId",
		before: function() { },
		postLoad: function(jHtml, tabSelector) { },
		postClick: function(tabSelector) { },
		contextConfig: ["path", { path:"path", post: function(context, loadedMap) { } } ] //SEE contextProvider.js in common-ui
	};
*/

 define("common-ui/util/BootstrappedTabLoader", [
 	"common-ui/util/PentahoSpinner",
     "common-ui/util/spin.min",
 	"common-ui/util/ContextProvider",
 	"common-ui/util/HandlebarsCompiler",
 	"common-ui/bootstrap"

 ], function(spinConfigs, Spinner, ContextProvider, HandlebarsCompiler) {

	var spinner;

 	/**
 	 * Initializes the getting started widget
 	 */
 	function init(config) {

 		// Create spinner
	 	spinner = new Spinner(spinConfigs.getLargeConfig());
	
 		// Bind click events to the tabs in the tab group	
 		$(config.parentSelector + ' #tab-group a').bind("click", function (e) {
			e.preventDefault();

			var tabSelector = $(this).attr("href");
			$(this).tab('show');

			var parentedSelector = config.parentSelector + " " + tabSelector;
			// Load content for tab if it has not been loaded yet
			if ($(parentedSelector).children().length == 0) {
				var url = HandlebarsCompiler.compile(config.tabContentPattern, { contentNumber: tabSelector.replace("#tab", "") });
				
				ContextProvider.get(function(context) {
					loadTabContent(url, parentedSelector, context, config.postLoad);
				}, config.contextConfig);

			} 

			if (config.postClick) {
				config.postClick(parentedSelector);
			}
		});

 		if (config.before) {
 			config.before();
 		}

 		// Selects the default element and clicks it
		$(config.parentSelector + " a[href=\\#" + config.defaultTabSelector + "]").click();
 	}

 	/**
 	 * Loads the content for a tab and compiles the content
 	 */
 	function loadTabContent(url, selector, context, post) {

 		// Show loading spinner
 		injectSpinner(selector);

 		$.get(url, function (data) { 			
 			HandlebarsCompiler.compile(data, context, function(compiledContent) {
				// Delay content injection to give a moment for the loading spinner
	 			setTimeout(function() {
	 				spinner.stop();
	 				
	 				var html = $(compiledContent);	 				 			
	 				$(selector).html(html);

	 				if (post) {
	 					post(html, selector);
	 				}
	 			}, 200);
 			}); 			
 		});
 	}

 	/**
 	 * Injects a spinner into content
 	 */
 	function injectSpinner(selector) {
 		var jqSpinner = $("<div></div>");
 		jqSpinner.css({
 			width: "100%",
 			overflow: "hidden"
 		});

 		$(selector).html(jqSpinner); 		
		spinner.spin(jqSpinner[0]);
 	}

 	return {
 		init:init
 	};
 });
