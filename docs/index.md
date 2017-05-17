---
title: Pentaho Platform JavaScript APIs
description: The Pentaho Platform JavaScript APIs support the development of JavaScript components for the Pentaho platform.
layout: intro
---

The Pentaho Platform JavaScript APIs support the development of JavaScript components for the Pentaho platform, by standardizing in cross-cutting areas, such as data and visualization, but also on lower-level areas, such as configuration, localization, services and, even, control of debugging information; and exposing key Pentaho platform information and services to JavaScript components.

The APIs are organized as follows:
<ul class="api-list">
    <li class="bigger">
        <dl>
            <dt>
                <a title="Pentaho Visualization API" href="platform/visual">Pentaho Visualization API</a> ⭐ <em>3.0 beta</em>
            </dt>
            <dd>
                The Pentaho Visualization API provides a unified way to visualize data across the Pentaho suite 
                (e.g. Analyzer, PDI, CDF).

                Essentially, it is a set of abstractions that ensures isolation between applications, visualizations and configurations (that glue the two together).
            </dd>
        </dl>
    </li>
    <li>
        <dl>
            <dt>
                <a title="Pentaho Data API" 
                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.data'}}">Pentaho Data API</a>
            </dt>
            <dd>The Pentaho Data API contains a <em>data table</em> abstraction that allows components and applications to consume and exchange tabular data in a common way.
                <ul style="display: none;">
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho Data Access API" 
                                   href="data/access">Data Access API</a>
                            </dt>
                            <dd>Unreleased</dd>
                        </dl>
                    </li>
                </ul>
            </dd>
        </dl>
    </li>
    <li>
        <dl>
            <dt>
                <a title="Pentaho Type API" 
                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.type'}}">Type API</a>
            </dt>
            <dd>Pentaho Client Metadata Model.</dd>
        </dl>
    </li>
    <li class="bigger">
        <dl>
            <dt>
                Pentaho Core APIs
            </dt>
            <dd>Pentaho Web Platform's base functionality.
                <ul>
                    <li>
                        <dl>
                            <dt>
                                <a title="Environment" 
                                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.context'}}">Environment</a>
                            </dt>
                            <dd>The Pentaho Web Client Platform's contextual information.</dd>
                        </dl>
                    </li>
                    <li>
                        <dl>
                            <dt>
                                <a title="Services" 
                                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.service'}}">Services</a>
                            </dt>
                            <dd>AMD plugin which maintains a collection of logical modules and their dependencies.</dd>
                        </dl>
                    </li>
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho Core API Configuration" 
                                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.config'}}">Configuration System</a>
                            </dt>
                            <dd>Classes and interfaces related to the configuration of value types.</dd>
                        </dl>
                    </li>
                    <li>
                        <dl>
                            <dt>
                                <a title="Pentaho Core API Lang package" 
                                   href="{{site.refDocsUrlPattern | replace: '$', 'pentaho.lang'}}">pentaho/lang</a>
                            </dt>
                            <dd>
                                Classes and interfaces used as type system building blocks to form other classes and 
                                interfaces of the Pentaho Web Platform.
                             </dd>
                        </dl>
                    </li>
                </ul>
            </dd>
        </dl>
    </li>
    <li>
        <dl>
            <dt>
                <a title="Pentaho Web Package" href="platform/pentaho-web-package">Pentaho Web Package</a>
            </dt>
            <dd>How to package web resources into the Pentaho platform.</dd>
        </dl>
    </li>
</ul>
