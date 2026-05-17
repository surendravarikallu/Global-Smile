const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');

router.get('/', async (req, res) => {
  try {
    // Try DB first
    const notifications = await prisma.notification.findMany({
      where: req.query.userId ? { userId: req.query.userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unread = notifications.filter(n => !n.read).length;
    res.json({ notifications, unread });
  } catch (error) {
    // Fallback
    res.json({
      notifications: [
        { id: '1', title: 'Appointment Reminder', message: 'Your follow-up is scheduled for June 1st.', read: false, type: 'APPOINTMENT', createdAt: new Date().toISOString() },
        { id: '2', title: 'Treatment Update', message: 'Your healing progress looks excellent!', read: false, type: 'TREATMENT', createdAt: new Date().toISOString() },
      ],
      unread: 2,
    });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ notification });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Failed to update notification' });
  }
});
// ─── Twilio Webhook Auto-Responder ─────────────
const { twiml } = require('twilio');

router.post('/webhook', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const incomingMsg = req.body.Body ? req.body.Body.trim().toLowerCase() : '';
    const fromNumber = req.body.From; // format: +1234567890 or whatsapp:+1234567890

    console.log(`\n  💬 Received Reply from ${fromNumber}: "${req.body.Body}"`);

    const response = new twiml.MessagingResponse();

    // Check for confirmation keywords
    if (incomingMsg.includes('yes') || incomingMsg.includes('confirm') || incomingMsg === 'y') {
      response.message('Thank you! We have confirmed your appointment/medication. Global Smile Clinic is looking forward to seeing you. Let us know if you need any further assistance.');
      
      // Update DB if we had a specific mapping (for now we just console log)
      console.log(`  ✅ Patient ${fromNumber} confirmed!`);
    } else if (incomingMsg.includes('no') || incomingMsg.includes('cancel')) {
      response.message('Your appointment has been noted for cancellation/rescheduling. A member of our team will call you shortly to assist.');
      console.log(`  ❌ Patient ${fromNumber} cancelled/rejected!`);
    } else {
      // Default fallback / General questions
      response.message('Thank you for reaching out to Global Smile Clinic. We have received your message. Our dental team will review it and get back to you soon. For emergencies, please call our clinic directly.');
      console.log(`  ℹ Logged inquiry from ${fromNumber}`);
    }

    // Save the message to DB if patient exists
    try {
      const cleanPhone = fromNumber.replace('whatsapp:', '');
      const user = await prisma.user.findFirst({ where: { phone: { contains: cleanPhone.slice(-10) } }, include: { patient: true } });
      
      if (user && user.patient) {
        // Log it as an incoming message or generic reminder log status
        await prisma.reminderLog.create({
          data: {
            patientId: user.patient.id,
            type: 'message',
            channel: fromNumber.includes('whatsapp') ? 'WHATSAPP' : 'SMS',
            title: 'Patient Reply',
            message: req.body.Body,
            status: 'DELIVERED',
            scheduledAt: new Date(),
            sentAt: new Date()
          }
        });
      }
    } catch (e) {
      console.error('Failed to log incoming message to DB:', e.message);
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(500).end();
  }
});
const { sendMessage } = require('../services/notification.service.cjs');

// ─── Manual Test Endpoint for Admin UI ─────────
router.post('/test-message', express.json(), async (req, res) => {
  try {
    const { phone, message, channel } = req.body;
    if (!phone || !message || !channel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isWhatsApp = channel === 'WHATSAPP';
    const result = await sendMessage(phone, message, isWhatsApp);
    
    res.json({ success: true, sid: result.sid, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Test Message Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
