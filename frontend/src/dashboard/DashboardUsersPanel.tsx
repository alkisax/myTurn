// // frontend/src/dashboard/DashboardUsersPanel.tsx
// import { useCallback, useEffect, useState } from "react";
// import axios from "axios";
// import React from "react";

// import {
//   Box,
//   Button,
//   Chip,
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   IconButton,
//   MenuItem,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Tooltip,
//   Typography,
// } from "@mui/material";

// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
// import PersonIcon from "@mui/icons-material/Person";
// import CloseIcon from "@mui/icons-material/Close";

// import { backendUrl } from "../constants/constants";
// import type { BackendUserView, IUser, Roles } from "../authLogin/types/types";

// const normalizeUser = (user: BackendUserView): IUser => {
//   return {
//     id: user.id,
//     _id: user.id,
//     username: user.username,
//     name: user.name,
//     email: user.email,
//     roles: [user.role],
//     hasPassword: true,
//     provider: "backend",
//   };
// };

// const DashboardUsersPanel = () => {
//   const [users, setUsers] = useState<IUser[]>([]);
//   const [isLoadingUsers, setIsLoadingUsers] = useState(false);

//   const [createDialogOpen, setCreateDialogOpen] = useState(false);
//   const [newUsername, setNewUsername] = useState("");
//   const [newName, setNewName] = useState("");
//   const [newEmail, setNewEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [newRole, setNewRole] = useState<Roles>("MEMBER");
//   const [createError, setCreateError] = useState("");

//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [editingUser, setEditingUser] = useState<IUser | null>(null);
//   const [editUsername, setEditUsername] = useState("");
//   const [editName, setEditName] = useState("");
//   const [editEmail, setEditEmail] = useState("");
//   const [editPassword, setEditPassword] = useState("");
//   const [editRole, setEditRole] = useState<Roles>("MEMBER");
//   const [editIsActive, setEditIsActive] = useState(true);
//   const [editError, setEditError] = useState("");

//   const fetchAllUsers = useCallback(async () => {
//     try {
//       setIsLoadingUsers(true);

//       const token = localStorage.getItem("token");

//       const res = await axios.get(`${backendUrl}/api/users`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const normalized = res.data.data.map((user: BackendUserView) =>
//         normalizeUser(user),
//       );

//       setUsers(normalized);
//     } catch (err) {
//       console.error(err);
//       alert("Error fetching users");
//     } finally {
//       setIsLoadingUsers(false);
//     }
//   }, []);

//   useEffect(() => {
//     const init = async () => {
//       await fetchAllUsers();
//     };

//     void init();
//   }, [fetchAllUsers]);

//   const resetCreateForm = () => {
//     setNewUsername("");
//     setNewName("");
//     setNewEmail("");
//     setNewPassword("");
//     setNewRole("MEMBER");
//     setCreateError("");
//   };

//   const handleCreateDialogClose = () => {
//     setCreateDialogOpen(false);
//     resetCreateForm();
//   };

//   const handleCreateUser = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setCreateError("");

//     if (!newUsername.trim() || !newPassword.trim()) {
//       setCreateError("Username and password are required");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.post(
//         `${backendUrl}/api/users`,
//         {
//           username: newUsername.trim(),
//           name: newName.trim() || undefined,
//           email: newEmail.trim() || undefined,
//           password: newPassword,
//           role: newRole,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (res.data.status) {
//         const createdUser = normalizeUser(res.data.data);

//         setUsers((prev) => [createdUser, ...prev]);
//         handleCreateDialogClose();
//       }
//     } catch (err) {
//       console.error(err);

//       if (axios.isAxiosError(err)) {
//         const message =
//           err.response?.data?.message ||
//           err.response?.data?.details?.[0]?.message ||
//           "Failed to create user";

//         setCreateError(message);
//         return;
//       }

//       setCreateError("Failed to create user");
//     }
//   };

//   const handleOpenEditDialog = (user: IUser) => {
//     setEditingUser(user);
//     setEditUsername(user.username);
//     setEditName(user.name || "");
//     setEditEmail(user.email || "");
//     setEditPassword("");
//     setEditRole(user.roles.includes("ADMIN") ? "ADMIN" : "MEMBER");
//     setEditIsActive(true);
//     setEditError("");
//     setEditDialogOpen(true);
//   };

//   const handleEditDialogClose = () => {
//     setEditDialogOpen(false);
//     setEditingUser(null);
//     setEditUsername("");
//     setEditName("");
//     setEditEmail("");
//     setEditPassword("");
//     setEditRole("MEMBER");
//     setEditIsActive(true);
//     setEditError("");
//   };

//   const handleUpdateUser = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setEditError("");

//     if (!editingUser) return;

//     const userId = editingUser._id || editingUser.id;

//     if (!userId) {
//       setEditError("User ID not found");
//       return;
//     }

//     if (!editUsername.trim()) {
//       setEditError("Username is required");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       const payload: {
//         username?: string;
//         name?: string;
//         email?: string;
//         password?: string;
//         role?: Roles;
//         isActive?: boolean;
//       } = {
//         username: editUsername.trim(),
//         name: editName.trim() || undefined,
//         email: editEmail.trim() || undefined,
//         role: editRole,
//         isActive: editIsActive,
//       };

//       if (editPassword.trim()) {
//         payload.password = editPassword;
//       }

//       const res = await axios.put(`${backendUrl}/api/users/${userId}`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (res.data.status) {
//         const updatedUser = normalizeUser(res.data.data);

//         setUsers((prev) =>
//           prev.map((u) =>
//             (u._id || u.id) === (updatedUser._id || updatedUser.id)
//               ? updatedUser
//               : u,
//           ),
//         );

//         handleEditDialogClose();
//       }
//     } catch (err) {
//       console.error(err);

//       if (axios.isAxiosError(err)) {
//         const message =
//           err.response?.data?.message ||
//           err.response?.data?.details?.[0]?.message ||
//           "Failed to update user";

//         setEditError(message);
//         return;
//       }

//       setEditError("Failed to update user");
//     }
//   };

//   const handleSetRole = async (user: IUser, nextRole: Roles) => {
//     const userId = user._id || user.id;

//     if (!userId) {
//       alert("User ID not found");
//       return;
//     }

//     if (!confirm(`Change ${user.username} role to ${nextRole}?`)) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.put(
//         `${backendUrl}/api/users/${userId}/role`,
//         {
//           role: nextRole,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (res.data.status) {
//         const updatedUser = normalizeUser(res.data.data);

//         setUsers((prev) =>
//           prev.map((u) =>
//             (u._id || u.id) === (updatedUser._id || updatedUser.id)
//               ? updatedUser
//               : u,
//           ),
//         );
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update role");
//     }
//   };

//   const handleDeleteUser = async (user: IUser) => {
//     const userId = user._id || user.id;

//     if (!userId) {
//       alert("User ID not found");
//       return;
//     }

//     if (!confirm(`Delete user ${user.username}?`)) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.delete(`${backendUrl}/api/users/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (res.data.status) {
//         setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete user");
//     }
//   };

//   return (
//     <>
//       <Box
//         sx={{
//           mb: 3,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           gap: 2,
//         }}
//       >
//         <Typography variant="h4">Users</Typography>

//         <Tooltip title="Create user">
//           <IconButton
//             color="primary"
//             onClick={() => setCreateDialogOpen(true)}
//             sx={{
//               border: "1px solid #ddd",
//               backgroundColor: "#fff",
//             }}
//           >
//             <AddIcon />
//           </IconButton>
//         </Tooltip>
//       </Box>

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
//               <TableCell>Name</TableCell>
//               <TableCell>Email</TableCell>
//               <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
//                 Username
//               </TableCell>
//               <TableCell>Role</TableCell>
//               <TableCell align="right">Actions</TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {isLoadingUsers && (
//               <TableRow>
//                 <TableCell colSpan={5}>Loading users...</TableCell>
//               </TableRow>
//             )}

//             {!isLoadingUsers && users.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={5}>No users found</TableCell>
//               </TableRow>
//             )}

//             {users.map((user, idx) => {
//               const isAdmin = user.roles.includes("ADMIN");

//               return (
//                 <React.Fragment key={user._id || user.id}>
//                   <TableRow
//                     sx={{
//                       backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9",
//                     }}
//                   >
//                     <TableCell>{user.name || "—"}</TableCell>

//                     <TableCell>{user.email || "—"}</TableCell>

//                     <TableCell
//                       sx={{ display: { xs: "none", lg: "table-cell" } }}
//                     >
//                       {user.username}
//                     </TableCell>

//                     <TableCell>
//                       <Chip
//                         label={isAdmin ? "ADMIN" : "MEMBER"}
//                         color={isAdmin ? "warning" : "default"}
//                         size="small"
//                       />
//                     </TableCell>

//                     <TableCell align="right">
//                       <Box
//                         sx={{
//                           display: "flex",
//                           gap: 1,
//                           justifyContent: "flex-end",
//                         }}
//                       >
//                         <Tooltip title="Edit user">
//                           <IconButton
//                             color="primary"
//                             size="small"
//                             onClick={() => handleOpenEditDialog(user)}
//                           >
//                             <EditIcon />
//                           </IconButton>
//                         </Tooltip>

//                         {isAdmin ? (
//                           <Tooltip title="Remove admin">
//                             <IconButton
//                               color="warning"
//                               size="small"
//                               onClick={() => handleSetRole(user, "MEMBER")}
//                             >
//                               <PersonIcon />
//                             </IconButton>
//                           </Tooltip>
//                         ) : (
//                           <Tooltip title="Make admin">
//                             <IconButton
//                               color="success"
//                               size="small"
//                               onClick={() => handleSetRole(user, "ADMIN")}
//                             >
//                               <AdminPanelSettingsIcon />
//                             </IconButton>
//                           </Tooltip>
//                         )}

//                         <Tooltip title="Delete user">
//                           <IconButton
//                             color="error"
//                             size="small"
//                             onClick={() => handleDeleteUser(user)}
//                           >
//                             <DeleteIcon />
//                           </IconButton>
//                         </Tooltip>
//                       </Box>
//                     </TableCell>
//                   </TableRow>
//                 </React.Fragment>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Dialog
//         open={createDialogOpen}
//         onClose={handleCreateDialogClose}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle sx={{ m: 0, p: 2 }}>
//           Create User

//           <IconButton
//             aria-label="close"
//             onClick={handleCreateDialogClose}
//             sx={{
//               position: "absolute",
//               right: 8,
//               top: 8,
//               color: (theme) => theme.palette.grey[500],
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>

//         <DialogContent dividers>
//           <Box
//             component="form"
//             onSubmit={handleCreateUser}
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               gap: 2,
//               pt: 1,
//             }}
//           >
//             <TextField
//               label="Username"
//               value={newUsername}
//               onChange={(e) => setNewUsername(e.target.value)}
//               required
//               fullWidth
//             />

//             <TextField
//               label="Name"
//               value={newName}
//               onChange={(e) => setNewName(e.target.value)}
//               fullWidth
//             />

//             <TextField
//               label="Email"
//               type="email"
//               value={newEmail}
//               onChange={(e) => setNewEmail(e.target.value)}
//               fullWidth
//             />

//             <TextField
//               label="Password"
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               required
//               fullWidth
//               helperText="At least 6 chars, one uppercase, one special character"
//             />

//             <TextField
//               select
//               label="Role"
//               value={newRole}
//               onChange={(e) => setNewRole(e.target.value as Roles)}
//               fullWidth
//             >
//               <MenuItem value="MEMBER">MEMBER</MenuItem>
//               <MenuItem value="ADMIN">ADMIN</MenuItem>
//             </TextField>

//             {createError && (
//               <Typography color="error" variant="body2">
//                 {createError}
//               </Typography>
//             )}

//             <Button type="submit" variant="contained">
//               Create
//             </Button>
//           </Box>
//         </DialogContent>
//       </Dialog>

//       <Dialog
//         open={editDialogOpen}
//         onClose={handleEditDialogClose}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle sx={{ m: 0, p: 2 }}>
//           Edit User

//           <IconButton
//             aria-label="close"
//             onClick={handleEditDialogClose}
//             sx={{
//               position: "absolute",
//               right: 8,
//               top: 8,
//               color: (theme) => theme.palette.grey[500],
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>

//         <DialogContent dividers>
//           <Box
//             component="form"
//             onSubmit={handleUpdateUser}
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               gap: 2,
//               pt: 1,
//             }}
//           >
//             <TextField
//               label="Username"
//               value={editUsername}
//               onChange={(e) => setEditUsername(e.target.value)}
//               required
//               fullWidth
//             />

//             <TextField
//               label="Name"
//               value={editName}
//               onChange={(e) => setEditName(e.target.value)}
//               fullWidth
//             />

//             <TextField
//               label="Email"
//               type="email"
//               value={editEmail}
//               onChange={(e) => setEditEmail(e.target.value)}
//               fullWidth
//             />

//             <TextField
//               label="New password"
//               type="password"
//               value={editPassword}
//               onChange={(e) => setEditPassword(e.target.value)}
//               fullWidth
//               helperText="Leave empty to keep current password"
//             />

//             <TextField
//               select
//               label="Role"
//               value={editRole}
//               onChange={(e) => setEditRole(e.target.value as Roles)}
//               fullWidth
//             >
//               <MenuItem value="MEMBER">MEMBER</MenuItem>
//               <MenuItem value="ADMIN">ADMIN</MenuItem>
//             </TextField>

//             <TextField
//               select
//               label="Active"
//               value={String(editIsActive)}
//               onChange={(e) => setEditIsActive(e.target.value === "true")}
//               fullWidth
//             >
//               <MenuItem value="true">Active</MenuItem>
//               <MenuItem value="false">Inactive</MenuItem>
//             </TextField>

//             {editError && (
//               <Typography color="error" variant="body2">
//                 {editError}
//               </Typography>
//             )}

//             <Button type="submit" variant="contained">
//               Save changes
//             </Button>
//           </Box>
//         </DialogContent>
//       </Dialog>

//       <Paper
//         sx={{
//           p: 2,
//           mt: 4,
//           backgroundColor: "#f7f7f7",
//         }}
//         variant="outlined"
//       >
//         <Typography variant="h6" sx={{ mb: 1 }}>
//           Instructions – Users
//         </Typography>

//         <Typography variant="body2" sx={{ mb: 1 }}>
//           • Εδώ βλέπεις τους χρήστες της ομάδας.
//         </Typography>

//         <Typography variant="body2" sx={{ mb: 1 }}>
//           • Το <b>+</b> δημιουργεί νέο χρήστη.
//         </Typography>

//         <Typography variant="body2" sx={{ mb: 1 }}>
//           • Το <b>edit icon</b> ανοίγει φόρμα επεξεργασίας χρήστη και αλλαγής
//           password.
//         </Typography>

//         <Typography variant="body2" sx={{ mb: 1 }}>
//           • Το <b>admin icon</b> μετατρέπει έναν MEMBER σε ADMIN.
//         </Typography>

//         <Typography variant="body2" sx={{ mb: 1 }}>
//           • Το <b>person icon</b> γυρίζει έναν ADMIN σε MEMBER.
//         </Typography>

//         <Typography variant="body2" sx={{ mb: 1 }}>
//           • Το <b>trash icon</b> διαγράφει χρήστη.
//         </Typography>

//         <Typography variant="body2">
//           • Το backend δεν επιτρέπει να αφαιρεθεί ο τελευταίος ADMIN.
//         </Typography>
//       </Paper>
//     </>
//   );
// };

// export default DashboardUsersPanel;