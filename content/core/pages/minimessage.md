{{
    id: "minimessage"
    title: "MiniMessage Utilities",
    prev: "messages",
    next: "sound"
}}

# MiniMessage Utilities

`Helpers.miniMessageHelper` turns a formatted `String` into an Adventure `Component`, the text type Paper uses for chat messages, item names, titles and more. All other helpers that take text use it internally.

## Parsing Text

```java
Component a = Helpers.miniMessageHelper.parse("<red>Hello <bold>World!");
Component b = Helpers.miniMessageHelper.parse("&cHello &lWorld!");

player.sendMessage(a);
```

`parse` supports two formats:

- **[MiniMessage](https://docs.advntr.dev/minimessage/format.html)** tags such as `<red>`, `<bold>`, `<#ff8800>`, `<gradient:red:blue>` or `<rainbow>`.
- **Legacy color codes** with `&`, such as `&c` (red), `&l` (bold) and `&r` (reset).

## Choosing the Format

`parse` uses one of the two formats per string, never both:

- A string that contains `<` and `>` is parsed as MiniMessage. `&` codes in it are shown as plain text.
- Any other string is parsed with legacy `&` codes.

```java
Helpers.miniMessageHelper.parse("<red>Hello &aWorld"); // red "Hello &aWorld"; the &a is not a color
Helpers.miniMessageHelper.parse("<red>Hello <green>World"); // use MiniMessage tags throughout instead
```

Prefer MiniMessage. It supports hex colors, gradients, hover and click events, and it is the only format that turns off italics: text parsed as MiniMessage is never italic unless you add `<italic>`, while item names and lore written with `&` codes show up in italics.

## Converting Back to Text

`serialize` turns a `Component` into a MiniMessage string, for example to store it:

```java
String text = Helpers.miniMessageHelper.serialize(player.displayName());
```

## Player Input

Be careful when you put text written by players into a MiniMessage string. A player who writes `<click:run_command:/op me>` into a sign or chat message could otherwise create clickable text. Escape player input with Adventure's `MiniMessage.miniMessage().escapeTags(input)` before combining it with your own tags.
