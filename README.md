# MMM-AllsvenskanStandings
A [MagicMirror²](https://github.com/MichMich/MagicMirror) module that shows the current standings of [Allsvenskan](https://www.allsvenskan.se) (the top Swedish football league).

![screenshot](https://user-images.githubusercontent.com/25268023/56037480-aaafba00-5d2f-11e9-9de5-576fcfc90877.png)

# Installation
1. Clone repo:
```
	cd MagicMirror/modules/
	git clone https://github.com/retroflex/MMM-AllsvenskanStandings
```
2. Install dependencies:
```
	cd MMM-AllsvenskanStandings/
	npm install
```
3. Add the module to the ../MagicMirror/config/config.js, example:
```
		{
			module: 'MMM-AllsvenskanStandings',
			header: 'Allsvenskan',
			position: 'bottom_right',
			config: {
				showPosition: false
			}
		},
```
# Configuration
| Option                   | Description
| -------------------------| -----------
| `showPosition`           | Whether to show column with position before the team name.<br />**Default value:** true
| `showMatchesPlayed`      | Whether to show column with number of matches played.<br />**Default value:** true
| `showWins`               | Whether to show column with number of matches won.<br />**Default value:** true
| `showDraws`              | Whether to show column with number of matches drawn.<br />**Default value:** true
| `showLosses`             | Whether to show column with number of matches lost.<br />**Default value:** true
| `showGoalsFor`           | Whether to show column with number of goals made.<br />**Default value:** false
| `showGoalsAgainst`       | Whether to show column with number of goals let in.<br />**Default value:** false
| `showGoalDifference`     | Whether to show column with goal difference (i.e. goals made minus goals let in). Is always prefixed by + or -.<br />**Default value:** false
| `showGoalsForAndAgainst` | Whether to show column with number of goals made and let in. See the +/- column in the above screenshot.<br />**Default value:** true
| `showPoints`             | Whether to show column with points.<br />**Default value:** true

# Todo
* Allow for columns to be reorganized via config.
* Alternative row coloring to be able to read rows easier.
