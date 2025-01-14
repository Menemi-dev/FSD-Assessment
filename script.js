const Products = {

  state: {
    storeUrl: "https://api-demo-store.myshopify.com/api/2022-01/graphql",
    contentType: "application/json",
    accept: "application/json",
    accessToken: "b8385e410d5a37c05eead6c96e30ccb8"
  },

  /**
   * Sets up the query string for the GraphQL request
   * @param {Number} numProducts
   * @param {String} cursor
   * @returns {String} A GraphQL query string
   */
  query: (numProducts, cursor) => `{
    products (first: ${numProducts}, after: ${cursor}, query: "-tag:upsell_item") {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          handle
          availableForSale
          title
          tags
          priceRange{
            maxVariantPrice {
              amount
            }
            minVariantPrice {
              amount
            }
          }
          featuredImage {
            url
          }
        }
      }
    }
  }`,

  /**
   * Fetches the products via GraphQL
   * @param {Number} numProducts
   * @param {String} cursor
   * @returns {Object}
   */
  handleFetch: async (numProducts, cursor) => {
    const productsResponse = await fetch(Products.state.storeUrl, {
      method: "POST",
      headers: {
        "Content-Type": Products.state.contentType,
        "Accept": Products.state.accept,
        "X-Shopify-Storefront-Access-Token": Products.state.accessToken
      },
      body: JSON.stringify({
        query: Products.query(numProducts, cursor)
      })
    });
    return await productsResponse.json()
  },

  /**
  * Takes an image's URL and modifies it to a given size
  * @param {String} url
  * @param {Number} size
  * @returns {String}
  */
  resizeImage: (url, size) => {
    const index = url.lastIndexOf('.');
    return url.slice(0, index) + `_${size}x${size}` + url.slice(index);
  },

  /**
  * Creates a card structure using the product's data
  * @param {Object} product
  * @returns {String}
  */
  createCard: (product) => {
    const { handle, availableForSale, title, tags, priceRange, featuredImage } = product.node;
    if(availableForSale){
      let imageUrl = ''; //TODO: add a default 'no image' url
      if(featuredImage !== null){
        imageUrl = Products.resizeImage(featuredImage.url, 350);
      }
      let price = `&#36;${priceRange.minVariantPrice.amount}`;
      if(priceRange.minVariantPrice.amount !== priceRange.maxVariantPrice.amount){
        price += `-&#36;${priceRange.maxVariantPrice.amount}`;
      }
      let spanTags = '';
      tags.forEach(tag => {
        spanTags += `<span class="card__tags-tag">${tag}</span>`;
      });
      return `
        <div class="card">
          <div class="card__tags">${spanTags}</div>
          <div class="card__image" style="background-image:url(${imageUrl});"></div>
          <label class="card__title">${title}</label>
          <label class="card__price">${price}</label>
          <a href="/products/${handle}" class="card__button"><label>Shop now</label></a>
        </div>`;
    }
    return '';
  },

  /**
   * Takes a JSON representation of the products and renders cards to the DOM
   * @param {Object} productsJson
   */
  displayProducts: productsJson => {
    const container = document.getElementById('productsGrid');
    let cards = '';
    productsJson.forEach(product => {
      cards += Products.createCard(product);
    });
    container.innerHTML += cards;
  },

  /**
   * Sets up the click handler for the fetch button
   */
  initialize: () => {
    const numProducts = 3;
    document.getElementById('fetchProducts').addEventListener('click', function handler() {
      this.removeEventListener('click', handler);
      let cursor = '"' + this.dataset.cursor + '"';
      if(this.dataset.cursor === undefined) cursor = null;
      Products.handleFetch(numProducts, cursor).then(response => {
        const { edges, pageInfo } = response.data.products;
        Products.displayProducts(edges);
        if(pageInfo.hasNextPage) {
          this.dataset.cursor = edges[numProducts-1].cursor;
          this.addEventListener('click', handler);
        }
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Products.initialize();
});