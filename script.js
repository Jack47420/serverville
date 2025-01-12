// How fast do you want new server racks to fade in?
let fadeInSpeed = 250;
// Do you want the first server rack to start at 1 or 0?
let startnumber = 1;

// Maximum grid size | 4 is default | 11 is max
let startMaxGridSize = 6;
// Start money
let startMoney = 999;
// Base quest reward
let baseQuestReward = 1000;
// Base price for a server rack
let startRackBasePrice = 560;
// Price multiplier for server racks
let rackPriceMultiplier = 1.7;
// Base price for a GPU
let startGpuBasePrice = 320;
// Price multiplier for GPUs
let gpuPriceMultiplier = 1.15;
// Base price for an upgrade
let startUpgradeBasePrice = 1400;
// Price multiplier for upgrades
let upgradePriceMultiplier = 9.8;
// Money per second for a rack
let rackMPS = 1.91;
// Money per second for a GPU
let GPUMPS = 21.16;

// These are not to be changed by hand
let gridSize = 1;
let maxGPUs = 4;
let momentualMaxRacks = 1;
let maxRacks;
let purchasedRacks;
let gpuCounts;
let rackUpgrades;
let arrangement = [0];
let rackBasePrice;
let gpuBasePrice;
let upgradeBasePrice;
let maxGridSize;
let wait4QuestFadeOut;
let storyQueue = [];
let questQueue = [];
let savedMoney;
let moneyPerSecond;
let money;

// Start zoom
let startZoom = 2.2;
// Zoom limits
let zoom;
const ZOOM_SPEED = 0.2;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;

// Add this near the top of your file with other variable declarations
let isPopupOpen = false;
let isDebugVisible = false;
let viewSwitchActive = false;
let cheatActivated = false;
let isStoryOpen = false;
let currentStoryPopup = null;
let selectedRack = null;

initializeGame()

function initializeGame() {
    maxGridSize = startMaxGridSize;
    money = startMoney;
    rackBasePrice = startRackBasePrice;
    gpuBasePrice = startGpuBasePrice;
    upgradeBasePrice = startUpgradeBasePrice;
    momentualMaxRacks = 1;
    zoom = startZoom;
    gridSize = 1;
    maxRacks = Math.pow(maxGridSize, 2);
    wait4QuestFadeOut = false;
    purchasedRacks = [0];
    gpuCounts = [0];
    rackUpgrades = [0];
    selectedRack = null;
    arrangement = [0];
    isPopupOpen = false;
    quests();
    initializeGrid();
    updateMoneyCounter();
    setInterval(calculateMoneyPerSecond, 1000);
    setInterval(updateMoney, 1000);
    updateRackButtonText();
    updateGPUButtonText();
    updateGPUButtonState(); 
    updateServerRackButtonState(); 
    updateUpgradeButtonState(); 
    updateUpgradeButtonText(); 
    setupZoomAndPan();
    updateQuestDisplay();
    story();
    document.getElementById('general-debug-info').style.display = 'none';
    document.getElementById('selected-debug-info').style.display = 'block';
    updateDebugInfo();
}
function initializeGrid() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';
    gridContainer.style.setProperty('--grid-size', gridSize);
    for (let i = 0; i < gridSize * gridSize; i++) {
        const rack = createServerRack(purchasedRacks[i] === 1, i);
        gridContainer.appendChild(rack);
        if (i === 0) {
            rack.classList.add('fade-in');
        }
    }
}

function updateQuestProgress(type, amount = 1) {
    questQueue.forEach(quest => {
        if (quest.type === type && !quest.completed) {
            if (type === 'money') {
                let moneyAmount = parseFloat(amount.toFixed(2));
                quest.progress += moneyAmount;
                quest.progress = parseFloat(quest.progress.toFixed(0));
            } else {
                quest.progress += amount;
            }
            if (quest.progress >= quest.goal) {
                quest.completed = true;
            }
        }
    });
    if (wait4QuestFadeOut === true) {
        setTimeout(() => {
            updateQuestDisplay();
        }, 900);
    } else {
        updateQuestDisplay();
    }
}

document.getElementById('quest-panel').addEventListener('mousedown', (event) => {
    const draggable = document.getElementById('quest-panel');
    let offsetX = event.clientX - draggable.getBoundingClientRect().left;
    let offsetY = event.clientY - draggable.getBoundingClientRect().top;

    const mouseMoveHandler = (event) => {
        draggable.style.left = `${event.clientX - offsetX}px`;
        draggable.style.top = `${event.clientY - offsetY}px`;
    };

    const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
});

function updateQuestDisplay() {
    const questList = document.getElementById('quest-list');
    questList.innerHTML = '';
    
    // Filter quests that are not rewarded yet (including completed but unclaimed)
    const activeQuests = questQueue.filter(quest => !quest.rewarded);
    
    // Display only the first 3 active quests
    activeQuests.slice(0, 3).forEach(quest => {
        const questItem = document.createElement('div');
        questItem.className = `quest-item ${quest.completed ? 'completed' : ''}`;
        questItem.dataset.id = quest.id;
        questItem.innerHTML = `
            <h4>${quest.name}</h4>
            <p>${quest.description}</p>
            <p class="progress">Progress: ${quest.progress}/${quest.goal}</p>
            <p class="difficulty">Difficulty: ${'★'.repeat(quest.difficulty)}</p>
        `;
        if (quest.completed) {
            questItem.addEventListener('click', () => claimQuestReward(quest));
        }
        questList.appendChild(questItem);
    });

    // If there are no active quests, show a message
    if (activeQuests.length === 0) {
        const noQuestsMessage = document.createElement('div');
        noQuestsMessage.textContent = "All quests completed!";
        questList.appendChild(noQuestsMessage);
    }
}

function claimQuestReward(quest) {
    if (quest.completed && !quest.rewarded) {
        quest.rewarded = true;
        
        // Calculate reward based on difficulty
        let reward = baseQuestReward * Math.pow(2, quest.difficulty - 1);
        money += reward;
        
        updateMoneyCounter();
        showPopup(`Reward claimed`, `Reward claimed for quest: ${quest.name}. You received $${reward.toLocaleString()}!`);
        
        // Find the quest item and add the 'claimed' class to stop the shimmer
        const questItem = document.querySelector(`.quest-item[data-id="${quest.id}"]`);
        if (questItem) {
            questItem.classList.add('claimed');
            wait4QuestFadeOut = true;
            updateDebugInfo();
            setTimeout(() => {
                questItem.classList.add('fade-out');
                setTimeout(() => {
                    wait4QuestFadeOut = false;
                    updateDebugInfo();
                    updateQuestDisplay(); // Update quest display after fade-out
                }, 500); // Wait for fade-out animation to complete
            }, 500); // Wait before starting fade-out
        } else {
            updateQuestDisplay(); // Update quest display immediately if quest item not found
        }
    }
}

document.getElementById('quest-list').addEventListener('click', (event) => {
    const questItem = event.target.closest('.quest-item');
    if (questItem && questItem.classList.contains('completed')) {
        const questId = parseInt(questItem.dataset.id);
        const quest = questQueue.find(q => q.id === questId);
        if (quest) {
            claimQuestReward(quest);
        }
    }
});

function calculateMoneyPerSecond() {
    const racks = purchasedRacks.reduce((a, b) => a + b, 0);
    const gpus = gpuCounts.reduce((a, b) => a + b, 0);
    moneyPerSecond = racks * rackMPS + gpus * GPUMPS;
    let tempMoneyPerSecond = moneyPerSecond.toFixed(2);
    document.getElementById('money-per-second').innerText = `+ $${tempMoneyPerSecond} /s`;
}

function updateMoney() {
    money += moneyPerSecond;
    updateMoneyCounter();
    updateQuestProgress('money', moneyPerSecond);
}
function updateMoneyCounter() {
    let tempMoney = money.toFixed(2);
    document.getElementById('money-info').innerText = `Money: $${tempMoney}`;
    updateGPUButtonState(); // Update GPU button state
    updateServerRackButtonState(); // Update server rack button state
    updateRackButtonText(); // Update server rack button text
    updateUpgradeButtonText(); // Update upgrade button text
    updateUpgradeButtonState(); // Update upgrade button state
}

function roundPrice(price) {
    const magnitude = Math.floor(Math.log10(price));
    const roundTo = Math.pow(10, Math.max(1, magnitude - 2));
    return Math.round(price / roundTo) * roundTo;
}

function updateRackButtonText() {
    const button = document.getElementById('buy-serverrack');
    if (purchasedRacks.reduce((a, b) => a + b, 0) >= maxRacks) {
        button.innerText = "No more racks available";
        button.disabled = true; // Optionally disable the button
    } else {
        const basePrice = rackBasePrice * Math.pow(rackPriceMultiplier, purchasedRacks.reduce((a, b) => a + b, 0));
        const price = roundPrice(basePrice);
        button.innerText = `Buy Server Rack ($${price.toFixed(0)})`;
    }
}

function updateGPUButtonText() {
    const button = document.getElementById('buy-gpu');
    const basePrice = gpuBasePrice * Math.pow(gpuPriceMultiplier,gpuCounts.reduce((a, b) => a + b, 0));
    const price = roundPrice(basePrice);
    button.innerText = `Buy GPU ($${price.toFixed(0)})`;
}

function updateUpgradeButtonText() {
    const button = document.getElementById('buy-upgrade');
    const selectedRackIndex = selectedRack ? Array.from(document.getElementsByClassName('server-rack')).indexOf(selectedRack) : -1;
    const logicalIndex = selectedRackIndex !== -1 ? arrangement[selectedRackIndex] : -1;

    if (selectedRack && purchasedRacks[logicalIndex] === 1 && rackUpgrades[logicalIndex] < 5) {
        const upgradePrice = upgradeBasePrice * Math.pow(upgradePriceMultiplier, rackUpgrades[logicalIndex]);
        const price = roundPrice(upgradePrice);
        button.innerText = `Upgrade ($${price.toFixed(0)})`;
    } else {
        button.innerText = "Upgrade";
    }
}

function expandArrays(newSize) {
    const currentSize = purchasedRacks.length;
    const elementsToAdd = newSize - currentSize;
    
    if (elementsToAdd > 0) {
        purchasedRacks = purchasedRacks.concat(Array(elementsToAdd).fill(0));
        gpuCounts = gpuCounts.concat(Array(elementsToAdd).fill(0));
        rackUpgrades = rackUpgrades.concat(Array(elementsToAdd).fill(0));
    }
}

function expandGrid() {
    if (purchasedRacks.reduce((a, b) => a + b, 0) === gridSize * gridSize && gridSize < maxGridSize) {
        const gridContainer = document.getElementById('grid-container');
        const gridBox = document.getElementById('grid-box');
        
        // Store the currently selected rack index
        const selectedRackIndex = selectedRack ? arrangement[Array.from(gridContainer.children).indexOf(selectedRack)] : null;
        gridSize++;
        
        gridContainer.innerHTML = ''; // Clear existing racks
        // Set the CSS variable for grid size
        gridContainer.style.setProperty('--grid-size', gridSize);

        // Expand arrays to match new grid size
        expandArrays(gridSize * gridSize);
        
        // Use the new getArrangement function
        arrangement = getArrangement(arrangement, gridSize);
        
        // Create a document fragment to hold all the new racks
        const fragment = document.createDocumentFragment();
        
        // Create all racks and add them to the fragment
        arrangement.forEach((rackIndex) => {
            const isPurchased = purchasedRacks[rackIndex] === 1;
            const rack = createServerRack(isPurchased, rackIndex, isPurchased); // Set visible to true for purchased racks
            if (rackIndex === selectedRackIndex) {
                rack.classList.add('selected');
                selectedRack = rack; // Update the selectedRack variable to reference the new DOM element
            }
            fragment.appendChild(rack);
        });
        
        // Add all racks to the grid at once
        gridContainer.appendChild(fragment);
        
        // Add fade-in class to each unpurchased rack with appropriate delay
        let unpurchasedCount = 1;
        arrangement.forEach((rackIndex, i) => {
            const isPurchased = purchasedRacks[rackIndex] === 1;
            if (!isPurchased) {
                const fadeInSpeedx = fadeInSpeed / gridSize;
                const delay = fadeInSpeedx * unpurchasedCount;
                setTimeout(() => {
                    const rack = gridContainer.children[i];
                    rack.style.opacity = '1';
                    rack.classList.add('fade-in');
                }, delay);
                unpurchasedCount++;
            }
        });

        // Adjust zoom based on new grid size
        adjustZoomAfterGridChange();
    }
}

function setupZoomAndPan() {
    const gridBox = document.getElementById('grid-box');
    const gridContainer = document.getElementById('grid-container');

    // Set initial zoom
    gridContainer.style.transform = `rotateX(45deg) rotateZ(45deg) scale(${zoom})`;

    // Zooming
    gridBox.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = calculateZoomSpeed(zoom, gridSize);
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        adjustZoom(delta);
    });

    // Panning
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;

    gridBox.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - gridBox.offsetLeft;
        startY = e.pageY - gridBox.offsetTop;
        scrollLeft = gridBox.scrollLeft;
        scrollTop = gridBox.scrollTop;
    });

    gridBox.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    gridBox.addEventListener('mouseup', () => {
        isDragging = false;
    });

    gridBox.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - gridBox.offsetLeft;
        const y = e.pageY - gridBox.offsetTop;
        const walkX = (x - startX) * 2;
        const walkY = (y - startY) * 2;
        gridBox.scrollLeft = scrollLeft - walkX;
        gridBox.scrollTop = scrollTop - walkY;
    });
}

function calculateZoomSpeed(currentZoom, gridSize) {
    const baseSpeed = 0.05; // Reduced base speed
    const gridFactor = Math.pow(gridSize, 1.5) / 100; // Non-linear scaling based on grid size
    const zoomFactor = (MAX_ZOOM - currentZoom) / MAX_ZOOM; // Zoom factor increases as we zoom out
    return baseSpeed * (1 + gridFactor) * (1 + zoomFactor);
}
function adjustZoomAfterGridChange() {
    const gridContainer = document.getElementById('grid-container');
    const gridBox = document.getElementById('grid-box');
    const gameContainer = document.getElementById('game-container');

    const gridRect = gridContainer.getBoundingClientRect();
    const boxRect = gridBox.getBoundingClientRect();
    const gameContainerRect = gameContainer.getBoundingClientRect();

    const padding = 40;
    const targetWidth = boxRect.width - padding;
    const targetHeight = boxRect.height - padding;

    const scaleX = targetWidth / gridRect.width;
    const scaleY = targetHeight / gridRect.height;
    let newZoom = Math.min(scaleX, scaleY, MAX_ZOOM);

    // Calculate the pixel distance between the grid and the game container
    const leftDistance = gridRect.left - gameContainerRect.left;
    const rightDistance = gameContainerRect.right - gridRect.right;
    const topDistance = gridRect.top - gameContainerRect.top;
    const bottomDistance = gameContainerRect.bottom - gridRect.bottom;

    // Calculate the size of a single rack
    const rackSize = gridRect.width / gridSize;

    // Check if any distance is less than the size of a rack
    if (leftDistance < rackSize || rightDistance < rackSize || 
        topDistance < rackSize || bottomDistance < rackSize) {
        // If so, zoom out more aggressively
        newZoom *= 0.7;
    }

    // Even more aggressive zoom-out when zoom level is below 1
    if (newZoom < 0.76 && newZoom > 0.5) {
        newZoom *= 0.6;
    } else if (newZoom < 0.5) {
        newZoom *= 0.2;
    }
    // Implement a more gradual zoom change
    const zoomDifference = newZoom - zoom;
    const zoomStep = zoomDifference * 0.3;

    zoom = Math.max(Math.min(zoom + zoomStep, MAX_ZOOM), MIN_ZOOM);

    // Apply the new zoom level
    if (viewSwitchActive) {
        gridContainer.style.transform = `scale(${zoom})`;
    } else if (!viewSwitchActive) {
        gridContainer.style.transform = `rotateX(45deg) rotateZ(45deg) scale(${zoom})`;
    }

    // Center the grid
    const newWidth = gridRect.width * zoom;
    const newHeight = gridRect.height * zoom;
    const leftOffset = (boxRect.width - newWidth) / 2;
    const topOffset = (boxRect.height - newHeight) / 2;
    gridContainer.style.left = `${leftOffset}px`;
    gridContainer.style.top = `${topOffset}px`;

    // Reset scroll position
    gridBox.scrollLeft = 0;
    gridBox.scrollTop = 0;

    updateDebugInfo();
}

function adjustZoom(zoomDelta = 0) {
    const gridContainer = document.getElementById('grid-container');
    const gridBox = document.getElementById('grid-box');

    // Apply the zoom change
    zoom = Math.max(Math.min(zoom + zoomDelta, MAX_ZOOM), MIN_ZOOM);

    // Apply the new zoom level
    gridContainer.style.transform = `rotateX(45deg) rotateZ(45deg) scale(${zoom})`;

    // Center the grid
    const gridRect = gridContainer.getBoundingClientRect();
    const boxRect = gridBox.getBoundingClientRect();
    const newWidth = gridRect.width * zoom;
    const newHeight = gridRect.height * zoom;
    const leftOffset = (boxRect.width - newWidth) / 2;
    const topOffset = (boxRect.height - newHeight) / 2;
    gridContainer.style.left = `${leftOffset}px`;
    gridContainer.style.top = `${topOffset}px`;

    updateDebugInfo();
}

function createServerRack(isPurchased = false, index = 0, visible = true) {
    const rack = document.createElement('div');
    rack.className = 'server-rack';
    if (isPurchased) {
        rack.classList.add('purchased');
    }
    if (startnumber === 1) rack.innerText = index + 1; 
    if (startnumber === 0) rack.innerText = index;

    // Set initial opacity
    rack.style.opacity = visible ? '1' : '0';

    // Apply upgrade level class
    const upgradeLevel = rackUpgrades[index];
    if (upgradeLevel > 0) {
        rack.classList.add(`upgrade-level-${upgradeLevel}`);
    }

    // Create GPU containers
    const gpuContainer = document.createElement('div');
    gpuContainer.className = 'gpu-container';
    rack.appendChild(gpuContainer);

    const gpuContainerRowTwo = document.createElement('div');
    gpuContainerRowTwo.className = 'gpu-containerRowTwo';
    rack.appendChild(gpuContainerRowTwo);

    // Add GPUs based on the count
    for (let j = 0; j < gpuCounts[index]; j++) {
        const gpu = document.createElement('div');
        gpu.className = 'gpu';
        if (j < 6) {
            gpuContainer.appendChild(gpu);
        } else {
            gpuContainerRowTwo.appendChild(gpu);
        }
    }

    rack.addEventListener('click', (event) => {
        event.stopPropagation();
        if (selectedRack === rack) {
            rack.classList.remove('selected');
            selectedRack = null;
        } else {
            if (selectedRack) {
                selectedRack.classList.remove('selected');
            }
            rack.classList.add('selected');
            selectedRack = rack;
        }
        updateDebugInfo();
        updateGPUButtonState();
        updateServerRackButtonState();
        updateUpgradeButtonState();
        updateUpgradeButtonText();
    });
    return rack;
}

document.getElementById('buy-serverrack').addEventListener('click', () => {
    const basePrice = rackBasePrice * Math.pow(rackPriceMultiplier, purchasedRacks.reduce((a, b) => a + b, 0));
    const price = roundPrice(basePrice);
    if (money >= price && purchasedRacks.reduce((a, b) => a + b, 0) < maxRacks) {
        money -= price;
        updateMoneyCounter();
        
    const gridContainer = document.getElementById('grid-container');
    const racks = gridContainer.getElementsByClassName('server-rack');
        
        let nextRackIndex;
        if (selectedRack && !selectedRack.classList.contains('purchased')) {
            // If a non-purchased rack is selected, use its index
            const selectedRackIndex = Array.from(racks).indexOf(selectedRack);
            nextRackIndex = arrangement[selectedRackIndex];
        } else {
            // Otherwise, find the next unpurchased rack
            nextRackIndex = purchasedRacks.indexOf(0);
        }
        
        if (nextRackIndex !== -1) {
            purchasedRacks[nextRackIndex] = 1;
            
            // Find the visual index of the rack to purchase
            const visualIndex = arrangement.indexOf(nextRackIndex);
            if (visualIndex !== -1) racks[visualIndex].classList.add('purchased');
            
            updateUpgradeButtonState();
            updateUpgradeButtonText();
            updateRackButtonText();
            expandGrid();
            updateGPUButtonState(); // Update GPU button state
            updateServerRackButtonState(); // Update server rack button state
            updateDebugInfo(); // Update debug info
            updateQuestProgress('serverRacks');
        }
    }
});

// Update the maxGPUs calculation based on upgrade level
function getMaxGPUs(upgradeLevel) {
    if (upgradeLevel === 0) return 4;
    if (upgradeLevel === 1) return 6;
    if (upgradeLevel <= 3) return 6 + (upgradeLevel - 1) * 2;
    return 10 + (upgradeLevel - 3);
}

// Update the updateGPUButtonState function
function updateGPUButtonState() {
    const button = document.getElementById('buy-gpu');
    const basePrice = gpuBasePrice * Math.pow(gpuPriceMultiplier, gpuCounts.reduce((a, b) => a + b, 0));
    const price = roundPrice(basePrice);
    const canAfford = money >= price;
    let hasAvailableRack = false;
    if (selectedRack) {
        const selectedRackIndex = Array.from(document.getElementsByClassName('server-rack')).indexOf(selectedRack);
        const logicalIndex = arrangement[selectedRackIndex];
        const maxGPUs = getMaxGPUs(rackUpgrades[logicalIndex]);
        hasAvailableRack = purchasedRacks[logicalIndex] === 1 && gpuCounts[logicalIndex] < maxGPUs;
    } else {
        hasAvailableRack = purchasedRacks.some((purchased, index) => {
            const maxGPUs = getMaxGPUs(rackUpgrades[index]);
            return purchased === 1 && gpuCounts[index] < maxGPUs;
        });
    }

    if (canAfford && hasAvailableRack) {
        button.disabled = false;
        button.style.color = '#00ff00';
        button.style.borderColor = '#00ff00';
    } else {
        button.disabled = true;
        button.style.color = '#555';
        button.style.borderColor = '#555';
    }
}

// Update the refreshSingleRackDisplay function
function refreshSingleRackDisplay(rackIndex) {
    const gridContainer = document.getElementById('grid-container');
    const visualIndex = arrangement.indexOf(rackIndex);

    if (visualIndex !== -1) {
        const rack = gridContainer.children[visualIndex];
        const isPurchased = purchasedRacks[rackIndex] === 1;

        // Update classes
        rack.className = 'server-rack';
        if (isPurchased) {
            rack.classList.add('purchased');
        }
        if (selectedRack === rack) {
            rack.classList.add('selected');
        }

        // Update upgrade level
        const upgradeLevel = rackUpgrades[rackIndex];
        for (let i = 1; i <= 5; i++) {
            rack.classList.remove(`upgrade-level-${i}`);
        }
        if (upgradeLevel > 0) {
            rack.classList.add(`upgrade-level-${upgradeLevel}`);
        }

        // Update GPUs
        const gpuContainer = rack.querySelector('.gpu-container');
        const gpuContainerRowTwo = rack.querySelector('.gpu-containerRowTwo');
        gpuContainer.innerHTML = ''; // Clear existing GPUs
        gpuContainerRowTwo.innerHTML = ''; // Clear existing GPUs
        const gpuCount = gpuCounts[rackIndex];
        
        for (let j = 0; j < gpuCount; j++) {
            const gpu = document.createElement('div');
            gpu.className = 'gpu';
            if (j < 6) {
                gpuContainer.appendChild(gpu);
            } else {
                gpuContainerRowTwo.appendChild(gpu);
            }
        }

        // Ensure the rack is visible
        rack.classList.add('fade-in');
    }
}

// Update the buy-gpu event listener
document.getElementById('buy-gpu').addEventListener('click', () => {
    const basePrice = gpuBasePrice * Math.pow(gpuPriceMultiplier, gpuCounts.reduce((a, b) => a + b, 0));
    const price = roundPrice(basePrice);
    if (money >= price) {
        let rackToUpgrade = null;

        // Check if a selected rack is purchased and has less than the max GPUs
        if (selectedRack) {
            const selectedRackIndex = Array.from(document.getElementsByClassName('server-rack')).indexOf(selectedRack);
            const logicalIndex = arrangement[selectedRackIndex];
            const maxGPUs = getMaxGPUs(rackUpgrades[logicalIndex]);
            if (purchasedRacks[logicalIndex] === 1 && gpuCounts[logicalIndex] < maxGPUs) {
                rackToUpgrade = logicalIndex;
            }
        }

        // If no suitable selected rack, find any purchased rack with less than the max GPUs
        if (rackToUpgrade === null) {
            rackToUpgrade = purchasedRacks.findIndex((purchased, index) => {
                const maxGPUs = getMaxGPUs(rackUpgrades[index]);
                return purchased === 1 && gpuCounts[index] < maxGPUs;
            });
        }

        if (rackToUpgrade !== -1) {
            money -= price;
            gpuCounts[rackToUpgrade]++;
            updateMoneyCounter();
            updateGPUButtonText();
            updateGPUButtonState();
            refreshSingleRackDisplay(rackToUpgrade);
            updateDebugInfo();
            updateQuestProgress('gpus');
        } else {
            showPopup("Error", "No available slot in your racks to add a GPU. Upgrade your racks or buy more server racks!");
        }
    } else {
        showPopup("Error", "You don't have enough money to buy a GPU.");
    }
});
document.getElementById('buy-upgrade').addEventListener('click', () => {
    if (selectedRack) {
        const selectedRackIndex = Array.from(document.getElementsByClassName('server-rack')).indexOf(selectedRack);
        const logicalIndex = arrangement[selectedRackIndex];

        // Check if the rack is purchased and can be upgraded further
        if (purchasedRacks[logicalIndex] === 1 && rackUpgrades[logicalIndex] < 5) {
            // Calculate the upgrade price based on the current upgrade level
            const upgradePrice = upgradeBasePrice * Math.pow(upgradePriceMultiplier, rackUpgrades[logicalIndex]);

            if (money >= upgradePrice) {
                money -= upgradePrice;
                rackUpgrades[logicalIndex]++; // Increment the upgrade level
                updateMoneyCounter();
                updateUpgradeButtonText(); // Update button text
                updateDebugInfo(); // Update debug info
                refreshSingleRackDisplay(logicalIndex); // This actually updates all graphics on the grid
                updateQuestProgress('upgrade');
            }
        }
    }
});

function getArrangement(arrangement, gridSize) {
    let nextNumber = arrangement.length;
    let oldArrangement = [...arrangement];
    let newArrangement = [];
    const split = gridSize - 1;
    if (gridSize > 1) {
        for (let i = 0; i < split; i++) {
            for (let j = 0; j < split; j++) {
                newArrangement.push(oldArrangement.shift());
            }
            newArrangement.push(nextNumber);
            nextNumber++;
        }
        for (let i = 0; i < gridSize; i++) {
            newArrangement.push(nextNumber);
            nextNumber++;
        }
        arrangement = [...newArrangement];
    }
    return arrangement;
}

function updateDebugInfo() {
    const generalDebugInfo = document.getElementById('general-debug-info');
    const selectedDebugInfo = document.getElementById('selected-debug-info');
    let momentualMaxRacks = Math.pow(gridSize, 2);
    let momentualMaxGPUs = purchasedRacks.reduce((total, purchased, index) => {
        return total + (purchased === 1 ? getMaxGPUs(rackUpgrades[index]) : 0);
    }, 0);

    // Update general game info
    generalDebugInfo.innerHTML = `
        <h4>General Info</h4>
        <p>Grid Size: ${gridSize}x${gridSize}</p>
        <p>Total Racks: ${purchasedRacks.reduce((a, b) => a + b, 0)}/${momentualMaxRacks}</p>
        <p>Total GPUs: ${gpuCounts.reduce((a, b) => a + b, 0)}/${momentualMaxGPUs}</p>
        <p>Zoom Level: ${zoom.toFixed(2)}</p>
        <p>Wait4QuestFadeOut: ${wait4QuestFadeOut}</p>
    `;

    // Update selected rack info
    if (selectedRack) {
        const gridContainer = document.getElementById('grid-container');
        const racks = gridContainer.getElementsByClassName('server-rack');
        const selectedRackIndex = Array.from(racks).indexOf(selectedRack);
        const logicalIndex = arrangement[selectedRackIndex];
        const maxGPUs = getMaxGPUs(rackUpgrades[logicalIndex]); // Base 4 GPUs + 2 per upgrade

        selectedDebugInfo.innerHTML = `
            <h4>Selected Rack Info</h4>
            <p>Rack Number: ${logicalIndex + 1}</p>
            <p>Purchased: ${purchasedRacks[logicalIndex] === 1 ? 'Yes' : 'No'}</p>
            <p>GPUs: ${gpuCounts[logicalIndex]} / ${maxGPUs}</p>
            <p>Upgrade Level: ${rackUpgrades[logicalIndex]}</p>
        `;
    } else {
        selectedDebugInfo.innerHTML = '<h4>Selected Rack Info</h4><p>No rack selected</p>';
    }
}
function deselectRack() {
    if (selectedRack) {
        selectedRack.classList.remove('selected');
        selectedRack = null;
        updateDebugInfo();
        updateGPUButtonState();
        updateServerRackButtonState();
        updateUpgradeButtonState();
        updateUpgradeButtonText();
    }
}

function selectRackByNumber(number) {
    const gridContainer = document.getElementById('grid-container');
    const racks = gridContainer.getElementsByClassName('server-rack');
    const logicalIndex = number - 1;

    // Find the visual index of the rack to select
    const visualIndex = arrangement.indexOf(logicalIndex);

    if (visualIndex !== -1 && visualIndex < racks.length) {
        if (selectedRack === racks[visualIndex]) {
            // If the rack is already selected, deselect it
            selectedRack.classList.remove('selected');
            selectedRack = null;
        } else {
            // Otherwise, select the new rack
            if (selectedRack) {
                selectedRack.classList.remove('selected');
            }
            racks[visualIndex].classList.add('selected');
            selectedRack = racks[visualIndex];
        }
        updateGPUButtonState();
        updateServerRackButtonState();
        updateUpgradeButtonState();
        updateUpgradeButtonText();
        updateDebugInfo();
    }
}

function toggleDebugInfo() {
    const generalDebugInfo = document.getElementById('general-debug-info');
    isDebugVisible = !isDebugVisible;
    generalDebugInfo.style.display = isDebugVisible ? 'block' : 'none';
}

function updateServerRackButtonState() {
    const button = document.getElementById('buy-serverrack');
    const basePrice = rackBasePrice * Math.pow(rackPriceMultiplier, purchasedRacks.reduce((a, b) => a + b, 0));
    const price = roundPrice(basePrice);
    const canAfford = money >= price;
    const racksAvailable = purchasedRacks.reduce((a, b) => a + b, 0) < gridSize * gridSize;

    if (canAfford && racksAvailable) {
        button.disabled = false;
        button.style.color = '#00ff00'; // Default green color
        button.style.borderColor = '#00ff00'; // Default green border
    } else {
        button.disabled = true;
        button.style.color = '#555'; // Disabled gray color
        button.style.borderColor = '#555'; // Disabled gray border
    }
}

function updateUpgradeButtonState() {
    const button = document.getElementById('buy-upgrade');
    const selectedRackIndex = selectedRack ? Array.from(document.getElementsByClassName('server-rack')).indexOf(selectedRack) : -1;
    const logicalIndex = selectedRackIndex !== -1 ? arrangement[selectedRackIndex] : -1;

    if (selectedRack && purchasedRacks[logicalIndex] === 1 && rackUpgrades[logicalIndex] < 5) {
        const upgradePrice = upgradeBasePrice * Math.pow(upgradePriceMultiplier, rackUpgrades[logicalIndex]);
        const canAfford = money >= upgradePrice;

        button.disabled = !canAfford;
        button.style.color = canAfford ? '#00ff00' : '#555';
        button.style.borderColor = canAfford ? '#00ff00' : '#555';
    } else {
        button.disabled = true;
        button.style.color = '#555';
        button.style.borderColor = '#555';
    }

    updateUpgradeButtonText();
}

function navigateRacks(direction) {
    if (!selectedRack) {
        // If no rack is selected, select the first one
        selectRackByNumber(1);
        return;
    }

    const currentIndex = Array.from(document.getElementsByClassName('server-rack')).indexOf(selectedRack);
    let newIndex;

    switch (direction) {
        case 'left':
            newIndex = currentIndex > 0 ? currentIndex - 1 : gridSize * gridSize - 1;
            break;
        case 'right':
            newIndex = (currentIndex + 1) % (gridSize * gridSize);
            break;
        case 'up':
            newIndex = currentIndex - gridSize;
            if (newIndex < 0) newIndex += gridSize * gridSize;
            break;
        case 'down':
            newIndex = (currentIndex + gridSize) % (gridSize * gridSize);
            break;
    }

    const newRack = document.getElementsByClassName('server-rack')[newIndex];
    if (newRack) {
        if (selectedRack) {
            selectedRack.classList.remove('selected');
        }
        newRack.classList.add('selected');
        selectedRack = newRack;
        updateDebugInfo();
        updateGPUButtonState();
        updateUpgradeButtonText();
        updateServerRackButtonState();
        updateUpgradeButtonState();
    }
}

function activateCheat() {
    if (!cheatActivated) {
        savedMoney = money;
        money = Math.pow(99999999999999, 99);
        maxGridSize = 100;
        maxRacks = Math.pow(maxGridSize, 2);
        if (gridSize === startMaxGridSize && purchasedRacks.reduce((a, b) => a + b, 0) === gridSize * gridSize) {
            expandGrid();
        }
        updateMoneyCounter();
        cheatActivated = true;
    } else {
        money = savedMoney;
        maxGridSize = startMaxGridSize;
        maxRacks = Math.pow(maxGridSize, 2);
        updateMoneyCounter();
        cheatActivated = false;
    }
}

document.addEventListener('keydown', (event) => {
    if (isPopupOpen) {
        closePopup();
        return;
    } else if (isStoryOpen) {
        closeStoryPopup();
        showNextStoryPopup();
        return;
    }
    switch (event.key) {
        case 'Escape':
            if (selectedRack) {
                deselectRack();
                updateDebugInfo();
            } else {
                openMenu();
            }
            break;
        case 's':
            document.getElementById('buy-serverrack').click();
            break;
        case 'g':
            document.getElementById('buy-gpu').click();
            break;
        case 'u':
            document.getElementById('buy-upgrade').click();
            break;
        case 'd':
            toggleDebugInfo();
            break;
        case 'x':
            if (viewSwitchActive) {
                const gridContainer = document.getElementById('grid-container');
                gridContainer.style.transform = `rotateX(45deg) rotateZ(45deg) scale(${zoom})`;
                viewSwitchActive = false;
            } else if (!viewSwitchActive) {
                const gridContainer = document.getElementById('grid-container');
                gridContainer.style.transform = `scale(${zoom})`;
                viewSwitchActive = true;
            }
            break;
        case 'm':
            activateCheat(); 
            break;
        case 'ArrowLeft':
            navigateRacks('left');
            break;
        case 'ArrowRight':
            navigateRacks('right');
            break;
        case 'ArrowUp':
            navigateRacks('up');
            break;
        case 'ArrowDown':
            navigateRacks('down');
            break;
        default:
            if (event.key >= '1' && event.key <= '9') {
                selectRackByNumber(parseInt(event.key));
                updateDebugInfo();
            }
            break;
    }
});

function showPopup(title, message) {
    const popup = document.getElementById('custom-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    
    popupTitle.textContent = title;
    popupMessage.innerHTML = message.replace(/\n/g, '<br>'); // Replace newlines with <br> tags
    popup.classList.remove('hidden');
    isPopupOpen = true;

    // Add event listener to close popup when clicking anywhere on it
    popup.addEventListener('click', closePopup);
}

function closePopup() {
    const popup = document.getElementById('custom-popup');
    popup.classList.add('hidden');
    isPopupOpen = false;

    // Remove the event listener
    popup.removeEventListener('click', closePopup);
}

function openPopup(title, content) {
    const popup = document.getElementById('custom-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    
    popupTitle.textContent = title;
    popupMessage.innerHTML = content;
    popup.classList.remove('hidden');
    isPopupOpen = true;
    
    // Add event listener to close popup when clicking anywhere on it
    popup.addEventListener('click', closePopup);
}

function openSettings() {
    setTimeout(() => {
        openPopup('Settings', `Settings 
            Settings for x
            Button
            Settings for y
            Button
        `);
    }, 1);
    console.log("Settings opened");
}

function restartGame() {
    if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
        initializeGame();
    }
}

function openMenu() {
    openPopup('Menu', `Key Binds:
<div style="display: flex; justify-content: center; align-items: flex-start; margin-top: 0px;">
    <div style="text-align: right; margin-right: -25px; line-height: 1.2;">
        S
        G
        U
        D
        M<br>
        &#8592;
        &#8594;
        &#8593;
        &#8595;<br>
        1-9
    </div>
    <div style="text-align: left; margin-right: 0px; line-height: 1.2;">
        -  Buy Server Rack
        -  Buy GPU        
        -  Buy Upgrade
        -  Toggle Debug Info
        -  Test Mode (infinite money)<br>
        -  Navigate Left
        -  Navigate Right
        -  Navigate Up
        -  Navigate Down<br>
        -  Select Rack
    </div>
</div>
<button id="continue-button">Continue</button>

<button id="settings-button">Settings</button>

<button id="restart-button">Restart</button>
    `);
    document.getElementById('continue-button').addEventListener('click', closePopup);
    document.getElementById('settings-button').addEventListener('click', openSettings);
    document.getElementById('restart-button').addEventListener('click', restartGame);
}
function deselectRack() {
    if (selectedRack) {
        selectedRack.classList.remove('selected');
        selectedRack = null;
        updateDebugInfo();
        updateGPUButtonState();
        updateServerRackButtonState();
        updateUpgradeButtonState();
        updateUpgradeButtonText();
    }
}

function showNextStoryPopup() {
    if (storyQueue.length > 0) {
        currentStoryPopup = storyQueue.shift();
        openStoryPopup(currentStoryPopup.title, currentStoryPopup.content, currentStoryPopup.asciiArt);
    }
}

function openStoryPopup(title, content, asciiArt) {
    const storyPopup = document.getElementById('story-popup');
    const storyPopupTitle = document.getElementById('story-title');
    const storyPopupMessage = document.getElementById('story-message');
    
    let convertedContent = content.replace(/\n/g, '<br>');
    storyPopupTitle.textContent = title;
    storyPopupMessage.innerHTML = `
        <div>${convertedContent}</div>
        <pre>
        ${asciiArt}
        </pre>
 `;
    storyPopup.classList.remove('hidden');
    isStoryOpen = true;

    // Add event listener to close popup and open another story when clicking anywhere on it
    storyPopup.addEventListener('click', () => {
        closeStoryPopup();
        showNextStoryPopup();
    });
}

function closeStoryPopup() {
    const storyPopup = document.getElementById('story-popup');
    storyPopup.classList.add('hidden');
    isStoryOpen = false;

    // Remove the event listener
    storyPopup.removeEventListener('click', closeStoryPopup);
}


