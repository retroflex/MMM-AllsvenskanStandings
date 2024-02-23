/* MagicMirror²
 * Module: MMM-AllsvenskanStandings
 *
 * By Johan Persson, https://github.com/retroflex
 * MIT Licensed.
 */

Module.register('MMM-AllsvenskanStandings', {
	// Default configuration.
	defaults: {
		showPosition: true,
		showMatchesPlayed: true,
		showWins: true,
		showDraws: true,
		showLosses: true,
		showGoalsFor: false,
		showGoalsAgainst: false,
		showGoalDifference: false,
		showGoalsForAndAgainst: true,
		showPoints: true
	},

	getStyles: function() {
		return [ 'modules/MMM-AllsvenskanStandings/css/MMM-AllsvenskanStandings.css' ];
	},

	getTranslations: function () {
		return {
			en: "translations/en.json",
			sv: "translations/sv.json"
		}
	},

	// Notification from node_helper.js.
	// The standings are received here. Then module is redrawn.
	// @param notification - Notification type.
	// @param payload - Contains an array of teams. Each team contains position, name, points etc...
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'STANDINGS_RESULT') {
			this.teams = payload;
			this.updateDom(0);
		}
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement('table');

		if (this.teams.length === 0) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = 'dimmed xsmall';
			return wrapper;
		}

		wrapper.className = 'bright xsmall';

		var headerRow = document.createElement('tr');
		headerRow.className = 'normal headerrow';
		this.createTableCell(headerRow, this.translate('POSITION'), this.config.showPosition);
		this.createTableCell(headerRow, this.translate('TEAM_NAME'), true, true);  // team name
		this.createTableCell(headerRow, this.translate('MATCHES_PLAYED'), this.config.showMatchesPlayed);
		this.createTableCell(headerRow, this.translate('WINS'), this.config.showWins);
		this.createTableCell(headerRow, this.translate('DRAWS'), this.config.showDraws);
		this.createTableCell(headerRow, this.translate('LOSSES'), this.config.showLosses);
		this.createTableCell(headerRow, this.translate('GOALS_FOR'), this.config.showGoalsFor);
		this.createTableCell(headerRow, this.translate('GOALS_AGAINST'), this.config.showGoalsAgainst);
		this.createTableCell(headerRow, this.translate('GOAL_DIFFERENCE'), this.config.showGoalDifference);
		this.createTableCell(headerRow, this.translate('GOALS_FOR_AND_AGAINST'), this.config.showGoalsForAndAgainst);
		this.createTableCell(headerRow, this.translate('POINTS'), this.config.showPoints);  // points
		wrapper.appendChild(headerRow);

		for (var i = 0; i < this.teams.length; ++i)
		{
			var evenRow = (i % 2 == 0);

			var row = document.createElement('tr');
			row.className = evenRow ? 'evenrow' : 'oddrow';

			var team = this.teams[i];
			this.createTableCell(row, team.position, this.config.showPosition);
			this.createTableCell(row, team.name, true, true);
			this.createTableCell(row, team.played, this.config.showMatchesPlayed);
			this.createTableCell(row, team.won, this.config.showWins);
			this.createTableCell(row, team.drawn, this.config.showDraws);
			this.createTableCell(row, team.lost, this.config.showLosses);
			this.createTableCell(row, team.goalsFor, this.config.showGoalsFor);
			this.createTableCell(row, team.goalsAgainst, this.config.showGoalsAgainst);
			this.createTableCell(row, team.goalDifference, this.config.showGoalDifference);
			this.createTableCell(row, team.goalsFor + '-' + team.goalsAgainst, this.config.showGoalsForAndAgainst);
			this.createTableCell(row, team.points, this.config.showPoints);

			wrapper.appendChild(row);
		}

		return wrapper;
	},

	// Override start to init stuff.
	start: function() {
		this.teams = [];

		// Tell node_helper to load standings at startup.
		this.sendSocketNotification('GET_STANDINGS', { });

		// Make sure standings are reloaded every 10 minutes.
		var self = this;
		setInterval(function() {
			self.sendSocketNotification('GET_STANDINGS', { });
		}, 10 * 60 * 1000); // In millisecs. Refresh every 10 minutes.
	},

	// Creates a table row cell.
	// @param row - The table row to add cell to.
	// @param string - The text to show.
	// @param show - Whether to actually show.
	// @param leftAlign - True to left align text. False to center align.
	createTableCell: function(row, string, show, leftAlign = false)
	{
		if (!show)
			return;
		
		var cell = document.createElement('td');
		cell.innerHTML = string;
		
		if (leftAlign)
			cell.style.cssText = 'text-align: left;';
		else
			cell.style.cssText = 'text-align: center;';

		row.appendChild(cell);
	}
});
