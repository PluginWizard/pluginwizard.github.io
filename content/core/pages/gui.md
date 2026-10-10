{{
    id: "gui"
    title: "GUI / Inventory Menus",
    prev: "item",
    next: "messages"
}}

# GUI / Inventory Menus

`Helpers.guiHelper` creates clickable inventory menus without writing your own `InventoryHolder` or click listener. Every slot can have its own click handler, and a **locked** menu prevents players from taking or moving its items.

## Creating a Menu

```java
// A locked menu with 3 rows (27 slots)
GUI gui = Helpers.guiHelper.createInventory(3, "<dark_gray>My Menu", true);

// Fill the border with glass panes
gui.setFrame(Helpers.itemHelper.toItemStack("gray_stained_glass_pane"));

ItemStack button = Helpers.itemHelper.newItem()
        .material(Material.EMERALD)
        .name("<green><bold>Click me!")
        .build();

gui.setItem(13, button, (player, menu, slot, event) -> {
    Helpers.messageHelper.sendMessage(player, "<green>You clicked the button!");
});

gui.open(player);
```

![GUI Showcase](/content/images/gui.png)

`createInventory` takes:

- **rows** (`1` to `6`) for a chest menu with `rows * 9` slots, **or** an `InventoryType` such as `InventoryType.HOPPER` or `InventoryType.DISPENSER` for a different layout.
- **title** as a `String` (parsed with the [MiniMessage helper](/docs/core/?page=minimessage)) or as a `Component`.
- **locked**: `true` to stop players from taking, placing or moving items in the menu.

```java
GUI hopper = Helpers.guiHelper.createInventory(InventoryType.HOPPER, "<gold>Choose a kit", true);
```

## Slots

Slots are numbered from `0`, left to right and top to bottom. In a chest menu, slot `0` is the top left, slot `8` the top right and slot `9` the first slot of the second row. The slot in row `r` and column `c` (both starting at `0`) is `r * 9 + c`.

## Placing Items

- `setItem(slot, item, handler)`: places an item and the code that runs when it is clicked.
- `setItemStack(slot, item)`: places an item without a click handler.
- `onClick(slot, handler)`: sets the click handler of a slot without changing its item.
- `removeClick(slot)`: removes the click handler of a slot and leaves the item in place.
- `setBackground(item)`: fills every slot with the item. Call it before placing your buttons.
- `setFrame(item)`: fills the outer border of a chest menu. Only use it with menus created with a row count.

These methods return the `GUI`, so they can be chained:

```java
GUI gui = Helpers.guiHelper.createInventory(6, "<dark_gray>Shop", true)
        .setBackground(Helpers.itemHelper.toItemStack("black_stained_glass_pane"))
        .setItem(20, swordItem, (player, menu, slot, event) -> buy(player, "sword"))
        .setItem(24, bowItem, (player, menu, slot, event) -> buy(player, "bow"));
```

## Click Handlers

A click handler receives four values:

- `player`: the player who clicked.
- `menu`: the `GUI` that was clicked, so one handler can be reused for several menus.
- `slot`: the slot that was clicked, so one handler can be reused for several slots.
- `event`: the Bukkit `InventoryClickEvent`, for example to tell the click type apart with `event.getClick()`.

```java
gui.setItem(13, button, (player, menu, slot, event) -> {
    if (event.getClick() == ClickType.RIGHT) {
        Helpers.messageHelper.sendMessage(player, "<yellow>Right click!");
    } else if (event.isShiftClick()) {
        Helpers.messageHelper.sendMessage(player, "<yellow>Shift click!");
    } else {
        Helpers.messageHelper.sendMessage(player, "<yellow>Left click!");
    }
});
```

Handlers only run for clicks inside the menu, not for clicks in the player's own inventory below it. They run whether the menu is locked or not.

### Fallback Handler

`setFallbackInteraction` sets a handler for every slot that has no handler of its own:

```java
gui.setFallbackInteraction((player, menu, slot, event) ->
        Helpers.soundHelper.playSound(player, Sound.BLOCK_NOTE_BLOCK_BASS, 1f, 0.5f));
```

## Opening and Closing

- `gui.open(player)` opens the menu for a player. Several players can have the same menu open at once and see the same items.
- `gui.close(player)` closes the inventory the player has open.
- `gui.getViewers()` lists the players who have the menu open.

Bukkit does not allow opening or closing inventories directly inside a click event. To close the menu or open another one from a click handler, schedule it for the next tick:

```java
gui.setItem(26, closeButton, (player, menu, slot, event) ->
        Bukkit.getScheduler().runTask(plugin, () -> menu.close(player)));

gui.setItem(11, nextPageButton, (player, menu, slot, event) ->
        Bukkit.getScheduler().runTask(plugin, () -> secondPage.open(player)));
```

`plugin` is your plugin instance (for example `this` in your main class).

## Locked and Unlocked Menus

In a **locked** menu, every click inside the menu is cancelled, as well as shift-clicks from the player's own inventory into the menu and dragging items across the menu. The click handlers still run. You can switch a menu later with `gui.setLocked(...)`.

In an **unlocked** menu, players can take and put items like in a chest. This is useful for menus where players drop in items, for example a trade or a sell menu. Read the contents with `gui.getInventory()`.

## Updating a Menu

Changes to an open menu are visible immediately, so you can update items from a handler:

```java
gui.setItem(13, offItem, new GuiInteraction() {
    private boolean on = false;

    @Override
    public void handle(Player player, GUI menu, int slot, InventoryClickEvent event) {
        on = !on;
        menu.setItemStack(slot, on ? onItem : offItem);
    }
});
```

## Reusing Menus

Create a new `GUI` every time you open a menu that shows player-specific content (for example the player's stats). A menu that looks the same for everybody can be created once and opened for every player.
