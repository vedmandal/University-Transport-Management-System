import { useEffect, useState } from "react";
import "./RouteFormModal.css"

export default function RouteFormModal({
  show,
  onClose,
  onSubmit,
  initialData,
  loading,
}) {
  const [routeName, setRouteName] = useState("");
  const [stops, setStops] = useState([""]);

  useEffect(() => {
    if (initialData) {
      setRouteName(initialData.routeName);
      setStops(initialData.stops.map((s) => s.name));
    } else {
      setRouteName("");
      setStops([""]);
    }
  }, [initialData, show]); // Added 'show' to dependency to reset when opened

  const addStop = () => setStops([...stops, ""]);

  const removeStop = (index) => {
    if (stops.length > 1) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  const updateStop = (i, value) => {
    const copy = [...stops];
    copy[i] = value;
    setStops(copy);
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      routeName,
      stops: stops.map((name) => ({ name })),
    });
  };

  if (!show) return null;

  return (
    <>
      {/* Custom Backdrop for high contrast */}
      <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(15, 15, 26, 0.8)', backdropFilter: 'blur(4px)' }}></div>
      
      <div className="modal show d-block animate-fadeIn" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div className="modal-header bg-light border-0 py-3 px-4">
              <h5 className="modal-title fw-bold text-dark">
                {initialData ? "✏️ Edit Route" : "🛣️ Create New Route"}
              </h5>
              <button className="btn-close" onClick={onClose} aria-label="Close" />
            </div>

            <form onSubmit={submit}>
              <div className="modal-body p-4">
                <div className="mb-4">
                  <label className="custom-label mb-2">Route Title</label>
                  <input
                    className="form-control custom-input-light"
                    placeholder="e.g., Campus Express - North"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-2 d-flex justify-content-between align-items-center">
                  <label className="custom-label">Route Stops</label>
                  <button
                    type="button"
                    className="btn btn-link text-primary text-decoration-none fw-bold p-0 small"
                    onClick={addStop}
                  >
                    + Add Stop
                  </button>
                </div>

                <div className="stops-container pe-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {stops.map((stop, i) => (
                    <div key={i} className="input-group mb-2">
                      <span className="input-group-text border-0 bg-light text-muted small px-2">
                        {i + 1}
                      </span>
                      <input
                        className="form-control custom-input-light"
                        placeholder={`Name of stop ${i + 1}`}
                        value={stop}
                        onChange={(e) => updateStop(i, e.target.value)}
                        required
                      />
                      {stops.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-outline-danger border-0" 
                          onClick={() => removeStop(i)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer border-0 p-4 pt-0">
                <button
                  type="button"
                  className="btn btn-light px-4 fw-semibold"
                  onClick={onClose}
                  style={{ borderRadius: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-action px-5 fw-bold"
                  disabled={loading}
                  style={{ borderRadius: '10px' }}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                  ) : "Save Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}