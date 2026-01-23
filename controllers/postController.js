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