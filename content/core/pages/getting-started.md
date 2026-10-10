{{
    id: "getting-started"
    title: "Getting Started",
    prev: "null",
    next: "regions"
}}

# Getting Started

## Requirements

- A [Paper](https://papermc.io) server. PluginWizard-Core uses Paper-only APIs (the Brigadier command lifecycle and Adventure text components), so it does not run on Spigot or CraftBukkit.
- Java 25. The library is compiled against the Paper API `26.3`. (Also supports 26.x, older versions do not get the features or patches)
- Folia is not supported

## Adding the Dependency

The latest version is: ![Maven Central](https://img.shields.io/maven-central/v/net.kalbskinder/pluginwizard-core?color=1bcc94&logo=apache-maven)

Replace `VERSION` in the snippets below with that version.

### Gradle (Kotlin DSL)

```kotlin
repositories {
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/")
}

dependencies {
    compileOnly("io.papermc.paper:paper-api:26.3.build.+")
    implementation("net.kalbskinder:pluginwizard-core:VERSION")
}
```

### Gradle (Groovy DSL)

```groovy
dependencies {
    implementation 'net.kalbskinder:pluginwizard-core:VERSION'
}
```

### Maven

```xml
<dependency>
    <groupId>net.kalbskinder</groupId>
    <artifactId>pluginwizard-core</artifactId>
    <version>VERSION</version>
</dependency>
```

## Shipping the Library with Your Plugin

PluginWizard-Core is a library, not a plugin. It is not installed on the server by itself, so its classes have to reach the server together with your plugin. You have two options:

**Option 1: Bundle (shade) it into your plugin jar.** Use the [Shadow](https://gradleup.com/shadow/) plugin for Gradle or the `maven-shade-plugin` for Maven and build your plugin with it (for example `./gradlew shadowJar`). The resulting jar contains PluginWizard-Core and its dependencies.

**Option 2: Let Paper download it.** If your plugin uses a `plugin.yml`, Paper can download libraries from Maven Central when the server starts. Keep the dependency as `compileOnly` (Gradle) or `provided` (Maven) and add it to your `plugin.yml`:

```yaml
name: MyPlugin
main: com.example.myplugin.MyPlugin
version: 1.0.0
api-version: '26.3' # the API version of your server
libraries:
  - net.kalbskinder:pluginwizard-core:VERSION
```

The `libraries` key only works in `plugin.yml`. Plugins that use a `paper-plugin.yml` have to shade the library or load it with a `PluginLoader`.

## Initializing PluginWizard-Core

Call `Helpers.initialize` once, at the start of your plugin's `onEnable` method:

```java
import net.kalbskinder.helpers.Helpers;
import org.bukkit.plugin.java.JavaPlugin;

public final class MyPlugin extends JavaPlugin {

    @Override
    public void onEnable() {
        Helpers.initialize(this);

        // Use the helpers from here on
    }
}
```

`initialize` creates every helper, registers the listeners needed for GUI menus and prepares command registration. Until it has run, all helper fields are `null`, so using them earlier (for example in `onLoad` or a static initializer) causes a `NullPointerException`. Call it only once; calling it again registers the GUI listeners a second time.

## Using the Helpers

All helpers are static fields of the `Helpers` class:

- `Helpers.regionHelper`: [Regions](/docs/core/?page=regions)
- `Helpers.eventHelper`: [Event Listeners](/docs/core/?page=events)
- `Helpers.entityHelper`: [Entities](/docs/core/?page=entities)
- `Helpers.locationHelper`: [Location Utilities](/docs/core/?page=location)
- `Helpers.itemHelper`: [Item Utilities](/docs/core/?page=item)
- `Helpers.guiHelper`: [GUI / Inventory Menus](/docs/core/?page=gui)
- `Helpers.messageHelper` and `Helpers.titleHelper`: [Title & Message Utilities](/docs/core/?page=messages)
- `Helpers.miniMessageHelper`: [MiniMessage Utilities](/docs/core/?page=minimessage)
- `Helpers.soundHelper`: [Sound Utilities](/docs/core/?page=sound)
- `Helpers.teleportHelper`: [Teleportation Utilities](/docs/core/?page=teleport)
- `Helpers.playerItemHelper`: [Player Inventory Utilities](/docs/core/?page=player-inventory)
- `Helpers.mathHelper`: [Math Utilities](/docs/core/?page=math)

Commands are created with the static `CommandHelper.create` method instead (see [Creating Commands](/docs/core/?page=commands)), and the database classes are created with `new` (see [SQLite Database](/docs/core/?page=database)).

A static import keeps the calls short:

```java
import static net.kalbskinder.helpers.Helpers.*;

messageHelper.sendMessage(player, "<gold>Hello!");
soundHelper.playSound(player, Sound.ENTITY_PLAYER_LEVELUP, 1f, 1f);
```

## Text Formatting

Every helper that takes a message, title, item name or lore line as a `String` parses it with the [MiniMessage helper](/docs/core/?page=minimessage). You can write either MiniMessage tags (`<red>Hello`) or legacy color codes (`&cHello`), but not both in the same string.
