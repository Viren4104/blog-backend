const Post = require('../models/Post');

/**
 * @desc Get all posts
 * @route GET /api/posts
 * @access Public
 */
exports.getAllPosts = async (req, res) => {
    try {
        // Fetches all listings from Neon DB, newest first
        const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
        res.json(posts);
    } catch (err) {
        console.error("Fetch Posts Error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc Create a property post
 * @route POST /api/posts
 * @access Protected (requires can_create or admin)
 */
exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // 🛡️ RBAC Check: Validates permission attached by protect middleware
        if (!req.user.can_create && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: You do not have permission to create listings" });
        }

        // Creates record and links it to the logged-in user (Viren/Admin)
        const post = await Post.create({ 
            title, 
            content, 
            userId: req.user.id 
        });

        res.status(201).json(post);
    } catch (err) {
        console.error("Create Post Error:", err.message);
        res.status(500).json({ message: "Error creating listing" });
    }
};

/**
 * @desc Update/Edit a post
 * @route PUT /api/posts/:postId
 * @access Protected (requires can_edit or admin)
 */
exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content } = req.body;

        // 🛡️ RBAC Check: Ensures the user has editing rights
        if (!req.user.can_edit && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: You do not have permission to edit" });
        }

        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: "Listing not found" });

        // Update fields only if they are provided in the request
        post.title = title || post.title;
        post.content = content || post.content;
        await post.save();

        res.json({ success: true, post });
    } catch (err) {
        console.error("Update Post Error:", err.message);
        res.status(500).json({ message: "Error updating listing" });
    }
};

/**
 * @desc Delete a post
 * @route DELETE /api/posts/:postId
 * @access Protected (requires can_delete or admin)
 */
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        // 🛡️ RBAC Check: Only admins or users with delete permission
        if (!req.user.can_delete && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: You do not have permission to delete" });
        }

        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: "Listing not found" });

        await post.destroy(); // Remove from Neon DB

        res.json({ success: true, message: "Listing deleted successfully" });
    } catch (err) {
        console.error("Delete Post Error:", err.message);
        res.status(500).json({ message: "Error deleting listing" });
    }
};