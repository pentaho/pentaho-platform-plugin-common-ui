---
title: Step 1 - Preparing the environment
description: Walks you through setting up a basic sandbox for experimenting with visualizations.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
grand-parent-title: Create a Custom Visualization
grand-parent-path: ../../create
grand-grand-parent-title: Visualization API
grand-grand-parent-path: ../..
layout: default
---

{% include callout.html content="<h2>Fast-lane</h2>
<p>If you prefer, you can follow the walk-through step-by-step but skip writing the code itself. 
   Just clone the sample repository and install its dependencies:</p>

<pre class='highlight'><code># Clone the sample repository.
git clone https://github.com/pentaho/pentaho-engineering-samples
cd pentaho-engineering-samples
git checkout -b 8.3

# Go to the complete sample's directory.
cd Samples_for_Extending_Pentaho/javascript-apis/platform/visual-samples-bar-d3

# Install the dependencies.
npm install
</code></pre>

<p>Go directly to <a title='Visualize it' href='#visualize-it'>Visualize it</a>.</p>
" type="warning" %}

## Setup the sandbox environment

1. Create an empty folder and then initialize it:
  ```shell
    # Create the package.json file.
    npm init
    # Write "@pentaho/visual-samples-bar-d3" as the package name.
    # Accept the default for the other fields or write whatever you want.

    # Add and install the Visualization API development dependency.
    # (the runtime dependency is provided by the platform)
    npm install @pentaho/visual-sandbox@^3.0.0 --save-dev

    # Install the sandbox.
    npx init-sandbox
  ```
  
2. Now, you should edit the just created `package.json` file and add the `paths` property to it,
   to define the root AMD/RequireJS module ID as `pentaho/visual/samples/barD3`:
   
   ```json
   {
     "name": "@pentaho/visual-samples-bar-d3",
     "version": "0.0.1",
     
     "paths": {
       "pentaho/visual/samples/barD3": "/"
     },
     
     "devDependencies": {
       "@pentaho/visual-sandbox": "^3.0.0"
     }
   }
   ```
   
   See [Pentaho Web Package]({{ '/platform/web-package' | relative_url }}) 
   for more information about the format of a `package.json` file.
   
   {% include callout.html type="warning" content="<h3>Attention</h3>
   <p>This tutorial assumes the name <code>@pentaho/visual-samples-bar-d3</code> as your package name
      and the name <code>pentaho/visual/samples/barD3</code> as the root AMD/RequireJS module ID. 
      If you which to use different names, 
      you will have to take care to change all the references to the original names throughout the tutorial.
   </p>
   " %}

4. You should now also have the `sandbox.html` and `sandbox-data.json` files.

   Those files provide a minimal sandbox from which sandboxes for specific samples or experiments may be derived.
   As is, it simply displays the `pentaho/visual/samples/calc` visualization — 
   the only visualization that comes bundled with the Visualization API.
   
   Open each file and get acquainted with it.

## Visualize it

Open `sandbox.html` in a browser.
You should see the result of the average operation: `The result is 1002566.29`.

The page shows the simplest (and kind of useless) visualization: a calculator, 
which just displays the result of aggregating the values of one column of a dataset.

That's why you have to create your own!

{% include callout.html type="warning" content="<p>Directly opening the file through the filesystem will not work when using 
Google Chrome (and possibly other browsers), because of security restrictions that disallow the loading of 
local resources using XHR — a functionality that is required by the Visualization API to load localization bundles and 
other resources.</p>
<p>To overcome this limitation you need to serve the project files through an HTTP server. 
There are several simple-to-use solutions:</p>

<b>Node:</b><pre class='highlight'><code>npm install -g node-static
static -p 8000</code></pre>

<b>PHP:</b><pre class='highlight'><code>php -S localhost:8000</code></pre>

<b>Python 2:</b><pre class='highlight'><code>python -m SimpleHTTPServer 8000</code></pre>

<b>Python 3:</b><pre class='highlight'><code>python -m http.server 8000</code></pre>

<b>Ruby:</b><pre class='highlight'><code>ruby -run -e httpd . -p 8000</code></pre>

After one of the above, you can open <a href='http://localhost:8000/sandbox.html' target='_blank'>http://localhost:8000/sandbox.html</a> in the browser.
" %}

**Continue** to [Creating the model](step2-model-creation).
