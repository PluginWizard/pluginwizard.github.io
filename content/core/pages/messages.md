{{
    id: "messages"
    title: "Title & Message Utilities",
    prev: "gui",
    next: "minimessage"
}}

# Title & Message Utilities

`Helpers.messageHelper` sends chat messages and `Helpers.titleHelper` shows titles and action bar messages. All texts are parsed with the [MiniMessage helper](/docs/core/?page=minimessage), so you can use MiniMessage tags or legacy `&` color codes.

## Chat Messages

```java
Helpers.messageHelper.sendMessage(player, "<green>Welcome back, <bold>" + player.getName());
Helpers.messageHelper.sendMessage(Bukkit.getConsoleSender(), "&eThe arena has been reset.");
```

`sendMessage` accepts a `Player` or any `CommandSender`, such as the console or the sender of a command. The `Player` version does nothing if the player or the message is `null`.

To send a message to everybody, loop over the online players:

```java
Bukkit.getOnlinePlayers().forEach(p -> Helpers.messageHelper.sendMessage(p, "<gold>The event starts now!"));
```

## Titles

```java
// Title only
Helpers.titleHelper.displayTitle(player, "<gold><bold>Victory!", 500, 3000, 1000);

// Title and subtitle
Helpers.titleHelper.displayTitle(player, "<red>Round 2", "<gray>Get ready...", 500, 2000, 500);
```

The last three values are the fade-in, stay and fade-out times in **milliseconds**. `500, 3000, 1000` fades in for half a second, stays for three seconds and fades out for one second.

## Action Bar

The action bar is the small text above the hotbar:

```java
Helpers.titleHelper.displayActionbar(player, "<yellow>+10 coins");
```

Action bar messages disappear after a few seconds. Send the message again regularly (for example with a repeating task) to keep it visible.
