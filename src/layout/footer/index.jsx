
import React from "react";
import "../../assets/css/footer.css";

const Index = () => {
  return (
    <footer className="footer-section py-5">
      <div className="container">
        <div className="footer-top-line mb-5"></div>

        <div className="row align-items-center gy-4">
          <div className="col-lg-4 col-md-12">
            <div className="footer-brand-card h-100">
              <div className="footer-brand mb-3">
                <div className="nav-logo footer-logo">
                  Prestij<span>Gayrimenkul</span>
                
                </div>
              </div>

              <p className="footer-text mb-0">
                Ankara’daki seçkin gayrimenkul portföylerini güvenilir hizmet
                anlayışıyla bir araya getiriyoruz. Hayalinizdeki yaşam alanına
                profesyonel danışmanlıkla ulaşın.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 footer-divider">
            <div className="footer-center-card text-center h-100">
              <p className="footer-mini-title mb-2">BİZİMLE İLETİŞİME GEÇİN</p>
              <h3 className="footer-heading mb-3">Size Yardımcı Olalım</h3>
              <p className="footer-subtext mb-4">
                Portföylerimiz veya hizmetlerimiz hakkında detaylı bilgi almak
                için bizimle hemen iletişime geçin.
              </p>

              <a
                href="tel:05555555555"
                className="footer-call-btn text-decoration-none"
              >
                <i className="bi bi-telephone-fill"></i>
                <span>0555 555 55 55</span>
              </a>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 footer-divider">
            <div className="footer-info-card h-100">
              <p className="footer-mini-title mb-2">İLETİŞİM BİLGİLERİ</p>
              <h5 className="footer-heading mb-4">Bize Ulaşın</h5>

              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <div className="footer-icon-box">
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                  <div>
                    <span className="footer-contact-label">Telefon</span>
                    <a
                      href="tel:05555555555"
                      className="footer-link text-decoration-none d-block"
                    >
                      0555 555 55 55
                    </a>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <div className="footer-icon-box">
                    <i className="bi bi-envelope-fill"></i>
                  </div>
                  <div>
                    <span className="footer-contact-label">E-posta</span>
                    <a
                      href="mailto:info@prestijgayrimenkul.com"
                      className="footer-link text-decoration-none d-block"
                    >
                      info@prestijgayrimenkul.com
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Index;