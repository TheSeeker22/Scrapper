const mongoose = require('mongoose');

const newsImages = new mongoose.Schema({
    keywords: [String],
    article_id : { type: mongoose.Schema.Types.ObjectId, ref: 'headings', required: true },
    news_id : { type: mongoose.Schema.Types.ObjectId, ref: 'news', required: true },
    relevant_images: [String], // Array of image URLs
}, { timestamps: true });

module.exports = mongoose.model('newsimages', newsImages);
