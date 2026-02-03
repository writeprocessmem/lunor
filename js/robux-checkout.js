let currentUser = {};
let currentProduct = null;
let generatedKey = null;
let isCooldown = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeCheckout();

    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') lookupUser();
        });
    }
});

function initializeCheckout() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');

    if (!productId) {
        const savedCart = localStorage.getItem('lunorCart');
        if (savedCart) {
            const cart = JSON.parse(savedCart);
            if (cart.length > 0) {
                currentProduct = CONFIG.products.find(p => p.id === cart[0].id);
            }
        }
    } else {
        currentProduct = CONFIG.products.find(p => p.id === productId);
    }

    if (!currentProduct) {
        currentProduct = CONFIG.products[0];
    }

    updateProductDisplay();
}

function updateProductDisplay() {
    if (!currentProduct) return;

    const nameElements = document.querySelectorAll('#productName, #redemptionProductName');
    const priceElement = document.getElementById('productPrice');

    nameElements.forEach(el => {
        if (el) el.textContent = currentProduct.name;
    });

    if (priceElement) {
        priceElement.textContent = currentProduct.robuxPrice || 0;
    }
}

async function lookupUser() {
    const usernameInput = document.getElementById('usernameInput');
    const lookupBtn = document.getElementById('lookupBtn');
    const lookupIcon = document.getElementById('lookupIcon');
    const lookupLoader = document.getElementById('lookupLoader');
    const errorMsg = document.getElementById('errorMsg');
    const errorText = document.getElementById('errorText');

    const username = usernameInput.value.trim();
    if (!username) return;

    lookupBtn.disabled = true;
    lookupIcon.classList.add('hidden');
    lookupLoader.classList.remove('hidden');
    errorMsg.classList.remove('visible');

    try {
        let userData = null;
        let avatarUrl = "https://tr.rbxcdn.com/5339df2370ae26615b14421d017a4216/150/150/AvatarHeadshot/Png";

        try {
            const corsLolUrl = 'https://cors.lol/' + encodeURIComponent('https://users.roblox.com/v1/usernames/users');

            const response = await Promise.race([
                fetch(corsLolUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usernames: [username],
                        excludeBannedUsers: true
                    })
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
            ]);

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    userData = data.data[0];
                }
            }
        } catch (e) { }

        if (!userData) {
            try {
                const allOriginsUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://users.roblox.com/v1/usernames/users');

                const response = await Promise.race([
                    fetch(allOriginsUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            usernames: [username],
                            excludeBannedUsers: true
                        })
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
                ]);

                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.length > 0) {
                        userData = data.data[0];
                    }
                }
            } catch (e) { }
        }

        if (!userData) {
            throw new Error("User not found");
        }

        try {
            const avatarApiUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userData.id}&size=150x150&format=Png&isCircular=false`;
            const corsAvatarUrl = 'https://cors.lol/' + encodeURIComponent(avatarApiUrl);

            const avatarRes = await Promise.race([
                fetch(corsAvatarUrl),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);

            if (avatarRes.ok) {
                const avatarData = await avatarRes.json();
                if (avatarData.data && avatarData.data.length > 0 && avatarData.data[0].imageUrl) {
                    avatarUrl = avatarData.data[0].imageUrl;
                }
            }
        } catch (e) { }

        currentUser = {
            id: userData.id,
            username: userData.name,
            displayName: userData.displayName || userData.name,
            avatarUrl: avatarUrl
        };

        document.getElementById('modalAvatar').src = avatarUrl;
        document.getElementById('modalDisplayName').textContent = currentUser.displayName;
        document.getElementById('modalUsername').textContent = '@' + currentUser.username;

        openModal();

    } catch (err) {
        errorText.textContent = "User not found. Please check the username.";
        errorMsg.classList.add('visible');
    } finally {
        lookupBtn.disabled = false;
        lookupIcon.classList.remove('hidden');
        lookupLoader.classList.add('hidden');
    }
}

function openModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
}

function confirmAccount() {
    closeModal();

    document.getElementById('checkoutAvatar').src = currentUser.avatarUrl;
    document.getElementById('checkoutUsername').textContent =
        currentUser.displayName + ' (@' + currentUser.username + ')';

    document.getElementById('repurchaseInfo').style.display = 'block';

    showStep('step-checkout');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function showStep(stepId) {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));

    const targetStep = document.getElementById(stepId);
    if (targetStep) {
        targetStep.classList.add('active');
    }
}

function openGamepass() {
    if (!currentProduct || !currentProduct.robuxGamepassLink) {
        alert('Gamepass link not configured. Please contact support.');
        return;
    }

    window.open(currentProduct.robuxGamepassLink, '_blank');
}

async function verifyPurchase() {
    if (isCooldown) return;

    const verifyBtn = document.getElementById('verifyBtn');
    const verifyBtnText = document.getElementById('verifyBtnText');
    const privateWarning = document.getElementById('privateInventoryWarning');

    isCooldown = true;
    verifyBtnText.innerHTML = '<div class="loader loader-white" style="display: inline-block; width: 16px; height: 16px;"></div> Checking...';
    verifyBtn.disabled = true;
    privateWarning.classList.add('hidden');

    try {
        const ownsGamepass = await checkGamepassOwnership();

        if (ownsGamepass === 'private') {
            privateWarning.classList.remove('hidden');
            resetVerifyButton();
            return;
        }

        if (ownsGamepass) {
            generatedKey = generateKey();
            document.getElementById('purchaseKey').textContent = generatedKey;
            document.getElementById('redemptionKey').textContent = generatedKey;
            showStep('step-complete');
        } else {
            alert("We couldn't verify your purchase. Please make sure you've bought the gamepass and try again.");
            resetVerifyButton();
        }

    } catch (err) {
        alert('An error occurred while verifying. Please try again.');
        resetVerifyButton();
    }
}

function resetVerifyButton() {
    const verifyBtn = document.getElementById('verifyBtn');
    const verifyBtnText = document.getElementById('verifyBtnText');

    verifyBtnText.innerHTML = "I've Bought It";
    verifyBtn.disabled = false;
    isCooldown = false;
}

async function checkGamepassOwnership() {
    if (!currentUser.id || !currentProduct.robuxGamepassId) {
        return false;
    }

    const gamepassId = currentProduct.robuxGamepassId;
    const userId = currentUser.id;

    const inventoryApi = `https://inventory.roblox.com/v1/users/${userId}/items/GamePass/${gamepassId}`;
    const corsInventoryUrl = 'https://cors.lol/' + encodeURIComponent(inventoryApi);

    try {
        const response = await Promise.race([
            fetch(corsInventoryUrl),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
        ]);

        if (response.status === 403) {
            return 'private';
        }

        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                return true;
            }
            return false;
        }
    } catch (e) { }

    return false;
}

function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    const keyParts = [];

    for (let i = 0; i < segments; i++) {
        let segment = '';
        for (let j = 0; j < segmentLength; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        keyParts.push(segment);
    }

    return keyParts.join('-');
}

function goToRedemption() {
    showStep('step-redemption');
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function downloadKey() {
    if (!generatedKey) return;

    const productName = currentProduct ? currentProduct.name.replace(/\s+/g, '_') : 'Lunor';
    const filename = `${productName}_Key.txt`;

    const content = `
=================================
        ${currentProduct ? currentProduct.name : 'Lunor'} License Key
=================================

Your Key: ${generatedKey}

Purchased by: ${currentUser.displayName} (@${currentUser.username})
Date: ${new Date().toLocaleDateString()}

Thank you for your purchase!

=================================
        DO NOT SHARE THIS KEY
=================================
`.trim();

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function goBackToStart() {
    window.location.href = 'products.html';
}
