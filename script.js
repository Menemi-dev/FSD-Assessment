const Products = {

  state: {
    storeUrl: "https://api-demo-store.myshopify.com/api/2022-01/graphql",
    contentType: "application/json",
    accept: "application/json",
    accessToken: "b8385e410d5a37c05eead6c96e30ccb8"
  },

  /**
   * Sets up the query string for the GraphQL request
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
   * Fetches the products via GraphQL then runs the display function
   */
  handleFetch: async () => {
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
    const productsResponseJson = await productsResponse.json();
    Products.displayProducts(productsResponseJson);
    return productsResponseJson;
  },

  /**
   * Takes a JSON representation of the products and renders cards to the DOM
   * @param {Object} productsJson
   */
  displayProducts: productsJson => {

    // Render the products here

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