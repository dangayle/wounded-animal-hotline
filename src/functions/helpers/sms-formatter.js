/**
 * SMS Formatter and Sender Helper
 *
 * Provides utility functions for formatting contact information as SMS messages
 * and sending follow-up texts via Twilio API.
 */

const { formatPhoneForText } = require('./contact-lookup');

/**
 * Generate a call reference number
 * @param {string} callSid - Twilio Call SID
 * @returns {string} Short reference number (last 5 chars of CallSid)
 */
function generateReferenceNumber(callSid) {
  if (!callSid) {
    // Generate random 5-digit number if no CallSid
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
  // Use last 5 characters of CallSid for brevity
  return callSid.slice(-5).toUpperCase();
}

/**
 * Format a single contact for SMS
 * @param {Object} contact - Contact object from database
 * @param {number} index - Contact number (1, 2, 3...)
 * @returns {string} Formatted contact text
 */
function formatContactForSMS(contact, index) {
  const name = contact.name || 'Unknown';
  const phone = formatPhoneForText(contact.phone);
  const hours = contact.hours ? ` (${contact.hours})` : '';

  return `${index}. ${name}\n   ${phone}${hours}`;
}

/**
 * Build SMS message with contact information
 * @param {Array} contacts - Array of contact objects (max 3 recommended)
 * @param {Object} options - SMS options
 * @param {string} options.animalType - Type of animal (e.g., "raptor", "bat")
 * @param {string} options.county - County name
 * @param {string} options.callSid - Twilio Call SID for reference
 * @returns {string} Complete SMS message text
 */
function formatContactsSMS(contacts, options = {}) {
  const { animalType, county, callSid } = options;

  // Start with greeting
  let message = 'Thanks for calling the Wounded Animal Hotline!\n\n';

  // Add context if available
  if (animalType || county) {
    message += 'Your recommended contacts';
    if (animalType) message += ` for ${animalType}`;
    if (county) message += ` in ${county}`;
    message += ':\n\n';
  } else {
    message += 'Your recommended contacts:\n\n';
  }

  // Add contacts (limit to 3 for message length)
  const limitedContacts = contacts.slice(0, 3);
  limitedContacts.forEach((contact, idx) => {
    message += formatContactForSMS(contact, idx + 1) + '\n\n';
  });

  // Add WDFW directory link
  message += 'Find more:\nhttps://wdfw.wa.gov/species-habitats/living/injured-wildlife/rehabilitation/find\n\n';

  // Add reference number
  const refNumber = generateReferenceNumber(callSid);
  message += `Ref: #${refNumber}`;

  return message;
}

/**
 * Estimate SMS segment count (160 chars for GSM-7, 70 for Unicode)
 * @param {string} message - SMS message text
 * @returns {Object} Segment info: { segments: number, length: number, type: string }
 */
function estimateSMSSegments(message) {
  const length = message.length;

  // Check if message contains Unicode characters
  const hasUnicode = /[^\x00-\x7F]/.test(message);

  if (hasUnicode) {
    // Unicode messages: 70 chars per segment, 67 for multi-part
    const segments = length <= 70 ? 1 : Math.ceil(length / 67);
    return { segments, length, type: 'Unicode' };
  } else {
    // GSM-7 messages: 160 chars per segment, 153 for multi-part
    const segments = length <= 160 ? 1 : Math.ceil(length / 153);
    return { segments, length, type: 'GSM-7' };
  }
}

/**
 * Send SMS via Twilio API
 * @param {Object} twilioClient - Initialized Twilio client
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number
 * @param {string} options.from - Twilio phone number (sender)
 * @param {string} options.body - SMS message body
 * @returns {Promise<Object>} Twilio API response or error
 */
async function sendSMS(twilioClient, options) {
  const { to, from, body } = options;

  // Validate required parameters
  if (!to || !from || !body) {
    throw new Error('Missing required SMS parameters: to, from, body');
  }

  try {
    const message = await twilioClient.messages.create({
      to: to,
      from: from,
      body: body,
    });

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
      segments: message.numSegments,
      to: message.to,
      from: message.from,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}

/**
 * Send follow-up SMS with contact information
 * Convenience function that combines formatting and sending
 *
 * @param {Object} twilioClient - Initialized Twilio client (from require('twilio')(sid, token))
 * @param {Object} params - Parameters
 * @param {string} params.to - Recipient phone number (caller's number)
 * @param {string} params.from - Twilio phone number (hotline number)
 * @param {Array} params.contacts - Array of contact objects
 * @param {string} params.animalType - Type of animal
 * @param {string} params.county - County name
 * @param {string} params.callSid - Twilio Call SID
 * @returns {Promise<Object>} SMS send result
 */
async function sendFollowUpSMS(twilioClient, params) {
  const { to, from, contacts, animalType, county, callSid } = params;

  // Validate inputs
  if (!twilioClient) {
    throw new Error('Twilio client is required');
  }

  if (!to || !from) {
    throw new Error('Recipient (to) and sender (from) phone numbers are required');
  }

  if (!contacts || contacts.length === 0) {
    throw new Error('At least one contact is required');
  }

  // Format SMS message
  const messageBody = formatContactsSMS(contacts, {
    animalType,
    county,
    callSid,
  });

  // Log segment count for monitoring
  const segmentInfo = estimateSMSSegments(messageBody);
  console.log(`SMS will use ${segmentInfo.segments} segment(s) - ${segmentInfo.length} chars (${segmentInfo.type})`);

  // Send SMS
  const result = await sendSMS(twilioClient, {
    to,
    from,
    body: messageBody,
  });

  return result;
}

/**
 * Create opt-in prompt for conversation flow
 * Use this in the AI conversation to ask if caller wants SMS follow-up
 * @returns {string} Prompt text for AI to use
 */
function getOptInPrompt() {
  return "Would you like me to text you this information for your reference?";
}

/**
 * Validate phone number format (E.164)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid E.164 format
 */
function isValidPhoneNumber(phone) {
  // E.164 format: +[country code][number]
  // For US: +1XXXXXXXXXX (11 digits total including +1)
  const e164Regex = /^\+1[2-9]\d{9}$/;
  return e164Regex.test(phone);
}

/**
 * Format phone number to E.164 if needed
 * @param {string} phone - Phone number in various formats
 * @returns {string} E.164 formatted phone number
 */
function normalizePhoneNumber(phone) {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Add country code if missing
  if (digits.length === 10) {
    digits = '1' + digits;
  }

  // Add + prefix
  if (!phone.startsWith('+')) {
    return '+' + digits;
  }

  return phone;
}

module.exports = {
  generateReferenceNumber,
  formatContactForSMS,
  formatContactsSMS,
  estimateSMSSegments,
  sendSMS,
  sendFollowUpSMS,
  getOptInPrompt,
  isValidPhoneNumber,
  normalizePhoneNumber,
};
