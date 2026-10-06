// store.js - Cart & Wishlist Management

// Helper function to format price
const formatRupiah = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

// Dummy Data Initialization if localStorage is empty
const initializeData = () => {
  if (!localStorage.getItem('cartItems')) {
    localStorage.setItem('cartItems', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('wishlistItems')) {
    localStorage.setItem('wishlistItems', JSON.stringify([]));
  }
};

const getCartItems = () => JSON.parse(localStorage.getItem('cartItems')) || [];
const getWishlistItems = () => JSON.parse(localStorage.getItem('wishlistItems')) || [];
const saveCartItems = (items) => localStorage.setItem('cartItems', JSON.stringify(items));
const saveWishlistItems = (items) => localStorage.setItem('wishlistItems', JSON.stringify(items));

// Render Cart Dropdown (Max 3 Items)
const renderCartDropdown = () => {
  const cartItems = getCartItems();
  const cartDropdownItemsContainer = document.querySelector('.cart-dropdown-menu .cart-items');
  const cartDropdownTotalElement = document.querySelector('.cart-dropdown-menu .cart-total-price');
  const cartBadge = document.querySelector('.cart-dropdown .badge');
  const cartHeader = document.querySelector('.cart-dropdown-menu .dropdown-header h6');
  
  if (!cartDropdownItemsContainer) return;
  
  cartDropdownItemsContainer.innerHTML = '';
  
  // Calculate total price & amount
  let totalPrice = 0;
  
  const displayItems = cartItems.slice(0, 3);
  
  const basePath = window.location.pathname.includes('/produk/') || window.location.pathname.includes('/blog/') ? '../' : '';
  
  displayItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    let imgPath = item.image || '';
    if (imgPath.startsWith('../')) imgPath = imgPath.substring(3);
    else if (imgPath.startsWith('./')) imgPath = imgPath.substring(2);
    const imgSrc = imgPath.startsWith('http') || imgPath.startsWith('data:') ? imgPath : basePath + imgPath;
    
    cartDropdownItemsContainer.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${imgSrc}" alt="Produk" class="img-fluid" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1; border-radius: 6px;">
        </div>
        <div class="cart-item-content">
          <h6 class="cart-item-title">${item.name}</h6>
          <div class="cart-item-meta">${item.quantity} × ${formatRupiah(item.price)}</div>
        </div>
        <button class="cart-item-remove" type="button" onclick="removeCartItem('${item.id}')"><i class="bi bi-x"></i></button>
      </div>
    `;
  });
  
  cartItems.forEach(item => {
    totalPrice += (item.price * item.quantity);
  });
  
  if (cartItems.length > 3) {
    cartDropdownItemsContainer.innerHTML += `
      <div class="text-center p-2 text-muted" style="font-size: 12px;">
        + ${cartItems.length - 3} barang lainnya di keranjang
      </div>
    `;
  } else if (cartItems.length === 0) {
    cartDropdownItemsContainer.innerHTML = `<div class="p-3 text-center text-muted">Keranjang masih kosong</div>`;
  }
  
  if (cartDropdownTotalElement) {
    cartDropdownTotalElement.innerText = formatRupiah(totalPrice);
  }
  
  if (cartBadge) {
    cartBadge.innerText = cartItems.length;
  }
  
  if (cartHeader) {
    cartHeader.innerText = `Keranjang Belanja (${cartItems.length})`;
  }
};

// Render Cart Page
const renderCartPage = () => {
  const cartItemsContainer = document.querySelector('section#cart .cart-items');
  if (!cartItemsContainer) return;
  
  const cartItems = getCartItems();
  let totalPrice = 0;
  
  // Remove existing cart items except header
  const headerHTML = `
    <div class="cart-header d-none d-lg-block">
      <div class="row align-items-center">
        <div class="col-lg-6"><h5>Product</h5></div>
        <div class="col-lg-2 text-center"><h5>Price</h5></div>
        <div class="col-lg-2 text-center"><h5>Quantity</h5></div>
        <div class="col-lg-2 text-center"><h5>Total</h5></div>
      </div>
    </div>
  `;
  
  let itemsHTML = '';
  
  const basePath = window.location.pathname.includes('/produk/') || window.location.pathname.includes('/blog/') ? '../' : '';
  
  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    
    let imgPath = item.image || '';
    if (imgPath.startsWith('../')) imgPath = imgPath.substring(3);
    else if (imgPath.startsWith('./')) imgPath = imgPath.substring(2);
    const imgSrc = imgPath.startsWith('http') || imgPath.startsWith('data:') ? imgPath : basePath + imgPath;
    
    itemsHTML += `
      <div class="cart-item">
        <div class="row align-items-center">
          <div class="col-lg-6 col-12 mt-3 mt-lg-0 mb-lg-0 mb-3">
            <div class="product-info d-flex align-items-center">
              <div class="product-image" style="width: 80px; height: 80px; flex-shrink: 0; margin-right: 15px;">
                <img src="${imgSrc}" alt="Product" class="img-fluid" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1; border-radius: 8px;">
              </div>
              <div class="product-details">
                <h6 class="product-title">${item.name}</h6>
                <button class="remove-item" type="button" onclick="removeCartItem('${item.id}')">
                  <i class="bi bi-trash"></i> Hapus
                </button>
              </div>
            </div>
          </div>
          <div class="col-lg-2 col-12 mt-3 mt-lg-0 text-center">
            <div class="price-tag">
              <span class="current-price">${formatRupiah(item.price)}</span>
            </div>
          </div>
          <div class="col-lg-2 col-12 mt-3 mt-lg-0 text-center">
            <div class="quantity-selector">
              <button class="quantity-btn decrease" type="button" onclick="changeQuantity('${item.id}', -1)">
                <i class="bi bi-dash"></i>
              </button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)">
              <button class="quantity-btn increase" type="button" onclick="changeQuantity('${item.id}', 1)">
                <i class="bi bi-plus"></i>
              </button>
            </div>
          </div>
          <div class="col-lg-2 col-12 mt-3 mt-lg-0 text-center">
            <div class="item-total">
              <span>${formatRupiah(itemTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  if (cartItems.length === 0) {
    itemsHTML = `<div class="p-5 text-center text-muted">Keranjang masih kosong</div>`;
  }
  
  cartItemsContainer.innerHTML = headerHTML + itemsHTML;
  
  if (typeof updateOrderSummary === 'function') {
    updateOrderSummary();
  }
};

window.updateOrderSummary = () => {
  const cartItems = getCartItems();
  let subtotal = 0;
  cartItems.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  const summarySubtotal = document.querySelector('#subtotal-value');
  const finalTotalElem = document.querySelector('#final-total');
  
  if (summarySubtotal) summarySubtotal.innerText = formatRupiah(subtotal);
  
  // Calculate Shipping
  let shippingCost = 0;
  const shippingRadios = document.querySelectorAll('input[name="shipping"]');
  
  // Auto-select Free Shipping if over 500k
  if (subtotal >= 500000) {
    const freeRadio = document.querySelector('input[name="shipping"]#free');
    if(freeRadio) freeRadio.checked = true;
  }
  
  shippingRadios.forEach(radio => {
    if (radio.checked) {
      shippingCost = parseInt(radio.value) || 0;
    }
  });

  // Calculate Discount (optional logic here)
  let discount = 0; // You can read from coupon input if you want

  let total = subtotal + shippingCost - discount;
  
  if (finalTotalElem) {
    finalTotalElem.innerText = formatRupiah(total);
  }
};

// Render Wishlist Page
const renderWishlistPage = () => {
  const wishlistContainer = document.querySelector('section#wishlist .container');
  if (!wishlistContainer) return;
  
  const wishlistItems = getWishlistItems();
  
  if (wishlistItems.length === 0) {
    wishlistContainer.innerHTML = `<div class="p-5 text-center text-muted">Wishlist masih kosong</div>`;
    return;
  }
  
  let itemsHTML = '<div class="row g-4 justify-content-center">';
  const basePath = window.location.pathname.includes('/produk/') || window.location.pathname.includes('/blog/') ? '../' : '';
  
  wishlistItems.forEach(item => {
    const url = item.url || '#';
    let imgPath = item.image || '';
    if (imgPath.startsWith('../')) imgPath = imgPath.substring(3);
    else if (imgPath.startsWith('./')) imgPath = imgPath.substring(2);
    const imgSrc = imgPath.startsWith('http') || imgPath.startsWith('data:') ? imgPath : basePath + imgPath;
    
    itemsHTML += `
      <div class="col-lg-3 col-md-6">
        <div class="ss-prod-card" style="border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: 0.3s; height: 100%; display: flex; flex-direction: column; background: #fff; position: relative;">
          <div class="ss-prod-img-box" style="position: relative; overflow: hidden;">
            <img src="${imgSrc}" alt="${item.name}" style="width: 100%; aspect-ratio: 1; object-fit: cover; transition: 0.5s;">
            <div class="ss-prod-actions" style="position: absolute; bottom: 15px; left: 0; width: 100%; display: flex; justify-content: center; gap: 10px;">
              <button class="ss-prod-btn" onclick="updateCart(event, '${item.name}', '${item.price}', '${item.image}')" title="Tambah ke Keranjang" style="width: 45px; height: 45px; border-radius: 50%; background: #fff; color: var(--heading-color, #222); display: flex; align-items: center; justify-content: center; font-size: 20px; transition: 0.3s; border: none; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><i class="bi bi-cart-plus"></i></button>
              <button class="ss-prod-btn wishlist-btn" onclick="removeWishlistItem('${item.id}')" style="width: 45px; height: 45px; border-radius: 50%; background: #fff; color: #dc3545; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: 0.3s; border: none; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" title="Hapus dari Favorit"><i class="bi bi-heart-fill"></i></button>
            </div>
          </div>
          <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">
            <h4 style="font-size: 16px; font-weight: 700; color: var(--heading-color, #222); margin-bottom: 5px;">${item.name}</h4>
            <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between;">
              <span style="color: var(--accent-color, #e96b56); font-weight: 700; font-size: 16px;">${formatRupiah(item.price)}</span>
              <a href="${url}" class="btn btn-sm rounded-pill" style="border: 1px solid var(--accent-color, #e96b56); color: var(--accent-color, #e96b56); font-weight: 600; padding: 5px 15px; transition: 0.3s;" onmouseover="this.style.background='var(--accent-color)'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='var(--accent-color)';">Detail</a>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  itemsHTML += '</div>';
  wishlistContainer.innerHTML = itemsHTML;
};

const updateWishlistBadge = () => {
  const badge = document.querySelector('.header-actions a[href*="wishlist.html"] .badge');
  if (badge) {
    badge.innerText = getWishlistItems().length;
  }
};

// Actions
window.removeCartItem = (id) => {
  let cartItems = getCartItems();
  cartItems = cartItems.filter(item => String(item.id) !== String(id));
  saveCartItems(cartItems);
  renderCartDropdown();
  renderCartPage();
};

window.removeWishlistItem = (id) => {
  let wishlistItems = getWishlistItems();
  wishlistItems = wishlistItems.filter(item => String(item.id) !== String(id));
  saveWishlistItems(wishlistItems);
  renderWishlistPage();
  updateWishlistBadge();
};

window.changeQuantity = (id, change) => {
  let cartItems = getCartItems();
  const item = cartItems.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity < 1) item.quantity = 1;
    saveCartItems(cartItems);
    renderCartDropdown();
    renderCartPage();
  }
};

window.updateQuantity = (id, val) => {
  let cartItems = getCartItems();
  const item = cartItems.find(item => item.id === id);
  if (item) {
    item.quantity = Math.max(1, parseInt(val) || 1);
    saveCartItems(cartItems);
    renderCartDropdown();
    renderCartPage();
  }
};

window.addToCartFromWishlist = (id) => {
  const wishlistItems = getWishlistItems();
  const item = wishlistItems.find(item => item.id === id);
  if (item) {
    let cartItems = getCartItems();
    const existingCartItem = cartItems.find(ci => ci.id === id);
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      cartItems.push({ ...item, quantity: 1 });
    }
    saveCartItems(cartItems);
    alert('Produk ditambahkan ke keranjang!');
    renderCartDropdown();
    // removeWishlistItem(id); // Optional: if you want to remove after adding
  }
};

window.checkoutToWA = () => {
  const cartItems = getCartItems();
  if (cartItems.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }
  
  let message = "Halo, saya ingin memesan:\n\n";
  let totalPrice = 0;
  
  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    message += `${index + 1}. ${item.name} (${item.quantity} pcs) - ${formatRupiah(itemTotal)}\n`;
  });
  
  message += `\nTotal Pembayaran: ${formatRupiah(totalPrice)}\n\nTerima kasih.`;
  
  const encodedMessage = encodeURIComponent(message);
  const waNumber = "6281234567890"; // Ganti dengan nomor WhatsApp tujuan
  const waLink = `https://wa.me/${waNumber}?text=${encodedMessage}`;
  
  window.open(waLink, '_blank');
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeData();
  renderCartDropdown();
  renderCartPage();
  renderWishlistPage();
  updateWishlistBadge();
  
  // Attach Checkout event
  const checkoutBtn = document.querySelector('.btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      checkoutToWA();
    });
  }
  
  // Also attach for the checkout link in the dropdown
  const dropdownCheckoutBtn = document.querySelector('.cart-dropdown-menu .cart-actions a.btn-primary');
  if (dropdownCheckoutBtn) {
    dropdownCheckoutBtn.href = "javascript:checkoutToWA()";
  }
});

// Toast Notification System
window.showToast = (message, actionText = null, actionUrl = null) => {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast show align-items-center text-bg-success border-0 mb-2';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  let actionHtml = '';
  if (actionText && actionUrl) {
    actionHtml = `<a href="${actionUrl}" class="btn btn-sm btn-light ms-auto me-2">${actionText}</a>`;
  }
  
  toast.innerHTML = `
    <div class="d-flex align-items-center">
      <div class="toast-body">
        ${message}
      </div>
      ${actionHtml}
      <button type="button" class="btn-close btn-close-white me-2 m-auto ${actionText ? '' : 'ms-auto'}" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Global Add to Cart Override
window.updateCart = (e, itemName, itemPriceStr, itemImg) => {
  if (e) e.preventDefault();
  
  const price = parseInt(String(itemPriceStr).replace(/[^\d]/g, '')) || 0;
  const id = itemName.replace(/\s+/g, '-').toLowerCase();
  
  let cartItems = getCartItems();
  const existingItem = cartItems.find(item => item.id === id || item.name === itemName);
  
  let cleanedImg = itemImg;
  if (cleanedImg && cleanedImg.startsWith('../')) {
    cleanedImg = cleanedImg.substring(3);
  } else if (cleanedImg && cleanedImg.startsWith('./')) {
    cleanedImg = cleanedImg.substring(2);
  }
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({ id: id, name: itemName, price: price, quantity: 1, image: cleanedImg });
  }
  
  saveCartItems(cartItems);
  renderCartDropdown();
  if (document.querySelector('.cart-page')) renderCartPage();
  
  const basePath = window.location.pathname.includes('/produk/') || window.location.pathname.includes('/blog/') ? '../' : '';
  showToast(`${itemName} berhasil ditambahkan ke Keranjang!`, 'Lihat', basePath + 'cart.html');
};

// Global Add to Wishlist Override
window.updateWishlist = (e, itemName, btnElem) => {
  if (e) e.preventDefault();
  
  let itemPriceStr = "0";
  let itemImg = "";
  let itemUrl = "";
  
  const card = btnElem.closest('.ss-prod-card') || btnElem.closest('.product-item') || btnElem.closest('.ss-product');
  if (card) {
    const priceElem = card.querySelector('.ss-product-foot strong') || card.querySelector('.price') || Array.from(card.querySelectorAll('span')).find(el => el.innerText.includes('Rp'));
    if (priceElem) itemPriceStr = priceElem.innerText;
    
    const imgElem = card.querySelector('img');
    if (imgElem) itemImg = imgElem.getAttribute('src');
    
    const urlElem = card.querySelector('a.btn') || card.querySelector('a');
    if (urlElem) itemUrl = urlElem.getAttribute('href');
  }
  
  const price = parseInt(String(itemPriceStr).replace(/[^\d]/g, '')) || 0;
  const id = itemName.replace(/\s+/g, '-').toLowerCase();
  
  let wishlistItems = getWishlistItems();
  const existingIndex = wishlistItems.findIndex(item => item.id === id || item.name === itemName);
  
  let icon = btnElem.querySelector('i');
  
  const basePath = window.location.pathname.includes('/produk/') || window.location.pathname.includes('/blog/') ? '../' : '';
  
  if (existingIndex !== -1) {
    wishlistItems.splice(existingIndex, 1);
    if (icon) {
      icon.classList.remove('bi-heart-fill');
      icon.classList.add('bi-heart');
    }
    btnElem.style.color = '#6c757d';
    showToast(`${itemName} dihapus dari Wishlist.`);
  } else {
    wishlistItems.push({ id: id, name: itemName, price: price, image: itemImg, url: itemUrl });
    if (icon) {
      icon.classList.remove('bi-heart');
      icon.classList.add('bi-heart-fill');
    }
    btnElem.style.color = '#dc3545';
    showToast(`${itemName} berhasil ditambahkan ke Wishlist!`, 'Lihat', basePath + 'wishlist.html');
  }
  
  saveWishlistItems(wishlistItems);
  
  updateWishlistBadge();
  
  if (document.querySelector('.wishlist-page')) renderWishlistPage();
};
