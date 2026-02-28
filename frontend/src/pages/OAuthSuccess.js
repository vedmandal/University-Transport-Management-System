import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function OAuthSuccess() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (token && role) {
      login(token, role);

      if (role === "admin") navigate("/admin/track");
      else if (role === "driver") navigate("/driver");
      else if (role === "parent") navigate("/parent-dashboard");
      else navigate("/student");
    }
  }, []);

  return <div>Signing you in...</div>;
}