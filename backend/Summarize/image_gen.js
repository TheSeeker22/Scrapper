const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function fetchImageUrl(keywords) {
    try {
        const query = keywords.join("+");
        const url = `https://www.bing.com/images/search?q=${query}`;

        console.log("🔍 Searching for images on Bing...");
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        });

        const $ = cheerio.load(data);
        const imageUrls = [];

        $("img").each((index, element) => {
            const imgSrc = $(element).attr("src");
            if (imgSrc && imgSrc.startsWith("http")) {
                imageUrls.push(imgSrc);
            }
        });

        if (imageUrls.length > 0) {
            console.log("✅ Found Image:", imageUrls[0]);
            console.log("✅ Found Image:", imageUrls[1]);
            console.log("✅ Found Image:", imageUrls[2]);
            console.log("✅ Found Image:", imageUrls[3]);
            // Save image URL to a file
            fs.writeFileSync("image_url.txt", imageUrls[0]);
            console.log("✅ Image URL saved to image_url.txt");
        } else {
            console.log("❌ No images found.");
        }
    } catch (error) {
        console.error("❌ Error fetching image:", error.message);
    }
}

// Example usage
fetchImageUrl(['pm modi nagpur visit','pm modi in Nagpur','pm modi rss headquarter visit','pm modi Maharashtra visit','pm in Nagpur','pm rss','modi at rss nagpur']);

