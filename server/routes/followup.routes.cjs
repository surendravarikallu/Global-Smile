const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');

// ─── Get Follow-Up Rules ───────────────────────
router.get('/rules', async (req, res) => {
  try {
    const { treatmentType } = req.query;
    const where = { isActive: true };
    if (treatmentType) where.treatmentType = treatmentType;

    const rules = await prisma.followUpRule.findMany({
      where,
      orderBy: { dayAfter: 'asc' },
    });

    // Group by treatment type
    const grouped = {};
    rules.forEach(r => {
      if (!grouped[r.treatmentType]) grouped[r.treatmentType] = [];
      grouped[r.treatmentType].push(r);
    });

    res.json({ rules, grouped, total: rules.length });
  } catch (error) {
    console.error('FollowUp Rules Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch follow-up rules' });
  }
});

// ─── Create Follow-Up Rule ─────────────────────
router.post('/rules', async (req, res) => {
  try {
    const { treatmentType, dayAfter, type, title, message, channel, priority } = req.body;

    if (!treatmentType || dayAfter === undefined || !title || !message) {
      return res.status(400).json({ error: 'treatmentType, dayAfter, title, and message required' });
    }

    const validChannels = ['WHATSAPP', 'SMS', 'EMAIL', 'PUSH'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    const rule = await prisma.followUpRule.create({
      data: {
        treatmentType: treatmentType.trim().substring(0, 100),
        dayAfter: Math.max(0, Math.min(365, parseInt(dayAfter) || 0)),
        type: type || 'checkup',
        title: title.trim().substring(0, 200),
        message: message.trim().substring(0, 1000),
        channel: validChannels.includes(channel) ? channel : 'PUSH',
        priority: validPriorities.includes(priority) ? priority : 'MEDIUM',
        isActive: true,
      },
    });
    res.status(201).json({ rule });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create follow-up rule' });
  }
});

// ─── Generate Follow-Ups for a Patient ─────────
router.post('/generate', async (req, res) => {
  try {
    const { patientId, treatmentType, treatmentDate } = req.body;

    if (!patientId || !treatmentType || !treatmentDate) {
      return res.status(400).json({ error: 'patientId, treatmentType, and treatmentDate required' });
    }

    const baseDate = new Date(treatmentDate);
    if (isNaN(baseDate.getTime())) {
      return res.status(400).json({ error: 'Invalid treatmentDate' });
    }

    // Get all rules for this treatment
    const rules = await prisma.followUpRule.findMany({
      where: { treatmentType, isActive: true },
      orderBy: { dayAfter: 'asc' },
    });

    if (rules.length === 0) {
      return res.status(404).json({ error: `No follow-up rules found for "${treatmentType}"` });
    }

    // Generate reminder logs from rules
    const reminders = rules.map(rule => {
      const scheduledAt = new Date(baseDate);
      scheduledAt.setDate(scheduledAt.getDate() + rule.dayAfter);
      scheduledAt.setHours(9, 0, 0, 0); // Default 9 AM

      return {
        patientId,
        type: 'followup',
        channel: rule.channel,
        title: rule.title,
        message: rule.message,
        status: 'SCHEDULED',
        scheduledAt,
      };
    });

    await prisma.reminderLog.createMany({ data: reminders });

    res.status(201).json({
      generated: reminders.length,
      reminders: reminders.map(r => ({
        title: r.title,
        scheduledAt: r.scheduledAt,
        channel: r.channel,
      })),
    });
  } catch (error) {
    console.error('Generate Follow-ups Error:', error.message);
    res.status(500).json({ error: 'Failed to generate follow-ups' });
  }
});

// ─── Get Reminder Log ──────────────────────────
router.get('/reminders/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, type } = req.query;

    const where = { patientId };
    if (status) where.status = status;
    if (type) where.type = type;

    const reminders = await prisma.reminderLog.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      take: 50,
    });

    const stats = {
      total: reminders.length,
      scheduled: reminders.filter(r => r.status === 'SCHEDULED').length,
      sent: reminders.filter(r => r.status === 'SENT').length,
      delivered: reminders.filter(r => r.status === 'DELIVERED').length,
      failed: reminders.filter(r => r.status === 'FAILED').length,
    };

    res.json({ reminders, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// ─── Update Reminder Status ────────────────────
router.put('/reminders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['SCHEDULED', 'SENT', 'DELIVERED', 'READ', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status', valid: validStatuses });
    }

    const data = { status };
    if (status === 'SENT') data.sentAt = new Date();
    if (status === 'DELIVERED') data.deliveredAt = new Date();
    if (status === 'READ') data.readAt = new Date();
    if (status === 'FAILED') data.failReason = req.body.reason || 'Unknown';

    const reminder = await prisma.reminderLog.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ reminder });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Reminder not found' });
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// ─── Compliance Dashboard ──────────────────────
router.get('/compliance', async (req, res) => {
  try {
    const [totalMeds, activeMeds, totalReminders, sentReminders, failedReminders] = await Promise.all([
      prisma.medicationSchedule.count(),
      prisma.medicationSchedule.count({ where: { isActive: true } }),
      prisma.reminderLog.count(),
      prisma.reminderLog.count({ where: { status: { in: ['SENT', 'DELIVERED', 'READ'] } } }),
      prisma.reminderLog.count({ where: { status: 'FAILED' } }),
    ]);

    // Calculate overall adherence from medications
    const medications = await prisma.medicationSchedule.findMany({
      select: { takenCount: true, missedCount: true },
    });

    let totalTaken = 0, totalMissed = 0;
    medications.forEach(m => { totalTaken += m.takenCount; totalMissed += m.missedCount; });
    const adherenceRate = (totalTaken + totalMissed) > 0
      ? Math.round((totalTaken / (totalTaken + totalMissed)) * 100)
      : 100;

    // Upcoming reminders (next 7 days)
    const now = new Date();
    const weekLater = new Date(now);
    weekLater.setDate(weekLater.getDate() + 7);

    const upcoming = await prisma.reminderLog.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { gte: now, lte: weekLater },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });

    res.json({
      overview: {
        totalMedications: totalMeds,
        activeMedications: activeMeds,
        adherenceRate,
        totalReminders,
        sentReminders,
        failedReminders,
        deliveryRate: totalReminders > 0 ? Math.round((sentReminders / totalReminders) * 100) : 100,
      },
      upcoming,
      doseStats: { taken: totalTaken, missed: totalMissed },
    });
  } catch (error) {
    console.error('Compliance Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch compliance data' });
  }
});

module.exports = router;
