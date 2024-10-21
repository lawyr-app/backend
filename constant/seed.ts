const regions = [
  { name: "Lakshadweep", id: 2496, nameSpaceName: "Lakshadweep" },
  {
    name: "Andaman and Nicobar Islands",
    id: 2454,
    nameSpaceName: "Andaman-and-Nicobar-Islands",
  },
  { name: "Andhra Pradesh", id: 2486, nameSpaceName: "Andhra-Pradesh" },
  { name: "Arunachal Pradesh", id: 2487, nameSpaceName: "Arunachal-Pradesh" },
  { name: "Assam", id: 2513, nameSpaceName: "Assam" },
  { name: "Bihar", id: 2488, nameSpaceName: "Bihar" },
  { name: "Chandigarh", id: 2489, nameSpaceName: "Chandigarh" },
  { name: "Chhattisgarh", id: 2490, nameSpaceName: "Chhattisgarh" },
  {
    nameSpaceName: "Dadra-and-Nagar-Haveli-and-Daman-and-Diu",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    id: 2492,
  },
  { nameSpaceName: "Delhi", name: "Delhi", id: 2493 },
  { nameSpaceName: "Goa", name: "Goa", id: 2514 },
  { nameSpaceName: "Gujarat", name: "Gujarat", id: 2455 },
  { nameSpaceName: "Haryana", name: "Haryana", id: 2193 },
  { nameSpaceName: "Himachal-Pradesh", name: "Himachal Pradesh", id: 2494 },
  { nameSpaceName: "Jammu-and-Kashmir", name: "Jammu and Kashmir", id: 2495 },
  { nameSpaceName: "Jharkhand", name: "Jharkhand", id: 2515 },
  { nameSpaceName: "Karnataka", name: "Karnataka", id: 2485 },
  { nameSpaceName: "Kerala", name: "Kerala", id: 2516 },
  { nameSpaceName: "Ladakh", name: "Ladakh", id: 14011 },
  { nameSpaceName: "Madhya-Pradesh", name: "Madhya Pradesh", id: 2497 },
  { nameSpaceName: "Maharashtra", name: "Maharashtra", id: 2517 },
  { nameSpaceName: "Manipur", name: "Manipur", id: 2498 },
  { nameSpaceName: "Meghalaya", name: "Meghalaya", id: 2499 },
  { nameSpaceName: "Mizoram", name: "Mizoram", id: 2500 },
  { nameSpaceName: "Nagaland", name: "Nagaland", id: 2501 },
  { nameSpaceName: "Odisha", name: "Odisha", id: 2502 },
  { nameSpaceName: "Puducherry", name: "Puducherry", id: 2503 },
  { nameSpaceName: "Punjab", name: "Punjab", id: 2504 },
  { nameSpaceName: "Rajasthan", name: "Rajasthan", id: 2505 },
  { nameSpaceName: "Sikkim", name: "Sikkim", id: 2506 },
  { nameSpaceName: "Tamil-Nadu", name: "Tamil Nadu", id: 2507 },
  { nameSpaceName: "Telangana", name: "Telangana", id: 2508 },
  { nameSpaceName: "Tripura", name: "Tripura", id: 2509 },
  { nameSpaceName: "Uttarakhand", name: "Uttarakhand", id: 2511 },
  { nameSpaceName: "Uttar-Pradesh", name: "Uttar Pradesh", id: 2510 },
  { nameSpaceName: "West-Bengal", name: "West Bengal", id: 2512 },
  { nameSpaceName: "India", name: "India", id: 1362 },
];

const websiteUrl = "https://www.indiacode.nic.in/handle/123456789";

const baseUrl = `${websiteUrl}/#ID/browse?type=shorttitle&sort_by=3&order=ASC&rpp=#LIMIT&etal=-1&null=&offset=0`;

export { regions, baseUrl, websiteUrl };
