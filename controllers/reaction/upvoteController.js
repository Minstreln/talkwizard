const Upvote = require('../../models/reaction/upvoteModel');
const Blog = require('../../models/blog/blogModel');

exports.upvotePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Blog.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const ipAddress = req.ip.includes('::ffff:')
      ? req.ip.split('::ffff:')[1]
      : req.ip;

    const existingUpvote = await Upvote.findOne({ post: postId, ipAddress });

    if (existingUpvote) {
      return res.status(409).json({ message: 'You have already upvoted this post' });
    }

    const upvote = new Upvote({ post: postId, ipAddress });
    await upvote.save();
    post.upvotes.push(upvote._id);
    await post.save();

    await post.save();

    res.status(201).json({
      status: 'success',
      data: {
        post: post,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
