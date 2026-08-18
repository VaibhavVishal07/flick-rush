/**
 * Catalogue of everything that can fly at the phone.
 * Labels are deliberately generic — no real brands, senders or URLs.
 */

export type Trust = 'threat' | 'genuine'
export type Family = 'call' | 'sms' | 'link' | 'alert' | 'delivery' | 'calendar' | 'otp'

export interface ObjectDef {
  id: string
  label: string
  /**
   * Optional second line. Unused today — every pill reads as a single label —
   * but kept so a future object type can carry one without a schema change.
   */
  caption?: string
  trust: Trust
  family: Family
  /** Speed multiplier on top of the stage speed. */
  speed: number
  /** Relative spawn weight within its trust group. */
  weight: number
  /** Sideways drift amplitude, 0 = straight line. */
  wobble: number
  /** Slow, heavy things read as heavier — used for scale and shadow depth. */
  heft: number
}

export const OBJECT_TYPES: Record<string, ObjectDef> = {
  /* -------------------------------- threats ------------------------------ */
  'spam-call': {
    id: 'spam-call',
    label: 'Spam Call',
    trust: 'threat',
    family: 'call',
    speed: 0.92,
    weight: 3,
    wobble: 0,
    heft: 1.08,
  },
  'spam-sms': {
    id: 'spam-sms',
    label: 'Spam SMS',
    trust: 'threat',
    family: 'sms',
    speed: 1.22,
    weight: 3,
    wobble: 0.25,
    heft: 0.9,
  },
  'suspicious-link': {
    id: 'suspicious-link',
    label: 'Suspicious Link',
    trust: 'threat',
    family: 'link',
    speed: 1.06,
    weight: 2.4,
    wobble: 1,
    heft: 0.96,
  },
  'unknown-caller': {
    id: 'unknown-caller',
    label: 'Unknown Caller',
    trust: 'threat',
    family: 'call',
    speed: 0.98,
    weight: 1.6,
    wobble: 0.15,
    heft: 1.04,
  },
  'fake-reward': {
    id: 'fake-reward',
    label: 'Fake Reward',
    trust: 'threat',
    family: 'alert',
    speed: 1.12,
    weight: 1.5,
    wobble: 0.55,
    heft: 0.94,
  },
  'risky-message': {
    id: 'risky-message',
    label: 'Risky Message',
    trust: 'threat',
    family: 'alert',
    speed: 1.16,
    weight: 1.4,
    wobble: 0.4,
    heft: 0.92,
  },

  /* -------------------------------- genuine ------------------------------ */
  'mom-calling': {
    id: 'mom-calling',
    label: 'Mom Calling',
    trust: 'genuine',
    family: 'call',
    speed: 0.86,
    weight: 2.4,
    wobble: 0,
    heft: 1.02,
  },
  'dad-calling': {
    id: 'dad-calling',
    label: 'Dad Calling',
    trust: 'genuine',
    family: 'call',
    speed: 0.86,
    weight: 1.8,
    wobble: 0,
    heft: 1.02,
  },
  'friend-message': {
    id: 'friend-message',
    label: "Friend's Message",
    trust: 'genuine',
    family: 'sms',
    speed: 0.98,
    weight: 2.4,
    wobble: 0,
    heft: 0.9,
  },
  'delivery-update': {
    id: 'delivery-update',
    label: 'Delivery Update',
    trust: 'genuine',
    family: 'delivery',
    speed: 0.94,
    weight: 2,
    wobble: 0,
    heft: 0.94,
  },
  'calendar-reminder': {
    id: 'calendar-reminder',
    label: 'Calendar Reminder',
    trust: 'genuine',
    family: 'calendar',
    speed: 0.9,
    weight: 1.4,
    wobble: 0,
    heft: 0.92,
  },
  'genuine-otp': {
    id: 'genuine-otp',
    label: 'Genuine OTP',
    trust: 'genuine',
    family: 'otp',
    speed: 1.02,
    weight: 1.4,
    wobble: 0,
    heft: 0.88,
  },
}

export const GENUINE_IDS = Object.values(OBJECT_TYPES)
  .filter((d) => d.trust === 'genuine')
  .map((d) => d.id)

export const getDef = (id: string): ObjectDef => OBJECT_TYPES[id]
