import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../store/userSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
});

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { token, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await API.get(`/users/${user._id}`); 
        setProfile(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, user]);

  const handleUpdateProfile = async (values, { setSubmitting }) => {
    setError(null);
    setUpdateSuccess(false);
    
    try {
      const response = await API.put(`/users/${user._id}`, values);
      setProfile(response.data.data);
      dispatch(updateUser(response.data.data)); // Update Redux state
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000); // Clear success message after 3 seconds
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={false} />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (!profile) {
    return <ErrorAlert message="User profile not found." />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">My Profile</h1>
      
      {updateSuccess && (
        <div className="max-w-md mx-auto mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Profile updated successfully!
        </div>
      )}
      
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        {isEditing ? (
          <Formik
            initialValues={{
              name: profile.name,
              email: profile.email
            }}
            validationSchema={ProfileSchema}
            onSubmit={handleUpdateProfile}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Name</label>
                  <Field
                    type="text"
                    name="name"
                    className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <Field
                    type="email"
                    name="email"
                    className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                </div>

                <div className="pt-2">
                  <p className="text-gray-600"><strong>Role:</strong> {profile.role}</p>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition flex-1 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="space-y-4">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-600 text-white py-2 px-4 w-full rounded-md hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;