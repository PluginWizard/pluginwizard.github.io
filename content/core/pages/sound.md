{{
    id: "sound"
    title: "Sound Utilities",
    prev: "minimessage",
    next: "teleport"
}}

# Sound Utilities

`Helpers.soundHelper` plays sounds to a single player or at a location.

## Playing a Sound to a Player

```java
Helpers.soundHelper.playSound(player, Sound.ENTITY_EXPERIENCE_ORB_PICKUP, 1f, 1f);
```

Only this player hears the sound, played at their current position.

## Playing a Sound at a Location

```java
Location bell = new Location(world, 0, 70, 0);
Helpers.soundHelper.playSound(bell, Sound.BLOCK_BELL_USE, 2f, 1f);
```

Every player near the location hears the sound.

## Volume and Pitch

- **Volume** controls how far the sound can be heard. At `1` it is audible up to about 16 blocks away. Higher values do not make it louder up close, but let it be heard from further away.
- **Pitch** changes how high the sound is, from `0.5` (low, slow) to `2` (high, fast). `1` is the normal pitch.

```java
// Three pitches played at the same time form a chord
Helpers.soundHelper.playSound(player, Sound.BLOCK_NOTE_BLOCK_PLING, 1f, 1f);
Helpers.soundHelper.playSound(player, Sound.BLOCK_NOTE_BLOCK_PLING, 1f, 1.26f);
Helpers.soundHelper.playSound(player, Sound.BLOCK_NOTE_BLOCK_PLING, 1f, 1.5f);
```

All available sounds are listed under `Sound` in the [Paper Javadoc](https://jd.papermc.io/paper/).

Nothing happens if the player, location or sound is `null`, or if the location has no world.
