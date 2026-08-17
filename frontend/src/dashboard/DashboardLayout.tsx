// // frontend/src/dashboard/DashboardLayout.tsx
// import { useState } from "react";
// import DashboardSidebar from "./DashboardSidebar";
// import DashboardUsersPanel from "./DashboardUsersPanel";


// const DashboardInstructions = () => {
//   return (
//     <div className="rounded border border-zinc-300 bg-white p-4 text-left">
//       <h2 className="mb-2 text-xl font-bold">Brackets Dashboard</h2>
//       <p>Choose a panel from the sidebar.</p>
//     </div>
//   );
// };

// const DashboardLayout = () => {
//   const [activePanel, setActivePanel] = useState<string | null>("users");

//   return (
//     <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
//       <DashboardSidebar onSelect={setActivePanel} />

//       <main
//         style={{
//           flexGrow: 1,
//           padding: "16px",
//           marginLeft: 8,
//           maxWidth: "1000px",
//         }}
//       >
//         {activePanel === "users" && <DashboardUsersPanel />}

//         {!activePanel && <DashboardInstructions />}
//       </main>
//     </div>
//   );
// };

// export default DashboardLayout;