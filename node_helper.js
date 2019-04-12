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
		console.log('Starting node_helper for: ' + this.name);
	},

	// Scrapes HTML to find a row with team data.
	// Row starts with [startSearchString] and ends with '</span>'.
	// @param htmlObj - Contains the html to scrape. Wrapped in an object to enable pass by reference.
	//                  When function returns, htmlObj.content will be changed to not be stripped of the scraped row.
	// @param startSearchString - String that starts the row to search for.
	// @return A string of team data separated with spaces.
	scrapeTeamRow: function(htmlObj, startSearchString) {
		var posStart = htmlObj.content.indexOf(startSearchString);
		if (-1 === posStart)
			return null;

		htmlObj.content = htmlObj.content.substring(posStart + startSearchString.length);
		var posEnd = htmlObj.content.indexOf('</span>');
		if (-1 === posEnd)
			return null;

		var teamData = htmlObj.content.substring(0, posEnd);
		return teamData;
	},

	// Scrapes html to find an array of rows with team data.
	// @param html - The HTML to scrape.
	// @return An array of team data. Each item is a string of team data separated with spaces.
	scrapeTeamRows: function(html) {
		var htmlObj = {content: html};  // Create object to pass by reference.
		var teams = [];

		// Scrape first row.
		var team = this.scrapeTeamRow(htmlObj, '<span class="G">');
		if (null != teams) teams.push(team);

		// Scrape next 13 rows.
		for (var i = 0; i < 13; ++i)
		{
			team = this.scrapeTeamRow(htmlObj, '<span class="W">');
			if (null == teams)
				break;

			teams.push(team);
		}

		// Scrape last 2 rows.
		for (var i = 0; i < 2; ++i)
		{
			team = this.scrapeTeamRow(htmlObj, '<span class="C">');
			if (null == teams)
				break;

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
