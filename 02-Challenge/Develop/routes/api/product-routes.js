const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [Category, { model: Tag, through: ProductTag }], // Include associated Category and Tag data
    });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// GET one product by its ID
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId, {
      include: [Category, { model: Tag, through: ProductTag }], // Include associated Category and Tag data
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json(product);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// CREATE a new product
router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: newProduct.id,
        tag_id,
      }));

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// UPDATE a product by its ID
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Update product data
    await Product.update(req.body, {
      where: {
        id: productId,
      },
    });

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagsToRemove = await ProductTag.destroy({
        where: {
          product_id: productId,
          tag_id: { [Op.notIn]: req.body.tagIds },
        },
      });

      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: productId,
          tag_id,
        }));

      await ProductTag.bulkCreate(newProductTags);
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// DELETE a product by its ID
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Product.destroy({
      where: {
        id: productId,
      },
    });

    if (!deletedProduct) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json({ message: 'Product deleted successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
