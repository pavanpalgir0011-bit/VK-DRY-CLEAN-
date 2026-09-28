const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { requireAdmin } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit a contact inquiry (Public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email, and message.',
      });
    }

    const contact = new ContactMessage({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      message: message.trim(),
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent. We will get back to you shortly.',
      contact,
    });
  } catch (error) {
    console.error('Submit contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.',
    });
  }
});

// @route   GET /api/admin/messages
// @desc    Get all contact messages (Admin only)
router.get('/admin/messages', requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    const unreadCount = await ContactMessage.countDocuments({ isRead: false });

    res.json({
      success: true,
      unreadCount,
      messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact messages.' });
  }
});

// @route   PUT /api/admin/messages/:id/read
// @desc    Toggle or set message as read (Admin only)
router.put('/admin/messages/:id/read', requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    message.isRead = req.body.isRead !== undefined ? req.body.isRead : !message.isRead;
    await message.save();

    res.json({
      success: true,
      message: 'Message status updated.',
      contact: message,
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ success: false, message: 'Failed to update message.' });
  }
});

// @route   DELETE /api/admin/messages/:id
// @desc    Delete contact message (Admin only)
router.delete('/admin/messages/:id', requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully.',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
});

module.exports = router;
