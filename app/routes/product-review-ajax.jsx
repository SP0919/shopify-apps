import { json } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import { cors } from 'remix-utils/cors';
import { getProductReviews } from '../models/ProductReview.server';
import { authenticate, unauthenticated } from '../shopify.server';

export async function loader({ request }) {
  const response = json({ body: 'data' });
  return await cors(request, response);
}

export async function action({ request }) {
  try {
    let mydata = [];
    const body = await request.json();
    const { storefront, session } = await unauthenticated.storefront(body.shop);
    if (body.apiType == "GET") {
      const productReviews = await getProductReviews(body.shop, "", session.accessToken);
      mydata = productReviews;

    }
    else if (body.apiType == "CREATE") {

    }
    const response = json({ body: mydata });
    return await cors(request, response);


  } catch (error) {
    console.error(error);
    const errorResponse = json({ body: { error: 'An error occurred.' } });
    return await cors(request, errorResponse);
  }
}
