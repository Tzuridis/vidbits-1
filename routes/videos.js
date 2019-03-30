const router = require('express').Router();
const Video = require('../models/video');

router.get('/videos', async (request, response) => {
  const videos = await Video.find({});

  response.render('videos/index', {videos});
});

router.get('/videos/create', (request, response) => {
  response.render('videos/create');
});

router.get('/videos/:id', async (request, response) => {
  const video = await findVideo(request);

  response.render('videos/show', {video});
});

router.get('/videos/:id/edit', async (request, response) => {
  const video = await findVideo(request);

  response.render('videos/edit', {video});
});

router.post('/videos/:id/updates', async (request, response) => {
  const video = await findVideo(request);

  buildVideo(video, request.body);

  if (video.errors) {
    response.status(400);
    response.render('videos/edit', {video});
  } else {
    await video.save();

    response.redirect(`/videos/${video._id}`);
  }
});

router.post('/videos/:id/deletions', async (request, response) => {
  const {id} = request.params;

  await Video.deleteOne({ _id: id });

  response.redirect('/');
});

router.post('/videos', async (request, response) => {
  const video = new Video();



  if (video.errors) {
    response.status(400);
    response.render('videos/create', {video});
  } else {
    await video.save();

    response.redirect(`/videos/${video._id}`);
  }
});

const findVideo = async (request) => {
  const {id} = request.params;

  return await Video.findOne({ _id: id });
}


module.exports = router;
