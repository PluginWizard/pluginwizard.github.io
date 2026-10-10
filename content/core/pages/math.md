{{
    id: "math"
    title: "Math Utilities",
    prev: "player-inventory",
    next: "database"
}}

# Math Utilities

`Helpers.mathHelper` contains small helpers for random numbers, prime numbers and statistics over lists of numbers.

## Random Numbers

```java
int roll = Helpers.mathHelper.randomRange(1, 6); // 1, 2, 3, 4, 5 or 6
```

`randomRange(from, to)` returns a random whole number between `from` and `to`, **both included**.

`listRandomItem(list)` returns a random element of a list, or `null` if the list is empty. The result has the type `Object`, so cast it to the type of the list:

```java
List<String> rewards = List.of("diamond", "emerald", "gold_ingot");
String reward = (String) Helpers.mathHelper.listRandomItem(rewards);
```

## Prime Numbers

```java
Helpers.mathHelper.isPrime(7);  // true
Helpers.mathHelper.isPrime(12); // false
```

Numbers below `2` are never prime.

## List Statistics

These methods take a `List<Float>` and return a `double`:

- `listSum(list)`: the sum of all values.
- `listMin(list)`: the smallest value.
- `listMax(list)`: the largest value.
- `listAverage(list)`: the average (mean).
- `listMedian(list)`: the middle value after sorting. For an even number of values, the average of the two middle values.
- `listStandardDeviation(list)`: the population standard deviation.
- `listModes(list)`: the value that appears most often. If several values appear equally often, the first of them is returned.

All of them return `0` for an empty list.

```java
List<Float> times = List.of(12.4f, 9.8f, 15.1f, 9.8f);

double best = Helpers.mathHelper.listMin(times);         // 9.8
double average = Helpers.mathHelper.listAverage(times);  // 11.775
double median = Helpers.mathHelper.listMedian(times);    // 11.1
double mostCommon = Helpers.mathHelper.listModes(times); // 9.8
```

The values are `float`s, so results can have small rounding differences (for example `9.800000190734863` instead of `9.8`). Round them before showing them to players, for example with `String.format("%.2f", value)`.
