
import "../assets/css/login.css";
import loginImg from "../assets/img/login2.svg";
import LoginForm from "../components/loginForm";

const Login = () => {
  return (
    <section className="login-section">
      <div className="container">
        <div className="row align-items-center">

          <div className="col-lg-6 my-5">
            <img src={loginImg} alt="login-img" />
          </div>

          <div className="login-form text-center col-lg-6 p-5">

            <h2 className=" login-badge login-title fw-bold mb-2">
              Gayrimenkul Takip Sistemi
            </h2>
            <p style={{textTransform:"upperCase"}} className="text-muted mb-4">Hoş Geldiniz</p>

            <LoginForm />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Login;

