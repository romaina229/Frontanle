import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; 
import "./RegisterForm.css";

const RegisterForm: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const getStrengthClass = () => {
    if (password.length >= 10) return "strong";
    if (password.length >= 6) return "medium";
    return "weak";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("nom") as string;
    const email = formData.get("email") as string;
    const telephone = formData.get("telephone") as string;
    const pwd = formData.get("password") as string;

    if (pwd !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setSuccess(null);
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const response = await api.post("/register", {
        name,
        email,
        telephone,
        password: pwd,
        password_confirmation: confirmPassword,
      });

      const { token, user, permissions } = response.data.data;

      //  Sauvegarde du token
      localStorage.setItem("token", token);

      setSuccess("Inscription réussie !");
      //  Redirection vers le dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <h1>Rejoignez-nous</h1>
        <p>Créez votre compte pour gérer votre poissonnerie efficacement</p>
        <div style={{ marginTop: 40 }}>
          <h3><i className="fas fa-check-circle"></i> Gestion simplifiée</h3>
          <h3><i className="fas fa-check-circle"></i> Tableaux de bord personnalisés</h3>
          <h3><i className="fas fa-check-circle"></i> Support technique</h3>
          <h3><i className="fas fa-check-circle"></i> Mises à jour régulières</h3>
        </div>
      </div>

      <div className="register-right">
        <div className="register-box">
          <div className="register-logo">
            <i className="fas fa-fish"></i>
            <h2>Créer un compte</h2>
            <p>Commencez votre essai gratuit</p>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form className="register-form" id="registerForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input type="text" name="nom" className="form-control" placeholder="Votre nom" required />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" name="email" className="form-control" placeholder="votre@email.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input type="tel" name="telephone" className="form-control" placeholder="Votre numéro" />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe *</label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-control"
                placeholder="Au moins 6 caractères"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="password-strength">
                <div className={`password-strength-fill ${getStrengthClass()}`} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe *</label>
              <input
                type="password"
                name="confirm_password"
                className="form-control"
                placeholder="Répétez le mot de passe"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" required />
                <span>
                  J'accepte les <a href="#" style={{ color: "#1a73e8" }}>conditions d'utilisation</a>
                </span>
              </label>
            </div>

            <button type="submit" className="btn-register">
              <i className="fas fa-user-plus"></i> Créer mon compte
            </button>
          </form>

          <div className="login-link">
            <p>Déjà un compte ? <a href="/login">Se connecter</a></p>
          </div>

          <div style={{ textAlign: "center", marginTop: 30, color: "#5f6368" }}>
            <p>Version 2.0.2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
