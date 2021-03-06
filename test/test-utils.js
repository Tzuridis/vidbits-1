const {jsdom} = require('jsdom');
const {mongoose, databaseUrl, options} = require('../database');
const Video = require('../models/video');


// extract text from an Element by selector.
const parseTextFromHTML = (htmlAsString, selector) => {
  const selectedElement = jsdom(htmlAsString).querySelector(selector);
  if (selectedElement !== null) {
    return selectedElement.textContent;
  } else {
    throw new Error(`No element with selector ${selector} found in HTML string`);
  }
};

//extract video with given src in iframe
const findVideoElementBySource = (htmlAsString, src) => {
  const video = jsdom(htmlAsString).querySelector(`iframe[src="${src}"]`);
  if (video !== null) {
    return video;
  } else {
    throw new Error(`Video with src "${src}" not found in HTML string`);
  }
};

const connectDatabase = async () => {
  await mongoose.connect(databaseUrl, options);
  await mongoose.connection.db.dropDatabase();
};

const disconnectDatabase = async () => {
   await mongoose.disconnect();
};

// Create and return a sample Item object
const buildItemObject = (options = {}) => {
  const title = options.title || 'Excited train guy, New York!';
  const videoUrl = options.videoUrl || 'https://www.youtube.com/embed/6lutNECOZFw';
  const description = options.description || 'This guy is so into his trains';
  return {title, videoUrl, description};
};

// Add a sample Item object to mongodb
const seedItemToDatabase = async (options = {}) => {
  const video = await Video.create(buildItemObject(options));
  return video;
};

const newProps = {
  title: 'Updated title',
  description: 'Updated description',
  videoUrl: 'updated URL'
};

const updatedVideoInformation = {
  title: newProps.title,
  videoUrl: newProps.videoUrl,
  description: newProps.description
};

module.exports = {
  buildItemObject,
  seedItemToDatabase,
  newProps,
  updatedVideoInformation,
  parseTextFromHTML,
  findVideoElementBySource,
  connectDatabase,
  disconnectDatabase,
};
