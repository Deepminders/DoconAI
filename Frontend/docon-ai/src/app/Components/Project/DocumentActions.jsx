"use client";

import React, { useEffect, useState } from "react";
import Button from "./Button";
import { Trash2 } from "lucide-react";

const DocumentActions = ({ onGroupClick, onDeleteClick, selectedCount }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    fetch(`http://127.0.0.1:8000/user/decode-token?token=${token}`)
      .then(res => res.json())
      .then(user => setUserRole(user?.user_role || null))
      .catch(() => setUserRole(null));
  }, []);

  return (
    <div className="mt-4 flex justify-end gap-4">
      <Button
        label={`Group Documents (${selectedCount})`}
        color="blue"
        onClick={onGroupClick}
        disabled={selectedCount === 0}
      />
      {userRole === "Project Owner" && (
        <Button
          label={`Delete Documents (${selectedCount})`}
          color="red"
          onClick={onDeleteClick}
          disabled={selectedCount === 0}
          icon={<Trash2 size={18} />}
        />
      )}
    </div>
  );
};

export default DocumentActions;