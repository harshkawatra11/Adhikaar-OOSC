import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#7c2415",
          border: "3px solid #241a10",
          color: "#eee2c3",
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        अ
      </div>
    ),
    { ...size }
  );
}
