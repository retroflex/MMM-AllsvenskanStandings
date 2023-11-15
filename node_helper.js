/* Magic Mirror
 * Module: MMM-AllsvenskanStandings
 *
 * By Johan Persson, https://github.com/retroflex
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({
	start: function() {
		//console.log('Starting node_helper for: ' + this.name);
	},

	// Extracts the data from a team row string.
	// @param teamRow - A string of team data separated with spaces.
	//                  Example of a team row string: '  1 AIK           30 10 10 10 100-100 99'
	// @return An array of team data.
	extractTeamData: function(teamRow) {
		var position       = teamRow.substring(0, 4).trim();
		var name           = teamRow.substring(4, 18).trim();
		var played         = teamRow.substring(18, 21).trim();
		var won            = teamRow.substring(21, 24).trim();
		var drawn          = teamRow.substring(24, 27).trim();
		var lost           = teamRow.substring(27, 30).trim();
		var goalsFor       = teamRow.substring(30, 33).trim();
		var goalsAgainst   = teamRow.substring(34, 38).trim();
		var points         = teamRow.substring(38, 41).trim();

		var goalDifference = '';
		if (!isNaN(goalsFor) && !isNaN(goalsAgainst)) {
			goalDifference = goalsFor - goalsAgainst;
			if (goalDifference > 0)
				goalDifference = '+' + goalDifference;
		}

		var teamData =	{position: position,
						name: name,
						played: played,
						won: won,
						drawn: drawn,
						lost: lost,
						goalsFor: goalsFor,
						goalsAgainst: goalsAgainst,
						goalDifference: goalDifference,
						points: points};
		return teamData;
	},

	// Scrapes HTML into team data for all teams in the Allsvenskan table.
	// @param html - The HTML to scrape.
	// @return An array of team data.
	scrape: function(html) {
		var teamRows = [];
		for (var i = 3; i < 19; ++i) {
			var team = html.split('\n').slice(i,i+1).join('\n');
			teamRows.push(team);
		}

		var teams = [];
		for (var i = 0; i < teamRows.length; ++i) {
			var teamData = this.extractTeamData(teamRows[i]);
			teams.push(teamData);
		}

		return teams;
	},

	// Gets Allsvenskan table from Swedish TextTV API and scrapes it into an array of team data.
	// The array is then sent to the client (to MMM-AllsvenskanStandings.js).
	getStandings: function() {
		request({
			url: 'https://texttv.nu/api/get/343?includePlainTextContent=1',
			method: 'GET'
		}, (error, response, body) => {
			if (!error && response.statusCode == 200) {
				var html = JSON.parse(body)[0].content_plain[0];
				var teams = this.scrape(html);
				this.sendSocketNotification('STANDINGS_RESULT', teams);
			}
		});
	},

	// Listens to notifications from client (from MMM-AllsvenskanStandings.js).
	// Client sends a notification when it wants download new standings.
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'GET_STANDINGS') {
			this.getStandings();
		}
	}

});
