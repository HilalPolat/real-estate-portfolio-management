import React from 'react'

const counter = () => {
  return (
        <div className="about-stats card border-0 shadow-sm mt-4">
          <div className="card-body">
            <div className="row text-center g-3">
              
              <div className="col-md-4">
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <div className="stat-icon">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div className="text-start">
                    <div className="stat-number fw-bold">5.000+</div>
                    <div className="stat-label text-muted small">
                      Mutlu Müşteri
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 stat-divider">
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <div className="stat-icon">
                    <i className="bi bi-house-check-fill"></i>
                  </div>
                  <div className="text-start">
                    <div className="stat-number fw-bold">1.000+</div>
                    <div className="stat-label text-muted small">
                      Satış & Kiralama
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 stat-divider">
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <div className="stat-icon">
                    <i className="bi bi-person-badge-fill"></i>
                  </div>
                  <div className="text-start">
                    <div className="stat-number fw-bold">30+</div>
                    <div className="stat-label text-muted small">
                      Uzman Danışman
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
  )
}

export default counter