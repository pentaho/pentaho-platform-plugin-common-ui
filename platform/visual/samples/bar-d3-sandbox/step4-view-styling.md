---
title: Step 4 - Styling the view
description: Walks you through the styling of the Bar visualization view.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
grand-parent-title: Create a Custom Visualization
grand-parent-path: ../../create
grand-grand-parent-title: Visualization API
grand-grand-parent-path: ../..
layout: default
---

Have you noticed that, before, CSS classes were added to some of the SVG elements? 
Let's then give some love to the Bar chart by styling these elements with CSS.

## Creating the CSS file

Create a folder named `css` and, in it, create a file named `View.css`.
Add the following content to it:

```css
._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-View .bar {
  stroke-width: 2px;
}

._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-View .bar:hover {
  fill-opacity: 0.8;
}

._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-View .axis path,
._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-View .tick line {
  stroke: #cbdde8;
}

._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-View .tick text {
  font-family: OpenSansLight, Helvetica, Arial, Sans serif;
  fill: #26363d;
}

._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-View .title {
  font-family: OpenSansLight, Helvetica, Arial, Sans serif;
  font-size: 18px;
  font-style: normal;
  fill: #005f7d;
}
```

Remarks:
  - The CSS rules are scoped with the visualization model's automatically generated CSS class.
    Essentially, the CSS class is composed by the hyphenated package name and AMD module identifier of the model type.
    See 
    [pentaho.visual.util.getCssClasses]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.util' | append: '#.getCssClasses'}}), 
    for more information on the structure of the CSS class names.

## Register the CSS file as a theme of the View

In the `package.json` file, 
declare the `pentaho/visual/samples/barD3/View` module. Its base class is not relevant.
Then, add the  
[ThemeAnnotation]({{site.refDocsUrlPattern | replace: '$', 'pentaho.theme.ThemeAnnotation'}})
annotation, referencing the just created `View.css` file:

```json
{
  "name": "@pentaho/visual-samples-bar-d3",
  
  "...": "...",
  
  "config": {
    "pentaho/modules": {
    
      "...": "...",
      
      "pentaho/visual/samples/barD3/View": {
        "base": null,
        "annotations": {
          "pentaho/theme/Theme": {
            "main": "css!./css/View"
          }
        }
      }
    }
  },
  
  "...": "..."
}
```

## Automatically loading the theme of the view

When a view supports CSS theming, it is its responsibility to 
automatically load any registered themes whenever the view module is loaded.

In the `package.json` file, simply add the 
[LoadThemeAnnotation]({{site.refDocsUrlPattern | replace: '$', 'pentaho.theme.LoadThemeAnnotation'}})
annotation to the view module:

```json
{
  "name": "@pentaho/visual-samples-bar-d3",
  
  "...": "...",
  
  "config": {
    "pentaho/modules": {
    
      "...": "...",
      
      "pentaho/visual/samples/barD3/View": {
        "base": null,
        "annotations": {
          
          "...": "...",
          
          "pentaho/theme/LoadTheme": {}
        }
      }
    }
  },
  
  "...": "..."
}
```

Now, refresh the `sandbox.html` page in the browser, and you should see a better styled title and 
hover effects on the bars!

**Continue** to [Model styling for applications](step5-model-styling).
