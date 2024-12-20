import * as React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { styled } from '@mui/material/styles';


const defaultTheme = createTheme();
const apiUrl = process.env.REACT_APP_API_URL;
const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5',
      light: '#42A5F5',
      dark: '#1565C0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontFamily: '"Inter", sans-serif',
            '&:hover fieldset': {
              borderColor: '#1E88E5',
            },
          },
          '& label': {
            fontFamily: '"Inter", sans-serif',
          },
        },
      },
    },
  },
});

const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 800,
  background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.5px',
  marginBottom: theme.spacing(1),
  fontFamily: '"Poppins", sans-serif',
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  color: '#666',
  fontSize: '1rem',
  marginBottom: theme.spacing(4),
  fontFamily: '"Inter", sans-serif',
}));

export default function SignUp() {
  const navigate = useNavigate();
  const [agree, setAgree] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState("success");
  const [message, setMessage] = React.useState("");

  const handleCheckboxChange = (event) => {
    setAgree(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const userData = {
      name: `${data.get("firstName")} ${data.get("lastName")}`,
      email: data.get("email"),
      password: data.get("password"),
    };
    try {
      await axios.post(`${apiUrl}/register`, userData);
      setMessage("Register new user successfully!");
      setSeverity("success");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage("An error occurred. Please try again.");
      }
      setSeverity("error");
    }
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            marginBottom: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: 4,
            borderRadius: 3,
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
          }}
        >
          <Link href="/" sx={{ textDecoration: 'none' }}>
            <LogoText>
              WriteTeX
            </LogoText>
          </Link>
          <SubTitle>
            Join the Professional LaTeX Community
          </SubTitle>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  sx={{ backgroundColor: '#f8fafc' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  sx={{ backgroundColor: '#f8fafc' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  sx={{ backgroundColor: '#f8fafc' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  sx={{ backgroundColor: '#f8fafc' }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={handleCheckboxChange}
                      color="primary"
                      sx={{
                        '&.Mui-checked': {
                          color: '#1E88E5',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ 
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.95rem',
                      color: '#4a5568'
                    }}>
                      I agree to the Terms and Conditions
                    </Typography>
                  }
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!agree}
              sx={{
                mt: 4,
                mb: 3,
                height: '52px',
                borderRadius: '12px',
                background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
                fontSize: '1.1rem',
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                textTransform: 'none',
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(30, 136, 229, 0.2)',
                  background: 'linear-gradient(45deg, #1565C0 30%, #1E88E5 90%)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e',
                },
              }}
            >
              Create Account
            </Button>

            <Typography 
              variant="body2" 
              align="center"
              sx={{
                color: '#666',
                fontFamily: '"Inter", sans-serif',
                '& a': {
                  color: '#1E88E5',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#1565C0',
                    textDecoration: 'underline',
                  },
                },
              }}
            >
              <Link href="/login">
                Already have an account? Sign in
              </Link>
            </Typography>
          </Box>
        </Box>

        <Snackbar
          anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity={severity}
            sx={{
              width: '100%',
              borderRadius: 2,
              fontWeight: 500,
              fontFamily: '"Inter", sans-serif',
              '& .MuiAlert-message': {
                fontSize: '0.95rem',
              },
            }}
          >
            {message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
