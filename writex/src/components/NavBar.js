import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CreateIcon from "@mui/icons-material/Create";
import HomeIcon from "@mui/icons-material/Home";
import SaveIcon from "@mui/icons-material/Save";
import { Stack, TextField, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Logo from "./Logo";

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
});

// Styled components
const NavContainer = styled('nav')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 24px',
  backgroundColor: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  gap: '20px',
}));

const BrandSection = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '& h3': {
    margin: 0,
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 800,
    background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
}));

const ActionIcon = styled('div')(({ theme }) => ({
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: '#64748b',
  '&:hover': {
    backgroundColor: '#f1f5f9',
    color: '#1E88E5',
    transform: 'translateY(-2px)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiFilledInput-root': {
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
    '&.Mui-focused': {
      backgroundColor: '#f8fafc',
    },
  },
  '& .MuiFilledInput-input': {
    padding: '12px 16px',
    fontFamily: '"Inter", sans-serif',
  },
}));

const ProjectTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Inter", sans-serif',
  fontWeight: 500,
  color: '#1e293b',
  cursor: 'text',
  padding: '8px 16px',
  borderRadius: '12px',
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
}));

function NavBar(props) {
  const { id, title, content } = props;
  const [open, setOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState("success");
  const [message, setMessage] = React.useState("");
  const handleCloseDialog = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  const [editing, setEditing] = useState(false);
  const [titleEdit, setTitleEdit] = useState(title);
  const handleEditStart = () => {
    setEditing(true);
  };
  const handleEditEnd = () => {
    setEditing(false);
  };
  const handleChange = (event) => {
    setTitleEdit(event.target.value);
  };
  const updateProjectData = async (title, content) => {
    try {
      const response = await api.put(`${apiUrl}/projects/${id}`, {
        title,
        content,
      });
      const data = await response.data;
      if (data) {
        setMessage("Update project successfully!");
        setSeverity("success");
        setTimeout(() => {
          navigate(`/`);
        }, 1000);
      }
    } catch (error) {
      setMessage("Error updating project data:", error.message);
      setSeverity("error");
    }
    setOpen(true);
  };
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <NavContainer>
        <BrandSection>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <h3>WriteTeX</h3>
        </BrandSection>

        <Divider orientation="vertical" flexItem sx={{ 
          borderColor: '#e2e8f0',
          height: '32px',
          margin: '0 8px'
        }} />

        <Tooltip title="Back to your projects">
          <ActionIcon>
            <HomeIcon onClick={() => navigate("/")} />
          </ActionIcon>
        </Tooltip>

        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center"
          sx={{ 
            marginLeft: '200px',
            flex: 1,
          }}
        >
          {editing ? (
            <StyledTextField
              id="textField"
              defaultValue={title}
              variant="filled"
              onChange={handleChange}
              onBlur={handleEditEnd}
              autoFocus
              value={titleEdit}
              InputProps={{
                disableUnderline: true,
              }}
            />
          ) : (
            <ProjectTitle
              onClick={handleEditStart}
              variant="h6"
            >
              {titleEdit}
            </ProjectTitle>
          )}
          <ActionIcon>
            <CreateIcon onClick={handleEditStart} />
          </ActionIcon>
        </Stack>

        <Tooltip title="Save project">
          <ActionIcon>
            <SaveIcon onClick={() => updateProjectData(titleEdit, content)} />
          </ActionIcon>
        </Tooltip>

        <Snackbar
          anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
          open={open}
          autoHideDuration={3000}
          onClose={handleCloseDialog}
        >
          <Alert
            onClose={handleCloseDialog}
            severity={severity}
            sx={{
              width: '100%',
              borderRadius: '12px',
              fontFamily: '"Inter", sans-serif',
              '& .MuiAlert-message': {
                fontSize: '0.95rem',
              },
            }}
          >
            {message}
          </Alert>
        </Snackbar>
      </NavContainer>
    </ThemeProvider>
  );
}

export default NavBar;
