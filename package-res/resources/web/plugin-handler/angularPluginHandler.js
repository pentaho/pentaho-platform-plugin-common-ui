/*
 * An implementation of the plugin handler for use with AngularJS. Also requires jQuery
 *
 * To allow for lazy loading of plugins, when configuring the module where the plugin will be stored,
 * the module must define the following as part of the module's data. You can also use the convenience 
 * function "makeModulePluggable" to do this work for you. Your own configuration can also be provided
 * and not conflict with the actions performed in "makeModulePluggable"
 * 
 * EXAMPLE
 * 	var app = angular.module('app-module-name', ['dependancy1', 'dependancy2', ...]);
 *	
 * 	app.config(['$routeProvider', '$controllerProvider', '$provide',
 * 		function ($routeProvider, $controllerProvider, $provide) {
 * 			app.controllerProvider = $controllerProvider;
 * 			app.routeProvider      = $routeProvider;
 * 			app.provide            = $provide;
 *
 *			///////////////////////////////
 *			// APPLICATION CONFIGURATION //
 *			///////////////////////////////
 *		}]);
 * 
 * EXAMPLE Route 		{ url : 'String', templateUrl : 'String' | template : 'String', controller : 'String' }
 * EXAMPLE Controller 	{ name : 'String', def : 'Function or Array' }
 * EXAMPLE Service 		{ name : 'String', def : 'Function or Array' }
 *
 * Route, Controller, and Service can be an array of their respective objects
 */

pen.define(['common-ui/PluginHandler', 'common-ui/jquery', 'common-ui/angular', 'common-ui/angular-route'], function(PluginHandler) {
	// Define an extended plugin of PluginHandler.Plugin
	var AngularPlugin = function(moduleName, routes, controllers, services, onRegister, onUnregister) {
		$.extend(this, new PluginHandler.Plugin([_onRegister, onRegister], [_onUnregister, onUnregister]));		

		this.moduleName = moduleName;		
		this.routes = routes;
		this.controllers = controllers;
		this.services = services;
	};

	var docBootstrapped = false;

	// Provide function for onRegister
	var _onRegister = function(plugin) {

		// Retrieve module
		var module = angular.module(plugin.moduleName);	

		// Create controllers
		$(plugin.controllers).each(function(i, controller) {
			docBootstrapped ? 
				module.$controllerProvider.register(controller.name, controller.def) : 
				module.controller(controller.name, controller.def);	
		});		

		// Create Services
		$(plugin.services).each(function(i, service) {
			docBootstrapped ? 
				module.$provide.service(service.name, service.def) : 
				module.service(service.name, service.def);	
		});
		
		// Append routes
		$(plugin.routes).each(function(i, route) {

			if (docBootstrapped) {
				module.$routeProvider
					.when(route.url, {
						template : route.template,
						templateUrl : route.templateUrl,
						controller : route.controller
					});					
			} else {
				module.config(['$routeProvider', function($routeProvider) {
					$routeProvider
						.when(route.url, {
							template : route.template,
							templateUrl : route.templateUrl,
							controller : route.controller
						});
				}])
			}
			
		});		
	}

	// Provide function for onUnregister
	var _onUnregister = function(plugin) {
		// Retrieve module
		var module = angular.module(plugin.moduleName);

		// Unbind Controllers
		$(plugin.controllers).each(function(i, controller) {
			module.$controllerProvider.register(controller.name, null);
		})

		// Unbind Services
		$(plugin.services).each(function(i, service) {
			module.$provide.service(service.name, null);
		})
		
		// Unbind routes
		$(plugin.routes).each(function(i, route) {
			module.$routeProvider
				.when(route.url, {
					// TODO : find way to retrieve default location of otherwise binding
					redirectTo : "/"				
				});
			});
	}

	// This attaches the appropriate methods and objects directly to the module to allow the module
	// to be pluggable later
	var makePluggable = function(module) {
		module.config(['$routeProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
			function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
				module.$controllerProvider = $controllerProvider;
		        module.$compileProvider    = $compileProvider;
		        module.$routeProvider      = $routeProvider;
		        module.$filterProvider     = $filterProvider;
		        module.$provide            = $provide;

		        docBootstrapped = true;
		    }]);
	}

	return {
		AngularPlugin : AngularPlugin,
		makePluggable : makePluggable
	}
});