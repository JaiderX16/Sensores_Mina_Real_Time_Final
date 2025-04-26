// components/AdminControls.jsx
import React from "react";

const AdminControls = ({ user, onOpenModal }) => {
  if (!user || user.rol !== "admin") return null;

  return (
    <button
      className="block px-4 py-2 text-sm text-white font-bold hover:border-b-2 hover:border-[#1d9cff] rounded-lg"
      onClick={onOpenModal}
    >
      Crear Usuario
    </button>
  );
};

export default AdminControls;
