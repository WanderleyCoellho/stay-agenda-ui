import "./Loader.css";

function Loader() {
  return (
    <div className="loader-container">
      <div className="spinner-border text-primary" role="status" style={{width: "3rem", height: "3rem"}}>
        <span className="visually-hidden">Carregando...</span>
      </div>
      <p className="mt-2 text-muted fw-bold">Carregando dados...</p>
    </div>
  );
}

export default Loader;