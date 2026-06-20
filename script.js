const interestsButton = document.querySelector("#see-interests-button");
const interestsSection = document.querySelector("#interests");
const liveClock = document.querySelector("#live-clock");
const cardSearchButton = document.querySelector("#card-search-button");
const cardNameInput = document.querySelector("#card-name-input");
const cardResult = document.querySelector("#card-result");
const greatBallToggle = document.querySelector("#greatball-toggle");
const greatBallPanel = document.querySelector("#greatball-panel");
const greatBallMessages = document.querySelector("#greatball-messages");
const greatBallForm = document.querySelector("#greatball-form");
const greatBallInput = document.querySelector("#greatball-input");
let unclearMessageCount = 0;

if (interestsButton && interestsSection) {
    interestsButton.addEventListener("click", function () {
        interestsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

function updateClock() {
    if (!liveClock) {
        return;
    }

    const now = new Date();
    const timeParts = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).split(" ");

    const clockNumbers = timeParts[0] || "--:--:--";
    const clockSuffix = timeParts[1] || "";

    liveClock.innerHTML = `
        <span class="clock-numbers">${clockNumbers}</span>
        <span class="clock-suffix">${clockSuffix}</span>
    `;
}

updateClock();
setInterval(updateClock, 1000);

async function fetchCardPrices() {
    if (!cardNameInput || !cardResult) {
        return;
    }

    const cardName = cardNameInput.value.trim();

    if (!cardName) {
        cardResult.innerHTML = "<p>Please enter a card name.</p>";
        return;
    }

    cardResult.innerHTML = "<p>Loading card data...</p>";

    try {
        const response = await fetch(
            `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(cardName)}&pageSize=1`
        );

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            cardResult.innerHTML = "<p>No card found.</p>";
            return;
        }

        const card = data.data[0];
        const prices = card.tcgplayer?.prices;
        const cardPrice = prices?.normal || prices?.holofoil || prices?.reverseHolofoil || prices?.firstEditionHolofoil;

        cardResult.innerHTML = `
            <div class="card-price-result">
                <h3>${card.name}</h3>
                <img src="${card.images.small}" alt="${card.name}">
                <p><strong>Set:</strong> ${card.set.name}</p>
                <p><strong>Rarity:</strong> ${card.rarity || "Unknown"}</p>
                <p><strong>Market:</strong> ${cardPrice?.market ?? "Not available"}</p>
                <p><strong>Low:</strong> ${cardPrice?.low ?? "Not available"}</p>
                <p><strong>Mid:</strong> ${cardPrice?.mid ?? "Not available"}</p>
                <p><strong>High:</strong> ${cardPrice?.high ?? "Not available"}</p>
            </div>
        `;
    } catch (error) {
        cardResult.innerHTML = "<p>Something went wrong while fetching card data.</p>";
        console.error(error);
    }
}

if (cardSearchButton) {
    cardSearchButton.addEventListener("click", fetchCardPrices);
}

if (cardNameInput) {
    cardNameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            fetchCardPrices();
        }
    });
}

function appendChatMessage(role, message) {
    if (!greatBallMessages) {
        return;
    }

    const bubble = document.createElement("div");
    bubble.className = `chatbot-message ${role === "user" ? "chatbot-message-user" : "chatbot-message-bot"}`;
    bubble.textContent = message;
    greatBallMessages.appendChild(bubble);
    greatBallMessages.scrollTop = greatBallMessages.scrollHeight;
}

function getChatbotReply(message) {
    const normalized = message.toLowerCase();
    const travelLocations = [
        "Washington State",
        "Oregon State",
        "the Grand Canyon in Arizona",
        "Las Vegas",
        "Popotla and Las Playas de Tijuana",
        "Guadalajara",
        "Tequila",
        "Kyoto",
        "Tokyo"
    ];

    if (normalized.includes("travel") || normalized.includes("trip") || normalized.includes("tokyo") || normalized.includes("crater")) {
        const wantsMultiplePlaces =
            normalized.includes("where all") ||
            normalized.includes("where else") ||
            normalized.includes("places") ||
            normalized.includes("places have") ||
            normalized.includes("locations") ||
            normalized.includes("list") ||
            normalized.includes("all");

        if (wantsMultiplePlaces) {
            unclearMessageCount = 0;
            return "Bryce has traveled to " + travelLocations.join(", ").replace(", Tokyo", ", and Tokyo") + ". The Travel page has photo carousels and maps for some of those places too.";
        }

        unclearMessageCount = 0;
        return "One place Bryce has traveled to is Kyoto, Japan. If you want, ask for more places and I can list more of them.";
    }

    if (normalized.includes("pokemon") || normalized.includes("great ball") || normalized.includes("celebi")) {
        unclearMessageCount = 0;
        return "Bryce is a big Pokemon fan, and the site leans into that with the Pokeball clock, this Great Ball chat, and the Pokemon section on the homepage.";
    }

    if (normalized.includes("music") || normalized.includes("spotify") || normalized.includes("playlist")) {
        unclearMessageCount = 0;
        return "Bryce is into a mix of thoughtful and feel-good tracks. A few good picks are Lady Brown by Nujabes, Hey Mama by Kanye West, and Giving Up The Gun by Vampire Weekend. You can also check both Spotify playlists in the Music section on the homepage.";
    }

    if (normalized.includes("resume") || normalized.includes("job") || normalized.includes("experience")) {
        unclearMessageCount = 0;
        return "The Resume and More page has Bryce's resume PDF plus room to grow into experience, skills, and background details.";
    }

    if (normalized.includes("contact") || normalized.includes("email") || normalized.includes("linkedin") || normalized.includes("github")) {
        unclearMessageCount = 0;
        return "You can reach Bryce through the Contact section on the homepage. It includes email, GitHub, and LinkedIn links.";
    }

    if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("hey")) {
        unclearMessageCount = 0;
        return "Hey there! Ask me about Bryce's travel photos, Pokemon interests, music, resume, or contact links.";
    }

    unclearMessageCount += 1;

    if (unclearMessageCount === 2) {
        return "ok stupid";
    }

    if (unclearMessageCount >= 3) {
        return "I am so sorry for what I just said. It's not something I do often.";
    }

    return "What was that buddy";
}

if (greatBallToggle && greatBallPanel) {
    greatBallToggle.addEventListener("click", function () {
        const isOpen = !greatBallPanel.hidden;
        greatBallPanel.hidden = isOpen;
        greatBallToggle.setAttribute("aria-expanded", String(!isOpen));

        if (!isOpen && greatBallInput) {
            greatBallInput.focus();
        }
    });
}

if (greatBallForm && greatBallInput) {
    greatBallForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const message = greatBallInput.value.trim();

        if (!message) {
            return;
        }

        appendChatMessage("user", message);
        greatBallInput.value = "";

        window.setTimeout(function () {
            appendChatMessage("bot", getChatbotReply(message));
        }, 250);
    });
}
