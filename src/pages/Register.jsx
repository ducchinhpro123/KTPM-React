import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Register = () => {
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setServerError(null);
    setSuccess(false);
    
    try {
      await API.post('/users/register', values);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.error) {
        setServerError(err.response.data.error);
      } else if (err.response?.status === 409) {
        setServerError('This email is already registered. Please use another email.');
      } else {
        setServerError('Registration failed. Please try again later.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Register</h1>
      <Formik
        initialValues={{ name: '', email: '', password: '' }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
            {serverError && <div className="text-red-500 text-center">{serverError}</div>}
            {success && <div className="text-green-500 text-center">Registration successful! Redirecting to login...</div>}
            
            <div className="space-y-1">
              <Field
                type="text"
                name="name"
                placeholder="Name"
                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
            </div>
            
            <div className="space-y-1">
              <Field
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
            </div>
            
            <div className="space-y-1">
              <Field
                type="password"
                name="password"
                placeholder="Password"
                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || loading || success}
              className={`w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition ${
                (isSubmitting || loading || success) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Register;