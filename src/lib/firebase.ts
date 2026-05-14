import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const signOutUser = () => signOut(auth);

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{2,23}$/;
const AUTH_TIMEOUT_MS = 12000;

export class AuthFlowError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export interface UserProfileRecord {
  uid: string;
  username: string;
  usernameLowercase: string;
  email: string;
  displayName: string;
  authProvider: 'password' | 'google';
  createdAt: string;
  updatedAt: string;
}

interface UsernameRecord {
  uid: string;
  username: string;
  usernameLowercase: string;
  email: string;
  createdAt: string;
}

interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

interface SignInInput {
  identifier: string;
  password: string;
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function withTimeout<T>(promise: Promise<T>, code: string, message: string, timeoutMs = AUTH_TIMEOUT_MS) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new AuthFlowError(code, message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

export function validateUsername(value: string) {
  const normalized = normalizeUsername(value);

  if (!normalized) {
    throw new AuthFlowError('invalid-username', 'Username is required.');
  }

  if (!USERNAME_PATTERN.test(normalized)) {
    throw new AuthFlowError(
      'invalid-username',
      'Username must be 3-24 characters and use only lowercase letters, numbers, underscores, or hyphens.'
    );
  }

  return normalized;
}

function buildUsernameRecord(uid: string, username: string, email: string, createdAt: string): UsernameRecord {
  return {
    uid,
    username,
    usernameLowercase: username,
    email,
    createdAt,
  };
}

function buildUserProfileRecord(
  uid: string,
  username: string,
  email: string,
  displayName: string,
  authProvider: 'password' | 'google',
  createdAt: string,
  updatedAt: string,
): UserProfileRecord {
  return {
    uid,
    username,
    usernameLowercase: username,
    email,
    displayName,
    authProvider,
    createdAt,
    updatedAt,
  };
}

async function resolveEmailFromIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  if (!trimmed) {
    throw new AuthFlowError('account-not-found', 'Account not found.');
  }

  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  const usernameLowercase = validateUsername(trimmed);
  const usernameRef = doc(db, 'usernames', usernameLowercase);
  const usernameSnap = await withTimeout(
    getDoc(usernameRef),
    'lookup-timeout',
    'Username lookup timed out. Check your connection and try again.',
  );

  if (!usernameSnap.exists()) {
    throw new AuthFlowError('account-not-found', 'Account not found.');
  }

  const usernameData = usernameSnap.data() as Partial<UsernameRecord>;
  if (!usernameData.email) {
    throw new AuthFlowError('account-not-found', 'Account not found.');
  }

  return usernameData.email;
}

export async function signInWithIdentifier({ identifier, password }: SignInInput) {
  const email = await resolveEmailFromIdentifier(identifier);
  return withTimeout(
    signInWithEmailAndPassword(auth, email, password),
    'auth-timeout',
    'Sign-in timed out. Check your connection and try again.',
  );
}

export async function signUpWithEmailAndUsername({ username, email, password }: SignUpInput) {
  const usernameLowercase = validateUsername(username);
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new AuthFlowError('invalid-email', 'Email is required.');
  }

  const credential = await withTimeout(
    createUserWithEmailAndPassword(auth, cleanEmail, password),
    'auth-timeout',
    'Account creation timed out. Check your connection and try again.',
  );
  const now = new Date().toISOString();

  try {
    await withTimeout(
      updateProfile(credential.user, { displayName: usernameLowercase }),
      'profile-timeout',
      'Profile setup timed out. Try again.',
    );
    await withTimeout(runTransaction(db, async (transaction) => {
      const usernameRef = doc(db, 'usernames', usernameLowercase);
      const userRef = doc(db, 'users', credential.user.uid);
      const usernameSnap = await transaction.get(usernameRef);

      if (usernameSnap.exists()) {
        throw new AuthFlowError('username-taken', 'Username already taken.');
      }

      transaction.set(usernameRef, buildUsernameRecord(credential.user.uid, usernameLowercase, cleanEmail, now));
      transaction.set(
        userRef,
        buildUserProfileRecord(
          credential.user.uid,
          usernameLowercase,
          cleanEmail,
          usernameLowercase,
          'password',
          now,
          now,
        ),
      );
    }), 'profile-timeout', 'Profile setup timed out. Try again.');
  } catch (error) {
    await deleteUser(credential.user).catch(() => undefined);
    throw error;
  }

  return credential;
}

export async function completeUsernameSetup(username: string, user: User = auth.currentUser as User) {
  if (!user) {
    throw new AuthFlowError('not-authenticated', 'You need to sign in first.');
  }

  const usernameLowercase = validateUsername(username);
  const email = user.email?.trim().toLowerCase();

  if (!email) {
    throw new AuthFlowError('missing-email', 'This account does not have an email address available.');
  }

  const now = new Date().toISOString();
  const displayName = user.displayName?.trim() || usernameLowercase;

  await withTimeout(runTransaction(db, async (transaction) => {
    const usernameRef = doc(db, 'usernames', usernameLowercase);
    const userRef = doc(db, 'users', user.uid);
    const usernameSnap = await transaction.get(usernameRef);
    const userSnap = await transaction.get(userRef);
    const existingProfile = userSnap.exists() ? (userSnap.data() as Partial<UserProfileRecord>) : null;

    if (usernameSnap.exists()) {
      const existingUsername = usernameSnap.data() as Partial<UsernameRecord>;
      if (existingUsername.uid !== user.uid) {
        throw new AuthFlowError('username-taken', 'Username already taken.');
      }
    }

    if (existingProfile?.usernameLowercase && existingProfile.usernameLowercase !== usernameLowercase) {
      throw new AuthFlowError('username-already-set', 'This account already has a different username.');
    }

    transaction.set(usernameRef, buildUsernameRecord(user.uid, usernameLowercase, email, existingProfile?.createdAt || now));
    transaction.set(
      userRef,
      buildUserProfileRecord(
        user.uid,
        usernameLowercase,
        email,
        displayName,
        user.providerData.some((item) => item.providerId === 'google.com') ? 'google' : 'password',
        existingProfile?.createdAt || now,
        now,
      ),
    );
  }), 'profile-timeout', 'Username setup timed out. Try again.');

  if (user.displayName !== displayName) {
    await withTimeout(
      updateProfile(user, { displayName }),
      'profile-timeout',
      'Username setup timed out. Try again.',
    );
  }
}

// Custom Error Handler for Firebase as per instructions
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, runTransaction, setDoc, updateDoc, where, OperationType
};
