const twilio = require('twilio');
const cron = require('node-cron');
const prisma = require('../lib/prisma.cjs');

let twilioClient = null;

// Initialize Twilio only if credentials are provided
if (process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.includes('dummy')) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('  📞 Twilio Client initialized for WhatsApp/SMS');
  } catch (error) {
    console.warn('  ⚠ Failed to initialize Twilio:', error.message);
  }
} else {
  console.log('  ⚠ Twilio not configured (using mock mode for SMS/WhatsApp)');
}

/**
 * Send an SMS or WhatsApp message
 * @param {string} to - Phone number
 * @param {string} message - Message body
 * @param {boolean} isWhatsApp - Whether to send via WhatsApp
 */
async function sendMessage(to, message, isWhatsApp = false) {
  if (!to) throw new Error('Phone number is required');

  const from = isWhatsApp 
    ? process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886' 
    : process.env.TWILIO_PHONE_NUMBER || '+1234567890';
  
  const toFormatted = isWhatsApp ? `whatsapp:${to}` : to;

  // Mock mode
  if (!twilioClient) {
    console.log(`\n  [MOCK ${isWhatsApp ? 'WHATSAPP' : 'SMS'}] To: ${toFormatted}`);
    console.log(`  Message: ${message}\n`);
    return { sid: `mock_${Date.now()}`, status: 'delivered' };
  }

  // Real mode with retry logic
  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      const result = await twilioClient.messages.create({
        body: message,
        from,
        to: toFormatted,
        statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL || undefined,
      });
      console.log(`  ✅ ${isWhatsApp ? 'WhatsApp' : 'SMS'} sent to ${to} (attempt ${attempt})`);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`  ⚠ Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * attempt)); // exponential backoff
      }
    }
  }
  console.error(`  ❌ All ${MAX_RETRIES} attempts failed for ${to}`);
  throw lastError;
}

/**
 * Background job to process scheduled reminders
 */
function startReminderCron() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Find reminders that are scheduled and past due (up to 1 hour old to avoid spamming old ones if server was down)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const reminders = await prisma.reminderLog.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            lte: now,
            gte: oneHourAgo
          }
        },
        include: {
          patient: {
            include: {
              user: true
            }
          }
        }
      });

      if (reminders.length > 0) {
        console.log(`  ⏰ Processing ${reminders.length} scheduled reminders...`);
      }

      for (const reminder of reminders) {
        try {
          const userPhone = reminder.patient.user.phone;
          
          if (!userPhone) {
            throw new Error('Patient has no phone number on file');
          }

          // Format message
          const fullMessage = `${reminder.title}\n\n${reminder.message}`;

          if (reminder.channel === 'WHATSAPP' || reminder.channel === 'SMS') {
            const isWhatsApp = reminder.channel === 'WHATSAPP';
            await sendMessage(userPhone, fullMessage, isWhatsApp);
            
            // Mark as sent
            await prisma.reminderLog.update({
              where: { id: reminder.id },
              data: { status: 'SENT', sentAt: new Date() }
            });
          } else {
            // For EMAIL or PUSH, just mark as sent (mocked for now)
            await prisma.reminderLog.update({
              where: { id: reminder.id },
              data: { status: 'SENT', sentAt: new Date() }
            });
          }
          
        } catch (error) {
          console.error(`  ❌ Failed to send reminder ${reminder.id}:`, error.message);
          await prisma.reminderLog.update({
            where: { id: reminder.id },
            data: { status: 'FAILED', failReason: error.message }
          });
        }
      }
    } catch (error) {
      console.error('Cron Job Error:', error);
    }
  });

  console.log('  ⏱  Reminder cron job started (runs every minute)');
}

module.exports = {
  sendMessage,
  startReminderCron
};
