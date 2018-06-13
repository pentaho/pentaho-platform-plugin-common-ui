---
title: Platform JavaScript APIs
description: The Pentaho Platform JavaScript APIs support the development of JavaScript components for the Pentaho platform.
layout: intro
---

The **Platform JavaScript APIs** support the development of JavaScript components for the **Pentaho** platform:
1. Standardizes in cross-cutting areas, such as data and visualization, 
   but also on lower-level areas, such as configuration, localization and services. 
2. Exposes key platform information and services to JavaScript components.

The APIs are organized as follows:
<ul class="api-list">
    <li class="bigger api-box">
        <dl>
            <dt>
                <a title="Pentaho JavaScript Visualization API" href="platform/visual">Visualization</a>
            </dt>
            <dd>A unified way to visualize data across the Pentaho suite.</dd>
        </dl>
    </li>
    <li class="api-box">
        <dl>
            <dt>
                <a title="Pentaho JavaScript Data API" 
                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.data'}}">Data</a>
            </dt>
            <dd>Abstractions for data exchange among components, applications and data sources.
                <ul style="display: none;">
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho JavaScript Data Access API" href="data/access">Data Access</a>
                            </dt>
                            <dd>Unreleased</dd>
                        </dl>
                    </li>
                </ul>
            </dd>
        </dl>
    </li>
    <li class="api-box">
        <dl>
            <dt>
                <a title="Pentaho JavaScript Type API" 
                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.type'}}">Type</a>
            </dt>
            <dd><em>Types</em> offer out-of-the-box features such as class inheritance, metadata support, 
                configuration, validation and serialization.
            </dd>
        </dl>
    </li>
    <li class="bigger">
        <dl>
            <dt id="core">
                Core
            </dt>
            <dd>
                <ul>
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho JavaScript Configuration API" 
                                href="platform/configuration">Configuration</a>
                            </dt>
                            <dd>Allows <em>types</em> to be configured by third-parties.</dd>
                        </dl>
                    </li>
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho JavaScript Modules API" 
                                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.modules'}}">Modules</a>
                            </dt>
                            <dd>Provides information about existing modules.</dd>
                        </dl>
                    </li>
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho JavaScript Localization API"
                                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.i18n'}}">Localization</a>
                            </dt>
                            <dd>Resource bundle loader AMD/RequireJS plugin.</dd>
                        </dl>
                    </li>
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho JavaScript Language Support API"
                                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.lang'}}">Language Support</a>
                            </dt>
                            <dd>API building blocks for JavaScript.</dd>
                        </dl>
                    </li>
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho JavaScript Environment API" 
                                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.environment'}}">Environment</a>
                            </dt>
                            <dd>Platform environmental information.</dd>
                        </dl>
                    </li>
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho JavaScript Debugging Control API"
                                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.debug'}}">Debugging</a>
                            </dt>
                            <dd>Controls the debugging level of components.</dd>
                        </dl>
                    </li>
                </ul>
            </dd>
        </dl>
    </li>
    <li class="bigger ground-layer">
        <dl>
            <dt id="ground">
                Pentaho Web Platform
            </dt>
            <dd>
                <ul>
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho Web Package" href="platform/web-package">Pentaho Web Package</a>
                            </dt>
                            <dd>The dependency and versioning unit for JavaScript resources
                                in the Pentaho platform.</dd>
                        </dl>
                    </li>
                </ul>
                <ul>
                    <li>
                        <dl>
                            <dt>
                                <a title="OSGi Artifacts Deployment" href="platform/osgi-deployment">
                                OSGi Artifacts Deployment
                                </a>
                            </dt>
                            <dd>Deployment of OSGi artifacts on the Pentaho platform.</dd>
                        </dl>
                    </li>
                </ul>
            </dd>
        </dl>
    </li>
</ul>
