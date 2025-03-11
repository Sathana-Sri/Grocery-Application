import { db, collection, getDocs, addDoc, serverTimestamp } from "./firebase-config.js";
import { auth } from "./auth.js";

// Select the products container
const productsContainer = document.querySelector(".products-container");
let allProducts = [];
const productList = document.querySelector(".product-list");
const categoryFilter = document.getElementById("category-filter");


// Function to fetch products from Firestore
async function fetchProducts() {
    try {
        console.log("🔄 Fetching products from database...");
        const querySnapshot = await getDocs(collection(db, "products"));
        productsContainer.innerHTML = ""; // Clear previous products

        querySnapshot.forEach((doc) => {
            const product = doc.data();

            // Skip hidden products
            if (product.stock_status !== "visible") return;

            // Validate Image URL
            let imageUrl = validateImageUrl(product.img_url) ? product.img_url : "images/default.jpg";

            // Calculate savings if original price exists
            let savingsHTML = "";
            if (product.original_price && product.original_price > product.price) {
                const savings = product.original_price - product.price;
                savingsHTML = `<div class="savings">You'll save ₹${savings}</div>`;
            }

            // Create badge based on product properties
            let badgeHTML = "";
            if (product.is_new) {
                badgeHTML = `<div class="product-badge badge-new">New Launch</div>`;
            } else if (product.is_bestseller) {
                badgeHTML = `<div class="product-badge badge-bestseller">Bestseller</div>`;
            } else if (product.is_viral) {
                badgeHTML = `<div class="product-badge badge-viral">Viral Product</div>`;
            } else if (product.is_legacy) {
                badgeHTML = `<div class="product-badge badge-legacy">Legacy Product ✨</div>`;
            } else if (product.stock && product.stock < 10) {
                badgeHTML = `<div class="product-badge badge-limited">Only ${product.stock} left</div>`;
            }

            // Ratings HTML
            const ratingHTML = product.rating ? `
                <div class="rating-container">
                    <div class="rating">
                        <span class="rating-star">★</span>${product.rating.toFixed(1)}
                    </div>
                    <span class="rating-count">${product.rating_count || 0} Ratings</span>
                </div>
            ` : '';

            // Original price HTML
            const originalPriceHTML = product.original_price ? 
                `<span class="original-price">₹${product.original_price}</span>` : '';

            // Create product card
            let productHTML = `
                <div class="product-card" data-product-id="${doc.id}">
                    ${badgeHTML}
                    <div class="product-image">
                        <img src="${imageUrl}" alt="${product.name}" 
                             onerror="this.onerror=null; this.src='images/default.jpg';">
                        <div class="splash-overlay"></div>
                        <button class="add-to-cart" data-id="${doc.id}">+ Add to cart</button>
                    </div>
                    ${ratingHTML}
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-description">${product.description || ''}</p>
                        <div class="price-container">
                            <span class="current-price">₹${product.price}</span>
                            ${originalPriceHTML}
                        </div>
                        ${savingsHTML}
                    </div>
                </div>
            `;
            
            productsContainer.innerHTML += productHTML;
        });

        console.log("✅ Finished rendering products, attaching event listeners...");
        attachAddToCartEvent();

    } catch (error) {
        console.error("❌ Error fetching products:", error);
        productsContainer.innerHTML = `
            <div class="error-message">
                <p>Sorry, we couldn't load the products. Please try again later.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Validate Image URL
function validateImageUrl(url) {
    return url && url.startsWith("http") && !url.includes("google.com/url");
}
// ✅ Fetch Categories
async function fetchCategories() {
    try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        let categories = new Set();
 
        snapshot.forEach(doc => {
            const product = doc.data();
            if (product.category) {
                categories.add(product.category);
            }
        });
 
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(category => {
            categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
        });
 
    } catch (error) {
        console.error("❌ Error fetching categories:", error);
    }
}

// Load Products When Page Loads
// document.addEventListener("DOMContentLoaded", fetchProducts);
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();     // ✅ Load Products
    fetchCategories();   // ✅ Load Categories
});


// Attach "Add to Cart" Event Listeners
function attachAddToCartEvent() {
    document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const productId = event.target.getAttribute("data-id");
            const user = auth.currentUser;

            if (!user) {
                alert("❌ You must be logged in to add items to the cart.");
                window.location.href = "login.html";
                return;
            }

            // Default quantity is 1
            const quantity = 1;
            
            console.log(`🛒 Added ${quantity} of Product ID: ${productId} to cart`);
            await addToCart(user.uid, productId, quantity);
        });
    });
}
// ✅ Filter Products
// function filterProducts() {
//     const searchText = searchBar.value.toLowerCase();
//     const selectedCategory = categoryFilter.value;
 
//     let filteredProducts = allProducts.filter(product => {
//         const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
//         const matchesSearch = product.name.toLowerCase().includes(searchText);
//         return matchesCategory && matchesSearch;
//     });
 
//     displayProducts(filteredProducts);
// }
window.filterProducts=filterProducts;

// Selecting the search bar from the HTML file
const searchBar = document.getElementById('search-bar');

// Function to filter products
// function filterProducts() {
//     const searchText = searchBar.value.toLowerCase();
//     const products = document.querySelectorAll('.product-card');

//     products.forEach(product => {
//         const productName = product.querySelector('.product-name').textContent.toLowerCase();
//         if (productName.includes(searchText)) {
//             product.style.display = 'block';
//         } else {
//             product.style.display = 'none';
//         }
//     });
// }


function filterProducts() {
    if (!searchBar) return;
    const searchText = searchBar.value.toLowerCase();
    const products = document.querySelectorAll('.product-card');

    products.forEach(product => {
        const productName = product.querySelector('.product-title').textContent.toLowerCase();
        if (productName.includes(searchText)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

searchBar.addEventListener('input', filterProducts);


// Attach the input event listener
searchBar.addEventListener('input', filterProducts);

// Function to add product to Firestore "cart" collection
async function addToCart(userId, productId, quantity) {
    try {
        console.log(`🛒 Attempting to add to cart: User: ${userId}, Product: ${productId}, Quantity: ${quantity}`);

        const cartRef = collection(db, "cart");
        await addDoc(cartRef, {
            userId,
            productId,
            quantity,
            timestamp: serverTimestamp()
        });

        console.log("✅ Item successfully added to Firestore!");

        // Show a success message
        alert("✅ Item added to cart successfully!");

    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        alert("Error adding to cart: " + error.message);
    }
}



// Export functions for reuse
export { fetchProducts, addToCart };
