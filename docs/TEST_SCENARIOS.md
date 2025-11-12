# Wounded Animal Hotline - AI Test Scenarios

This document outlines key user scenarios and the expected AI responses across different communication channels (Voice, SMS, Chat). It serves as a tool for testing and refining the `system-prompt.txt` to ensure it is effective, empathetic, and safe from a user's perspective.

---

## Scenario 1: Baby Crow on Lawn

- **User Situation**: "I found a baby crow hopping around in my front lawn. It doesn't seem to be flying. I'm in Spokane County."
- **Analysis**: This is a common "baby bird" scenario. The AI should prioritize advising observation, as this is likely a fledgling. It should not immediately route to a rehabilitator unless there are signs of injury. Safety risk is low.

### Expected Voice Response (TTS)

> "Thank you for calling. Since it's a baby bird hopping on the ground, it is very likely a fledgling that is learning to fly, and its parents are nearby watching over it. The best thing to do is to keep people and pets away and observe from a distance for an hour or two. If the parents don't return or if the bird appears obviously injured, you can call back for the next steps. Do not attempt to feed it or give it water."

### Expected SMS Response

```
This is likely a fledgling bird learning to fly. The parents are probably nearby.

- Keep people & pets away
- Observe from a distance for 1-2 hours
- DO NOT touch, feed, or give water

If it is clearly injured or in immediate danger, reply for a local contact.
```

### Expected Chat Response

```markdown
### It's Likely a Fledgling!

Thank you for being concerned about the baby crow. In most cases, a young bird hopping on the ground is a **fledgling**. This is a normal and critical stage where it's learning to fly, and its parents are almost certainly nearby, watching and feeding it.

#### What to Do:

1.  **Observe from a distance:** Stay inside or far away so you don't scare off the parents.
2.  **Keep pets and people away:** Keep cats, dogs, and children out of the area for the next few hours.
3.  **Do NOT intervene unless necessary:** Do not touch the bird, or attempt to feed it or give it water. This often does more harm than good.

#### When to Take Action:

You should only intervene if the bird is:
*   Visibly injured (bleeding, broken wing)
*   In immediate danger (on a busy road, being stalked by a cat)
*   Covered in insects

If any of those apply, or if the parents do not return after several hours, here is a contact:

**Blue Mountain Wildlife**
*   **Phone:** [541-278-0215](tel:+15412780215)
*   **Hours:** 8 AM - 6 PM daily, call first
*   **Notes:** They specialize in birds and serve your area.

For more information, you can visit the [Audubon Society's guide on fledglings](https://www.audubon.org/news/what-do-about-baby-bird-out-nest).
```

---

## Scenario 2: Wounded Deer on Roadside

- **User Situation**: "There's a wounded deer on the side of the road, it looks like it was hit by a car. It's on Highway 2 near Airway Heights in Spokane County. It's still alive but can't get up." (Time: 9 PM)
- **Analysis**: High urgency. Involves a large animal and a major highway, posing a public safety risk. The AI must prioritize safety and route to the correct emergency services. This is an after-hours call.

### Expected Voice Response (TTS)

> "This is a public safety emergency. Do not approach the deer, as it can be dangerous even when injured. Stay in your vehicle if you are on the highway. The correct contact for this situation is the Washington State Patrol. Please hang up and call nine one one immediately to report the traffic hazard. Again, that is nine one one."

### Expected SMS Response

```
This is a public safety emergency. DO NOT approach the deer.

Please call 911 immediately to report the traffic hazard on Highway 2.
```

### Expected Chat Response

```markdown
### ⚠️ Public Safety Emergency: Wounded Deer on Highway

**Do not approach the deer.** An injured deer can be very dangerous. Please keep a safe distance and stay in your vehicle if you are on the highway.

Because the animal is on a major highway and poses a risk to traffic, this is a public safety emergency.

#### Immediate Action Required:

**Please call 911 immediately.**

Tell the dispatcher:
*   The exact location (Highway 2 near Airway Heights)
*   That a wounded deer is on the side of the road
*   That it is a traffic hazard

They will dispatch the Washington State Patrol or the appropriate authority to handle the situation safely.
```

---

## Scenario 3: Orphaned Baby Skunk

- **User Situation**: "I found a baby skunk near my chicken coop in rural Stevens County. I know the mom is dead because I found her in a trap this morning. The baby seems okay, just wandering around."
- **Analysis**: High-risk situation involving a rabies-vector species. The AI must strongly warn against touching the animal and route to a contact that is explicitly equipped to handle rabies vectors. "Orphaned" status is confirmed.

### Expected Voice Response (TTS)

> "Okay, it is critical that you do not touch or handle the baby skunk under any circumstances. Skunks can carry rabies. Please keep your pets and any other people away from the area. The primary contact for this is Washington State University Veterinary Teaching Hospital, as they are equipped to handle rabies-vector species. They are available twenty-four seven. The number is: five zero nine, three three five, zero seven one one. Again, that's five zero nine, three three five, zero seven one one. Call them for instructions on what to do next."

### Expected SMS Response

```
CRITICAL: Do NOT touch the baby skunk. It is a rabies-vector species. Keep people & pets away.

Contact WSU Vet Hospital (24/7):
509-335-0711

They are equipped for this situation. Call them for instructions.
```

### Expected Chat Response

```markdown
### ⚠️ High Risk: Orphaned Baby Skunk

**It is critical that you do not touch, handle, or attempt to contain the baby skunk.** Skunks are a primary carrier of rabies in Washington, and you should not have any physical contact with it. Please keep children and pets far away from the area.

Since the mother is confirmed to be deceased, the baby does need help, but it must be handled by a professional equipped for rabies-vector species.

#### Primary Contact (24/7, Rabies-Equipped)

**WSU Veterinary Teaching Hospital**
*   **Phone**: [509-335-0711](tel:+15093350711)
*   **Hours**: 24/7
*   **Notes**: They are equipped to handle rabies-vector species and are the best resource for this situation.

#### Next Steps

1.  **Call WSU Vet Hospital immediately** at the number above.
2.  Explain the situation: you have a confirmed orphaned baby skunk in Stevens County.
3.  Follow their instructions precisely. They will advise on the safest way for the animal to be contained and transported, which may involve them sending a trained person.

Your safety is the number one priority. Do not take any risks.
```

---

## Scenario 4: Robin Window Strike

- **User Situation**: "A robin just flew into my window and knocked itself out. It's on my deck, still breathing but not moving. I live in Whitman County."
- **Analysis**: Common scenario. The primary advice should be to give the bird time to recover in a safe, dark, quiet place.

### Expected Voice Response (TTS)

> "Window strikes are very common. Often, the bird is just stunned and needs a few hours to recover. If it is safe to do so and you are comfortable, you can gently place a small cardboard box with air holes over the bird. This will keep it safe, dark, and quiet while it recovers. Do not try to give it food or water. Check on it in one to two hours. Most of the time, it will have flown away on its own."

### Expected SMS Response

```
The robin is likely stunned.

1. Gently place a cardboard box with air holes over it to keep it safe & dark.
2. Do NOT give food or water.
3. Check on it in 1-2 hours. It will likely have flown away.

If it's still there or clearly injured, reply for help.
```

### Expected Chat Response

```markdown
### Window Strike: Stunned Robin

This is a very common occurrence. The robin is likely stunned from the impact and often just needs a safe, quiet space to recover.

#### Recommended Action:

1.  **Create a Safe Space:** If you can do so safely, get a small cardboard box and poke some air holes in it. Gently place the box over the robin on your deck. This protects it from predators and gives it a dark, quiet environment to recover.
2.  **Wait and Watch:** Leave the bird alone for **1-2 hours**. Do not attempt to give it food or water.
3.  **Check on it Later:** After an hour or two, lift the box. In most cases, the bird will have recovered and will fly away.

#### If the Bird Does Not Recover:

If the bird is still on your deck after 2 hours, or if you notice a clear injury like a broken wing or bleeding, it may need professional help.

**Contact for Injured Birds:**
*   **WSU Veterinary Teaching Hospital**: [509-335-0711](tel:+15093350711) (24/7)
*   **Notes**: Call them to describe the situation and they will advise if you should bring the bird in.
```

---

## Scenario 5: Wounded Bald Eagle

- **User Situation**: "My dad is out hunting in Pend Oreille County and just called me. He found a wounded bald eagle. It looks like its wing is broken."
- **Analysis**: High priority. Involves a protected species (raptor). The AI needs to route to a specialist contact quickly. The user is acting as an intermediary for their dad, which the AI should handle gracefully.

### Expected Voice Response (TTS)

> "Thank you. A wounded eagle is a high priority. It is very important that your dad does not approach the bird, as it can be very dangerous. The best contact for an injured raptor is Blue Mountain Wildlife. Their number is five four one, two seven eight, zero two one five. They are open until six P M. Please have your dad call them directly if possible to give them the exact location. If he cannot, you can call them on his behalf."

### Expected SMS Response

```
URGENT: Wounded Eagle. Tell your dad DO NOT approach it.

Contact for injured raptors:

Blue Mountain Wildlife
541-278-0215 (Open until 6 PM)

Have him call them with the location. If he can't, call for him.
```

### Expected Chat Response

```markdown
### Urgent: Wounded Bald Eagle

Thank you for helping your dad with this. A wounded eagle is a high-priority situation, and it's crucial to get it to a specialist.

**Please relay this critical safety information to your dad immediately: **
*   **DO NOT APPROACH THE EAGLE.** Even when injured, a bald eagle is extremely powerful and dangerous. It can cause serious injury with its beak and talons.
*   He should observe from a safe distance (at least 100 feet).

#### Primary Contact for Injured Raptors:

**Blue Mountain Wildlife**
*   **Phone**: [541-278-0215](tel:+15412780215)
*   **Hours**: 8 AM - 6 PM daily
*   **Notes**: They are the top resource for injured raptors in your region.

#### Next Steps:

1.  **Contact your dad** and give him the safety warning and the phone number for Blue Mountain Wildlife.
2.  **Have him call them directly**, if possible. He will need to provide the eagle's exact location.
3.  If your dad cannot make the call, you should call them on his behalf. Be ready to act as a go-between to provide location details.

Time is of the essence for an injury like this. Thank you both for taking action to help this protected species.
```
