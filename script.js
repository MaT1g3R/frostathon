const TWITCH_IDS = {
    vmService: 59817220,
    OnePunMan_: 115770251,
    paparatto18: 64195856,
};

const CONTESTANTS = [
    "vmService",
    "OnePunMan_",
    "paparatto18",
];


let visibleContestants = new Set();

window.addEventListener('load', () => {
    setupSelector();
});

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

            const closeBtn = document.createElement("span");
            closeBtn.textContent = "✖";
            closeBtn.className = "close-btn";
            closeBtn.onclick = () => removeContestant(contestant);

            headerContainer.appendChild(header);
            headerContainer.appendChild(closeBtn);
            wrapper.appendChild(headerContainer);

            const deckList = document.createElement("div");
            deckList.className = `contestant-decklist ${contestant}`;
            wrapper.appendChild(deckList);

            rootElem.appendChild(wrapper);
        }

        const deckList = wrapper.querySelector(".contestant-decklist");
        deckList.innerHTML = ""; // Clear current deck

        for (let card of data.deck) {
            renderCard(card, deckList);
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
