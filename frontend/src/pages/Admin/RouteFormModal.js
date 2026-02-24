import { useEffect, useState } from "react";
import "./RouteFormModal.css";

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
  }, [initialData, show]);

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
      {/* Premium Blur Backdrop */}
      <div className="adm-modal-overlay" onClick={onClose}></div>
      
      <div className="adm-modal-wrapper">
        <div className="adm-modal-content animate-fadeIn">
          <div className="adm-modal-header">
            <div>
              <h5 className="adm-modal-title">
                {initialData ? "✏️ Edit Route" : "🛣️ Create New Route"}
              </h5>
              <p className="adm-modal-subtitle">Define paths and pickup points</p>
            </div>
            <button className="adm-close-x" onClick={onClose}>&times;</button>
          </div>

          <form onSubmit={submit}>
            <div className="adm-modal-body">
              <div className="adm-form-group mb-4">
                <label className="adm-label">Route Title</label>
                <input
                  className="adm-input"
                  placeholder="e.g., Campus Express - North"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  required
                />
              </div>

              <div className="adm-stops-header mb-2">
                <label className="adm-label mb-0">Route Stops</label>
                <button
                  type="button"
                  className="adm-btn-add-stop"
                  onClick={addStop}
                >
                  + Add Stop
                </button>
              </div>

              <div className="adm-stops-scroll">
                {stops.map((stop, i) => (
                  <div key={i} className="adm-stop-input-row">
                    <div className="adm-stop-number">{i + 1}</div>
                    <input
                      className="adm-input adm-input-stop"
                      placeholder={`Stop name`}
                      value={stop}
                      onChange={(e) => updateStop(i, e.target.value)}
                      required
                    />
                    {stops.length > 1 && (
                      <button 
                        type="button" 
                        className="adm-btn-remove" 
                        onClick={() => removeStop(i)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="adm-btn-save"
                disabled={loading}
              >
                {loading ? "Processing..." : "Save Route"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}