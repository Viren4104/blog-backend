const Post = require('../models/Post');

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Create a post
exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // Check if user has permission to create
        if (!req.user.can_create && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You don't have permission to create posts" });
        }

        const post = await Post.create({ 
            title, 
            content, 
            userId: req.user.id 
        });

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: "Error creating post" });
    }
};

// ✅ NEW: Update (Edit) a post
exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content } = req.body;

        // 1. Permission Check: Must have can_edit or be an admin
        if (!req.user.can_edit && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You don't have permission to edit posts" });
        }

        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Update the post with new data
        post.title = title || post.title;
        post.content = content || post.content;
        await post.save();

        res.json({ success: true, post });
    } catch (err) {
        res.status(500).json({ message: "Error updating post" });
    }
};

// ✅ NEW: Delete a post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        // 1. Permission Check: Must have can_delete or be an admin
        if (!req.user.can_delete && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You don't have permission to delete posts" });
        }

        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await post.destroy();

        res.json({ success: true, message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting post" });
    }
};