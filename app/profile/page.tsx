'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Lock,
  Sliders,
  Moon,
  Sun,
  Shield,
  Eye,
  EyeOff,
  Check,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { usersService } from '@/services/users';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const { userProfile, updateUserProfile, theme, setTheme } = useStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile fields state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Security / MFA state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isRotatingCert, setIsRotatingCert] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync state with store profile on load
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setGithub(userProfile.github || '');
      setLinkedin(userProfile.linkedin || '');
      setAvatar(userProfile.avatar || '');
    }
  }, [userProfile]);

  // Handle profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      showToast('Name and Email are required fields.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload = {
        full_name: fullName,
        email: email,
        phone: phone || null,
        github: github || null,
        linkedin: linkedin || null,
        profile_picture: avatar || null
      };

      await usersService.updateUser(userProfile.id, payload);
      
      // Update state in Zustand store
      updateUserProfile({
        name: fullName,
        email: email,
        phone: phone,
        github: github,
        linkedin: linkedin,
        avatar: avatar
      });

      showToast('Profile settings updated successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile settings.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      showToast('Password field cannot be empty.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await usersService.updateUser(userProfile.id, { password: newPassword });
      showToast('Security password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update security password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Cert rotation simulation
  const handleRotateCert = () => {
    setIsRotatingCert(true);
    setTimeout(() => {
      setIsRotatingCert(false);
      showToast('Enterprise security certificate rotated successfully.');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-text-primary">
      {/* Profile Overview Header Card */}
      <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative overflow-hidden">
        {/* Background visual detail */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />

        {/* Big Avatar */}
        <div 
          className="w-24 h-24 rounded-full bg-cover bg-center border-2 border-accent-blue shadow-lg flex-shrink-0"
          style={{ backgroundImage: `url(${avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'})` }}
        />

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-extrabold">{fullName || userProfile.name}</h2>
            <span className="w-fit bg-accent-blue/15 text-accent-blue text-2xs font-extrabold px-2.5 py-0.5 rounded-full border border-accent-blue/20 mx-auto md:mx-0">
              {userProfile.role}
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium">{userProfile.department || 'Executive Leadership'}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-2xs text-text-secondary pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-text-muted" /> New York, HQ
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-text-muted" /> {email || userProfile.email}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="profile" className="w-full space-y-4" onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto flex flex-wrap border-b border-border-subtle bg-transparent p-0 rounded-none h-auto gap-6 mb-2">
          <TabsTrigger 
            value="profile"
            className="flex items-center gap-2 pb-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-accent-blue data-[state=active]:bg-transparent data-[state=active]:shadow-none text-text-secondary data-[state=active]:text-accent-blue font-bold text-sm transition-all animate-none"
          >
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className="flex items-center gap-2 pb-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-accent-blue data-[state=active]:bg-transparent data-[state=active]:shadow-none text-text-secondary data-[state=active]:text-accent-blue font-bold text-sm transition-all animate-none"
          >
            <Lock className="w-4 h-4" />
            Password and security
          </TabsTrigger>
          <TabsTrigger 
            value="customization"
            className="flex items-center gap-2 pb-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-accent-blue data-[state=active]:bg-transparent data-[state=active]:shadow-none text-text-secondary data-[state=active]:text-accent-blue font-bold text-sm transition-all animate-none"
          >
            <Sliders className="w-4 h-4" />
            Theme and customization
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile" className="space-y-6 outline-none focus:outline-none">
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-none">
            
            {/* Left/Main Column: Settings Form fields */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3">Personal Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
                    <Input 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vincent CEO"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. vincent@nurofin.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-text-secondary uppercase tracking-wider">Phone Number</label>
                    <Input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-text-secondary uppercase tracking-wider">Profile Picture URL</label>
                    <Input 
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="HTTPS URL to image"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3">Social Connections</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-text-secondary tracking-wider uppercase flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5" /> GitHub Profile
                    </label>
                    <Input 
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-text-secondary tracking-wider uppercase flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                    </label>
                    <Input 
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto font-bold flex items-center gap-2"
                >
                  {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Right Column: Core Skill Sets (Read-Only Tags) */}
            <div className="space-y-6">
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3 flex items-center gap-2">
                  Core Skill Sets
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {userProfile.skills && userProfile.skills.length > 0 ? (
                    userProfile.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="text-2xs bg-background-primary border border-border-subtle px-3 py-1.5 rounded font-medium text-text-secondary select-none"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted">No core skills added.</span>
                  )}
                </div>
              </div>

              <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md space-y-3">
                <h4 className="text-2xs font-bold text-text-secondary uppercase tracking-wider">Account Metadata</h4>
                <div className="space-y-2 text-2xs font-medium text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-text-muted">System ID:</span>
                    <span className="font-mono text-[10px]">{userProfile.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Security Role:</span>
                    <span className="text-accent-blue">{userProfile.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Department:</span>
                    <span>{userProfile.department || 'Executive Board'}</span>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </TabsContent>

        {/* Tab 2: Password and security */}
        <TabsContent value="security" className="space-y-6 outline-none focus:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-none">
            
            {/* Main Form Block */}
            <div className="md:col-span-2 space-y-6">
              <form onSubmit={handleSavePassword} className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md space-y-5 animate-none">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-accent-blue" />
                  Update Password
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-text-secondary uppercase tracking-wider">New Password</label>
                    <div className="relative flex items-center">
                      <Input 
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new secure password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 text-text-muted hover:text-text-secondary focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-text-secondary uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative flex items-center">
                      <Input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-text-muted hover:text-text-secondary focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-border-subtle/50 pt-4">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isChangingPassword}
                    className="font-bold flex items-center gap-2"
                  >
                    {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Password
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Column: Security overview / MFA */}
            <div className="space-y-6">
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md space-y-4 animate-none">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-green" />
                  MFA Verification
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Enhance your account security by requiring a confirmation code from your authentication device upon login.
                </p>

                <div className="flex items-center justify-between p-3.5 bg-background-primary border border-border-subtle rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">Multi-Factor (MFA)</span>
                    <span className={cn(
                      "text-[10px] font-semibold mt-0.5",
                      mfaEnabled ? "text-accent-green" : "text-text-muted"
                    )}>
                      {mfaEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      setMfaEnabled(!mfaEnabled);
                      showToast(mfaEnabled ? 'Multi-Factor Authentication disabled.' : 'Multi-Factor Authentication activated successfully.');
                    }}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      mfaEnabled ? "bg-accent-blue" : "bg-border-subtle"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      mfaEnabled ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>

              <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md space-y-4 animate-none">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Enterprise Security</h3>
                <p className="text-2xs text-text-secondary leading-relaxed">
                  Your identity signature verifies digital assets. Rotate your cryptographically generated certificate regular intervals.
                </p>
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={handleRotateCert}
                  disabled={isRotatingCert}
                  className="w-full font-bold text-xs flex items-center justify-center gap-2"
                >
                  {isRotatingCert && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Rotate Certificate
                </Button>
              </div>
            </div>

          </div>
        </TabsContent>

        {/* Tab 3: Theme and customization */}
        <TabsContent value="customization" className="space-y-6 outline-none focus:outline-none">
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md space-y-6 animate-none">
            <div>
              <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3">Appearance Theme</h3>
              <p className="text-xs text-text-secondary mt-1.5">Select your preferred user interface color environment.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  showToast('Workspace appearance set to Light Mode.');
                }}
                className={cn(
                  "group relative flex flex-col items-center justify-center p-6 bg-background-primary border-2 rounded-xl transition-all duration-300 overflow-hidden hover:scale-[1.01]",
                  theme === 'light' 
                    ? "border-accent-blue shadow-lg shadow-accent-blue/5" 
                    : "border-border-subtle hover:border-text-muted"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue mb-3 transition-transform group-hover:rotate-45 duration-500">
                  <Sun className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-text-primary mb-1">Light Mode</span>
                <span className="text-2xs text-text-secondary text-center">Clean and bright executive environment.</span>
                {theme === 'light' && (
                  <div className="absolute top-2.5 right-2.5 bg-accent-blue text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  showToast('Workspace appearance set to Dark Mode.');
                }}
                className={cn(
                  "group relative flex flex-col items-center justify-center p-6 bg-background-primary border-2 rounded-xl transition-all duration-300 overflow-hidden hover:scale-[1.01]",
                  theme === 'dark' 
                    ? "border-accent-blue shadow-lg shadow-accent-blue/5" 
                    : "border-border-subtle hover:border-text-muted"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue mb-3 transition-transform group-hover:-rotate-12 duration-500">
                  <Moon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-text-primary mb-1">Dark Mode</span>
                <span className="text-2xs text-text-secondary text-center">Low-light optimized dashboard interface.</span>
                {theme === 'dark' && (
                  <div className="absolute top-2.5 right-2.5 bg-accent-blue text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>

            <div className="border-t border-border-subtle pt-6 space-y-4">
              <h4 className="text-xs font-bold text-text-primary">Interface Preferences</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background-primary border border-border-subtle rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Enable UI Micro-animations</span>
                    <span className="text-[10px] text-text-muted mt-0.5">Show interactive transitions and visual effects.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    defaultChecked
                    className="w-4.5 h-4.5 accent-accent-blue rounded text-accent-blue" 
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-lg border shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-300",
          toast.type === 'success' 
            ? "bg-background-secondary border-accent-green/20 text-accent-green" 
            : "bg-background-secondary border-accent-red/20 text-accent-red"
        )}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-xs font-bold text-text-primary">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
