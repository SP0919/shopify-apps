import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Icon,
  InlineStack,
} from "@shopify/polaris";

import { getProductReviews } from "../models/ProductReview.server";

import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const productReviews = await getProductReviews(session.shop, admin.graphql);

  return json({
    productReviews,
  });
}

const EmptyProductReviewState = ({ onAction }) => (
  <EmptyState
    heading="Create Product for your product"
    action={ {
      content: "Create Product Review",
      onAction,
    } }
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>Allow customer to review on products.</p>
  </EmptyState>
);

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

const ProductReviewTable = ({ productReviews }) => (
  <IndexTable
    resourceName={ {
      singular: "Product Review",
      plural: "Product Review",
    } }
    itemCount={ productReviews.length }
    headings={ [

      { title: "Rating" },
      { title: "Product" },
      { title: "Date created" },
      { title: "Scans" },
    ] }
    selectable={ false }
  >
    { productReviews.map((productReview) => (
      <ProductReviewTableRow key={ productReview.id } productReview={ productReview } />
    )) }
  </IndexTable>
);

const ProductReviewTableRow = ({ productReview }) => (
  <IndexTable.Row id={ productReview.id } position={ productReview.id }>
    <IndexTable.Cell>
      <Thumbnail
        source={ productReview.productImage || ImageMajor }
        alt={ productReview.productTitle }
        size="small"
      />
    </IndexTable.Cell>
    <IndexTable.Cell>
      <Link to={ `product-review/${productReview.id}` }>{ truncate(productReview.title) }</Link>
    </IndexTable.Cell>
    <IndexTable.Cell>
      { productReview.productDeleted ? (
        <InlineStack align="start" gap="200">
          <span style={ { width: "20px" } }>
            <Icon source={ DiamondAlertMajor } tone="critical" />
          </span>
          <Text tone="critical" as="span">
            product has been deleted
          </Text>
        </InlineStack>
      ) : (
        truncate(productReview.productTitle)
      ) }
    </IndexTable.Cell>
    <IndexTable.Cell>
      { new Date(productReview.createdAt).toDateString() }
    </IndexTable.Cell>
    <IndexTable.Cell>{ productReview.scans }</IndexTable.Cell>
  </IndexTable.Row>
);

export default function ProductReviews() {
  const { productReviews } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page>
      <ui-title-bar title="Product Review">
        <button variant="primary" onClick={ () => navigate("/app/product-review/new") }>
          Create Product Review
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            { productReviews.length === 0 ? (
              <EmptyProductReviewState onAction={ () => navigate("/app/product-review/new") } />
            ) : (
              <ProductReviewTable productReviews={ productReviews } />
            ) }
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
