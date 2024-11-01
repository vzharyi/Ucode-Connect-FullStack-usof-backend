import Post from '../models/posts.js';
import Category from '../models/categories.js';

class CategoryController {
    async getCategories(req, res) {
        try {
            const { category_id: categoryId } = req.params;

            if (categoryId) {
                const category = await Category.findByPk(categoryId);

                if (!category) {
                    return res.status(404).json({ error: 'Category not found' });
                }

                return res.status(200).json(category);
            } else {
                const categories = await Category.findAll();
                return res.status(200).json(categories);
            }
        } catch (error) {
            return res.status(500).json({ error: 'Error retrieving categories', details: error.message });
        }
    }

    async getPostsByCategory(req, res) {
        try {
            const { category_id: categoryId } = req.params;
            const category = await Category.findByPk(categoryId, {
                include: [{ model: Post, as: 'posts' }]
            });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.status(200).json(category.posts);
        } catch (error) {
            res.status(500).json({ error: 'Error retrieving posts for category', details: error.message });
        }
    }

    async createCategory(req, res) {
        try {
            const { title, description } = req.body;

            if (!title) {
                return res.status(400).json({ error: 'The title field is required' });
            }

            const category = await Category.create({ title, description });
            res.status(201).json({ message: 'Category created successfully', category });
        } catch (error) {
            res.status(500).json({ error: 'Error creating category', details: error.message });
        }
    }

    async updateCategory(req, res) {
        try {
            const { category_id: categoryId } = req.params;
            const { title, description } = req.body;

            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            if (title) category.title = title;
            if (description) category.description = description;
            await category.save();

            res.status(200).json({ message: 'Category updated successfully', category });
        } catch (error) {
            res.status(500).json({ error: 'Error updating category', details: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            const { category_id: categoryId } = req.params;

            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            await category.destroy();
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting category', details: error.message });
        }
    }
}

export default new CategoryController();
