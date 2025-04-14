import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/userSlice';
import API from '../services/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get returnUrl from state (if redirected from a protected route)
  const returnUrl = location.state?.returnUrl || '/';

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setServerError(null);
    try {
      const response = await API.post('/users/login', values);
      dispatch(login({ user: response.data.data, token: response.data.token }));
      // Redirect to the return URL or home page
      navigate(returnUrl); 
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.error) {
        setServerError(err.response.data.error);
      } else if (err.response?.status === 401) {
        setServerError('Invalid email or password. Please try again.');
      } else {
        setServerError('Login failed. Please try again later.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
            {serverError && <div className="text-red-500 text-center">{serverError}</div>}
            
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
              disabled={isSubmitting || loading}
              className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition ${
                (isSubmitting || loading) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;