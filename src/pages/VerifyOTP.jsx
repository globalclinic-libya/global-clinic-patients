import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://8001-i1csmgelwq595e3wt1acg-c7c750f2.manusvm.computer';

function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber = location.state?.mobileNumber;
  const debugOtp = location.state?.debugOtp; // For development only

  useEffect(() => {
    if (!mobileNumber) {
      navigate('/');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mobileNumber, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setLoading(true);
    
    try {
      const _response = await axios.post(`${API_BASE_URL}/api/auth/register/api/patient/verify`, {
        mobile_number: mobileNumber,
        otp_code: otp,
      }); 
      
      console.log('Verification Response:', _response.data);
      
      // Store the JWT token in localStorage
      if (_response.data.access_token) {
        localStorage.setItem('access_token', _response.data.access_token);
        localStorage.setItem('user_id', _response.data.user_id);
        localStorage.setItem('user_role', 'patient');
      }
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Verification error:', error);
      
      if (error._response) {
        const errorMessage = error._response.data.detail || 'حدث خطأ في الخادم';
        if (error._response.status === 400) {
          if (errorMessage.includes('expired')) {
            setError('انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.');
          } else if (errorMessage.includes('Invalid OTP')) {
            setError('رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
          } else {
            setError(errorMessage);
          }
        } else {
          setError(errorMessage);
        }
      } else if (error.request) {
        setError('فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
      } else {
        setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    
    try {
      const _response = await axios.post(`${API_BASE_URL}/api/auth/register/api/patient/start`, {
        mobile_number: mobileNumber,
      }); 
      
      setCountdown(300); // Reset countdown
      alert('تم إرسال رمز تحقق جديد إلى هاتفك');
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('فشل في إعادة إرسال رمز التحقق. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (!mobileNumber) {
    return null; // Will redirect in useEffect
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
          العيادة العالمية
        </Typography>
        <Typography component="h2" variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          التحقق من رمز التحقق
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          لقد أرسلنا رمز تحقق مكون من 6 أرقام إلى رقم هاتفك:
          <br />
          <strong>{mobileNumber}</strong>
        </Typography>

        {debugOtp && (
          <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
            رمز التحقق للاختبار: {debugOtp}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="otp"
            label="رمز التحقق"
            name="otp"
            autoComplete="one-time-code"
            autoFocus
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ 
              dir: 'ltr',
              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
            }}
            placeholder="123456"
            disabled={loading}
            error={!!error && !loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading || otp.length !== 6}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'جاري التحقق...' : 'تأكيد رمز التحقق'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            {countdown > 0 ? (
              <Typography variant="body2" color="text.secondary">
                يمكنك طلب رمز جديد خلال: {formatTime(countdown)}
              </Typography>
            ) : (
              <Button
                variant="text"
                onClick={handleResendOTP}
                disabled={loading}
                sx={{ textDecoration: 'underline' }}
              >
                إعادة إرسال رمز التحقق
              </Button>
            )}
          </Box>
          
          <Button
            variant="text"
            fullWidth
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
            disabled={loading}
          >
            العودة إلى صفحة تسجيل الدخول
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default VerifyOTP;

