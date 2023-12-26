// import qrcode from "qrcode";
import invariant from "tiny-invariant";
import db from "../db.server";

export async function getProductReview(id, graphql, accessToken) {
  const productReview = await db.productReview.findFirst({ where: { id } });

  if (!productReview) {
    return null;
  }

  return supplementProductReview(productReview, graphql, accessToken);
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
  const fetchData = async (endpoint) => {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return await response.json();
  };

  try {
    const customerData = await fetchData(
      `https://${productReview.shop}/admin/api/${process.env.REACT_APP_SHOP_API_VERSION}/customers/${productReview.userId}.json`
    );
    const productData = await fetchData(
      `https://${productReview.shop}/admin/api/${process.env.REACT_APP_SHOP_API_VERSION}/products/${productReview.productId}.json`
    );

    return {
      ...productReview,
      hi: productData.product.title,
      productTitle: productData?.product?.title,
      productImage: productData?.product?.images?.[0]?.src,
      productAlt: productData?.product?.images?.[0]?.alt,
      first_name: customerData.customer.first_name,
      last_name: customerData.customer.last_name,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return productReview;
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
