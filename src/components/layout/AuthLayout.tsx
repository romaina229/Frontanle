import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1, background: "white", padding: 40 }}>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;