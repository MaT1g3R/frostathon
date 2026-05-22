const TWITCH_IDS = {
    "admiralbahroo": "40972890",
    "aplatypuss": "39464264",
    "azzapp": "35866558",
    "bookshelf2029": "497527623",
    "boxbox": "38881685",
    "commentbagel": "110883776",
    "dreads": "38442474",
    "falco": "71427323",
    "hamjuicegaming": "634698559",
    "heybillierae": "521098582",
    "j4ckie": "92743646",
    "japaneseexport": "116377450",
    "jocat": "111203619",
    "kwehzy": "39416119",
    "ludwig": "40934651",
    "merl61": "68263888",
    "michaelalfox": "19336638",
    "multibradx": "1249420636",
    "nandre": "39842292",
    "onepunman_": "115770251",
    "paparatto18": "64195856",
    "quinnjamin_tv": "136807385",
    "rarran": "67379182",
    "roffle": "91200728",
    "skootish": "71058462",
    "squidinkidink": "473313737",
    "stanz": "36221636",
    "stellie": "413823427",
    "switchssb": "45745035",
    "thecrimsonblur": "12835111",
    "vmservice": "59817220",
    "wavy": "81578595"
}

const CONTESTANTS = Object.keys(TWITCH_IDS);

const BOSSES = {
    waterfall_giant_boss: 1,
    lagavulin_matriarch_boss: 1,
    ceremonial_beast_boss: 1,
    the_kin_boss: 1,
    soul_fysh_boss: 1,
    vantom_boss: 1,
    knowledge_demon_boss: 2,
    kaiser_crab_boss: 2,
    the_insatiable_boss: 2,
    test_subject_boss: 3,
    aeonglass_boss: 3,
    queen_boss: 3,
}


let visibleContestants = new Set();
let refreshInterval = null;

window.addEventListener('load', () => {
    setupSelector();
    setupAutoRefresh();
});

function setupAutoRefresh() {
    const checkbox = document.getElementById("auto-refresh-checkbox");

    const toggleRefresh = () => {
        if (checkbox.checked) {
            if (!refreshInterval) {
                refreshVisibleDecks();
                refreshInterval = setInterval(refreshVisibleDecks, 5000);
            }
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                refreshInterval = null;
            }
        }
    };

    checkbox.addEventListener('change', toggleRefresh);

    // Initial check on page load
    if (checkbox.checked) {
        toggleRefresh();
    }
}

function setupSelector() {
    const selector = document.getElementById("contestant-selector");
    CONTESTANTS.forEach(contestant => {
        const option = document.createElement("option");
        option.value = contestant;
        option.textContent = contestant;
        selector.appendChild(option);
    });

    selector.addEventListener('change', (e) => {
        const contestant = e.target.value;
        if (contestant && !visibleContestants.has(contestant)) {
            addContestant(contestant);
        }
        selector.value = ""; // Reset selector
    });
}

async function addContestant(contestant) {
    visibleContestants.add(contestant);
    await fetchGameData(contestant);
}

function removeContestant(contestant) {
    visibleContestants.delete(contestant);
    const wrapper = document.querySelector(`.decklist-wrapper.${contestant}`);
    if (wrapper) {
        wrapper.remove();
    }
}

async function refreshVisibleDecks() {
    for (let contestant of visibleContestants) {
        await fetchGameData(contestant);
    }
    console.log("Decks refreshed");
}

async function fetchGameData(contestant) {
    let rootElem = document.getElementById("deck-container");
    let id = TWITCH_IDS[contestant];
    const url = `https://slay-the-relics.baalorlord.tv/api/v2/game-state/${id}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Check if still visible (could have been closed while fetching)
        if (!visibleContestants.has(contestant)) return;

        let wrapper = document.querySelector(`.decklist-wrapper.${contestant}`);
        if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.className = `decklist-wrapper ${contestant}`;

            const headerContainer = document.createElement("div");
            headerContainer.className = "header-container";

            const header = document.createElement("div");
            header.textContent = contestant;
            header.className = "contestant-header";

            const actDisplay = document.createElement("div");
            actDisplay.className = "act-display";
            actDisplay.textContent = "Act: ?";

            const floorDisplay = document.createElement("div");
            floorDisplay.className = "floor-display";
            floorDisplay.textContent = "Floor: ?";

            const closeBtn = document.createElement("span");
            closeBtn.textContent = "✖";
            closeBtn.className = "close-btn";
            closeBtn.onclick = () => removeContestant(contestant);

            headerContainer.appendChild(header);
            headerContainer.appendChild(actDisplay);
            headerContainer.appendChild(floorDisplay);
            headerContainer.appendChild(closeBtn);
            wrapper.appendChild(headerContainer);

            const relicList = document.createElement("div");
            relicList.className = `contestant-reliclist ${contestant}`;
            wrapper.appendChild(relicList);

            const deckList = document.createElement("div");
            deckList.className = `contestant-decklist ${contestant}`;
            wrapper.appendChild(deckList);

            rootElem.appendChild(wrapper);
        }

        const actDisplay = wrapper.querySelector(".act-display");
        const act = BOSSES[data.boss] || "?";
        actDisplay.textContent = `Act: ${act}`;

        const floorDisplay = wrapper.querySelector(".floor-display");
        if (data.floor !== undefined) {
            floorDisplay.textContent = `Floor: ${data.floor}`;
            floorDisplay.style.display = "block";
        } else {
            floorDisplay.style.display = "none";
        }

        const deckList = wrapper.querySelector(".contestant-decklist");
        deckList.innerHTML = ""; // Clear current deck

        for (let card of data.deck) {
            renderCard(card, deckList);
        }

        const relicList = wrapper.querySelector(".contestant-reliclist");
        relicList.innerHTML = ""; // Clear current relics

        if (data.relics) {
            for (let relic of data.relics) {
                renderRelic(relic, relicList);
            }
        }

    } catch (error) {
        console.error(`Error fetching data for ${contestant}:`, error);
    }
}

function stripUpgradeInfo(str) {
    if (Array.isArray(str)) {
        return str[0].split('+')[0];
    }
    return str.split('+')[0];
}

const KEY_SEPARATOR = "\u001F";

function splitSeparator(str) {
    if (typeof str !== 'string') return str;
    return str.split(KEY_SEPARATOR)[0];
}

function getImageUrl(cardID) {
    let stripped = splitSeparator(cardID);
    stripped = stripUpgradeInfo(stripped)
    if (stripped === cardID) {
        return `https://raw.githubusercontent.com/Spireblight/slay-the-relics/refs/heads/master/assets/sts2/card-images/${stripped.toLowerCase().replaceAll(" ", "")}.png`
    } else {
        return `https://raw.githubusercontent.com/Spireblight/slay-the-relics/refs/heads/master/assets/sts2/card-images/${stripped.toLowerCase().replaceAll(" ", "")}plusone.png`
    }
}

function renderCard(cardID, parent) {
    const card = document.createElement("div");
    card.className = 'card-container';
    card.innerHTML = `<div class="card-image" style="background-image: url(&quot;${getImageUrl(cardID)}&quot;);"></div>`;
    parent.appendChild(card);
}

function renderRelic(relicName, parent) {
    const relic = document.createElement("div");
    relic.className = 'relic-container';
    const imageName = relicName.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");
    relic.innerHTML = `<img src="relics/${imageName}.png" class="relic-image" title="${relicName}" alt="${relicName}">`;
    parent.appendChild(relic);
}
