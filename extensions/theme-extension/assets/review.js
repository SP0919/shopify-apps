async function postReview() {
  var comment = document.getElementById("comment").value;
  var customerId = document.getElementById("customerId").value;
  var productId = document.getElementById("productId").value;
  var selectedRating = null;
  for (var i = 1; i <= 5; i++) {
    var radio = document.getElementById("rating" + i);
    if (radio && radio.checked) {
      selectedRating = radio.value;
      break;
    }
  }
  if (!comment || !customerId || !productId || !selectedRating) {
    console.error("All fields are required");
    return;
  }
  let url =
    "https://ht-endif-heath-alternatively.trycloudflare.com/app/productreview";
  let data = {
    comment: comment,
    rating: selectedRating,
    customerId: customerId,
    productId: productId,
  };
  console.log("Data:", data);
  try {
    const authToken = "682319af3c83bc2e52d60a0aada4aaad";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    console.log("Response Data:", responseData);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}
