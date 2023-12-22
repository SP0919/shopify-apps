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

export async function getProductReviews(shop, graphql) {
  const productReviews = await db.productReview.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (productReviews.length === 0) return [];

  return Promise.all(
    productReviews.map((productReview) =>
      supplementProductReview(productReview, graphql)
    )
  );
}

async function supplementProductReview(productReview, graphql) {
  const response = await graphql(
    `
      query supplementProductReview($id: ID!) {
        product(id: $id) {
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
        id: productReview.productId,
      },
    }
  );

  const {
    data: { product },
  } = await response.json();

  return {
    ...productReview,
    productDeleted: !product?.title,
    productTitle: product?.title,
    productImage: product?.images?.nodes[0]?.url,
    productAlt: product?.images?.nodes[0]?.altText,
  };
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
