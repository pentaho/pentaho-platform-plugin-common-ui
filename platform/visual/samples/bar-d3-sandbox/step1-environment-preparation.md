---
title: Step 1 - Preparing the environment
description: Walks you through setting up a basic sandbox for experimenting with visualizations.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
layout: default
---

{% include callout.html content="<h2>Fast-lane</h2>
<p>If you prefer, you can follow the walk-through step-by-step but skip writing the code itself. 
   Just clone the sample repository and install its dependencies:</p>

<pre class='highlight'><code># Clone the sample repository.
git clone https://github.com/pentaho/pentaho-engineering-samples
git checkout -b 7.1

# Go to the complete sample's directory.
cd pentaho-engineering-samples
cd Samples_for_Extending_Pentaho/javascript-apis/platform/pentaho/visual/samples/bar-d3-sandbox

# Install the dependencies.
npm install
# or: yarn install
</code></pre>

<p>Go directly to <a title='Visualize it' href='#visualize-it'>Visualize it</a>.</p>
" type="warning" %}

## Setup the sandbox environment

1. Create a folder and then initialize it:
   ```shell
   # Create the package.json file.
   npm init
    
   # Add and install the Visualization API dev dependency.
   # (the runtime dependency is provided by the platform)
   npm install https://github.com/pentaho/pentaho-platform-plugin-common-ui/releases/download/v3.0.0-beta/pentaho-viz-api-v3.0.0.tgz --save-dev
   # or: yarn add https://github.com/pentaho/pentaho-platform-plugin-common-ui/releases/download/v3.0.0-beta/pentaho-viz-api-v3.0.0.tgz --dev
   ```

2. Create a file named `sales-by-product-family.json` and place the following content in it:
    ```json
    {
      "model": [
           {"name": "productFamily", "type": "string", "label": "Product Family"},
           {"name": "sales",         "type": "number", "label": "Sales"}
      ],
      "rows": [
           {"c": [{"v": "cars-classic", "f": "Classic Cars"}, 2746782]},
           {"c": [{"v": "motorcycles", "f": "Motorcycles"}, 753753]},
           {"c": [{"v": "planes", "f": "Planes"}, 748324]},
           {"c": [{"v": "ships", "f": "Ships"}, 538982]},
           {"c": [{"v": "trains", "f": "Trains"}, 165215]},
           {"c": [{"v": "trucks-and-buses", "f": "Trucks and Buses"}, 756438]},
           {"c": [{"v": "cars-vintage", "f": "Vintage Cars"}, 1308470]}
      ]
    }
    ```

3. Create a file named `index.html` and place the following content in it:
    ```html
    <!doctype html>
    <html>
      <head>
        <style>
          .pentaho-visual-base {
            border: solid 1px #005da6;
          }
        </style>
       
        <!-- Load RequireJS. -->
        <script type="text/javascript" src="node_modules/RequireJS/require.js"></script>
    
        <!-- Load the VizAPI dev bootstrap helper. -->
        <script type="text/javascript" src="node_modules/@pentaho/viz-api/dev-bootstrap.js"></script>
    
        <script>
          require([
            "pentaho/type/Context",
            "pentaho/data/Table",
            "pentaho/visual/base/view",
            "pentaho/visual/samples/calc",
            "json!./sales-by-product-family.json"
          ], function(Context, Table, baseViewFactory, calcFactory, dataSpec) {
            
            // Setup up a VizAPI context.
            var context = new Context({application: "viz-api-sandbox"});
        
            // Create the visualization model.
            var modelSpec = {
              "data": new Table(dataSpec),
              "levels": {attributes: ["productFamily"]},
              "measure": {attributes: ["sales"]},
              "operation": "avg"
            };
        
            var CalcModel = context.get(calcFactory);
            var model = new CalcModel(modelSpec);
        
            // Create the visualization view.
            var viewSpec = {
              width: 400,
              height: 200,
              domContainer: document.getElementById("viz_div"),
              model: model
            };
            
            // These are responsibilities of the visualization container application:
            // 1. Mark the container with the model's CSS classes, for styling purposes.
            viewSpec.domContainer.className = model.type.inheritedStyleClasses.join(" ");
        
            // 2. Set the DOM container dimensions.
            viewSpec.domContainer.style.width = viewSpec.width + "px";
            viewSpec.domContainer.style.height = viewSpec.height + "px";
        
            var BaseView = context.get(baseViewFactory);
            BaseView.createAsync(viewSpec).then(function(view) {
              // Render the visualization.
              view.update();
            });
          });
        </script>
      </head>
    
      <body>
        <!-- Div that will contain the visualization. -->
        <div id="viz_div"></div>
      </body>
    </html>
    ```

## Visualize it

Open `index.html` in a browser.
You should see the result of the average operation: `The result is 1002566.2857142857`.

The page shows the simplest (and kind of useless) visualization: a
calculator, which just displays the result of aggregating the values of
one column of a dataset.

That's why you have to create your own!

{% include callout.html content="<p>Directly opening the file through the filesystem will not work when using 
Google Chrome (and possibly other browsers), because of security restrictions that disallow the loading of 
local resources using XHR — a functionality that is required by the VizAPI to load localization bundles and 
other resources.</p>
<p>To overcome this limitation you need to serve the project files through an HTTP server. 
There are several simple-to-use solutions:</p>

<b>Node:</b><pre class='highlight'><code>npm install -g node-static
static -p 8000</code></pre>

<b>PHP:</b><pre class='highlight'><code>php -S localhost:8000</code></pre>

<b>Python 2:</b><pre class='highlight'><code>python -m SimpleHTTPServer 8000</code></pre>

<b>Python 3:</b><pre class='highlight'><code>python -m http.server 8000</code></pre>

<b>Ruby:</b><pre class='highlight'><code>ruby -run -e httpd . -p 8000</code></pre>
" type="warning" %}


**Continue** to [Creating the model](step2-model-creation).

