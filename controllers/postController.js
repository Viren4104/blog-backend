const Post = require('../models/Post');

// 1. Create a Post
exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newPost = await Post.create({ 
            title, 
            content, 
            UserId: req.user.id // Link post to the logged-in user
        });
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Get All Posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Update a Post (THIS WAS MISSING)
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // Perform the update
        const [updated] = await Post.update(
            { title, content },
            { where: { id } }
        );

        if (updated) {
            const updatedPost = await Post.findByPk(id);
            res.json({ message: 'Post updated successfully', post: updatedPost });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Delete a Post
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Post.destroy({ where: { id } });
        
        if (deleted) {
            res.json({ message: 'Post deleted' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};