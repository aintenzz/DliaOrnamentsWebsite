// ✅ shop.js — Updated with MAX 20 LIMIT
window.addEventListener('DOMContentLoaded', () => {
  // Scroll reset
  window.scrollTo(0, 0);
  setTimeout(() => window.scrollTo(0, 0), 50);

  const loader = document.getElementById('loader');
  const shopContent = document.getElementById('shop-content');

  // === Charm grid mapping ===
  const grids = {
    gold: document.querySelector('#gold-grid .charm-grid'),
    silver: document.querySelector('#silver-grid .charm-grid'),
    pink: document.querySelector('#pink-grid .charm-grid'),
    letter: document.querySelector('#letter-grid .charm-grid'),
    animal: document.querySelector('#animal-grid .charm-grid'),
    floral: document.querySelector('#floral-grid .charm-grid'),
    gem: document.querySelector('#gem-grid .charm-grid'),
    quotes: document.querySelector('#quotes-grid .charm-grid'),
    silvergold: document.querySelector('#silvergold-grid .charm-grid'),
    silverseries: document.querySelector('#silverseries-grid .charm-grid'),
    silverbasic: document.querySelector('#silverbasic-grid .charm-grid'),
    silverfood: document.querySelector('#silverfood-grid .charm-grid')
  };

  const filterDropdown = document.getElementById('series-filter');
  const charmSections = document.querySelectorAll('.charm-section');

  // === Bracelet info ===
  const braceletColor = localStorage.getItem('braceletColor') || 'Gold';
  const braceletSize = localStorage.getItem('braceletSize') || 'Medium';
  // We keep this for display, but the HARD LIMIT is now 20
  const charmLimitDisplay = { Small: 16, Medium: 17, Large: 18, 'Extra Large': 19, 'Extra Extra Large': 20 }[braceletSize];
  const HARD_LIMIT = 20; // 🛑 The absolute maximum for XXL

  // === Size Guide Modal ===
  const sizeGuideBtn = document.getElementById('size-guide-btn');
  const sizeGuideModal = document.getElementById('size-guide-modal');
  const closeModal = document.querySelector('.close-modal');

  if (sizeGuideBtn && sizeGuideModal && closeModal) {
    sizeGuideBtn.addEventListener('click', () => sizeGuideModal.classList.add('active'));
    closeModal.addEventListener('click', () => sizeGuideModal.classList.remove('active'));
    sizeGuideModal.addEventListener('click', e => {
      if (e.target === sizeGuideModal) sizeGuideModal.classList.remove('active');
    });
  }

  // === Summary display ===
  const updateSummary = (count = 0, total = 0) => {
    const type = document.getElementById('bracelet-type');
    if (!type) return;
    document.getElementById('bracelet-type').textContent = braceletColor;
    document.getElementById('bracelet-size').textContent = braceletSize;
    document.getElementById('max-charms').textContent = charmLimitDisplay; 
    document.getElementById('selected-count').textContent = count;
    document.getElementById('total-price').textContent = total.toFixed(2);
    
    // Mobile summary updates
    const mobileCount = document.getElementById('mobile-count');
    const mobilePrice = document.getElementById('mobile-price');
    if (mobileCount && mobilePrice) {
      mobileCount.textContent = `${count} / ${charmLimitDisplay} charms`; // Just visual
      mobilePrice.textContent = total.toFixed(2);
    }
  };
  

  // === Filter Dropdown ===
  if (filterDropdown)
    filterDropdown.addEventListener('change', e => {
      const selectedId = e.target.value;
      charmSections.forEach(section => {
        const show = selectedId === 'all' || section.id === selectedId;
        section.style.display = show ? 'block' : 'none';
        if (window.gsap) gsap.to(section, { opacity: show ? 1 : 0, duration: 0.3 });
      });
    });

  // === Cart Logic ===
  const cartBtn = document.getElementById('cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCount = document.querySelector('#cart-btn .cart-count');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  const saveCart = () => localStorage.setItem('cartItems', JSON.stringify(cartItems));

  function animateCartButton() {
    cartBtn.classList.add('animate');
    setTimeout(() => cartBtn.classList.remove('animate'), 400);
  }

  // Helper to count total items currently in cart
  function getTotalItems() {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0, totalQty = 0;

    cartItems.forEach((item, idx) => {
      total += item.price * item.quantity;
      totalQty += item.quantity;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.img}" alt="charm">
        <div class="item-name">${item.name}</div>
        <div class="item-quantity">
          <button class="qty-btn minus" data-idx="${idx}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn plus" data-idx="${idx}">+</button>
        </div>
        <span class="item-price">₱${(item.price * item.quantity).toFixed(2)}</span>
        <button class="remove-btn" data-idx="${idx}">&times;</button>
      `;
      cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = `Total: ₱${total.toFixed(2)}`;
    cartCount.textContent = totalQty;
    updateSummary(totalQty, total);
  }

  // Quantity & remove actions
  cartItemsContainer.addEventListener('click', e => {
    const idx = e.target.getAttribute('data-idx');
    if (idx === null) return;

    if (e.target.classList.contains('plus')) {
      // 🛑 LIMIT CHECK FOR PLUS BUTTON
      if (getTotalItems() >= HARD_LIMIT) {
        alert(`You have reached the maximum limit of ${HARD_LIMIT} links/charms (Size XXL).`);
        return;
      }
      cartItems[idx].quantity++;
    } 
    else if (e.target.classList.contains('minus')) {
      cartItems[idx].quantity--;
      if (cartItems[idx].quantity <= 0) cartItems.splice(idx, 1);
    } 
    else if (e.target.classList.contains('remove-btn')) {
      cartItems.splice(idx, 1);
    }
    updateCartUI();
    saveCart();
  });

  cartBtn.addEventListener('click', () => {
    cartDrawer.classList.toggle('open');
    cartOverlay.classList.toggle('active');
  });
  cartOverlay.addEventListener('click', () => {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
  });
  
  checkoutBtn.addEventListener('click', () => {
    saveCart();
    const totalCharms = getTotalItems();

    if (totalCharms < 5) {
      alert("Please select at least 5 charms/links before proceeding to checkout.");
      return;
    }
    window.location.href = 'preview.html';
  });

  // === 🪙 Plain Links Section Logic ===
  const plainLinks = [
    { name: 'Silver Link', price: 15, img: 'assets/home/silver-link.png' },
    { name: 'Gold Link', price: 25, img: 'assets/home/gold-link.png' },
    { name: 'Mixed Link', price: 30, img: 'assets/home/mixed-link.png' }
  ];

  const plainLinksContainer = document.querySelector('#plain-links-grid');
  if (plainLinksContainer) {
    plainLinks.forEach(link => {
      const card = document.createElement('div');
      card.className = 'charm-card';
      card.dataset.name = link.name;
      card.dataset.price = link.price;
      card.dataset.img = link.img;
      card.innerHTML = `
        <img src="${link.img}" alt="${link.name}">
        <div class="charm-info">
          <h3>${link.name}</h3>
          <p class="price">₱${link.price}</p>
        </div>
      `;
      // Add to cart on click
      card.addEventListener('click', () => {
        // 🛑 LIMIT CHECK FOR PLAIN LINKS
        if (getTotalItems() >= HARD_LIMIT) {
          alert(`Maximum limit reached! You can only add up to ${HARD_LIMIT} Links/Charms (Size XXL).`);
          return;
        }

        const existing = cartItems.find(c => c.name === link.name && c.img === link.img);
        if (existing) existing.quantity++;
        else cartItems.push({ ...link, quantity: 1 });
        updateCartUI();
        saveCart();
        animateCartButton();
      });
      plainLinksContainer.appendChild(card);
    });
  }

  // === Fetch & Render Charms ===
  fetch('./scripts/charms.csv')
    .then(r => r.text())
    .then(csv => {
      const rows = csv.split('\n').slice(1);
      rows.forEach((row, i) => {
        if (!row.trim()) return;
        const [name, price, image] = row.split(',').map(v => v?.trim());
        const charm = document.createElement('div');
        charm.className = 'charm-card';
        let imgPath = '';
        let grid = null;

        // (Grid mapping logic...)
        if (i <= 67) { imgPath = `assets/charms/gold charms p65/${image}`; grid = grids.gold; }
        else if (i <= 77) { imgPath = `assets/charms/silver with black charms/${image}`; grid = grids.silver; }
        else if (i <= 92) { imgPath = `assets/charms/pink series charms/${image}`; grid = grids.pink; }
        else if (i <= 112) { imgPath = `assets/charms/gold letters p65/${image}`; grid = grids.letter; }
        else if (i <= 133) { imgPath = `assets/charms/animal series charms png p65/${image}`; grid = grids.animal; }
        else if (i <= 150) { imgPath = `assets/charms/gold and silver floral series charms p65/${image}`; grid = grids.floral; }
        else if (i <= 171) { imgPath = `assets/charms/gold and silver gem series charms p65/${image}`; grid = grids.gem; }
        else if (i <= 233) { imgPath = `assets/charms/gold basic design charms png p40/${image}`; grid = grids.goldbasic; }
        else if (i <= 262) { imgPath = `assets/charms/gold dangling png p60/${image}`; grid = grids.golddangling; }
        else if (i <= 282) { imgPath = `assets/charms/gold with diamond series charms png p50/${image}`; grid = grids.golddiamond; }
        else if (i <= 301) { imgPath = `assets/charms/quotes series charms png p55/${image}`; grid = grids.quotes; }
        else if (i <= 317) { imgPath = `assets/charms/silver with a mix of gold series charms png p65/${image}`; grid = grids.silvergold; }
        else if (i <= 335) { imgPath = `assets/charms/silver series charms png p65/${image}`; grid = grids.silverseries; }
        else if (i <= 353) { imgPath = `assets/charms/silver basic design series charms png p40/${image}`; grid = grids.silverbasic; }
        else if (i <= 382) { imgPath = `assets/charms/silver food series charms png p70/${image}`; grid = grids.silverfood; }

        charm.innerHTML = `
          <img src="${imgPath}" alt="${name}">
          <div class="charm-info">
            <h3>${name}</h3>
            <p class="price">₱${price}</p>
          </div>
        `;

        charm.addEventListener('click', () => {
          // 🛑 LIMIT CHECK FOR CHARMS
          if (getTotalItems() >= HARD_LIMIT) {
            alert(`Maximum limit reached! You can only add up to ${HARD_LIMIT} items (Size XXL).`);
            return;
          }

          const p = parseFloat(price) || 0;
          const existing = cartItems.find(c => c.name === name && c.img === imgPath);
          if (existing) existing.quantity++;
          else cartItems.push({ name, price: p, img: imgPath, quantity: 1 });
          updateCartUI();
          saveCart();
          animateCartButton();
        });

        if (grid) grid.appendChild(charm);
      });

      // Loader animation
      if (window.gsap) {
        gsap.to(loader, { opacity: 0, duration: 0.5, onComplete: () => loader.remove() });
        gsap.to(shopContent, { opacity: 1, duration: 0.7 });
      } else {
        loader.remove();
        shopContent.style.opacity = 1;
      }
      updateCartUI();
    })
    .catch(err => {
      console.error('❌ CSV Load Error:', err);
      loader.innerHTML = '<span class="loader-text">Failed to load charms.</span>';
    });
});