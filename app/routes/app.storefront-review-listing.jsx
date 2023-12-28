
import { json, redirect } from "@remix-run/node";
import {
    IndexTable,
    Thumbnail,
    EmptyState,
    useIndexResourceState,
    Text,
    useBreakpoints,
    Card,
    Page,
    Layout,
    Icon,
    InlineStack,
} from '@shopify/polaris';
import {
    useActionData,
    useLoaderData,
    useNavigation,
    useSubmit,
    useNavigate,
} from "@remix-run/react";
import React, { useState } from 'react';
import { deleteProductReview, getProductReviews, getProductReviewsStorefront } from "../models/ProductReview.server";
import { authenticate } from '../shopify.server';
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
import db from "../db.server";


export async function loader({ request }) {

    const productReviews = await getProductReviewsStorefront(request.shop, request.accessToken);

    return json(productReviews);

}
export async function action({ request, params }) {
    return json({ 'status': true, 'message': "Rating Created" });
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    /** @type {any} */
    const data = {
        ...Object.fromEntries(await request.formData()),
        shop,
    };
    if (data.action === "delete") {
        await db.productReview.delete({ where: { id: Number(params.id) } });
        return redirect("/app");
    }
    const errors = validateProductReview(data);

    if (errors) {
        return json({ errors }, { status: 422 });
    }


    const productReview =
        params.id === "new"
            ? await db.productReview.create({ data })
            : await db.productReview.update({ where: { id: Number(params.id) }, data });

    return json({ 'status': true, 'message': "Rating Created" });
}



