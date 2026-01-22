// ----------------------
// DOM ELEMENTS
// ----------------------
const xpEl = document.getElementById("xp");
const shopContainer = document.getElementById("shop-items");
const unequipBtn = document.getElementById("unequip-btn");

// ----------------------
// RENDER CHARACTER
// ----------------------
function renderCharacter() {
    // Equipped item
    const itemImg = document.getElementById("item");

    if (user.equippedItem) {
        itemImg.src = `assets/items/${user.equippedItem}.png`;
        itemImg.style.display = "block";
    } else {
        itemImg.style.display = "none";
    }

    // Accessories (stackable)
    accessories.forEach(acc => {
        const img = document.getElementById(acc.name);

        if (user.unlockedAccessories.includes(acc.name)) {
            img.src = `assets/accessories/${acc.name}.png`;
            img.style.display = "block";
        } else {
            img.style.display = "none";
        }
    });
}

// ----------------------
// SHOP LOGIC
// ----------------------
function buyItem(name) {
    const item = shopItems[name];

    if (!item) return;
    if (user.ownedItems.includes(name)) return;
    if (user.xp < item.price) return;

    user.xp -= item.price;
    user.ownedItems.push(name);

    saveData();
    updateUI();
}

function equipItem(name) {
    if (!user.ownedItems.includes(name)) return;

    user.equippedItem = name;
    saveData();
    updateUI();
}

function unequipItem() {
    user.equippedItem = null;
    saveData();
    updateUI();
}

// ----------------------
// RENDER SHOP
// ----------------------
function renderShop() {
    shopContainer.innerHTML = "";

    for (const name in shopItems) {
        const item = shopItems[name];

        const card = document.createElement("div");
        card.className = "shop-item";

        const img = document.createElement("img");
        img.src = `assets/items/${name}.png`;

        const label = document.createElement("p");
        label.textContent = `${name} — ${item.price} XP`;

        const button = document.createElement("button");

        if (!user.ownedItems.includes(name)) {
            button.textContent = "Buy";
            button.disabled = user.xp < item.price;
            button.onclick = () => buyItem(name);
        } else if (user.equippedItem === name) {
            button.textContent = "Equipped";
            button.disabled = true;
        } else {
            button.textContent = "Equip";
            button.onclick = () => equipItem(name);
        }

        card.appendChild(img);
        card.appendChild(label);
        card.appendChild(button);
        shopContainer.appendChild(card);
    }
}

// ----------------------
// UI UPDATE
// ----------------------
function updateUI() {
    xpEl.textContent = user.xp;
    renderCharacter();
    renderShop();

    if (unequipBtn) {
        unequipBtn.disabled = !user.equippedItem;
    }
}

// ----------------------
// INIT
// ----------------------
if (unequipBtn) {
    unequipBtn.onclick = unequipItem;
}

updateUI();