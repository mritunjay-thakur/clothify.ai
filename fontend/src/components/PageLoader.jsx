import React from "react";

const PageLoader = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        zIndex: 9999,
      }}
    >
      <iframe
        src="https://lottie.host/embed/04317379-87e7-4bce-a466-27cb30b96d83/Foz84ZBJfw.lottie"
        style={{ width: "300px", height: "300px", border: "none" }}
        title="Loading animation"
      />
    </div>
  );
};

export default PageLoader;