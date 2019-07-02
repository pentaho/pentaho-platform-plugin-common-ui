---
title: Step 5 - Styling the model for applications
description: Walks you through the styling of the Bar visualization model for specific container applications.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
grand-parent-title: Create a Custom Visualization
grand-parent-path: ../../create
grand-grand-parent-title: Visualization API
grand-grand-parent-path: ../..
layout: default
---

As soon as you see your visualization showing up in
[Analyzer](https://www.hitachivantara.com/en-us/products/big-data-integration-analytics/pentaho-business-analytics.html) 
or in 
[PDI](https://www.hitachivantara.com/en-us/products/big-data-integration-analytics/pentaho-data-integration.html),
you'll notice that it is displayed with a "generic visualization" icon:

1. In **Analyzer**, 
   the canvas will display a placeholder image, of a sunburst visualization
   (yes, that's the current "generic" image...):
   
   <img src="../../img/sample-bar-d3-analyzer-placeholder-unstyled.png" alt="Bar/D3 in Analyzer - Placeholder - Default Style" 
        style="width: 767px;">

2. In **PDI**, each tab has a visualization menu which displays a button icon, 
   a larger two-states icon in the menu's drop-down, and 
   a placeholder image displayed in the canvas, 
   and all of these display a generic visualization image:

   <img src="../../img/sample-bar-d3-pdi-menu-selected-unstyled.png" alt="Bar/D3 in PDI - Menu - Selected, Default Style" 
        style="width: 767px;"> 

Visualization container applications document how visualizations can provide styled content to better integrate with 
them. 

You will learn how to provide custom images for the Analyzer and PDI scenarios.
A single CSS stylesheet will be created and registered as a theme for the visualization model file.
It is the responsibility of the container application to load any registered visualization model themes.
 
## Creating the CSS file

In the `css` folder, create a file named `Model.css`. Add the following content to it:

```css
/* -- Analyzer -- */

/* Canvas placeholder image */
._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-Model.component-icon-landscape {
  background-image: url("./images/analyzer-bar-d3-placeholder.png");
}

/* -- PDI -- */

/* Viz Type Selector - Selected Viz Button */
._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-Model.visualization-switcher-button-icon {
  background-image: url("./images/pdi-bar-d3-button.svg");
}

/* Viz Type Selector - Drop-down icons */
.visualization-selector ._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-Model.component-icon-sprite {
  background-image: url("./images/pdi-bar-d3-sprite.svg");
}

/* Canvas placeholder image */
._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-Model .canvas.message .icon {
  background-image: url("images/pdi-bar-d3-placeholder.svg");
}
```

Remarks:
  - The CSS rules are scoped with the visualization model's automatically generated CSS class,
    similarly to what was the case when styling the view.

Copy the images provided in 
[pentaho/pentaho-engineering-samples]({{site.platformSamplesBaseUrl | append: "javascript-apis/platform/visual-samples-bar-d3/css/images"}})
into an `images` folder, inside of the `css` folder.

## Register the CSS file as a theme of the Model

In the `package.json` file, 
in the `pentaho/visual/samples/barD3/Model` module declaration,
add the  
[ThemeAnnotation]({{site.refDocsUrlPattern | replace: '$', 'pentaho.theme.ThemeAnnotation'}})
annotation, referencing the just created `Model.css` file:

```json
{
  "name": "@pentaho/visual-samples-bar-d3",
  
  "...": "...",
  
  "config": {
    "pentaho/modules": {
      "pentaho/visual/samples/barD3/Model": {
        
        "...": "...",
        
        "annotations": {
          
          "...": "...",
      
          "pentaho/theme/Theme": {
            "main": "css!./css/Model"
          }
        }
      },
      
      "...": "...",
    }
  },
  
  "...": "..."
}
```

That's it. You'll only be able to test this later, 
when deploying the visualization to the Pentaho Server and to PDI. 

**Continue** to [Adding interactivity to the view](step6-view-interactivity).
