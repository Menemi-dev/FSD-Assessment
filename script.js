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
  query: (numProducts) => `{
    products (first: ${numProducts}) {
      edges {
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

        // Set up the request headers here

      },
      body: JSON.stringify({
        query: Products.query()
      })
    });
    const productsResponseJson = await productsResponse.json();
    Products.displayProducts(productsResponseJson);
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
      Products.handleFetch(numProducts);
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Products.initialize();
});