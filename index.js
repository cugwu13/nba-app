async function getPlayerID(first, last) {
    try {
        const options = {
            mode: 'cors',
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'nba-stats4.p.rapidapi.com',
                'X-RapidAPI-Key': '2d72ce2d88mshb9317c7d2ad860fp1af8a0jsn8c4114e65a8d'
            }
        };

        const response = await fetch(`https://nba-stats4.p.rapidapi.com/players/?first_name=${first}&last_name=${last}`, options)
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

async function testStats() {
    try {
        const options = {
            mode: 'cors',
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'nba-stats4.p.rapidapi.com',
                'X-RapidAPI-Key': '2d72ce2d88mshb9317c7d2ad860fp1af8a0jsn8c4114e65a8d'
            }
        };
    
        const response = await fetch('https://nba-stats4.p.rapidapi.com/per_game_career_regular_season/2544', options)
        const data = await response.json()
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

getPlayerID('LeBron', 'James');
testStats();