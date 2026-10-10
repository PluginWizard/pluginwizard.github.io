{{
    id: "database"
    title: "SQLite Database",
    prev: "math",
    next: "null"
}}

# SQLite Database

PluginWizard-Core includes the SQLite driver and two small classes to work with an SQLite database: `PluginDatabase` opens the database file, and `Query` runs SQL statements on it. The database is a single file, so no database server is needed.

## Opening a Database

```java
private PluginDatabase database;

@Override
public void onEnable() {
    Helpers.initialize(this);

    getDataFolder().mkdirs(); // SQLite does not create missing folders
    try {
        database = new PluginDatabase(new File(getDataFolder(), "data.db").getPath());
    } catch (SQLException e) {
        getLogger().severe("Could not open the database: " + e.getMessage());
    }
}

@Override
public void onDisable() {
    try {
        if (database != null) database.close();
    } catch (SQLException e) {
        getLogger().warning("Could not close the database: " + e.getMessage());
    }
}
```

The path is the file to open. If the file doesn't exist yet, it is created. A relative path like `"data.db"` is relative to the server folder, so use your plugin's data folder as shown above.

## Running Queries

Create a `Query` with the connection of the database:

```java
Query query = new Query(database.getConnection());

// Create a table
query.execute("CREATE TABLE IF NOT EXISTS coins (uuid TEXT PRIMARY KEY, amount INTEGER NOT NULL)");

// Read a single value
Object result = query.getSingleValue("SELECT COUNT(*) FROM coins");
int players = ((Number) result).intValue();
```

- `execute(sql)`: runs a statement that returns no rows, such as `CREATE TABLE`, `INSERT`, `UPDATE` or `DELETE`.
- `getSingleValue(sql)`: runs a query and returns the first column of the first row, or `null` if there is no row. The type of the value depends on the column (`Integer`, `Long`, `Double`, `String`, ...).

Both methods throw an `SQLException` if the statement fails.

## Values from Players

`Query` only accepts finished SQL strings. **Never** put player names, chat messages or other user input directly into such a string: a player could change the meaning of the statement (SQL injection). Use a `PreparedStatement` from the connection instead:

```java
Connection connection = database.getConnection();

try (PreparedStatement statement = connection.prepareStatement(
        "INSERT INTO coins (uuid, amount) VALUES (?, ?) " +
        "ON CONFLICT(uuid) DO UPDATE SET amount = amount + excluded.amount")) {
    statement.setString(1, player.getUniqueId().toString());
    statement.setInt(2, 10);
    statement.executeUpdate();
}

try (PreparedStatement statement = connection.prepareStatement("SELECT amount FROM coins WHERE uuid = ?")) {
    statement.setString(1, player.getUniqueId().toString());
    try (ResultSet result = statement.executeQuery()) {
        int coins = result.next() ? result.getInt("amount") : 0;
    }
}
```

`getConnection()` returns a normal JDBC `Connection`, so you can use anything JDBC offers, including transactions.

## Performance

Database calls block the thread they run on. Running many or slow queries on the main server thread causes lag. Run them asynchronously, for example with `Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> ...)`, and switch back to the main thread with `runTask` before you use the result with the Bukkit API.
