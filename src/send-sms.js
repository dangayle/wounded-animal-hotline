/**
 * SMS Follow-Up Handler for Cloudflare Worker
 *
 * Sends SMS messages with wildlife contact information after a call ends.
 * Integrates with Twilio Messages API.
 */

/**
 * Format phone number for text display (XXX-XXX-XXXX)
 */
function formatPhoneForText(phone) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length === 11) {
    digits = digits.substring(1);
  }

  if (digits === '911') return '911';

  if (digits.length === 10) {
    return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
  }

  return phone;
}

/**
 * Generate reference number from Call SID
 */
function generateReferenceNumber(callSid) {
  if (!callSid) {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
  return callSid.slice(-5).toUpperCase();
}

/**
 * Format a single contact for SMS
 */
function formatContactForSMS(contact, index) {
  const name = contact.name || 'Unknown';
  const phone = formatPhoneForText(contact.phone);
  const hours = contact.hours ? ` (${contact.hours})` : '';

  return `${index}. ${name}\n   ${phone}${hours}`;
}

/**
 * Build complete SMS message with contacts
 * Follows SMS channel guidelines: under 300 chars, single primary contact
 */
function formatContactsSMS(contacts, options = {}) {
  const { animalType, county, callSid } = options;

  if (!contacts || contacts.length === 0) {
    return 'No contacts available';
  }

  // Use only the primary (first) contact
  const contact = contacts[0];
  const name = contact.name || 'Wildlife Contact';
  const phone = formatPhoneForText(contact.phone);
  const hours = contact.hours || 'Call for hours';
  const location = contact.location?.address?.split(',')[1]?.trim() || '';

  let message = `${name} (${hours})\n${phone}`;

  if (location) {
    message += `\n${location} - Call first`;
  } else {
    message += '\nCall first';
  }

  // Add basic safety reminder
  message += '\n\nSafety: Don\'t touch animal\nKeep distance, observe';

  // Short WDFW link
  message += '\n\nMore: wdfw.wa.gov/wildlife';

  return message;
}

/**
 * Estimate SMS segment count for logging
 */
function estimateSMSSegments(message) {
  const length = message.length;
  const hasUnicode = /[^\x00-\x7F]/.test(message);

  if (hasUnicode) {
    const segments = length <= 70 ? 1 : Math.ceil(length / 67);
    return { segments, length, type: 'Unicode' };
  } else {
    const segments = length <= 160 ? 1 : Math.ceil(length / 153);
    return { segments, length, type: 'GSM-7' };
  }
}

/**
 * Send SMS via Twilio API
 *
 * @param {Object} env - Cloudflare Worker environment variables
 * @param {Object} params - SMS parameters
 * @param {string} params.to - Recipient phone number (caller's number)
 * @param {Array} params.contacts - Array of contact objects to include
 * @param {string} params.animalType - Type of animal (optional)
 * @param {string} params.county - County name (optional)
 * @param {string} params.callSid - Twilio Call SID (optional)
 * @returns {Promise<Object>} Result object with success status
 */
export async function sendFollowUpSMS(env, params) {
  const { to, from, contacts, animalType, county, callSid } = params;

  // Validate environment variables
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.error('Missing Twilio credentials in environment variables');
    return {
      success: false,
      error: 'SMS service not configured'
    };
  }

  // Validate parameters
  if (!to) {
    return {
      success: false,
      error: 'Recipient phone number is required'
    };
  }

  if (!from) {
    return {
      success: false,
      error: 'Sender phone number is required'
    };
  }

  if (!contacts || contacts.length === 0) {
    return {
      success: false,
      error: 'At least one contact is required'
    };
  }

  // Format message
  const messageBody = formatContactsSMS(contacts, {
    animalType,
    county,
    callSid
  });

  // Log segment info
  const segmentInfo = estimateSMSSegments(messageBody);
  console.log(`Sending SMS: ${segmentInfo.segments} segment(s), ${segmentInfo.length} chars (${segmentInfo.type})`);

  // Prepare Twilio API request
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const formData = new URLSearchParams();
  formData.append('To', to);
  formData.append('From', from);
  formData.append('Body', messageBody);

  // Create Basic Auth header
  const credentials = btoa(`${accountSid}:${authToken}`);

  try {
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const result = await response.json();

    if (response.ok) {
      console.log('SMS sent successfully:', result.sid);
      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from
      };
    } else {
      console.error('Twilio API error:', result);
      return {
        success: false,
        error: result.message || 'Failed to send SMS',
        code: result.code
      };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message || 'Network error sending SMS'
    };
  }
}

/**
 * Extract phone number from Twilio webhook parameters
 */
export function extractCallerNumber(request) {
  // Try to get from various possible sources
  const url = new URL(request.url);
  const params = url.searchParams;

  // Common Twilio parameter names
  return params.get('From') || params.get('from') || params.get('Caller');
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone) {
  // E.164 format: +1XXXXXXXXXX
  const e164Regex = /^\+1[2-9]\d{9}$/;
  return e164Regex.test(phone);
}

/**
 * Get opt-in prompt text for AI conversation
 */
export function getOptInPrompt() {
  return "Would you like me to text you this information for your reference?";
}
