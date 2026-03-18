import axios from 'axios';

/**
 * Service to handle communication with Pimcore Data Hub (GraphQL).
 * This typically goes through the Node.js/Express middleware for security.
 */

const PIMCORE_PROXY_URL = process.env.REACT_APP_PIMCORE_PROXY_URL || 'http://localhost:3001/pimcore';

export const getProductList = async (query = '', offset = 0, limit = 10) => {
  const graphqlQuery = {
    query: `
      query GetProducts($query: String, $offset: Int, $limit: Int) {
        getProductList(filter: $query, offset: $offset, limit: $limit) {
          totalCount
          edges {
            node {
              id
              sku
              title
              price
              thumbnail
              status
            }
          }
        }
      }
    `,
    variables: { query, offset, limit }
  };

  try {
    const response = await axios.post(PIMCORE_PROXY_URL, graphqlQuery);
    return response.data.data.getProductList;
  } catch (error) {
    console.error('Error fetching products from Pimcore:', error);
    throw error;
  }
};

export const getProductDetail = async (id) => {
  const graphqlQuery = {
    query: `
      query GetProduct($id: ID!) {
        getProduct(id: $id) {
          id
          sku
          title
          description
          price
          thumbnail
          status
        }
      }
    `,
    variables: { id }
  };

  try {
    const response = await axios.post(PIMCORE_PROXY_URL, graphqlQuery);
    return response.data.data.getProduct;
  } catch (error) {
    console.error('Error fetching product detail from Pimcore:', error);
    throw error;
  }
};
