/* preview.js — FINAL UPDATED VERSION (with total + spacing fix)
   ✨ Features:
   - Reads cartItems, braceletColor, braceletSize from localStorage.
   - Displays true total even if more than 20 charms.
   - Shows max 20 visible slots (for layout clarity).
   - Adjusts bracelet spacing only when >20 charms.
*/

document.addEventListener('DOMContentLoaded', () => {
  // === DOM references ===
  const braceletEl = document.getElementById('bracelet');
  const charmsListEl = document.getElementById('charms-list');
  const infoSize = document.getElementById('info-size');
  const infoSlots = document.getElementById('info-slots');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const saveDesignBtn = document.getElementById('save-design-btn');

  // === Bracelet setup ===
  let rawColor = (localStorage.getItem('braceletColor') || 'silver').toLowerCase();
  if (/(mix|mixed|silver-gold|two-tone)/.test(rawColor)) rawColor = 'mixed';
  else if (rawColor.includes('gold')) rawColor = 'gold';
  else rawColor = 'silver';
  const braceletColor = rawColor;

  const plainLinks = {
    silver: 'assets/links/silver-link.png',
    gold: 'assets/links/gold-link.png',
    mixed: 'assets/links/mixed-link.png'
  };
  const plainSrc = plainLinks[braceletColor] || plainLinks.silver;

  // === Charms from cart ===
  const cartItemsRaw = JSON.parse(localStorage.getItem('cartItems') || '[]');

  // --- 🧮 Auto detect bracelet size based on total selected items ---
  const totalSelected = cartItemsRaw.reduce((sum, item) => sum + (item.quantity || 0), 0);

  let detectedSize = '';
  if (totalSelected < 16 && totalSelected > 0) detectedSize = 'Below Small';
  else if (totalSelected === 16) detectedSize = 'Small';
  else if (totalSelected === 17) detectedSize = 'Medium';
  else if (totalSelected === 18) detectedSize = 'Large';
  else if (totalSelected === 19) detectedSize = 'Extra Large';
  else if (totalSelected === 20) detectedSize = 'Extra Extra Large';
  else if (totalSelected > 20) detectedSize = 'Above Extra Extra Large';
  else detectedSize = 'None';

  // store in localStorage for other pages
  localStorage.setItem('detectedBraceletSize', detectedSize);
  localStorage.setItem('detectedBraceletCount', totalSelected);

  // === Determine slot count dynamically (show max 20) ===
  let totalSlots = totalSelected;
  if (totalSlots <= 0) totalSlots = 8;   // fallback if empty

  // === Charms setup ===
  const originalCharms = cartItemsRaw.map(c => ({
    name: c.name,
    img: c.img,
    qty: c.quantity,
    price: c.price
  }));
  let charmsAvailable = JSON.parse(JSON.stringify(originalCharms));

  // === Load saved bracelet if exists ===
  let slots = new Array(totalSlots).fill(0).map(() => ({ type: 'link', src: plainSrc }));
  const saved = JSON.parse(localStorage.getItem('braceletPreview') || 'null');
  if (saved && saved.slots && saved.color === braceletColor) {
    slots = saved.slots.slice(0, totalSlots);
  }

  // === Update left panel info ===
  infoSize.textContent = `${detectedSize} (${totalSelected} items)`;
  infoSlots.textContent = totalSelected; // <-- show TRUE count, not capped

  // === Sidebar rendering ===
  function renderCharmsSidebar() {
    charmsListEl.innerHTML = '';
    if (!charmsAvailable.length) {
      charmsListEl.innerHTML = '<p style="opacity:.8">No charms in cart. Add charms first.</p>';
      return;
    }
    charmsAvailable.forEach((c, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'charm-thumb';
      thumb.dataset.idx = i;
      thumb.draggable = true;
      thumb.innerHTML = `
        <img src="${c.img}" alt="${escapeHtml(c.name)}">
        <div class="meta"><strong>${escapeHtml(c.name)}</strong><small>×${c.qty}</small></div>
      `;
      if (c.qty <= 0) {
        thumb.style.opacity = '0.4';
        thumb.draggable = false;
        thumb.style.pointerEvents = 'none';
      }
      thumb.addEventListener('dragstart', ev => {
        ev.dataTransfer.setData('application/json', JSON.stringify({ from: 'sidebar', idx: i }));
        const img = new Image();
        img.src = c.img;
        ev.dataTransfer.setDragImage(img, 24, 24);
      });
      thumb.addEventListener('click', () => {
        const emptyIndex = slots.findIndex(s => s.type === 'link');
        if (emptyIndex === -1) return alert('Bracelet is full (max 20 shown).');
        placeCharmAt(i, emptyIndex);
      });
      charmsListEl.appendChild(thumb);
    });
  }

  // === Bracelet rendering ===
  function renderBracelet() {
    braceletEl.innerHTML = '';
    slots.forEach((s, idx) => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.index = idx;
      slot.draggable = true;
      slot.tabIndex = 0;

      const img = document.createElement('img');
      img.src = s.src;
      img.alt = s.name || (s.type === 'link' ? 'plain link' : 'charm');
      slot.appendChild(img);

      slot.addEventListener('dragstart', ev => {
        ev.dataTransfer.setData('application/json', JSON.stringify({ from: 'bracelet', index: idx }));
      });
      slot.addEventListener('dragover', ev => ev.preventDefault());
      slot.addEventListener('drop', ev => {
        ev.preventDefault();
        let d;
        try { d = JSON.parse(ev.dataTransfer.getData('application/json')); } catch { return; }
        if (!d) return;
        if (d.from === 'sidebar') placeCharmAt(d.idx, idx);
        else if (d.from === 'bracelet') swapSlots(d.index, idx);
      });

      slot.addEventListener('dblclick', () => {
        const s = slots[idx];
        if (s.type === 'charm' && s.charmKey !== undefined) {
          charmsAvailable[s.charmKey].qty++;
          slots[idx] = { type: 'link', src: plainSrc };
          renderCharmsSidebar();
          renderBracelet();
          saveState();
        }
      });

      braceletEl.appendChild(slot);
    });
  }

  // === Core logic ===
  function placeCharmAt(charmIdx, slotIdx) {
    const charm = charmsAvailable[charmIdx];
    if (!charm || charm.qty <= 0) return;
    slots[slotIdx] = { type: 'charm', src: charm.img, name: charm.name, charmKey: charmIdx };
    charm.qty--;
    renderCharmsSidebar();
    renderBracelet();
    saveState();
  }

  function swapSlots(a, b) {
    if (a === b) return;
    [slots[a], slots[b]] = [slots[b], slots[a]];
    renderBracelet();
    saveState();
  }

  function resetToPlain() {
    charmsAvailable = JSON.parse(JSON.stringify(originalCharms));
    slots = new Array(totalSlots).fill(0).map(() => ({ type: 'link', src: plainSrc }));
    localStorage.removeItem('braceletPreview');
    localStorage.removeItem('braceletPreviewImage');
    renderCharmsSidebar();
    renderBracelet();
  }

  // === Save / Load ===
  function saveState() {
    localStorage.setItem('braceletPreview', JSON.stringify({
      color: braceletColor, size: detectedSize, slots
    }));
  }

  // === Export PNG ===
  async function exportAsImage() {
    const canvas = document.getElementById('export-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = Math.max(800, totalSlots * 80);
    canvas.height = 220;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🧩 Adjust spacing only if >20 charms
    let slotW = 80;
    let overlap = totalSelected > 20 ? 26 : 22;

    const totalWidth = slotW + (totalSlots - 1) * (slotW - overlap);
    let startX = (canvas.width - totalWidth) / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      await drawImageToCanvas(ctx, s.src, startX, centerY - 36, 72, 72);
      startX += (slotW - overlap);
    }

    const labelText = `D'lia Ornaments PH — ${detectedSize}, ${totalSelected} Links/Charms`;

    ctx.font = 'bold 14px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labelPadding = 22;
    const textWidth = ctx.measureText(labelText).width;
    const labelWidth = textWidth + labelPadding * 2;
    const labelHeight = 30;
    const labelX = (canvas.width - labelWidth) / 2;
    const labelY = canvas.height - 40;

    ctx.fillStyle = '#2b0f0f';
    ctx.globalAlpha = 0.85;
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#d4af37';
    ctx.fillText(labelText, canvas.width / 2, canvas.height - 20);

    const url = canvas.toDataURL('image/png');
    localStorage.setItem('braceletPreviewImage', url);

    const a = document.createElement('a');
    a.href = url;
    a.download = `dlia-bracelet-${braceletColor}-${detectedSize}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function drawImageToCanvas(ctx, src, x, y, w, h) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, x, y, w, h); resolve(); };
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // === Event bindings ===
  saveBtn.addEventListener('click', exportAsImage);
  resetBtn.addEventListener('click', () => { if (confirm('Reset preview?')) resetToPlain(); });
  saveDesignBtn.addEventListener('click', () => {
    const design = { color: braceletColor, size: detectedSize, slots };
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dlia-design-${braceletColor}-${detectedSize}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // === Initialize ===
  renderCharmsSidebar();
  renderBracelet();

  const braceletWrap = document.querySelector('.bracelet-wrap');
  if (braceletWrap) {
    if (totalSelected <= 10) {
      // Center the bracelet visually
      braceletWrap.style.justifyContent = 'center';
    } else {
    // Allow scrolling for larger bracelets
      braceletWrap.style.justifyContent = 'flex-start';
      setTimeout(() => {
        braceletWrap.scrollLeft = 0;
      }, 200);
    }
  }
});
