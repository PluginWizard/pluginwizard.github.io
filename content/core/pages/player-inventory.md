{{
    id: "player-inventory"
    title: "Player Inventory Utilities",
    prev: "teleport",
    next: "math"
}}

# Player Inventory Utilities

`Helpers.playerItemHelper` puts items into a player's inventory.

## Giving Items

```java
ItemStack apple = Helpers.itemHelper.toItemStack("golden_apple");
Helpers.playerItemHelper.giveItem(apple, 5, player);
```

`giveItem` adds the items to the first free slots, the same way as picking items up. If the inventory is full, the items that don't fit are dropped at the player's feet. Large amounts are split into several stacks automatically.

## Setting a Slot

```java
ItemStack compass = Helpers.itemHelper.newItem()
        .material(Material.COMPASS)
        .name("<yellow>Server Selector")
        .build();

// Put the compass into the middle hotbar slot
Helpers.playerItemHelper.setItem(compass, 4, 1, player);
```

`setItem` replaces whatever is in the slot. The slots of a player inventory are numbered like this:

- `0` to `8`: hotbar, from left to right
- `9` to `35`: main inventory, from the top left to the bottom right
- `36` to `39`: armor: boots (`36`), leggings (`37`), chestplate (`38`), helmet (`39`)
- `40`: off hand

`setItem` does not split stacks, so keep the amount at or below the item's maximum stack size (usually 64).

## Notes

- Both methods copy the item, so you can reuse the same `ItemStack` for several players.
- The `amount` argument overrides the amount of the item.
- Nothing happens if the player or item is `null`, or if the amount is `0` or less.
