import AppLayout from "@/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Detail from "@/pages/Detail";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/detail/:lat/:lon/:moment" element={<Detail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
