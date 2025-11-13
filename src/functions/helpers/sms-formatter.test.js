/**
 * Tests for SMS Formatter Helper
 *
 * Run with: node --test sms-formatter.test.js
 * Or with Jest: jest sms-formatter.test.js
 */

const assert = require('assert');
const {
  generateReferenceNumber,
  formatContactForSMS,
  formatContactsSMS,
  estimateSMSSegments,
  getOptInPrompt,
  isValidPhoneNumber,
  normalizePhoneNumber,
} = require('./sms-formatter');

// Test: generateReferenceNumber
console.log('Testing generateReferenceNumber...');

const refWithCallSid = generateReferenceNumber('CA1234567890abcdefghij');
assert.strictEqual(refWithCallSid.length, 5, 'Reference number should be 5 characters');
assert.strictEqual(refWithCallSid, 'FGHIJ', 'Should use last 5 chars of CallSid');

const refWithoutCallSid = generateReferenceNumber();
assert.strictEqual(refWithoutCallSid.length, 5, 'Generated ref should be 5 digits');
assert.ok(/^\d{5}$/.test(refWithoutCallSid), 'Generated ref should be numeric');

console.log('✓ generateReferenceNumber tests passed');

// Test: formatContactForSMS
console.log('\nTesting formatContactForSMS...');

const contact1 = {
  name: 'WSU Veterinary Teaching Hospital',
  phone: '+15093350711',
  hours: '24/7'
};

const formatted1 = formatContactForSMS(contact1, 1);
assert.ok(formatted1.includes('1.'), 'Should include index number');
assert.ok(formatted1.includes('WSU'), 'Should include name');
assert.ok(formatted1.includes('509-335-0711'), 'Should format phone');
assert.ok(formatted1.includes('(24/7)'), 'Should include hours');

const contact2 = {
  name: 'Test Contact',
  phone: '+15095551234'
};

const formatted2 = formatContactForSMS(contact2, 2);
assert.ok(formatted2.includes('2.'), 'Should include index 2');
assert.ok(!formatted2.includes('undefined'), 'Should handle missing hours');

console.log('✓ formatContactForSMS tests passed');

// Test: formatContactsSMS
console.log('\nTesting formatContactsSMS...');

const contacts = [
  {
    name: 'WSU Veterinary Teaching Hospital',
    phone: '+15093350711',
    hours: '24/7'
  },
  {
    name: 'Central Washington Wildlife Hospital',
    phone: '+15097544244',
    hours: 'Mon-Sat 9 AM - 5 PM'
  },
  {
    name: 'WDFW Eastern Region Office',
    phone: '+15098921001',
    hours: 'Mon-Fri 8 AM - 5 PM'
  }
];

const sms1 = formatContactsSMS(contacts, {
  animalType: 'raptor',
  county: 'Spokane',
  callSid: 'CA1234567890'
});

assert.ok(sms1.includes('Thanks for calling'), 'Should include greeting');
assert.ok(sms1.includes('raptor'), 'Should include animal type');
assert.ok(sms1.includes('Spokane'), 'Should include county');
assert.ok(sms1.includes('WSU Veterinary'), 'Should include first contact');
assert.ok(sms1.includes('509-335-0711'), 'Should include phone numbers');
assert.ok(sms1.includes('wdfw.wa.gov'), 'Should include WDFW link');
assert.ok(sms1.includes('Ref:'), 'Should include reference number');

const sms2 = formatContactsSMS(contacts.slice(0, 1), {});
assert.ok(sms2.includes('Your recommended contacts:'), 'Should work without context');

// Test contact limit (max 3)
const manyContacts = [
  ...contacts,
  { name: 'Fourth Contact', phone: '+15095554444', hours: '24/7' },
  { name: 'Fifth Contact', phone: '+15095555555', hours: '24/7' }
];

const sms3 = formatContactsSMS(manyContacts, {});
const contactCount = (sms3.match(/\d\./g) || []).length;
assert.strictEqual(contactCount, 3, 'Should limit to 3 contacts');

console.log('✓ formatContactsSMS tests passed');

// Test: estimateSMSSegments
console.log('\nTesting estimateSMSSegments...');

const shortMessage = 'Hello, this is a test message.';
const segment1 = estimateSMSSegments(shortMessage);
assert.strictEqual(segment1.segments, 1, 'Short message should be 1 segment');
assert.strictEqual(segment1.type, 'GSM-7', 'ASCII should use GSM-7');

const longMessage = 'A'.repeat(200);
const segment2 = estimateSMSSegments(longMessage);
assert.ok(segment2.segments > 1, 'Long message should use multiple segments');
assert.strictEqual(segment2.length, 200, 'Should report correct length');

const unicodeMessage = 'Hello 👋 Unicode test 🐾';
const segment3 = estimateSMSSegments(unicodeMessage);
assert.strictEqual(segment3.type, 'Unicode', 'Emoji should trigger Unicode');

console.log('✓ estimateSMSSegments tests passed');

// Test: getOptInPrompt
console.log('\nTesting getOptInPrompt...');

const prompt = getOptInPrompt();
assert.ok(typeof prompt === 'string', 'Should return a string');
assert.ok(prompt.length > 0, 'Prompt should not be empty');
assert.ok(prompt.toLowerCase().includes('text'), 'Should mention texting');

console.log('✓ getOptInPrompt tests passed');

// Test: isValidPhoneNumber
console.log('\nTesting isValidPhoneNumber...');

assert.strictEqual(isValidPhoneNumber('+15093350711'), true, 'Valid US number should pass');
assert.strictEqual(isValidPhoneNumber('+12065551234'), true, 'Valid Seattle number should pass');
assert.strictEqual(isValidPhoneNumber('+19175551234'), true, 'Valid NY number should pass');

assert.strictEqual(isValidPhoneNumber('5093350711'), false, 'Missing +1 should fail');
assert.strictEqual(isValidPhoneNumber('+1509335071'), false, 'Too short should fail');
assert.strictEqual(isValidPhoneNumber('+150933507111'), false, 'Too long should fail');
assert.strictEqual(isValidPhoneNumber('+11093350711'), false, 'Invalid area code (starts with 1) should fail');
assert.strictEqual(isValidPhoneNumber('+15093350711x123'), false, 'Extension should fail');
assert.strictEqual(isValidPhoneNumber('+442012345678'), false, 'UK number should fail');

console.log('✓ isValidPhoneNumber tests passed');

// Test: normalizePhoneNumber
console.log('\nTesting normalizePhoneNumber...');

assert.strictEqual(normalizePhoneNumber('5093350711'), '+15093350711', 'Should add +1 prefix');
assert.strictEqual(normalizePhoneNumber('15093350711'), '+15093350711', 'Should add + prefix');
assert.strictEqual(normalizePhoneNumber('+15093350711'), '+15093350711', 'Should leave valid number unchanged');
assert.strictEqual(normalizePhoneNumber('(509) 335-0711'), '+15093350711', 'Should remove formatting');
assert.strictEqual(normalizePhoneNumber('509-335-0711'), '+15093350711', 'Should handle dashes');
assert.strictEqual(normalizePhoneNumber('509.335.0711'), '+15093350711', 'Should handle dots');

console.log('✓ normalizePhoneNumber tests passed');

// Integration test: Full SMS message
console.log('\nRunning integration test...');

const testContacts = [
  {
    name: 'WSU Veterinary Teaching Hospital',
    phone: '+15093350711',
    hours: '24/7'
  },
  {
    name: 'Pet Emergency Clinic',
    phone: '+15093266670',
    hours: '24/7'
  }
];

const fullSMS = formatContactsSMS(testContacts, {
  animalType: 'bat',
  county: 'Spokane',
  callSid: 'CAabcde12345fghij67890'
});

console.log('\nGenerated SMS message:');
console.log('---');
console.log(fullSMS);
console.log('---');

const segmentInfo = estimateSMSSegments(fullSMS);
console.log(`\nMessage stats: ${segmentInfo.length} chars, ${segmentInfo.segments} segment(s), ${segmentInfo.type}`);

// Verify key components are present
assert.ok(fullSMS.includes('Thanks for calling'), 'Has greeting');
assert.ok(fullSMS.includes('bat'), 'Has animal type');
assert.ok(fullSMS.includes('Spokane'), 'Has county');
assert.ok(fullSMS.includes('WSU'), 'Has contact 1');
assert.ok(fullSMS.includes('Pet Emergency'), 'Has contact 2');
assert.ok(fullSMS.includes('509-335-0711'), 'Has phone 1');
assert.ok(fullSMS.includes('509-326-6670'), 'Has phone 2');
assert.ok(fullSMS.includes('24/7'), 'Has hours');
assert.ok(fullSMS.includes('wdfw.wa.gov'), 'Has link');
assert.ok(fullSMS.includes('Ref: #'), 'Has reference');
assert.ok(fullSMS.includes('67890'), 'Has correct reference number');

console.log('✓ Integration test passed');

// Summary
console.log('\n' + '='.repeat(50));
console.log('✓ All SMS formatter tests passed!');
console.log('='.repeat(50));
