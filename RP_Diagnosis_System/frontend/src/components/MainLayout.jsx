import { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ModelTrainingOutlinedIcon from "@mui/icons-material/ModelTrainingOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const drawerWidth = 290;

const roleNavigation = {
  patient: [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon /> },
    { label: "Upload Case", path: "/patient/upload", icon: <UploadFileOutlinedIcon /> },
    { label: "My Cases", path: "/patient/cases", icon: <AssignmentOutlinedIcon /> },
    { label: "Reports", path: "/patient/reports", icon: <DescriptionOutlinedIcon /> },
    { label: "Chatbot", path: "/chatbot", icon: <ForumOutlinedIcon /> },
  ],
  doctor: [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon /> },
    { label: "All Cases", path: "/doctor/cases", icon: <AssignmentOutlinedIcon /> },
    { label: "Reports", path: "/doctor/reports", icon: <DescriptionOutlinedIcon /> },
    { label: "Chatbot", path: "/chatbot", icon: <ForumOutlinedIcon /> },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardOutlinedIcon /> },
    { label: "Upload Case", path: "/patient/upload", icon: <UploadFileOutlinedIcon /> },
    { label: "My Cases", path: "/patient/cases", icon: <AssignmentOutlinedIcon /> },
    { label: "All Cases", path: "/doctor/cases", icon: <AssignmentOutlinedIcon /> },
    { label: "Reports", path: "/doctor/reports", icon: <DescriptionOutlinedIcon /> },
    { label: "Users", path: "/admin/users", icon: <PeopleOutlineIcon /> },
    { label: "Settings", path: "/admin/settings", icon: <SettingsOutlinedIcon /> },
    { label: "Model Registry", path: "/admin/model-registry", icon: <ModelTrainingOutlinedIcon /> },
    { label: "Chatbot", path: "/chatbot", icon: <ForumOutlinedIcon /> },
  ],
};

export default function MainLayout({ children, title = "Medical AI Workspace" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const items = useMemo(() => roleNavigation[user?.role] || [], [user?.role]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44 }}>
            <MonitorHeartOutlinedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" color="primary.main">
              OCUSENSE
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Retinal AI workspace
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={`${user?.role || "guest"} portal`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 2.5, flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, mb: 1.25 }}>
          Navigation
        </Typography>

        <List sx={{ display: "grid", gap: 0.75 }}>
          {items.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 3,
                px: 1.5,
                py: 1,
                "&.active, &.Mui-selected": {
                  bgcolor: "rgba(21, 94, 239, 0.10)",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2.5 }}>
        <Avatar>{user?.full_name?.[0] || "U"}</Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>
            {user?.full_name || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email || "Signed in"}
          </Typography>
        </Box>
        <IconButton onClick={handleLogout}>
          <LogoutOutlinedIcon />
        </IconButton>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed">
        <Toolbar sx={{ minHeight: 78 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { lg: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Secure retinal case review, explainability, and medical reporting
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
            onClick={() => navigate("/chatbot")}
          >
            Open assistant
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(16,24,40,0.06)",
              background: "linear-gradient(180deg, #FFFFFF 0%, #FCFDFF 100%)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 4 },
          mt: "78px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}