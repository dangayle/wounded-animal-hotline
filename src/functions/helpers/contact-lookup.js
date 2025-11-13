/**
 * Contact Lookup Helper
 *
 * Provides utility functions for filtering and matching contacts from the
 * wildlife resources database based on various criteria.
 */

/**
 * Check if a contact serves a specific county
 * @param {Object} contact - Contact object from database
 * @param {string} county - County name to check
 * @returns {boolean}
 */
function servesCounty(contact, county) {
  if (!contact.coverage || !county) return false;

  const countyLower = county.toLowerCase().trim();

  return contact.coverage.some(area => {
    const areaLower = area.toLowerCase().trim();

    // Exact county match
    if (areaLower === countyLower || areaLower === `${countyLower} county`) {
      return true;
    }

    // Statewide coverage
    if (areaLower.includes('statewide') || areaLower.includes('all of')) {
      return true;
    }

    // Partial match (e.g., "Eastern Washington" includes many counties)
    if (areaLower.includes('eastern washington') && isEasternWashingtonCounty(countyLower)) {
      return true;
    }

    return false;
  });
}

/**
 * Check if county is in Eastern Washington
 * @param {string} county - County name
 * @returns {boolean}
 */
function isEasternWashingtonCounty(county) {
  const easternCounties = [
    'spokane', 'stevens', 'pend oreille', 'ferry', 'lincoln',
    'whitman', 'garfield', 'columbia', 'walla walla', 'asotin',
    'okanogan', 'chelan', 'douglas', 'grant', 'adams',
    'kittitas', 'yakima', 'benton', 'franklin'
  ];

  const countyName = county.toLowerCase().replace(' county', '').trim();
  return easternCounties.includes(countyName);
}

/**
 * Check if contact handles a specific animal type
 * @param {Object} contact - Contact object
 * @param {string} animalType - Animal type to check
 * @returns {boolean}
 */
function handlesAnimalType(contact, animalType) {
  if (!contact.animal_types || !animalType) return false;

  const animalLower = animalType.toLowerCase().trim();

  return contact.animal_types.some(type => {
    return type.toLowerCase().includes(animalLower) ||
           animalLower.includes(type.toLowerCase());
  });
}

/**
 * Check if contact provides a specific service
 * @param {Object} contact - Contact object
 * @param {string} service - Service type to check
 * @returns {boolean}
 */
function providesService(contact, service) {
  if (!contact.services || !service) return false;

  return contact.services.includes(service);
}

/**
 * Check if contact is currently open
 * @param {Object} contact - Contact object
 * @param {Date} currentTime - Current time (defaults to now in Pacific timezone)
 * @returns {boolean}
 */
function isCurrentlyOpen(contact, currentTime = new Date()) {
  if (!contact.hours) return false;

  const hours = contact.hours.toLowerCase();

  // 24/7 contacts are always open
  if (hours.includes('24/7') || hours.includes('24 hours')) {
    return true;
  }

  // Get current Pacific time using UTC offset calculation
  // Pacific Time is UTC-8 (PST) or UTC-7 (PDT)
  const pacificOffset = -8 * 60; // Minutes offset for PST (will need DST handling for production)
  const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
  const pacificTime = new Date(utc + (pacificOffset * 60000));
  
  const currentDay = pacificTime.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const currentHour = pacificTime.getUTCHours();

  // Simple business hours check (Mon-Fri 8-5)
  if (hours.includes('mon-fri') || hours.includes('monday-friday')) {
    const isWeekday = currentDay >= 1 && currentDay <= 5;
    const isDuringBusinessHours = currentHour >= 8 && currentHour < 17;
    return isWeekday && isDuringBusinessHours;
  }

  // If we can't determine, assume closed for safety
  return false;
}

/**
 * Filter contacts by multiple criteria
 * @param {Array} contacts - Array of contact objects
 * @param {Object} criteria - Filtering criteria
 * @param {string} criteria.county - County name
 * @param {string} criteria.animalType - Animal type
 * @param {string} criteria.service - Service type needed
 * @param {boolean} criteria.requireOpen - Only return currently open contacts
 * @param {boolean} criteria.rabiesVector - Is this a rabies vector species?
 * @returns {Array} Filtered contacts
 */
function filterContacts(contacts, criteria = {}) {
  let filtered = contacts;

  // Filter by county coverage
  if (criteria.county) {
    filtered = filtered.filter(contact => servesCounty(contact, criteria.county));
  }

  // Filter by animal type
  if (criteria.animalType) {
    filtered = filtered.filter(contact => handlesAnimalType(contact, criteria.animalType));
  }

  // Filter by service
  if (criteria.service) {
    filtered = filtered.filter(contact => providesService(contact, criteria.service));
  }

  // Filter by rabies vector capability
  if (criteria.rabiesVector) {
    filtered = filtered.filter(contact => contact.handles_rabies_vector_species === true);
  }

  // Filter by currently open
  if (criteria.requireOpen) {
    filtered = filtered.filter(contact => isCurrentlyOpen(contact));
  }

  return filtered;
}

/**
 * Get priority contacts for emergency situations
 * @param {Array} contacts - Array of contact objects
 * @returns {Array} Emergency contacts (24/7 availability)
 */
function getEmergencyContacts(contacts) {
  return contacts.filter(contact => {
    const hours = (contact.hours || '').toLowerCase();
    return hours.includes('24/7') || hours.includes('24 hours');
  });
}

/**
 * Sort contacts by priority
 * Priority order:
 * 1. 24/7 availability
 * 2. Emergency services
 * 3. Currently open
 * 4. Comprehensive services
 * @param {Array} contacts - Array of contact objects
 * @returns {Array} Sorted contacts
 */
function sortByPriority(contacts) {
  return contacts.sort((a, b) => {
    // 24/7 contacts first
    const aIs24x7 = (a.hours || '').toLowerCase().includes('24/7');
    const bIs24x7 = (b.hours || '').toLowerCase().includes('24/7');
    if (aIs24x7 && !bIs24x7) return -1;
    if (!aIs24x7 && bIs24x7) return 1;

    // Emergency services second
    const aIsEmergency = a.services && a.services.some(s =>
      s.includes('emergency') || s.includes('unsafe_animal_response')
    );
    const bIsEmergency = b.services && b.services.some(s =>
      s.includes('emergency') || s.includes('unsafe_animal_response')
    );
    if (aIsEmergency && !bIsEmergency) return -1;
    if (!aIsEmergency && bIsEmergency) return 1;

    // Currently open third
    const aIsOpen = isCurrentlyOpen(a);
    const bIsOpen = isCurrentlyOpen(b);
    if (aIsOpen && !bIsOpen) return -1;
    if (!aIsOpen && bIsOpen) return 1;

    // More services = higher priority
    const aServiceCount = (a.services || []).length;
    const bServiceCount = (b.services || []).length;
    return bServiceCount - aServiceCount;
  });
}

/**
 * Format phone number for voice (TTS-friendly)
 * @param {string} phone - Phone number
 * @returns {string} Formatted for speech
 */
function formatPhoneForVoice(phone) {
  // Remove +1 country code and any formatting
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length === 11) {
    digits = digits.substring(1);
  }

  // Special handling for 911
  if (digits === '911') {
    return 'nine one one';
  }

  // Special handling for 800 numbers
  if (digits.startsWith('800')) {
    const part1 = digits.substring(0, 3).split('').join(' ');
    const part2 = digits.substring(3, 6).split('').join(' ');
    const part3 = digits.substring(6, 10).split('').join(' ');
    return `${part1}, ${part2}, ${part3}`;
  }

  // Standard format: XXX, XXX, XXXX
  const areaCode = digits.substring(0, 3).split('').join(' ');
  const prefix = digits.substring(3, 6).split('').join(' ');
  const lineNumber = digits.substring(6, 10).split('').join(' ');

  return `${areaCode}, ${prefix}, ${lineNumber}`;
}

/**
 * Format phone number for SMS/text
 * @param {string} phone - Phone number
 * @returns {string} Formatted for text (XXX-XXX-XXXX)
 */
function formatPhoneForText(phone) {
  // Remove +1 country code and any formatting
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length === 11) {
    digits = digits.substring(1);
  }

  // Format as XXX-XXX-XXXX
  if (digits.length === 10) {
    return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
  } else if (digits === '911') {
    return '911';
  }

  return phone; // Return original if can't format
}

module.exports = {
  servesCounty,
  isEasternWashingtonCounty,
  handlesAnimalType,
  providesService,
  isCurrentlyOpen,
  filterContacts,
  getEmergencyContacts,
  sortByPriority,
  formatPhoneForVoice,
  formatPhoneForText
};
