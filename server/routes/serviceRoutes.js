const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const postgres = require('../config/postgres');
const { requireAdmin } = require('../middleware/auth');

// @route   GET /api/services
// @desc    Get all active services (or all services for admin or category filter)
router.get('/', async (req, res) => {
  try {
    const { category, search, includeInactive } = req.query;
    const filter = {};

    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter).sort({ popular: -1, createdAt: -1 });
    res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.json({ success: true, service });
  } catch (error) {
    console.error('Get service by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service.' });
  }
});

// @route   POST /api/admin/services
// @desc    Add a new service (Admin only)
router.post('/admin/services', requireAdmin, async (req, res) => {
  try {
    const { name, description, category, price, unit, image, isActive, turnaroundTime, popular } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required.',
      });
    }

    const service = new Service({
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category.trim(),
      price: Number(price),
      unit: unit ? unit.trim() : 'Piece',
      image: image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      turnaroundTime: turnaroundTime || '24-48 Hours',
      popular: Boolean(popular),
    });

    await service.save();

    // Synchronize to Supabase PostgreSQL
    try {
      await postgres.query(`
        INSERT INTO services (name, description, category, price, unit, image, is_active, turnaround_time, popular)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        service.name,
        service.description,
        service.category,
        service.price,
        service.unit,
        service.image,
        service.isActive,
        service.turnaroundTime,
        service.popular,
      ]);
    } catch (pgErr) {
      console.warn('Supabase service insert sync notice:', pgErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Service created successfully!',
      service,
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// @route   PUT /api/admin/services/:id
// @desc    Update a service (Admin only)
router.put('/admin/services/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, category, price, unit, image, isActive, turnaroundTime, popular } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const oldName = service.name;
    if (name !== undefined) service.name = name.trim();
    if (description !== undefined) service.description = description.trim();
    if (category !== undefined) service.category = category.trim();
    if (price !== undefined) service.price = Number(price);
    if (unit !== undefined) service.unit = unit.trim();
    if (image !== undefined) service.image = image;
    if (isActive !== undefined) service.isActive = Boolean(isActive);
    if (turnaroundTime !== undefined) service.turnaroundTime = turnaroundTime;
    if (popular !== undefined) service.popular = Boolean(popular);

    await service.save();

    // Synchronize update to Supabase PostgreSQL
    try {
      await postgres.query(`
        UPDATE services 
        SET name = $1, description = $2, category = $3, price = $4, unit = $5,
            image = $6, is_active = $7, turnaround_time = $8, popular = $9, updated_at = NOW()
        WHERE name = $10 OR name = $1
      `, [
        service.name,
        service.description,
        service.category,
        service.price,
        service.unit,
        service.image,
        service.isActive,
        service.turnaroundTime,
        service.popular,
        oldName,
      ]);
    } catch (pgErr) {
      console.warn('Supabase service update sync notice:', pgErr.message);
    }

    res.json({
      success: true,
      message: 'Service updated successfully!',
      service,
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
});

// @route   DELETE /api/admin/services/:id
// @desc    Delete a service (Admin only)
router.delete('/admin/services/:id', requireAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    // Synchronize delete to Supabase PostgreSQL
    try {
      await postgres.query('DELETE FROM services WHERE name = $1', [service.name]);
    } catch (pgErr) {
      console.warn('Supabase service delete sync notice:', pgErr.message);
    }

    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
});

module.exports = router;
