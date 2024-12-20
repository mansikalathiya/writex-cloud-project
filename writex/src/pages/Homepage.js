import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button, Container, Grid, Stack, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Cookies from "js-cookie";
import moment from "moment/moment";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ResponsiveAppBar from "../components/AppBar";
import { BlankPlaceholder } from "../components/blankPlaceholder";
import placeholder from "../components/placeholder";
import TableProjects from "../components/TableProjects";

const apiUrl = process.env.REACT_APP_API_URL;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5',
      light: '#42A5F5',
      dark: '#1565C0',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", sans-serif',
    h5: {
      fontWeight: 600,
      color: '#2d3748',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontSize: '1rem',
          padding: '8px 24px',
          fontFamily: '"Inter", sans-serif',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(30, 136, 229, 0.2)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          padding: '16px',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4),
  backgroundColor: '#f8fafc',
}));

const PageHeader = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2, 4),
  backgroundColor: 'white',
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontFamily: '"Inter", sans-serif',
  fontSize: '0.95rem',
  padding: theme.spacing(1.5, 3),
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    fontFamily: '"Inter", sans-serif',
  },
  '& .MuiInputLabel-root': {
    fontFamily: '"Inter", sans-serif',
  },
}));

const Homepage = () => {
  const [open, setOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState("success");
  const [message, setMessage] = React.useState("");
  const handleCloseDialog = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const [dataProject, setDataProject] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const [dialogState, setDialogState] = React.useState({
    open: false,
    projectType: "",
  });

  const handleClickOpen = (type) => {
    setDialogState({ open: true, projectType: type });
  };

  const handleClose = () => {
    setDialogState({ open: false, projectType: "" });
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const getMonthYear = () => {
    const today = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = today.getMonth(); // Get month index (0-11)
    const month = monthNames[monthIndex];
    const year = today.getFullYear();

    return `${month} ${year}`;
  };

  function buildData(data, userId) {
    return data
      .filter((record) => record.userId === userId)
      .map((record) => ({
        ...record,
        updatedAt: moment(record.updatedAt).format("DD/MM/YYYY HH:mm:ss"),
      }));
  }

  const fetchUserData = async () => {
    try {
      const response = await api.get(`${apiUrl}/me`);
      const data = await response.data;
      setUser(data);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.log(error.message);
      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove("token");
    }
  };
  const fetchProjectData = async (user) => {
    try {
      const response = await api.get(`${apiUrl}/projects`);
      let data = await response.data;
      data = buildData(data, user.id);
      setDataProject(data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchUserData().then((res) => fetchProjectData(res));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (user) {
      const formData = new FormData(event.currentTarget);
      const formJson = Object.fromEntries(formData.entries());
      const data = dialogState.projectType === "example"
        ? {
            title: formJson.projectName,
            content: placeholder,
            userId: user ? user.id : null,
          }
        : {
            title: formJson.projectName,
            content: BlankPlaceholder(
              formJson.projectName,
              user.name,
              getMonthYear()
            ),
            userId: user ? user.id : null,
          };
      try {
        const res = await api.post(`${apiUrl}/projects`, data);
        const newProjectId = res.data.id;
        if (newProjectId) {
          setMessage("Create new project successfully!");
          setSeverity("success");
          handleClose();
          setTimeout(() => {
            navigate(`/project/${newProjectId}`);
          }, 1000);
        }
      } catch (error) {
        if (error.response && error.response.data) {
          console.log(error.response.data.message);
        } else {
          console.log("An error occurred. Please try again.");
        }
      }
    } else {
      setMessage("Please log in to create project");
      setSeverity("error");
    }
    setOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAppBar user={user} isAuthenticated={isAuthenticated} />
      <StyledContainer>
        <Grid container>
          <PageHeader
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            style={{ width: '100%' }}
          >
            <Typography
              variant="h5"
              sx={{
                flexGrow: 1,
                textAlign: 'center',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
              }}
            >
              All Projects
            </Typography>
            <Button
              id="basic-button"
              onClick={handleClick}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: 'linear-gradient(45deg, #1565C0 30%, #1E88E5 90%)',
                },
              }}
            >
              New Project
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <StyledMenuItem onClick={() => handleClickOpen("blank")}>
                Blank Project
              </StyledMenuItem>
              <StyledMenuItem onClick={() => handleClickOpen("example")}>
                Example Project
              </StyledMenuItem>
            </Menu>
          </PageHeader>
          
          {dataProject?.length > 0 && (
            <TableProjects dataProject={dataProject} />
          )}
        </Grid>
      </StyledContainer>

      <Dialog
        open={dialogState.open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit,
          sx: {
            borderRadius: 3,
            padding: 2,
          },
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600,
          fontSize: '1.5rem',
        }}>
          New Project
        </DialogTitle>
        <DialogContent style={{ minWidth: '500px' }}>
          <StyledTextField
            autoFocus
            required
            margin="dense"
            id="projectName"
            name="projectName"
            label="Project name"
            type="text"
            fullWidth
            variant="outlined"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8fafc',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClose}
            sx={{ color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565C0 30%, #1E88E5 90%)',
              },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

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
    </ThemeProvider>
  );
};

export default Homepage;
