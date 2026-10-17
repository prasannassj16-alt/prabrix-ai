/**
 * PRABRIX AI - Authentication & OTP Service
 * Handles user registration, phone OTP verification, email fallback,
 * session maintenance, and profile updates.
 *
 * SAFETY RULE: Never log OTP codes, passwords, or tokens to console or storage.
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';

const DEMO_STORAGE_KEY = 'prabrix_demo_auth_session';
const DEMO_USERS_KEY = 'prabrix_demo_users_db';
const OTP_DEMO_CODE = '123456'; // Standard testing OTP for Supabase test phone numbers

const isDemoMode = () => {
  const envDemo = import.meta.env.VITE_OTP_DEMO_MODE;
  return envDemo === 'true' || envDemo === true || !isSupabaseConfigured();
};

// Initialize demo users database with fictional seed users if empty
const getDemoUsers = () => {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore JSON parse errors
  }
  const initial = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo.admin@prabrix.local',
      full_name: '[DEMO] Prabrix Administrator',
      phone: '+919876543210',
      role: 'admin',
      is_phone_verified: true,
      email_verified: true,
      is_demo: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'demo.seller@prabrix.local',
      full_name: '[DEMO] Ramesh Sundaram',
      phone: '+919840112233',
      role: 'seller',
      is_phone_verified: true,
      email_verified: true,
      is_demo: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'demo.buyer@prabrix.local',
      full_name: '[DEMO] Ananya Krishnan',
      phone: '+919840223344',
      role: 'buyer',
      is_phone_verified: true,
      email_verified: true,
      is_demo: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'demo.both@prabrix.local',
      full_name: '[DEMO] Dual Role User',
      phone: '+919840556677',
      role: 'both',
      is_phone_verified: true,
      email_verified: true,
      is_demo: true,
    },
  ];
  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(initial));
  } catch (e) {}
  return initial;
};

export const authService = {
  isDemoMode,

  // 1. User Registration
  async register({ fullName, email, phone, password, role }) {
    if (!isDemoMode() && supabase) {
      // Live Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: role,
            is_phone_verified: false,
          },
        },
      });

      if (error) throw new Error(error.message);

      // Attempt to send Phone OTP via Supabase
      if (phone) {
        await supabase.auth.signInWithOtp({ phone });
      }

      return {
        user: data.user,
        session: data.session,
        needsPhoneOtp: true,
        phone,
      };
    } else {
      // Local Demo Mode Registration
      const demoUsers = getDemoUsers();
      if (demoUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email address already exists.');
      }

      const newUser = {
        id: 'demo-user-' + Date.now(),
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        role: role || 'buyer',
        is_phone_verified: false,
        email_verified: false,
        is_demo: true,
        created_at: new Date().toISOString(),
      };

      demoUsers.push(newUser);
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(demoUsers));

      const session = {
        user: newUser,
        access_token: 'demo_access_token_' + Date.now(),
        expires_at: Date.now() + 3600000,
      };

      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(session));

      return {
        user: newUser,
        session,
        needsPhoneOtp: true,
        phone,
      };
    }
  },

  // 2. Mobile OTP Verification
  async verifyMobileOtp(phone, token) {
    if (!token || token.trim().length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code.');
    }

    if (!isDemoMode() && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw new Error(error.message);

      // Update phone verification flag in profiles
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', data.user.id);
      }

      return data;
    } else {
      // Demo Mode OTP Validation
      // Accepts fixed OTP test number or '123456'
      if (token !== OTP_DEMO_CODE && token !== '654321') {
        throw new Error('Invalid verification code. In Demo Mode, use test code: 123456');
      }

      const current = this.getCurrentSession();
      if (!current || !current.user) {
        throw new Error('No active registration session found.');
      }

      const updatedUser = {
        ...current.user,
        is_phone_verified: true,
      };

      const updatedSession = {
        ...current,
        user: updatedUser,
      };

      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updatedSession));

      // Update in demo users DB
      const users = getDemoUsers().map((u) =>
        u.id === updatedUser.id ? updatedUser : u
      );
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

      return updatedSession;
    }
  },

  // 3. Resend Mobile OTP
  async resendMobileOtp(phone) {
    if (!isDemoMode() && supabase) {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw new Error(error.message);
      return { success: true };
    } else {
      // In Demo Mode, simulate dispatch without carrier SMS
      return { success: true, demoCode: OTP_DEMO_CODE };
    }
  },

  // 4. Login (Email + Password)
  async login(email, password) {
    if (!isDemoMode() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      return data;
    } else {
      const demoUsers = getDemoUsers();
      const user = demoUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!user) {
        throw new Error('Invalid email or password.');
      }

      const session = {
        user,
        access_token: 'demo_access_token_' + Date.now(),
        expires_at: Date.now() + 3600000,
      };

      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(session));
      return session;
    }
  },

  // 5. Logout
  async logout() {
    if (!isDemoMode() && supabase) {
      await supabase.auth.signOut();
    }
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch (e) {}
  },

  // 6. Forgot Password (Request Reset)
  async requestPasswordReset(email) {
    if (!isDemoMode() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
      return { success: true };
    } else {
      // Demo Mode: confirm request received
      return { success: true, demoMessage: 'Password reset link simulated in demo mode.' };
    }
  },

  // 7. Reset Password (Update Password)
  async resetPassword(newPassword) {
    if (!isDemoMode() && supabase) {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw new Error(error.message);
      return data;
    } else {
      return { success: true };
    }
  },

  // 8. Update Profile Details
  async updateProfile(updates) {
    const current = this.getCurrentSession();
    if (!current || !current.user) throw new Error('Not authenticated.');

    if (!isDemoMode() && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
          phone: updates.phone,
          role: updates.role,
          bio: updates.bio,
        })
        .eq('id', current.user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } else {
      const updatedUser = {
        ...current.user,
        full_name: updates.fullName !== undefined ? updates.fullName : current.user.full_name,
        phone: updates.phone !== undefined ? updates.phone : current.user.phone,
        role: updates.role !== undefined ? updates.role : current.user.role,
        bio: updates.bio !== undefined ? updates.bio : current.user.bio,
      };

      const updatedSession = { ...current, user: updatedUser };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updatedSession));

      const users = getDemoUsers().map((u) =>
        u.id === updatedUser.id ? updatedUser : u
      );
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

      return updatedUser;
    }
  },

  // 9. Get Current Active Session
  getCurrentSession() {
    try {
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },
};
