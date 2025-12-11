import React from "react";

const TreeImage = () => {
  // This endpoint will serve the image from the backend
  const treeUrl = "http://localhost:3001/images/treebase.png";
  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <img
        src={treeUrl}
        alt="Christmas Tree"
        style={{ maxWidth: 400, width: "100%" }}
      />
    </div>
  );
};

export default TreeImage;
