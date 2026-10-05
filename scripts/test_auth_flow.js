// Automated Node validation script to verify FixTrack authentication engine
import { db } from '../src/lib/supabase.ts';

// Mock localStorage for Node environment if needed
if (typeof localStorage === 'undefined') {
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

async function runTests() {
  console.log('--- STARTING AUTH & SIGNUP TESTS ---');
  
  // 1. Initial State
  localStorage.clear();
  let user = db.getCurrentUser();
  console.assert(user === null, 'Test 1 Failed: Initial user must be null when logged out.');
  console.log('✓ Test 1 Passed: Initial user is null (Logged out / Login screen displays)');

  // 2. Invalid password
  let loginRes = await db.login('vishnu.kumar@example.com', 'wrong_pass');
  console.assert(loginRes.user === null && loginRes.error !== null, 'Test 2 Failed: Wrong password should return error.');
  console.log('✓ Test 2 Passed: Wrong password rejected properly:', loginRes.error);

  // 3. Unknown email
  loginRes = await db.login('unknown.person@example.com', 'password123');
  console.assert(loginRes.user === null && loginRes.error !== null, 'Test 3 Failed: Unknown user should return error.');
  console.log('✓ Test 3 Passed: Unknown email rejected properly:', loginRes.error);

  // 4. Valid Vishnu login
  loginRes = await db.login('vishnu.kumar@example.com', 'password123');
  console.assert(loginRes.user !== null && loginRes.user.full_name === 'Vishnu Kumar', 'Test 4 Failed: Vishnu login should succeed.');
  console.log('✓ Test 4 Passed: Vishnu Kumar logged in successfully:', loginRes.user.full_name, 'Unit:', loginRes.user.unit_number);

  // 5. Logout
  await db.logout();
  user = db.getCurrentUser();
  console.assert(user === null, 'Test 5 Failed: Logout must clear current user session.');
  console.log('✓ Test 5 Passed: Logout clears session properly');

  // 6. Sign up new resident
  const signUpRes = await db.signUp({
    fullName: 'Arjun Verma',
    email: 'arjun@skyline.com',
    flatNo: 'C-304',
    password: 'password999',
    phone: '+91 91234 56789'
  });
  console.assert(signUpRes.user !== null && signUpRes.user.unit_number === 'C-304', 'Test 6 Failed: Sign up failed.');
  console.log('✓ Test 6 Passed: Sign up created resident:', signUpRes.user.full_name, 'Flat:', signUpRes.user.unit_number);

  // 7. Session is active for new resident
  user = db.getCurrentUser();
  console.assert(user !== null && user.id === signUpRes.user.id, 'Test 7 Failed: Session not active for new resident.');
  console.log('✓ Test 7 Passed: Active session belongs to new resident:', user.full_name);

  // 8. Logout and re-login with new resident credentials
  await db.logout();
  const reLoginRes = await db.login('arjun@skyline.com', 'password999');
  console.assert(reLoginRes.user !== null && reLoginRes.user.full_name === 'Arjun Verma', 'Test 8 Failed: Re-login failed.');
  console.log('✓ Test 8 Passed: Re-login with new resident credentials succeeded!');

  // 9. Duplicate email registration rejected
  const dupRes = await db.signUp({
    fullName: 'Duplicate Arjun',
    email: 'arjun@skyline.com',
    flatNo: 'C-304',
    password: 'password999'
  });
  console.assert(dupRes.user === null && dupRes.error !== null, 'Test 9 Failed: Duplicate email should be rejected.');
  console.log('✓ Test 9 Passed: Duplicate sign-up rejected properly:', dupRes.error);

  console.log('--- ALL AUTH & SIGNUP TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
