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
// export async function loader({ request }) {
//   const { admin, session } = await authenticate.admin(request);
//   const productReviews = await getProductReviews(session.shop, admin.graphql);
//   console.log(productReviews, '----');
//   return json({
//     productReviews,
//   });
// }
export default function ProductReviews() {
  const navigate = useNavigate();
  const customers = [
    {
      id: '3411',
      url: '/3411',
      name: 'Mae Jemison',
      location: 'Decatur, USA',
      ratings: 20,
      amountSpent: '$2,400',
    },
    {
      id: '2561',
      url: '#',
      name: 'Ellen Ochoa',
      location: 'Los Angeles, USA',
      ratings: 30,
      amountSpent: '$140',
    },
  ];
  const resourceName = {
    singular: 'customer',
    plural: 'customers',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(customers);
  const handleRowClick = (id, url) => {
    // console.log(`Clicked customer with ID: ${id} ${url}`);
    navigate(`/app/product-review/${id}`);
    // Add your logic to handle row click, e.g., navigating to a details page
  };
  const rowMarkup = customers.map(
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
    <Card>
      <IndexTable
        condensed={ useBreakpoints().smDown }
        resourceName={ resourceName }
        itemCount={ customers.length }
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
  );
}

