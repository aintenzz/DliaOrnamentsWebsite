const braceletPreview = document.getElementById("bracelet-preview");
const braceletColor = localStorage.getItem("braceletColor") || "Silver";
const braceletSize = localStorage.getItem("braceletSize") || "Medium";
const charmLimit = { Small: 15, Medium: 18, Large: 21, "Extra Large": 24 }[braceletSize];

// Bracelet link image based on color
let linkImg = "assets/links/plain_silver.png";
if (braceletColor.toLowerCase().includes("gold")) linkImg = "assets/links/plain_gold.png";
if (braceletColor.toLowerCase().includes("mix")) linkImg = "assets/links/plain_mixed.png";

// Generate bracelet: psl-psl-psl-charm-charm-psl pattern
function renderBraceletPreview(cartItems) {
  braceletPreview.innerHTML = "";
  braceletPreview.classList.add(`bracelet-${braceletColor.toLowerCase()}`);

  const totalLinks = Math.min(charmLimit, cartItems.length + 5);
  for (let i = 0; i < totalLinks; i++) {
    const img = document.createElement("img");
    if (i < cartItems.length) {
      img.src = cartItems[i].img;
      img.className = "preview-charm";
    } else {
      img.src = linkImg;
      img.className = "preview-link";
    }
    braceletPreview.appendChild(img);
  }
}

const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
renderBraceletPreview(cartItems);
