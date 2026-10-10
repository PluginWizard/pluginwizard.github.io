{{
    id: "events"
    title: "Event Listeners",
    prev: "commands",
    next: "entities"
}}

# Event Listeners

`Helpers.eventHelper` registers listeners for any Bukkit or Paper event with a lambda, so you don't need to create a class that implements `Listener` and annotate methods with `@EventHandler`.

## Subscribing to an Event

Pass the event class and the code that should run:

```java
// "[+] Steve welcome to the server!"
Helpers.eventHelper.subscribe(PlayerJoinEvent.class, event -> {
    String name = event.getPlayer().getName();
    event.joinMessage(Helpers.miniMessageHelper.parse("&7[&a+&7] &f" + name + " welcome to the server!"));
});

// Cancel every block break outside of creative mode
Helpers.eventHelper.subscribe(BlockBreakEvent.class, event -> {
    if (event.getPlayer().getGameMode() != GameMode.CREATIVE) {
        event.setCancelled(true);
    }
});
```

The listener stays registered until your plugin is disabled.

## Priority and Cancelled Events

A second `subscribe` method takes an `EventPriority` and an `ignoreCancelled` flag, like `@EventHandler(priority = ..., ignoreCancelled = ...)`:

```java
Helpers.eventHelper.subscribe(AsyncChatEvent.class, EventPriority.HIGHEST, true, event -> {
    // Runs late, and only if no other plugin cancelled the message
});
```

The first method uses `EventPriority.NORMAL` and also runs for cancelled events.

## Unsubscribing

`subscribe` returns the `Listener` it registered. Pass it to `HandlerList.unregisterAll` to stop listening:

```java
Listener listener = Helpers.eventHelper.subscribe(PlayerMoveEvent.class, event -> {
    // ...
});

// later
HandlerList.unregisterAll(listener);
```

## Events of a Specific Entity

To listen to the events of a single entity, for example the death of a boss, use `forEntity`. See [Entities](/docs/core/?page=entities).

```java
Helpers.eventHelper.forEntity("boss").onDeath(event ->
        Bukkit.broadcast(Helpers.miniMessageHelper.parse("<gold>The boss has been defeated!")));
```
