class Player {
    constructor(first, last, season) {
        this.first = first;
        this.last = last;
        this.season = season;
        this.options = {
            mode: 'cors',
        };
    }

    async fullName() {
        const response = await fetch(
            `https://www.balldontlie.io/api/v1/players?search=${this.first}%20${this.last}`,
            this.options
        );
        const data = await response.json();
        const dataObj = data.data[0];
        const name = `${dataObj.first_name} ${dataObj.last_name}`;

        return name;
    }

    async getPlayerID() {
        const parsePlayerID = (obj) => {
            const data = obj.data;

            return data[0].id;
        };

        try {
            const response = await fetch(
                `https://www.balldontlie.io/api/v1/players?search=${this.first}%20${this.last}`,
                this.options
            );
            const data = await response.json();

            return parsePlayerID(data);
        } catch (error) {
            console.log(error);
        }
    }

    isPlayer(player) {
        return (
            player.firstName.toLowerCase() === this.first.toLowerCase() &&
            player.lastName.toLowerCase() === this.last.toLowerCase()
        );
    }

    async getImgId() {
        const response = await fetch(
            `https://data.nba.net/data/10s/prod/v1/${this.season}/players.json`,
            this.options
        );
        const data = await response.json();
        const players = data.league.standard;
        const id = players.filter(this.isPlayer.bind(this))[0].personId;

        return id;
    }

    async getPlayerPic() {
        const id = await this.getImgId();
        const pic = await fetch(
            `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${id}.png`,
            this.options
        );

        return pic.url;
    }

    async getSeasonAvg() {
        try {
            const id = await this.getPlayerID();
            const response = await fetch(
                `https://www.balldontlie.io/api/v1/season_averages?season=${this.season}&player_ids[]=${id}`,
                this.options
            );
            const data = await response.json();
            const dataObj = data.data[0];
            const majorData = (({
                pts,
                reb,
                ast,
                fg_pct,
                fg3_pct,
                ft_pct,
            }) => ({ pts, reb, ast, fg_pct, fg3_pct, ft_pct }))(dataObj);

            return majorData;
        } catch (error) {
            console.log(error);
        }
    }
}

const AppController = (() => {
    let player1;
    let player2;

    function createPlayerObj(name, season) {
        const nameObj = getPlayerName(name);

        return new Player(nameObj.first, nameObj.last, season);
    }

    function getPlayerName(fullName) {
        const [first, last] = fullName.split(' ');

        return { first, last };
    }

    function runApp() {
        DomInterface.loadDom();
    }

    return { player1, player2, createPlayerObj, runApp };
})();

const DomInterface = (() => {
    // Top-level content container
    const contentContainer = document.querySelector('.content-container');

    // General fade in animation for elements
    function fadeIn(el) {
        el.style.opacity = 0;
        (function fade() {
            let val = parseFloat(el.style.opacity);
            if (!((val += 0.1) > 1)) {
                el.style.opacity = val;
                requestAnimationFrame(fade);
            }
        })();
    }

    // General fade out animation for elements
    function fadeOut(el) {
        el.style.opacity = 1;
        (function fade() {
            if ((el.style.opacity -= 0.1) < 0) {
                el.style.display = 'none';
            } else {
                requestAnimationFrame(fade);
            }
        })();
    }

    const loadDom = () => {
        const compareStats = document.querySelector('#compare-stats');
        compareStats.addEventListener('click', async function () {
            await compareBtnEL();
        });
    };

    function compareBtnEL() {
        clearContent();
        setTimeout(async function () {
            createCardContainer();
            updatePlayers();
            await populateCardContainer([
                AppController.player1,
                AppController.player2,
            ]);
        }, 500);
    }

    function updatePlayers() {
        const player1 = document.querySelector('#player-name-1');
        const player2 = document.querySelector('#player-name-2');
        const season1 = document.querySelector('#season-1');
        const season2 = document.querySelector('#season-2');

        AppController.player1 = AppController.createPlayerObj(
            player1.value,
            season1.value
        );
        AppController.player2 = AppController.createPlayerObj(
            player2.value,
            season2.value
        );
    }

    function createCardContainer() {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');
        contentContainer.appendChild(cardContainer);
    }

    function populateCardContainer(playerList) {
        const cardContainer = document.querySelector('.card-container');
        playerList.forEach(async function (player) {
            const card = await createPlayerCard(player);
            cardContainer.appendChild(card);
        });
        setTimeout(() => {
            fadeIn(cardContainer);
        }, 1000);
    }

    async function createPlayerCard(player) {
        const outerDiv = document.createElement('div');
        const innerDiv = document.createElement('div');
        const name = document.createElement('h3');
        const img = new Image();

        img.src = await player.getPlayerPic();
        name.textContent = await player.fullName();
        const stats = await player.getSeasonAvg();
        innerDiv.append(
            img,
            name,
            createStatItem('PPG', stats.pts),
            createStatItem('REB', stats.reb),
            createStatItem('APG', stats.ast),
            createStatItem('FG%', stats.fg_pct),
            createStatItem('3PT%', stats.fg3_pct),
            createStatItem('FT%', stats.ft_pct)
        );
        innerDiv.classList.add('stat-card');
        outerDiv.appendChild(innerDiv);
        outerDiv.classList.add('stat-card-border');

        return outerDiv;
    }

    function createStatItem(statName, statVal) {
        const div = document.createElement('div');
        const key = document.createElement('p');
        const val = document.createElement('p');

        div.append(key, val);
        div.classList.add('stat-item');
        key.textContent = statName;
        key.style.fontWeight = 'bold';
        val.textContent = statVal;

        return div;
    }

    function clearContent() {
        const content = document.querySelector('.content');
        fadeOut(content);
    }

    return { loadDom };
})();

AppController.runApp();
