document.addEventListener("DOMContentLoaded", () => {
  const info = JSON.parse(localStorage.getItem("checkoutInfo") || "{}");
  document.getElementById("contact-email").textContent = info.email || "your@email.com";
  document.getElementById("shipping-address").textContent =
    `${info.address || ""}, ${info.postal || ""} ${info.city || ""}, ${info.region || ""}, ${info.country || ""}`;

  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const orderItemsEl = document.getElementById("order-items");
  const subtotalEl = document.getElementById("subtotal");
  const shippingFeeEl = document.getElementById("shipping-fee");
  const totalEl = document.getElementById("total");

  const braceletColor = (localStorage.getItem("braceletColor") || "silver").toLowerCase();
  const braceletSize = localStorage.getItem("braceletSize") || "Medium";
  const shippingFee = localStorage.getItem("shippingFee") || "₱0.00";

  const prices = {
    silver: { Small: 240, Medium: 255, Large: 270, "Extra Large": 285, "Extra Extra Large": 300 },
    gold: { Small: 400, Medium: 425, Large: 450, "Extra Large": 475, "Extra Extra Large": 500 },
    mixed: { Small: 480, Medium: 510, Large: 540, "Extra Large": 570, "Extra Extra Large": 600 },
  };

  let key = "silver";
  if (braceletColor.includes("gold") && !braceletColor.includes("mixed")) key = "gold";
  else if (braceletColor.includes("mixed")) key = "mixed";

  const braceletPrice = prices[key]?.[braceletSize] || 0;

  function renderSummary() {
    let subtotal = 0;
    orderItemsEl.innerHTML = "";

    if (localStorage.getItem("braceletColor")) {
      subtotal += braceletPrice;

    // Bracelet
      const braceletDiv = document.createElement("div");
      braceletDiv.className = "order-item";
      braceletDiv.innerHTML = `
        <img src="assets/bracelets/${key}.png">
        <div class="order-name">${braceletColor.charAt(0).toUpperCase() + braceletColor.slice(1)} Bracelet (${braceletSize})</div>
        <div class="order-qty">×1</div>
        <div class="order-price">₱${braceletPrice.toFixed(2)}</div>`;
      orderItemsEl.appendChild(braceletDiv);
    }

    // Charms
    cart.forEach(item => {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      const div = document.createElement("div");
      div.className = "order-item";
      div.innerHTML = `
        <img src="${item.img}">
        <div class="order-name">${item.name}</div>
        <div class="order-qty">×${item.quantity}</div>
        <div class="order-price">₱${lineTotal.toFixed(2)}</div>`;
      orderItemsEl.appendChild(div);
    });

    subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
    shippingFeeEl.textContent = "May Vary";

    const shipCost = shippingFee === "may vary" ? 0 : parseFloat(shippingFee.replace(/[₱,]/g, "")) || 0;
    totalEl.textContent = `₱${(subtotal + shipCost).toFixed(2)}`;
  }

  renderSummary();

  // Bracelet Preview
  const previewUrl = localStorage.getItem("braceletPreviewImage");
  if (previewUrl) {
    document.getElementById("bracelet-preview-img").src = previewUrl;
    document.getElementById("bracelet-preview-wrapper").style.display = "block";
  }

  // Confirm Payment
  document.getElementById("payment-form").addEventListener("submit", e => {
    e.preventDefault();
    const method = document.querySelector("input[name='payment']:checked").value;
    localStorage.setItem("paymentMethod", method);
    document.getElementById("thank-you").style.display = "block";

    setTimeout(() => {
      localStorage.clear();
      window.location.href = "index.html";
    }, 2500);
  });
});
