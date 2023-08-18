const Like = require('../../models/reaction/likeModel');
const Dislike = require('../../models/reaction/dislikeModel');
const Blog = require('../../models/blog/blogModel');

exports.dislikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Blog.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const ipAddress = req.ip.includes('::ffff:')
      ? req.ip.split('::ffff:')[1]
      : req.ip;

    const existingLike = await Like.findOneAndDelete({
      post: postId,
      ipAddress: ipAddress,
    });

    if (existingLike) {
      post.likes.pull(existingLike._id);
    }

    const existingDislike = await Dislike.findOneAndDelete({
      post: postId,
      ipAddress: ipAddress,
    });

    if (existingDislike) {
      post.dislikes.pull(existingDislike._id);
    } else {
      const dislike = await Dislike.create({
        post: postId,
        ipAddress: ipAddress,
      });

      post.dislikes.push(dislike._id);
    }

    await post.save();

    res.status(201).json({
      status: 'Post Disliked!',
      data: {
        post: post,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
