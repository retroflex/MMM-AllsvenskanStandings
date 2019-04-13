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

	// Scrapes HTML to find a row with team data.
	// Row starts with '<span class="*">' and ends with '</span>' (where * can be G/W/C/Y.
	// @param htmlObj - Contains the html to scrape. Wrapped in an object to enable pass by reference.
	//                  When function returns, htmlObj.content will be changed to not be stripped of the scraped row.
	// @return A string of team data separated with spaces.
	scrapeTeamRow: function(htmlObj) {
		var positions = [];
		// Search for start strings.
		positions.push(htmlObj.content.indexOf('<span class="G">'));
		positions.push(htmlObj.content.indexOf('<span class="W">'));
		positions.push(htmlObj.content.indexOf('<span class="C">'));
		positions.push(htmlObj.content.indexOf('<span class="Y">'));

		// Find first start string position.
		var posStart = htmlObj.content.length;  // Max value.
		var found = false;
		for (var i = 0; i < positions.length; ++i)
		{
			if (positions[i] >= 0)
			{
				posStart = Math.min(posStart, positions[i]);
				found = true;
			}
		}

		if (false === found)
			return null;

		htmlObj.content = htmlObj.content.substring(posStart + '<span class="*">'.length);
		var posEnd = htmlObj.content.indexOf('</span>');
		if (-1 === posEnd)
			return null;

		var teamData = htmlObj.content.substring(0, posEnd);
		if (0 === teamData.trim().length)  // Found a blank.
			return null;

		return teamData;
	},

	// Scrapes html to find an array of rows with team data.
	// @param html - The HTML to scrape.
	// @return An array of team data. Each item is a string of team data separated with spaces.
	scrapeTeamRows: function(html) {
		var htmlObj = {content: html};  // Create object to pass by reference.
		var teams = [];

		// There are 16 team rows, but the first one is blank. Search for 20 rows so we have some leeway.
		for (var i = 0; i < 20; ++i)
		{
			team = this.scrapeTeamRow(htmlObj);
			console.error("APA team row = " + team);
			if (null != team)
				teams.push(team);
		}

		return teams;
	},

	// Corrects team name for some specific cases where names have been clipped.
	// @param name - The (possibly clipped) team name.
	// @return The corrected team name.
	fixTeamName: function(name) {
		if (name.endsWith('Norrköpin'))
			name += 'g';
		else if (name.endsWith('Eskilstun'))
			name += 'a';

		return name;
	},

	// Extracts the data from a team row string.
	// @param teamRow - A string of team data separated with spaces.
	//                  Example of a team row string: ' 6 AFC Eskilstun  2  1  0  1   5-4    3'
	// @return An array of team data.
	extractTeamData: function(teamRow) {
		var position       = teamRow.substring(0, 2).trim();
		var name           = teamRow.substring(3, 16).trim();
		var played         = teamRow.substring(17, 19).trim();
		var won            = teamRow.substring(20, 22).trim();
		var drawn          = teamRow.substring(23, 25).trim();
		var lost           = teamRow.substring(26, 28).trim();
		var goalsFor       = teamRow.substring(29, 32).trim();
		var goalsAgainst   = teamRow.substring(33, 36).trim();
		var points         = teamRow.substring(37, 39).trim();

		var goalDifference = '';
		if (!isNaN(goalsFor) && !isNaN(goalsAgainst))
		{
			goalDifference = goalsFor - goalsAgainst;
			if (goalDifference > 0)
				goalDifference = '+' + goalDifference;
		}

		name = this.fixTeamName(name);

		var teamData = {position: position,
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
		var teamRows = this.scrapeTeamRows(html);

		var teams = [];
		for (var i = 0; i < teamRows.length; ++i)
		{
			var teamData = this.extractTeamData(teamRows[i]);
			teams.push(teamData);
		}

		return teams;
	},

	// Gets Allsvenskan table from Swedish TextTV API and scrapes it into an array of team data.
	// The array is then sent to the client (to MMM-AllsvenskanStandings.js).
	getStandings: function() {
		request({
			url: 'http://api.texttv.nu/api/get/343?app=magicmirror',
			method: 'GET'
		}, (error, response, body) => {
			if (!error && response.statusCode == 200) {
				var html = JSON.parse(body)[0].content[0];
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
