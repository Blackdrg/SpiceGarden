import React, { useReducer, useEffect, useCallback } from 'react';
import { Button, Card } from '@spicegarden/ui';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout, setUser } from '../redux/slices/authSlice';
import ProtectedRoute from '../components/ProtectedRoute';
import { api } from '@spicegarden/shared/api';
import styles from './profile.module.css';

interface ProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  profileImage?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
}

interface ProfileState {
  profileData: ProfileData | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  editFormData: {
    fullName: string;
    email: string;
    phone: string;
  };
}

const initialProfileState: ProfileState = {
  profileData: null,
  loading: true,
  error: null,
  isEditing: false,
  editFormData: { fullName: '', email: '', phone: '' },
};

function profileReducer(state: ProfileState, action: { type: string; payload?: unknown }): ProfileState {
  switch (action.type) {
    case 'SET_PROFILE_DATA':
      return { ...state, profileData: action.payload as ProfileData | null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload as boolean };
    case 'SET_ERROR':
      return { ...state, error: action.payload as string | null };
    case 'SET_IS_EDITING':
      return { ...state, isEditing: action.payload as boolean };
    case 'SET_EDIT_FORM_DATA':
      return { ...state, editFormData: action.payload as { fullName: string; email: string; phone: string } };
    default:
      return state;
  }
}

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [state, dispatchState] = useReducer(profileReducer, initialProfileState);

  const loadProfile = useCallback(async () => {
    try {
      dispatchState({ type: 'SET_LOADING', payload: true });
      dispatchState({ type: 'SET_ERROR', payload: null });
      
      if (!user) {
        dispatchState({ type: 'SET_PROFILE_DATA', payload: null });
        dispatchState({ type: 'SET_LOADING', payload: false });
        return;
      }

      dispatchState({ type: 'SET_PROFILE_DATA', payload: {
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || null,
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
        createdAt: user.createdAt || new Date().toISOString(),
      } });
      dispatchState({ type: 'SET_EDIT_FORM_DATA', payload: {
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      } });
    } catch (err) {
      console.error('Failed to load profile:', err);
      dispatchState({ type: 'SET_ERROR', payload: 'Failed to load profile. Please try again later.' });
    } finally {
      dispatchState({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async () => {
    try {
      dispatchState({ type: 'SET_LOADING', payload: true });
      dispatchState({ type: 'SET_ERROR', payload: null });
      dispatchState({ type: 'SET_PROFILE_DATA', payload: state.editFormData });
      dispatchState({ type: 'SET_IS_EDITING', payload: false });
    } catch (err) {
      console.error('Failed to save profile:', err);
      dispatchState({ type: 'SET_ERROR', payload: 'Failed to save profile. Please try again later.' });
    } finally {
      dispatchState({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleLogout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // proceed with logout even if API call fails
    }
    dispatch(logout());
    router.push('/auth');
  };

  if (state.loading && !state.profileData) {
    return (
      <div className={styles.loadingState}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {state.error && (
        <div className={styles.errorBanner}>
          {state.error}
        </div>
      )}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          {state.profileData?.profileImage ? (
            <Image
              src={state.profileData.profileImage}
              alt="Profile"
              width={80}
              height={80}
              className={styles.avatarImage}
            />
          ) : (
            '👤'
          )}
        </div>
        <h2 className={styles.profileName}>{state.isEditing ? state.editFormData.fullName : state.profileData?.fullName || 'User'}</h2>
        <p className={styles.profileEmail}>{state.isEditing ? state.editFormData.email : state.profileData?.email || ''}</p>
        <p className={styles.profilePhone}>{state.isEditing ? state.editFormData.phone : state.profileData?.phone || ''}</p>

        {!state.isEditing && (
          <div className={styles.editButtonWrapper}>
            <Button
              label="Edit Profile"
              onClick={() => dispatchState({ type: 'SET_IS_EDITING', payload: true })}
              variant="secondary"
            />
          </div>
        )}
      </div>

      {state.isEditing && (
        <>
          <Card title="Edit Profile">
            <div className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="fullName" className={styles.label}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  className={styles.input}
                  type="text"
                  value={state.editFormData.fullName}
                  onChange={(e) => dispatchState({ type: 'SET_EDIT_FORM_DATA', payload: { ...state.editFormData, fullName: e.target.value } })}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  value={state.editFormData.email}
                  onChange={(e) => dispatchState({ type: 'SET_EDIT_FORM_DATA', payload: { ...state.editFormData, email: e.target.value } })}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="phone" className={styles.label}>
                  Phone
                </label>
                <input
                  id="phone"
                  className={styles.input}
                  type="tel"
                  value={state.editFormData.phone}
                  onChange={(e) => dispatchState({ type: 'SET_EDIT_FORM_DATA', payload: { ...state.editFormData, phone: e.target.value } })}
                />
              </div>

              <div className={styles.formActions}>
                <Button label="Cancel" onClick={() => dispatchState({ type: 'SET_IS_EDITING', payload: false })} variant="secondary" />
                <Button label="Save Changes" onClick={handleSaveProfile} />
              </div>
            </div>
          </Card>
        </>
      )}

      {!state.isEditing && (
        <>
          <Card title="Account Information">
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span>Email Verified</span>
                <span>{state.profileData?.emailVerified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className={styles.infoRow}>
                <span>PhoneVerified</span>
                <span>{state.profileData?.phoneVerified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className={styles.infoRow}>
                <span>Member Since</span>
                <span>{state.profileData?.createdAt ? new Date(state.profileData.createdAt).toLocaleDateString() : 'Not available'}</span>
              </div>
            </div>
          </Card>

          <Card title="Security">
            <div className={styles.infoList}>
              <Button
                label="Change Password"
                onClick={() => {}}
                variant="secondary"
              />
              <Button
                label="Manage Devices"
                onClick={() => {}}
                variant="secondary"
              />
            </div>
          </Card>

          <Card title="Address Management">
            <div className={styles.infoList}>
              <Button
                label="Manage Addresses"
                onClick={() => router.push('/addresses')}
                variant="secondary"
              />
              <p className={styles.helperText}>
                Saved addresses will appear here
              </p>
            </div>
          </Card>

          <Card title="Payment Methods">
            <div className={styles.infoList}>
              <Button
                label="Manage Payment Methods"
                onClick={() => router.push('/payment-methods')}
                variant="secondary"
              />
              <p className={styles.helperText}>
                Saved payment methods will appear here
              </p>
            </div>
          </Card>

          <div className={styles.logoutWrapper}>
            <Button label="Sign Out" onClick={handleLogout} variant="secondary" style={{ width: '100%' }} />
          </div>
        </>
      )}
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><ProfilePage {...props} /></ProtectedRoute>;
}
