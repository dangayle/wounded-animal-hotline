# Contact Lookup Helper API Documentation

The Contact Lookup Helper provides comprehensive utilities for filtering, prioritizing, and retrieving wildlife resource contacts based on various criteria.

## Main Function: `findContacts()`

The primary entry point for contact lookup operations.

### Signature

```javascript
findContacts(contacts, criteria) → Array<Contact>
```

### Parameters

- **contacts** (Array, optional): Array of contact objects. If omitted or if first parameter is an object, contacts will be auto-loaded from `contacts.json`
- **criteria** (Object): Filtering and prioritization criteria

#### Criteria Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `county` | string | County name (e.g., "Spokane", "Chelan") |
| `animalType` | string | Animal type (e.g., "raptors", "small_mammals", "bats") |
| `urgency` | string | Urgency level: "emergency" or "routine" |
| `timeOfDay` | Date | Current time (defaults to now) |
| `service` | string | Specific service needed |
| `rabiesVector` | boolean | Is this a rabies vector species? |
| `maxResults` | number | Maximum number of results to return (default: 3) |

### Returns

Array of contact objects, sorted by priority, limited to `maxResults` count.

### Edge Case Handling

1. **No exact matches**: Falls back to statewide services
2. **Out of region**: Returns statewide contacts
3. **Unknown animal type**: Returns generalist contacts
4. **Emergency + no matches**: Returns 24/7 emergency contacts

### Examples

#### Example 1: Emergency raptor in Spokane

```javascript
const { findContacts } = require('./contact-lookup');

const contacts = findContacts({
  county: 'Spokane',
  animalType: 'raptors',
  urgency: 'emergency'
});

// Returns top 3 24/7 contacts that handle raptors in Spokane area
```

#### Example 2: Routine small mammal with explicit contacts

```javascript
const { findContacts, loadContacts } = require('./contact-lookup');

const allContacts = loadContacts();
const contacts = findContacts(allContacts, {
  county: 'Chelan',
  animalType: 'small_mammals',
  maxResults: 5
});

// Returns up to 5 contacts for small mammals in Chelan County
```

#### Example 3: Rabies vector species (bats, raccoons)

```javascript
const contacts = findContacts({
  county: 'Spokane',
  animalType: 'bats',
  rabiesVector: true,
  urgency: 'emergency'
});

// Returns only contacts that can handle rabies vector species
```

#### Example 4: Out-of-region fallback

```javascript
const contacts = findContacts({
  county: 'King',  // Not in Eastern WA coverage area
  animalType: 'small_mammals'
});

// Automatically falls back to statewide services
```

## Utility Functions

### `loadContacts(filePath)`

Loads contacts from JSON file.

**Parameters:**
- `filePath` (string, optional): Path to contacts.json. Defaults to `../../assets/contacts.json`

**Returns:** Array of contact objects

**Example:**
```javascript
const contacts = loadContacts('./path/to/contacts.json');
```

### `servesCounty(contact, county)`

Checks if a contact serves a specific county.

**Returns:** boolean

**Example:**
```javascript
const serves = servesCounty(contact, 'Spokane');
```

### `handlesAnimalType(contact, animalType)`

Checks if a contact handles a specific animal type.

**Returns:** boolean

**Example:**
```javascript
const handles = handlesAnimalType(contact, 'raptors');
```

### `isCurrentlyOpen(contact, currentTime)`

Checks if a contact is currently open based on their hours.

**Parameters:**
- `contact` (Object): Contact object
- `currentTime` (Date, optional): Time to check. Defaults to now in Pacific timezone

**Returns:** boolean

**Example:**
```javascript
const isOpen = isCurrentlyOpen(contact, new Date());
```

### `filterContacts(contacts, criteria)`

Filters contacts by multiple criteria.

**Parameters:**
- `contacts` (Array): Array of contact objects
- `criteria` (Object): Filter criteria
  - `county` (string): County name
  - `animalType` (string): Animal type
  - `service` (string): Service type
  - `rabiesVector` (boolean): Rabies vector capability
  - `requireOpen` (boolean): Only return currently open contacts

**Returns:** Filtered array of contacts

**Example:**
```javascript
const filtered = filterContacts(allContacts, {
  county: 'Spokane',
  animalType: 'raptors',
  requireOpen: true
});
```

### `getEmergencyContacts(contacts)`

Returns only 24/7 emergency contacts.

**Returns:** Array of emergency contacts

### `getStatewideContacts(contacts)`

Returns contacts with statewide coverage.

**Returns:** Array of statewide contacts

### `sortByPriority(contacts)`

Sorts contacts by priority:
1. 24/7 availability
2. Emergency services
3. Currently open
4. Comprehensive services

**Returns:** Sorted array of contacts

### `formatPhoneForVoice(phone)`

Formats phone number for TTS (text-to-speech).

**Example:**
```javascript
formatPhoneForVoice('+15093350711');
// Returns: "5 0 9, 3 3 5, 0 7 1 1"
```

### `formatPhoneForText(phone)`

Formats phone number for SMS/display.

**Example:**
```javascript
formatPhoneForText('+15093350711');
// Returns: "509-335-0711"
```

## Priority System

Contacts are prioritized in the following order:

1. **Urgent + Specialty match** - Emergency service for specific animal type
2. **24/7 services** - Always available for after-hours calls
3. **Local county match** - Closest to caller
4. **Regional match** - Neighboring counties
5. **General state services** - WDFW, statewide resources

## Time-based Routing

- **Business hours (8am-5pm weekdays)**: All contacts available
- **After hours**: Prioritizes 24/7 services
- **Weekends**: Same as after hours

## Animal Type Matching

- **Raptors** → Specialist raptor rehabilitation centers
- **Bats** → Specific bat rehab contacts (rabies protocols)
- **Large mammals** → WDFW regional offices
- **Unknown** → Generalist wildlife services

## Contact Object Schema

Each contact object has the following structure:

```javascript
{
  name: "Organization Name",
  phone: "+15551234567",
  emergency_phone: "+15551234567",  // Optional
  non_emergency_phone: "+15551234567",  // Optional
  url: "https://example.com",  // Optional
  email: "contact@example.com",  // Optional
  coverage: ["County1", "County2", "Statewide"],
  hours: "24/7" | "Mon-Fri, 8 AM - 5 PM",
  services: ["service_type1", "service_type2"],
  animal_types: ["type1", "type2"],
  handles_rabies_vector_species: true | false,
  notes: "Important instructions or limitations"
}
```

## Testing

Run the test suite:

```bash
cd src
node functions/helpers/contact-lookup.test.js
```

## Integration Examples

### Example: Twilio Function Integration

```javascript
const { findContacts } = require('./helpers/contact-lookup');

exports.handler = function(context, event, callback) {
  const { county, animalType, urgency } = event;
  
  const contacts = findContacts({
    county,
    animalType,
    urgency,
    maxResults: 3
  });
  
  const response = {
    contacts: contacts.map(c => ({
      name: c.name,
      phone: c.phone,
      hours: c.hours,
      notes: c.notes
    }))
  };
  
  callback(null, response);
};
```

### Example: Cloudflare Worker Integration

```javascript
import { findContacts, loadContacts } from './contact-lookup.js';

// Load once at module level
const contacts = loadContacts();

export default {
  async fetch(request) {
    const { county, animalType, urgency } = await request.json();
    
    const results = findContacts(contacts, {
      county,
      animalType,
      urgency
    });
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

## Notes

- All phone numbers are in E.164 format (+1XXXXXXXXXX)
- Time calculations use Pacific timezone
- Edge cases automatically fall back to statewide services
- Maximum of 3 results returned by default (configurable)
- Empty or invalid inputs are handled gracefully
