const wordDisplay = document.querySelector(".word-display");
const keyboardDiv = document.querySelector(".keyboard");
const livesDisplay = document.querySelector(".lives-display");
const gameModal = document.querySelector(".game-modal");
const tryAgainBtn = document.querySelector(".try-again");
const nextLevelBtn = document.querySelector(".next-level");
const scoreDisplay = document.querySelector(".score b");
const leaderboardList = document.querySelector(".leaderboard-list");

const correctSound = new Audio("sounds/Correct.mp3");
const wrongSound = new Audio("sounds/wrong.mp3");
const winSound = new Audio("sounds/win.mp3");
const loseSound = new Audio("sounds/lose.mp3");

let currentWord, correctLetters, wrongGuessCount;
let maxGuesses = 5;
let score = 0;
const completedWords = new Set();

const resetGame = (keepWord = false) => {
    correctLetters = new Set();
    wrongGuessCount = 0;
    livesDisplay.innerHTML = "❤️".repeat(maxGuesses);
    wordDisplay.innerHTML = "";

    if (!keepWord) {
        getRandomWord();
    }

    if (currentWord) {
        displayWordWithHints();
    }

    keyboardDiv.querySelectorAll("button").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("disabled", "correct", "wrong");
    });

    gameModal.classList.remove("show");
    nextLevelBtn.style.display = "none";
    tryAgainBtn.style.display = "none";
};

const getRandomWord = () => {
    if (completedWords.size === wordList.length) {
        showGameCompletedModal();
        return;
    }

    let wordData;
    do {
        wordData = wordList[Math.floor(Math.random() * wordList.length)];
    } while (completedWords.has(wordData.word));

    currentWord = wordData.word.toUpperCase();
    completedWords.add(currentWord);

    const hintElement = document.querySelector(".hint-text b");
    if (hintElement) {
        hintElement.innerText = wordData.hint;
    }

    resetGame(true);
};

const displayWordWithHints = () => {
    wordDisplay.innerHTML = "";
    const wordArray = currentWord.split("");
    const hintIndexes = new Set();

    while (hintIndexes.size < Math.ceil(currentWord.length * 0.2)) {
        let index = Math.floor(Math.random() * currentWord.length);
        hintIndexes.add(index);
    }

    wordArray.forEach((letter, index) => {
        const li = document.createElement("li");
        li.classList.add("letter");

        if (hintIndexes.has(index)) {
            li.innerText = letter;
            li.classList.add("guessed");
            correctLetters.add(letter);
        }

        wordDisplay.appendChild(li);
    });
};

function gameOver(isWin) {
    const modalTitle = document.querySelector(".game-modal h4");
    const resultGif = document.querySelector(".result-gif");
    const correctWordText = document.querySelector(".correct-word");
    const nextLevelButton = document.querySelector(".next-level");
    const tryAgainButton = document.querySelector(".try-again");
    const Button = document.querySelector(".quit-modal-button");

    correctWordText.innerText = currentWord.toUpperCase();

    if (isWin) {
        modalTitle.innerText = "🎉 Congratulations! You Win!";
        resultGif.src = "gif/win.gif";
        resultGif.alt = "Win GIF";
        nextLevelButton.style.display = "inline-block";
        tryAgainButton.style.display = "none";
        winSound.play();
        score += 10;
        updateScore();
        updateLeaderboard();
    } else {
        modalTitle.innerText = "❌ Game Over! You Lost!";
        resultGif.src = "gif/lose.gif";
        resultGif.alt = "Lose GIF";
        nextLevelButton.style.display = "none";
        tryAgainButton.style.display = "inline-block";
        loseSound.play();
    }

    Button.style.display = "inline-block"; 
    document.querySelector(".game-modal").classList.add("show");
}

const initGame = (button, clickedLetter) => {
    if (currentWord.includes(clickedLetter)) {
        correctSound.play();
        [...currentWord].forEach((letter, index) => {
            if (letter === clickedLetter) {
                correctLetters.add(letter);
                wordDisplay.querySelectorAll("li")[index].innerText = letter;
                wordDisplay.querySelectorAll("li")[index].classList.add("guessed");
            }
        });
        button.classList.add("correct");
    } else {
        wrongGuessCount++;
        wrongSound.play();
        livesDisplay.innerHTML = "❤️".repeat(maxGuesses - wrongGuessCount) + "💔".repeat(wrongGuessCount);
        document.querySelector(".game-box").classList.add("shake");
        setTimeout(() => document.querySelector(".game-box").classList.remove("shake"), 300);
        button.classList.add("wrong");
    }

    button.disabled = true;
    button.classList.add("disabled");
    if (wrongGuessCount >= maxGuesses) return gameOver(false);
    if ([...currentWord].every(letter => correctLetters.has(letter))) return gameOver(true);
};

function updateScore() {
    scoreDisplay.innerText = score;
}

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("scratchCanvas");
    const ctx = canvas.getContext("2d");
    const hintText = document.getElementById("hintText");

    let isScratching = false;
    let totalScratched = 0;
    const scratchThreshold = 0.6;

    const scratchSound = new Audio("sounds/scratch.mp3");
    scratchSound.volume = 0.9;

    function setHint() {
        const wordData = getRandomWord();
        hintText.textContent = wordData.hint;
        setupCanvas();
    }

    function setupCanvas() {
        canvas.width = hintText.offsetWidth;
        canvas.height = hintText.offsetHeight;
        ctx.fillStyle = "#777";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "destination-out";
    }

    function scratch(event) {
        if (!isScratching) return;

        let rect = canvas.getBoundingClientRect();
        let x = (event.clientX || event.touches[0].clientX) - rect.left;
        let y = (event.clientY || event.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        scratchSound.currentTime = 0; 
        scratchSound.play();

        checkScratchProgress();
    }

    function checkScratchProgress() {
        const canvas = document.getElementById("scratchCanvas");
        const ctx = canvas.getContext("2d");

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let pixels = imageData.data;
        let clearedPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) clearedPixels++;
        }

        let scratchedRatio = clearedPixels / (canvas.width * canvas.height);

        if (scratchedRatio > scratchThreshold) {
            canvas.style.transition = "opacity 1s ease-out";
            canvas.style.opacity = "0";

            setTimeout(() => {
                canvas.style.display = "none";
                document.getElementById("guideText").classList.add("hidden");
            }, 1000);
        }
    }

    canvas.addEventListener("pointerdown", () => (isScratching = true));
    canvas.addEventListener("pointerup", () => (isScratching = false));
    canvas.addEventListener("pointermove", scratch);
    canvas.addEventListener("touchmove", scratch);

    setHint();
});

function resetScratchCanvas() {
    const canvas = document.getElementById("scratchCanvas");
    const ctx = canvas.getContext("2d");

    document.getElementById("guideText").classList.remove("hidden");

    canvas.style.display = "block";
    canvas.style.opacity = "1";
    canvas.width = document.getElementById("hintText").offsetWidth;
    canvas.height = document.getElementById("hintText").offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#777";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-out";
}

document.addEventListener("DOMContentLoaded", function () {
    displayLeaderboard();
});

function savePlayerName() {
    let playerName = document.getElementById("playerName").value.trim();

    if (!playerName) {
        alert("Please enter your name!");
        return;
    }

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let existingPlayer = leaderboard.find(player => player.name === playerName);

    if (!existingPlayer) {
        leaderboard.push({ name: playerName, score: 0 });
    } else {
        score = existingPlayer.score;
    }

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    localStorage.setItem("playerName", playerName);

    updateLeaderboard();
    displayLeaderboard();

    document.querySelector(".name-overlay").style.display = "none";
    document.querySelector(".name-container").style.display = "none";
}

function updateLeaderboard() {
    let playerName = localStorage.getItem("playerName");
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    if (!playerName) return;

    let existingPlayer = leaderboard.find(player => player.name === playerName);
    if (existingPlayer) {
        existingPlayer.score = score;
    } else {
        leaderboard.push({ name: playerName, score: score });
    }

    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    displayLeaderboard();
}

function displayLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let leaderboardList = document.getElementById("leaderboardList");
    let playerDisplay = document.getElementById("playerDisplay");

    let currentPlayer = localStorage.getItem("playerName") || "Guest";
    playerDisplay.textContent = currentPlayer;

    leaderboardList.innerHTML = "";

    leaderboard.forEach((player, index) => {
        let listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${player.name} - ${player.score} points`;
        leaderboardList.appendChild(listItem);
    });
}

function startGame() {
    let playerNameInput = document.querySelector("#playerName");
    let errorMessage = document.querySelector("#error-message");

    if (playerNameInput.value.trim() === "") {
        errorMessage.style.display = "block";
        return;
    }

    errorMessage.style.display = "none";
    savePlayerName();
}

document.addEventListener("DOMContentLoaded", () => {
    function createKeyboard() {
        keyboardDiv.innerHTML = "";
        for (let i = 65; i <= 90; i++) {
            const button = document.createElement("button");
            button.innerText = String.fromCharCode(i);
            button.setAttribute("data-key", String.fromCharCode(i));
            button.addEventListener("click", (e) => handleKeyPress(e.target));
            keyboardDiv.appendChild(button);
        }
    }

    function handleKeyPress(button) {
        const letter = button.getAttribute("data-key");
        button.disabled = true;
        button.classList.add("disabled");
        initGame(button, letter);
    }

    createKeyboard();
    renderLeaderboard();
});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".name-overlay").style.display = "block";
    document.querySelector(".name-container").style.display = "flex";
});

document.addEventListener("DOMContentLoaded", function () {
    let nameInput = document.getElementById("playerName");
    nameInput.setAttribute("autocomplete", "off");
    nameInput.setAttribute("autocorrect", "off");
    nameInput.setAttribute("spellcheck", "false");
});
document.querySelector(".quit-modal-button").addEventListener("click", quitGame);

function confirmQuit() {
    window.location.href = "index.html";
}

function closeQuitModal() {
    document.getElementById("quit-modal").style.display = "none";
}

function quitGame() {
    const quitModal = document.getElementById("quit-modal");
    if (quitModal) {
        quitModal.style.display = "flex"
    }
}

function returnToHome() {
    window.location.href = "index.html"; // Redirect to the homepage
}

tryAgainBtn.addEventListener("click", () => {
    resetGame(false);
    getRandomWord();
    gameModal.classList.remove("show");
    resetScratchCanvas();
});


nextLevelBtn.addEventListener("click", () => {
    resetGame(false);
    getRandomWord();
    gameModal.classList.remove("show");
    resetScratchCanvas();
});

function openPasswordModal() {
    const passwordModal = document.getElementById("password-modal");
    if (passwordModal) {
        passwordModal.style.display = "flex";
    }
}

function closePasswordModal() {
    const passwordModal = document.getElementById("password-modal");
    if (passwordModal) {
        passwordModal.style.display = "none";
    }
}

function submitPassword() {
    const adminPassword = "danah123";
    const enteredPassword = document.getElementById("adminPasswordInput").value.trim();
    const errorMessage = document.getElementById("password-error-message");

    if (!enteredPassword) {
        errorMessage.textContent = "Password is required.";
        errorMessage.style.display = "block";
        return;
    }

    if (enteredPassword === adminPassword) {
        localStorage.removeItem("leaderboard");
        displayLeaderboard();
        errorMessage.style.display = "none";
        closePasswordModal();
    } else {
        errorMessage.textContent = "Incorrect password. Please try again.";
        errorMessage.style.display = "block";
    }
}

function showGameCompletedModal() {
    const finalScoreElement = document.getElementById("final-score");
    finalScoreElement.innerText = score; 

    const gameCompletedModal = document.getElementById("game-completed-modal");
    if (gameCompletedModal) {
        gameCompletedModal.style.display = "flex";
    }
}

function restartGame() {
    completedWords.clear(); // Clear the set of completed words
    score = 0; // Reset the score
    updateScore(); // Update the score display
    getRandomWord(); // Start a new game
    const gameCompletedModal = document.getElementById("game-completed-modal");
    if (gameCompletedModal) {
        gameCompletedModal.style.display = "none";
    }
}

getRandomWord();


