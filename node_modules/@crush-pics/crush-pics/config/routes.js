const routes = {
   "dashboard": [
    [
      "get",
      "GET",
      "/dashboard",
    ],
  ],
  "invoices": [
    [
      "list",
      "GET",
      "/invoices",
    ],
  ],
  "account": [
    [
      "get",
      "GET",
      "/shop",
    ],
    [
      "update",
      "PATCH",
      "/shop",
    ],
  ],
  "original_images": [
    [
      "get",
      "GET",
      "/original_images/:id",
    ],
    [
      "list",
      "GET",
      "/original_images",
    ],
    [
      "create",
      "POST",
      "/original_images",
    ],
    [
      "compress",
      "POST",
      "/compress",
    ],
  ],
  "callback_urls": [
    [
      "list",
      "GET",
      "/callback_urls",
    ],
    [
      "create",
      "POST",
      "/callback_urls",
    ],
    [
      "delete",
      "DELETE",
      "/callback_urls/:id",
    ],
  ],
  "export": [
    [
      "get",
      "GET",
      "/export",
    ],
    [
      "create",
      "POST",
      "/export",
    ],
  ],
}

module.exports = routes
