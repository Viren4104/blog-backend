const Post = require('../models/Post');

// ==============================
// GET ALL POSTS
// ==============================
exports.getAllPosts = async (req, res) => {
  const posts = await Post.findAll({ order: [['id', 'DESC']] });
  res.json(posts);
};

// ==============================
// CREATE POST (can_create)
// ==============================
exports.createPost = async (req, res) => {
  if (!req.user.can_create) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const post = await Post.create({
    title: req.body.title,
    content: req.body.content,
    userId: req.user.id
  });

  res.status(201).json(post);
};

// ==============================
// UPDATE POST (can_edit)
// ==============================
exports.updatePost = async (req, res) => {
  if (!req.user.can_edit) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const post = await Post.findByPk(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  post.title = req.body.title ?? post.title;
  post.content = req.body.content ?? post.content;
  await post.save();

  res.json(post);
};

// ==============================
// DELETE POST (can_delete) 🔥
// ==============================
exports.deletePost = async (req, res) => {
  if (!req.user.can_delete) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const post = await Post.findByPk(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  await post.destroy();

  res.json({ message: 'Post deleted successfully' });
};
