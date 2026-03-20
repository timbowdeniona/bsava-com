import axios from 'axios';

const PIMCORE_PROXY_URL = process.env.NEXT_PUBLIC_PIMCORE_PROXY_URL || '/api/pimcore-proxy';
const PIMCORE_ADMIN_URL = process.env.NEXT_PUBLIC_PIMCORE_ADMIN_URL || 'http://35.246.19.193';
const IMAGE_PROXY_URL = '/api/image-proxy';

export const getProductList = async (query = '', offset = 0, limit = 10) => {
  const filter = query 
    ? JSON.stringify({ title: { '$like': `%${query}%` } })
    : '';

  const graphqlQuery = {
    query: `
      query GetProducts($filter: String, $offset: Int, $limit: Int) {
        getBookListing(filter: $filter, after: $offset, first: $limit) {
          totalCount
          edges { node { id sku: isbn title price: memberPrice thumbnail: coverImage { fullpath } } }
        }
        getEbookListing(filter: $filter, after: $offset, first: $limit) {
          totalCount
          edges { node { id sku: isbn title price: memberPrice thumbnail: coverImage { fullpath } } }
        }
        getEventListing(filter: $filter, after: $offset, first: $limit) {
          totalCount
          edges { node { id title price: memberPrice } }
        }
        getCourseListing(filter: $filter, after: $offset, first: $limit) {
          totalCount
          edges { node { id title price: memberPrice } }
        }
      }
    `,
    variables: { filter, offset, limit }
  };

  try {
    const response = await axios.post(PIMCORE_PROXY_URL, graphqlQuery);
    
    // Check if the response contains GraphQL errors
    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }

    const data = response.data.data;
    if (!data) return { totalCount: 0, edges: [] };

    // Merge results safely
    const allEdges = [
      ...(data.getBookListing?.edges || []),
      ...(data.getEbookListing?.edges || []),
      ...(data.getEventListing?.edges || []),
      ...(data.getCourseListing?.edges || [])
    ];

    return {
      totalCount: allEdges.length,
      edges: allEdges.map((edge: any) => ({
        ...edge,
        node: {
          ...edge.node,
          thumbnail: edge.node.thumbnail?.fullpath 
            ? `${IMAGE_PROXY_URL}?url=${encodeURIComponent(PIMCORE_ADMIN_URL + edge.node.thumbnail.fullpath)}`
            : undefined
        }
      }))
    };
  } catch (error) {
    console.error('Error fetching products from Pimcore:', error);
    throw error;
  }
};
