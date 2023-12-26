// import qrcode from "qrcode";
import invariant from "tiny-invariant";
import db from "../db.server";

export async function getProductReview(id, graphql) {
  const productReview = await db.productReview.findFirst({ where: { id } });

  if (!productReview) {
    return null;
  }

  return supplementProductReview(productReview, graphql);
}

export async function getProductReviews(shop, graphql, accessToken) {
  const productReviews = await db.productReview.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (productReviews.length === 0) return [];

  return Promise.all(
    productReviews.map((productReview) =>
      supplementProductReview(productReview, graphql, accessToken)
    )
  );
}

async function supplementProductReview(productReview, graphql, accessToken) {
  // Fetch customer data using the Shopify REST API
  const customerEndpoint = `https://${productReview.shop}/admin/api/${process.env.REACT_APP_SHOP_API_VERSION}/customers/${productReview.userId}.json`;

  try {
    const response = await fetch(customerEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customer data: ${response.statusText}`);
    }

    const customerData = await response.json();

    // Fetch product data using the GraphQL API
    const graphqlResponse = await graphql(
      `
        query supplementProductReview($productId: ID!) {
          product(id: $productId) {
            title
            images(first: 1) {
              nodes {
                altText
                url
              }
            }
          }
        }
      `,
      {
        variables: {
          productId: productReview.productId,
        },
      }
    );

    const {
      data: { product },
    } = await graphqlResponse.json();

    return {
      ...productReview,
      productDeleted: !product?.title,
      productTitle: product?.title,
      productImage: product?.images?.nodes[0]?.url,
      productAlt: product?.images?.nodes[0]?.altText,
      first_name: customerData.customer.first_name,
      last_name: customerData.customer.last_name,
    };
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return productReview; // Return the original product review if there is an error
  }
}

export function validateProductReview(data) {
  const errors = {};

  if (!data.productId) {
    errors.productId = "Product is required";
  }

  if (!data.userId) {
    errors.userId = "User is required";
  }
  if (!data.rating) {
    errors.rating = "Rating is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}
