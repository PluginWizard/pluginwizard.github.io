{{
    id: "item"
    title: "Item Utilities",
    prev: "location",
    next: "gui"
}}

# Item Utilities

`Helpers.itemHelper` creates `ItemStack`s with custom names, lore, enchantments and item flags. Names and lore are parsed with the [MiniMessage helper](/docs/core/?page=minimessage).

## The Item Builder

Start a builder with `newItem()`, set what you need and finish with `build()`:

```java
ItemStack sword = Helpers.itemHelper.newItem()
        .material(Material.DIAMOND_SWORD)
        .name("<aqua><bold>Frostbite")
        .lore(List.of("<gray>Forged in eternal ice.", "", "<blue>Legendary"))
        .enchant(Enchantment.SHARPNESS, 5)
        .enchant(Enchantment.UNBREAKING, 3)
        .setUnbreakable(true)
        .itemFlag(ItemFlag.HIDE_ATTRIBUTES)
        .build();

Helpers.playerItemHelper.giveItem(sword, 1, player);
```

### Builder Methods

- `material(Material)`: the item type. **Required**; `build()` throws an exception without it.
- `name(String)`: the display name. Italics are turned off for MiniMessage names.
- `amount(int)`: the stack size, at least `1` (default: `1`).
- `lore(List<String>)`: replaces all lore lines. `null` entries are skipped. Use `""` for an empty line.
- `addLoreLine(String)`: adds one lore line at the end.
- `enchant(Enchantment, int level)`: adds an enchantment.
- `enchants(ItemEnchantment...)`: adds several enchantments, created with `ItemEnchantment.of(enchantment, level)`.
- `itemFlag(ItemFlag)`: adds an item flag, for example `ItemFlag.HIDE_ENCHANTS`.
- `itemFlags(List<ItemFlag>)`: replaces all item flags.
- `setUnbreakable(boolean)`: makes the item unbreakable.
- `build()`: creates the `ItemStack`. You can call it several times to create several identical items.

Enchantments are added without restrictions: any level works (for example Sharpness 10), and they can be put on any item.

```java
ItemStack wand = Helpers.itemHelper.newItem()
        .material(Material.STICK)
        .name("<light_purple>Magic Wand")
        .enchants(
                ItemEnchantment.of(Enchantment.KNOCKBACK, 10),
                ItemEnchantment.of(Enchantment.FIRE_ASPECT, 2)
        )
        .itemFlag(ItemFlag.HIDE_ENCHANTS)
        .build();
```

## Items from Strings

When the item type comes from a config file or a command, use the methods that take the item name as a `String`. The `minecraft:` prefix is optional and case does not matter.

```java
ItemStack stone = Helpers.itemHelper.toItemStack("minecraft:stone");      // 1 stone
ItemStack apples = Helpers.itemHelper.toItemStack("golden_apple", 16);   // 16 golden apples
```

`createItem` additionally sets lore, item flags and optionally a name:

```java
ItemStack ticket = Helpers.itemHelper.createItem(
        "paper",
        "<gold>Event Ticket",
        List.of("<gray>Valid for one entry"),
        List.of(ItemFlag.HIDE_ATTRIBUTES)
);

// Without a name
ItemStack note = Helpers.itemHelper.createItem("paper", List.of("<gray>A mysterious note"), List.of());
```

All of these methods return `null` if the item name is not a valid material, so check the result when the name comes from user input.
