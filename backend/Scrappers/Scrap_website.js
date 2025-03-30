const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const mongoose = require('mongoose');
const connectDB = require('../Utils/mongo_utils');
const summarizeText = require('../Summarize/hugging_face');
const nlp = require('../Summarize/nlp');
const News = require('../Models/newsModel');
const Headings = require('../Models/headingModel');
const NewsImages = require('../Models/imgModels');
const img_scrap = require('./Img_scrapper');

async function summarize_data(data, image, keywords, heading, heading_id) {
    const summ_text = await nlp(data);
    if (!summ_text) {
        console.log('Got empty result');
        return;
    }
   

    // Create the news entry first and get its ID
    const newsEntry = await News.create({
        heading,
        keywords,
        data: summ_text,
        image,
        article_id: heading_id
    });
    if (!newsEntry || !newsEntry.id) {
        console.log('Failed to create News entry.');
        return;
    }
    const images = await img_scrap(keywords);
    if (!images || images.length === 0) {
        console.log('No images found for keywords:', keywords);
        return;
    }

    // Now create NewsImages using the obtained news ID
    await NewsImages.create({
        keywords,
        article_id: heading_id,
        news_id: newsEntry.id, // ✅ Use the ID of the newly created news entry
        relevant_images: images
    });

    console.log('✅ News and images successfully saved.');
}

async function data_update(url, heading_id) {
    console.log('Processing URL:', url);

    try {
        const { data } = await axios.get(url, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        const $ = cheerio.load(data);

        $('script[type^="application"]').each((_, element) => {
            try {
                const jsonText = $(element).html().trim();
                const parsedata = JSON.parse(jsonText);

                if (parsedata['@type'] === "NewsArticle" && parsedata['headline']) {
                    summarize_data(parsedata['articleBody'], parsedata['image'], parsedata['keywords'], parsedata['headline'], heading_id);
                }
            } catch (error) {
                console.log('Error in article scraping:', error.message);
            }
        });
    } catch (error) {
        console.error('Error fetching article:', error.message);
    }
}

async function scrapeWebsite() {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.error(" MongoDB not connected.");
            await connectDB();
        }

        const all_data = await Headings.find().lean();

        if (!all_data.length) {
            console.log("No headings found in the database.");
            return;
        }

        for (const doc of all_data) {
            await new Promise(resolve => setTimeout(resolve, 2800));
            console.log(doc.link[0])
            await data_update(doc.link[0], doc._id);
        }

    } catch (error) {
        console.error('Error scraping website:', error.message);
    }
}


scrapeWebsite();
// module.exports = scrapeWebsite;
