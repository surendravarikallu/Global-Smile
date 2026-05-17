require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { sendMessage } = require('./services/notification.service.cjs');

async function testTwilio() {
  // Format the number (assuming India +91, modify if different)
  const targetNumber = '+917207310427';
  
  const smsTemplate = `Global Smile Clinic: 
Hello! This is a test SMS reminder for your upcoming appointment. 
Please reply YES to confirm.`;

  const whatsappTemplate = `🦷 *Global Smile Clinic* 🦷
Hello! This is a test WhatsApp reminder for your treatment plan.

*Medication*: Amoxicillin 500mg
*Instructions*: Take 1 tablet after meals.

_Please reply to confirm you received this message._`;

  console.log('Testing SMS...');
  try {
    const smsResult = await sendMessage(targetNumber, smsTemplate, false);
    console.log('✅ SMS Sent Successfully! Message SID:', smsResult.sid);
  } catch (error) {
    console.error('❌ SMS Failed:', error.message);
  }

  console.log('\nTesting WhatsApp...');
  try {
    const waResult = await sendMessage(targetNumber, whatsappTemplate, true);
    console.log('✅ WhatsApp Sent Successfully! Message SID:', waResult.sid);
  } catch (error) {
    console.error('❌ WhatsApp Failed:', error.message);
  }
}

testTwilio();
