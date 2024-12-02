let products = []; // Global variable for storing products

document.addEventListener('DOMContentLoaded', () => {
  // Fetch data from product.json in the data folder
  fetch('assets/data/product.json')
    .then(response => response.json())
    .then(data => {
      products = data; // Store products globally
      const productList = document.getElementById('product-list');

      products.forEach(product => {
        // Create product card
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
        <div class="favorite-container">
          <button class="favorite-btn" onclick="toggleFavorite(${product.id})">
            <i class="fa-solid fa-star"></i>
          </button>
        </div>
        <h2>${product.name}</h2>
        <p><strong>Category:</strong> <span class="category">${product.category}</span></p>
        <p>${product.description}</p>
        <button class="details-btn" onclick="openModal(${product.id})">View Details</button>
        <p><strong>Latest Version:</strong> ${product.latest_version}</p>
        <p><strong>Update Date:</strong> ${product.update_date}</p>
        <p><strong>Download:</strong></p>
        <ul class="download-links">
          ${product.downloads
            .map(download => {
              let iconClass;
              switch (download.platform) {
                case "Windows":
                  iconClass = "fa-brands fa-windows";
                  break;
                case "macOS":
                  iconClass = "fa-brands fa-apple";
                  break;
                case "Linux":
                  iconClass = "fa-brands fa-linux";
                  break;
                default:
                  iconClass = "fa-solid fa-download";
              }
              return `
                <li>
                  <i class="${iconClass}" style="margin-right: 8px;"></i>
                  <a href="${download.url}" target="_blank">${download.platform}</a>
                </li>
              `;
            })
            .join('')}
        </ul>
      `;          
        productList.appendChild(productCard);
      });

      updateFavoriteIcons(); // Apply favorite state on initial load
    })
    .catch(error => {
      console.error('Error fetching product data:', error);
    });
});

// Filter products by search input
function filterProducts() {
  const query = document.getElementById('search-bar').value.toLowerCase();
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    const productName = card.querySelector('h2').textContent.toLowerCase();
    const productCategory = card.querySelector('.category').textContent.toLowerCase();

    if (productName.includes(query) || productCategory.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Filter products by category or favorites
function filterByCategory(category) {
  const productCards = document.querySelectorAll('.product-card');

  if (category === 'favorites') {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    productCards.forEach(card => {
      const productId = parseInt(card.querySelector('.favorite-btn').getAttribute('onclick').match(/\d+/)[0], 10);
      card.style.display = favorites.includes(productId) ? 'block' : 'none';
    });
  } else {
    productCards.forEach(card => {
      const productCategory = card.querySelector('.category').textContent;

      if (category === 'all' || productCategory === category) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Highlight active button
  document.querySelectorAll('#category-filters button').forEach(button => {
    button.classList.remove('active');
  });
  document
    .querySelector(`#category-filters button[onclick="filterByCategory('${category}')"]`)
    .classList.add('active');
}

// Toggle favorite state for a product
function toggleFavorite(productId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  if (favorites.includes(productId)) {
    favorites = favorites.filter(id => id !== productId); // Remove from favorites
  } else {
    favorites.push(productId); // Add to favorites
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoriteIcons();
}

// Update favorite icons on page load or toggle
function updateFavoriteIcons() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  document.querySelectorAll('.favorite-btn').forEach(button => {
    const productId = parseInt(button.getAttribute('onclick').match(/\d+/)[0], 10);
    const icon = button.querySelector('i');

    if (favorites.includes(productId)) {
      icon.classList.add('favorite');
      icon.style.color = 'gold';
    } else {
      icon.classList.remove('favorite');
      icon.style.color = 'gray';
    }
  });
}

// Open the modal and populate with product details
function openModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return console.error('Product not found:', productId);

  const modalDetails = document.getElementById('modal-details');
  modalDetails.innerHTML = `
    <h2>${product.name}</h2>
    <p><strong>Category:</strong> ${product.category}</p>
    <p>${product.description}</p>
    <p><strong>License:</strong> ${product.license}</p>
    <p><strong>Latest Version:</strong> ${product.latest_version}</p>
    <p><strong>Update Date:</strong> ${product.update_date}</p>
    <p>
      <a href="${product.repository}" target="_blank">Repository</a> |
      <a href="${product.homepage}" target="_blank">Homepage</a>
    </p>
    <p><strong>Downloads:</strong></p>
    <ul>
      ${product.downloads
        .map(download => `
          <li><a href="${download.url}" target="_blank">${download.platform}</a></li>
        `)
        .join('')}
    </ul>
  `;
  document.getElementById('product-modal').style.display = 'block';
}


// Close the modal
function closeModal() {
  document.getElementById('product-modal').style.display = 'none';
}

// Close modal on outside click
window.onclick = function (event) {
  const modal = document.getElementById('product-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

//Arrow Move
document.getElementById('scroll-left').addEventListener('click', () => {
  const wrapper = document.getElementById('category-filters-wrapper');
  wrapper.scrollBy({ left: -150, behavior: 'smooth' });
});

document.getElementById('scroll-right').addEventListener('click', () => {
  const wrapper = document.getElementById('category-filters-wrapper');
  wrapper.scrollBy({ left: 150, behavior: 'smooth' });
});


// Hide Arrow when not needed
function updateArrowVisibility() {
  const wrapper = document.getElementById('category-filters-wrapper');
  const leftArrow = document.getElementById('scroll-left');
  const rightArrow = document.getElementById('scroll-right');

  leftArrow.style.display = wrapper.scrollLeft > 0 ? 'block' : 'none';
  rightArrow.style.display =
    wrapper.scrollWidth > wrapper.scrollLeft + wrapper.clientWidth
      ? 'block'
      : 'none';
}

const wrapper = document.getElementById('category-filters-wrapper');
wrapper.addEventListener('scroll', updateArrowVisibility);
updateArrowVisibility();


