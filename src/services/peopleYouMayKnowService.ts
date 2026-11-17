import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {sha256} from 'js-sha256';
import {
  getPeopleYouMayKnow,
  matchPeopleYouMayKnow,
  SuggestedUser,
} from '../api/home';
import {
  areAndroidPermissionPromptsSuppressed,
  withAndroidPermissionGate,
} from '../utils/helpers';

const PROMPTED_KEY = 'pymk_contacts_prompted_v1';
const MAX_HASHES = 2000;

let syncInFlight: Promise<SuggestedUser[] | undefined> | null = null;

function getContactsModule(): typeof import('react-native-contacts').default | null {
  try {
    // Lazy require so a missing native link does not crash app startup.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-contacts').default ?? require('react-native-contacts');
  } catch (error) {
    console.warn('[PYMK] react-native-contacts unavailable:', error);
    return null;
  }
}

function normalizeEmail(email: string): string | null {
  const value = String(email || '')
    .trim()
    .toLowerCase();
  if (!value || !value.includes('@')) {
    return null;
  }
  return value;
}

function digitPhoneVariants(phone: string): string[] {
  const digits = String(phone || '').replace(/\D+/g, '');
  if (!digits) {
    return [];
  }
  const variants = new Set<string>([digits]);
  if (digits.length >= 10) {
    variants.add(digits.slice(-10));
  }
  return [...variants];
}

function uniqueHashes(values: string[]): string[] {
  const set = new Set<string>();
  for (const value of values) {
    if (!value) {
      continue;
    }
    set.add(sha256(value));
    if (set.size >= MAX_HASHES) {
      break;
    }
  }
  return [...set];
}

async function hasPromptedContacts(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PROMPTED_KEY)) === '1';
  } catch {
    return false;
  }
}

async function markContactsPrompted(): Promise<void> {
  try {
    await AsyncStorage.setItem(PROMPTED_KEY, '1');
  } catch {
    /* ignore */
  }
}

function contactsPermission() {
  return Platform.OS === 'ios'
    ? PERMISSIONS.IOS.CONTACTS
    : PERMISSIONS.ANDROID.READ_CONTACTS;
}

async function requestContactsPermission(): Promise<boolean> {
  const permission = contactsPermission();
  const run = async () => {
    const status = await check(permission);
    if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
      return true;
    }
    if (status === RESULTS.BLOCKED) {
      return false;
    }
    if (Platform.OS === 'android' && areAndroidPermissionPromptsSuppressed()) {
      return false;
    }
    const next = await request(permission);
    return next === RESULTS.GRANTED || next === RESULTS.LIMITED;
  };

  return withAndroidPermissionGate(run);
}

async function collectContactHashes(): Promise<{
  emails: string[];
  phones: string[];
}> {
  const Contacts = getContactsModule();
  if (!Contacts?.getAllWithoutPhotos) {
    return {emails: [], phones: []};
  }

  const contacts = await Contacts.getAllWithoutPhotos();
  const emails: string[] = [];
  const phones: string[] = [];

  for (const contact of contacts || []) {
    for (const entry of contact.emailAddresses || []) {
      const email = normalizeEmail(entry?.email || '');
      if (email) {
        emails.push(email);
      }
    }
    for (const entry of contact.phoneNumbers || []) {
      phones.push(...digitPhoneVariants(entry?.number || ''));
    }
    if (emails.length + phones.length > MAX_HASHES * 2) {
      break;
    }
  }

  return {
    emails: uniqueHashes(emails),
    phones: uniqueHashes(phones),
  };
}

export type PeopleYouMayKnowLocation = {
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
};

/**
 * One-time contacts prompt after login, then match + fetch suggestions.
 * Safe to call repeatedly; prompt only happens once per install.
 */
export async function syncPeopleYouMayKnowAfterLogin(
  location?: PeopleYouMayKnowLocation,
): Promise<SuggestedUser[] | undefined> {
  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = (async () => {
    try {
      const prompted = await hasPromptedContacts();
      let granted = false;

      if (!prompted) {
        granted = await requestContactsPermission();
        await markContactsPrompted();
      } else {
        const status = await check(contactsPermission());
        granted =
          status === RESULTS.GRANTED || status === RESULTS.LIMITED;
      }

      const payload: {
        emails: string[];
        phones: string[];
        latitude?: number;
        longitude?: number;
        location_name?: string;
      } = {
        emails: [],
        phones: [],
      };

      if (location?.latitude != null && location?.longitude != null) {
        payload.latitude = Number(location.latitude);
        payload.longitude = Number(location.longitude);
      }
      if (location?.location_name) {
        payload.location_name = String(location.location_name);
      }

      if (granted) {
        try {
          const hashes = await collectContactHashes();
          payload.emails = hashes.emails;
          payload.phones = hashes.phones;
        } catch (error) {
          console.warn('[PYMK] contacts read failed:', error);
        }
      }

      if (payload.emails.length || payload.phones.length) {
        const matched = await matchPeopleYouMayKnow(payload);
        return matched;
      }

      return getPeopleYouMayKnow();
    } catch (error) {
      console.warn('[PYMK] sync failed:', error);
      try {
        return await getPeopleYouMayKnow();
      } catch {
        return undefined;
      }
    } finally {
      syncInFlight = null;
    }
  })();

  return syncInFlight;
}

export async function fetchPeopleYouMayKnowSuggestions(): Promise<
  SuggestedUser[]
> {
  try {
    return await getPeopleYouMayKnow();
  } catch (error) {
    console.warn('[PYMK] fetch failed:', error);
    return [];
  }
}
