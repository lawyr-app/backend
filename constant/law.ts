const LIMIT = 2000;

const fullDomain = "https://www.indiacode.nic.in";

const websiteUrl = `${fullDomain}/handle/123456789`;

const baseUrl = `${websiteUrl}/#ID/browse?type=shorttitle&sort_by=3&order=ASC&rpp=${LIMIT}&etal=-1&null=&offset=0`;

export { baseUrl, websiteUrl, fullDomain };
