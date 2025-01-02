let moves = [];
let draggedDisk = null;
let lastDifficulty = "hard";
let level = getLevelFromURL() || 1; // Get level from URL, default to 3 if not found

// Setup the game based on difficulty
function setupGame(difficulty) {
  lastDifficulty = difficulty;
  const towers = document.querySelectorAll(".tower");
  clearTowers(towers);

  if (difficulty === "easy") {
    setupHalfCompleted(level);
  } else {
    setupCompleteGame(level);
  }

  displayMessage(`Level ${level}: Game started!`);
  enableDragAndDrop();
}

// Initialize the game with a half-completed setup
function setupHalfCompleted(level) {
  let diskCount = 3 + level - 1; // Total number of disks
  let sourceTower = document.getElementById("tower-1");
  let targetTower = document.getElementById("tower-3");

  let disksToMove = Math.floor(diskCount / 2); // Half of the disks to be moved to tower 3

  // Clear the towers before setup to ensure clean state
  clearTowers([sourceTower, targetTower]);

  // Move the larger disks (from disksToMove+1 to diskCount) to the source tower
  for (let i = diskCount; i >= disksToMove + 1; i--) {
    let disk = createDisk(i); // Larger disks
    sourceTower.appendChild(disk); // Place them in source tower
  }

  // Move the smaller disks (from 1 to disksToMove) to the target tower
  for (let i = disksToMove; i > 0; i--) {
    let disk = createDisk(i); // Smaller disks
    targetTower.appendChild(disk); // Place them in target tower
  }

  // Ensure proper stacking of the disks, larger disks at the bottom
  stackDisks(sourceTower);
  stackDisks(targetTower);
}

// Setup the game from scratch (complete setup)
function setupCompleteGame(level) {
  let diskCount = 3 + level - 1;
  let tower = document.getElementById("tower-1");

  for (let i = diskCount; i >= 1; i--) {
    let disk = createDisk(i);
    tower.appendChild(disk);
  }

  stackDisks(tower);
}

// Create a disk element
function createDisk(size) {
  let disk = document.createElement("div");
  disk.classList.add("disk", `disk${size}`);
  disk.draggable = true;
  disk.setAttribute("data-size", size);
  return disk;
}

// Clear all towers
function clearTowers(towers) {
  towers.forEach((tower) => {
    while (tower.firstChild) {
      tower.removeChild(tower.firstChild);
    }
  });
}

// Enable drag-and-drop functionality
function enableDragAndDrop() {
  const disks = document.querySelectorAll(".disk");
  const towers = document.querySelectorAll(".tower");

  disks.forEach((disk) => {
    disk.addEventListener("dragstart", handleDragStart);
  });

  towers.forEach((tower) => {
    tower.addEventListener("dragover", handleDragOver);
    tower.addEventListener("drop", handleDrop);
  });
}

function handleDragStart(e) {
  const tower = e.target.parentElement;
  const topDisk = tower.lastElementChild;

  if (e.target === topDisk) {
    draggedDisk = e.target;
  }
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault(); // Important to prevent default handling
  const targetTower = e.target.closest(".tower"); // Ensure we're targeting the tower

  if (targetTower && draggedDisk) {
    const topDiskInTargetTower = targetTower.lastElementChild;
    const draggedDiskSize = parseInt(draggedDisk.getAttribute("data-size"));

    // Valid move: No disk in target tower or dragged disk is smaller than the top disk
    if (
      !topDiskInTargetTower ||
      draggedDiskSize < parseInt(topDiskInTargetTower.getAttribute("data-size"))
    ) {
      // Record the move
      moves.push({
        from: draggedDisk.parentElement,
        to: targetTower,
        disk: draggedDisk,
      });

      targetTower.appendChild(draggedDisk); // Move the disk to the new tower
      stackDisks(targetTower); // Arrange disks correctly in the new tower
      stackDisks(draggedDisk.parentElement); // Re-stack the source tower as well
      checkForWin();
    } else {
      displayMessage(
        "Invalid move. A larger disk cannot be placed on top of a smaller disk."
      );
    }
  }
  draggedDisk = null;
}

// Arrange disks within a tower
function stackDisks(tower) {
  const disks = tower.querySelectorAll(".disk");
  disks.forEach((disk, index) => {
    disk.style.bottom = `${index * 25}px`;
  });
}

// Redo the last move (undo move logic)
function redoMove() {
  if (moves.length > 0) {
    let lastMove = moves.pop();
    let { from, to, disk } = lastMove;

    from.appendChild(disk); // Move the disk back to the original tower
    stackDisks(from); // Re-stack disks in the original tower
    stackDisks(to); // Re-stack disks in the target tower
    displayMessage("Last move undone.");
  } else {
    displayMessage("No moves to undo.");
  }
}

// Restart the game
function restartGame() {
  moves = []; // Clear move history
  setupGame(lastDifficulty); // Restart the game with the current difficulty
}

// Display a message to the user
function displayMessage(message) {
  document.getElementById("message").textContent = message;
}

// Check if the player has won
function checkForWin() {
  const tower3 = document.getElementById("tower-3");
  const diskCount = 3 + level - 1;

  if (tower3.childElementCount === diskCount) {
    displayMessage("You won!");
    level += 1;
    setTimeout(() => {
      setupGame(lastDifficulty); // Move to next level
    }, 1000);
  }
}

// Get the level from URL
function getLevelFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has("level") ? parseInt(urlParams.get("level")) : null;
}

// Add event listeners to buttons
document.getElementById("restart").addEventListener("click", restartGame);
document.getElementById("redo").addEventListener("click", redoMove);
