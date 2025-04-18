'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Mail, Phone, MapPin, Building, BookOpen, Users, Calendar, MessageCircle, Upload, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

interface UserProfile {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    joiningDate: string;
    subjects: string[];
    classInfo: {
        class: string;
        section: string;
    };
    designation: string;
    location: string;
    profileImage?: string;
    statusMessage?: string;
    aboutMe?: string;
}

// Add this interface for country data
interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  flag: string;
  flags: {
    png: string;
    svg: string;
  };
  idd: {
    root: string;
    suffixes: string[];
  };
}

// Add this component at the top of your file, before the ProfilePage component
const EditButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="btn btn-ghost btn-xs"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
      <path d="m15 5 4 4"></path>
    </svg>
  </button>
);

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const statusInputRef = useRef<HTMLInputElement>(null);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+91"); // Default to India
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const [countries, setCountries] = useState<{code: string, flag: string, name: string}[]>([]);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [address, setAddress] = useState("");
    const addressInputRef = useRef<HTMLTextAreaElement>(null);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState("");
    const aboutInputRef = useRef<HTMLTextAreaElement>(null);
    const [originalAboutText, setOriginalAboutText] = useState("");
    
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Get user info from token
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.id;

                // Fetch user profile
                const response = await fetch(`/api/manage-staff?id=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const userData = await response.json();

                // If user is a student, fetch their class info
                if (payload.role === 'STUDENT') {
                    const classResponse = await fetch(`/api/student-class?studentId=${userId}`);
                    if (classResponse.ok) {
                        const classData = await classResponse.json();
                        userData.classInfo = {
                            class: classData.class.classNumber,
                            section: classData.section.section
                        };
                    }
                }

                // If user is a teacher, fetch their subjects
                if (payload.role === 'STAFF') {
                    const subjectsResponse = await fetch(`/api/manage-subject?staffId=${userId}`);
                    if (subjectsResponse.ok) {
                        const subjectsData = await subjectsResponse.json();
                        userData.subjects = subjectsData.map((subject: any) => subject.subject);
                    }
                }

                // Set initial status message from profile data
                if (userData.statusMessage) {
                    setStatusMessage(userData.statusMessage);
                } else {
                    setStatusMessage("Aspire to be a very good software engineer/build a facebook/see the world not from top but from the outer space");
                }

                if (userData.phone) {
                    // If phone number includes country code, split it
                    if (userData.phone.includes(" ")) {
                        const [code, number] = userData.phone.split(" ");
                        setCountryCode(code);
                        setPhoneNumber(number);
                    } else {
                        // Otherwise just set the number
                        setPhoneNumber(userData.phone);
                    }
                }

                if (userData.address) {
                    setAddress(userData.address);
                }

                if (userData.aboutMe) {
                    const aboutText = userData.aboutMe;
                    setAboutText(aboutText);
                    setOriginalAboutText(aboutText);
                } else {
                    // Set default value if no aboutMe data exists
                    const defaultText = userData.role === 'STUDENT' 
                        ? 'I\'m currently studying. My design journey started in 2012, sitting across my brother in our home office on the island of Krk, Croatia.' 
                        : 'I manage creative teams and set up processes that allow our collaborators and clients to achieve growth, scalability, and progress. My design journey started in 2012, sitting across my brother in our home office on the island of Krk, Croatia.';
                    setAboutText(defaultText);
                    setOriginalAboutText(defaultText);
                }

                setProfile(userData);
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Add this to your useEffect or create a new one
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2');
                if (!response.ok) {
                    throw new Error('Failed to fetch countries');
                }
                
                const data: Country[] = await response.json();
                
                // Format the data for our dropdown
                const formattedCountries = data
                    .filter(country => country.idd.root) // Only countries with phone codes
                    .map(country => {
                        // Some countries have multiple suffixes, we'll use the first one
                        const suffix = country.idd.suffixes && country.idd.suffixes.length > 0 ? country.idd.suffixes[0] : '';
                        const code = `${country.idd.root}${suffix}`;
                        
                        return {
                            code,
                            flag: country.flag, // This is the emoji flag
                            name: country.name.common,
                            cca2: country.cca2
                        };
                    })
                    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
                
                setCountries(formattedCountries);
                
            } catch (error) {
                console.error('Error fetching countries:', error);
                // Fallback to a few common countries if the API fails
                setCountries([
                    { code: "+91", flag: "🇮🇳", name: "India" },
                    { code: "+1", flag: "🇺🇸", name: "United States" },
                    { code: "+44", flag: "🇬🇧", name: "United Kingdom" }
                ]);
            }
        };
        
        fetchCountries();
    }, []);

    // Add this to handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if we're clicking outside the dropdown
            const dropdownElement = document.getElementById('country-dropdown');
            const dropdownButton = document.getElementById('country-dropdown-button');
            
            if (showCountryDropdown && 
                dropdownElement && 
                !dropdownElement.contains(event.target as Node) &&
                dropdownButton && 
                !dropdownButton.contains(event.target as Node)) {
                setShowCountryDropdown(false);
            }
            
            // Check if we're clicking outside the phone input area when editing
            if (isEditingPhone) {
                const phoneInputArea = document.getElementById('phone-input-area');
                if (phoneInputArea && !phoneInputArea.contains(event.target as Node)) {
                    if (phoneNumber.length === 10) {
                        handlePhoneUpdate();
                    } else if (phoneNumber.length > 0) {
                        toast.error('Please enter a 10-digit number');
                    } else {
                        setIsEditingPhone(false);
                    }
                }
            }

            if (isEditingAddress) {
                const addressInputArea = document.getElementById('address-input-area');
                if (addressInputArea && !addressInputArea.contains(event.target as Node)) {
                    if (address.length >= 5) {
                        handleAddressUpdate();
                    } else if (address.length > 0) {
                        toast.error('Address must be at least 5 characters');
                    } else {
                        setIsEditingAddress(false);
                    }
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditingPhone, showCountryDropdown, phoneNumber, isEditingAddress, address]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Compress the image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true
            };
            const compressedFile = await imageCompression(file, options);

            
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                            
                // Get user ID from token
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');
                const payload = JSON.parse(atob(token.split('.')[1]));
                
                // Update profile image
                const response = await fetch(`/api/manage-staff?id=${payload.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageData: base64String
                    }),
                });

                if (response.ok) {
                    setProfile(prev => prev ? { ...prev, profileImage: base64String } : null);
                    toast.success('Profile image updated successfully');
                } else {
                    throw new Error('Failed to update profile image');
                }
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        }
    };

    const handleStatusUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            const response = await fetch(`/api/manage-staff?id=${payload.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    statusMessage: statusMessage
                }),
            });

            if (response.ok) {
                setProfile(prev => prev ? { ...prev, statusMessage } : null);
                toast.success('Status updated successfully');
                setIsEditingStatus(false);
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const validatePhoneInput = (input: string) => {
        // Only allow digits
        const digitsOnly = input.replace(/\D/g, '');
        
        // Limit to 10 digits
        return digitsOnly.slice(0, 10);
    };

    const handlePhoneUpdate = async () => {
        // Validate phone number
        if (phoneNumber.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Format phone with country code
            const formattedPhone = `${countryCode} ${phoneNumber}`;
            
            const response = await fetch(`/api/manage-staff?id=${payload.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: formattedPhone
                }),
            });

            if (response.ok) {
                setProfile(prev => prev ? { ...prev, phone: formattedPhone } : null);
                toast.success('Phone number updated successfully');
                setIsEditingPhone(false);
            } else {
                throw new Error('Failed to update phone number');
            }
        } catch (error) {
            console.error('Error updating phone number:', error);
            toast.error('Failed to update phone number');
        }
    };

    // Function to get flag for a country code
    const getFlagForCountryCode = (code: string) => {
        const country = countries.find(c => c.code === code);
        return country ? country.flag : "🌍";
    };

    const handleAddressUpdate = async () => {
        // Validate address length
        if (address.length < 5) {
            toast.error('Address must be at least 5 characters');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            const response = await fetch(`/api/manage-staff?id=${payload.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: address
                }),
            });

            if (response.ok) {
                setProfile(prev => prev ? { ...prev, address } : null);
                toast.success('Address updated successfully');
                setIsEditingAddress(false);
            } else {
                throw new Error('Failed to update address');
            }
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Failed to update address');
        }
    };

    const handleAboutUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            const response = await fetch(`/api/manage-staff?id=${payload.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    aboutMe: aboutText
                }),
            });

            if (response.ok) {
                setProfile(prev => prev ? { ...prev, aboutMe: aboutText } : null);
                toast.success('About Me updated successfully');
                setIsEditingAbout(false);
            } else {
                throw new Error('Failed to update About Me');
            }
        } catch (error) {
            console.error('Error updating About Me:', error);
            toast.error('Failed to update About Me');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-error">Failed to load profile</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            {/* Profile Header Card */}
            <Card className="w-full mb-6 overflow-hidden">
                <div className="relative">
                    {/* Cover Image */}
                    <div className="h-48 bg-gradient-to-r from-primary to-secondary"></div>
                    
                    {/* Profile Image and Basic Info */}
                    <div className="px-6 pb-6">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16">
                            <div className="relative group">
                                <div className="mb-4 w-32 h-32 rounded-full border-4 border-base-100 overflow-hidden bg-base-300">
                                    <img 
                                        src={profile?.profileImage || "/images/mayank.jpg"} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ top: '4px', left: '4px', width: 'calc(100% - 8px)', height: 'calc(100% - 8px - 16px)' }}
                                >
                                    <Upload className="w-6 h-6 text-white" />
                                </button>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            
                            <div className="flex-1 space-y-2">
                                <h1 className="text-2xl font-bold text-base-content mt-2">
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                <div className="relative pl-6 mb-2 text-base-content/80">
                                    <MessageCircle className="w-4 h-4 text-primary absolute left-0 top-1" />
                                    {isEditingStatus ? (
                                        <div className="w-full">
                                            <div className="w-full">
                                                <input
                                                    ref={statusInputRef}
                                                    type="text"
                                                    value={statusMessage}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= 150) {
                                                            setStatusMessage(e.target.value);
                                                        }
                                                    }}
                                                    className="input input-bordered w-full"
                                                    style={{ height: '40px' }}
                                                    autoFocus
                                                    maxLength={150}
                                                    onBlur={handleStatusUpdate}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleStatusUpdate()}
                                                />
                                                <div className="text-xs text-right mt-1 text-gray-500">
                                                    {statusMessage.length}/150 characters
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between w-full">
                                            <p className="italic">
                                                {profile.statusMessage || statusMessage}
                                            </p>
                                            <EditButton onClick={() => {
                                                setIsEditingStatus(true);
                                                setTimeout(() => statusInputRef.current?.focus(), 0);
                                            }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button outline className="hidden md:block">
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* About Section */}
            <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">About Me</h2>
                {isEditingAbout ? (
                    <div id="about-input-area" className="space-y-4">
                        <textarea
                            ref={aboutInputRef}
                            value={aboutText}
                            onChange={(e) => setAboutText(e.target.value)}
                            className="textarea textarea-bordered w-full"
                            rows={5}
                            placeholder="Write something about yourself..."
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                                {aboutText.length}/500 characters
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setAboutText(originalAboutText); // Restore original text
                                        setIsEditingAbout(false);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={handleAboutUpdate}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start justify-between">
                        <div className="text-base-content/80 flex-1">
                            <p className="whitespace-pre-wrap">{aboutText}</p>
                        </div>
                        <EditButton onClick={() => {
                            setIsEditingAbout(true);
                            setTimeout(() => aboutInputRef.current?.focus(), 0);
                        }} />
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-base-content">Contact Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-primary" />
                            <span className="text-base-content">{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-primary" />
                            {isEditingPhone ? (
                                <div className="flex-1">
                                    <div id="phone-input-area" className="flex items-center w-full">
                                        <div className="relative">
                                            <button 
                                                id="country-dropdown-button"
                                                type="button"
                                                className="flex items-center gap-1 border rounded-l-md px-2 py-1 bg-base-200"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                            >
                                                <span>{getFlagForCountryCode(countryCode)}</span>
                                                <span>{countryCode}</span>
                                                <ChevronDown size={14} />
                                            </button>
                                            
                                            {showCountryDropdown && (
                                                <div id="country-dropdown" className="absolute top-full left-0 mt-1 w-64 bg-base-100 shadow-lg rounded-md z-10 max-h-60 overflow-y-auto">
                                                    <div className="p-2 sticky top-0 bg-base-100 border-b">
                                                        <input
                                                            type="text"
                                                            placeholder="Search countries..."
                                                            className="input input-bordered input-sm w-full"
                                                            value={countrySearch}
                                                            onChange={(e) => setCountrySearch(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    {countries
                                                        .filter(country => 
                                                            country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                                            country.code.includes(countrySearch)
                                                        )
                                                        .map(country => (
                                                            <button
                                                                key={country.code + country.name}
                                                                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-base-200 text-left"
                                                                onClick={() => {
                                                                    setCountryCode(country.code);
                                                                    setShowCountryDropdown(false);
                                                                    setCountrySearch("");
                                                                }}
                                                            >
                                                                <span>{country.flag}</span>
                                                                <span className="flex-1 truncate">{country.name}</span>
                                                                <span className="text-gray-500 text-sm">{country.code}</span>
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <input
                                            ref={phoneInputRef}
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(validatePhoneInput(e.target.value))}
                                            className="input input-bordered input-sm flex-1 rounded-l-none"
                                            autoFocus
                                            placeholder="10-digit number"
                                            maxLength={10}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && phoneNumber.length === 10) {
                                                    handlePhoneUpdate();
                                                } else if (e.key === 'Escape') {
                                                    setIsEditingPhone(false);
                                                }
                                            }}
                                        />
                                    </div>
                                    {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                                        <p className="text-xs text-error mt-1">Please enter a 10-digit number</p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-base-content">
                                        {profile.phone ? (
                                            <span className="flex items-center gap-1">
                                                {profile.phone.includes(" ") ? (
                                                    <>
                                                        <span>{getFlagForCountryCode(profile.phone.split(" ")[0])}</span>
                                                        <span>{profile.phone}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🇮🇳</span>
                                                        <span>+91 {profile.phone}</span>
                                                    </>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <span className="text-yellow-500">⚠️</span>
                                                <span>Not provided</span>
                                            </span>
                                        )}
                                    </span>
                                    <EditButton onClick={() => {
                                        setIsEditingPhone(true);
                                        setTimeout(() => phoneInputRef.current?.focus(), 0);
                                    }} />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-primary" />
                            {isEditingAddress ? (
                                <div className="flex-1" id="address-input-area">
                                    <div className="w-full">
                                        <textarea
                                            ref={addressInputRef}
                                            value={address}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 200) {
                                                    setAddress(e.target.value);
                                                }
                                            }}
                                            className="textarea textarea-bordered w-full"
                                            autoFocus
                                            maxLength={200}
                                            rows={3}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey && address.length >= 5) {
                                                    e.preventDefault();
                                                    handleAddressUpdate();
                                                } else if (e.key === 'Escape') {
                                                    setIsEditingAddress(false);
                                                }
                                            }}
                                            placeholder="Enter your address (5-200 characters)"
                                        />
                                        <div className="text-xs text-right mt-1 text-gray-500">
                                            {address.length}/200 characters
                                        </div>
                                    </div>
                                    {address.length > 0 && address.length < 5 && (
                                        <p className="text-xs text-error mt-1">Address must be at least 5 characters</p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-base-content">{profile.address}</span>
                                    <EditButton onClick={() => {
                                        setIsEditingAddress(true);
                                        setTimeout(() => addressInputRef.current?.focus(), 0);
                                    }} />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}