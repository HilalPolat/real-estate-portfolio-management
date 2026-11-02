import React from "react";
import "../assets/css/about.css";
import Counter from "../components/counter";
import About1 from "../assets/img/about1.jpg";
import About2 from "../assets/img/about2.png";
import About3 from "../assets/img/about3.png";

const About = () => {
  return (
    <>
      <section className="about pb-5">
        <div className="container">

          <div className="about-breadcrumb small mb-5">
            Ana Sayfa <span className="mx-2">›</span> Hakkımızda
          </div>

          <div className="row align-items-center mb-5">
            <div className="col-lg-6">
              <div className="about-accent-badge">Güvenilir Gayrimenkul</div>

              <h1 className="about-title fw-bold mb-3">
                Prestij Gayrimenkul <br />
                olarak hizmetinizdeyiz
              </h1>

              <p className="about-subtitle mb-4">
                Bizi yakından tanıyın.
              </p>

              <p className="about-text mb-4">
                Yıllardır sektörde edindiğimiz bilgi birikimi ve deneyimle
                Türkiye genelinde güvenilir ve kaliteli gayrimenkul hizmeti
                sunuyoruz. Amacımız, müşteri memnuniyetini her zaman ön planda
                tutarak sizi hayalinizdeki eve veya yatırıma güvenle
                kavuşturmaktır.
              </p>

              <div className="about-values-strip">
                <span className="about-value-tag">
                  <i className="bi bi-shield-check"></i> Güvenilirlik
                </span>
                <span className="about-value-tag">
                  <i className="bi bi-eye"></i> Şeffaflık
                </span>
                <span className="about-value-tag">
                  <i className="bi bi-star"></i> Profesyonellik
                </span>
              </div>
            </div>

            <div className="col-lg-6 mt-4 mt-lg-0">
              <div className="about-image-wrap">
                <img
                  src={About1}
                  alt="Prestij Gayrimenkul Hakkımızda"
                  className="about-image"
                />
              </div>
            </div>
          </div>

          <Counter />

          <div className="row align-items-center mt-5">
            <div className="col-lg-6 mt-4">
              <div className="about-image-wrap">
                <img
                  src={About2}
                  alt="Prestij Gayrimenkul Hakkımızda"
                  className="about-image"
                />
              </div>
            </div>
            <div className="col-lg-6">
           

              <h1 className="about-title fw-bold mt-2 ms-lg-3">Biz Kimiz?</h1>

              <p className="about-text ms-lg-3">
                Prestij Gayrimenkul olarak yalnızca bir emlak firması değil,
                müşterilerimizin hayatındaki önemli kararlarında güvenilir bir
                çözüm ortağıyız. Gayrimenkul alım, satım ve kiralama
                süreçlerinde şeffaflık, dürüstlük ve profesyonellik temel
                prensiplerimizdir.
              </p>
              <p className="about-text mb-0 ms-lg-3">
                Her müşterimizin ihtiyacının farklı olduğunun bilinciyle hareket
                eder, beklentilerinizi doğru analiz ederek size en uygun
                çözümleri sunarız. Amacımız yalnızca bir işlem gerçekleştirmek
                değil, uzun vadeli güven ilişkileri kurmaktır.
              </p>
            </div>
          </div>

        </div>
      </section>

      <section className="mission-section py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <div className="about-accent-badge">Fark Yaratan Hizmet</div>
              <h2 className="mission-title fw-bold mb-3 mt-1">Misyonumuz</h2>

              <p className="mission-text mb-4">
                Müşteri memnuniyetini ön planda tutarak, en güncel ve doğru
                ilanlara güvenilir ve hızlı bir şekilde ulaşmanızı sağlamak
                temel amacımızdır. Sizleri hayalinizdeki eve veya doğru yatırıma
                güvenle kavuşturmak için buradayız.
              </p>

              <div className="vision-card p-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="vision-icon">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-2" style={{ color: "var(--dark)" }}>
                      Vizyonumuz
                    </h5>
                    <p className="small mb-0" style={{ color: "var(--mid)", lineHeight: 1.75 }}>
                      Türkiye'nin en güvenilir ve yenilikçi gayrimenkul
                      markalarından biri olarak sektörde fark yaratmak ve
                      müşteri odaklı hizmet anlayışımızla sürdürülebilir başarı
                      elde etmek.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mission-image-wrapper">
                <img
                  src={About3}
                  alt="Prestij Gayrimenkul Misyon"
                  className="mission-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
