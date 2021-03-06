---
layout: default
title: Skywriter Embedded Guide
subtitle: Application Configuration
---

Gluing Skywriter Together
======================

Skywriter is built as a dynamic, customizable editor. It's created out of a
collection of plugins so that it can start out as something that just
replaces a textarea and grow via plugins to a complete client/server 
development environment.

Skywriter includes a plugin called _appconfig_ which is responsible for
gluing all of the desired available pieces together. It will instantiate
objects that are used behind the scenes throughout Skywriter and will also
create components that provide the user interface that you see.

_appconfig_ has sane default behavior for a few of the supported Skywriter plugins.
For example, if the _command\_line_ plugin is available, Skywriter will
automatically include it when it sets up the GUI.

Calling appconfig
-----------------

When you use Skywriter Embedded, you will generally call the skywriter.useSkywriter 
function to get Skywriter running. This, in turn, calls appconfig.launch
with your config. The useSkywriter function merges configuration that is
provided in your dryice manifest (see [the building doc](building.html)
for more information about manifests) with the configuration that is
passed in by the page.

This setup gives you a lot of flexibility in how you configure your
Skywriter.

objects
-------

The configuration object can have a property of "objects" on it.
config.objects defines a collection of objects that need to be
created and used across Skywriter. config.objects is an object. The
keys on the object will become the names of the created objects
and the values define how the object is created. Here's a simple
example config:

    :::js
    {
        objects: {
            settings: {}
        }
    }

appconfig will register an object with the name `settings` in the
Skywriter plugin catalog (`skywriter:plugins#catalog`). To create that
object, Skywriter will look for a `factory` extension with the name
`settings`. That factory doesn't require any additional parameters.

Here's a more complex example:

    :::js
    {
        objects: {
            server: {
                factory: "skywriter_server"
            },
            filesource: {
                factory: "skywriter_filesource",
                arguments: [
                    "server"
                ],
                objects: {
                    "0": "server"
                }
            },
            files: {
                arguments: [
                    "filesource"
                ],
                "objects": {
                    "0": "filesource"
                }
            }
        }
    }

The `server` object will be created by looking up a factory extension called
`skywriter_server`. There are no arguments for that one. The `filesource`
is created by finding the `skywriter_filesource` factory and passing in
the arguments provided. Here's the tricky bit: that factory actually needs
a skywriter\_server instance, not the string "server". The `objects` property
for `filesource` says to replace element `0` in the arguments array with
the object called `server`. The plugin catalog knows to create the
server first, and then create the filesource.

Finally, `files` works a lot like `filesource`. Since there is no
`factory` property, the factory name is assumed to be `files`. That
object will be passed the `filesource` object that is created. Through
this mechanism, it's very easy to configure Skywriter to use a file source
other than the Skywriter server.

gui
---
Skywriter's graphical user interface is wired up by plugging GUI components
into a "border-style" layout. There are presently 5 zones: north, east,
south, west and center. Generally, you'd stick the editor in the center.
The GUI components are objects that are created via the config.objects
mechanism described in the previous section.

By default, if there's an `editor` object available and there's nothing
explicitly placed in the center, then the editor is placed there. Here's
what that line of code looks like:
    
    :::js
    config.gui.center = { component: "editor" };

Setting up the GUI is as simple as that. `config.gui.`_location_ is
an object that specifies a component. The component value is the
object name that is looked up.

A component is an object that has an `element` defined on it. That is
the DOM element that will be plugged into the overall layout.

Speaking of layout, it's worth noting that the border layout is built
upon the CSS3 Flexible Box Model and the component elements are
placed into the GUI by just adding a class name matching the
zone (for example, "north"). It should be possible for a theme to change
the way these are laid out.

settings
--------

You can also set settings (such as tabstop or theme) by adding a settings
object to the config.
