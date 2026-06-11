"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const ui_1 = require("@spicegarden/ui");
const router_1 = require("next/router");
const react_redux_1 = require("react-redux");
const authSlice_1 = require("../redux/slices/authSlice");
const ProfilePage = () => {
    const router = (0, router_1.useRouter)();
    const dispatch = (0, react_redux_1.useDispatch)();
    const { user, token } = (0, react_redux_1.useSelector)((state) => state.auth);
    const [profileData, setProfileData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [editFormData, setEditFormData] = (0, react_1.useState)({
        fullName: '',
        email: '',
        phone: '',
    });
    (0, react_1.useEffect)(() => {
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
            }
            catch (err) {
                console.error('Failed to load profile:', err);
                setError('Failed to load profile. Please try again later.');
            }
            finally {
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
        }
        catch (err) {
            console.error('Failed to save profile:', err);
            setError('Failed to save profile. Please try again later.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogout = () => {
        dispatch((0, authSlice_1.logout)());
        router.push('/auth');
    };
    if (loading && !profileData) {
        return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: ui_1.DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading profile...</p>
      </div>);
    }
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md }}>
       {error && (<div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: ui_1.DESIGN_TOKENS.spacing.md, fontSize: '14px' }}>
           {error}
         </div>)}
       <div style={{ textAlign: 'center', marginBottom: ui_1.DESIGN_TOKENS.spacing.xl }}>
        <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: ui_1.DESIGN_TOKENS.colors.primary,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: 'white'
        }}>
          {profileData?.profileImage ? (<img src={profileData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}/>) : ('👤')}
        </div>
        <h2 style={{ margin: '12px 0 4px 0' }}>{isEditing ? editFormData.fullName : profileData?.fullName || 'User'}</h2>
        <p style={{ color: '#666', margin: 0 }}>{isEditing ? editFormData.email : profileData?.email || ''}</p>
        <p style={{ color: '#999', margin: '4px 0 0 0', fontSize: '14px' }}>{isEditing ? editFormData.phone : profileData?.phone || ''}</p>
        
        {!isEditing && (<div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.md }}>
            <ui_1.Button label="Edit Profile" onClick={() => setIsEditing(true)} variant="secondary"/>
          </div>)}
      </div>

       {isEditing && (<>
          <ui_1.Card title="Edit Profile">
            <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.md }}>
              <div>
                <label htmlFor="fullName" style={{ display: 'block', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs, fontWeight: '500' }}>
                  Full Name
                </label>
                <input id="fullName" type="text" value={editFormData.fullName} onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })} style={{ width: '100%', padding: ui_1.DESIGN_TOKENS.spacing.sm, borderRadius: ui_1.DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}/>
              </div>
              
              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs, fontWeight: '500' }}>
                  Email
                </label>
                <input id="email" type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} style={{ width: '100%', padding: ui_1.DESIGN_TOKENS.spacing.sm, borderRadius: ui_1.DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}/>
              </div>
              
              <div>
                <label htmlFor="phone" style={{ display: 'block', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs, fontWeight: '500' }}>
                  Phone Number
                </label>
                <input id="phone" type="tel" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} style={{ width: '100%', padding: ui_1.DESIGN_TOKENS.spacing.sm, borderRadius: ui_1.DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}/>
              </div>
              
              <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.md, marginTop: ui_1.DESIGN_TOKENS.spacing.lg }}>
                <ui_1.Button label="Cancel" onClick={() => setIsEditing(false)} variant="secondary"/>
                <ui_1.Button label="Save Changes" onClick={handleSaveProfile}/>
              </div>
            </div>
          </ui_1.Card>
        </>)}

      {!isEditing && (<>
          <ui_1.Card title="Account Information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Email Verified</span>
                <span>{profileData?.emailVerified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phone Verified</span>
                <span>{profileData?.phoneVerified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Member Since</span>
                <span>{new Date(profileData?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </ui_1.Card>

           <ui_1.Card title="Security">
             <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
               <ui_1.Button label="Change Password" onClick={() => { }} variant="secondary"/>
               <ui_1.Button label="Manage Devices" onClick={() => { }} variant="secondary"/>
             </div>
           </ui_1.Card>

           <ui_1.Card title="Address Management">
             <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
               <ui_1.Button label="Manage Addresses" onClick={() => { }} variant="secondary"/>
               <p style={{ color: '#666', fontSize: '14px' }}>
                 Saved addresses will appear here
               </p>
             </div>
           </ui_1.Card>

           <ui_1.Card title="Payment Methods">
             <div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
               <ui_1.Button label="Manage Payment Methods" onClick={() => { }} variant="secondary"/>
               <p style={{ color: '#666', fontSize: '14px' }}>
                 Saved payment methods will appear here
               </p>
             </div>
           </ui_1.Card>

          <div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.xl, textAlign: 'center' }}>
            <ui_1.Button label="Sign Out" onClick={handleLogout} variant="secondary" style={{ width: '100%' }}/>
          </div>
        </>)}
    </div>);
};
exports.default = ProfilePage;
