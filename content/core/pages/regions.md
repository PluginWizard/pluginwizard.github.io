{{
    id: "regions"
    title: "Regions",
    prev: "getting-started",
    next: "commands"
}}

# Regions

A region is a box-shaped (cuboid) area between two corner locations. Each region has a set of **flags** that control what players can do inside it, for example PvP, breaking blocks or flying, and it can run code when a player enters or leaves it.

> **Note:** Region tracking and flags need version 1.5.1 or newer. In earlier versions the region listener was broken, so enter/leave callbacks, flags and `isPlayerInRegion` had no effect.

## Creating a Region

Create a `Region` with a unique id, a name and two opposite corners, then register it with the region helper:

```java
Location corner1 = Helpers.locationHelper.stringToLocation("world,0,60,0");
Location corner2 = Helpers.locationHelper.stringToLocation("world,20,80,20");

Region spawn = new Region(UUID.randomUUID(), "spawn", corner1, corner2);
Helpers.regionHelper.addRegion(spawn);
```

The corners can be given in any order. A player is inside the region when the block they are standing in lies between the two corner blocks on all three axes, with both corner blocks included. With the corners `0,60,0` and `20,80,20`, the region covers 21 × 21 × 21 blocks, so a player standing at `x = 20.9` is still inside.

You can check any location yourself with `region.contains(location)`.

Keep the following in mind:

- **Regions belong to a world.** The region uses the world of its first corner. Locations in other worlds are never inside it.
- **Regions can overlap.** A player is tracked in every region they are standing in at the same time. See [Overlapping Regions](#overlapping-regions) for how flags are combined.
- **Changes need movement.** Players who are already standing inside a region when you add it are detected the next time they move to another block or teleport.
- **Regions are not saved.** Regions only exist in memory. Create them again in `onEnable` every time the server starts, for example from your config or database.

## Entering and Leaving

Register a callback with `onRegionEnter` or `onRegionLeave`. It receives a `RegionEvent` with the player and the region:

```java
spawn.onRegionEnter(event -> {
    Player player = event.getPlayer();
    Helpers.titleHelper.displayTitle(player, "<gold>Spawn", "<gray>You are safe here", 500, 2000, 500);
});

spawn.onRegionLeave(event ->
        Helpers.messageHelper.sendMessage(event.getPlayer(), "<red>You left " + event.getRegion().getName()));
```

- The enter callback runs when a player walks or teleports into the region, joins the server while standing inside it, changes into its world inside it, or respawns inside it.
- The leave callback runs when a player walks or teleports out of the region, changes to another world, leaves the server or is kicked.
- Moving only within the same block does not trigger anything; regions are checked when a player moves to another block.
- If a single move leaves some regions and enters others, all leave callbacks run before the enter callbacks.
- Each region holds one enter and one leave callback. Calling `onRegionEnter` again replaces the previous callback.

You can register the callbacks before or after `addRegion`; the region helper keeps a reference to the same `Region` object.

## Checking Who Is Inside

```java
boolean inSpawn = Helpers.regionHelper.isPlayerInRegion(player, spawn);
boolean inArena = Helpers.regionHelper.isPlayerInRegion(player, "arena"); // name, ignoring case
```

`region.getPlayers()` returns a map of the players currently inside the region, keyed by their UUID. Since regions can overlap, a player can be inside several regions at once.

## Flags

A flag that is set on a region **allows** the matching behavior inside it. Removing a flag forbids it. A new region starts with every flag set except `FLIGHT`, `NATURAL_REGENERATION`, `INSTANT_RESPAWN` and `KEEP_INVENTORY`, so by default it behaves like the rest of the world.

```java
// Turn the spawn into a safe zone
Helpers.regionHelper.removeRegionFlag(spawn, RegionFlag.PVP);
Helpers.regionHelper.removeRegionFlag(spawn, RegionFlag.BREAK_BLOCKS);
Helpers.regionHelper.removeRegionFlag(spawn, RegionFlag.HUNGER);
Helpers.regionHelper.addRegionFlag(spawn, RegionFlag.FLIGHT);
```

You can also change the flags on the region directly with `spawn.addFlag(...)`, `spawn.removeFlag(...)`, `spawn.getFlags()` and `spawn.setFlags(...)`. If you use `setFlags`, pass a modifiable set such as `new HashSet<>(Set.of(...))`, otherwise removing a flag later throws an exception.

### Available Flags

- `PVP` (default: on): players can damage each other. Damage is blocked if either the attacker or the victim is in a region without this flag.
- `BREAK_BLOCKS` (default: on): players inside the region can break blocks. Without it, blocks inside the region also cannot be broken by players standing outside of it.
- `BLOCK_INTERACTION` (default: on): players can place blocks, right-click blocks (doors, chests, buttons, ...), edit signs, shear, leash and unleash entities and catch mobs in buckets. Without it, blocks inside the region also cannot be placed or right-clicked, even by players standing outside of it.
- `DROP_ITEMS` (default: on): players can drop items.
- `PICKUP_ITEMS` (default: on): players can pick up items.
- `FALL_DAMAGE` (default: on): players take fall damage.
- `FIRE_DAMAGE` (default: on): players take damage from fire and from burning.
- `SUFFOCATION_DAMAGE` (default: on): players take damage when stuck inside blocks.
- `DROWNING_DAMAGE` (default: on): players take drowning damage.
- `POISON_WITHER_DAMAGE` (default: on): players take magic (for example poison) and wither damage.
- `HUNGER` (default: on): the food level changes. Without it, the food level is frozen. This also means eating does not restore hunger.
- `KILL_DEATH_MESSAGES` (default: on): death messages are shown when a player dies in the region.
- `FLIGHT` (default: off): players are allowed to fly while inside. Flight is taken away again when they leave, unless they are in creative or spectator mode. Without it, players cannot start flying inside the region.
- `NATURAL_REGENERATION` (default: off): players heal one health point (half a heart) every 4 seconds while inside, in addition to normal regeneration.
- `INSTANT_RESPAWN` (default: off): players who die skip the death screen and are teleported to their respawn point (or the world spawn). Their items and experience are dropped unless `KEEP_INVENTORY` is set.
- `KEEP_INVENTORY` (default: off): players keep their items when they die.

### Overlapping Regions

When a player is inside several regions, the most restrictive one wins:

- A flag that is **on by default** (for example `PVP` or `HUNGER`) is denied as soon as any of the regions does not have it.
- A flag that is **off by default** (`FLIGHT`, `NATURAL_REGENERATION`, `INSTANT_RESPAWN`, `KEEP_INVENTORY`) is only granted if every one of the regions has it.

For blocks, the regions containing the block are combined the same way.

### Server Operators

Operators are not affected by `BLOCK_INTERACTION`, can always start flying, and can break blocks inside a region without `BREAK_BLOCKS` while standing outside of it. All other flags apply to operators as well.

## Full Example

```java
@Override
public void onEnable() {
    Helpers.initialize(this);

    Region arena = new Region(
            UUID.randomUUID(),
            "arena",
            Helpers.locationHelper.stringToLocation("world,100,60,100"),
            Helpers.locationHelper.stringToLocation("world,150,90,150")
    );

    arena.removeFlag(RegionFlag.BREAK_BLOCKS);
    arena.removeFlag(RegionFlag.BLOCK_INTERACTION);
    arena.removeFlag(RegionFlag.KILL_DEATH_MESSAGES);
    arena.addFlag(RegionFlag.INSTANT_RESPAWN);
    arena.addFlag(RegionFlag.KEEP_INVENTORY);

    arena.onRegionEnter(event ->
            Helpers.titleHelper.displayTitle(event.getPlayer(), "<red><bold>Arena", "<gray>Fight!", 250, 1500, 250));

    Helpers.regionHelper.addRegion(arena);
}
```
