async function postReview(type) {
  const authToken = "298ed65bc38dfac39cfd98f28662f75c";
  const url =
    "https://mug-wallpapers-steady-discounted.trycloudflare.com/product-review-ajax";

  let data = {};
  if (type == 1) {
    const comment = document.getElementById("comment").value;
    const rating = document.getElementById("rating").value;
    const customerId = document.getElementById("customerId").value;
    const productId = document.getElementById("productId").value;
    const shopId = document.getElementById("shopId").value;
    data = {
      comment: comment,
      rating: rating,
      customerId: customerId,
      productId: productId,
      shop: shopId,
      apiType: "CREATE",
    };
  } else {
    const productId = document.getElementById("productId").value;
    const shopId = document.getElementById("shopId").value;
    data = {
      productId: productId,
      shop: shopId,
      apiType: "GET",
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        shop: "typo-001.myshopify.com",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Message sent successfully.");
    } else {
      console.error("Some error occurred:", response);
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Assuming you want to call postReview with type 1 on page load
  postReview(0);

  // Alternatively, if you want to call postReview with type 0 on page load
  // postReview(0);
});
