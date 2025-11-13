/**
 * Contact Lookup Helper - Test Suite
 *
 * Tests for the contact lookup and filtering functions
 */

const contactLookup = require('./contact-lookup');
const path = require('path');

// Mock contact data for testing
const mockContacts = [
  {
    name: "Washington State University Veterinary Teaching Hospital",
    phone: "+15093350711",
    coverage: ["All of Eastern Washington"],
    hours: "24/7",
    services: [
      "emergency_wildlife_medical",
      "non_emergency_wildlife_rehab",
      "wildlife_stabilization",
      "veterinary_services"
    ],
    animal_types: [
      "large_mammals",
      "small_mammals",
      "raptors",
      "songbirds",
      "bats",
      "reptiles"
    ],
    handles_rabies_vector_species: true
  },
  {
    name: "SCRAPS Spokane",
    phone: "+15094772532",
    coverage: ["Spokane County"],
    hours: "24/7 for emergency dispatch; shelter hours vary",
    services: ["domestic_animal_control", "unsafe_animal_response"],
    animal_types: ["domestic_pets"],
    handles_rabies_vector_species: true
  },
  {
    name: "Central Washington Wildlife Hospital",
    phone: "+15094507016",
    coverage: [
      "Kittitas County",
      "Yakima County",
      "Chelan County",
      "Douglas County",
      "Grant County"
    ],
    hours: "Varies, call for intake.",
    services: ["non_emergency_wildlife_rehab", "veterinary_services"],
    animal_types: ["small_mammals", "songbirds", "reptiles"],
    handles_rabies_vector_species: false
  },
  {
    name: "WDFW Eastern Region Office",
    phone: "+15098921001",
    coverage: [
      "Ferry",
      "Stevens",
      "Pend Oreille",
      "Lincoln",
      "Spokane",
      "Whitman",
      "Garfield",
      "Columbia",
      "Walla Walla",
      "Asotin"
    ],
    hours: "Mon-Fri, 8 AM - 5 PM",
    services: ["general_information"],
    animal_types: [
      "large_mammals",
      "small_mammals",
      "raptors",
      "songbirds",
      "bats",
      "reptiles"
    ],
    handles_rabies_vector_species: false
  },
  {
    name: "WDFW Statewide",
    phone: "+13609022936",
    coverage: ["Statewide"],
    hours: "24/7",
    services: ["unsafe_animal_response", "law_enforcement"],
    animal_types: [
      "large_mammals",
      "small_mammals",
      "raptors",
      "songbirds",
      "bats",
      "reptiles"
    ],
    handles_rabies_vector_species: true
  }
];

// Test loadContacts
console.log('Testing loadContacts...');
const loadedContacts = contactLookup.loadContacts(
  path.join(__dirname, '../../assets/contacts.json')
);
console.assert(
  Array.isArray(loadedContacts) && loadedContacts.length > 0,
  'Should load contacts from JSON file'
);
console.log(`✓ loadContacts tests passed (loaded ${loadedContacts.length} contacts)`);

// Test servesCounty
console.log('Testing servesCounty...');
console.assert(
  contactLookup.servesCounty(mockContacts[0], 'Spokane'),
  'WSU should serve Spokane (all of Eastern WA)'
);
console.assert(
  contactLookup.servesCounty(mockContacts[1], 'Spokane County'),
  'SCRAPS should serve Spokane County'
);
console.assert(
  contactLookup.servesCounty(mockContacts[1], 'Spokane'),
  'SCRAPS should serve Spokane'
);
console.assert(
  !contactLookup.servesCounty(mockContacts[1], 'King'),
  'SCRAPS should not serve King County'
);
console.assert(
  contactLookup.servesCounty(mockContacts[2], 'Chelan'),
  'Central WA Wildlife should serve Chelan'
);
console.log('✓ servesCounty tests passed');

// Test isEasternWashingtonCounty
console.log('\nTesting isEasternWashingtonCounty...');
console.assert(
  contactLookup.isEasternWashingtonCounty('spokane'),
  'Spokane should be Eastern WA'
);
console.assert(
  contactLookup.isEasternWashingtonCounty('Spokane County'),
  'Spokane County should be Eastern WA'
);
console.assert(
  contactLookup.isEasternWashingtonCounty('chelan'),
  'Chelan should be Eastern WA'
);
console.assert(
  !contactLookup.isEasternWashingtonCounty('king'),
  'King County should not be Eastern WA'
);
console.log('✓ isEasternWashingtonCounty tests passed');

// Test handlesAnimalType
console.log('\nTesting handlesAnimalType...');
console.assert(
  contactLookup.handlesAnimalType(mockContacts[0], 'small_mammals'),
  'WSU should handle small mammals'
);
console.assert(
  contactLookup.handlesAnimalType(mockContacts[0], 'raptors'),
  'WSU should handle raptors'
);
console.assert(
  !contactLookup.handlesAnimalType(mockContacts[1], 'small_mammals'),
  'SCRAPS should not handle small mammals (only domestic pets)'
);
console.assert(
  contactLookup.handlesAnimalType(mockContacts[2], 'songbirds'),
  'Central WA Wildlife should handle songbirds'
);
console.log('✓ handlesAnimalType tests passed');

// Test providesService
console.log('\nTesting providesService...');
console.assert(
  contactLookup.providesService(mockContacts[0], 'emergency_wildlife_medical'),
  'WSU should provide emergency wildlife medical'
);
console.assert(
  contactLookup.providesService(mockContacts[1], 'domestic_animal_control'),
  'SCRAPS should provide domestic animal control'
);
console.assert(
  !contactLookup.providesService(mockContacts[1], 'emergency_wildlife_medical'),
  'SCRAPS should not provide emergency wildlife medical'
);
console.log('✓ providesService tests passed');

// Test isCurrentlyOpen
console.log('\nTesting isCurrentlyOpen...');
// Test with a Wednesday at 10 AM Pacific
const wednesdayMorning = new Date('2025-01-15T18:00:00Z'); // 10 AM Pacific
console.assert(
  contactLookup.isCurrentlyOpen(mockContacts[0], wednesdayMorning),
  'WSU (24/7) should be open Wednesday morning'
);
console.assert(
  contactLookup.isCurrentlyOpen(mockContacts[3], wednesdayMorning),
  'WDFW (Mon-Fri 8-5) should be open Wednesday morning'
);

// Test with a Saturday at 10 AM Pacific
const saturdayMorning = new Date('2025-01-18T18:00:00Z'); // 10 AM Pacific
console.assert(
  contactLookup.isCurrentlyOpen(mockContacts[0], saturdayMorning),
  'WSU (24/7) should be open Saturday morning'
);
console.assert(
  !contactLookup.isCurrentlyOpen(mockContacts[3], saturdayMorning),
  'WDFW (Mon-Fri 8-5) should be closed Saturday morning'
);
console.log('✓ isCurrentlyOpen tests passed');

// Test filterContacts
console.log('\nTesting filterContacts...');
const filtered1 = contactLookup.filterContacts(mockContacts, {
  county: 'Spokane'
});
console.assert(
  filtered1.length >= 2,
  'Should find at least 2 contacts serving Spokane'
);

const filtered2 = contactLookup.filterContacts(mockContacts, {
  county: 'Spokane',
  animalType: 'small_mammals'
});
console.assert(
  filtered2.some(c => c.name.includes('WSU')),
  'Should find WSU for small mammals in Spokane'
);

const filtered3 = contactLookup.filterContacts(mockContacts, {
  service: 'emergency_wildlife_medical'
});
console.assert(
  filtered3.length >= 1,
  'Should find emergency wildlife medical contacts'
);

const filtered4 = contactLookup.filterContacts(mockContacts, {
  rabiesVector: true,
  county: 'Spokane'
});
console.assert(
  filtered4.length >= 1,
  'Should find rabies vector capable contacts in Spokane'
);
console.log('✓ filterContacts tests passed');

// Test getEmergencyContacts
console.log('\nTesting getEmergencyContacts...');
const emergency = contactLookup.getEmergencyContacts(mockContacts);
console.assert(
  emergency.length >= 2,
  'Should find at least 2 emergency (24/7) contacts'
);
console.assert(
  emergency.every(c => c.hours.toLowerCase().includes('24')),
  'All emergency contacts should have 24/7 hours'
);
console.log('✓ getEmergencyContacts tests passed');

// Test sortByPriority
console.log('\nTesting sortByPriority...');
const sorted = contactLookup.sortByPriority([...mockContacts]);
console.assert(
  sorted[0].hours.toLowerCase().includes('24'),
  'First sorted contact should be 24/7'
);
console.log('✓ sortByPriority tests passed');

// Test formatPhoneForVoice
console.log('\nTesting formatPhoneForVoice...');
const voice1 = contactLookup.formatPhoneForVoice('+15093350711');
console.assert(
  voice1 === '5 0 9, 3 3 5, 0 7 1 1',
  `Expected "5 0 9, 3 3 5, 0 7 1 1", got "${voice1}"`
);

const voice2 = contactLookup.formatPhoneForVoice('911');
console.assert(
  voice2 === 'nine one one',
  `Expected "nine one one", got "${voice2}"`
);

const voice3 = contactLookup.formatPhoneForVoice('+18002314476');
console.assert(
  voice3.startsWith('8 0 0'),
  `800 number should start with "8 0 0", got "${voice3}"`
);
console.log('✓ formatPhoneForVoice tests passed');

// Test formatPhoneForText
console.log('\nTesting formatPhoneForText...');
const text1 = contactLookup.formatPhoneForText('+15093350711');
console.assert(
  text1 === '509-335-0711',
  `Expected "509-335-0711", got "${text1}"`
);

const text2 = contactLookup.formatPhoneForText('911');
console.assert(
  text2 === '911',
  `Expected "911", got "${text2}"`
);

const text3 = contactLookup.formatPhoneForText('+18002314476');
console.assert(
  text3 === '800-231-4476',
  `Expected "800-231-4476", got "${text3}"`
);
console.log('✓ formatPhoneForText tests passed');

// Test getStatewideContacts
console.log('\nTesting getStatewideContacts...');
const statewide = contactLookup.getStatewideContacts(mockContacts);
console.assert(
  statewide.length >= 1,
  'Should find at least 1 statewide contact'
);
console.assert(
  statewide.some(c => c.name.includes('Statewide') || c.coverage.some(cov => cov.toLowerCase().includes('statewide'))),
  'Statewide contacts should include "statewide" in name or coverage'
);
console.log('✓ getStatewideContacts tests passed');

// Test findContacts - main entry point
console.log('\nTesting findContacts (main entry point)...');

// Test 1: Emergency in Spokane
const emergency1 = contactLookup.findContacts(mockContacts, {
  county: 'Spokane',
  urgency: 'emergency'
});
console.assert(
  emergency1.length > 0 && emergency1.length <= 3,
  `Emergency search should return 1-3 results, got ${emergency1.length}`
);
console.assert(
  emergency1[0].hours.toLowerCase().includes('24'),
  'First emergency result should be 24/7'
);

// Test 2: Routine call for small mammals in Chelan
const routine1 = contactLookup.findContacts(mockContacts, {
  county: 'Chelan',
  animalType: 'small_mammals'
});
console.assert(
  routine1.length > 0,
  'Should find contacts for small mammals in Chelan'
);

// Test 3: Out of region (should fall back to statewide)
const outOfRegion = contactLookup.findContacts(mockContacts, {
  county: 'King'  // Not in Eastern WA
});
console.assert(
  outOfRegion.length > 0,
  'Should return statewide fallback for out-of-region query'
);

// Test 4: Unknown animal type (should still return results)
const unknown = contactLookup.findContacts(mockContacts, {
  county: 'Spokane',
  animalType: 'unknown_species_xyz'
});
console.assert(
  unknown.length > 0,
  'Should return fallback contacts for unknown animal type'
);

// Test 5: Rabies vector species
const rabies = contactLookup.findContacts(mockContacts, {
  county: 'Spokane',
  rabiesVector: true
});
console.assert(
  rabies.length > 0,
  'Should find rabies-capable contacts'
);
console.assert(
  rabies.every(c => c.handles_rabies_vector_species === true),
  'All rabies results should handle rabies vector species'
);

// Test 6: Criteria-only call (auto-load contacts)
const autoLoad = contactLookup.findContacts({
  county: 'Spokane',
  maxResults: 2
});
console.assert(
  autoLoad.length <= 2,
  'Should respect maxResults limit'
);

console.log('✓ findContacts tests passed');

console.log('\n========================================');
console.log('✓ All tests passed!');
console.log('========================================\n');
