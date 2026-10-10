{{
    id: "teleport"
    title: "Teleportation Utilities",
    prev: "sound",
    next: "player-inventory"
}}

# Teleportation Utilities

`Helpers.teleportHelper` teleports players and other entities, either to a `Location` or to coordinates.

## Teleporting to a Location

```java
Location spawn = Helpers.locationHelper.stringToLocation("world,0,64,0");
Helpers.teleportHelper.teleportEntity(player, spawn);
```

## Teleporting to Coordinates

```java
// In the world the entity is currently in
Helpers.teleportHelper.teleportEntity(player, 100, 64, -250);

// In another world
World nether = Bukkit.getWorld("world_nether");
Helpers.teleportHelper.teleportEntity(nether, player, 0, 70, 0);
```

## Overview

- `teleportEntity(entity, location)`: teleports to the location.
- `teleportEntity(entity, x, y, z)`: teleports to the coordinates in the entity's current world.
- `teleportEntity(world, entity, x, y, z)`: teleports to the coordinates in the given world.

All methods work for players and for any other entity. Nothing happens if the entity, location or world is `null`.

Teleporting to coordinates keeps no viewing direction: the entity always faces south (yaw and pitch of `0`) afterwards. To keep the direction, pass a `Location` with the yaw and pitch you want:

```java
Location target = new Location(world, 100, 64, -250, player.getLocation().getYaw(), player.getLocation().getPitch());
Helpers.teleportHelper.teleportEntity(player, target);
```

Coordinates are not centered on blocks: `teleportEntity(player, 100, 64, -250)` places the player on the corner of the block. Use `100.5` and `-249.5` to place them in the middle.
