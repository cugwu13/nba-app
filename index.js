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
        try {
            const response = await fetch(
                `https://www.balldontlie.io/api/v1/players?search=${this.first}%20${this.last}`,
                this.options
            );
            const data = await response.json();
            const dataObj = data.data[0];
            const name = dataObj
                ? `${dataObj.first_name} ${dataObj.last_name}`
                : `${this.first || ''} ${this.last || ''}`;

            return name;
        } catch (error) {
            console.log(error);
        }
    }

    async getPlayerID() {
        try {
            const parsePlayerID = (obj) => {
                const data = obj.data;

                return data[0].id;
            };
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
        try {
            const year = Math.max(2012, this.season);
            const response = await fetch(
                `https://data.nba.net/data/10s/prod/v1/${year}/players.json`,
                this.options
            );
            const data = await response.json();
            const players = data.league.standard;
            const id = players.filter(this.isPlayer.bind(this))[0].personId;

            return id;
        } catch (error) {
            console.log(error);
        }
    }

    async getPlayerPic() {
        try {
            const id = await this.getImgId();
            // Check if id is valid or undefined
            if (id) {
                const pic = await fetch(
                    `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${id}.png`,
                    this.options
                );

                return pic.statusText === 'Forbidden' ? '' : pic.url;
            } else return '';
        } catch (error) {
            console.log(error);
        }
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
        DomInterface.disableForm();
        DomInterface.loadDom();
        DomInterface.populateSeasonSelect();
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

    const disableForm = () => {
        const forms = document.querySelectorAll('form');
        forms.forEach((form) => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        });
    };

    const loadDom = () => {
        const compareStats = document.querySelector('#compare-stats');
        compareStats.addEventListener('click', async function () {
            await compareBtnEL();
        });
    };

    const populateSeasonSelect = () => {
        const seasons = document.querySelectorAll(
            'form > div:nth-child(2) > select'
        );
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        seasons.forEach((season) => {
            for (let i = currentYear - 1; i >= 1979; i -= 1) {
                const option = document.createElement('option');
                option.setAttribute('value', i);
                option.textContent = i;
                season.appendChild(option);
            }
        });
    };

    // Check if both forms are valid
    function isFormValid() {
        const playerName1 = document.getElementById('player-name-1');
        const playerName2 = document.getElementById('player-name-2');

        if (!playerValidity(playerName1)) return false;
        if (!playerValidity(playerName2)) return false;

        function playerValidity(el) {
            if (el.validity.valueMissing) {
                el.setCustomValidity(
                    'Please enter a player name (e.g. "LeBron James")'
                );
                el.reportValidity();
                el.classList.add('invalid-input');
                inputEL(el);
                return false;
            } else {
                el.setCustomValidity('');
                el.classList.remove('invalid-input');
                return true;
            }
        }

        function inputEL(el) {
            el.addEventListener('input', () => {
                if (!el.validity.valueMissing) {
                    el.setCustomValidity('');
                    el.classList.remove('invalid-input');
                }
            });
        }

        return true;
    }

    function compareBtnEL() {
        // function to check if form requirements are satisfied
        if (isFormValid()) {
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

    async function populateCardContainer(playerList) {
        const cardContainer = document.querySelector('.card-container');
        await Promise.all(
            playerList.map(async (player) => {
                const card = await createPlayerCard(player);
                cardContainer.appendChild(card);
            })
        );
        fadeIn(cardContainer);
    }

    async function createPlayerCard(player) {
        const outerDiv = document.createElement('div');
        const innerDiv = document.createElement('div');
        const name = document.createElement('h3');
        const img = new Image();
        const imageUrl = await player.getPlayerPic();

        // If imageUrl is undefined, set image to be a generic basketball picture
        img.src = imageUrl
            ? imageUrl
            : 'https://us.123rf.com/450wm/yupiramos/yupiramos1901/yupiramos190101335/126464187-basketball-ball-sport-on-white-background-vector-illustration.jpg?ver=6';
        name.textContent = await player.fullName();
        const stats = await player.getSeasonAvg();
        isStatsValid(player, stats, innerDiv, img, name);
        innerDiv.classList.add('stat-card');
        outerDiv.appendChild(innerDiv);
        outerDiv.classList.add('stat-card-border');

        return outerDiv;
    }

    function createStatItem(statName, statVal, sigFigs) {
        const div = document.createElement('div');
        const key = document.createElement('p');
        const val = document.createElement('p');

        div.append(key, val);
        div.classList.add('stat-item');
        key.textContent = statName;
        key.style.fontWeight = 'bold';
        val.textContent = statVal.toFixed(sigFigs);

        return div;
    }

    function isStatsValid(player, statObj, parent, img, name) {
        const season = document.createElement('h5');
        season.textContent = player.season
            ? `${player.season} - ${parseInt(player.season) + 1}`
            : '';
        if (statObj) {
            parent.append(
                img,
                name,
                season,
                createStatItem('PPG', statObj.pts, 1),
                createStatItem('REB', statObj.reb, 1),
                createStatItem('APG', statObj.ast, 1),
                createStatItem('FG%', statObj.fg_pct, 2),
                createStatItem('3PT%', statObj.fg3_pct, 2),
                createStatItem('FT%', statObj.ft_pct, 2)
            );
        } else {
            const errorMsg = document.createElement('h4');
            errorMsg.textContent =
                'Sorry, the player and/or season stats that you searched for returned no results. Please make sure to search for a valid NBA Player and season.';
            parent.append(img, name, season, errorMsg);
        }
    }

    function clearContent() {
        const content = document.querySelector('.content');
        fadeOut(content);
    }

    return { disableForm, loadDom, populateSeasonSelect };
})();

AppController.runApp();
