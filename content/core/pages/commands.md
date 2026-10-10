{{
    id: "commands"
    title: "Creating Commands",
    prev: "regions",
    next: "events"
}}

# Creating Commands

`CommandHelper` builds commands on top of Paper's Brigadier command API. You get tab completion and argument validation from the client for free, and you don't need to declare the commands in your `plugin.yml`.

## A Simple Command

```java
CommandHelper.create("hello")
        .executes(ctx -> Helpers.messageHelper.sendMessage(ctx.getSender(), "<green>Hello!"))
        .register();
```

`CommandHelper.create(name)` starts a new command, `executes` sets the code that runs when the command is used, and `register` registers it with the server.

```java
@Override
public void onEnable() {
    Helpers.initialize(this);

    CommandHelper.create("hello").executes(ctx -> { /* ... */ }).register();
    CommandHelper.create("spawn").executes(ctx -> { /* ... */ }).register();

}
```

- Call `Helpers.initialize` before registering commands.

## Arguments

Add arguments with the `...Arg(name)` methods and read them in the executor with the matching `get...Arg(name)` method:

```java
// /heal <target> <amount>
CommandHelper.create("heal")
        .playerArg("target")
        .intArg("amount")
        .executes(ctx -> {
            Player target = ctx.getPlayerArg("target");
            int amount = ctx.getIntArg("amount");
            target.setHealth(Math.min(target.getHealth() + amount, 20));
        })
        .register();
```

### Argument Types

- `stringArg(name)` / `getStringArg(name)`: a single word, or several words in quotes (`"hello world"`). Returns a `String`.
- `intArg(name)` / `getIntArg(name)`: a whole number. Returns an `Integer`.
- `floatArg(name)` / `getFloatArg(name)`: a decimal number. Returns a `Float`.
- `booleanArg(name)` / `getBooleanArg(name)`: `true` or `false`. Returns a `Boolean`.
- `playerArg(name)` / `getPlayerArg(name)`: an online player's name or a selector like `@p`. Returns a `Player`.
- `entityArg(name)` / `getEntityArg(name)`: an entity type, such as `minecraft:zombie`. Returns an `EntityType`.
- `itemArg(name)` / `getItemArg(name)`: an item, such as `diamond_sword`. Returns an `ItemStack`.
- `blockArg(name)` / `getBlockArg(name)`: a block, such as `stone`. Returns a `BlockState`.
- `worldArg(name)` / `getWorldArg(name)`: a world name. Returns a `World`.
- `gameModeArg(name)` / `getGameModeArg(name)`: a game mode, such as `creative`. Returns a `GameMode`.
- `colorCodeArg(name)` / `getColorCodeArg(name)`: a color name such as `red` or `dark_blue`, with suggestions for all 16 chat colors. Returns a `String`.
- `customArg(name, suggestions)` / `getCustomArg(name)`: a single word, with your own list of suggestions. Returns a `String`.

`customArg` and `colorCodeArg` only **suggest** values. Players can still type any word, so check the value in your executor:

```java
// /kit <name>
CommandHelper.create("kit")
        .customArg("name", List.of("starter", "pvp", "builder"))
        .executes(ctx -> {
            String kit = ctx.getCustomArg("name");
            if (!List.of("starter", "pvp", "builder").contains(kit)) {
                Helpers.messageHelper.sendMessage(ctx.getSender(), "<red>Unknown kit: " + kit);
                return;
            }
            // give the kit ...
        })
        .register();
```

The getters return `null` when no argument with that name exists or it has a different type, so make sure the names match.

### Arguments Are Chained

Arguments are added in order, and all of them are required: `.playerArg("target").intArg("amount")` creates `/heal <target> <amount>`, and `/heal Steve` alone is not a valid command.

An `executes` call placed **after** the arguments runs when all arguments are given. An `executes` call placed **before** the arguments runs when the command is used without any arguments. Use both to make the arguments optional:

```java
// /fly          toggles your own flight
// /fly <target> toggles the flight of another player
CommandHelper.create("fly")
        .executes(ctx -> {
            Player player = ctx.getPlayer();
            if (player != null) player.setAllowFlight(!player.getAllowFlight());
        })
        .playerArg("target")
        .executes(ctx -> {
            Player target = ctx.getPlayerArg("target");
            target.setAllowFlight(!target.getAllowFlight());
        })
        .register();
```

## Subcommands

`sub(name)` starts a subcommand. It has the same argument and `executes` methods as a command. `end()` finishes the subcommand and returns to the main command, so you can add more subcommands:

```java
// /myplugin           shows the plugin version
// /myplugin help      shows the help
// /myplugin give <player> <item>
CommandHelper myplugin = CommandHelper.create("myplugin")
        .sub("help")
            .executes(ctx -> Helpers.messageHelper.sendMessage(ctx.getSender(), "<gray>Usage: /myplugin give [player] [item]"))
        .end()
        .sub("give")
            .playerArg("player")
            .itemArg("item")
            .executes(ctx -> Helpers.playerItemHelper.giveItem(ctx.getItemArg("item"), 1, ctx.getPlayerArg("player")))
        .end()
        .executes(ctx -> Helpers.messageHelper.sendMessage(ctx.getSender(), "<gray>MyPlugin v1.0.0"))
        .register();
```

Always call `end()` after a subcommand, otherwise it is not added to the command.

## The Command Context

The `ctx` object passed to `executes` is a `CommandContextWrapper`. Besides the argument getters it has:

- `getSender()`: the `CommandSender` that ran the command (a player, the console or a command block).
- `getPlayer()`: the player that ran the command, or `null` if it was not a player.
- `wasExecutedByPlayer()`: `true` if a player ran the command.

```java
CommandHelper.create("spawn").executes(ctx -> {
    if (!ctx.wasExecutedByPlayer()) {
        Helpers.messageHelper.sendMessage(ctx.getSender(), "<red>Only players can use this command.");
        return;
    }
    Player player = ctx.getPlayer();
    Helpers.teleportHelper.teleportEntity(player, player.getWorld().getSpawnLocation());
}).register();
```

## Permissions

`CommandHelper` does not support permissions yet, so every player can see and run every command. Check permissions inside the executor:

```java
CommandHelper.create("broadcast")
        .stringArg("message")
        .executes(ctx -> {
            if (!ctx.getSender().hasPermission("myplugin.broadcast")) {
                Helpers.messageHelper.sendMessage(ctx.getSender(), "<red>You don't have permission to do that.");
                return;
            }
            Bukkit.getOnlinePlayers().forEach(p -> Helpers.messageHelper.sendMessage(p, ctx.getStringArg("message")));
        }).register();
```
