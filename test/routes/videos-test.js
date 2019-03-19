const {assert} = require('chai');
const request = require('supertest');
const {jsdom} = require('jsdom');
const app = require('../../app');
const Video = require('../../models/video');
const {parseTextFromHTML, seedItemToDatabase, connectDatabase, disconnectDatabase, findVideoElementBySource} = require('../test-utils');

describe('GET /videos', () => {


    beforeEach(connectDatabase);

    afterEach(disconnectDatabase);

    it('renders existing Videos', async () => {
      const firstItem = await seedItemToDatabase({title: 'Item1', videoUrl: 'http://youtube/3.14'});
      const secondItem = await seedItemToDatabase({title: 'Item2', videoUrl: 'http://vimeo/2.71'});

      const response = await request(app)
        .get('/');
        //.get('/videos');

      assert.include(parseTextFromHTML(response.text, `#video-${firstItem._id} .video-title`), firstItem.title);
      assert.ok(findVideoElementBySource(response.text, firstItem.videoUrl));
      assert.include(parseTextFromHTML(response.text, `#video-${secondItem._id} .video-title`), secondItem.title);
      assert.ok(findVideoElementBySource(response.text, secondItem.videoUrl));

    });

});

describe('GET /videos/:id', () => {
  beforeEach(connectDatabase);

  afterEach(disconnectDatabase);

  it('renders the Video', async () => {
    const videoItem = await seedItemToDatabase({title: 'Item1', description: 'test item description', videoUrl: 'https://test.item.com'});

    const response = await request(app)
      .get(`/videos/${videoItem._id}`);

    assert.include(parseTextFromHTML(response.text, `.video-title`), videoItem.title);
    assert.include(parseTextFromHTML(response.text, `.video-description`), videoItem.description);
    assert.ok(findVideoElementBySource(response.text, videoItem.videoUrl));
    //assert.deepInclude(response.text, {videoItem});
  });
});

describe('GET /videos/:id/edit', () => {
  beforeEach(connectDatabase);
  afterEach(disconnectDatabase);

  it('renders a form for the Video', async () => {
    const videoItem = await seedItemToDatabase();

    const response = await request(app)
      .get(`/videos/${videoItem._id}/edit`);

    const titleTest = jsdom(response.text).querySelector(`#title-input`).value;
    const urlTest = jsdom(response.text).querySelector(`#videoUrl-input`).value;

    assert.equal(titleTest, videoItem.title);
    assert.equal(parseTextFromHTML(response.text, `#description-input`), videoItem.description);
    assert.equal(urlTest, videoItem.videoUrl);
  });
});

describe('POST /videos/:id/updates', () => {

  beforeEach(connectDatabase);
  afterEach(disconnectDatabase);

  it('updates the record', async () => {
    const itemToUpdate = await seedItemToDatabase();

    const response1 = await request(app)
      .get(`/videos/${itemToUpdate._id}/edit`);

    const newProps = {
      title: 'Updated title',
      description: 'Updated description',
      videoUrl: 'updated URL'
    };

    itemToUpdate.title= newProps.title;
    itemToUpdate.description=newProps.description;
    itemToUpdate.videoUrl = newProps.videoUrl;

    console.log(`itemToUpdate = ${itemToUpdate}`);
    console.log(`itemToUpdate._id = ${itemToUpdate._id}`);

    const response2 = await request(app)
      .post(`/videos/${itemToUpdate._id}/updates`)
      .type('form')
      .send(itemToUpdate);

    const updatedItem = Video.findById(itemToUpdate._id);

    assert.equal(updatedItem.title, newProps.title);
    assert.equal(updatedItem.description, newProps.description);
    assert.equal(updatedItem.videoUrl, newProps.videoUrl);
    //assert.equal(parseTextFromHTML(response2.text,'.video-title'), newProps.title);

  });
  it('redirects to the show page', async () => {});
  describe('when the record is invalid',() => {
    it('does not save the record', async () => {});
    it('responds with a 400', async () => {});
    it('renders the Edit form', async () => {});
  });
});
