/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
 */ 
define(["common-ui/vizapi/colorPaletteRegistry"], function(singletonColorPaletteRegistry) {
	
	var ColorPaletteRegistry = singletonColorPaletteRegistry && singletonColorPaletteRegistry.constructor;
	
	describe("ColorPaletteRegistry -", function() {
		it("should be a function", function() {
			expect(typeof ColorPaletteRegistry).toBe("function");
		});
		
		describe("#new() -", function() {
			it("should create an instance of ColorPaletteRegistry", function() {
				var registry = new ColorPaletteRegistry();
				expect(registry instanceof ColorPaletteRegistry).toBe(true);
			});
			
			it("should contain 0 color palettes", function() {
				var registry = new ColorPaletteRegistry();
				var palettes = registry.getAll();
				expect(palettes instanceof Array).toBe(true);
				expect(palettes.length).toBe(0);
			});
		});
		
		describe("#add({name, colors}) -", function() {
			it("should throw an error if given no arguments or a nully argument", function() {
				var registry = new ColorPaletteRegistry();
				expect(function() {
					registry.add();
				}).toThrow();
				
				expect(function() {
					registry.add(null);
				}).toThrow();
				
				expect(function() {
					registry.add(undefined);
				}).toThrow();
			});
			
			it("should add a palette with name that has not been defined yet", function() {
				var registry = new ColorPaletteRegistry();
				var palette = {name: "A"};
				registry.add(palette);
				
				var palettes = registry.getAll();
				expect(palettes instanceof Array).toBe(true);
				expect(palettes.length).toBe(1);
				
				expect(palettes[0]).toBe(palette);
			});
			
			it("should replace a palette with name that has already been defined", function() {
				var registry = new ColorPaletteRegistry();
				var palette1 = {name: "A"};
				var palette2 = {name: "A"};
				registry.add(palette1);
				registry.add(palette2);
				
				var palettes = registry.getAll();
				expect(palettes instanceof Array).toBe(true);
				expect(palettes.length).toBe(1);
				expect(palettes[0]).toBe(palette2);
			});
			
			it("should add and retain multiple palettes", function() {
				var registry = new ColorPaletteRegistry();
				var palette1 = {name: "A"};
				var palette2 = {name: "B"};
				var palette3 = {name: "C"};
				registry.add(palette1);
				registry.add(palette2);
				registry.add(palette3);
				
				var palettes = registry.getAll();
				expect(palettes instanceof Array).toBe(true);
				expect(palettes.length).toBe(3);
				expect(palettes.indexOf(palette1) >= 0).toBe(true);
				expect(palettes.indexOf(palette2) >= 0).toBe(true);
				expect(palettes.indexOf(palette3) >= 0).toBe(true);
			});
	
			it("should return `this`", function() {
				var registry = new ColorPaletteRegistry();
				var result = registry.add({name: "A"});
				
				expect(result).toBe(registry);
			});
		});
		
		describe("#get(name) -", function() {
			it("should return the palette of the given name", function() {
				var registry = new ColorPaletteRegistry();
				var palette1 = {name: "A"};
				var palette2 = {name: "B"};
				registry.add(palette1);
				registry.add(palette2);
				
				expect(registry.get("B")).toBe(palette2);
				expect(registry.get("A")).toBe(palette1);
			});
			
			it("should return `null` when given a name that is not defined", function() {
				var registry = new ColorPaletteRegistry();
				registry.add({name: "A"});
				
				expect(registry.get("B")).toBe(null);
			});
			
			it("should return `null` when given a falsy name, no default palette is defined and no palettes are defined", function() {
				var registry = new ColorPaletteRegistry();
				expect(registry.get()).toBe(null);
				expect(registry.get("")).toBe(null);
				expect(registry.get(null)).toBe(null);
				expect(registry.get(undefined)).toBe(null);
			});
			
			it("should return the first palette when given a falsy name, no default palette is defined and palettes are defined", function() {
				var registry = new ColorPaletteRegistry();
				var palette1 = {name: "A"};
				var palette2 = {name: "B"};
				registry.add(palette1);
				registry.add(palette2);
				
				expect(registry.get()).toBe(palette1);
				expect(registry.get("")).toBe(palette1);
				expect(registry.get(null)).toBe(palette1);
				expect(registry.get(undefined)).toBe(palette1);
			});
			
			it("should return the default palette, when one is defined and was given a falsy name", function() {
				var registry = new ColorPaletteRegistry();
				var palette1 = {name: "A"};
				var palette2 = {name: "B"};
				registry.add(palette1);
				registry.add(palette2);
				
				registry.setDefault("B");
				
				expect(registry.get()).toBe(palette2);
				expect(registry.get("")).toBe(palette2);
				expect(registry.get(null)).toBe(palette2);
				expect(registry.get(undefined)).toBe(palette2);
			});
		});
		
		describe("#getAll() -", function() {
			it("should return color palettes in the order their names were added", function() {
				var registry = new ColorPaletteRegistry();
				var palette1 = {name: "A"};
				var palette2 = {name: "B"};
				var palette3 = {name: "C"};
				var palette4 = {name: "B"};
				
				registry.add(palette1);
				registry.add(palette2);
				registry.add(palette3);
				registry.add(palette4);
				
				var palettes = registry.getAll();
				expect(palettes instanceof Array).toBe(true);
				expect(palettes.length).toBe(3);
				expect(palettes[0]).toBe(palette1);
				expect(palettes[1]).toBe(palette4);
				expect(palettes[2]).toBe(palette3);
			});
		});
		
		describe("#setDefault() -", function() {
			it("should set the default palette, returned by #get(), when given an existing name", function() {
				var registry = new ColorPaletteRegistry();
				var palette1 = {name: "A"};
				var palette2 = {name: "B"};
				registry.add(palette1);
				registry.add(palette2);
				
				registry.setDefault("B");
				expect(registry.get()).toBe(palette2);
			});
			
			it("should throw an error when given a non-existing name", function() {
				var registry = new ColorPaletteRegistry();
				var palette1 = {name: "A"};
				var palette2 = {name: "B"};
				registry.add(palette1);
				registry.add(palette2);
				
				expect(function() {
					registry.setDefault("V");	
				}).toThrow();
			});
			
			it("should reset the default palette, returned by #get(), when given no name or an falsy name", function() {
				var registry = new ColorPaletteRegistry();
				var palette1 = {name: "A"};
				var palette2 = {name: "B"};
				registry.add(palette1);
				registry.add(palette2);
				
				registry.setDefault("B");
				expect(registry.get()).toBe(palette2);
				
				registry.setDefault();
				expect(registry.get()).toBe(palette1);
				
				registry.setDefault("B");
				expect(registry.get()).toBe(palette2);
				
				registry.setDefault(null);
				expect(registry.get()).toBe(palette1);
			});
			
			it("should return `this`", function() {
				var registry = new ColorPaletteRegistry();
				var result = registry.setDefault();
				
				expect(result).toBe(registry);
			});
		});
	});
	
	describe("colorPaletteRegistry singleton -", function() {
		it("should be an instance of ColorPaletteRegistry", function() {
			expect(singletonColorPaletteRegistry instanceof ColorPaletteRegistry).toBe(true);
		});
		
		it("should be pre-loaded with three palettes", function() {
			var palettes = singletonColorPaletteRegistry.getAll();
			expect(palettes instanceof Array).toBe(true);
			expect(palettes.length).toBe(3);
		});
		
		it("should contain a palette named 'palette 1'", function() {
			expect(singletonColorPaletteRegistry.get("palette 1")).toBeTruthy();
		});
		
		it("should contain a palette named 'palette 2'", function() {
			expect(singletonColorPaletteRegistry.get("palette 2")).toBeTruthy();
		});
		
		it("should contain a palette named 'palette 3'", function() {
			expect(singletonColorPaletteRegistry.get("palette 3")).toBeTruthy();
		});
	});
});