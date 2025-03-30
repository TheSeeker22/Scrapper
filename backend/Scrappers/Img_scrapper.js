const axios = require("axios");
const cheerio = require("cheerio");

async function fetchImageUrls(searchQuery, numImages = 5) {
    try {
        const query = encodeURIComponent(searchQuery);
        const url = `https://www.bing.com/images/search?q=${query}&form=HDRSC2&first=1&tsc=ImageBasicHover`;

        console.log(`🔍 Searching for ${numImages} high-quality images on Bing for: ${searchQuery}`);
        const { data } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        const $ = cheerio.load(data);
        let imageUrls = [];

        // Extract full-resolution image URLs (Bing stores them in 'murl')
        $("a.iusc").each((index, element) => {
            const metadata = $(element).attr("m");
            const match = metadata && metadata.match(/"murl":"(https:\/\/[^"]+)"/);
            if (match) {
                imageUrls.push(match[1]);
            }
        });

        // Filter out unwanted URLs (Facebook, Lookaside, Redirects)
        imageUrls = imageUrls.filter(url => 
            !url.includes("lookaside.fbsbx.com") &&
            !url.includes("facebook.com") &&
            !url.includes("redirect") &&
            !url.includes("ad.doubleclick.net")
        );

        // Verify if URLs are directly accessible
        let validImageUrls = [];
        for (let imgUrl of imageUrls) {
            if (await isDirectImage(imgUrl)) {
                validImageUrls.push(imgUrl);
            }
            if (validImageUrls.length >= numImages) break; // Stop when we have enough
        }

        console.log(`✅ Returning ${validImageUrls.length} images for "${searchQuery}"`);
        return validImageUrls; // ✅ Now returns an array of image URLs
    } catch (error) {
        console.error("❌ Error fetching images:", error.message);
        return []; // ✅ Returns an empty array if an error occurs
    }
}

// Helper function to check if a URL is a direct image link
async function isDirectImage(url) {
    try {
        const response = await axios.head(url, { timeout: 5000 });
        const contentType = response.headers["content-type"];
        return contentType && contentType.startsWith("image");
    } catch {
        return false; // Skip URLs that fail to load
    }
}

module.exports = fetchImageUrls;
