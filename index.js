class Player {
    constructor(first, last) {
        this.first = first;
        this.last = last;
        this.options = {
            mode: 'cors',
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'free-nba.p.rapidapi.com',
                'X-RapidAPI-Key':
                    '2d72ce2d88mshb9317c7d2ad860fp1af8a0jsn8c4114e65a8d',
            },
        };
    }

    get playerName() {
        return `${this.first} ${this.last}`;
    }

    async getPlayerID() {
        const parsePlayerID = (obj) => {
            const data = obj.data;

            return data[0].id;
        };

        try {
            const response = await fetch(
                `https://free-nba.p.rapidapi.com/players?page=0&per_page=25&search=${this.first}%20${this.last}`,
                this.options
            );
            const data = await response.json();

            return parsePlayerID(data);
        } catch (error) {
            console.log(error);
        }
    }

    async getPlayerStats() {
        try {
            const id = await this.getPlayerID();
            const response = await fetch(
                `https://free-nba.p.rapidapi.com/stats?page=0&per_page=100&player_ids[]=${id}`,
                this.options
            );
            const data = await response.json();

            return data;
        } catch (error) {
            console.log(error);
        }
    }
}

class PlayerStats extends Player {
    season;

    constructor(first, last, season) {
        super(first, last);
        this.season = season;
    }

    async getPlayerStats() {
        try {
            const id = await this.getPlayerID();
            const response = await fetch(
                `https://free-nba.p.rapidapi.com/stats?page=0&per_page=100&seasons[]=${this.season}&player_ids[]=${id}`,
                this.options
            );
            const data = await response.json();

            return data;
        } catch (error) {
            console.log(error);
        }
    }

    async getSeasonAvg() {
        try {
            const games = await this.getPlayerStats();
            const gamesArr = games.data.filter((game) => game.min !== '');
            const numOfGames = gamesArr.length;

            const avgPts = gamesArr.reduce((a, b) => a + b.pts, 0) / numOfGames;

            console.log(gamesArr);
            console.log(numOfGames);
            console.log(avgPts);
        } catch (error) {
            console.log(error);
        }
    }
}

const x = new PlayerStats('trae', 'young', '2021');
x.getSeasonAvg();

const AppController = (() => {
    function getPlayerStats(first, last, season) {
        const player = new PlayerStats(first, last, season);

        return player.getPlayerStats();
    }

    function runApp() {
        DomInterface.userStats();
    }

    return { getPlayerStats, runApp };
})();

const DomInterface = (() => {
    function userStats() {
        const btnEL = (btn) => {
            btn.addEventListener('click', (e) => {
                const parent = btn.parentElement;
                const nameInput = parent.firstElementChild.lastElementChild;
                const seasonInput =
                    parent.firstElementChild.nextElementSibling
                        .lastElementChild;
                displayStats(nameInput.value, seasonInput.value);
                e.preventDefault();
            });
        };

        const btns = document.querySelectorAll('button');
        btns.forEach((btn) => {
            btnEL(btn);
        });
    }

    function getPlayerName(fullName) {
        const [first, last] = fullName.split(' ');

        return { first, last };
    }

    async function displayStats(fullName, season) {
        const obj = getPlayerName(fullName);
        const div = document.createElement('div');
        const stats = await AppController.getPlayerStats(
            obj.first,
            obj.last,
            season
        );
        div.textContent = JSON.stringify(stats);
        document.body.appendChild(div);
    }

    return { userStats };
})();

AppController.runApp();
