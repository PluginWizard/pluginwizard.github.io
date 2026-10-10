{{
    id: "location"
    title: "Location Utilities",
    prev: "entities",
    next: "item"
}}

# Location Utilities

`Helpers.locationHelper` converts a `Location` to a `String` and back, which makes it easy to store locations in a config file or database.

## Usage

```java
// Location -> String
String text = Helpers.locationHelper.locationToString(player.getLocation()); // "world,12.5,64.0,-3.25"

// String -> Location
Location location = Helpers.locationHelper.stringToLocation("world,0,64,0");
```

## Format

A location string has the form `world,x,y,z`:

- `world` is the name of the world, as in `Bukkit.getWorld(name)`.
- `x`, `y` and `z` are numbers and may have decimals.
- There are no spaces after the commas.

## Things to Keep in Mind

- **Yaw and pitch are not stored.** The direction a player is looking is lost, and `stringToLocation` always creates a location with a yaw and pitch of `0`.
- **The world must be loaded.** If no loaded world has the given name, `stringToLocation` returns a location whose world is `null`. Using that location (for example to teleport) fails.
- **Invalid strings throw an exception.** A string with fewer than four parts or with values that are not numbers throws an exception in `stringToLocation`.
- `locationToString(null)` returns the text `"null"`, which cannot be turned back into a location.
