{{
    title: "PluginWizard-Core Docs",
    next: "getting-started"
}}

# PluginWizard-Core

![PluginWizard-Core](https://github.com/user-attachments/assets/2b81571c-4985-46a7-8be7-9faf5c1218c1)

[![Maven Central](https://img.shields.io/maven-central/v/net.kalbskinder/pluginwizard-core?color=1bcc94&logo=apache-maven)](https://central.sonatype.com/artifact/net.kalbskinder/pluginwizard-core) [![Javadoc](https://javadoc.io/badge2/net.kalbskinder/pluginwizard-core/javadoc.svg)](https://javadoc.io/doc/net.kalbskinder/pluginwizard-core/latest/index.html)

PluginWizard-Core is a collection of utility classes that make developing [Paper](https://papermc.io) plugins easier. It powers every plugin created with [PluginWizard](https://github.com/PluginWizard/PluginWizard), but you can use it in any hand-written plugin as well.

Instead of writing listener classes, inventory holders and Brigadier command trees yourself, you get small fluent helpers:

```java
@Override
public void onEnable() {
    Helpers.initialize(this);

    Helpers.eventHelper.subscribe(PlayerJoinEvent.class, event ->
            Helpers.messageHelper.sendMessage(event.getPlayer(), "<green>Welcome to the server!"));
}
```

## Features

- [Getting Started](/docs/core/?page=getting-started): add the dependency and initialize the library
- [Regions](/docs/core/?page=regions): cuboid areas with flags (PvP, hunger, flight, ...) and enter/leave callbacks
- [Creating Commands](/docs/core/?page=commands): Brigadier commands with arguments and subcommands
- [Event Listeners](/docs/core/?page=events): subscribe to any Bukkit event with a lambda
- [Entities](/docs/core/?page=entities): summon entities with an id and listen to their events
- [Location Utilities](/docs/core/?page=location): convert locations to and from strings
- [Item Utilities](/docs/core/?page=item): build custom items with names, lore and enchantments
- [GUI / Inventory Menus](/docs/core/?page=gui): clickable inventory menus
- [Title & Message Utilities](/docs/core/?page=messages): chat messages, titles and action bars
- [MiniMessage Utilities](/docs/core/?page=minimessage): parse MiniMessage and legacy `&` color codes
- [Sound Utilities](/docs/core/?page=sound): play sounds to players or at locations
- [Teleportation Utilities](/docs/core/?page=teleport): teleport players and entities
- [Player Inventory Utilities](/docs/core/?page=player-inventory): give items and set inventory slots
- [Math Utilities](/docs/core/?page=math): random numbers and list statistics
- [SQLite Database](/docs/core/?page=database): a small wrapper around an SQLite connection

## Links

- [Source code on GitHub](https://github.com/PluginWizard/PluginWizard-Core)
- [Maven Central](https://central.sonatype.com/artifact/net.kalbskinder/pluginwizard-core)
- [Javadoc](https://javadoc.io/doc/net.kalbskinder/pluginwizard-core/latest/index.html)
- [PluginWizard-Editor documentation](/docs/pluginwizard/)

PluginWizard-Core is licensed under the [Apache License 2.0](https://github.com/PluginWizard/PluginWizard-Core/blob/main/LICENSE).
