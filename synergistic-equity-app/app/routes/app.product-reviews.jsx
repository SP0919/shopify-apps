import { json } from "@remix-run/node";
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
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import React from 'react';
import { getProductReviews } from "../models/ProductReview.server";
import { authenticate } from '../shopify.server';
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const productReviews = await getProductReviews(session.shop, admin.graphql, session.accessToken);

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
export default function ProductReviews() {
  const navigate = useNavigate();
  const { productReviews } = useLoaderData();
  console.log(productReviews)
  const resourceName = {
    singular: 'Product Review',
    plural: 'Product Reviews',
  };
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(productReviews);
  const handleRowClick = (id) => {
    // console.log(`Clicked customer with ID: ${id} ${url}`);
    navigate(`/app/product-review/${id}`);
    // Add your logic to handle row click, e.g., navigating to a details page
  };
  const rowMarkup = productReviews.map(
    ({ id, productImage, productTitle, rating, comment, createdAt, first_name, last_name }, index) => (
      <IndexTable.Row
        id={ id }
        key={ id }
        selected={ selectedResources.includes(id) }
        position={ index }
        onClick={ () => handleRowClick(id) }
      >
        <IndexTable.Cell>
          <Thumbnail
            source={ productImage || ImageMajor }
            alt={ productTitle }
            size="small"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          { productTitle }
          {/* <Link to={ `/app/product-review/${productReview.id}` }>{ truncate(productReview.productTitle) }</Link> */ }
        </IndexTable.Cell>
        {/* <IndexTable.Cell>
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
    </IndexTable.Cell> */}

        <IndexTable.Cell>{ first_name } { last_name }</IndexTable.Cell>
        <IndexTable.Cell>{ comment }</IndexTable.Cell>
        <IndexTable.Cell>{ rating }</IndexTable.Cell>
        <IndexTable.Cell>
          { new Date(createdAt).toDateString() }
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );
  const bulkActions = [
    {
      content: 'Delete Reviews',
      onAction: () => console.log('Todo: implement bulk add tags'),
    },
    {
      content: 'Disable Reviews',
      onAction: () => console.log('Todo: implement bulk remove tags'),
    },
    {
      content: 'Activate Reviews',
      onAction: () => console.log('Todo: implement bulk Activate'),
    },
  ];
  return (
    <Page>
      <ui-title-bar title="Product Reviews">
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

              <IndexTable
                condensed={ useBreakpoints().smDown }
                resourceName={ resourceName }
                itemCount={ productReviews.length }
                selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={ handleSelectionChange }
                headings={ [
                  { title: 'Product Image' },
                  { title: 'Product' },
                  { title: 'Review By' },
                  { title: 'Comment' },
                  { title: 'Rating' },
                  { title: 'Created At' },
                  // {
                  //   id: 'order-count',
                  //   title: (
                  //     <Text as="span" alignment="end">
                  //       Order count
                  //     </Text>
                  //   ),
                  // },
                  // {
                  //   id: 'amount-spent',
                  //   hidden: false,
                  //   title: (
                  //     <Text as="span" alignment="end">
                  //       Amount spent
                  //     </Text>
                  //   ),
                  // },
                ] }
                bulkActions={ bulkActions }
              >
                { rowMarkup }
              </IndexTable>

            ) }
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

