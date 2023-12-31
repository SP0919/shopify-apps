import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  InlineStack,
  InlineError,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { ImageMajor } from "@shopify/polaris-icons";

import db from "../db.server";
import { getProductReview, validateProductReview } from "../models/ProductReview.server";
import fetch from 'node-fetch';


// export async function loader({ request, params }) {
//   const { admin } = await authenticate.admin(request);

//   if (params.id === "new") {
//     return json({
//       destination: "product",
//       saveHandle: "new",
//       title: "",
//     });
//   }

//   return json(await getProductReview(Number(params.id), admin.graphql));
// }
export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);

  if (params.id === "new") {
    return json({
      destination: "product",
      saveHandle: "new",
      title: "",
      // customers,
    });
  }

  return json(await getProductReview(Number(params.id), admin.graphql, session.accessToken));
}



export async function action({ request, params }) {
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

  if (data.action === "changeStatus") {

    await db.productReview.update({ where: { id: Number(params.id) }, data });
    return redirect("/app/product-review/" + params.id);
  }
  const productReview =
    params.id === "new"
      ? await db.productReview.create({ data })
      : await db.productReview.update({ where: { id: Number(params.id) }, data });

  return redirect(`/app`);
}

export default function ProductReviewForm() {

  const errors = useActionData()?.errors || {};

  const productReview = useLoaderData();

  const [ formState, setFormState ] = useState(productReview);
  const [ cleanFormState, setCleanFormState ] = useState(productReview);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";
  const isStausChanging =
    nav.state === "submitting" && nav.formData?.get("action") === "changeStatus";

  const navigate = useNavigate();



  const submit = useSubmit();
  function handleSave() {
    const data = {

      productId: formState.productId || 8027309211897,
      userId: formState.userId || 7083761008889,
      rating: formState.rating || 5,
      comment: formState.comment || "",
      status: formState.status || "ACTIVE",

    };

    setCleanFormState({ ...formState });
    console.log(data, '----------')
    submit(data, { method: "post" });
  }
  function handleStatusChange(type) {
    const data = {

      productId: formState.productId || 8027309211897,
      userId: formState.userId || 7083761008889,
      rating: formState.rating || 5,
      comment: formState.comment || "",
      status: type,

    };

    setCleanFormState({ ...formState });

    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title={ productReview.id ? "Edit Product Review" : "Create new Product Review" }>
        <button variant="breadcrumb" onClick={ () => navigate("/app") }>
          Product Reviews
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={ "h2" } variant="headingLg">
                  Comment
                </Text>
                <TextField
                  id="comment"

                  label="comment"
                  labelHidden
                  autoComplete="off"
                  value={ formState.comment }
                  onChange={ (comment) => setFormState({ ...formState, comment }) }
                  error={ errors.comment }
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="500">
                <Text as={ "h2" } variant="headingLg">
                  Rating
                </Text>
                <TextField
                  id="rating"

                  label="rating"
                  labelHidden
                  autoComplete="off"
                  value={ formState.rating }
                  onChange={ (rating) => setFormState({ ...formState, rating }) }
                  error={ errors.rating }
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <InlineStack align="space-between">
                  <Text as={ "h2" } variant="headingLg">
                    Product
                  </Text>

                </InlineStack>
                { formState.productId ? (
                  <InlineStack blockAlign="center" gap="500">
                    <Thumbnail
                      source={ formState.productImage || ImageMajor }
                      alt={ formState.productAlt }
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      { formState.productTitle }
                    </Text>
                  </InlineStack>
                ) : (
                  <BlockStack gap="200">

                    { errors.productId ? (
                      <InlineError
                        message={ errors.productId }
                        fieldID="myFieldID"
                      />
                    ) : null }
                  </BlockStack>
                ) }
                <Bleed marginInlineStart="200" marginInlineEnd="200">
                  <Divider />
                </Bleed>

              </BlockStack>
            </Card>

            {/* <Card>
              <BlockStack gap="500">
                <InlineStack align="space-between">
                  <Text as={ "h2" } variant="headingLg">
                    Customer
                  </Text>
                  { formState.customerId ? (
                    <Button variant="plain" onClick={ selectCustomer }>
                      Change customer
                    </Button>
                  ) : null }
                </InlineStack>
                { formState.customerId ? (
                  <InlineStack blockAlign="center" gap="500">
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      { formState.customerDisplayName } ({ formState.customerEmail })
                    </Text>
                  </InlineStack>
                ) : (
                  <BlockStack gap="200">
                    <Button onClick={ selectCustomer } id="select-customer">
                      Select customer
                    </Button>
                    { errors.customerId ? (
                      <InlineError
                        message={ errors.customerId }
                        fieldID="customerId"
                      />
                    ) : null }
                  </BlockStack>
                ) }
              </BlockStack>
            </Card> */}
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <PageActions
            secondaryActions={ (formState.saveHandle != "new") ? [
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !productReview.id || !productReview || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
              (formState.status == "ACTIVE") ?
                {
                  content: "Disable",
                  loading: isStausChanging,
                  disabled: !productReview.id || !productReview || isSaving || isDeleting || isStausChanging,
                  primary: true,
                  onClick: () => handleStatusChange("DISABLE")
                } : {

                  content: "Activate",
                  loading: isDeleting,
                  disabled: !productReview.id || !productReview || isSaving || isDeleting || isStausChanging,
                  primary: true,
                  onClick: () => handleStatusChange("ACTIVATE"),

                }
            ] : "" }

            primaryAction={ (formState.saveHandle == "new") ? {
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting || isStausChanging,
              onAction: handleSave,
            } : "" }
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
