import {
  IndexTable,


  useIndexResourceState,
  Text,
  useBreakpoints,
  Card,
} from '@shopify/polaris';
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import React from 'react';
import { getProductReviews } from "../models/ProductReview.server";
import { authenticate } from '../shopify.server';

import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";

export async function loadProductReviews({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const productReviews = await getProductReviews(session.shop, admin.graphql);

  return json({
    productReviews, json
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
  const { productReviews } = useLoaderData();;
  const resourceName = {
    singular: 'Product Review',
    plural: 'Product Reviews',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(productReviews);
  const handleRowClick = (id, url) => {
    // console.log(`Clicked customer with ID: ${id} ${url}`);
    navigate(`/app/product-review/${id}`);
    // Add your logic to handle row click, e.g., navigating to a details page
  };
  const rowMarkup = productReviews.map(
    ({ id, url, name, location, ratings, amountSpent }, index) => (
      <IndexTable.Row
        id={ id }
        key={ id }
        selected={ selectedResources.includes(id) }
        position={ index }
        onClick={ () => handleRowClick(id, url) }

      >
        <IndexTable.Cell>

          <Text fontWeight="bold" as="span">
            { name }
          </Text>

        </IndexTable.Cell>
        <IndexTable.Cell >{ location }</IndexTable.Cell>
        <IndexTable.Cell>

          { ratings }

        </IndexTable.Cell>
        <IndexTable.Cell>

          { amountSpent }

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
    // {
    //   content: 'Delete ratings',
    //   onAction: () => console.log('Todo: implement bulk delete'),
    // },
  ];
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
              <Card>
                <IndexTable
                  condensed={ useBreakpoints().smDown }
                  resourceName={ resourceName }
                  itemCount={ productReviews.length }
                  selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources.length
                  }
                  onSelectionChange={ handleSelectionChange }
                  headings={ [
                    { title: 'Name' },
                    { title: 'Location' },
                    { title: 'Reviews' },
                    { title: 'Amount Spent' },
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
              </Card>
            ) }
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

