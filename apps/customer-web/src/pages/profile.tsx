import React, { useState, useEffect } from 'react';
import { Button, Card } from '@spicegarden/ui';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './profile.module.css';

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  interface ProfileData {
    fullName?: string;
    email?: string;
    phone?: string;
    profileImage?: string | null;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    createdAt?: string;
  }
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!token || token === 'demo-token') {
        // Use mock data for demo
        setProfileData({
          fullName: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '+91 98765 43210',
          profileImage: null,
          emailVerified: true,
          phoneVerified: true,
          createdAt: '2026-05-01T10:00:00Z',
        });
        setEditFormData({
          fullName: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '+91 98765 43210',
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // In a real app, this would be an API call to fetch user profile
        // For now, we'll use the user data from auth state
        setProfileData({
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          profileImage: user?.profileImage || null,
          emailVerified: user?.emailVerified || false,
          phoneVerified: user?.phoneVerified || false,
          createdAt: user?.createdAt || new Date().toISOString(),
        });
        setEditFormData({
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, token]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real app, this would be an API call to update profile
      // For now, we'll just update the local state
      setProfileData(editFormData);
      // Update auth state as well
      // dispatch(updateUser(editFormData)); // Assuming we have this action
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth');
  };

  if (loading && !profileData) {
    return (
      <div className={styles.loadingState}>
        <p>Loading profile...</p>
      </div>
    );
  }

   return (
     <div className={styles.pageContainer}>
       {error && (
         <div className={styles.errorBanner}>
           {error}
         </div>
       )}
       <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          {profileData?.profileImage ? (
            <Image
              src={profileData.profileImage}
              alt="Profile"
              width={80}
              height={80}
              className={styles.avatarImage}
            />
          ) : (
            '👤'
          )}
        </div>
        <h2 className={styles.profileName}>{isEditing ? editFormData.fullName : profileData?.fullName || 'User'}</h2>
        <p className={styles.profileEmail}>{isEditing ? editFormData.email : profileData?.email || ''}</p>
        <p className={styles.profilePhone}>{isEditing ? editFormData.phone : profileData?.phone || ''}</p>
        
        {!isEditing && (
          <div className={styles.editButtonWrapper}>
            <Button 
              label="Edit Profile" 
              onClick={() => setIsEditing(true)} 
              variant="secondary" 
            />
          </div>
        )}
      </div>

       {isEditing && (
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
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
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
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="phone" className={styles.label}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  className={styles.input}
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              
              <div className={styles.formActions}>
                <Button label="Cancel" onClick={() => setIsEditing(false)} variant="secondary" />
                <Button label="Save Changes" onClick={handleSaveProfile} />
              </div>
            </div>
          </Card>
        </>
      )}

      {!isEditing && (
        <>
          <Card title="Account Information">
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span>Email Verified</span>
                <span>{profileData?.emailVerified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className={styles.infoRow}>
                <span>Phone Verified</span>
                <span>{profileData?.phoneVerified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className={styles.infoRow}>
                <span>Member Since</span>
                <span>{profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Not available'}</span>
              </div>
            </div>
          </Card>

           <Card title="Security">
             <div className={styles.infoList}>
               <Button 
                 label="Change Password" 
                 onClick={() => {/* TODO: Implement password change */}} 
                 variant="secondary"
               />
               <Button 
                 label="Manage Devices" 
                 onClick={() => {/* TODO: Implement device management */}} 
                 variant="secondary"
               />
             </div>
           </Card>

           <Card title="Address Management">
             <div className={styles.infoList}>
               <Button 
                 label="Manage Addresses" 
                 onClick={() => {/* TODO: Implement address management */}} 
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
                 onClick={() => {/* TODO: Implement payment method management */}} 
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
