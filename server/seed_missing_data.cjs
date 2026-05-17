require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const prisma = require('./lib/prisma.cjs');
const bcrypt = require('bcryptjs');

async function seedMissingData() {
  console.log('Seeding missing data...');
  try {
    // 1. Seed missing treatments
    const costs = [
      ['Root Canal', 'New York', 1200], ['Root Canal', 'London', 1000], ['Root Canal', 'Sydney', 1100], ['Root Canal', 'Vijayawada', 150],
      ['Teeth Whitening', 'New York', 800], ['Teeth Whitening', 'London', 700], ['Teeth Whitening', 'Sydney', 750], ['Teeth Whitening', 'Vijayawada', 100],
    ];
    
    for (const [treatment, city, cost] of costs) {
        const existing = await prisma.treatmentCost.findFirst({
            where: { treatment, city }
        });
        if (!existing) {
            await prisma.treatmentCost.create({ data: { treatment, city, cost } });
        }
    }
    console.log('Missing treatments seeded.');

    // 2. Fetch existing users or create them
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    let patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
    let dentist = await prisma.user.findFirst({ where: { role: 'DENTIST' } });
    let specialist = await prisma.user.findFirst({ where: { role: 'SPECIALIST' } });

    // Seed mock Leads
    const existingLeadsCount = await prisma.lead.count();
    if (existingLeadsCount === 0) {
        await prisma.lead.createMany({
            data: [
                { name: 'John Doe', email: 'john@example.com', phone: '+1234567890', country: 'United States', treatment: 'Dental Implants', status: 'NEW', source: 'website' },
                { name: 'Jane Smith', email: 'jane@example.com', phone: '+1987654321', country: 'United Kingdom', treatment: 'Porcelain Veneers', status: 'CONTACTED', source: 'referral' },
                { name: 'Mike Ross', email: 'mike@example.com', phone: '+1122334455', country: 'Canada', treatment: 'Full Mouth Rehabilitation', status: 'QUALIFIED', source: 'social' },
                { name: 'Rachel Green', email: 'rachel@example.com', phone: '+1555666777', country: 'Australia', treatment: 'Teeth Whitening', status: 'CONSULTATION', source: 'website' },
                { name: 'Harvey Specter', email: 'harvey@example.com', phone: '+1999888777', country: 'United States', treatment: 'Crowns & Bridges', status: 'CONVERTED', source: 'referral' },
            ]
        });
        console.log('Mock Leads seeded.');
    }

    // Seed mock appointments
    if (patient) {
        const patientRecord = await prisma.patient.findFirst({ where: { userId: patient.id } });
        if (patientRecord) {
            const existingApptsCount = await prisma.appointment.count();
            if (existingApptsCount === 0) {
                const now = new Date();
                const past = new Date(now); past.setDate(past.getDate() - 5);
                const future = new Date(now); future.setDate(future.getDate() + 5);
                await prisma.appointment.createMany({
                    data: [
                        { patientId: patientRecord.id, doctorName: 'Dr. Ravi', type: 'Consultation', status: 'COMPLETED', scheduledAt: past, duration: 30, location: 'Clinic 1' },
                        { patientId: patientRecord.id, doctorName: 'Dr. Emily', type: 'Procedure', status: 'SCHEDULED', scheduledAt: future, duration: 60, location: 'Clinic 2' },
                    ]
                });
                console.log('Mock Appointments seeded.');
            }

            // Seed mock referrals
            if (dentist && specialist) {
                 const existingReferralsCount = await prisma.referral.count();
                 if (existingReferralsCount === 0) {
                     await prisma.referral.createMany({
                         data: [
                             { patientId: patientRecord.id, dentistId: dentist.id, dentistName: dentist.firstName, specialistId: specialist.id, specialistName: specialist.firstName, patientName: patient.firstName, reason: 'Complex extraction required', status: 'PENDING', urgency: 'HIGH' },
                             { patientId: patientRecord.id, dentistId: dentist.id, dentistName: dentist.firstName, specialistId: specialist.id, specialistName: specialist.firstName, patientName: patient.firstName, reason: 'Implant consultation', status: 'ACCEPTED', urgency: 'MEDIUM' }
                         ]
                     });
                     console.log('Mock Referrals seeded.');
                 }
            }

            // Seed SMS / WhatsApp Reminder Logs (Mocking)
            const existingRemindersCount = await prisma.reminderLog.count();
            if (existingRemindersCount === 0) {
                 const now = new Date();
                 const future1 = new Date(now); future1.setHours(future1.getHours() + 2);
                 const past1 = new Date(now); past1.setHours(past1.getHours() - 24);
                 await prisma.reminderLog.createMany({
                     data: [
                         { patientId: patientRecord.id, type: 'appointment', channel: 'WHATSAPP', title: 'Upcoming Appointment', message: 'Reminder: Your appointment is tomorrow at 10 AM.', status: 'SENT', scheduledAt: past1, sentAt: past1 },
                         { patientId: patientRecord.id, type: 'medication', channel: 'SMS', title: 'Medication Reminder', message: 'Time to take Amoxicillin 500mg.', status: 'SCHEDULED', scheduledAt: future1 },
                     ]
                 });
                 console.log('Mock Reminder Logs seeded.');
            }
        }
    }

    console.log('✅ All missing data seeded successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMissingData();
