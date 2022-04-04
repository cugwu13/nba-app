# nba-app

## Intoduction

Welcome to NBA Duel! This web app allows users to enter the names and seasons of two NBA players whose stats they'd like to compare. The current stats that are displayed in this app include the following:

```
PPG (points per game)
REB (rebounds per game)
APG (assits per game)
FG% (field goal percentage)
3PT% (three point percentage)
FT% (free throw percentage)
```

#

## Usage

### Player Forms

On page load, users will be presented with 2 forms containing a text input field for **Player Name** and a select dropdown for **Season**. Users have the option to select an NBA season starting from 1979 until the current NBA season. The default season value is the current NBA season.

### Compare Stats Button

Once both forms have been correctly filled out, users will be able to retrieve the players' stats by clicking the **Compare Stats** button. If one or more of the **Player Name** input fields are empty, the user will recieve an error message upon clicking the the **Compare Stats** button; additiionally, the stats will not be retrieved.

### Player Stats Cards

After the stats are retrieved, they will be displayed in cards along with the **Player Name**, player headshot and NBA season.

#

## Error Handling

### Missing Player Headshot

If, for some reason, a player's headshot was unable to be retrieved, then the image of a basketball will be displayed in its place.

### Missing Player Stats

If, for some reason, a player's stats were unable to be retrieved, then an error message will be displayed in place of the stats.
