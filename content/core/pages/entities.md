{{
    id: "entities"
    title: "Entities",
    prev: "events",
    next: "location"
}}

# Entities

`Helpers.entityHelper` summons entities and gives them an **id**, a name you choose. With `Helpers.eventHelper.forEntity(id)` you can then react to events of exactly those entities.

## Summoning an Entity

```java
World world = Bukkit.getWorld("world");
Entity boss = Helpers.entityHelper.summonEntity("minecraft:wither_skeleton", "boss", world);

if (boss != null) {
    boss.teleport(new Location(world, 100, 64, 100));
}
```

- The entity type can be written with or without the namespace: `minecraft:zombie` or `zombie`.
- The entity is spawned at the **spawn location of the world**. Teleport it afterwards to move it where you need it.
- `summonEntity` returns `null` if the world is `null`, the entity type does not exist, or the type cannot be spawned (for example `player`).
- The id is optional. Pass `null` to spawn an entity without one.

Several entities can share the same id, for example all guards of a base.

## How Ids Work

The id is stored as the scoreboard tag `pluginwizard:id=<id>` on the entity. It is not visible to players and it is saved with the entity, so it survives server restarts.

You can therefore give an id to entities that were not spawned with `summonEntity`:

```java
villager.addScoreboardTag("pluginwizard:id=shopkeeper");
```

or with the vanilla command `/tag @e[type=villager,limit=1,sort=nearest] add pluginwizard:id=shopkeeper`.

Check whether an entity has an id with `isTargetEntity`:

```java
if (Helpers.entityHelper.isTargetEntity(entity, "boss")) {
    // ...
}
```

## Listening to Entity Events

`Helpers.eventHelper.forEntity(id)` returns a registrar with methods for common entity events. The callback only runs for entities with that id:

```java
EntityEventRegistrar boss = Helpers.eventHelper.forEntity("boss");

boss.onDamage(event -> {
    // The boss takes less damage
    event.setDamage(event.getDamage() / 2);
});

boss.onDeath(event -> {
    event.getDrops().clear();
    event.getDrops().add(new ItemStack(Material.NETHER_STAR));
});

Helpers.eventHelper.forEntity("shopkeeper").onInteract(event -> {
    event.setCancelled(true);
    shopGui.open(event.getPlayer());
});
```

### Available Events

- `onSpawn`: the entity is spawned (`EntitySpawnEvent`). Entities spawned with `summonEntity` get their id right after spawning, so this does not fire for them.
- `onDeath`: the entity dies (`EntityDeathEvent`).
- `onDamage`: the entity takes damage from any source (`EntityDamageEvent`).
- `onDamageByEntity`: the entity is damaged by another entity (`EntityDamageByEntityEvent`).
- `onDamagesOther`: the entity damages another entity (`EntityDamageByEntityEvent`, matched on the attacker).
- `onPickupItem`: the entity picks up an item (`EntityPickupItemEvent`).
- `onInteract`: a player right-clicks the entity (`PlayerInteractEntityEvent`).
- `onInteractAt`: a player right-clicks a specific point on the entity, mainly used for armor stands (`PlayerInteractAtEntityEvent`).
- `onMove`: the entity moves (`EntityMoveEvent`). This event does not fire for players.


### Any Other Event

Use `on` for events that are not in the list. Pass the event class and a function that returns the entity of the event:

```java
Helpers.eventHelper.forEntity("boss").on(EntityTargetEvent.class, EntityTargetEvent::getEntity, event -> {
    // The boss only targets players
    if (!(event.getTarget() instanceof Player)) event.setCancelled(true);
});
```

An overload of `on` additionally takes an `EventPriority` and an `ignoreCancelled` flag, like [`subscribe`](/docs/core/?page=events).

All methods return the registered `Listener`, which you can pass to `HandlerList.unregisterAll` to stop listening.
