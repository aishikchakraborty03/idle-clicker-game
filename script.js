// Game state
const gameState = {
    coinCount: 0,
    coinsPerClick: 1,
    autoClickerInterval: null,
    coinMagnetActive: false,
    superClickerActive: false,
    upgrades: {
        autoClicker: { level: 1, cost: 10, multiplier: 1 },
        clickMultiplier: { level: 1, cost: 25, multiplier: 2 },
        coinMagnet: { cost: 50, duration: 5000 },
        superClicker: { cost: 100, multiplier: 3, duration: 5000 },
    }
};

// DOM Elements
const elements = {
    coinCount: document.getElementById("coinCount"),
    clickButton: document.getElementById("clickButton"),
    autoClicker: document.getElementById("autoClicker"),
    clickMultiplier: document.getElementById("clickMultiplier"),
    coinMagnet: document.getElementById("coinMagnet"),
    superClicker: document.getElementById("superClicker"),
    bonusCoinsContainer: document.getElementById("bonusCoinsContainer"),
    autoClickerLevel: document.getElementById("autoClickerLevel"),
    autoClickerCost: document.getElementById("autoClickerCost"),
    clickMultiplierLevel: document.getElementById("clickMultiplierLevel"),
    clickMultiplierCost: document.getElementById("clickMultiplierCost")
};

// Local Storage
const STORAGE_KEY = 'idleClickerSave';

const storage = {
    save: () => {
        const { autoClickerInterval, ...persistentState } = gameState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState));
    },
    load: () => {
        try {
            const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (savedData) {
                Object.assign(gameState, savedData);
                updateDisplay();
                checkUpgrades();
                if (gameState.upgrades.autoClicker.level > 1) {
                    startAutoClicker();
                }
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
};

// Update UI
const updateDisplay = () => {
    elements.coinCount.textContent = gameState.coinCount;
    elements.autoClickerLevel.textContent = gameState.upgrades.autoClicker.level;
    elements.autoClickerCost.textContent = gameState.upgrades.autoClicker.cost;
    elements.clickMultiplierLevel.textContent = gameState.upgrades.clickMultiplier.level;
    elements.clickMultiplierCost.textContent = gameState.upgrades.clickMultiplier.cost;
};

const checkUpgrades = () => {
    const { upgrades, coinCount } = gameState;
    elements.autoClicker.disabled = coinCount < upgrades.autoClicker.cost;
    elements.clickMultiplier.disabled = coinCount < upgrades.clickMultiplier.cost;
    elements.coinMagnet.disabled = coinCount < upgrades.coinMagnet.cost;
    elements.superClicker.disabled = coinCount < upgrades.superClicker.cost;
};

// Game mechanics
const earnCoins = (amount) => {
    gameState.coinCount += amount;
    updateDisplay();
    checkUpgrades();
    storage.save();
};

const startAutoClicker = () => {
    if (gameState.autoClickerInterval) {
        clearInterval(gameState.autoClickerInterval);
    }
    gameState.autoClickerInterval = setInterval(() => {
        earnCoins(gameState.coinsPerClick * gameState.upgrades.autoClicker.multiplier);
    }, 1000);
};

const createBonusCoin = () => {
    const bonusCoin = document.createElement("div");
    bonusCoin.classList.add("bonusCoin");
    bonusCoin.style.top = `${Math.random() * 80 + 10}%`;
    bonusCoin.style.left = `${Math.random() * 80 + 10}%`;
    bonusCoin.textContent = "+5";
    
    const collectCoin = () => {
        earnCoins(5);
        bonusCoin.remove();
    };
    
    bonusCoin.addEventListener('click', collectCoin);
    elements.bonusCoinsContainer.appendChild(bonusCoin);
    
    setTimeout(() => {
        if (elements.bonusCoinsContainer.contains(bonusCoin)) {
            bonusCoin.remove();
        }
    }, gameState.upgrades.coinMagnet.duration);
};

// Event Handlers
const handleMainClick = () => {
    earnCoins(gameState.coinsPerClick);
};

const handleAutoClickerUpgrade = () => {
    const { upgrades, coinCount } = gameState;
    if (coinCount >= upgrades.autoClicker.cost) {
        gameState.coinCount -= upgrades.autoClicker.cost;
        upgrades.autoClicker.level++;
        upgrades.autoClicker.cost *= 2;
        startAutoClicker();
        updateDisplay();
        checkUpgrades();
        storage.save();
    }
};

const handleClickMultiplierUpgrade = () => {
    const { upgrades, coinCount } = gameState;
    if (coinCount >= upgrades.clickMultiplier.cost) {
        gameState.coinCount -= upgrades.clickMultiplier.cost;
        gameState.coinsPerClick *= upgrades.clickMultiplier.multiplier;
        upgrades.clickMultiplier.level++;
        upgrades.clickMultiplier.cost *= 2;
        updateDisplay();
        checkUpgrades();
        storage.save();
    }
};

const handleCoinMagnetUpgrade = () => {
    const { upgrades, coinCount } = gameState;
    if (coinCount >= upgrades.coinMagnet.cost && !gameState.coinMagnetActive) {
        gameState.coinCount -= upgrades.coinMagnet.cost;
        gameState.coinMagnetActive = true;
        
        Array.from({ length: 5 }, createBonusCoin);
        
        setTimeout(() => {
            gameState.coinMagnetActive = false;
            elements.bonusCoinsContainer.innerHTML = '';
        }, upgrades.coinMagnet.duration);
        
        updateDisplay();
        checkUpgrades();
        storage.save();
    }
};

const handleSuperClickerUpgrade = () => {
    const { upgrades, coinCount } = gameState;
    if (coinCount >= upgrades.superClicker.cost && !gameState.superClickerActive) {
        gameState.coinCount -= upgrades.superClicker.cost;
        gameState.superClickerActive = true;
        gameState.coinsPerClick *= upgrades.superClicker.multiplier;
        
        setTimeout(() => {
            gameState.coinsPerClick /= upgrades.superClicker.multiplier;
            gameState.superClickerActive = false;
            updateDisplay();
        }, upgrades.superClicker.duration);
        
        updateDisplay();
        checkUpgrades();
        storage.save();
    }
};

// Event Listeners
elements.clickButton.addEventListener('click', handleMainClick);
elements.autoClicker.addEventListener('click', handleAutoClickerUpgrade);
elements.clickMultiplier.addEventListener('click', handleClickMultiplierUpgrade);
elements.coinMagnet.addEventListener('click', handleCoinMagnetUpgrade);
elements.superClicker.addEventListener('click', handleSuperClickerUpgrade);

// Initialize game
storage.load();